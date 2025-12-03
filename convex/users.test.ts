import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

/**
 * ====================================
 * USERS API TESTS
 * ====================================
 * 
 * Tests for user operations including:
 * - Getting current user
 * - Creating user
 * - Updating preferences
 * - Notification preferences
 */

describe("Users API", () => {
  describe("getCurrentUser", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);
      
      const user = await t.query(api.users.getCurrentUser);
      
      expect(user).toBeNull();
    });

    it("should return user with default preferences for new user", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      const user = await asUser.query(api.users.getCurrentUser);
      
      expect(user).toMatchObject({
        clerkId: "user_123",
        preferences: {
          currency: "INR",
          language: "en",
          darkMode: false,
          onboardingCompleted: false,
        },
      });
    });

    it("should return saved preferences after update", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      // First create the user
      await asUser.mutation(api.users.createUser);
      
      // Update preferences
      await asUser.mutation(api.users.updateUserPreferences, {
        preferences: {
          currency: "USD",
          darkMode: true,
        },
      });
      
      const user = await asUser.query(api.users.getCurrentUser);
      
      expect(user?.preferences).toMatchObject({
        currency: "USD",
        darkMode: true,
      });
    });
  });

  describe("createUser", () => {
    it("should create user with default outflow types", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.users.createUser);
      
      // Check that outflow types were created
      const outflowTypes = await asUser.query(api.outflowTypes.listOutflowTypes);
      
      // Should have default built-in types
      expect(outflowTypes).not.toBeNull();
      expect(outflowTypes!.length).toBeGreaterThan(0);
      expect(outflowTypes!.some(t => t.name === "Expense")).toBe(true);
    });

    it("should not duplicate data on second call", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      // Call twice
      await asUser.mutation(api.users.createUser);
      await asUser.mutation(api.users.createUser);
      
      const outflowTypes = await asUser.query(api.outflowTypes.listOutflowTypes);
      
      // Count should remain the same
      expect(outflowTypes).not.toBeNull();
      const expectedTypes = outflowTypes!.length;
      
      // Third call
      await asUser.mutation(api.users.createUser);
      
      const outflowTypes2 = await asUser.query(api.outflowTypes.listOutflowTypes);
      
      expect(outflowTypes2).not.toBeNull();
      expect(outflowTypes2!.length).toBe(expectedTypes);
    });
  });

  describe("updateUserPreferences", () => {
    it("should update currency preference", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.users.createUser);
      await asUser.mutation(api.users.updateUserPreferences, {
        preferences: { currency: "USD" },
      });
      
      const user = await asUser.query(api.users.getCurrentUser);
      expect(user?.preferences).toMatchObject({ currency: "USD" });
    });

    it("should update language preference", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.users.createUser);
      await asUser.mutation(api.users.updateUserPreferences, {
        preferences: { language: "hi" },
      });
      
      const user = await asUser.query(api.users.getCurrentUser);
      expect(user?.preferences).toMatchObject({ language: "hi" });
    });

    it("should update dark mode preference", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.users.createUser);
      await asUser.mutation(api.users.updateUserPreferences, {
        preferences: { darkMode: true },
      });
      
      const user = await asUser.query(api.users.getCurrentUser);
      expect(user?.preferences).toMatchObject({ darkMode: true });
    });

    it("should update onboarding completed status", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.users.createUser);
      await asUser.mutation(api.users.updateUserPreferences, {
        preferences: { onboardingCompleted: true },
      });
      
      const user = await asUser.query(api.users.getCurrentUser);
      expect(user?.preferences).toMatchObject({ onboardingCompleted: true });
    });

    it("should update notification preferences", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.users.createUser);
      await asUser.mutation(api.users.updateUserPreferences, {
        preferences: {
          notificationPreferences: {
            globalNotifications: true,
            subscriptionReminders: true,
            dueDateReminders: false,
            emailNotifications: true,
          },
        },
      });
      
      const user = await asUser.query(api.users.getCurrentUser);
      expect(user?.preferences).toMatchObject({
        notificationPreferences: {
          globalNotifications: true,
          subscriptionReminders: true,
          dueDateReminders: false,
          emailNotifications: true,
        },
      });
    });

    it("should preserve existing preferences when updating partial", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.users.createUser);
      
      // Set initial preferences
      await asUser.mutation(api.users.updateUserPreferences, {
        preferences: {
          currency: "USD",
          language: "en",
        },
      });
      
      // Update only currency
      await asUser.mutation(api.users.updateUserPreferences, {
        preferences: { currency: "EUR" },
      });
      
      const user = await asUser.query(api.users.getCurrentUser);
      expect(user?.preferences).toMatchObject({
        currency: "EUR",
        language: "en", // Should be preserved
      });
    });
  });

  describe("updateNotificationPreferences", () => {
    it("should update global notifications toggle", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.users.createUser);
      await asUser.mutation(api.users.updateNotificationPreferences, {
        globalNotifications: false,
      });
      
      const user = await asUser.query(api.users.getCurrentUser);
      expect(user?.preferences).toMatchObject({
        notificationPreferences: expect.objectContaining({
          globalNotifications: false,
        }),
      });
    });

    it("should update subscription reminders toggle", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.users.createUser);
      await asUser.mutation(api.users.updateNotificationPreferences, {
        subscriptionReminders: false,
      });
      
      const user = await asUser.query(api.users.getCurrentUser);
      expect(user?.preferences).toMatchObject({
        notificationPreferences: expect.objectContaining({
          subscriptionReminders: false,
        }),
      });
    });

    it("should update due date reminders toggle", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.users.createUser);
      await asUser.mutation(api.users.updateNotificationPreferences, {
        dueDateReminders: false,
      });
      
      const user = await asUser.query(api.users.getCurrentUser);
      expect(user?.preferences).toMatchObject({
        notificationPreferences: expect.objectContaining({
          dueDateReminders: false,
        }),
      });
    });

    it("should update email notifications toggle", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.users.createUser);
      await asUser.mutation(api.users.updateNotificationPreferences, {
        emailNotifications: true,
      });
      
      const user = await asUser.query(api.users.getCurrentUser);
      expect(user?.preferences).toMatchObject({
        notificationPreferences: expect.objectContaining({
          emailNotifications: true,
        }),
      });
    });

    it("should create preferences if not exists", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      // Don't call createUser first
      await asUser.mutation(api.users.updateNotificationPreferences, {
        globalNotifications: false,
      });
      
      const user = await asUser.query(api.users.getCurrentUser);
      expect(user?.preferences).toMatchObject({
        notificationPreferences: expect.objectContaining({
          globalNotifications: false,
        }),
      });
    });
  });

  describe("deleteAllUserData", () => {
    it("should throw error when not authenticated", async () => {
      const t = convexTest(schema);
      
      await expect(
        t.mutation(api.users.deleteAllUserData)
      ).rejects.toThrow("Not authenticated");
    });

    it("should delete all user data", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      // Create user and some data
      await asUser.mutation(api.users.createUser);
      
      const accountId = await asUser.mutation(api.accounts.createAccount, {
        name: "Test Account",
        type: "Bank",
        colorHex: "#10b981",
      });
      
      const outflowTypes = await asUser.query(api.outflowTypes.listOutflowTypes);
      expect(outflowTypes).not.toBeNull();
      expect(outflowTypes!.length).toBeGreaterThan(0);
      
      await asUser.mutation(api.transactions.addTransaction, {
        amount: 100,
        date: Date.now(),
        accountId,
        outflowTypeId: outflowTypes![0]._id,
        note: "Test",
        metadata: {},
      });
      
      // Delete all data
      await asUser.mutation(api.users.deleteAllUserData);
      
      // Verify data is deleted
      const accounts = await asUser.query(api.accounts.listAccounts);
      const transactions = await asUser.query(api.transactions.listTransactions, {});
      
      expect(accounts).toEqual([]);
      expect(transactions).toEqual([]);
    });
  });

  describe("seedOutflowTypes", () => {
    it("should throw error when not authenticated", async () => {
      const t = convexTest(schema);
      
      await expect(
        t.mutation(api.users.seedOutflowTypes)
      ).rejects.toThrow("Not authenticated");
    });

    it("should seed default outflow types", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.users.seedOutflowTypes);
      
      const outflowTypes = await asUser.query(api.outflowTypes.listOutflowTypes);
      
      expect(outflowTypes).not.toBeNull();
      expect(outflowTypes!.length).toBeGreaterThan(0);
      expect(outflowTypes!.some(t => t.name === "Expense")).toBe(true);
    });

    it("should not duplicate types on second call", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.users.seedOutflowTypes);
      const firstCount = (await asUser.query(api.outflowTypes.listOutflowTypes))!.length;
      
      await asUser.mutation(api.users.seedOutflowTypes);
      const secondCount = (await asUser.query(api.outflowTypes.listOutflowTypes))!.length;
      
      expect(secondCount).toBe(firstCount);
    });
  });

  describe("getAllUsers", () => {
    it("should return empty array when no users", async () => {
      const t = convexTest(schema);
      
      const users = await t.query(api.users.getAllUsers);
      
      expect(users).toEqual([]);
    });

    it("should return all users with preferences", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      await asUser1.mutation(api.users.createUser);
      await asUser2.mutation(api.users.createUser);
      
      const users = await t.query(api.users.getAllUsers);
      
      expect(users).toHaveLength(2);
      expect(users.some(u => u.clerkId === "user_1")).toBe(true);
      expect(users.some(u => u.clerkId === "user_2")).toBe(true);
    });
  });
});
