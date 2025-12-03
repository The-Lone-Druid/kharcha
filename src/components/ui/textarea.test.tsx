import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Textarea } from "./textarea";
import React from "react";

describe("Textarea", () => {
  it("should render textarea element", () => {
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("should apply base classes", () => {
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveClass("flex");
    expect(textarea).toHaveClass("w-full");
    expect(textarea).toHaveClass("rounded-md");
    expect(textarea).toHaveClass("border");
    expect(textarea).toHaveClass("min-h-16");
  });

  it("should accept custom className", () => {
    render(<Textarea className="custom-textarea" data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveClass("custom-textarea");
  });

  it("should have data-slot attribute", () => {
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("data-slot", "textarea");
  });

  it("should accept placeholder prop", () => {
    render(<Textarea placeholder="Enter description" data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("placeholder", "Enter description");
  });

  it("should accept disabled prop", () => {
    render(<Textarea disabled data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass("disabled:cursor-not-allowed");
    expect(textarea).toHaveClass("disabled:opacity-50");
  });

  it("should handle value changes", async () => {
    const user = userEvent.setup();
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    await user.type(textarea, "Hello World");

    expect(textarea).toHaveValue("Hello World");
  });

  it("should call onChange handler", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    await user.type(textarea, "a");

    expect(handleChange).toHaveBeenCalled();
  });

  it("should accept value prop for controlled input", () => {
    render(
      <Textarea value="controlled value" readOnly data-testid="textarea" />
    );

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveValue("controlled value");
  });

  it("should accept defaultValue prop", () => {
    render(<Textarea defaultValue="default text" data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveValue("default text");
  });

  it("should forward ref correctly", () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} data-testid="textarea" />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("should accept name prop", () => {
    render(<Textarea name="description" data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("name", "description");
  });

  it("should accept id prop", () => {
    render(<Textarea id="my-textarea" data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("id", "my-textarea");
  });

  it("should accept required prop", () => {
    render(<Textarea required data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toBeRequired();
  });

  it("should handle focus and blur", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <>
        <Textarea onFocus={onFocus} onBlur={onBlur} data-testid="textarea" />
        <button>Other element</button>
      </>
    );

    const textarea = screen.getByTestId("textarea");
    await user.click(textarea);
    expect(onFocus).toHaveBeenCalled();

    await user.click(screen.getByRole("button"));
    expect(onBlur).toHaveBeenCalled();
  });

  it("should accept rows prop", () => {
    render(<Textarea rows={5} data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("rows", "5");
  });

  it("should accept cols prop", () => {
    render(<Textarea cols={30} data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("cols", "30");
  });

  it("should accept maxLength prop", () => {
    render(<Textarea maxLength={500} data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("maxLength", "500");
  });

  it("should accept minLength prop", () => {
    render(<Textarea minLength={10} data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("minLength", "10");
  });

  it("should accept aria attributes", () => {
    render(
      <Textarea
        aria-label="Description"
        aria-describedby="desc-helper"
        data-testid="textarea"
      />
    );

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("aria-label", "Description");
    expect(textarea).toHaveAttribute("aria-describedby", "desc-helper");
  });

  it("should handle multi-line text", async () => {
    const user = userEvent.setup();
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    await user.type(textarea, "Line 1{enter}Line 2{enter}Line 3");

    expect(textarea).toHaveValue("Line 1\nLine 2\nLine 3");
  });
});
