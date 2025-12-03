import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { Id } from "@convex/_generated/dataModel";
import { useNotifications } from "@/hooks/use-notifications";
import { useEffect } from "react";

export function NotificationBell() {
  const notifications = useQuery(api.notifications.listNotifications);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);
  
  const { 
    permission, 
    isSupported, 
    shouldPrompt, 
    requestPermission,
    showNotification 
  } = useNotifications();

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  // Show browser notification for new unread notifications
  useEffect(() => {
    if (notifications && permission === "granted") {
      const unreadNotifs = notifications.filter((n) => !n.isRead);
      
      // Only show browser notification if there are new unread notifications
      // and we haven't shown them yet (you might want to track this in localStorage)
      if (unreadNotifs.length > 0) {
        const lastNotif = unreadNotifs[0];
        const lastShownId = localStorage.getItem("lastShownNotificationId");
        
        if (lastShownId !== lastNotif._id) {
          showNotification(
            lastNotif.message,
            lastNotif.type
          );
          localStorage.setItem("lastShownNotificationId", lastNotif._id);
        }
      }
    }
  }, [notifications, permission, showNotification]);

  // Prompt for permission if needed and user has notifications enabled
  useEffect(() => {
    if (shouldPrompt && isSupported && notifications && notifications.length > 0) {
      // Show a toast to ask for permission
      const timer = setTimeout(() => {
        toast.info(
          "Enable browser notifications to receive reminders even when the app is closed",
          {
            action: {
              label: "Enable",
              onClick: async () => {
                const result = await requestPermission();
                if (result === "granted") {
                  toast.success("Notifications enabled!");
                } else if (result === "denied") {
                  toast.error("Notification permission denied. You can enable it in your browser settings.");
                }
              },
            },
            duration: 10000,
          }
        );
      }, 2000); // Wait 2 seconds before prompting

      return () => clearTimeout(timer);
    }
  }, [shouldPrompt, isSupported, notifications, requestPermission]);

  const handleMarkAsRead = async (id: Id<"notifications">) => {
    try {
      await markAsRead({ id });
    } catch (error) {
      toast.error("Failed to mark notification as read");
      console.error(error);
    }
  };

  const handleDelete = async (id: Id<"notifications">) => {
    try {
      await deleteNotification({ id });
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
      console.error(error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className="flex flex-col items-start p-3 cursor-pointer"
                onClick={() => {
                  if (!notification.isRead) {
                    handleMarkAsRead(notification._id);
                  }
                }}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          notification.type === "renewal" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {notification.type === "renewal" ? "Renewal" : "Due"}
                      </Badge>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification._id);
                    }}
                  >
                    ×
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
