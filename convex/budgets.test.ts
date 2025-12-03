import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

/**
 * ====================================
 * BUDGETS API TESTS
 * ====================================
 * 
 * Tests for budget operations including:
 * - Creating budgets
 * - Listing budgets
 * - Updating budgets
 * - Deleting budgets
 * - Budget progress tracking
 */

describe("Budgets API", () => {
  // Helper to create required dependencies
  async function setupTestData(asUser: ReturnType<ReturnType<typeof convexTest>["withIdentity"]>) {
    const outflowTypeId = await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
      name: "Groceries",
      emoji: "🛒",
      colorHex: "#10b981",
      extraFields: [],
    });

    const accountId = await asUser.mutation(api.accounts.createAccount, {
      name: "Test Account",
      type: "Bank",
      colorHex: "#10b981",
    });

    return { outflowTypeId, accountId };
  }

  describe("listBudgets", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);
      
      const budgets = await t.query(api.budgets.listBudgets, {});
      
      expect(budgets).toBeNull();
    });

    it("should return empty array for new user", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      const budgets = await asUser.query(api.budgets.listBudgets, {});
      
      expect(budgets).toEqual([]);
    });

    it("should return budgets for authenticated user", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { outflowTypeId } = await setupTestData(asUser);
      
      await asUser.mutation(api.budgets.createBudget, {
        outflowTypeId,
        amount: 5000,
        month: "2024-12",
      });
      
      const budgets = await asUser.query(api.budgets.listBudgets, {});
      
      expect(budgets).toHaveLength(1);
      expect(budgets).not.toBeNull();
      expect(budgets![0]).toMatchObject({
        amount: 5000,
        month: "2024-12",
      });
    });

    it("should filter by month", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { outflowTypeId } = await setupTestData(asUser);
      
      const outflowTypeId2 = await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
        name: "Entertainment",
        emoji: "🎬",
        colorHex: "#8b5cf6",
        extraFields: [],
      });
      
      await asUser.mutation(api.budgets.createBudget, {
        outflowTypeId,
        amount: 5000,
        month: "2024-11",
      });
      
      await asUser.mutation(api.budgets.createBudget, {
        outflowTypeId: outflowTypeId2,
        amount: 2000,
        month: "2024-12",
      });
      
      const novemberBudgets = await asUser.query(api.budgets.listBudgets, { month: "2024-11" });
      const decemberBudgets = await asUser.query(api.budgets.listBudgets, { month: "2024-12" });
      
      expect(novemberBudgets).toHaveLength(1);
      expect(novemberBudgets).not.toBeNull();
      expect(novemberBudgets![0].amount).toBe(5000);
      
      expect(decemberBudgets).toHaveLength(1);
      expect(decemberBudgets).not.toBeNull();
      expect(decemberBudgets![0].amount).toBe(2000);
    });

    it("should not return other user's budgets", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      const { outflowTypeId } = await setupTestData(asUser1);
      
      await asUser1.mutation(api.budgets.createBudget, {
        outflowTypeId,
        amount: 5000,
        month: "2024-12",
      });
      
      const user2Budgets = await asUser2.query(api.budgets.listBudgets, {});
      
      expect(user2Budgets).toEqual([]);
    });
  });

  describe("createBudget", () => {
    it("should throw error when not authenticated", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { outflowTypeId } = await setupTestData(asUser);
      
      const noAuth = convexTest(schema);
      await expect(
        noAuth.mutation(api.budgets.createBudget, {
          outflowTypeId,
          amount: 5000,
          month: "2024-12",
        })
      ).rejects.toThrow("Unauthenticated");
    });

    it("should create budget with correct data", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { outflowTypeId } = await setupTestData(asUser);
      
      const budgetId = await asUser.mutation(api.budgets.createBudget, {
        outflowTypeId,
        amount: 10000,
        month: "2024-12",
      });
      
      expect(budgetId).toBeDefined();
      
      const budgets = await asUser.query(api.budgets.listBudgets, {});
      expect(budgets).not.toBeNull();
      expect(budgets![0]).toMatchObject({
        _id: budgetId,
        amount: 10000,
        month: "2024-12",
      });
    });

    it("should not allow duplicate budgets for same type and month", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { outflowTypeId } = await setupTestData(asUser);
      
      await asUser.mutation(api.budgets.createBudget, {
        outflowTypeId,
        amount: 5000,
        month: "2024-12",
      });
      
      await expect(
        asUser.mutation(api.budgets.createBudget, {
          outflowTypeId,
          amount: 6000,
          month: "2024-12",
        })
      ).rejects.toThrow("already exists");
    });

    it("should allow budgets for same type in different months", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { outflowTypeId } = await setupTestData(asUser);
      
      await asUser.mutation(api.budgets.createBudget, {
        outflowTypeId,
        amount: 5000,
        month: "2024-11",
      });
      
      const budgetId = await asUser.mutation(api.budgets.createBudget, {
        outflowTypeId,
        amount: 6000,
        month: "2024-12",
      });
      
      expect(budgetId).toBeDefined();
    });
  });

  describe("updateBudget", () => {
    it("should update budget amount", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { outflowTypeId } = await setupTestData(asUser);
      
      const budgetId = await asUser.mutation(api.budgets.createBudget, {
        outflowTypeId,
        amount: 5000,
        month: "2024-12",
      });
      
      await asUser.mutation(api.budgets.updateBudget, {
        id: budgetId,
        amount: 7500,
      });
      
      const budgets = await asUser.query(api.budgets.listBudgets, {});
      expect(budgets).not.toBeNull();
      expect(budgets![0].amount).toBe(7500);
    });

    it("should not update other user's budget", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      const { outflowTypeId } = await setupTestData(asUser1);
      
      const budgetId = await asUser1.mutation(api.budgets.createBudget, {
        outflowTypeId,
        amount: 5000,
        month: "2024-12",
      });
      
      await expect(
        asUser2.mutation(api.budgets.updateBudget, {
          id: budgetId,
          amount: 9999,
        })
      ).rejects.toThrow();
    });
  });

  describe("deleteBudget", () => {
    it("should delete budget", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { outflowTypeId } = await setupTestData(asUser);
      
      const budgetId = await asUser.mutation(api.budgets.createBudget, {
        outflowTypeId,
        amount: 5000,
        month: "2024-12",
      });
      
      await asUser.mutation(api.budgets.deleteBudget, { id: budgetId });
      
      const budgets = await asUser.query(api.budgets.listBudgets, {});
      expect(budgets).toEqual([]);
    });

    it("should not delete other user's budget", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      const { outflowTypeId } = await setupTestData(asUser1);
      
      const budgetId = await asUser1.mutation(api.budgets.createBudget, {
        outflowTypeId,
        amount: 5000,
        month: "2024-12",
      });
      
      await expect(
        asUser2.mutation(api.budgets.deleteBudget, { id: budgetId })
      ).rejects.toThrow();
    });
  });

  describe("getBudgetProgress", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);
      
      const progress = await t.query(api.budgets.getBudgetProgress, { month: "2024-12" });
      
      expect(progress).toBeNull();
    });

    it("should return empty array when no budgets", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      const progress = await asUser.query(api.budgets.getBudgetProgress, { month: "2024-12" });
      
      expect(progress).toEqual([]);
    });

    it("should calculate budget progress correctly", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { outflowTypeId, accountId } = await setupTestData(asUser);
      
      // Create budget
      await asUser.mutation(api.budgets.createBudget, {
        outflowTypeId,
        amount: 10000,
        month: "2024-12",
      });
      
      // Add some transactions
      const december = new Date(2024, 11, 15).getTime();
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 3000,
        date: december,
        accountId,
        outflowTypeId,
        note: "Transaction 1",
        metadata: {},
      });
      
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 2000,
        date: december,
        accountId,
        outflowTypeId,
        note: "Transaction 2",
        metadata: {},
      });
      
      const progress = await asUser.query(api.budgets.getBudgetProgress, { month: "2024-12" });
      
      expect(progress).toHaveLength(1);
      expect(progress).not.toBeNull();
      expect(progress![0]).toMatchObject({
        budgeted: 10000,
        spent: 5000,
        progress: 0.5,
      });
    });
  });
});
