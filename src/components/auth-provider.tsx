import { useAuthToken } from "@convex-dev/auth/react";
import { Spinner } from "@/components/ui/spinner";
import { SignIn } from "@/components/sign-in";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const token = useAuthToken();

  // Show loading spinner while determining auth state
  if (token === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Show sign-in page if not authenticated
  if (!token) {
    return <SignIn />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
}
