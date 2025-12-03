import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

/**
 * ====================================
 * INSIGHTS API TESTS
 * ====================================
 *
 * Tests for analytics and insights including:
 * - Monthly spend tracking
 * - Outflow type breakdown
 * - Subscriptions list
 * - Money lent tracking
 */

describe("Insights API", () => {
  // Helper to create required dependencies
  async function setupTestData(
    asUser: ReturnType<ReturnType<typeof convexTest>["withIdentity"]>
  ) {
    const accountId = await asUser.mutation(api.accounts.createAccount, {
      name: "Test Account",
      type: "Bank",
      colorHex: "#10b981",
    });

    const expenseTypeId = await asUser.mutation(
      api.outflowTypes.createCustomOutflowType,
      {
        name: "Expense",
        emoji: "💸",
        colorHex: "#ef4444",
        extraFields: [],
      }
    );

    const subscriptionTypeId = await asUser.mutation(
      api.outflowTypes.createCustomOutflowType,
      {
        name: "Subscription",
        emoji: "🔄",
        colorHex: "#3b82f6",
        extraFields: [
          { key: "provider", label: "Provider", type: "text" },
          { key: "renewalDate", label: "Renewal Date", type: "date" },
        ],
      }
    );

    const moneyLentTypeId = await asUser.mutation(
      api.outflowTypes.createCustomOutflowType,
      {
        name: "Money Lent",
        emoji: "🤝",
        colorHex: "#8b5cf6",
        extraFields: [
          { key: "borrowerName", label: "Borrower Name", type: "text" },
          { key: "dueDate", label: "Due Date", type: "date" },
        ],
      }
    );

    return { accountId, expenseTypeId, subscriptionTypeId, moneyLentTypeId };
  }

  describe("getMonthlySpend", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);

      const spend = await t.query(api.insights.getMonthlySpend);

      expect(spend).toBeNull();
    });

    it("should return 12 months of data", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const spend = await asUser.query(api.insights.getMonthlySpend);

      expect(spend).toHaveLength(12);
    });

    it("should return zero totals for months with no transactions", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const spend = await asUser.query(api.insights.getMonthlySpend);

      // All should be zero for new user
      spend?.forEach((month) => {
        expect(month.total).toBe(0);
      });
    });

    it("should calculate monthly totals correctly", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, expenseTypeId } = await setupTestData(asUser);

      // Add transactions for current month
      const now = Date.now();
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 1000,
        date: now,
        accountId,
        outflowTypeId: expenseTypeId,
        note: "Transaction 1",
        metadata: {},
      });

      await asUser.mutation(api.transactions.addTransaction, {
        amount: 500,
        date: now,
        accountId,
        outflowTypeId: expenseTypeId,
        note: "Transaction 2",
        metadata: {},
      });

      const spend = await asUser.query(api.insights.getMonthlySpend);

      // Current month should have total of 1500
      const currentMonth = new Date();
      const currentMonthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

      const current = spend?.find((m) => m.month === currentMonthStr);
      expect(current?.total).toBe(1500);
    });
  });

  describe("getOutflowTypeBreakdown", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);

      const breakdown = await t.query(api.insights.getOutflowTypeBreakdown, {});

      expect(breakdown).toBeNull();
    });

    it("should return empty array for user with no transactions", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const breakdown = await asUser.query(
        api.insights.getOutflowTypeBreakdown,
        {}
      );

      expect(breakdown).toEqual([]);
    });

    it("should break down spending by outflow type", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, expenseTypeId, subscriptionTypeId } =
        await setupTestData(asUser);

      const now = Date.now();

      // Add expense transactions
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 1000,
        date: now,
        accountId,
        outflowTypeId: expenseTypeId,
        note: "Expense 1",
        metadata: {},
      });

      await asUser.mutation(api.transactions.addTransaction, {
        amount: 500,
        date: now,
        accountId,
        outflowTypeId: expenseTypeId,
        note: "Expense 2",
        metadata: {},
      });

      // Add subscription transaction
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 999,
        date: now,
        accountId,
        outflowTypeId: subscriptionTypeId,
        note: "Netflix",
        metadata: { provider: "Netflix" },
      });

      const breakdown = await asUser.query(
        api.insights.getOutflowTypeBreakdown,
        {}
      );

      expect(breakdown).toHaveLength(2);

      const expense = breakdown?.find((b) => b.name === "Expense");
      const subscription = breakdown?.find((b) => b.name === "Subscription");

      expect(expense?.total).toBe(1500);
      expect(subscription?.total).toBe(999);
    });

    it("should filter by date range", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, expenseTypeId } = await setupTestData(asUser);

      const now = Date.now();
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

      // Transaction from 2 weeks ago
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 1000,
        date: twoWeeksAgo,
        accountId,
        outflowTypeId: expenseTypeId,
        note: "Old",
        metadata: {},
      });

      // Recent transaction
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 500,
        date: now,
        accountId,
        outflowTypeId: expenseTypeId,
        note: "Recent",
        metadata: {},
      });

      const breakdown = await asUser.query(
        api.insights.getOutflowTypeBreakdown,
        {
          startDate: oneWeekAgo,
        }
      );

      expect(breakdown).toHaveLength(1);
      expect(breakdown?.[0].total).toBe(500);
    });
  });

  describe("getSubscriptions", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);

      const subscriptions = await t.query(api.insights.getSubscriptions);

      expect(subscriptions).toBeNull();
    });

    it("should return empty array for user with no subscriptions", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const subscriptions = await asUser.query(api.insights.getSubscriptions);

      expect(subscriptions).toEqual([]);
    });

    it("should return subscription transactions", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, subscriptionTypeId } = await setupTestData(asUser);

      const renewalDate = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days from now

      await asUser.mutation(api.transactions.addTransaction, {
        amount: 999,
        date: Date.now(),
        accountId,
        outflowTypeId: subscriptionTypeId,
        note: "Netflix subscription",
        metadata: { provider: "Netflix", renewalDate },
      });

      const subscriptions = await asUser.query(api.insights.getSubscriptions);

      expect(subscriptions?.length).toBeGreaterThan(0);
    });
  });

  describe("getMoneyLentAgeing", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);

      const moneyLent = await t.query(api.insights.getMoneyLentAgeing);

      expect(moneyLent).toBeNull();
    });

    it("should return empty buckets for user with no overdue money lent", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const moneyLent = await asUser.query(api.insights.getMoneyLentAgeing);

      expect(moneyLent).toMatchObject({
        overdue0_30: [],
        overdue31_60: [],
        overdue60_plus: [],
      });
    });

    it("should categorize overdue money lent transactions", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, moneyLentTypeId } = await setupTestData(asUser);

      // Create a transaction with an overdue date (5 days ago)
      const overdueDate = Date.now() - 5 * 24 * 60 * 60 * 1000;

      await asUser.mutation(api.transactions.addTransaction, {
        amount: 5000,
        date: Date.now() - 30 * 24 * 60 * 60 * 1000, // Created 30 days ago
        accountId,
        outflowTypeId: moneyLentTypeId,
        note: "Lent to John",
        metadata: { borrowerName: "John", dueDate: overdueDate },
      });

      const moneyLent = await asUser.query(api.insights.getMoneyLentAgeing);

      expect(moneyLent?.overdue0_30.length).toBeGreaterThan(0);
    });
  });

  describe("getLoans", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);

      const loans = await t.query(api.insights.getLoans);

      expect(loans).toBeNull();
    });

    it("should return empty array for user with no loans", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const loans = await asUser.query(api.insights.getLoans);

      expect(loans).toEqual([]);
    });

    it("should return loan transactions with EMI details", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId } = await setupTestData(asUser);

      // Create EMI/Loan outflow type
      const loanTypeId = await asUser.mutation(
        api.outflowTypes.createCustomOutflowType,
        {
          name: "EMI/Loan",
          emoji: "🏦",
          colorHex: "#10b981",
          extraFields: [
            { key: "loanName", label: "Loan Name", type: "text" },
            { key: "emiAmount", label: "EMI Amount", type: "number" },
          ],
        }
      );

      await asUser.mutation(api.transactions.addTransaction, {
        amount: 500000,
        date: Date.now(),
        accountId,
        outflowTypeId: loanTypeId,
        note: "Home Loan",
        metadata: { loanName: "Home Loan", emiAmount: 25000 },
      });

      const loans = await asUser.query(api.insights.getLoans);

      expect(loans?.length).toBeGreaterThan(0);
    });
  });

  describe("getProjectedRecurring", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);

      const projected = await t.query(api.insights.getProjectedRecurring, {});

      expect(projected).toBeNull();
    });

    it("should return projections for default 3 months", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const projected = await asUser.query(
        api.insights.getProjectedRecurring,
        {}
      );

      expect(projected).toHaveLength(3);
    });

    it("should return projections for specified months", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const projected = await asUser.query(api.insights.getProjectedRecurring, {
        months: 6,
      });

      expect(projected).toHaveLength(6);
    });

    it("should include subscription totals in projections", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, subscriptionTypeId } = await setupTestData(asUser);

      await asUser.mutation(api.transactions.addTransaction, {
        amount: 999,
        date: Date.now(),
        accountId,
        outflowTypeId: subscriptionTypeId,
        note: "Netflix",
        metadata: { provider: "Netflix" },
      });

      const projected = await asUser.query(
        api.insights.getProjectedRecurring,
        {}
      );

      expect(projected).not.toBeNull();
      expect(projected![0].subscriptions).toBe(999);
    });
  });

  describe("getUpcomingEvents", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);

      const events = await t.query(api.insights.getUpcomingEvents);

      expect(events).toBeNull();
    });

    it("should return empty array for user with no upcoming events", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const events = await asUser.query(api.insights.getUpcomingEvents);

      expect(events).toEqual([]);
    });

    it("should return upcoming renewal events", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, subscriptionTypeId } = await setupTestData(asUser);

      const renewalDate = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days from now

      await asUser.mutation(api.transactions.addTransaction, {
        amount: 999,
        date: Date.now(),
        accountId,
        outflowTypeId: subscriptionTypeId,
        note: "Netflix",
        metadata: { provider: "Netflix", renewalDate },
      });

      const events = await asUser.query(api.insights.getUpcomingEvents);

      expect(events?.length).toBeGreaterThan(0);
      expect(events![0].type).toBe("renewal");
    });

    it("should return upcoming due events", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, moneyLentTypeId } = await setupTestData(asUser);

      const dueDate = Date.now() + 5 * 24 * 60 * 60 * 1000; // 5 days from now

      await asUser.mutation(api.transactions.addTransaction, {
        amount: 5000,
        date: Date.now(),
        accountId,
        outflowTypeId: moneyLentTypeId,
        note: "Lent to John",
        metadata: { borrowerName: "John", dueDate },
      });

      const events = await asUser.query(api.insights.getUpcomingEvents);

      expect(events?.length).toBeGreaterThan(0);
      expect(events![0].type).toBe("due");
    });
  });

  describe("getTrackingStreak", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);

      const streak = await t.query(api.insights.getTrackingStreak);

      expect(streak).toBeNull();
    });

    it("should return 0 for user with no transactions", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const streak = await asUser.query(api.insights.getTrackingStreak);

      expect(streak).toBe(0);
    });

    it("should return streak count for consecutive days", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, expenseTypeId } = await setupTestData(asUser);

      // Add transaction for today
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 100,
        date: Date.now(),
        accountId,
        outflowTypeId: expenseTypeId,
        note: "Today",
        metadata: {},
      });

      const streak = await asUser.query(api.insights.getTrackingStreak);

      expect(streak).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getSubscriptionBreakdown", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);

      const breakdown = await t.query(
        api.insights.getSubscriptionBreakdown,
        {}
      );

      expect(breakdown).toBeNull();
    });

    it("should return empty breakdown for user with no subscriptions", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const breakdown = await asUser.query(
        api.insights.getSubscriptionBreakdown,
        {}
      );

      expect(breakdown).toMatchObject({ breakdown: [], total: 0 });
    });

    it("should break down subscriptions by provider", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, subscriptionTypeId } = await setupTestData(asUser);

      await asUser.mutation(api.transactions.addTransaction, {
        amount: 999,
        date: Date.now(),
        accountId,
        outflowTypeId: subscriptionTypeId,
        note: "Netflix",
        metadata: { provider: "Netflix" },
      });

      await asUser.mutation(api.transactions.addTransaction, {
        amount: 199,
        date: Date.now(),
        accountId,
        outflowTypeId: subscriptionTypeId,
        note: "Spotify",
        metadata: { provider: "Spotify" },
      });

      const breakdown = await asUser.query(
        api.insights.getSubscriptionBreakdown,
        {}
      );

      expect(breakdown?.breakdown.length).toBe(2);
      expect(breakdown?.total).toBe(1198);
    });

    it("should filter by date range", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, subscriptionTypeId } = await setupTestData(asUser);

      const now = Date.now();
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

      await asUser.mutation(api.transactions.addTransaction, {
        amount: 999,
        date: now,
        accountId,
        outflowTypeId: subscriptionTypeId,
        note: "Netflix",
        metadata: { provider: "Netflix" },
      });

      const breakdown = await asUser.query(
        api.insights.getSubscriptionBreakdown,
        {
          startDate: oneWeekAgo,
          endDate: now + 1000,
        }
      );

      expect(breakdown?.total).toBe(999);
    });
  });

  describe("getProjectedSubscriptionSpend", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);

      const projected = await t.query(
        api.insights.getProjectedSubscriptionSpend,
        {}
      );

      expect(projected).toBeNull();
    });

    it("should return empty array for user with no subscriptions", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const projected = await asUser.query(
        api.insights.getProjectedSubscriptionSpend,
        {}
      );

      expect(projected).toEqual([]);
    });

    it("should project subscription spend for 12 months by default", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, subscriptionTypeId } = await setupTestData(asUser);

      await asUser.mutation(api.transactions.addTransaction, {
        amount: 999,
        date: Date.now(),
        accountId,
        outflowTypeId: subscriptionTypeId,
        note: "Netflix",
        metadata: { provider: "Netflix", frequency: "monthly" },
      });

      const projected = await asUser.query(
        api.insights.getProjectedSubscriptionSpend,
        {}
      );

      expect(projected).toHaveLength(12);
    });

    it("should project for specified months ahead", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, subscriptionTypeId } = await setupTestData(asUser);

      await asUser.mutation(api.transactions.addTransaction, {
        amount: 999,
        date: Date.now(),
        accountId,
        outflowTypeId: subscriptionTypeId,
        note: "Netflix",
        metadata: { provider: "Netflix" },
      });

      const projected = await asUser.query(
        api.insights.getProjectedSubscriptionSpend,
        {
          monthsAhead: 6,
        }
      );

      expect(projected).toHaveLength(6);
    });
  });

  describe("getSubscriptionSpendOverTime", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);

      const history = await t.query(
        api.insights.getSubscriptionSpendOverTime,
        {}
      );

      expect(history).toBeNull();
    });

    it("should return empty array for user with no subscriptions", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const history = await asUser.query(
        api.insights.getSubscriptionSpendOverTime,
        {}
      );

      expect(history).toEqual([]);
    });

    it("should return 12 months of history by default", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, subscriptionTypeId } = await setupTestData(asUser);

      await asUser.mutation(api.transactions.addTransaction, {
        amount: 999,
        date: Date.now(),
        accountId,
        outflowTypeId: subscriptionTypeId,
        note: "Netflix",
        metadata: { provider: "Netflix" },
      });

      const history = await asUser.query(
        api.insights.getSubscriptionSpendOverTime,
        {}
      );

      expect(history).toHaveLength(12);
    });

    it("should return specified months of history", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, subscriptionTypeId } = await setupTestData(asUser);

      await asUser.mutation(api.transactions.addTransaction, {
        amount: 999,
        date: Date.now(),
        accountId,
        outflowTypeId: subscriptionTypeId,
        note: "Netflix",
        metadata: { provider: "Netflix" },
      });

      const history = await asUser.query(
        api.insights.getSubscriptionSpendOverTime,
        {
          months: 6,
        }
      );

      expect(history).toHaveLength(6);
    });
  });
});
