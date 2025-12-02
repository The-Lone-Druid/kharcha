import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// List budgets
export const listBudgets = query({
  args: { month: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new ConvexError("User not found");

    let query = ctx.db
      .query("budgets")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    if (args.month) {
      query = query.filter((q) => q.eq(q.field("month"), args.month));
    }

    return await query.collect();
  },
});

// Create budget
export const createBudget = mutation({
  args: {
    outflowTypeId: v.id("outflowTypes"),
    amount: v.number(),
    month: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new ConvexError("User not found");

    // Check if budget already exists
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_outflow_type_month", (q) =>
        q.eq("outflowTypeId", args.outflowTypeId).eq("month", args.month)
      )
      .first();
    if (existing) {
      throw new ConvexError(
        "Budget already exists for this outflow type and month"
      );
    }

    return await ctx.db.insert("budgets", { ...args, userId: user._id });
  },
});

// Update budget
export const updateBudget = mutation({
  args: {
    id: v.id("budgets"),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new ConvexError("User not found");

    const { id, ...updates } = args;

    const budget = await ctx.db.get(id);
    if (!budget || budget.userId !== user._id) {
      throw new ConvexError("Budget not found or access denied");
    }

    await ctx.db.patch(id, updates);
  },
});

// Delete budget
export const deleteBudget = mutation({
  args: { id: v.id("budgets") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new ConvexError("User not found");

    const budget = await ctx.db.get(args.id);
    if (!budget || budget.userId !== user._id) {
      throw new ConvexError("Budget not found or access denied");
    }

    await ctx.db.delete(args.id);
  },
});

// Get budget progress
export const getBudgetProgress = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new ConvexError("User not found");

    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("month"), args.month))
      .collect();

    const [year, mon] = args.month.split("-").map(Number);
    const start = new Date(year, mon - 1, 1).getTime();
    const end = new Date(year, mon, 1).getTime();

    const progress = await Promise.all(
      budgets.map(async (budget) => {
        const transactions = await ctx.db
          .query("transactions")
          .withIndex("by_outflow_type", (q) =>
            q.eq("outflowTypeId", budget.outflowTypeId)
          )
          .filter(
            (q) => q.gte(q.field("date"), start) && q.lt(q.field("date"), end)
          )
          .collect();

        const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
        return {
          budgetId: budget._id,
          outflowTypeId: budget.outflowTypeId,
          budgeted: budget.amount,
          spent,
          progress: spent / budget.amount,
        };
      })
    );

    return progress;
  },
});
