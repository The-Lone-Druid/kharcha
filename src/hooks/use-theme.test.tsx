import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "../components/theme-provider";
import { useTheme } from "./use-theme";

// Wrapper component for testing useTheme hook
const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
);

describe("useTheme", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document class
    document.documentElement.classList.remove("light", "dark");
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should return theme context values", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current).toHaveProperty("theme");
    expect(result.current).toHaveProperty("setTheme");
    expect(typeof result.current.setTheme).toBe("function");
  });

  it("should use default theme when no stored theme exists", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("light");
  });

  it("should allow changing theme to dark", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
  });

  it("should allow changing theme to light", () => {
    const darkWrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper: darkWrapper });

    act(() => {
      result.current.setTheme("light");
    });

    expect(result.current.theme).toBe("light");
  });

  it("should allow setting theme to system", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme("system");
    });

    expect(result.current.theme).toBe("system");
  });

  it("should persist theme to localStorage", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme("dark");
    });

    expect(localStorage.getItem("vite-ui-theme")).toBe("dark");
  });

  it("should return initial state when used outside of ThemeProvider", () => {
    // When used outside of provider, it returns the initial context value
    const { result } = renderHook(() => useTheme());

    // The initial state has theme: "system" and a no-op setTheme
    expect(result.current.theme).toBe("system");
    expect(typeof result.current.setTheme).toBe("function");
  });
});

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should render children", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      ),
    });

    expect(result.current.theme).toBeDefined();
  });

  it("should use stored theme from localStorage", () => {
    localStorage.setItem("vite-ui-theme", "dark");

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("dark");
  });

  it("should support custom storage key", () => {
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light" storageKey="custom-theme-key">
        {children}
      </ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper: customWrapper });

    act(() => {
      result.current.setTheme("dark");
    });

    expect(localStorage.getItem("custom-theme-key")).toBe("dark");
  });

  it("should apply light class to document for light theme", () => {
    renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      ),
    });

    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("should apply dark class to document for dark theme", () => {
    renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
      ),
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
