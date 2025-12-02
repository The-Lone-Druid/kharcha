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
import { Wallet } from "lucide-react";

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-background to-muted/20 p-4">
      {/* Logo and Branding */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
          <Wallet className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Kharcha</h1>
        <p className="text-muted-foreground mt-1">
          Track your expenses with ease
        </p>
      </div>

      {/* Auth Card */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "sign-in" | "sign-up")}
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
      <p className="text-xs text-muted-foreground mt-8">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
