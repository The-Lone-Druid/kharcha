import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Skeleton } from "./skeleton";
import React from "react";

describe("Skeleton", () => {
  it("should render skeleton element", () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.tagName).toBe("DIV");
  });

  it("should apply base classes", () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("bg-accent");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded-md");
  });

  it("should accept custom className", () => {
    render(<Skeleton className="w-full h-10" data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("w-full");
    expect(skeleton).toHaveClass("h-10");
  });

  it("should have data-slot attribute", () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveAttribute("data-slot", "skeleton");
  });

  it("should render children", () => {
    render(
      <Skeleton data-testid="skeleton">
        <span>Loading...</span>
      </Skeleton>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should accept other HTML attributes", () => {
    render(
      <Skeleton
        id="my-skeleton"
        aria-label="Loading content"
        data-testid="skeleton"
      />
    );

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveAttribute("id", "my-skeleton");
    expect(skeleton).toHaveAttribute("aria-label", "Loading content");
  });

  it("should forward ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} data-testid="skeleton" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("should apply custom dimensions", () => {
    render(
      <Skeleton
        className="h-4 w-[250px]"
        data-testid="skeleton"
      />
    );

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("h-4");
  });

  it("should support multiple skeletons", () => {
    render(
      <div>
        <Skeleton data-testid="skeleton-1" className="h-4 w-full" />
        <Skeleton data-testid="skeleton-2" className="h-4 w-3/4" />
        <Skeleton data-testid="skeleton-3" className="h-4 w-1/2" />
      </div>
    );

    expect(screen.getByTestId("skeleton-1")).toBeInTheDocument();
    expect(screen.getByTestId("skeleton-2")).toBeInTheDocument();
    expect(screen.getByTestId("skeleton-3")).toBeInTheDocument();
  });
});
