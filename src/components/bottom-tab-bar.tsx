import { Link, useLocation } from "@tanstack/react-router";
import { Home, Receipt, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: Receipt,
  },
  {
    title: "Insights",
    url: "/insights",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function BottomTabBar() {
  const location = useLocation();

  return (
    <div className="bg-background/80 border-border/50 fixed right-4 bottom-4 left-4 rounded-2xl border px-2 shadow-xl shadow-black/10 backdrop-blur-xl dark:shadow-black/30">
      <div className="flex h-16 items-center justify-around">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-all duration-300",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active indicator pill */}
              {isActive && (
                <div className="from-primary absolute -top-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-linear-to-r to-orange-500" />
              )}

              {/* Icon container with active state */}
              <div
                className={cn(
                  "relative rounded-xl p-2 transition-all duration-300",
                  isActive && "bg-primary/10"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    isActive && "scale-110"
                  )}
                />
              </div>

              <span
                className={cn(
                  "mt-0.5 transition-all duration-300",
                  isActive ? "font-semibold" : "font-normal"
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
