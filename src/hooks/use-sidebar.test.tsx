import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { SidebarContext, useSidebar } from "./use-sidebar";

describe("useSidebar", () => {
  describe("when used outside SidebarProvider", () => {
    it("should throw an error", () => {
      // Suppress console.error for this test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useSidebar());
      }).toThrow("useSidebar must be used within a SidebarProvider.");

      consoleSpy.mockRestore();
    });
  });

  describe("when used inside SidebarProvider", () => {
    const mockContextValue = {
      state: "expanded" as const,
      open: true,
      setOpen: vi.fn(),
      openMobile: false,
      setOpenMobile: vi.fn(),
      isMobile: false,
      toggleSidebar: vi.fn(),
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SidebarContext.Provider value={mockContextValue}>
        {children}
      </SidebarContext.Provider>
    );

    it("should return context values", () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(result.current.state).toBe("expanded");
      expect(result.current.open).toBe(true);
      expect(result.current.openMobile).toBe(false);
      expect(result.current.isMobile).toBe(false);
      expect(typeof result.current.setOpen).toBe("function");
      expect(typeof result.current.setOpenMobile).toBe("function");
      expect(typeof result.current.toggleSidebar).toBe("function");
    });

    it("should return collapsed state", () => {
      const collapsedContext = {
        ...mockContextValue,
        state: "collapsed" as const,
        open: false,
      };

      const collapsedWrapper = ({ children }: { children: ReactNode }) => (
        <SidebarContext.Provider value={collapsedContext}>
          {children}
        </SidebarContext.Provider>
      );

      const { result } = renderHook(() => useSidebar(), {
        wrapper: collapsedWrapper,
      });

      expect(result.current.state).toBe("collapsed");
      expect(result.current.open).toBe(false);
    });

    it("should return mobile state", () => {
      const mobileContext = {
        ...mockContextValue,
        isMobile: true,
        openMobile: true,
      };

      const mobileWrapper = ({ children }: { children: ReactNode }) => (
        <SidebarContext.Provider value={mobileContext}>
          {children}
        </SidebarContext.Provider>
      );

      const { result } = renderHook(() => useSidebar(), {
        wrapper: mobileWrapper,
      });

      expect(result.current.isMobile).toBe(true);
      expect(result.current.openMobile).toBe(true);
    });
  });
});
