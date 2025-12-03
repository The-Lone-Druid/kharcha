import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get default outflow types configuration
const getDefaultOutflowTypes = () => [
  { name: "Expense", emoji: "💸", colorHex: "#ef4444", extraFields: [] },
  {
    name: "Subscription",
    emoji: "🔄",
    colorHex: "#3b82f6",
    extraFields: [
      { key: "provider", label: "Provider", type: "text" as const },
      { key: "renewalDate", label: "Renewal Date", type: "date" as const },
      { key: "remind", label: "Remind me", type: "toggle" as const },
    ],
  },
  {
    name: "EMI/Loan",
    emoji: "🏦",
    colorHex: "#10b981",
    extraFields: [
      { key: "loanName", label: "Loan Name", type: "text" as const },
      { key: "emiAmount", label: "EMI Amount", type: "number" as const },
      {
        key: "interestRate",
        label: "Interest Rate (%)",
        type: "number" as const,
      },
    ],
  },
  {
    name: "Credit Card Payment",
    emoji: "💳",
    colorHex: "#f59e0b",
    extraFields: [
      { key: "statementDate", label: "Statement Date", type: "date" as const },
      { key: "minDue", label: "Minimum Due", type: "number" as const },
    ],
  },
  {
    name: "Money Lent",
    emoji: "🤝",
    colorHex: "#8b5cf6",
    extraFields: [
      { key: "borrowerName", label: "Borrower Name", type: "text" as const },
      { key: "dueDate", label: "Due Date", type: "date" as const },
      {
        key: "interestRate",
        label: "Interest Rate (%)",
        type: "number" as const,
      },
    ],
  },
  { name: "Bill Payment", emoji: "📄", colorHex: "#06b6d4", extraFields: [] },
  { name: "Investment/SIP", emoji: "📈", colorHex: "#84cc16", extraFields: [] },
  { name: "Transfer", emoji: "↔️", colorHex: "#f97316", extraFields: [] },
  // Additional common categories
  { name: "Food & Dining", emoji: "🍽️", colorHex: "#ec4899", extraFields: [] },
  { name: "Transportation", emoji: "🚗", colorHex: "#64748b", extraFields: [] },
  { name: "Shopping", emoji: "🛍️", colorHex: "#f97316", extraFields: [] },
  { name: "Entertainment", emoji: "🎬", colorHex: "#8b5cf6", extraFields: [] },
  {
    name: "Health & Fitness",
    emoji: "🏥",
    colorHex: "#10b981",
    extraFields: [],
  },
  { name: "Education", emoji: "📚", colorHex: "#3b82f6", extraFields: [] },
  { name: "Travel", emoji: "✈️", colorHex: "#06b6d4", extraFields: [] },
  { name: "Insurance", emoji: "🛡️", colorHex: "#64748b", extraFields: [] },
  { name: "Taxes", emoji: "📋", colorHex: "#ef4444", extraFields: [] },
  { name: "Salary", emoji: "💼", colorHex: "#22c55e", extraFields: [] },
  { name: "Freelance", emoji: "💻", colorHex: "#3b82f6", extraFields: [] },
  { name: "Gift", emoji: "🎁", colorHex: "#ec4899", extraFields: [] },
  { name: "Donation", emoji: "❤️", colorHex: "#ef4444", extraFields: [] },
  { name: "Miscellaneous", emoji: "📦", colorHex: "#6b7280", extraFields: [] },
];

