import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { SignIn, useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = useUser();
  const createUser = useMutation(api.users.createUser);
  const currentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (user && !currentUser) {
      createUser({
        clerkId: user.id,
        name: user.fullName || undefined,
        email: user.primaryEmailAddress?.emailAddress || "",
        imageUrl: user.imageUrl || undefined,
      });
    }
  }, [user, currentUser, createUser]);

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
        <div className="min-h-screen flex items-center justify-center">
          <SignIn />
        </div>
      </Unauthenticated>
    </>
  );
}
