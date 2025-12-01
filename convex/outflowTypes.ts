import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";

// Built-in outflow types
const BUILT_IN_TYPES = [
  { name: "Expense", emoji: "💸", colorHex: "#ef4444", extraFields: [] },
  { name: "Subscription", emoji: "🔄", colorHex: "#3b82f6", extraFields: [
    { key: "provider", label: "Provider", type: "text" as const },
    { key: "renewalDate", label: "Renewal Date", type: "date" as const },
    { key: "remind", label: "Remind me", type: "toggle" as const }
  ]},
  { name: "EMI/Loan", emoji: "🏦", colorHex: "#10b981", extraFields: [
    { key: "loanName", label: "Loan Name", type: "text" as const },
    { key: "emiAmount", label: "EMI Amount", type: "number" as const },
    { key: "interestRate", label: "Interest Rate (%)", type: "number" as const }
  ]},
  { name: "Credit Card Payment", emoji: "💳", colorHex: "#f59e0b", extraFields: [
    { key: "statementDate", label: "Statement Date", type: "date" as const },
    { key: "minDue", label: "Minimum Due", type: "number" as const }
  ]},
  { name: "Money Lent", emoji: "🤝", colorHex: "#8b5cf6", extraFields: [
    { key: "borrowerName", label: "Borrower Name", type: "text" as const },
    { key: "dueDate", label: "Due Date", type: "date" as const },
    { key: "interestRate", label: "Interest Rate (%)", type: "number" as const }
  ]},
  { name: "Bill Payment", emoji: "📄", colorHex: "#06b6d4", extraFields: [] },
  { name: "Investment/SIP", emoji: "📈", colorHex: "#84cc16", extraFields: [] },
  { name: "Transfer", emoji: "↔️", colorHex: "#f97316", extraFields: [] },
];

// Initialize built-in types for user
export const initializeBuiltInTypes = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    for (const type of BUILT_IN_TYPES) {
      await ctx.db.insert("outflowTypes", {
        ...type,
        isCustom: false,
        userId: args.userId,
      });
    }
  },
});

// List outflow types
export const listOutflowTypes = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const user = await ctx.db.get(identity.subject as Id<"users">);
    if (!user) throw new ConvexError("User not found");

    return await ctx.db
      .query("outflowTypes")
      .withIndex("by_user", (q) => q.eq("userId", user._id as Id<"users">))
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
        type: v.union(v.literal("text"), v.literal("number"), v.literal("date"), v.literal("toggle")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const userId = identity.subject as Id<"users">;

    // Check if name already exists
    const existing = await ctx.db
      .query("outflowTypes")
      .withIndex("by_name", (q) => q.eq("userId", userId).eq("name", args.name))
      .first();
    if (existing) {
      throw new ConvexError("Outflow type with this name already exists");
    }

    return await ctx.db.insert("outflowTypes", { ...args, userId, isCustom: true });
  },
});

// Update outflow type (only custom ones)
export const updateOutflowType = mutation({
  args: {
    id: v.id("outflowTypes"),
    name: v.optional(v.string()),
    emoji: v.optional(v.string()),
    colorHex: v.optional(v.string()),
    extraFields: v.optional(v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        type: v.union(v.literal("text"), v.literal("number"), v.literal("date"), v.literal("toggle")),
      })
    )),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const userId = identity.subject as Id<"users">;
    const { id, ...updates } = args;

    const outflowType = await ctx.db.get(id);
    if (!outflowType || outflowType.userId !== userId || !outflowType.isCustom) {
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

    const userId = identity.subject as Id<"users">;

    const outflowType = await ctx.db.get(args.id);
    if (!outflowType || outflowType.userId !== userId || !outflowType.isCustom) {
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