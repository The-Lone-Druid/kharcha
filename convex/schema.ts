import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Separate table for user preferences
  userPreferences: defineTable({
    clerkId: v.string(),
    currency: v.string(), // e.g., "INR"
    language: v.string(), // e.g., "en"
    darkMode: v.boolean(),
    onboardingCompleted: v.boolean(),
    // Notification preferences
    notificationPreferences: v.optional(
      v.object({
        globalNotifications: v.boolean(), // Master toggle for all notifications
        subscriptionReminders: v.boolean(), // Notifications for subscription renewals
        dueDateReminders: v.boolean(), // Notifications for money lent due dates
        emailNotifications: v.boolean(), // Enable email notifications (future feature)
      })
    ),
  }).index("by_clerk_id", ["clerkId"]),

  outflowTypes: defineTable({
    name: v.string(),
    emoji: v.string(),
    colorHex: v.string(),
    isCustom: v.boolean(),
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
    clerkId: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_name", ["clerkId", "name"]),

  accounts: defineTable({
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
    budget: v.optional(v.number()), // Monthly budget limit for the account
    clerkId: v.string(),
    isArchived: v.boolean(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_name", ["clerkId", "name"]),

  transactions: defineTable({
    amount: v.number(),
    date: v.number(), // timestamp
    accountId: v.id("accounts"),
    outflowTypeId: v.id("outflowTypes"),
    note: v.string(),
    receiptImageId: v.optional(v.id("_storage")),
    metadata: v.any(), // JSON object based on outflowType
    clerkId: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_account", ["accountId"])
    .index("by_outflow_type", ["outflowTypeId"])
    .index("by_clerk_id_date", ["clerkId", "date"]),

  budgets: defineTable({
    outflowTypeId: v.id("outflowTypes"),
    amount: v.number(),
    month: v.string(), // YYYY-MM
    clerkId: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_outflow_type_month", ["outflowTypeId", "month"]),

  notifications: defineTable({
    clerkId: v.string(),
    type: v.union(v.literal("renewal"), v.literal("due")),
    transactionId: v.id("transactions"),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_clerk_id_unread", ["clerkId", "isRead"]),
});
