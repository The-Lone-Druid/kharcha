import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const customUsersTable = defineTable({
  // Auth fields (required by @convex-dev/auth)
  name: v.optional(v.string()),
  email: v.string(),
  emailVerificationTime: v.optional(v.number()),
  image: v.optional(v.string()),
  isAnonymous: v.optional(v.boolean()),

  // Custom fields
  uid: v.string(),
  preferences: v.object({
    currency: v.string(), // e.g., "INR"
    language: v.string(), // e.g., "en"
    darkMode: v.boolean(),
    onboardingCompleted: v.boolean(),
  }),
})
  .index("by_uid", ["uid"])
  .index("by_email", ["email"]);

export default defineSchema({
  ...authTables,
  users: customUsersTable,

  outflowTypes: defineTable({
    name: v.string(),
    emoji: v.string(),
    colorHex: v.string(),
    isCustom: v.boolean(),
    extraFields: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        type: v.union(v.literal("text"), v.literal("number"), v.literal("date"), v.literal("toggle")),
      })
    ),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_name", ["userId", "name"]),

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
    initialBalance: v.number(),
    userId: v.id("users"),
    isArchived: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_name", ["userId", "name"]),

  transactions: defineTable({
    amount: v.number(),
    date: v.number(), // timestamp
    accountId: v.id("accounts"),
    outflowTypeId: v.id("outflowTypes"),
    note: v.string(),
    receiptImageId: v.optional(v.id("_storage")),
    metadata: v.any(), // JSON object based on outflowType
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_account", ["accountId"])
    .index("by_outflow_type", ["outflowTypeId"])
    .index("by_user_date", ["userId", "date"]),

  budgets: defineTable({
    outflowTypeId: v.id("outflowTypes"),
    amount: v.number(),
    month: v.string(), // YYYY-MM
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_outflow_type_month", ["outflowTypeId", "month"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("renewal"), v.literal("due")),
    transactionId: v.id("transactions"),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),
});