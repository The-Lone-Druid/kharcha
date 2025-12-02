import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { Button } from "./button";

/**
 * ====================================
 * TESTING GUIDE - REACT COMPONENTS
 * ====================================
 * 
 * This file shows patterns for testing React components:
 * - Rendering components
 * - Finding elements
 * - Testing user interactions
 * - Testing props and variants
 */

describe("Button Component", () => {
  /**
   * Basic Rendering Tests
   * 
   * Pattern: Ensure the component renders without crashing
   */
  describe("rendering", () => {
    it("should render a button element", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole("button", { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it("should render children correctly", () => {
      render(<Button>Test Button</Button>);

      expect(screen.getByText("Test Button")).toBeInTheDocument();
    });

    it("should render with an icon", () => {
      render(
        <Button>
          <span data-testid="icon">🎉</span>
          With Icon
        </Button>
      );

      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByText("With Icon")).toBeInTheDocument();
    });
  });

  /**
   * Variant Tests
   * 
   * Pattern: Test different visual variants
   */
  describe("variants", () => {
    it("should apply default variant classes", () => {
      render(<Button>Default</Button>);

      const button = screen.getByRole("button");
      // Check for presence of expected class patterns
      expect(button).toHaveClass("bg-primary");
    });

    it("should apply destructive variant classes", () => {
      render(<Button variant="destructive">Delete</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-destructive");
    });

    it("should apply outline variant classes", () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("border");
    });

    it("should apply ghost variant classes", () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-accent");
    });
  });

  /**
   * Size Tests
   * 
   * Pattern: Test different size variants
   */
  describe("sizes", () => {
    it("should apply default size classes", () => {
      render(<Button>Default Size</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-9");
    });

    it("should apply small size classes", () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-8");
    });

    it("should apply large size classes", () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-10");
    });

    it("should apply icon size classes", () => {
      render(<Button size="icon">🎯</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("size-9");
    });
  });

  /**
   * Props Tests
   * 
   * Pattern: Test that props are passed correctly
   */
  describe("props", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should have correct type attribute", () => {
      render(<Button type="submit">Submit</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
    });

    it("should apply custom className", () => {
      render(<Button className="custom-class">Custom</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("should pass through other HTML attributes", () => {
      render(<Button data-testid="test-button" aria-label="Test">Test</Button>);

      const button = screen.getByTestId("test-button");
      expect(button).toHaveAttribute("aria-label", "Test");
    });
  });

  /**
   * Interaction Tests
   * 
   * Pattern: Test user interactions
   */
  describe("interactions", () => {
    it("should call onClick when clicked", async () => {
      const handleClick = vi.fn();
      const { user } = render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", async () => {
      const handleClick = vi.fn();
      const { user } = render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should be focusable", async () => {
      const { user } = render(<Button>Focusable</Button>);

      const button = screen.getByRole("button");
      await user.tab();

      expect(button).toHaveFocus();
    });
  });

  /**
   * Accessibility Tests
   * 
   * Pattern: Ensure component is accessible
   */
  describe("accessibility", () => {
    it("should have correct role", () => {
      render(<Button>Accessible Button</Button>);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should support aria-label", () => {
      render(<Button aria-label="Close dialog">×</Button>);

      expect(screen.getByLabelText("Close dialog")).toBeInTheDocument();
    });

    it("should indicate disabled state to assistive technology", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("disabled");
    });
  });
});
