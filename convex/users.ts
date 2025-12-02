import { type Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

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

// Get current user (authenticated)
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    // Get user preferences
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return {
      ...user,
      preferences: preferences || {
        currency: "INR",
        language: "en",
        darkMode: false,
        onboardingCompleted: false,
      },
    };
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get user preferences
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return {
      ...user,
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
      currency: v.string(),
      language: v.string(),
      darkMode: v.boolean(),
      onboardingCompleted: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const userId = user._id;

    // Check if preferences already exist
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args.preferences);
    } else {
      await ctx.db.insert("userPreferences", {
        userId,
        ...args.preferences,
      });
    }
  },
});

// Create user if not exists
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) return existing;

    const newUser = await ctx.db.insert("users", args);

    // Initialize built-in outflow types for the new user
    const BUILT_IN_TYPES = getDefaultOutflowTypes();

    for (const type of BUILT_IN_TYPES) {
      await ctx.db.insert("outflowTypes", {
        ...type,
        isCustom: false,
        userId: newUser,
      });
    }

    return newUser;
  },
});

// Get all users (for scheduled functions)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
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

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const userId = user._id;

    // Delete user preferences first
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (preferences) {
      await ctx.db.delete(preferences._id);
    }

    // Delete transactions
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const t of transactions) {
      await ctx.db.delete(t._id);
    }

    // Delete accounts
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const a of accounts) {
      await ctx.db.delete(a._id);
    }

    // Delete outflow types (custom only)
    const outflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isCustom"), true))
      .collect();
    for (const ot of outflowTypes) {
      await ctx.db.delete(ot._id);
    }

    // Delete budgets
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const b of budgets) {
      await ctx.db.delete(b._id);
    }

    // Delete notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const n of notifications) {
      await ctx.db.delete(n._id);
    }

    // Finally delete user (this will be handled by auth system)
    // await ctx.db.delete(userId);
  },
});

// Seed default outflow types for existing user
export const seedOutflowTypes = mutation({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let userId: Id<"users">;

    if (args.userId) {
      // If userId is provided, use it (for admin/development purposes)
      userId = args.userId;
    } else {
      // Otherwise, try to get current authenticated user
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError(
          "Unauthenticated - provide userId parameter for seeding"
        );
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first();

      if (!user) {
        throw new ConvexError("User not found");
      }

      userId = user._id;
    }

    const defaultTypes = getDefaultOutflowTypes();

    // Check which default types are already created
    const existingTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("isCustom"), true))
      .collect();

    const existingNames = new Set(existingTypes.map((t) => t.name));

    // Create missing default types
    for (const type of defaultTypes) {
      if (!existingNames.has(type.name)) {
        await ctx.db.insert("outflowTypes", {
          ...type,
          isCustom: false,
          userId: userId,
        });
      }
    }

    return { message: "Default outflow types seeded successfully" };
  },
});

// Admin function to seed outflow types for all users (development only)
export const seedOutflowTypesForAllUsers = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.db.query("users").collect();

    const defaultTypes = getDefaultOutflowTypes();
    let totalSeeded = 0;

    for (const user of users) {
      // Check which default types are already created for this user
      const existingTypes = await ctx.db
        .query("outflowTypes")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.neq(q.field("isCustom"), true))
        .collect();

      const existingNames = new Set(existingTypes.map((t) => t.name));

      // Create missing default types
      for (const type of defaultTypes) {
        if (!existingNames.has(type.name)) {
          await ctx.db.insert("outflowTypes", {
            ...type,
            isCustom: false,
            userId: user._id,
          });
          totalSeeded++;
        }
      }
    }

    return {
      message: `Seeded ${totalSeeded} outflow types for ${users.length} users`,
    };
  },
});
