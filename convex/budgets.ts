import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";

// List budgets
export const listBudgets = query({
  args: { month: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const userId = identity.subject as Id<"users">;

    let query = ctx.db
      .query("budgets")
      .withIndex("by_user", (q) => q.eq("userId", userId));

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

    const userId = identity.subject as Id<"users">;

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

    return await ctx.db.insert("budgets", { ...args, userId });
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

    const userId = identity.subject as Id<"users">;
    const { id, ...updates } = args;

    const budget = await ctx.db.get(id);
    if (!budget || budget.userId !== userId) {
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

    const userId = identity.subject as Id<"users">;

    const budget = await ctx.db.get(args.id);
    if (!budget || budget.userId !== userId) {
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

    const userId = identity.subject as Id<"users">;

    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
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
