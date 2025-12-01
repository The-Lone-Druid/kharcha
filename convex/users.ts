import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or update user on auth
export const createOrUpdateUser = mutation({
  args: {
    uid: v.string(),
    email: v.string(),
    preferences: v.optional(
      v.object({
        currency: v.string(),
        language: v.string(),
        darkMode: v.boolean(),
        onboardingCompleted: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_uid", (q) => q.eq("uid", args.uid))
      .first();

    const defaultPreferences = {
      currency: "INR",
      language: "en",
      darkMode: false,
      onboardingCompleted: false,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        preferences: { ...defaultPreferences, ...args.preferences },
      });
      return existing._id;
    } else {
      return await ctx.db.insert("users", {
        uid: args.uid,
        email: args.email,
        preferences: { ...defaultPreferences, ...args.preferences },
      });
    }
  },
});

// Get user
export const getUser = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_uid", (q) => q.eq("uid", args.uid))
      .first();
  },
});

// Get all users (for scheduled functions)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    userId: v.id("users"),
    preferences: v.object({
      currency: v.string(),
      language: v.string(),
      darkMode: v.boolean(),
      onboardingCompleted: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { preferences: args.preferences });
  },
});

// Delete all user data
export const deleteAllUserData = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Delete transactions
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const t of transactions) {
      await ctx.db.delete(t._id);
    }

    // Delete accounts
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const a of accounts) {
      await ctx.db.delete(a._id);
    }

    // Delete outflow types (custom only)
    const outflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isCustom"), true))
      .collect();
    for (const ot of outflowTypes) {
      await ctx.db.delete(ot._id);
    }

    // Delete budgets
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const b of budgets) {
      await ctx.db.delete(b._id);
    }

    // Delete notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const n of notifications) {
      await ctx.db.delete(n._id);
    }

    // Finally delete user
    await ctx.db.delete(args.userId);
  },
});
