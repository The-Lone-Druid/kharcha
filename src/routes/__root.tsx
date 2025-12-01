import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConvexProvider } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import convex from "@/lib/convex";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <ConvexProvider client={convex}>
      <ConvexAuthProvider client={convex}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AuthProvider>
              <Outlet />
              <TanStackRouterDevtools />
              <ReactQueryDevtools />
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ConvexAuthProvider>
    </ConvexProvider>
  ),
});
