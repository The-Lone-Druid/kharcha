import { mutation, internalMutation } from "./_generated/server";

// Manual reminder trigger (can be called by admin)
export const sendReminders = mutation({
  args: {},
  handler: async (ctx) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate()
    ).getTime();
    const tomorrowEnd = tomorrowStart + 24 * 60 * 60 * 1000;

    // Get all user preferences to get clerkIds
    const userPreferences = await ctx.db.query("userPreferences").collect();
    const clerkIds = [...new Set(userPreferences.map((up) => up.clerkId))];

    for (const clerkId of clerkIds) {
      // Get user notification preferences
      const userPref = userPreferences.find((pref) => pref.clerkId === clerkId);
      const notifPrefs = userPref?.notificationPreferences;

      // Check if global notifications are enabled
      if (!notifPrefs || notifPrefs.globalNotifications === false) {
        continue; // Skip this user if notifications are disabled
      }

      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_clerk_id_date", (q) => q.eq("clerkId", clerkId))
        .filter(
          (q) =>
            q.gte(q.field("date"), tomorrowStart) &&
            q.lt(q.field("date"), tomorrowEnd)
        )
        .collect();

      for (const t of transactions) {
        const outflowType = await ctx.db.get(t.outflowTypeId);

        // Check subscription reminder preference
        if (outflowType?.name === "Subscription" && t.metadata?.remind) {
          if (notifPrefs.subscriptionReminders !== false) {
            await ctx.db.insert("notifications", {
              clerkId,
              type: "renewal",
              transactionId: t._id,
              message: `Reminder: ${t.metadata.provider} subscription renewal tomorrow for ₹${t.amount}`,
              isRead: false,
              createdAt: Date.now(),
            });
          }
        }
        // Check due date reminder preference
        else if (outflowType?.name === "Money Lent") {
          if (notifPrefs.dueDateReminders !== false) {
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
    }
  },
});

// Scheduled function (Convex will call this daily via cron)
export const scheduledReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate()
    ).getTime();
    const tomorrowEnd = tomorrowStart + 24 * 60 * 60 * 1000;

    // Get all user preferences to get clerkIds
    const userPreferences = await ctx.db.query("userPreferences").collect();
    const clerkIds = [...new Set(userPreferences.map((up) => up.clerkId))];

    for (const clerkId of clerkIds) {
      // Get user notification preferences
      const userPref = userPreferences.find((pref) => pref.clerkId === clerkId);
      const notifPrefs = userPref?.notificationPreferences;

      // Check if global notifications are enabled (default to true if not set)
      if (notifPrefs && notifPrefs.globalNotifications === false) {
        continue; // Skip this user if notifications are disabled
      }

      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_clerk_id_date", (q) => q.eq("clerkId", clerkId))
        .filter(
          (q) =>
            q.gte(q.field("date"), tomorrowStart) &&
            q.lt(q.field("date"), tomorrowEnd)
        )
        .collect();

      for (const t of transactions) {
        const outflowType = await ctx.db.get(t.outflowTypeId);

        // Check subscription reminder preference (default to true if not set)
        if (outflowType?.name === "Subscription" && t.metadata?.remind) {
          if (!notifPrefs || notifPrefs.subscriptionReminders !== false) {
            await ctx.db.insert("notifications", {
              clerkId,
              type: "renewal",
              transactionId: t._id,
              message: `Reminder: ${t.metadata.provider} subscription renewal tomorrow for ₹${t.amount}`,
              isRead: false,
              createdAt: Date.now(),
            });
          }
        }
        // Check due date reminder preference (default to true if not set)
        else if (outflowType?.name === "Money Lent") {
          if (!notifPrefs || notifPrefs.dueDateReminders !== false) {
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
    }
  },
});
