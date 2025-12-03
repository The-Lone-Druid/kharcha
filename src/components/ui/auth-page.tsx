import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Wallet, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <div className="from-background to-muted/20 relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-b p-4">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="bg-primary/5 absolute top-1/4 -left-20 h-80 w-80 animate-pulse rounded-full blur-3xl"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute -right-20 bottom-1/4 h-64 w-64 animate-pulse rounded-full bg-orange-500/10 blur-3xl"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        />
      </div>

      {/* Logo and Branding */}
      <div className="relative z-10 mb-8 flex flex-col items-center">
        <div className="from-primary shadow-primary/25 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br to-orange-600 shadow-lg">
          <Wallet className="text-primary-foreground h-8 w-8" />
        </div>
        <h1 className="from-primary bg-linear-to-r to-orange-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Kharcha
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your expenses with ease
        </p>
      </div>

      {/* Auth Card */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "sign-in" | "sign-up")}
        className="relative z-10"
      >
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-xl">
              {activeTab === "sign-in" ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription>
              {activeTab === "sign-in"
                ? "Sign in to continue managing your finances"
                : "Start tracking your expenses today"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="sign-in">Sign In</TabsTrigger>
              <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>
        <TabsContent value="sign-in" className="mt-0">
          <div className="flex justify-center [&_.cl-card]:border-0 [&_.cl-card]:bg-transparent [&_.cl-card]:shadow-none [&_.cl-footer]:hidden [&_.cl-internal-b3fm6y]:hidden">
            <SignIn routing="hash" />
          </div>
        </TabsContent>
        <TabsContent value="sign-up" className="mt-0">
          <div className="flex justify-center [&_.cl-card]:border-0 [&_.cl-card]:bg-transparent [&_.cl-card]:shadow-none [&_.cl-footer]:hidden [&_.cl-internal-b3fm6y]:hidden">
            <SignUp routing="hash" />
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="relative z-10 mt-8 flex flex-col items-center gap-4">
        <Link to="/features">
          <Button
            variant="outline"
            className="border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 text-primary shadow-primary/10 animate-pulse gap-2 shadow-lg transition-all hover:animate-none"
            style={{ animationDuration: "2s" }}
          >
            <Sparkles
              className="h-4 w-4 animate-spin"
              style={{ animationDuration: "3s" }}
            />
            Explore all features
          </Button>
        </Link>
        <p className="text-muted-foreground text-xs">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
