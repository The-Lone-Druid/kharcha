import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// List accounts
export const listAccounts = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new ConvexError("User not found");

    return await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.neq(q.field("isArchived"), true))
      .collect();
  },
});

// Get account with current balance
export const getAccountWithBalance = query({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new ConvexError("User not found");

    const account = await ctx.db.get(args.id);
    if (!account) throw new ConvexError("Account not found");
    if (account.userId !== user._id) throw new ConvexError("Forbidden");

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_account", (q) => q.eq("accountId", args.id))
      .collect();

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

    return { ...account, totalSpent };
  },
});

// Create account
export const createAccount = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("Cash"),
      v.literal("Bank"),
      v.literal("Credit Card"),
      v.literal("UPI"),
      v.literal("Loan"),
      v.literal("Wallet"),
      v.literal("Other")
    ),
    colorHex: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new ConvexError("User not found");

    return await ctx.db.insert("accounts", {
      ...args,
      userId: user._id,
      isArchived: false,
    });
  },
});

// Update account
export const updateAccount = mutation({
  args: {
    id: v.id("accounts"),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("Cash"),
        v.literal("Bank"),
        v.literal("Credit Card"),
        v.literal("UPI"),
        v.literal("Loan"),
        v.literal("Wallet"),
        v.literal("Other")
      )
    ),
    colorHex: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
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
    const account = await ctx.db.get(id);
    if (!account || account.userId !== user._id) {
      throw new ConvexError("Account not found or access denied");
    }

    await ctx.db.patch(id, updates);
  },
});

// Delete account (soft delete by archiving)
export const archiveAccount = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new ConvexError("User not found");

    const account = await ctx.db.get(args.id);
    if (!account || account.userId !== user._id) {
      throw new ConvexError("Account not found or access denied");
    }

    await ctx.db.patch(args.id, { isArchived: true });
  },
});
