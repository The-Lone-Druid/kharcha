import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import convex from "@/lib/convex";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { shadcn } from "@clerk/themes";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <ClerkProvider
        publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
        appearance={{
          baseTheme: shadcn,
        }}
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <QueryClientProvider client={queryClient}>
            <Outlet />
            {/* <TanStackRouterDevtools />
            <ReactQueryDevtools /> */}
            <Toaster />
          </QueryClientProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ThemeProvider>
  ),
});
