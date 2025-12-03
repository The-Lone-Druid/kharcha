import { useEffect, useState } from "react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({
  message = "Loading your financial data...",
}: LoadingScreenProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="from-background via-background to-muted/20 relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating circles */}
        <div
          className="bg-primary/5 absolute top-1/4 left-1/4 h-32 w-32 animate-pulse rounded-full"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        />
        <div
          className="bg-secondary/10 absolute top-3/4 right-1/4 h-24 w-24 animate-pulse rounded-full"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        />
        <div
          className="bg-accent/15 absolute bottom-1/4 left-1/3 h-16 w-16 animate-pulse rounded-full"
          style={{ animationDelay: "2s", animationDuration: "3.5s" }}
        />

        {/* Floating geometric shapes */}
        <div
          className="border-primary/20 absolute top-1/3 right-1/3 h-8 w-8 rotate-45 animate-bounce border-2"
          style={{ animationDelay: "0.5s", animationDuration: "2s" }}
        />
        <div
          className="from-primary/10 to-secondary/10 absolute right-1/2 bottom-1/3 h-6 w-6 animate-ping rounded bg-linear-to-r"
          style={{ animationDelay: "1.5s", animationDuration: "3s" }}
        />
        <div
          className="bg-accent/20 absolute top-2/3 left-1/2 h-4 w-4 animate-pulse rounded-full"
          style={{ animationDelay: "2.5s", animationDuration: "2.5s" }}
        />
      </div>

      {/* Main loading content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Animated logo/icon area */}
        <div className="relative">
          {/* Outer rotating ring */}
          <div
            className="border-primary/20 h-24 w-24 animate-spin rounded-full border-4"
            style={{ animationDuration: "3s" }}
          />

          {/* Inner pulsing circle */}
          <div
            className="from-primary to-secondary absolute inset-2 animate-pulse rounded-full bg-linear-to-r"
            style={{ animationDuration: "2s" }}
          />

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-3 w-3 animate-ping rounded-full bg-white"
              style={{ animationDelay: "0.5s" }}
            />
          </div>
        </div>

        {/* Loading text with animated dots */}
        <div className="space-y-2 text-center">
          <h2 className="from-primary to-secondary animate-pulse bg-linear-to-r bg-clip-text text-2xl font-semibold text-transparent">
            Kharcha
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            {message}
            <span className="inline-block w-8 text-left">{dots}</span>
          </p>
        </div>

        {/* Progress indicator */}
        <div className="bg-muted h-1 w-48 overflow-hidden rounded-full">
          <div
            className="from-primary to-secondary h-full animate-pulse rounded-full bg-linear-to-r"
            style={{ animationDuration: "1.5s" }}
          />
        </div>

        {/* Subtle hint text */}
        <p
          className="text-muted-foreground/60 animate-fade-in text-xs"
          style={{ animationDelay: "1s" }}
        >
          Setting up your personalized dashboard
        </p>
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>
    </div>
  );
}
