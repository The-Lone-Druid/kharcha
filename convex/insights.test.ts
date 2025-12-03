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
  async function setupTestData(asUser: ReturnType<ReturnType<typeof convexTest>["withIdentity"]>) {
    const accountId = await asUser.mutation(api.accounts.createAccount, {
      name: "Test Account",
      type: "Bank",
      colorHex: "#10b981",
    });

    const expenseTypeId = await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
      name: "Expense",
      emoji: "💸",
      colorHex: "#ef4444",
      extraFields: [],
    });

    const subscriptionTypeId = await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
      name: "Subscription",
      emoji: "🔄",
      colorHex: "#3b82f6",
      extraFields: [
        { key: "provider", label: "Provider", type: "text" },
        { key: "renewalDate", label: "Renewal Date", type: "date" },
      ],
    });

    const moneyLentTypeId = await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
      name: "Money Lent",
      emoji: "🤝",
      colorHex: "#8b5cf6",
      extraFields: [
        { key: "borrowerName", label: "Borrower Name", type: "text" },
        { key: "dueDate", label: "Due Date", type: "date" },
      ],
    });

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
      spend?.forEach(month => {
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
      
      const current = spend?.find(m => m.month === currentMonthStr);
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
      
      const breakdown = await asUser.query(api.insights.getOutflowTypeBreakdown, {});
      
      expect(breakdown).toEqual([]);
    });

    it("should break down spending by outflow type", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, expenseTypeId, subscriptionTypeId } = await setupTestData(asUser);
      
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
      
      const breakdown = await asUser.query(api.insights.getOutflowTypeBreakdown, {});
      
      expect(breakdown).toHaveLength(2);
      
      const expense = breakdown?.find(b => b.name === "Expense");
      const subscription = breakdown?.find(b => b.name === "Subscription");
      
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
      
      const breakdown = await asUser.query(api.insights.getOutflowTypeBreakdown, {
        startDate: oneWeekAgo,
      });
      
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
});
