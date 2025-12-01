import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// List notifications
export const listNotifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

// Create notification
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("renewal"), v.literal("due")),
    transactionId: v.id("transactions"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", { ...args, isRead: false, createdAt: Date.now() });
  },
});

// Mark as read
export const markAsRead = mutation({
  args: { id: v.id("notifications"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== args.userId) {
      throw new ConvexError("Notification not found");
    }

    await ctx.db.patch(args.id, { isRead: true });
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: { id: v.id("notifications"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== args.userId) {
      throw new ConvexError("Notification not found");
    }

    await ctx.db.delete(args.id);
  },
});