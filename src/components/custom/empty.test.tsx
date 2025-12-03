import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";

describe("Empty", () => {
  it("should render empty element", () => {
    render(<Empty data-testid="empty">Empty Content</Empty>);

    const empty = screen.getByTestId("empty");
    expect(empty).toBeInTheDocument();
  });

  it("should apply base classes", () => {
    render(<Empty data-testid="empty">Empty Content</Empty>);

    const empty = screen.getByTestId("empty");
    expect(empty).toHaveClass("flex");
    expect(empty).toHaveClass("flex-col");
    expect(empty).toHaveClass("items-center");
    expect(empty).toHaveClass("justify-center");
    expect(empty).toHaveClass("gap-6");
    expect(empty).toHaveClass("text-center");
  });

  it("should have data-slot attribute", () => {
    render(<Empty data-testid="empty">Empty Content</Empty>);

    const empty = screen.getByTestId("empty");
    expect(empty).toHaveAttribute("data-slot", "empty");
  });

  it("should accept custom className", () => {
    render(
      <Empty className="custom-empty" data-testid="empty">
        Empty Content
      </Empty>
    );

    const empty = screen.getByTestId("empty");
    expect(empty).toHaveClass("custom-empty");
  });

  it("should render children", () => {
    render(<Empty>No items found</Empty>);

    expect(screen.getByText("No items found")).toBeInTheDocument();
  });
});

describe("EmptyHeader", () => {
  it("should render empty header element", () => {
    render(<EmptyHeader data-testid="empty-header">Header</EmptyHeader>);

    const header = screen.getByTestId("empty-header");
    expect(header).toBeInTheDocument();
  });

  it("should apply base classes", () => {
    render(<EmptyHeader data-testid="empty-header">Header</EmptyHeader>);

    const header = screen.getByTestId("empty-header");
    expect(header).toHaveClass("flex");
    expect(header).toHaveClass("flex-col");
    expect(header).toHaveClass("items-center");
    expect(header).toHaveClass("gap-2");
    expect(header).toHaveClass("text-center");
  });

  it("should have data-slot attribute", () => {
    render(<EmptyHeader data-testid="empty-header">Header</EmptyHeader>);

    const header = screen.getByTestId("empty-header");
    expect(header).toHaveAttribute("data-slot", "empty-header");
  });

  it("should accept custom className", () => {
    render(
      <EmptyHeader className="custom-header" data-testid="empty-header">
        Header
      </EmptyHeader>
    );

    const header = screen.getByTestId("empty-header");
    expect(header).toHaveClass("custom-header");
  });
});

describe("EmptyMedia", () => {
  it("should render empty media element", () => {
    render(<EmptyMedia data-testid="empty-media">Icon</EmptyMedia>);

    const media = screen.getByTestId("empty-media");
    expect(media).toBeInTheDocument();
  });

  it("should apply base classes", () => {
    render(<EmptyMedia data-testid="empty-media">Icon</EmptyMedia>);

    const media = screen.getByTestId("empty-media");
    expect(media).toHaveClass("flex");
    expect(media).toHaveClass("shrink-0");
    expect(media).toHaveClass("items-center");
    expect(media).toHaveClass("justify-center");
  });

  it("should have data-slot attribute", () => {
    render(<EmptyMedia data-testid="empty-media">Icon</EmptyMedia>);

    const media = screen.getByTestId("empty-media");
    expect(media).toHaveAttribute("data-slot", "empty-icon");
  });

  it("should apply default variant", () => {
    render(<EmptyMedia data-testid="empty-media">Icon</EmptyMedia>);

    const media = screen.getByTestId("empty-media");
    expect(media).toHaveAttribute("data-variant", "default");
    expect(media).toHaveClass("bg-transparent");
  });

  it("should apply icon variant", () => {
    render(
      <EmptyMedia variant="icon" data-testid="empty-media">
        Icon
      </EmptyMedia>
    );

    const media = screen.getByTestId("empty-media");
    expect(media).toHaveAttribute("data-variant", "icon");
    expect(media).toHaveClass("bg-muted");
    expect(media).toHaveClass("rounded-lg");
  });

  it("should accept custom className", () => {
    render(
      <EmptyMedia className="custom-media" data-testid="empty-media">
        Icon
      </EmptyMedia>
    );

    const media = screen.getByTestId("empty-media");
    expect(media).toHaveClass("custom-media");
  });
});

describe("EmptyTitle", () => {
  it("should render empty title element", () => {
    render(<EmptyTitle data-testid="empty-title">No Data</EmptyTitle>);

    const title = screen.getByTestId("empty-title");
    expect(title).toBeInTheDocument();
  });

  it("should apply base classes", () => {
    render(<EmptyTitle data-testid="empty-title">No Data</EmptyTitle>);

    const title = screen.getByTestId("empty-title");
    expect(title).toHaveClass("text-lg");
    expect(title).toHaveClass("font-medium");
    expect(title).toHaveClass("tracking-tight");
  });

  it("should have data-slot attribute", () => {
    render(<EmptyTitle data-testid="empty-title">No Data</EmptyTitle>);

    const title = screen.getByTestId("empty-title");
    expect(title).toHaveAttribute("data-slot", "empty-title");
  });

  it("should render children text", () => {
    render(<EmptyTitle>No transactions found</EmptyTitle>);

    expect(screen.getByText("No transactions found")).toBeInTheDocument();
  });
});

describe("EmptyDescription", () => {
  it("should render empty description element", () => {
    render(
      <EmptyDescription data-testid="empty-description">
        Description
      </EmptyDescription>
    );

    const description = screen.getByTestId("empty-description");
    expect(description).toBeInTheDocument();
  });

  it("should apply base classes", () => {
    render(
      <EmptyDescription data-testid="empty-description">
        Description
      </EmptyDescription>
    );

    const description = screen.getByTestId("empty-description");
    expect(description).toHaveClass("text-muted-foreground");
    expect(description).toHaveClass("text-sm/relaxed");
  });

  it("should have data-slot attribute", () => {
    render(
      <EmptyDescription data-testid="empty-description">
        Description
      </EmptyDescription>
    );

    const description = screen.getByTestId("empty-description");
    expect(description).toHaveAttribute("data-slot", "empty-description");
  });

  it("should render children text", () => {
    render(
      <EmptyDescription>
        Add your first transaction to get started.
      </EmptyDescription>
    );

    expect(
      screen.getByText("Add your first transaction to get started.")
    ).toBeInTheDocument();
  });
});

describe("Empty composition", () => {
  it("should render full empty state with all subcomponents", () => {
    render(
      <Empty data-testid="empty">
        <EmptyHeader data-testid="header">
          <EmptyMedia variant="icon" data-testid="media">
            Icon
          </EmptyMedia>
          <EmptyTitle data-testid="title">No Data</EmptyTitle>
          <EmptyDescription data-testid="description">
            Description text
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );

    expect(screen.getByTestId("empty")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("media")).toBeInTheDocument();
    expect(screen.getByTestId("title")).toBeInTheDocument();
    expect(screen.getByTestId("description")).toBeInTheDocument();
  });

  it("should maintain DOM hierarchy", () => {
    render(
      <Empty data-testid="empty">
        <EmptyHeader data-testid="header">
          <EmptyTitle>No Data</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );

    const empty = screen.getByTestId("empty");
    const header = screen.getByTestId("header");

    expect(empty).toContainElement(header);
  });
});
