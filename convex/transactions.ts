import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";

// List transactions with pagination and filters
export const listTransactions = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    search: v.optional(v.string()),
    accountId: v.optional(v.id("accounts")),
    outflowTypeId: v.optional(v.id("outflowTypes")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    sortBy: v.optional(v.union(v.literal("date"), v.literal("amount"))),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const { limit = 50, search, accountId, outflowTypeId, startDate, endDate, sortBy = "date", sortOrder = "desc" } = args;

    let query = ctx.db.query("transactions").withIndex("by_user", (q) => q.eq("userId", user._id as Id<"users">));

    if (accountId) {
      query = query.filter((q) => q.eq(q.field("accountId"), accountId));
    }
    if (outflowTypeId) {
      query = query.filter((q) => q.eq(q.field("outflowTypeId"), outflowTypeId));
    }
    if (startDate) {
      query = query.filter((q) => q.gte(q.field("date"), startDate));
    }
    if (endDate) {
      query = query.filter((q) => q.lte(q.field("date"), endDate));
    }
    if (search) {
      query = query.filter((q) => q.eq(q.field("note"), search)); // Simple search, can be improved
    }

    const transactions = await query
      .order(sortBy === "date" ? "desc" : sortOrder)
      .take(limit);

    // Fetch related account and outflow type data
    const transactionsWithDetails = await Promise.all(
      transactions.map(async (transaction) => {
        const account = await ctx.db.get(transaction.accountId);
        const outflowType = await ctx.db.get(transaction.outflowTypeId);

        return {
          ...transaction,
          account: account ? {
            _id: account._id,
            name: account.name,
            type: account.type,
          } : null,
          outflowType: outflowType ? {
            _id: outflowType._id,
            name: outflowType.name,
            emoji: outflowType.emoji,
          } : null,
        };
      })
    );

    return transactionsWithDetails;
  },
});

// Get monthly summary
export const getMonthlySummary = query({
  args: { month: v.optional(v.string()) }, // YYYY-MM
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const { month } = args;
    const now = new Date();
    const currentMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [year, mon] = currentMonth.split('-').map(Number);
    const start = new Date(year, mon - 1, 1).getTime();
    const end = new Date(year, mon, 1).getTime();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id as Id<"users">).gte("date", start).lt("date", end))
      .collect();

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Top 5 outflow types
    const typeCounts: Record<string, number> = {};
    transactions.forEach(t => {
      typeCounts[t.outflowTypeId] = (typeCounts[t.outflowTypeId] || 0) + t.amount;
    });
    const topTypes = Object.entries(typeCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([id, amount]) => ({ outflowTypeId: id, amount }));

    return { totalSpent, topTypes };
  },
});

// Create transaction mutation
export const addTransaction = mutation({
  args: {
    amount: v.number(),
    date: v.number(),
    accountId: v.id("accounts"),
    outflowTypeId: v.id("outflowTypes"),
    note: v.string(),
    receiptImageId: v.optional(v.id("_storage")),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    // Validate account belongs to user
    const account = await ctx.db.get(args.accountId);
    if (!account || account.userId !== user._id) {
      throw new ConvexError("Invalid account");
    }

    // Validate outflow type belongs to user
    const outflowType = await ctx.db.get(args.outflowTypeId);
    if (!outflowType || outflowType.userId !== user._id) {
      throw new ConvexError("Invalid outflow type");
    }

    // Additional validation based on outflowType
    // For now, basic validation

    return await ctx.db.insert("transactions", { ...args, userId: user._id });
  },
});

// Update transaction
export const updateTransaction = mutation({
  args: {
    id: v.id("transactions"),
    amount: v.optional(v.number()),
    date: v.optional(v.number()),
    accountId: v.optional(v.id("accounts")),
    outflowTypeId: v.optional(v.id("outflowTypes")),
    note: v.optional(v.string()),
    receiptImageId: v.optional(v.id("_storage")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const { id, ...updates } = args;
    const transaction = await ctx.db.get(id);
    if (!transaction || transaction.userId !== user._id) {
      throw new ConvexError("Transaction not found or access denied");
    }

    await ctx.db.patch(id, updates);
  },
});

// Delete transaction
export const deleteTransaction = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.userId !== user._id) {
      throw new ConvexError("Transaction not found or access denied");
    }

    await ctx.db.delete(args.id);
  },
});