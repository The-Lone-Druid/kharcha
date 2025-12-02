import { query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Monthly spend for last 12 months
export const getMonthlySpend = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        start: date.getTime(),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime(),
      });
    }

    const spend = await Promise.all(
      months.map(async ({ month, start, end }) => {
        const transactions = await ctx.db
          .query("transactions")
          .withIndex("by_user_date", (q) =>
            q
              .eq("userId", user._id as Id<"users">)
              .gte("date", start)
              .lt("date", end)
          )
          .collect();
        return {
          month,
          total: transactions.reduce((sum, t) => sum + t.amount, 0),
        };
      })
    );

    return spend;
  },
});

// Outflow type breakdown
export const getOutflowTypeBreakdown = query({
  args: { startDate: v.optional(v.number()), endDate: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const start = args.startDate || 0;
    const end = args.endDate || Date.now();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) =>
        q
          .eq("userId", user._id as Id<"users">)
          .gte("date", start)
          .lt("date", end)
      )
      .collect();

    const breakdown: Record<string, number> = {};
    for (const t of transactions) {
      const typeId = t.outflowTypeId;
      if (!breakdown[typeId]) {
        breakdown[typeId] = 0;
      }
      breakdown[typeId] += t.amount;
    }

    return Object.entries(breakdown).map(([typeId, total]) => ({
      outflowTypeId: typeId,
      total,
    }));
  },
});

// Subscriptions list
export const getSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const outflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_user", (q) => q.eq("userId", user._id as Id<"users">))
      .filter((q) => q.eq(q.field("name"), "Subscription"))
      .collect();

    if (outflowTypes.length === 0) return [];

    const typeId = outflowTypes[0]._id;
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_outflow_type", (q) => q.eq("outflowTypeId", typeId))
      .collect();

    return transactions.map((t) => ({
      id: t._id,
      provider: t.metadata?.provider,
      amount: t.amount,
      renewalDate: t.metadata?.renewalDate,
      remind: t.metadata?.remind,
    }));
  },
});

// Loans/EMI list
export const getLoans = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const outflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_user", (q) => q.eq("userId", user._id as Id<"users">))
      .filter((q) => q.eq(q.field("name"), "EMI/Loan"))
      .collect();

    if (outflowTypes.length === 0) return [];

    const typeId = outflowTypes[0]._id;
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_outflow_type", (q) => q.eq("outflowTypeId", typeId))
      .collect();

    return transactions.map((t) => ({
      id: t._id,
      loanName: t.metadata?.loanName,
      amount: t.amount,
      emiAmount: t.metadata?.emiAmount,
      interestRate: t.metadata?.interestRate,
      // Simple payoff calculation
      monthsToPayoff: t.metadata?.emiAmount
        ? Math.ceil(t.amount / t.metadata.emiAmount)
        : null,
    }));
  },
});

// Money lent ageing
export const getMoneyLentAgeing = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const outflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_user", (q) => q.eq("userId", user._id as Id<"users">))
      .filter((q) => q.eq(q.field("name"), "Money Lent"))
      .collect();

    if (outflowTypes.length === 0)
      return { overdue0_30: [], overdue31_60: [], overdue60_plus: [] };

    const typeId = outflowTypes[0]._id;
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_outflow_type", (q) => q.eq("outflowTypeId", typeId))
      .collect();

    const now = Date.now();
    const overdue0_30 = [];
    const overdue31_60 = [];
    const overdue60_plus = [];

    for (const t of transactions) {
      const dueDate = t.metadata?.dueDate;
      if (!dueDate) continue;
      const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
      const item = {
        id: t._id,
        borrowerName: t.metadata.borrowerName,
        amount: t.amount,
        dueDate,
        daysOverdue,
      };

      if (daysOverdue <= 0) continue; // Not overdue
      if (daysOverdue <= 30) overdue0_30.push(item);
      else if (daysOverdue <= 60) overdue31_60.push(item);
      else overdue60_plus.push(item);
    }

    return { overdue0_30, overdue31_60, overdue60_plus };
  },
});

// Projected recurring outflows
export const getProjectedRecurring = query({
  args: { months: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const monthsAhead = args.months || 3;
    const projections = [];

    // Subscriptions
    const outflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_user", (q) => q.eq("userId", user._id as Id<"users">))
      .filter((q) => q.eq(q.field("name"), "Subscription"))
      .collect();

    const subscriptions =
      outflowTypes.length > 0
        ? await ctx.db
            .query("transactions")
            .withIndex("by_outflow_type", (q) =>
              q.eq("outflowTypeId", outflowTypes[0]._id)
            )
            .collect()
        : [];
    for (let i = 1; i <= monthsAhead; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() + i);
      const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

      const monthlyTotal = subscriptions.reduce(
        (sum: number, sub: Doc<"transactions">) => {
          // Assuming monthly renewal, can be improved
          return sum + sub.amount;
        },
        0
      );

      projections.push({
        month: monthStr,
        subscriptions: monthlyTotal,
        loans: 0,
        total: monthlyTotal,
      });
    }

    // Loans/EMI
    const loanOutflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_user", (q) => q.eq("userId", user._id as Id<"users">))
      .filter((q) => q.eq(q.field("name"), "EMI/Loan"))
      .collect();

    const loans =
      loanOutflowTypes.length > 0
        ? await ctx.db
            .query("transactions")
            .withIndex("by_outflow_type", (q) =>
              q.eq("outflowTypeId", loanOutflowTypes[0]._id)
            )
            .collect()
        : [];
    for (let i = 0; i < projections.length; i++) {
      const monthlyEMI = loans.reduce(
        (sum: number, loan: Doc<"transactions">) =>
          sum + (loan.metadata?.emiAmount || 0),
        0
      );
      projections[i].loans = monthlyEMI;
      projections[i].total += monthlyEMI;
    }

    return projections;
  },
});

// Upcoming renewals/dues (next 7 days)
export const getUpcomingEvents = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const now = Date.now();
    const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id as Id<"users">))
      .collect();

    const upcoming = [];
    for (const t of transactions) {
      const renewalDate = t.metadata?.renewalDate || t.metadata?.dueDate;
      if (renewalDate && renewalDate >= now && renewalDate <= weekFromNow) {
        upcoming.push({
          id: t._id,
          type: t.metadata?.renewalDate ? "renewal" : "due",
          date: renewalDate,
          amount: t.amount,
          description:
            t.metadata?.provider || t.metadata?.borrowerName || t.note,
        });
      }
    }

    return upcoming.sort((a, b) => a.date - b.date);
  },
});

// Current tracking streak
export const getTrackingStreak = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new ConvexError("User not found");

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id as Id<"users">))
      .order("desc")
      .take(100); // Last 100 transactions

    const dates = [
      ...new Set(transactions.map((t) => new Date(t.date).toDateString())),
    ];
    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toDateString();
    const currentDate = new Date(today);

    for (const date of dates) {
      if (date === currentDate.toDateString()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  },
});
