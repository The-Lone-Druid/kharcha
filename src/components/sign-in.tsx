import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("email", email);

      const result = await signIn("resend", formData);

      if (result.signingIn) {
        setMessage("Check your email for the sign-in link!");
      } else {
        setMessage("Sign-in link sent! Check your email.");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setMessage("Failed to send sign-in link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Kharcha</CardTitle>
          <CardDescription>
            Sign in to manage your expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              <Mail className="mr-2 h-4 w-4" />
              {isLoading ? "Sending..." : "Send Sign-in Link"}
            </Button>
          </form>
          {message && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm text-center">{message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}