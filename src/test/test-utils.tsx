import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import userEvent from "@testing-library/user-event";

// Custom render function that wraps components with providers
// Add your providers here as needed (ThemeProvider, etc.)
interface WrapperProps {
  children: ReactNode;
}

function AllProviders({ children }: WrapperProps) {
  return <>{children}</>;
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllProviders, ...options }),
  };
}

// Re-export everything from testing library
export * from "@testing-library/react";
export { customRender as render, userEvent };
