import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// List outflow types
export const listOutflowTypes = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new ConvexError("User not found");

    return await ctx.db
      .query("outflowTypes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Get outflow type
export const getOutflowType = query({
  args: { id: v.id("outflowTypes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create custom outflow type
export const createCustomOutflowType = mutation({
  args: {
    name: v.string(),
    emoji: v.string(),
    colorHex: v.string(),
    extraFields: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("number"),
          v.literal("date"),
          v.literal("toggle")
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const userId = user._id;

    // Check if name already exists
    const existing = await ctx.db
      .query("outflowTypes")
      .withIndex("by_name", (q) => q.eq("userId", userId).eq("name", args.name))
      .first();
    if (existing) {
      throw new ConvexError("Outflow type with this name already exists");
    }

    return await ctx.db.insert("outflowTypes", {
      ...args,
      userId,
      isCustom: true,
    });
  },
});

// Update outflow type (only custom ones)
export const updateOutflowType = mutation({
  args: {
    id: v.id("outflowTypes"),
    name: v.optional(v.string()),
    emoji: v.optional(v.string()),
    colorHex: v.optional(v.string()),
    extraFields: v.optional(
      v.array(
        v.object({
          key: v.string(),
          label: v.string(),
          type: v.union(
            v.literal("text"),
            v.literal("number"),
            v.literal("date"),
            v.literal("toggle")
          ),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const userId = user._id;
    const { id, ...updates } = args;

    const outflowType = await ctx.db.get(id);
    if (
      !outflowType ||
      outflowType.userId !== userId ||
      !outflowType.isCustom
    ) {
      throw new ConvexError("Outflow type not found or cannot be edited");
    }

    await ctx.db.patch(id, updates);
  },
});

// Delete custom outflow type
export const deleteOutflowType = mutation({
  args: { id: v.id("outflowTypes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const userId = user._id;

    const outflowType = await ctx.db.get(args.id);
    if (
      !outflowType ||
      outflowType.userId !== userId ||
      !outflowType.isCustom
    ) {
      throw new ConvexError("Outflow type not found or cannot be deleted");
    }

    // Check if used in transactions
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_outflow_type", (q) => q.eq("outflowTypeId", args.id))
      .first();
    if (transactions) {
      throw new ConvexError("Cannot delete outflow type that has transactions");
    }

    await ctx.db.delete(args.id);
  },
});
