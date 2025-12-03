import { act, render, screen } from "@testing-library/react";
import { useContext } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, ThemeProviderContext } from "./theme-provider";

// Test component to access theme context
function TestConsumer() {
  const { theme, setTheme } = useContext(ThemeProviderContext);
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme("dark")} data-testid="set-dark">
        Dark
      </button>
      <button onClick={() => setTheme("light")} data-testid="set-light">
        Light
      </button>
      <button onClick={() => setTheme("system")} data-testid="set-system">
        System
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  let localStorageMock: Record<string, string>;
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let documentClassListMock: { add: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn((key: string) => localStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: vi.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });

    // Mock matchMedia
    matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    Object.defineProperty(window, "matchMedia", {
      value: matchMediaMock,
      writable: true,
    });

    // Mock documentElement classList
    documentClassListMock = {
      add: vi.fn(),
      remove: vi.fn(),
    };
    Object.defineProperty(document.documentElement, "classList", {
      value: documentClassListMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should render children", () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Child content</div>
        </ThemeProvider>
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("should use defaultTheme when no stored theme", () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <TestConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId("theme").textContent).toBe("dark");
    });

    it("should use stored theme over defaultTheme", () => {
      localStorageMock["vite-ui-theme"] = "light";

      render(
        <ThemeProvider defaultTheme="dark">
          <TestConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId("theme").textContent).toBe("light");
    });

    it("should use custom storageKey", () => {
      localStorageMock["custom-theme-key"] = "dark";

      render(
        <ThemeProvider storageKey="custom-theme-key" defaultTheme="light">
          <TestConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId("theme").textContent).toBe("dark");
    });
  });

  describe("theme application", () => {
    it("should apply dark theme to document", () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <TestConsumer />
        </ThemeProvider>
      );

      expect(documentClassListMock.remove).toHaveBeenCalledWith("light", "dark");
      expect(documentClassListMock.add).toHaveBeenCalledWith("dark");
    });

    it("should apply light theme to document", () => {
      render(
        <ThemeProvider defaultTheme="light">
          <TestConsumer />
        </ThemeProvider>
      );

      expect(documentClassListMock.remove).toHaveBeenCalledWith("light", "dark");
      expect(documentClassListMock.add).toHaveBeenCalledWith("light");
    });

    it("should apply system theme (light) when system prefers light", () => {
      matchMediaMock.mockReturnValue({
        matches: false, // light mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      render(
        <ThemeProvider defaultTheme="system">
          <TestConsumer />
        </ThemeProvider>
      );

      expect(documentClassListMock.add).toHaveBeenCalledWith("light");
    });

    it("should apply system theme (dark) when system prefers dark", () => {
      matchMediaMock.mockReturnValue({
        matches: true, // dark mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      render(
        <ThemeProvider defaultTheme="system">
          <TestConsumer />
        </ThemeProvider>
      );

      expect(documentClassListMock.add).toHaveBeenCalledWith("dark");
    });
  });

  describe("setTheme", () => {
    it("should update theme and localStorage when setTheme is called", () => {
      render(
        <ThemeProvider defaultTheme="light">
          <TestConsumer />
        </ThemeProvider>
      );

      act(() => {
        screen.getByTestId("set-dark").click();
      });

      expect(screen.getByTestId("theme").textContent).toBe("dark");
      expect(localStorage.setItem).toHaveBeenCalledWith("vite-ui-theme", "dark");
    });

    it("should switch from dark to light", () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <TestConsumer />
        </ThemeProvider>
      );

      act(() => {
        screen.getByTestId("set-light").click();
      });

      expect(screen.getByTestId("theme").textContent).toBe("light");
    });

    it("should switch to system theme", () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <TestConsumer />
        </ThemeProvider>
      );

      act(() => {
        screen.getByTestId("set-system").click();
      });

      expect(screen.getByTestId("theme").textContent).toBe("system");
    });

    it("should use custom storageKey when saving", () => {
      render(
        <ThemeProvider storageKey="my-theme" defaultTheme="light">
          <TestConsumer />
        </ThemeProvider>
      );

      act(() => {
        screen.getByTestId("set-dark").click();
      });

      expect(localStorage.setItem).toHaveBeenCalledWith("my-theme", "dark");
    });
  });

  describe("context default state", () => {
    it("should have initial state when no provider", () => {
      // This tests the initialState constant
      function TestWithoutProvider() {
        const { theme, setTheme } = useContext(ThemeProviderContext);
        // setTheme should be a no-op function
        setTheme("dark");
        return <span data-testid="theme">{theme}</span>;
      }

      render(<TestWithoutProvider />);

      expect(screen.getByTestId("theme").textContent).toBe("system");
    });
  });
});
