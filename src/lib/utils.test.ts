import { describe, it, expect } from "vitest";
import { cn } from "./utils";

/**
 * ====================================
 * TESTING GUIDE - UTILITY FUNCTIONS
 * ====================================
 * 
 * This file demonstrates how to test pure utility functions.
 * These are the easiest to test because they have:
 * - No side effects
 * - Clear inputs and outputs
 * - No external dependencies
 */

describe("cn (className utility)", () => {
  /**
   * Basic Test Structure:
   * 
   * describe() - Groups related tests together
   * it() or test() - Defines a single test case
   * expect() - Makes assertions about the result
   */

  it("should merge simple class names", () => {
    // Arrange - set up the inputs
    const result = cn("text-red-500", "bg-blue-500");
    
    // Assert - check the output
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("should handle conditional classes", () => {
    // The cn function accepts conditional values
    const isActive = true;
    const isDisabled = false;

    const result = cn(
      "base-class",
      isActive && "active-class",
      isDisabled && "disabled-class"
    );

    expect(result).toBe("base-class active-class");
    expect(result).not.toContain("disabled-class");
  });

  it("should merge conflicting Tailwind classes (last one wins)", () => {
    // tailwind-merge handles conflicting classes
    const result = cn("p-4", "p-8");
    
    expect(result).toBe("p-8");
  });

  it("should handle undefined and null values", () => {
    const result = cn("base", undefined, null, "end");
    
    expect(result).toBe("base end");
  });

  it("should handle empty strings", () => {
    const result = cn("", "valid-class", "");
    
    expect(result).toBe("valid-class");
  });

  it("should handle arrays of classes", () => {
    const result = cn(["class1", "class2"], "class3");
    
    expect(result).toContain("class1");
    expect(result).toContain("class2");
    expect(result).toContain("class3");
  });

  it("should handle objects with boolean values", () => {
    const result = cn({
      "active-class": true,
      "inactive-class": false,
    });

    expect(result).toBe("active-class");
  });
});
