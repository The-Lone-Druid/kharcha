import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

/**
 * ====================================
 * TRANSACTIONS API TESTS
 * ====================================
 * 
 * Tests for transaction operations including:
 * - Creating transactions
 * - Listing transactions with filters
 * - Updating transactions
 * - Deleting transactions
 * - Monthly summaries
 * - Authorization checks
 */

describe("Transactions API", () => {
  // Helper to create required dependencies (account and outflow type)
  async function setupTestData(asUser: ReturnType<ReturnType<typeof convexTest>["withIdentity"]>) {
    const accountId = await asUser.mutation(api.accounts.createAccount, {
      name: "Test Account",
      type: "Bank",
      colorHex: "#10b981",
    });

    const outflowTypeId = await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
      name: "Expense",
      emoji: "💸",
      colorHex: "#ef4444",
      extraFields: [],
    });

    return { accountId, outflowTypeId };
  }

  describe("listTransactions", () => {
    it("should return null when user is not authenticated", async () => {
      const t = convexTest(schema);
      
      const transactions = await t.query(api.transactions.listTransactions, {});
      
      expect(transactions).toBeNull();
    });

    it("should return empty array for new user", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      const transactions = await asUser.query(api.transactions.listTransactions, {});
      
      expect(transactions).toEqual([]);
    });

    it("should return transactions with account and outflow type details", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, outflowTypeId } = await setupTestData(asUser);
      
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 500,
        date: Date.now(),
        accountId,
        outflowTypeId,
        note: "Test transaction",
        metadata: {},
      });
      
      const transactions = await asUser.query(api.transactions.listTransactions, {});
      
      expect(transactions).toHaveLength(1);
      expect(transactions).not.toBeNull();
      expect(transactions![0]).toMatchObject({
        amount: 500,
        note: "Test transaction",
        account: expect.objectContaining({ name: "Test Account" }),
        outflowType: expect.objectContaining({ name: "Expense" }),
      });
    });

    it("should filter by account", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, outflowTypeId } = await setupTestData(asUser);
      
      const accountId2 = await asUser.mutation(api.accounts.createAccount, {
        name: "Account 2",
        type: "Cash",
        colorHex: "#3b82f6",
      });
      
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 100,
        date: Date.now(),
        accountId,
        outflowTypeId,
        note: "From account 1",
        metadata: {},
      });
      
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 200,
        date: Date.now(),
        accountId: accountId2,
        outflowTypeId,
        note: "From account 2",
        metadata: {},
      });
      
      const filtered = await asUser.query(api.transactions.listTransactions, {
        accountId,
      });
      
      expect(filtered).toHaveLength(1);
      expect(filtered).not.toBeNull();
      expect(filtered![0].note).toBe("From account 1");
    });

    it("should filter by outflow type", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, outflowTypeId } = await setupTestData(asUser);
      
      const outflowTypeId2 = await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
        name: "Food",
        emoji: "🍔",
        colorHex: "#f59e0b",
        extraFields: [],
      });
      
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 100,
        date: Date.now(),
        accountId,
        outflowTypeId,
        note: "Expense",
        metadata: {},
      });
      
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 50,
        date: Date.now(),
        accountId,
        outflowTypeId: outflowTypeId2,
        note: "Food",
        metadata: {},
      });
      
      const filtered = await asUser.query(api.transactions.listTransactions, {
        outflowTypeId,
      });
      
      expect(filtered).toHaveLength(1);
      expect(filtered).not.toBeNull();
      expect(filtered![0].note).toBe("Expense");
    });

    it("should filter by date range", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, outflowTypeId } = await setupTestData(asUser);
      
      const now = Date.now();
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
      
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 100,
        date: now,
        accountId,
        outflowTypeId,
        note: "Recent",
        metadata: {},
      });
      
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 200,
        date: twoWeeksAgo,
        accountId,
        outflowTypeId,
        note: "Old",
        metadata: {},
      });
      
      const filtered = await asUser.query(api.transactions.listTransactions, {
        startDate: oneWeekAgo,
      });
      
      expect(filtered).toHaveLength(1);
      expect(filtered).not.toBeNull();
      expect(filtered![0].note).toBe("Recent");
    });

    it("should respect limit", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, outflowTypeId } = await setupTestData(asUser);
      
      for (let i = 0; i < 10; i++) {
        await asUser.mutation(api.transactions.addTransaction, {
          amount: 100 * i,
          date: Date.now() - i * 1000,
          accountId,
          outflowTypeId,
          note: `Transaction ${i}`,
          metadata: {},
        });
      }
      
      const limited = await asUser.query(api.transactions.listTransactions, {
        limit: 5,
      });
      
      expect(limited).toHaveLength(5);
    });

    it("should not return other user's transactions", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      const { accountId, outflowTypeId } = await setupTestData(asUser1);
      
      await asUser1.mutation(api.transactions.addTransaction, {
        amount: 500,
        date: Date.now(),
        accountId,
        outflowTypeId,
        note: "User1 transaction",
        metadata: {},
      });
      
      const user2Transactions = await asUser2.query(api.transactions.listTransactions, {});
      
      expect(user2Transactions).toEqual([]);
    });
  });

  describe("addTransaction", () => {
    it("should throw error when user is not authenticated", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, outflowTypeId } = await setupTestData(asUser);
      
      const noAuth = convexTest(schema);
      await expect(
        noAuth.mutation(api.transactions.addTransaction, {
          amount: 100,
          date: Date.now(),
          accountId,
          outflowTypeId,
          note: "Test",
          metadata: {},
        })
      ).rejects.toThrow("Unauthenticated");
    });

    it("should create transaction with correct data", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, outflowTypeId } = await setupTestData(asUser);
      
      const transactionId = await asUser.mutation(api.transactions.addTransaction, {
        amount: 1500.50,
        date: Date.now(),
        accountId,
        outflowTypeId,
        note: "Monthly grocery",
        metadata: { category: "essential" },
      });
      
      expect(transactionId).toBeDefined();
      
      const transactions = await asUser.query(api.transactions.listTransactions, {});
      expect(transactions).not.toBeNull();
      expect(transactions![0]).toMatchObject({
        _id: transactionId,
        amount: 1500.50,
        note: "Monthly grocery",
      });
    });

    it("should reject transaction with invalid account", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      const { accountId } = await setupTestData(asUser1);
      const { outflowTypeId } = await setupTestData(asUser2);
      
      await expect(
        asUser2.mutation(api.transactions.addTransaction, {
          amount: 100,
          date: Date.now(),
          accountId, // User1's account
          outflowTypeId,
          note: "Invalid",
          metadata: {},
        })
      ).rejects.toThrow("Invalid account");
    });

    it("should reject transaction with invalid outflow type", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      const { accountId } = await setupTestData(asUser2);
      const { outflowTypeId } = await setupTestData(asUser1);
      
      await expect(
        asUser2.mutation(api.transactions.addTransaction, {
          amount: 100,
          date: Date.now(),
          accountId,
          outflowTypeId, // User1's outflow type
          note: "Invalid",
          metadata: {},
        })
      ).rejects.toThrow("Invalid outflow type");
    });
  });

  describe("updateTransaction", () => {
    it("should update transaction amount", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, outflowTypeId } = await setupTestData(asUser);
      
      const transactionId = await asUser.mutation(api.transactions.addTransaction, {
        amount: 100,
        date: Date.now(),
        accountId,
        outflowTypeId,
        note: "Original",
        metadata: {},
      });
      
      await asUser.mutation(api.transactions.updateTransaction, {
        id: transactionId,
        amount: 200,
      });
      
      const transactions = await asUser.query(api.transactions.listTransactions, {});
      expect(transactions).not.toBeNull();
      expect(transactions![0].amount).toBe(200);
    });

    it("should update transaction note", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, outflowTypeId } = await setupTestData(asUser);
      
      const transactionId = await asUser.mutation(api.transactions.addTransaction, {
        amount: 100,
        date: Date.now(),
        accountId,
        outflowTypeId,
        note: "Original note",
        metadata: {},
      });
      
      await asUser.mutation(api.transactions.updateTransaction, {
        id: transactionId,
        note: "Updated note",
      });
      
      const transactions = await asUser.query(api.transactions.listTransactions, {});
      expect(transactions).not.toBeNull();
      expect(transactions![0].note).toBe("Updated note");
    });

    it("should not update other user's transaction", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      const { accountId, outflowTypeId } = await setupTestData(asUser1);
      
      const transactionId = await asUser1.mutation(api.transactions.addTransaction, {
        amount: 100,
        date: Date.now(),
        accountId,
        outflowTypeId,
        note: "User1's",
        metadata: {},
      });
      
      await expect(
        asUser2.mutation(api.transactions.updateTransaction, {
          id: transactionId,
          amount: 999,
        })
      ).rejects.toThrow();
    });
  });

  describe("deleteTransaction", () => {
    it("should delete transaction", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, outflowTypeId } = await setupTestData(asUser);
      
      const transactionId = await asUser.mutation(api.transactions.addTransaction, {
        amount: 100,
        date: Date.now(),
        accountId,
        outflowTypeId,
        note: "To delete",
        metadata: {},
      });
      
      await asUser.mutation(api.transactions.deleteTransaction, { id: transactionId });
      
      const transactions = await asUser.query(api.transactions.listTransactions, {});
      expect(transactions).toEqual([]);
    });

    it("should not delete other user's transaction", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      const { accountId, outflowTypeId } = await setupTestData(asUser1);
      
      const transactionId = await asUser1.mutation(api.transactions.addTransaction, {
        amount: 100,
        date: Date.now(),
        accountId,
        outflowTypeId,
        note: "User1's",
        metadata: {},
      });
      
      await expect(
        asUser2.mutation(api.transactions.deleteTransaction, { id: transactionId })
      ).rejects.toThrow();
    });
  });

  describe("getMonthlySummary", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);
      
      const summary = await t.query(api.transactions.getMonthlySummary, {});
      
      expect(summary).toBeNull();
    });

    it("should return zero total for month with no transactions", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      const summary = await asUser.query(api.transactions.getMonthlySummary, {});
      
      expect(summary).toMatchObject({
        totalSpent: 0,
        topTypes: [],
      });
    });

    it("should calculate monthly total correctly", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { accountId, outflowTypeId } = await setupTestData(asUser);
      
      const now = Date.now();
      
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 500,
        date: now,
        accountId,
        outflowTypeId,
        note: "Transaction 1",
        metadata: {},
      });
      
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 300,
        date: now,
        accountId,
        outflowTypeId,
        note: "Transaction 2",
        metadata: {},
      });
      
      const summary = await asUser.query(api.transactions.getMonthlySummary, {});
      
      expect(summary?.totalSpent).toBe(800);
    });
  });
});
