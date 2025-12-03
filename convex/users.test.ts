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

    it("should create default accounts", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.users.createUser);
      
      const accounts = await asUser.query(api.accounts.listAccounts);
      
      // Should have default accounts
      expect(accounts).not.toBeNull();
      expect(accounts!.length).toBeGreaterThan(0);
      expect(accounts!.some(a => a.name === "Cash")).toBe(true);
    });

    it("should not duplicate data on second call", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      // Call twice
      await asUser.mutation(api.users.createUser);
      await asUser.mutation(api.users.createUser);
      
      const accounts = await asUser.query(api.accounts.listAccounts);
      const outflowTypes = await asUser.query(api.outflowTypes.listOutflowTypes);
      
      // Count should remain the same
      expect(accounts).not.toBeNull();
      expect(outflowTypes).not.toBeNull();
      const expectedAccounts = accounts!.length;
      const expectedTypes = outflowTypes!.length;
      
      // Third call
      await asUser.mutation(api.users.createUser);
      
      const accounts2 = await asUser.query(api.accounts.listAccounts);
      const outflowTypes2 = await asUser.query(api.outflowTypes.listOutflowTypes);
      
      expect(accounts2).not.toBeNull();
      expect(outflowTypes2).not.toBeNull();
      expect(accounts2!.length).toBe(expectedAccounts);
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
  });
});
