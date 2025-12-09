import { v } from "convex/values";
import { type Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";

// Monthly spend for last 12 months
export const getMonthlySpend = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;

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
          .withIndex("by_clerk_id_date", (q) =>
            q.eq("clerkId", clerkId).gte("date", start).lt("date", end)
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
    if (!identity) return null;

    const clerkId = identity.subject;

    const start = args.startDate || 0;
    const end = args.endDate || Date.now();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_clerk_id_date", (q) =>
        q.eq("clerkId", clerkId).gte("date", start).lte("date", end)
      )
      .collect();

    const outflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .collect();

    const typeMap = new Map(outflowTypes.map((t) => [t._id.toString(), t]));

    const breakdown: Record<string, number> = {};
    for (const t of transactions) {
      const typeId = t.outflowTypeId;
      if (!breakdown[typeId]) {
        breakdown[typeId] = 0;
      }
      breakdown[typeId] += t.amount;
    }

    return Object.entries(breakdown).map(([typeId, total]) => {
      const type = typeMap.get(typeId);
      return {
        outflowTypeId: typeId,
        name: type?.name || "Unknown",
        emoji: type?.emoji || "",
        total,
      };
    });
  },
});

// Subscriptions list
export const getSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;

    const outflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
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
      frequency: t.metadata?.frequency,
    }));
  },
});

// Loans/EMI list
export const getLoans = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;

    const outflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
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
    if (!identity) return null;

    const clerkId = identity.subject;

    const outflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
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
    if (!identity) return null;

    const clerkId = identity.subject;

    const monthsAhead = args.months || 3;
    const projections = [];

    // Subscriptions
    const outflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
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
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
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
    if (!identity) return null;

    const clerkId = identity.subject;

    const now = Date.now();
    const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
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
    if (!identity) return null;

    const clerkId = identity.subject;

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
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

// Enhanced subscription breakdown with date filtering
export const getSubscriptionBreakdown = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;

    const outflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .filter((q) => q.eq(q.field("name"), "Subscription"))
      .collect();

    if (outflowTypes.length === 0) return { breakdown: [], total: 0 };

    const typeId = outflowTypes[0]._id;
    let query = ctx.db
      .query("transactions")
      .withIndex("by_outflow_type", (q) => q.eq("outflowTypeId", typeId));

    // Apply date filters if provided
    if (args.startDate || args.endDate) {
      const transactions = await query.collect();
      const filtered = transactions.filter((t) => {
        if (args.startDate && t.date < args.startDate) return false;
        if (args.endDate && t.date > args.endDate) return false;
        return true;
      });

      const breakdown = filtered.reduce(
        (acc, t) => {
          const provider = t.metadata?.provider || "Unknown";
          if (!acc[provider]) {
            acc[provider] = { provider, amount: 0, count: 0 };
          }
          acc[provider].amount += t.amount;
          acc[provider].count += 1;
          return acc;
        },
        {} as Record<
          string,
          { provider: string; amount: number; count: number }
        >
      );

      const total = filtered.reduce((sum, t) => sum + t.amount, 0);
      return { breakdown: Object.values(breakdown), total };
    }

    const transactions = await query.collect();
    const breakdown = transactions.reduce(
      (acc, t) => {
        const provider = t.metadata?.provider || "Unknown";
        if (!acc[provider]) {
          acc[provider] = { provider, amount: 0, count: 0 };
        }
        acc[provider].amount += t.amount;
        acc[provider].count += 1;
        return acc;
      },
      {} as Record<string, { provider: string; amount: number; count: number }>
    );

    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    return { breakdown: Object.values(breakdown), total };
  },
});

// Projected subscription spend
export const getProjectedSubscriptionSpend = query({
  args: {
    monthsAhead: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;
    const monthsAhead = args.monthsAhead || 12;

    const outflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .filter((q) => q.eq(q.field("name"), "Subscription"))
      .collect();

    if (outflowTypes.length === 0) return [];

    const typeId = outflowTypes[0]._id;
    const subscriptions = await ctx.db
      .query("transactions")
      .withIndex("by_outflow_type", (q) => q.eq("outflowTypeId", typeId))
      .collect();

    const projections = [];
    const now = new Date();

    for (let i = 0; i < monthsAhead; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      let monthlyTotal = 0;
      for (const sub of subscriptions) {
        const frequency = sub.metadata?.frequency || "monthly";

        if (frequency === "monthly") {
          monthlyTotal += sub.amount;
        } else if (frequency === "yearly") {
          // Only count in the renewal month
          const renewalDate = new Date(sub.metadata?.renewalDate);
          if (renewalDate.getMonth() === date.getMonth()) {
            monthlyTotal += sub.amount;
          }
        } else if (frequency === "weekly") {
          // Approximate: 4 weeks per month
          monthlyTotal += sub.amount * 4;
        }
      }

      projections.push({
        month: monthStr,
        monthLabel: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        amount: monthlyTotal,
        count: subscriptions.length,
      });
    }

    return projections;
  },
});

// Subscription spend over time (historical)
export const getSubscriptionSpendOverTime = query({
  args: {
    months: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;
    const monthsBack = args.months || 12;

    const outflowTypes = await ctx.db
      .query("outflowTypes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .filter((q) => q.eq(q.field("name"), "Subscription"))
      .collect();

    if (outflowTypes.length === 0) return [];

    const typeId = outflowTypes[0]._id;

    const now = new Date();
    const months = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = date.getTime();
      const end = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        1
      ).getTime();

      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_clerk_id_date", (q) =>
          q.eq("clerkId", clerkId).gte("date", start).lt("date", end)
        )
        .filter((q) => q.eq(q.field("outflowTypeId"), typeId))
        .collect();

      months.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        monthLabel: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        amount: transactions.reduce((sum, t) => sum + t.amount, 0),
        count: transactions.length,
      });
    }

    return months;
  },
});

// Account budgets and spending
export const getAccountBudgetsAndSpending = query({
  args: { month: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;

    // Get current month if not provided
    const targetMonth =
      args.month ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

    const [year, month] = targetMonth.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1).getTime();
    const endDate = new Date(year, month, 1).getTime();

    // Get all accounts with budgets
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .filter((q) => q.neq(q.field("isArchived"), true))
      .collect();

    // Get transactions for the month
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_clerk_id_date", (q) =>
        q.eq("clerkId", clerkId).gte("date", startDate).lt("date", endDate)
      )
      .collect();

    // Calculate spending per account
    const spendingByAccount = transactions.reduce(
      (acc, transaction) => {
        const accountId = transaction.accountId;
        acc[accountId] = (acc[accountId] || 0) + transaction.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    // Return accounts with budgets and their spending
    return accounts
      .filter((account) => account.budget) // Only accounts with budgets
      .map((account) => ({
        id: account._id,
        name: account.name,
        type: account.type,
        budget: account.budget!,
        spent: spendingByAccount[account._id] || 0,
        remaining: account.budget! - (spendingByAccount[account._id] || 0),
        percentage: Math.round(
          ((spendingByAccount[account._id] || 0) / account.budget!) * 100
        ),
      }))
      .sort((a, b) => b.percentage - a.percentage); // Sort by usage percentage
  },
});
