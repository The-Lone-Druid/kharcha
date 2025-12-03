import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

/**
 * ====================================
 * OUTFLOW TYPES API TESTS
 * ====================================
 * 
 * Tests for category (outflow type) operations including:
 * - Listing outflow types
 * - Creating custom outflow types
 * - Updating outflow types
 * - Deleting outflow types
 * - Authorization and validation
 */

describe("OutflowTypes API", () => {
  describe("listOutflowTypes", () => {
    it("should return null when user is not authenticated", async () => {
      const t = convexTest(schema);
      
      const types = await t.query(api.outflowTypes.listOutflowTypes);
      
      expect(types).toBeNull();
    });

    it("should return empty array for new user", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      const types = await asUser.query(api.outflowTypes.listOutflowTypes);
      
      expect(types).toEqual([]);
    });

    it("should return outflow types for authenticated user", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
        name: "Groceries",
        emoji: "🛒",
        colorHex: "#10b981",
        extraFields: [],
      });
      
      const types = await asUser.query(api.outflowTypes.listOutflowTypes);
      
      expect(types).toHaveLength(1);
      expect(types).not.toBeNull();
      expect(types![0]).toMatchObject({
        name: "Groceries",
        emoji: "🛒",
        isCustom: true,
      });
    });

    it("should not return other user's outflow types", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      await asUser1.mutation(api.outflowTypes.createCustomOutflowType, {
        name: "User1 Category",
        emoji: "📦",
        colorHex: "#10b981",
        extraFields: [],
      });
      
      const user2Types = await asUser2.query(api.outflowTypes.listOutflowTypes);
      
      expect(user2Types).toEqual([]);
    });
  });

  describe("createCustomOutflowType", () => {
    it("should throw error when user is not authenticated", async () => {
      const t = convexTest(schema);
      
      await expect(
        t.mutation(api.outflowTypes.createCustomOutflowType, {
          name: "Test",
          emoji: "📦",
          colorHex: "#000000",
          extraFields: [],
        })
      ).rejects.toThrow("Unauthenticated");
    });

    it("should create custom outflow type with correct data", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      const typeId = await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
        name: "Subscriptions",
        emoji: "🔄",
        colorHex: "#3b82f6",
        extraFields: [
          { key: "provider", label: "Provider", type: "text" },
          { key: "renewalDate", label: "Renewal Date", type: "date" },
        ],
      });
      
      expect(typeId).toBeDefined();
      
      const types = await asUser.query(api.outflowTypes.listOutflowTypes);
      expect(types).not.toBeNull();
      expect(types![0]).toMatchObject({
        _id: typeId,
        name: "Subscriptions",
        emoji: "🔄",
        colorHex: "#3b82f6",
        isCustom: true,
        extraFields: [
          { key: "provider", label: "Provider", type: "text" },
          { key: "renewalDate", label: "Renewal Date", type: "date" },
        ],
      });
    });

    it("should not allow duplicate names for same user", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
        name: "Groceries",
        emoji: "🛒",
        colorHex: "#10b981",
        extraFields: [],
      });
      
      await expect(
        asUser.mutation(api.outflowTypes.createCustomOutflowType, {
          name: "Groceries",
          emoji: "🍎",
          colorHex: "#ef4444",
          extraFields: [],
        })
      ).rejects.toThrow("already exists");
    });

    it("should allow same name for different users", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      await asUser1.mutation(api.outflowTypes.createCustomOutflowType, {
        name: "Groceries",
        emoji: "🛒",
        colorHex: "#10b981",
        extraFields: [],
      });
      
      // Should not throw
      const typeId = await asUser2.mutation(api.outflowTypes.createCustomOutflowType, {
        name: "Groceries",
        emoji: "🍎",
        colorHex: "#ef4444",
        extraFields: [],
      });
      
      expect(typeId).toBeDefined();
    });

    it("should support all extra field types", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      const typeId = await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
        name: "Complete Type",
        emoji: "✅",
        colorHex: "#10b981",
        extraFields: [
          { key: "textField", label: "Text Field", type: "text" },
          { key: "numberField", label: "Number Field", type: "number" },
          { key: "dateField", label: "Date Field", type: "date" },
          { key: "toggleField", label: "Toggle Field", type: "toggle" },
        ],
      });
      
      const types = await asUser.query(api.outflowTypes.listOutflowTypes);
      expect(types).not.toBeNull();
      expect(types![0].extraFields).toHaveLength(4);
    });
  });

  describe("updateOutflowType", () => {
    it("should update outflow type name", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      const typeId = await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
        name: "Original",
        emoji: "📦",
        colorHex: "#10b981",
        extraFields: [],
      });
      
      await asUser.mutation(api.outflowTypes.updateOutflowType, {
        id: typeId,
        name: "Updated",
      });
      
      const types = await asUser.query(api.outflowTypes.listOutflowTypes);
      expect(types).not.toBeNull();
      expect(types![0].name).toBe("Updated");
    });

    it("should update emoji and color", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      const typeId = await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
        name: "Test",
        emoji: "📦",
        colorHex: "#10b981",
        extraFields: [],
      });
      
      await asUser.mutation(api.outflowTypes.updateOutflowType, {
        id: typeId,
        emoji: "🎉",
        colorHex: "#ef4444",
      });
      
      const types = await asUser.query(api.outflowTypes.listOutflowTypes);
      expect(types).not.toBeNull();
      expect(types![0]).toMatchObject({
        emoji: "🎉",
        colorHex: "#ef4444",
      });
    });

    it("should not update other user's outflow type", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      const typeId = await asUser1.mutation(api.outflowTypes.createCustomOutflowType, {
        name: "User1 Type",
        emoji: "📦",
        colorHex: "#10b981",
        extraFields: [],
      });
      
      await expect(
        asUser2.mutation(api.outflowTypes.updateOutflowType, {
          id: typeId,
          name: "Hacked",
        })
      ).rejects.toThrow();
    });
  });

  describe("deleteOutflowType", () => {
    it("should delete outflow type", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      const typeId = await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
        name: "To Delete",
        emoji: "🗑️",
        colorHex: "#ef4444",
        extraFields: [],
      });
      
      await asUser.mutation(api.outflowTypes.deleteOutflowType, { id: typeId });
      
      const types = await asUser.query(api.outflowTypes.listOutflowTypes);
      expect(types).toEqual([]);
    });

    it("should not delete other user's outflow type", async () => {
      const t = convexTest(schema);
      const asUser1 = t.withIdentity({ subject: "user_1" });
      const asUser2 = t.withIdentity({ subject: "user_2" });
      
      const typeId = await asUser1.mutation(api.outflowTypes.createCustomOutflowType, {
        name: "User1 Type",
        emoji: "📦",
        colorHex: "#10b981",
        extraFields: [],
      });
      
      await expect(
        asUser2.mutation(api.outflowTypes.deleteOutflowType, { id: typeId })
      ).rejects.toThrow();
    });
  });

  describe("getOutflowType", () => {
    it("should get outflow type by id", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({ subject: "user_123" });
      
      const typeId = await asUser.mutation(api.outflowTypes.createCustomOutflowType, {
        name: "Test Type",
        emoji: "✅",
        colorHex: "#10b981",
        extraFields: [],
      });
      
      const type = await asUser.query(api.outflowTypes.getOutflowType, { id: typeId });
      
      expect(type).toMatchObject({
        _id: typeId,
        name: "Test Type",
        emoji: "✅",
      });
    });
  });
});
