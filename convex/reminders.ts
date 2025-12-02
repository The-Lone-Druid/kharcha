import { mutation } from "./_generated/server";

// Manual reminder trigger (can be called by admin)
export const sendReminders = mutation({
  args: {},
  handler: async (ctx) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()).getTime();
    const tomorrowEnd = tomorrowStart + 24 * 60 * 60 * 1000;

    // Get all user preferences to get clerkIds
    const userPreferences = await ctx.db.query("userPreferences").collect();
    const clerkIds = [...new Set(userPreferences.map(up => up.clerkId))];

    for (const clerkId of clerkIds) {
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_clerk_id_date", (q) => q.eq("clerkId", clerkId))
        .filter((q) => q.gte(q.field("date"), tomorrowStart) && q.lt(q.field("date"), tomorrowEnd))
        .collect();

      for (const t of transactions) {
        const outflowType = await ctx.db.get(t.outflowTypeId);
        if (outflowType?.name === "Subscription" && t.metadata?.remind) {
          await ctx.db.insert("notifications", {
            clerkId,
            type: "renewal",
            transactionId: t._id,
            message: `Reminder: ${t.metadata.provider} subscription renewal tomorrow for ₹${t.amount}`,
            isRead: false,
            createdAt: Date.now(),
          });
        } else if (outflowType?.name === "Money Lent") {
          await ctx.db.insert("notifications", {
            clerkId,
            type: "due",
            transactionId: t._id,
            message: `Reminder: ₹${t.amount} due from ${t.metadata.borrowerName} tomorrow`,
            isRead: false,
            createdAt: Date.now(),
          });
        }
      }
    }
  },
});

// Scheduled function (Convex will call this daily)
export const scheduledReminders = mutation({
  args: {},
  handler: async (ctx) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()).getTime();
    const tomorrowEnd = tomorrowStart + 24 * 60 * 60 * 1000;

    // Get all user preferences to get clerkIds
    const userPreferences = await ctx.db.query("userPreferences").collect();
    const clerkIds = [...new Set(userPreferences.map(up => up.clerkId))];

    for (const clerkId of clerkIds) {
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_clerk_id_date", (q) => q.eq("clerkId", clerkId))
        .filter((q) => q.gte(q.field("date"), tomorrowStart) && q.lt(q.field("date"), tomorrowEnd))
        .collect();

      for (const t of transactions) {
        const outflowType = await ctx.db.get(t.outflowTypeId);
        if (outflowType?.name === "Subscription" && t.metadata?.remind) {
          await ctx.db.insert("notifications", {
            clerkId,
            type: "renewal",
            transactionId: t._id,
            message: `Reminder: ${t.metadata.provider} subscription renewal tomorrow for ₹${t.amount}`,
            isRead: false,
            createdAt: Date.now(),
          });
        } else if (outflowType?.name === "Money Lent") {
          await ctx.db.insert("notifications", {
            clerkId,
            type: "due",
            transactionId: t._id,
            message: `Reminder: ₹${t.amount} due from ${t.metadata.borrowerName} tomorrow`,
            isRead: false,
            createdAt: Date.now(),
          });
        }
      }
    }
  },
});