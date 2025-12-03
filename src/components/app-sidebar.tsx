import { NotificationBell } from "@/components/custom/notification-bell";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/clerk-react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  Home,
  LogOut,
  Receipt,
  Settings,
  Wallet,
} from "lucide-react";

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

export function AppSidebar() {
  const { signOut } = useClerk();
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="group flex items-center gap-3">
            <div className="from-primary shadow-primary/25 group-hover:shadow-primary/40 flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br to-orange-600 shadow-lg transition-all duration-300 group-hover:scale-105">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="from-primary bg-linear-to-r to-orange-600 bg-clip-text text-lg font-bold text-transparent">
              Kharcha
            </span>
          </div>
          <NotificationBell />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/70 text-xs tracking-wider uppercase">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "rounded-lg transition-all duration-200",
                        isActive &&
                          "bg-primary/10 text-primary border-primary border-l-2"
                      )}
                    >
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5",
                          isActive && "font-medium"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-border/50 border-t p-4">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full justify-start gap-3 transition-colors"
          onClick={() => signOut({ redirectUrl: "/" })}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
