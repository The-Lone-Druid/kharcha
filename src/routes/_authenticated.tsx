import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useEffect, createContext, useContext } from "react";
import { AuthPage } from "@/components/ui/auth-page";
import type { Doc } from "@convex/_generated/dataModel";

// Type for preferences - can be full Doc or default values
type UserPreferences = Doc<"userPreferences"> | {
  currency: string;
  language: string;
  darkMode: boolean;
  onboardingCompleted: boolean;
};

// Create context for shared data to avoid refetching on each page
interface AppDataContextType {
  accounts: Doc<"accounts">[] | undefined;
  outflowTypes: Doc<"outflowTypes">[] | undefined;
  currentUser: (Doc<"users"> & { preferences: UserPreferences }) | null | undefined;
  isLoading: boolean;
}

const AppDataContext = createContext<AppDataContextType>({
  accounts: undefined,
  outflowTypes: undefined,
  currentUser: undefined,
  isLoading: true,
});

export const useAppData = () => useContext(AppDataContext);

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = useUser();
  const createUser = useMutation(api.users.createUser);
  const currentUser = useQuery(api.users.getCurrentUser);
  
  // Prefetch common data at the layout level for instant access on all pages
  const accounts = useQuery(api.accounts.listAccounts);
  const outflowTypes = useQuery(api.outflowTypes.listOutflowTypes);

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

  const isLoading = accounts === undefined || outflowTypes === undefined;

  return (
    <>
      <Authenticated>
        <AppDataContext.Provider
          value={{
            accounts,
            outflowTypes,
            currentUser,
            isLoading,
          }}
        >
          <div className="min-h-screen bg-background">
            <main className="pb-16">
              <Outlet />
            </main>
            <BottomTabBar />
          </div>
        </AppDataContext.Provider>
      </Authenticated>
      <Unauthenticated>
        <AuthPage />
      </Unauthenticated>
    </>
  );
}
