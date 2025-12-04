import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

/**
 * ====================================
 * ACCOUNTS API TESTS
 * ====================================
 *
 * Tests for account CRUD operations including:
 * - Creating accounts
 * - Listing accounts
 * - Updating accounts
 * - Archiving accounts
 * - Authorization checks
 */

describe("Accounts API", () => {
  describe("listAccounts", () => {
    it("should return null when user is not authenticated", async () => {
      const t = convexTest(schema);

      const accounts = await t.query(api.accounts.listAccounts);

      expect(accounts).toBeNull();
    });

    it("should return empty array for new user", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const accounts = await asUser.query(api.accounts.listAccounts);

      expect(accounts).toEqual([]);
    });

    it("should return only non-archived accounts for authenticated user", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      // Create test accounts
      await asUser.mutation(api.accounts.createAccount, {
        name: "Savings",
        type: "Bank",
        colorHex: "#10b981",
      });
      await asUser.mutation(api.accounts.createAccount, {
        name: "Cash",
        type: "Cash",
        colorHex: "#3b82f6",
      });

      const accounts = await asUser.query(api.accounts.listAccounts);

      expect(accounts).toHaveLength(2);
      expect(accounts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Savings", type: "Bank" }),
          expect.objectContaining({ name: "Cash", type: "Cash" }),
        ])
      );
    });

    it("should not return archived accounts", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      // Create and archive an account
      const accountId = await asUser.mutation(api.accounts.createAccount, {
        name: "Old Account",
        type: "Bank",
        colorHex: "#ef4444",
      });
      await asUser.mutation(api.accounts.archiveAccount, { id: accountId });

      const accounts = await asUser.query(api.accounts.listAccounts);

      expect(accounts).toEqual([]);
    });

    it("should not return other user's accounts", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });

      // User 1 creates an account
      await asUser1.mutation(api.accounts.createAccount, {
        name: "User1 Account",
        type: "Bank",
        colorHex: "#10b981",
      });

      // User 2 should not see it
      const user2Accounts = await asUser2.query(api.accounts.listAccounts);

      expect(user2Accounts).toEqual([]);
    });
  });

  describe("createAccount", () => {
    it("should throw error when user is not authenticated", async () => {
      const t = convexTest(schema);

      await expect(
        t.mutation(api.accounts.createAccount, {
          name: "Test",
          type: "Bank",
          colorHex: "#000000",
        })
      ).rejects.toThrow("Unauthenticated");
    });

    it("should create account with correct data", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const accountId = await asUser.mutation(api.accounts.createAccount, {
        name: "New Account",
        type: "Credit Card",
        colorHex: "#f59e0b",
        budget: 50000,
      });

      expect(accountId).toBeDefined();

      const accounts = await asUser.query(api.accounts.listAccounts);
      expect(accounts).toEqual([
        expect.objectContaining({
          _id: accountId,
          name: "New Account",
          type: "Credit Card",
          colorHex: "#f59e0b",
          budget: 50000,
          isArchived: false,
          clerkId: "user_123",
        }),
      ]);
    });

    it("should support all account types", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const types = [
        "Cash",
        "Bank",
        "Credit Card",
        "UPI",
        "Loan",
        "Wallet",
        "Other",
      ] as const;

      for (const type of types) {
        const id = await asUser.mutation(api.accounts.createAccount, {
          name: `${type} Account`,
          type,
          colorHex: "#000000",
        });
        expect(id).toBeDefined();
      }

      const accounts = await asUser.query(api.accounts.listAccounts);
      expect(accounts).toHaveLength(types.length);
    });

    it("should create account without budget when not provided", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const accountId = await asUser.mutation(api.accounts.createAccount, {
        name: "No Budget Account",
        type: "Cash",
        colorHex: "#10b981",
      });

      expect(accountId).toBeDefined();

      const accounts = await asUser.query(api.accounts.listAccounts);
      expect(accounts).toEqual([
        expect.objectContaining({
          _id: accountId,
          name: "No Budget Account",
          type: "Cash",
          colorHex: "#10b981",
          budget: undefined,
          isArchived: false,
          clerkId: "user_123",
        }),
      ]);
    });
  });

  describe("updateAccount", () => {
    it("should update account name", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const accountId = await asUser.mutation(api.accounts.createAccount, {
        name: "Original",
        type: "Bank",
        colorHex: "#10b981",
      });

      await asUser.mutation(api.accounts.updateAccount, {
        id: accountId,
        name: "Updated",
      });

      const accounts = await asUser.query(api.accounts.listAccounts);
      expect(accounts).not.toBeNull();
      expect(accounts![0].name).toBe("Updated");
    });

    it("should update account type", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const accountId = await asUser.mutation(api.accounts.createAccount, {
        name: "Test",
        type: "Bank",
        colorHex: "#10b981",
      });

      await asUser.mutation(api.accounts.updateAccount, {
        id: accountId,
        type: "UPI",
      });

      const accounts = await asUser.query(api.accounts.listAccounts);
      expect(accounts).not.toBeNull();
      expect(accounts![0].type).toBe("UPI");
    });

    it("should not update other user's account", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });

      const accountId = await asUser1.mutation(api.accounts.createAccount, {
        name: "User1 Account",
        type: "Bank",
        colorHex: "#10b981",
      });

      await expect(
        asUser2.mutation(api.accounts.updateAccount, {
          id: accountId,
          name: "Hacked",
        })
      ).rejects.toThrow();
    });

    it("should update account budget", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const accountId = await asUser.mutation(api.accounts.createAccount, {
        name: "Budget Test",
        type: "Bank",
        colorHex: "#10b981",
        budget: 10000,
      });

      await asUser.mutation(api.accounts.updateAccount, {
        id: accountId,
        budget: 25000,
      });

      const accounts = await asUser.query(api.accounts.listAccounts);
      expect(accounts).not.toBeNull();
      expect(accounts![0].budget).toBe(25000);
    });

    it("should remove account budget when set to undefined", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const accountId = await asUser.mutation(api.accounts.createAccount, {
        name: "Budget Remove Test",
        type: "Bank",
        colorHex: "#10b981",
        budget: 50000,
      });

      await asUser.mutation(api.accounts.updateAccount, {
        id: accountId,
        budget: undefined,
      });

      const accounts = await asUser.query(api.accounts.listAccounts);
      expect(accounts).not.toBeNull();
      expect(accounts![0].budget).toBeUndefined();
    });
  });

  describe("archiveAccount", () => {
    it("should archive account", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const accountId = await asUser.mutation(api.accounts.createAccount, {
        name: "To Archive",
        type: "Bank",
        colorHex: "#10b981",
      });

      await asUser.mutation(api.accounts.archiveAccount, { id: accountId });

      const accounts = await asUser.query(api.accounts.listAccounts);
      expect(accounts).toEqual([]);
    });

    it("should not archive other user's account", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });

      const accountId = await asUser1.mutation(api.accounts.createAccount, {
        name: "User1 Account",
        type: "Bank",
        colorHex: "#10b981",
      });

      await expect(
        asUser2.mutation(api.accounts.archiveAccount, { id: accountId })
      ).rejects.toThrow();
    });
  });

  describe("getAccountWithBalance", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const accountId = await asUser.mutation(api.accounts.createAccount, {
        name: "Test",
        type: "Bank",
        colorHex: "#10b981",
      });

      // Query without auth
      const noAuth = convexTest(schema);
      const result = await noAuth.query(api.accounts.getAccountWithBalance, {
        id: accountId,
      });

      expect(result).toBeNull();
    });

    it("should return account with zero balance when no transactions", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });

      const accountId = await asUser.mutation(api.accounts.createAccount, {
        name: "Test",
        type: "Bank",
        colorHex: "#10b981",
      });

      const result = await asUser.query(api.accounts.getAccountWithBalance, {
        id: accountId,
      });

      expect(result).toMatchObject({
        name: "Test",
        totalSpent: 0,
      });
    });
  });
});
