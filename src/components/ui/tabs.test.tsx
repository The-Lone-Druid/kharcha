import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs", () => {
  it("should render tabs element", () => {
    render(
      <Tabs defaultValue="tab1" data-testid="tabs">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );

    const tabs = screen.getByTestId("tabs");
    expect(tabs).toBeInTheDocument();
  });

  it("should apply base classes", () => {
    render(
      <Tabs defaultValue="tab1" data-testid="tabs">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const tabs = screen.getByTestId("tabs");
    expect(tabs).toHaveClass("flex");
    expect(tabs).toHaveClass("flex-col");
    expect(tabs).toHaveClass("gap-2");
  });

  it("should have data-slot attribute", () => {
    render(
      <Tabs defaultValue="tab1" data-testid="tabs">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const tabs = screen.getByTestId("tabs");
    expect(tabs).toHaveAttribute("data-slot", "tabs");
  });

  it("should accept custom className", () => {
    render(
      <Tabs defaultValue="tab1" className="custom-tabs" data-testid="tabs">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const tabs = screen.getByTestId("tabs");
    expect(tabs).toHaveClass("custom-tabs");
  });
});

describe("TabsList", () => {
  it("should render tabs list element", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const tabsList = screen.getByTestId("tabs-list");
    expect(tabsList).toBeInTheDocument();
  });

  it("should have tablist role", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const tabsList = screen.getByRole("tablist");
    expect(tabsList).toBeInTheDocument();
  });

  it("should apply base classes", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const tabsList = screen.getByTestId("tabs-list");
    expect(tabsList).toHaveClass("bg-muted");
    expect(tabsList).toHaveClass("inline-flex");
    expect(tabsList).toHaveClass("items-center");
    expect(tabsList).toHaveClass("rounded-lg");
  });

  it("should have data-slot attribute", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const tabsList = screen.getByTestId("tabs-list");
    expect(tabsList).toHaveAttribute("data-slot", "tabs-list");
  });
});

describe("TabsTrigger", () => {
  it("should render tabs trigger element", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" data-testid="tabs-trigger">
            Tab 1
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const trigger = screen.getByTestId("tabs-trigger");
    expect(trigger).toBeInTheDocument();
  });

  it("should have tab role", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const trigger = screen.getByRole("tab");
    expect(trigger).toBeInTheDocument();
  });

  it("should be active when it matches the value", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" data-testid="trigger-1">
            Tab 1
          </TabsTrigger>
          <TabsTrigger value="tab2" data-testid="trigger-2">
            Tab 2
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const trigger1 = screen.getByTestId("trigger-1");
    const trigger2 = screen.getByTestId("trigger-2");

    expect(trigger1).toHaveAttribute("data-state", "active");
    expect(trigger2).toHaveAttribute("data-state", "inactive");
  });

  it("should switch active tab on click", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" data-testid="trigger-1">
            Tab 1
          </TabsTrigger>
          <TabsTrigger value="tab2" data-testid="trigger-2">
            Tab 2
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const trigger2 = screen.getByTestId("trigger-2");
    await user.click(trigger2);

    expect(trigger2).toHaveAttribute("data-state", "active");
    expect(screen.getByTestId("trigger-1")).toHaveAttribute(
      "data-state",
      "inactive"
    );
  });

  it("should have data-slot attribute", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" data-testid="tabs-trigger">
            Tab 1
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const trigger = screen.getByTestId("tabs-trigger");
    expect(trigger).toHaveAttribute("data-slot", "tabs-trigger");
  });

  it("should be disabled when disabled prop is set", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" disabled data-testid="tabs-trigger">
            Tab 1
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const trigger = screen.getByTestId("tabs-trigger");
    expect(trigger).toBeDisabled();
  });
});

describe("TabsContent", () => {
  it("should render tabs content element", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="tabs-content">
          Content 1
        </TabsContent>
      </Tabs>
    );

    const content = screen.getByTestId("tabs-content");
    expect(content).toBeInTheDocument();
  });

  it("should have tabpanel role", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );

    const content = screen.getByRole("tabpanel");
    expect(content).toBeInTheDocument();
  });

  it("should show content when tab is active", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("should hide inactive content", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("Content 1")).toBeInTheDocument();
    expect(screen.queryByText("Content 2")).not.toBeInTheDocument();
  });

  it("should switch content when tab changes", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tab2 = screen.getByRole("tab", { name: "Tab 2" });
    await user.click(tab2);

    expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
    expect(screen.getByText("Content 2")).toBeInTheDocument();
  });

  it("should have data-slot attribute", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="tabs-content">
          Content 1
        </TabsContent>
      </Tabs>
    );

    const content = screen.getByTestId("tabs-content");
    expect(content).toHaveAttribute("data-slot", "tabs-content");
  });
});

describe("Tabs accessibility", () => {
  it("should have correct aria attributes", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList aria-label="Navigation tabs">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tabList = screen.getByRole("tablist");
    expect(tabList).toHaveAttribute("aria-label", "Navigation tabs");

    const tab1 = screen.getByRole("tab", { name: "Tab 1" });
    expect(tab1).toHaveAttribute("aria-selected", "true");

    const tab2 = screen.getByRole("tab", { name: "Tab 2" });
    expect(tab2).toHaveAttribute("aria-selected", "false");
  });

  it("should navigate tabs with keyboard", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    );

    const tab1 = screen.getByRole("tab", { name: "Tab 1" });
    tab1.focus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveFocus();
  });
});
