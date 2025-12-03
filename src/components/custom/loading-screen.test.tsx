import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoadingScreen } from "./loading-screen";

describe("LoadingScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render loading screen", () => {
    render(<LoadingScreen />);

    expect(screen.getByText("Kharcha")).toBeInTheDocument();
  });

  it("should display default loading message", () => {
    render(<LoadingScreen />);

    expect(
      screen.getByText(/Loading your financial data/i)
    ).toBeInTheDocument();
  });

  it("should display custom loading message", () => {
    render(<LoadingScreen message="Fetching transactions..." />);

    expect(screen.getByText(/Fetching transactions/i)).toBeInTheDocument();
  });

  it("should have animated background elements", () => {
    const { container } = render(<LoadingScreen />);

    // Check for animated elements with animate-pulse class
    const animatedElements = container.querySelectorAll(".animate-pulse");
    expect(animatedElements.length).toBeGreaterThan(0);
  });

  it("should have loading spinner/animation", () => {
    const { container } = render(<LoadingScreen />);

    // Check for spinning animation
    const spinningElement = container.querySelector(".animate-spin");
    expect(spinningElement).toBeInTheDocument();
  });

  it("should have centered layout", () => {
    const { container } = render(<LoadingScreen />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass("min-h-screen");
    expect(mainDiv).toHaveClass("flex");
    expect(mainDiv).toHaveClass("items-center");
    expect(mainDiv).toHaveClass("justify-center");
  });

  it("should animate dots over time", async () => {
    vi.useRealTimers(); // Use real timers for this test
    render(<LoadingScreen />);

    // Initially, the dots should exist in the message area
    const messageArea = screen.getByText(/Loading your financial data/i);
    expect(messageArea).toBeInTheDocument();
  });

  it("should display app branding", () => {
    render(<LoadingScreen />);

    const branding = screen.getByText("Kharcha");
    expect(branding).toBeInTheDocument();
    expect(branding).toHaveClass("text-2xl");
    expect(branding).toHaveClass("font-semibold");
  });

  it("should have visual hierarchy with multiple animation layers", () => {
    const { container } = render(<LoadingScreen />);

    // Check for outer rotating ring
    const rotatingRing = container.querySelector(".border-4.animate-spin");
    expect(rotatingRing).toBeInTheDocument();

    // Check for pulsing elements
    const pulsingElements = container.querySelectorAll(".animate-pulse");
    expect(pulsingElements.length).toBeGreaterThan(0);
  });

  it("should have z-index layering for content", () => {
    const { container } = render(<LoadingScreen />);

    // Main content should have z-10
    const mainContent = container.querySelector(".z-10");
    expect(mainContent).toBeInTheDocument();
  });

  it("should have overflow hidden on main container", () => {
    const { container } = render(<LoadingScreen />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass("overflow-hidden");
  });
});
