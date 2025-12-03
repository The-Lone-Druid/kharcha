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
    <div className="fixed bottom-4 left-4 right-4 bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl shadow-black/10 dark:shadow-black/30 px-2">
      <div className="flex justify-around items-center h-16">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 py-2 px-3 text-xs font-medium transition-all duration-300",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active indicator pill */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-linear-to-r from-primary to-orange-500" />
              )}
              
              {/* Icon container with active state */}
              <div className={cn(
                "relative p-2 rounded-xl transition-all duration-300",
                isActive && "bg-primary/10"
              )}>
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  isActive && "scale-110"
                )} />
              </div>
              
              <span className={cn(
                "mt-0.5 transition-all duration-300",
                isActive ? "font-semibold" : "font-normal"
              )}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
