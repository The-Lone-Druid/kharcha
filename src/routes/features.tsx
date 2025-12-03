import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  PieChart,
  Bell,
  TrendingUp,
  Shield,
  Smartphone,
  ArrowRight,
  Check,
  Star,
  Zap,
  Clock,
  Download,
  RefreshCw,
  Tags,
  ChevronRight,
  Github,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
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
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        />
        {/* Floating geometric shapes */}
        <div
          className="absolute top-20 right-1/4 w-4 h-4 bg-primary/20 rounded-full animate-bounce"
          style={{ animationDuration: "3s" }}
        />
        <div
          className="absolute bottom-32 left-1/3 w-3 h-3 bg-primary/30 rotate-45 animate-bounce"
          style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
        />
        <div
          className="absolute top-1/3 left-20 w-2 h-2 bg-accent/40 rounded-full animate-ping"
          style={{ animationDuration: "2s" }}
        />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/features" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-primary to-orange-600 shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                {/* <Wallet className="w-5 h-5 text-white" /> */}
                <img src={Logo} alt="Kharcha Logo" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                Kharcha
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <AnimatedThemeToggler />
              <Link to="/">
                <Button className="gap-2 bg-linear-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/25">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20"
            >
              <Zap className="w-4 h-4 mr-2 inline" />
              100% Free • No Ads • Works Offline
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-linear-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                Track Expenses
              </span>
              <br />
              <span className="bg-linear-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
                Beautifully
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The most beautiful expense tracker that works everywhere. Manage
              your money, track subscriptions, and gain insights — all in one
              elegant app.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/">
                <Button
                  size="lg"
                  className="gap-2 text-lg px-8 py-6 bg-linear-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:scale-105"
                >
                  Start Tracking Free <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-lg px-8 py-6 hover:bg-accent/50 transition-all"
                asChild
              >
                <a href="#features">
                  Explore Features <ChevronRight className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
          <div
            className={`mt-20 relative transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="relative mx-auto max-w-4xl">
              {/* Phone mockup container */}
              <div className="relative bg-linear-to-b from-card to-card/80 rounded-3xl border border-border/50 shadow-2xl shadow-black/10 dark:shadow-black/30 p-4 sm:p-8">
                {/* Status bar mockup */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    kharcha.space
                  </div>
                </div>

                {/* Dashboard preview mockup */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="text-2xl sm:text-3xl font-bold text-primary">
                        ₹45,230
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Balance
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-linear-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                    <CardContent className="pt-6">
                      <div className="text-2xl sm:text-3xl font-bold text-green-500">
                        ₹12,450
                      </div>
                      <div className="text-sm text-muted-foreground">
                        This Month
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-linear-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                    <CardContent className="pt-6">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-500">
                        8
                      </div>
                      <div className="text-sm text-muted-foreground">
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
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-lg">
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
                className="absolute -top-6 -left-6 p-4 bg-card rounded-2xl shadow-xl border border-border/50 animate-bounce"
                style={{ animationDuration: "3s" }}
              >
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <div
                className="absolute -bottom-6 -right-6 p-4 bg-card rounded-2xl shadow-xl border border-border/50 animate-bounce"
                style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}
              >
                <PieChart className="w-8 h-8 text-primary" />
              </div>
              <div
                className="absolute top-1/2 -right-10 sm:-right-16 p-3 bg-card rounded-xl shadow-xl border border-border/50 animate-pulse"
                style={{ animationDuration: "2s" }}
              >
                <Bell className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 bg-primary/10 text-primary border-primary/20"
            >
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to
              <span className="bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                {" "}
                Master Your Money
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features wrapped in a beautiful interface. No complexity,
              just clarity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card
                key={i}
                className={`group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-border/50 bg-card/50 backdrop-blur ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <CardHeader>
                  <div
                    className={`w-14 h-14 rounded-2xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge
                variant="secondary"
                className="mb-4 bg-primary/10 text-primary border-primary/20"
              >
                Capabilities
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Built for{" "}
                <span className="bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                  Real Life
                </span>
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Whether you're tracking daily coffee or managing multiple
                accounts, Kharcha adapts to your lifestyle with powerful
                features that just work.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {capabilities.map((cap, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 hover:bg-card hover:border-primary/20 transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-linear-to-br from-primary/20 via-orange-500/20 to-amber-500/20 rounded-3xl p-8 sm:p-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-orange-600 flex items-center justify-center shadow-xl">
                      <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Progressive Web App</h3>
                      <p className="text-muted-foreground">
                        Install on any device
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Secure by Design</h3>
                      <p className="text-muted-foreground">
                        Your data, your control
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-xl">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Real-time Sync</h3>
                      <p className="text-muted-foreground">Always up to date</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-linear-to-br from-primary/10 via-orange-500/10 to-amber-500/10 rounded-3xl p-8 sm:p-16 border border-primary/20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-linear-to-br from-muted to-muted-foreground/20 border-2 border-background flex items-center justify-center"
                    >
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Take Control of Your
                <span className="bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                  {" "}
                  Finances?
                </span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of users who have simplified their expense
                tracking. Start for free, no credit card required.
              </p>

              <Link to="/">
                <Button
                  size="lg"
                  className="gap-2 text-lg px-10 py-6 bg-linear-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:scale-105"
                >
                  Start Tracking Now <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-primary to-orange-600">
                <img src={Logo} alt="Kharcha Logo" />
                {/* <Wallet className="w-5 h-5 text-white" /> */}
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                Kharcha
              </span>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Made with ❤️ for better financial health
            </p>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/The-Lone-Druid/kharcha"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/50 hover:bg-accent hover:border-primary/30 transition-all group"
              >
                <Github className="w-5 h-5 group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium">Star on GitHub</span>
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
            <p className="text-sm text-muted-foreground">
              Contributions welcome! Help us make expense tracking better for
              everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