// Get current user preferences (authenticated)
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get user preferences
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    return {
      clerkId: identity.subject,
      preferences: preferences || {
        currency: "INR",
        language: "en",
        darkMode: false,
        onboardingCompleted: false,
      },
    };
  },
});

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    preferences: v.object({
      currency: v.optional(v.string()),
      language: v.optional(v.string()),
      darkMode: v.optional(v.boolean()),
      onboardingCompleted: v.optional(v.boolean()),
      notificationPreferences: v.optional(
        v.object({
          globalNotifications: v.boolean(),
          subscriptionReminders: v.boolean(),
          dueDateReminders: v.boolean(),
          emailNotifications: v.boolean(),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;

    // Check if preferences already exist
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existing) {
      // Merge preferences, preserving existing values if not provided
      const updates: Record<string, unknown> = {};
      if (args.preferences.currency !== undefined)
        updates.currency = args.preferences.currency;
      if (args.preferences.language !== undefined)
        updates.language = args.preferences.language;
      if (args.preferences.darkMode !== undefined)
        updates.darkMode = args.preferences.darkMode;
      if (args.preferences.onboardingCompleted !== undefined)
        updates.onboardingCompleted = args.preferences.onboardingCompleted;
      if (args.preferences.notificationPreferences !== undefined) {
        updates.notificationPreferences =
          args.preferences.notificationPreferences;
      }

      await ctx.db.patch(existing._id, updates);
    } else {
      // Create new preferences with defaults
      await ctx.db.insert("userPreferences", {
        clerkId,
        currency: args.preferences.currency || "INR",
        language: args.preferences.language || "en",
        darkMode: args.preferences.darkMode ?? false,
        onboardingCompleted: args.preferences.onboardingCompleted ?? false,
        notificationPreferences: args.preferences.notificationPreferences || {
          globalNotifications: true,
          subscriptionReminders: true,
          dueDateReminders: true,
          emailNotifications: false,
        },
      });
    }
  },
});

// Update only notification preferences
export const updateNotificationPreferences = mutation({
  args: {
    globalNotifications: v.optional(v.boolean()),
    subscriptionReminders: v.optional(v.boolean()),
    dueDateReminders: v.optional(v.boolean()),
    emailNotifications: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!existing) {
      // Create with defaults
      await ctx.db.insert("userPreferences", {
        clerkId,
        currency: "INR",
        language: "en",
        darkMode: false,
        onboardingCompleted: false,
        notificationPreferences: {
          globalNotifications: args.globalNotifications ?? true,
          subscriptionReminders: args.subscriptionReminders ?? true,
          dueDateReminders: args.dueDateReminders ?? true,
          emailNotifications: args.emailNotifications ?? false,
        },
      });
    } else {
      // Merge with existing preferences
      const currentPrefs = existing.notificationPreferences || {
        globalNotifications: true,
        subscriptionReminders: true,
        dueDateReminders: true,
        emailNotifications: false,
      };

      await ctx.db.patch(existing._id, {
        notificationPreferences: {
          globalNotifications:
            args.globalNotifications ?? currentPrefs.globalNotifications,
          subscriptionReminders:
            args.subscriptionReminders ?? currentPrefs.subscriptionReminders,
          dueDateReminders:
            args.dueDateReminders ?? currentPrefs.dueDateReminders,
          emailNotifications:
            args.emailNotifications ?? currentPrefs.emailNotifications,
        },
      });
    }
  },
});

// Initialize user data (create default outflow types)
export const createUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;

    // Check if user already has outflow types
    const existingTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existingTypes) return; // Already initialized

    // Initialize built-in outflow types for the new user
    const BUILT_IN_TYPES = getDefaultOutflowTypes();

    for (const type of BUILT_IN_TYPES) {
      await ctx.db.insert("outflowTypes", {
        ...type,
        isCustom: false,
        clerkId,
      });
    }

    // Initialize default user preferences
    await ctx.db.insert("userPreferences", {
      clerkId,
      currency: "INR",
      language: "en",
      darkMode: false,
      onboardingCompleted: false,
      notificationPreferences: {
        globalNotifications: true,
        subscriptionReminders: true,
        dueDateReminders: true,
        emailNotifications: false,
      },
    });
  },
});

// Get all users (for scheduled functions)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    // Get all unique clerkIds from userPreferences
    const preferences = await ctx.db.query("userPreferences").collect();
    return preferences.map((p) => ({ clerkId: p.clerkId }));
  },
});

// Delete all user data
export const deleteAllUserData = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;

    // Delete user preferences first
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (preferences) {
      await ctx.db.delete(preferences._id);
    }

    // Delete transactions
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .collect();
    for (const t of transactions) {
      await ctx.db.delete(t._id);
    }

    // Delete accounts
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .collect();
    for (const a of accounts) {
      await ctx.db.delete(a._id);
    }

    // Delete outflow types (custom only)
    const outflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .filter((q) => q.eq(q.field("isCustom"), true))
      .collect();
    for (const ot of outflowTypes) {
      await ctx.db.delete(ot._id);
    }

    // Delete budgets
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .collect();
    for (const b of budgets) {
      await ctx.db.delete(b._id);
    }

    // Delete notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .collect();
    for (const n of notifications) {
      await ctx.db.delete(n._id);
    }
  },
});

// Seed default outflow types for current user
export const seedOutflowTypes = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;

    const defaultTypes = getDefaultOutflowTypes();

    // Check which default types are already created
    const existingTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .filter((q) => q.neq(q.field("isCustom"), true))
      .collect();

    const existingNames = new Set(existingTypes.map((t) => t.name));

    // Create missing default types
    for (const type of defaultTypes) {
      if (!existingNames.has(type.name)) {
        await ctx.db.insert("outflowTypes", {
          ...type,
          isCustom: false,
          clerkId,
        });
      }
    }

    return { message: "Default outflow types seeded successfully" };
  },
});
