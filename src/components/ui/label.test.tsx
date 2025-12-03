import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "./label";

describe("Label", () => {
  it("should render label element", () => {
    render(<Label data-testid="label">Label Text</Label>);

    const label = screen.getByTestId("label");
    expect(label).toBeInTheDocument();
  });

  it("should render children content", () => {
    render(<Label>Email Address</Label>);

    expect(screen.getByText("Email Address")).toBeInTheDocument();
  });

  it("should apply base classes", () => {
    render(<Label data-testid="label">Label</Label>);

    const label = screen.getByTestId("label");
    expect(label).toHaveClass("flex");
    expect(label).toHaveClass("items-center");
    expect(label).toHaveClass("gap-2");
    expect(label).toHaveClass("text-sm");
    expect(label).toHaveClass("font-medium");
  });

  it("should accept custom className", () => {
    render(
      <Label className="custom-label" data-testid="label">
        Label
      </Label>
    );

    const label = screen.getByTestId("label");
    expect(label).toHaveClass("custom-label");
  });

  it("should have data-slot attribute", () => {
    render(<Label data-testid="label">Label</Label>);

    const label = screen.getByTestId("label");
    expect(label).toHaveAttribute("data-slot", "label");
  });

  it("should forward htmlFor prop", () => {
    render(
      <Label htmlFor="input-id" data-testid="label">
        Label
      </Label>
    );

    const label = screen.getByTestId("label");
    expect(label).toHaveAttribute("for", "input-id");
  });

  it("should support complex children", () => {
    render(
      <Label data-testid="label">
        <span>Required</span>
        <span>*</span>
      </Label>
    );

    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("should accept other HTML attributes", () => {
    render(
      <Label id="my-label" aria-describedby="helper" data-testid="label">
        Label
      </Label>
    );

    const label = screen.getByTestId("label");
    expect(label).toHaveAttribute("id", "my-label");
    expect(label).toHaveAttribute("aria-describedby", "helper");
  });

  it("should work with associated input", () => {
    render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" data-testid="input" />
      </div>
    );

    const label = screen.getByText("Test Label");
    expect(label).toHaveAttribute("for", "test-input");
  });
});
