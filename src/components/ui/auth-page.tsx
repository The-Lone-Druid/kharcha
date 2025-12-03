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
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-background to-muted/20 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div 
          className="absolute bottom-1/4 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        />
      </div>

      {/* Logo and Branding */}
      <div className="flex flex-col items-center mb-8 relative z-10">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-orange-600 mb-4 shadow-lg shadow-primary/25">
          <Wallet className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">Kharcha</h1>
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
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center pb-2">
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
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="sign-in">Sign In</TabsTrigger>
              <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>
        <TabsContent value="sign-in" className="mt-0">
          <div className="flex justify-center [&_.cl-card]:shadow-none [&_.cl-card]:border-0 [&_.cl-card]:bg-transparent [&_.cl-footer]:hidden [&_.cl-internal-b3fm6y]:hidden">
            <SignIn routing="hash" />
          </div>
        </TabsContent>
        <TabsContent value="sign-up" className="mt-0">
          <div className="flex justify-center [&_.cl-card]:shadow-none [&_.cl-card]:border-0 [&_.cl-card]:bg-transparent [&_.cl-footer]:hidden [&_.cl-internal-b3fm6y]:hidden">
            <SignUp routing="hash" />
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex flex-col items-center gap-4 mt-8 relative z-10">
        <Link to="/features">
          <Button 
            variant="outline" 
            className="gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 text-primary shadow-lg shadow-primary/10 animate-pulse hover:animate-none transition-all"
            style={{ animationDuration: "2s" }}
          >
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: "3s" }} />
            Explore all features
          </Button>
        </Link>
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
