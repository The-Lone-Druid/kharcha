import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

/**
 * ====================================
 * NOTIFICATIONS API TESTS
 * ====================================
 * 
 * Tests for notification operations including:
 * - Creating notifications
 * - Listing notifications
 * - Marking as read
 * - Deleting notifications
 */

describe("Notifications API", () => {
  // Helper to create required dependencies
  async function setupTestData(asUser: ReturnType<ReturnType<typeof convexTest>["withIdentity"]>) {
    const accountId = await asUser.mutation(api.accounts.createAccount, {
      name: "Test Account",
      type: "Bank",
      colorHex: "#10b981",
    });

    const outflowTypeId = await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
      name: "Subscription",
      emoji: "🔄",
      colorHex: "#3b82f6",
      extraFields: [],
    });

    const transactionId = await asUser.mutation(api.transactions.addTransaction, {
      amount: 999,
      date: Date.now(),
      accountId,
      outflowTypeId,
      note: "Netflix subscription",
      metadata: {},
    });

    return { accountId, outflowTypeId, transactionId };
  }

  describe("listNotifications", () => {
    it("should return null when not authenticated", async () => {
      const t = convexTest(schema);
      
      const notifications = await t.query(api.notifications.listNotifications);
      
      expect(notifications).toBeNull();
    });

    it("should return empty array for new user", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      const notifications = await asUser.query(api.notifications.listNotifications);
      
      expect(notifications).toEqual([]);
    });

    it("should return notifications for authenticated user", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { transactionId } = await setupTestData(asUser);
      
      await asUser.mutation(api.notifications.createNotification, {
        type: "renewal",
        transactionId,
        message: "Netflix subscription renews tomorrow",
      });
      
      const notifications = await asUser.query(api.notifications.listNotifications);
      
      expect(notifications).toHaveLength(1);
      expect(notifications).not.toBeNull();
      expect(notifications![0]).toMatchObject({
        type: "renewal",
        message: "Netflix subscription renews tomorrow",
        isRead: false,
      });
    });

    it("should return notifications in descending order", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { transactionId } = await setupTestData(asUser);
      
      await asUser.mutation(api.notifications.createNotification, {
        type: "renewal",
        transactionId,
        message: "First notification",
      });
      
      await asUser.mutation(api.notifications.createNotification, {
        type: "due",
        transactionId,
        message: "Second notification",
      });
      
      const notifications = await asUser.query(api.notifications.listNotifications);
      
      expect(notifications).toHaveLength(2);
      // Most recent should be first
      expect(notifications).not.toBeNull();
      expect(notifications![0].message).toBe("Second notification");
      expect(notifications![1].message).toBe("First notification");
    });

    it("should limit to 50 notifications", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { transactionId } = await setupTestData(asUser);
      
      // Create 60 notifications
      for (let i = 0; i < 60; i++) {
        await asUser.mutation(api.notifications.createNotification, {
          type: "renewal",
          transactionId,
          message: `Notification ${i}`,
        });
      }
      
      const notifications = await asUser.query(api.notifications.listNotifications);
      
      expect(notifications).toHaveLength(50);
    });

    it("should not return other user's notifications", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      const { transactionId } = await setupTestData(asUser1);
      
      await asUser1.mutation(api.notifications.createNotification, {
        type: "renewal",
        transactionId,
        message: "User1's notification",
      });
      
      const user2Notifications = await asUser2.query(api.notifications.listNotifications);
      
      expect(user2Notifications).toEqual([]);
    });
  });

  describe("createNotification", () => {
    it("should throw error when not authenticated", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { transactionId } = await setupTestData(asUser);
      
      const noAuth = convexTest(schema);
      await expect(
        noAuth.mutation(api.notifications.createNotification, {
          type: "renewal",
          transactionId,
          message: "Test",
        })
      ).rejects.toThrow("Unauthenticated");
    });

    it("should create renewal notification", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { transactionId } = await setupTestData(asUser);
      
      const notificationId = await asUser.mutation(api.notifications.createNotification, {
        type: "renewal",
        transactionId,
        message: "Subscription renews soon",
      });
      
      expect(notificationId).toBeDefined();
      
      const notifications = await asUser.query(api.notifications.listNotifications);
      expect(notifications).not.toBeNull();
      expect(notifications![0]).toMatchObject({
        _id: notificationId,
        type: "renewal",
        message: "Subscription renews soon",
        isRead: false,
      });
      expect(notifications![0].createdAt).toBeDefined();
    });

    it("should create due notification", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { transactionId } = await setupTestData(asUser);
      
      const notificationId = await asUser.mutation(api.notifications.createNotification, {
        type: "due",
        transactionId,
        message: "Money lent is due",
      });
      
      const notifications = await asUser.query(api.notifications.listNotifications);
      expect(notifications).not.toBeNull();
      expect(notifications![0]).toMatchObject({
        type: "due",
        message: "Money lent is due",
      });
    });
  });

  describe("markAsRead", () => {
    it("should mark notification as read", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { transactionId } = await setupTestData(asUser);
      
      const notificationId = await asUser.mutation(api.notifications.createNotification, {
        type: "renewal",
        transactionId,
        message: "Test",
      });
      
      // Verify unread
      let notifications = await asUser.query(api.notifications.listNotifications);
      expect(notifications).not.toBeNull();
      expect(notifications![0].isRead).toBe(false);
      
      // Mark as read
      await asUser.mutation(api.notifications.markAsRead, { id: notificationId });
      
      // Verify read
      notifications = await asUser.query(api.notifications.listNotifications);
      expect(notifications).not.toBeNull();
      expect(notifications![0].isRead).toBe(true);
    });

    it("should not mark other user's notification as read", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      const { transactionId } = await setupTestData(asUser1);
      
      const notificationId = await asUser1.mutation(api.notifications.createNotification, {
        type: "renewal",
        transactionId,
        message: "User1's notification",
      });
      
      await expect(
        asUser2.mutation(api.notifications.markAsRead, { id: notificationId })
      ).rejects.toThrow();
    });
  });

  describe("deleteNotification", () => {
    it("should delete notification", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      const { transactionId } = await setupTestData(asUser);
      
      const notificationId = await asUser.mutation(api.notifications.createNotification, {
        type: "renewal",
        transactionId,
        message: "To delete",
      });
      
      await asUser.mutation(api.notifications.deleteNotification, { id: notificationId });
      
      const notifications = await asUser.query(api.notifications.listNotifications);
      expect(notifications).toEqual([]);
    });

    it("should not delete other user's notification", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      const { transactionId } = await setupTestData(asUser1);
      
      const notificationId = await asUser1.mutation(api.notifications.createNotification, {
        type: "renewal",
        transactionId,
        message: "User1's notification",
      });
      
      await expect(
        asUser2.mutation(api.notifications.deleteNotification, { id: notificationId })
      ).rejects.toThrow();
    });
  });
});
