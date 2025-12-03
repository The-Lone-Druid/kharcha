import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useEffect, useRef } from "react";
import { AuthPage } from "@/components/ui/auth-page";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, isLoaded } = useUser();
  const createUser = useMutation(api.users.createUser);

  // Use ref to track if we've already attempted initialization
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Only initialize user data once per session when user is authenticated
    const userId = user?.id;
    if (userId && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      createUser();
    }
  }, [user?.id, createUser]);

  // Wait for Clerk to load before rendering
  if (!isLoaded) {
    return null;
  }

  return (
    <>
      <Authenticated>
        <div className="min-h-screen bg-background">
          <main className="pb-16">
            <Outlet />
          </main>
          <BottomTabBar />
        </div>
      </Authenticated>
      <Unauthenticated>
        <AuthPage />
      </Unauthenticated>
    </>
  );
}
