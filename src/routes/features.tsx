import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  Clock,
  Download,
  Github,
  PieChart,
  RefreshCw,
  Shield,
  Smartphone,
  Star,
  Tags,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "../../public/favicon.svg";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
  head: () => ({
    meta: [
      { title: "Kharcha - Smart Expense Tracking Made Beautiful" },
      {
        name: "description",
        content:
          "Track expenses, manage subscriptions, and gain financial insights with Kharcha. Beautiful, fast, and works offline. Your personal finance companion.",
      },
      {
        name: "keywords",
        content:
          "expense tracker, budget app, subscription manager, personal finance, money management, PWA, offline app",
      },
      // Open Graph
      { property: "og:type", content: "website" },
      {
        property: "og:title",
        content: "Kharcha - Smart Expense Tracking Made Beautiful",
      },
      {
        property: "og:description",
        content:
          "Track expenses, manage subscriptions, and gain financial insights. Beautiful, fast, and works offline.",
      },
      { property: "og:image", content: "/og-image.png" },
      { property: "og:url", content: "https://kharcha.space/features" },
      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Kharcha - Smart Expense Tracking Made Beautiful",
      },
      {
        name: "twitter:description",
        content:
          "Track expenses, manage subscriptions, and gain financial insights. Beautiful, fast, and works offline.",
      },
      { name: "twitter:image", content: "/og-image.png" },
    ],
  }),
});

function FeaturesPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Wallet,
      title: "Multi-Account Management",
      description:
        "Track cash, bank accounts, credit cards, UPI, and digital wallets all in one place.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: PieChart,
      title: "Visual Analytics",
      description:
        "Beautiful charts and graphs to understand your spending patterns at a glance.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description:
        "Never miss a subscription renewal or payment due date with intelligent notifications.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: RefreshCw,
      title: "Subscription Tracking",
      description:
        "Automatically track recurring expenses and get projections for future costs.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Tags,
      title: "Custom Categories",
      description:
        "Create and customize expense categories to match your lifestyle.",
      color: "from-rose-500 to-red-500",
    },
    {
      icon: Download,
      title: "Export Data",
      description:
        "Export your transactions to CSV or Excel for detailed analysis.",
      color: "from-indigo-500 to-violet-500",
    },
  ];

  const stats = [
    { value: "100%", label: "Free Forever" },
    { value: "Offline", label: "Works Anywhere" },
    { value: "Real-time", label: "Sync Across Devices" },
    { value: "Secure", label: "Bank-grade Security" },
  ];

  const capabilities = [
    "Track unlimited transactions",
    "Multiple account support",
    "Subscription management",
    "Smart notifications",
    "Beautiful dark & light themes",
    "Export to CSV/Excel",
    "Visual spending insights",
    "Progressive Web App",
    "Works offline",
    "No ads ever",
  ];

  return (
    <div className="bg-background min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="bg-primary/5 absolute top-1/4 -left-20 h-96 w-96 animate-pulse rounded-full blur-3xl"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="bg-secondary/10 absolute -right-20 bottom-1/4 h-80 w-80 animate-pulse rounded-full blur-3xl"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        />
        <div
          className="bg-accent/5 absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full blur-3xl"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        />
        {/* Floating geometric shapes */}
        <div
          className="bg-primary/20 absolute top-20 right-1/4 h-4 w-4 animate-bounce rounded-full"
          style={{ animationDuration: "3s" }}
        />
        <div
          className="bg-primary/30 absolute bottom-32 left-1/3 h-3 w-3 rotate-45 animate-bounce"
          style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
        />
        <div
          className="bg-accent/40 absolute top-1/3 left-20 h-2 w-2 animate-ping rounded-full"
          style={{ animationDuration: "2s" }}
        />
      </div>

      {/* Navigation */}
      <nav className="bg-background/80 border-border/50 sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/features" className="group flex items-center gap-2">
              <div className="from-primary shadow-primary/25 group-hover:shadow-primary/40 flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br to-orange-600 shadow-lg transition-shadow">
                {/* <Wallet className="w-5 h-5 text-white" /> */}
                <img src={Logo} alt="Kharcha Logo" />
              </div>
              <span className="from-primary bg-linear-to-r to-orange-600 bg-clip-text text-xl font-bold text-transparent">
                Kharcha
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <AnimatedThemeToggler />
              <Link to="/">
                <Button className="from-primary hover:from-primary/90 shadow-primary/25 gap-2 bg-linear-to-r to-orange-600 shadow-lg hover:to-orange-600/90">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 mb-6 px-4 py-2 text-sm font-medium"
            >
              <Zap className="mr-2 inline h-4 w-4" />
              100% Free • No Ads • Works Offline
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
              <span className="from-foreground via-foreground to-muted-foreground bg-linear-to-r bg-clip-text text-transparent">
                Track Expenses
              </span>
              <br />
              <span className="from-primary bg-linear-to-r via-orange-500 to-amber-500 bg-clip-text text-transparent">
                Beautifully
              </span>
            </h1>

            <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg sm:text-xl">
              The most beautiful expense tracker that works everywhere. Manage
              your money, track subscriptions, and gain insights — all in one
              elegant app.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/">
                <Button
                  size="lg"
                  className="from-primary hover:from-primary/90 shadow-primary/30 hover:shadow-primary/40 gap-2 bg-linear-to-r to-orange-600 px-8 py-6 text-lg shadow-xl transition-all hover:scale-105 hover:to-orange-600/90"
                >
                  Start Tracking Free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="hover:bg-accent/50 gap-2 px-8 py-6 text-lg transition-all"
                asChild
              >
                <a href="#features">
                  Explore Features <ChevronRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
          <div
            className={`relative mt-20 transition-all delay-300 duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div className="relative mx-auto max-w-4xl">
              {/* Phone mockup container */}
              <div className="from-card to-card/80 border-border/50 relative rounded-3xl border bg-linear-to-b p-4 shadow-2xl shadow-black/10 sm:p-8 dark:shadow-black/30">
                {/* Status bar mockup */}
                <div className="mb-4 flex items-center justify-between px-2">
                  <div className="flex gap-1.5">
                    <div className="bg-destructive/80 h-3 w-3 rounded-full" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-muted-foreground font-mono text-xs">
                    kharcha.space
                  </div>
                </div>

                {/* Dashboard preview mockup */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card className="from-primary/10 to-primary/5 border-primary/20 bg-linear-to-br">
                    <CardContent className="pt-6">
                      <div className="text-primary text-2xl font-bold sm:text-3xl">
                        ₹45,230
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Total Balance
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-green-500/20 bg-linear-to-br from-green-500/10 to-green-500/5">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-500 sm:text-3xl">
                        ₹12,450
                      </div>
                      <div className="text-muted-foreground text-sm">
                        This Month
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-500/20 bg-linear-to-br from-blue-500/10 to-blue-500/5">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-blue-500 sm:text-3xl">
                        8
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Subscriptions
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent transactions mockup */}
                <div className="mt-6 space-y-3">
                  {[
                    {
                      name: "Netflix",
                      amount: "₹649",
                      icon: "🎬",
                      color: "text-red-500",
                    },
                    {
                      name: "Grocery Store",
                      amount: "₹2,340",
                      icon: "🛒",
                      color: "text-green-500",
                    },
                    {
                      name: "Coffee Shop",
                      amount: "₹180",
                      icon: "☕",
                      color: "text-amber-500",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-muted/50 hover:bg-muted/80 flex items-center justify-between rounded-xl p-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-background flex h-10 w-10 items-center justify-center rounded-full text-lg">
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className={`font-semibold ${item.color}`}>
                        {item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating elements around mockup */}
              <div
                className="bg-card border-border/50 absolute -top-6 -left-6 animate-bounce rounded-2xl border p-4 shadow-xl"
                style={{ animationDuration: "3s" }}
              >
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div
                className="bg-card border-border/50 absolute -right-6 -bottom-6 animate-bounce rounded-2xl border p-4 shadow-xl"
                style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}
              >
                <PieChart className="text-primary h-8 w-8" />
              </div>
              <div
                className="bg-card border-border/50 absolute top-1/2 -right-10 animate-pulse rounded-xl border p-3 shadow-xl sm:-right-16"
                style={{ animationDuration: "2s" }}
              >
                <Bell className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/30 border-border/50 border-y px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`text-center transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="from-primary bg-linear-to-r to-orange-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                  {stat.value}
                </div>
                <div className="text-muted-foreground mt-1 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 mb-4"
            >
              Features
            </Badge>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything You Need to
              <span className="from-primary bg-linear-to-r to-orange-600 bg-clip-text text-transparent">
                {" "}
                Master Your Money
              </span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              Powerful features wrapped in a beautiful interface. No complexity,
              just clarity.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Card
                key={i}
                className={`group border-border/50 bg-card/50 backdrop-blur transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <CardHeader>
                  <div
                    className={`h-14 w-14 rounded-2xl bg-linear-to-br ${feature.color} mb-4 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="from-muted/30 to-background bg-linear-to-b px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 mb-4"
              >
                Capabilities
              </Badge>
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
                Built for{" "}
                <span className="from-primary bg-linear-to-r to-orange-600 bg-clip-text text-transparent">
                  Real Life
                </span>
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Whether you're tracking daily coffee or managing multiple
                accounts, Kharcha adapts to your lifestyle with powerful
                features that just work.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {capabilities.map((cap, i) => (
                  <div
                    key={i}
                    className="bg-card/50 border-border/50 hover:bg-card hover:border-primary/20 flex items-center gap-3 rounded-xl border p-3 transition-all"
                  >
                    <div className="bg-primary/10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      <Check className="text-primary h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="from-primary/20 rounded-3xl bg-linear-to-br via-orange-500/20 to-amber-500/20 p-8 sm:p-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="from-primary flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br to-orange-600 shadow-xl">
                      <Smartphone className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Progressive Web App</h3>
                      <p className="text-muted-foreground">
                        Install on any device
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 shadow-xl">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Secure by Design</h3>
                      <p className="text-muted-foreground">
                        Your data, your control
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-cyan-600 shadow-xl">
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Real-time Sync</h3>
                      <p className="text-muted-foreground">Always up to date</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="bg-primary/10 absolute -top-4 -right-4 h-24 w-24 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-orange-500/10 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="from-primary/10 border-primary/20 relative overflow-hidden rounded-3xl border bg-linear-to-br via-orange-500/10 to-amber-500/10 p-8 sm:p-16">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="bg-primary/10 absolute top-0 right-0 h-64 w-64 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
            </div>

            <div className="relative">
              <div className="mb-6 flex justify-center">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="from-muted to-muted-foreground/20 border-background flex h-10 w-10 items-center justify-center rounded-full border-2 bg-linear-to-br"
                    >
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                Ready to Take Control of Your
                <span className="from-primary bg-linear-to-r to-orange-600 bg-clip-text text-transparent">
                  {" "}
                  Finances?
                </span>
              </h2>
              <p className="text-muted-foreground mx-auto mb-8 max-w-xl">
                Join thousands of users who have simplified their expense
                tracking. Start for free, no credit card required.
              </p>

              <Link to="/">
                <Button
                  size="lg"
                  className="from-primary hover:from-primary/90 shadow-primary/30 hover:shadow-primary/40 gap-2 bg-linear-to-r to-orange-600 px-10 py-6 text-lg shadow-xl transition-all hover:scale-105 hover:to-orange-600/90"
                >
                  Start Tracking Now <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border/50 bg-muted/20 border-t px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="from-primary flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br to-orange-600">
                <img src={Logo} alt="Kharcha Logo" />
                {/* <Wallet className="w-5 h-5 text-white" /> */}
              </div>
              <span className="from-primary bg-linear-to-r to-orange-600 bg-clip-text text-xl font-bold text-transparent">
                Kharcha
              </span>
            </div>

            <p className="text-muted-foreground text-center text-sm">
              Made with ❤️ for better financial health
            </p>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/The-Lone-Druid/kharcha"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card border-border/50 hover:bg-accent hover:border-primary/30 group flex items-center gap-2 rounded-lg border px-4 py-2 transition-all"
              >
                <Github className="group-hover:text-primary h-5 w-5 transition-colors" />
                <span className="text-sm font-medium">Star on GitHub</span>
              </a>
            </div>
          </div>

          <div className="border-border/50 mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
            <div className="text-muted-foreground flex items-center gap-4 text-sm">
              <span>© {new Date().getFullYear()} Kharcha</span>
              <span>•</span>
              <a
                href="https://github.com/The-Lone-Druid/kharcha"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Open Source
              </a>
            </div>
            <p className="text-muted-foreground text-sm">
              Contributions welcome! Help us make expense tracking better for
              everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
