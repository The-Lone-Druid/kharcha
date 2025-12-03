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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating circles */}
        <div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full animate-pulse"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        />
        <div
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-secondary/10 rounded-full animate-pulse"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-accent/15 rounded-full animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "3.5s" }}
        />

        {/* Floating geometric shapes */}
        <div
          className="absolute top-1/3 right-1/3 w-8 h-8 border-2 border-primary/20 rotate-45 animate-bounce"
          style={{ animationDelay: "0.5s", animationDuration: "2s" }}
        />
        <div
          className="absolute bottom-1/3 right-1/2 w-6 h-6 bg-linear-to-r from-primary/10 to-secondary/10 rounded animate-ping"
          style={{ animationDelay: "1.5s", animationDuration: "3s" }}
        />
        <div
          className="absolute top-2/3 left-1/2 w-4 h-4 bg-accent/20 rounded-full animate-pulse"
          style={{ animationDelay: "2.5s", animationDuration: "2.5s" }}
        />
      </div>

      {/* Main loading content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Animated logo/icon area */}
        <div className="relative">
          {/* Outer rotating ring */}
          <div
            className="w-24 h-24 border-4 border-primary/20 rounded-full animate-spin"
            style={{ animationDuration: "3s" }}
          />

          {/* Inner pulsing circle */}
          <div
            className="absolute inset-2 bg-linear-to-r from-primary to-secondary rounded-full animate-pulse"
            style={{ animationDuration: "2s" }}
          />

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-3 h-3 bg-white rounded-full animate-ping"
              style={{ animationDelay: "0.5s" }}
            />
          </div>
        </div>

        {/* Loading text with animated dots */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">
            Kharcha
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            {message}
            <span className="inline-block w-8 text-left">{dots}</span>
          </p>
        </div>

        {/* Progress indicator */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary to-secondary rounded-full animate-pulse"
            style={{ animationDuration: "1.5s" }}
          />
        </div>

        {/* Subtle hint text */}
        <p
          className="text-xs text-muted-foreground/60 animate-fade-in"
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
