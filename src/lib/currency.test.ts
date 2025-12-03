import { describe, it, expect } from "vitest";
import {
  getCurrencyByCode,
  getExchangeRateLookupUrl,
  calculateConvertedAmount,
  CURRENCIES,
} from "./currency";

/**
 * ====================================
 * TESTING GUIDE - MORE UTILITY FUNCTIONS
 * ====================================
 *
 * This file shows testing patterns for:
 * - Functions that return objects
 * - Functions that work with arrays
 * - Edge cases and boundary testing
 */

describe("Currency Utilities", () => {
  /**
   * Testing getCurrencyByCode
   *
   * Pattern: Testing functions that search/filter data
   */
  describe("getCurrencyByCode", () => {
    it("should return currency info for valid code", () => {
      const result = getCurrencyByCode("USD");

      // Test object properties individually
      expect(result).toBeDefined();
      expect(result?.code).toBe("USD");
      expect(result?.name).toBe("US Dollar");
      expect(result?.symbol).toBe("$");
    });

    it("should return INR currency correctly", () => {
      const result = getCurrencyByCode("INR");

      // Using toMatchObject for partial matching
      expect(result).toMatchObject({
        code: "INR",
        name: "Indian Rupee",
        symbol: "₹",
      });
    });

    it("should return undefined for invalid currency code", () => {
      const result = getCurrencyByCode("INVALID");

      expect(result).toBeUndefined();
    });

    it("should be case-sensitive", () => {
      // Currency codes are uppercase
      const lowercase = getCurrencyByCode("usd");
      const uppercase = getCurrencyByCode("USD");

      expect(lowercase).toBeUndefined();
      expect(uppercase).toBeDefined();
    });
  });

  /**
   * Testing getExchangeRateLookupUrl
   *
   * Pattern: Testing string formatting functions
   */
  describe("getExchangeRateLookupUrl", () => {
    it("should generate correct Google search URL", () => {
      const result = getExchangeRateLookupUrl("USD", "INR");

      expect(result).toBe("https://www.google.com/search?q=1+USD+to+INR");
    });

    it("should work with any currency pair", () => {
      const result = getExchangeRateLookupUrl("EUR", "GBP");

      expect(result).toContain("EUR");
      expect(result).toContain("GBP");
      expect(result).toContain("google.com");
    });
  });

  /**
   * Testing calculateConvertedAmount
   *
   * Pattern: Testing mathematical functions with precision
   */
  describe("calculateConvertedAmount", () => {
    it("should calculate converted amount correctly", () => {
      // 100 USD * 83.5 INR/USD = 8350 INR
      const result = calculateConvertedAmount(100, 83.5);

      expect(result).toBe(8350);
    });

    it("should round to 2 decimal places", () => {
      // Testing floating point precision
      const result = calculateConvertedAmount(100, 1.333);

      expect(result).toBe(133.3);
    });

    it("should handle zero amount", () => {
      const result = calculateConvertedAmount(0, 83.5);

      expect(result).toBe(0);
    });

    it("should handle zero exchange rate", () => {
      const result = calculateConvertedAmount(100, 0);

      expect(result).toBe(0);
    });

    it("should handle small amounts", () => {
      const result = calculateConvertedAmount(0.01, 83.5);

      expect(result).toBe(0.84);
    });

    it("should handle large amounts", () => {
      const result = calculateConvertedAmount(1000000, 83.5);

      expect(result).toBe(83500000);
    });
  });

  /**
   * Testing CURRENCIES array
   *
   * Pattern: Testing data structures and constants
   */
  describe("CURRENCIES array", () => {
    it("should contain major world currencies", () => {
      const majorCodes = ["USD", "EUR", "GBP", "JPY", "INR"];

      majorCodes.forEach((code) => {
        const found = CURRENCIES.find((c) => c.code === code);
        expect(found).toBeDefined();
      });
    });

    it("should have unique currency codes", () => {
      const codes = CURRENCIES.map((c) => c.code);
      const uniqueCodes = new Set(codes);

      expect(codes.length).toBe(uniqueCodes.size);
    });

    it("all currencies should have required properties", () => {
      CURRENCIES.forEach((currency) => {
        expect(currency).toHaveProperty("code");
        expect(currency).toHaveProperty("name");
        expect(currency).toHaveProperty("symbol");

        // Check they're not empty
        expect(currency.code.length).toBeGreaterThan(0);
        expect(currency.name.length).toBeGreaterThan(0);
        expect(currency.symbol.length).toBeGreaterThan(0);
      });
    });

    it("currency codes should be 3 characters", () => {
      CURRENCIES.forEach((currency) => {
        expect(currency.code).toHaveLength(3);
      });
    });
  });
});
