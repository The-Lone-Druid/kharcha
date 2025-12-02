import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// List notifications
export const listNotifications = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;

    return await ctx.db
      .query("notifications")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .order("desc")
      .take(50);
  },
});

// Create notification
export const createNotification = mutation({
  args: {
    type: v.union(v.literal("renewal"), v.literal("due")),
    transactionId: v.id("transactions"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const clerkId = identity.subject;

    return await ctx.db.insert("notifications", {
      ...args,
      clerkId,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

// Mark as read
export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const clerkId = identity.subject;

    const notification = await ctx.db.get(args.id);
    if (!notification || notification.clerkId !== clerkId) {
      throw new ConvexError("Notification not found");
    }

    await ctx.db.patch(args.id, { isRead: true });
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const clerkId = identity.subject;

    const notification = await ctx.db.get(args.id);
    if (!notification || notification.clerkId !== clerkId) {
      throw new ConvexError("Notification not found");
    }

    await ctx.db.delete(args.id);
  },
});
