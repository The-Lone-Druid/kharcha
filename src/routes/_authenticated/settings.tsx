import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme";
import {
  Trash2,
  Wallet,
  Tag,
  LogOut,
  Download,
  Bell,
  Check,
  X,
  ArrowRight,
  Settings,
  Palette,
  Globe,
  Shield,
  Sparkles,
} from "lucide-react";
import { useClerk, UserProfile } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { signOut } = useClerk();
  const accounts = useQuery(api.accounts.listAccounts);
  const outflowTypes = useQuery(api.outflowTypes.listOutflowTypes);
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateNotificationPrefs = useMutation(
    api.users.updateNotificationPreferences
  );

  const { permission, isSupported, requestPermission } = useNotifications();

  const transactions = useQuery(api.transactions.listTransactions, {
    limit: 10000,
  });

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState({
    globalNotifications: true,
    subscriptionReminders: true,
    dueDateReminders: true,
    emailNotifications: false,
  });

  // Load preferences when user data is available
  useEffect(() => {
    if (
      currentUser?.preferences &&
      "notificationPreferences" in currentUser.preferences &&
      currentUser.preferences.notificationPreferences
    ) {
      setNotifPrefs(currentUser.preferences.notificationPreferences);
    }
  }, [currentUser]);

  const handleNotificationPrefChange = async (
    key: keyof typeof notifPrefs,
    value: boolean
  ) => {
    try {
      setNotifPrefs((prev) => ({ ...prev, [key]: value }));
      await updateNotificationPrefs({ [key]: value });
      toast.success("Notification preferences updated");
    } catch (error) {
      toast.error("Failed to update preferences");
      console.error(error);
      // Revert on error
      setNotifPrefs((prev) => ({ ...prev, [key]: !value }));
    }
  };

  const handleExportData = () => {
    if (!transactions || !accounts || !outflowTypes) {
      alert("Data is still loading. Please try again.");
      return;
    }

    // Prepare transactions data
    const transactionsData = transactions.map((t) => ({
      "Transaction ID": t._id,
      Date: new Date(t.date).toLocaleDateString(),
      Amount: t.amount,
      Note: t.note || "",
      "Account Name": t.account?.name || "Unknown",
      "Account Type": t.account?.type || "Unknown",
      Category: t.outflowType
        ? `${t.outflowType.emoji} ${t.outflowType.name}`
        : "Unknown",
    }));

    // Prepare accounts data
    const accountsData = accounts.map((acc) => ({
      Name: acc.name,
      Type: acc.type,
      Color: acc.colorHex,
    }));

    // Prepare outflow types data
    const outflowTypesData = outflowTypes.map((type) => ({
      Name: type.name,
      Emoji: type.emoji,
      Custom: type.isCustom ? "Yes" : "No",
      "Extra Fields": type.extraFields?.length || 0,
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add sheets
    const wsTransactions = XLSX.utils.json_to_sheet(transactionsData);
    const wsAccounts = XLSX.utils.json_to_sheet(accountsData);
    const wsCategories = XLSX.utils.json_to_sheet(outflowTypesData);

    XLSX.utils.book_append_sheet(wb, wsTransactions, "Transactions");
    XLSX.utils.book_append_sheet(wb, wsAccounts, "Accounts");
    XLSX.utils.book_append_sheet(wb, wsCategories, "Categories");

    // Generate filename with date
    const date = new Date().toISOString().split("T")[0];
    const filename = `kharcha-export-${date}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  const handleDeleteData = () => {
    // Implement delete all data
    alert("This will permanently delete all your data. Feature coming soon.");
  };

  const handleLogout = () => {
    signOut({ redirectUrl: "/" });
  };

  return (
    <div className="animate-fade-in flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-600 via-slate-700 to-slate-800 p-6 text-white shadow-xl md:p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bS0xNiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMC0xNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Settings className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">Settings</h1>
                <p className="mt-1 text-sm text-white/80">
                  Customize your app preferences and manage your data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <Card
          className="animate-slide-up col-span-12 md:col-span-6"
          style={{ animationDelay: "0ms" }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="rounded-lg bg-amber-100 p-1.5 dark:bg-amber-900/30">
                <Palette className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition-colors">
              <Label htmlFor="theme" className="font-medium">
                Theme
              </Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">☀️ Light</SelectItem>
                  <SelectItem value="dark">🌙 Dark</SelectItem>
                  <SelectItem value="system">💻 System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card
          className="animate-slide-up col-span-12 md:col-span-6"
          style={{ animationDelay: "50ms" }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/30">
                <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition-colors">
              <Label htmlFor="currency" className="font-medium">
                Currency
              </Label>
              <Select defaultValue="INR">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">🇮🇳 INR</SelectItem>
                  <SelectItem value="USD">🇺🇸 USD</SelectItem>
                  <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/30 hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition-colors">
              <Label htmlFor="language" className="font-medium">
                Language
              </Label>
              <Select defaultValue="en">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card
          className="animate-slide-up col-span-12 md:col-span-6"
          style={{ animationDelay: "100ms" }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="rounded-lg bg-purple-100 p-1.5 dark:bg-purple-900/30">
                <Bell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition-colors">
              <div className="space-y-0.5">
                <Label htmlFor="global-notifications" className="font-medium">
                  Enable Notifications
                </Label>
                <p className="text-muted-foreground text-xs">
                  Master toggle for all notifications
                </p>
              </div>
              <Switch
                id="global-notifications"
                checked={notifPrefs.globalNotifications}
                onCheckedChange={(checked) =>
                  handleNotificationPrefChange("globalNotifications", checked)
                }
              />
            </div>
            <div className="bg-muted/30 hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition-colors">
              <div className="space-y-0.5">
                <Label htmlFor="subscription-reminders" className="font-medium">
                  Subscription Reminders
                </Label>
                <p className="text-muted-foreground text-xs">
                  Get notified before subscriptions renew
                </p>
              </div>
              <Switch
                id="subscription-reminders"
                checked={notifPrefs.subscriptionReminders}
                onCheckedChange={(checked) =>
                  handleNotificationPrefChange("subscriptionReminders", checked)
                }
                disabled={!notifPrefs.globalNotifications}
              />
            </div>
            <div className="bg-muted/30 hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition-colors">
              <div className="space-y-0.5">
                <Label htmlFor="due-date-reminders" className="font-medium">
                  Due Date Reminders
                </Label>
                <p className="text-muted-foreground text-xs">
                  Get notified when money lent is due
                </p>
              </div>
              <Switch
                id="due-date-reminders"
                checked={notifPrefs.dueDateReminders}
                onCheckedChange={(checked) =>
                  handleNotificationPrefChange("dueDateReminders", checked)
                }
                disabled={!notifPrefs.globalNotifications}
              />
            </div>

            {/* Browser Notification Permission Status */}
            {isSupported && (
              <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30">
                <AlertDescription className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium">
                      Browser Notifications:
                    </span>
                    {permission === "granted" ? (
                      <Badge variant="default" className="gap-1 bg-green-500">
                        <Check className="h-3 w-3" /> Enabled
                      </Badge>
                    ) : permission === "denied" ? (
                      <Badge variant="destructive" className="gap-1">
                        <X className="h-3 w-3" /> Blocked
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Set</Badge>
                    )}
                  </div>
                  {permission === "default" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const result = await requestPermission();
                        if (result === "granted") {
                          toast.success("Browser notifications enabled!");
                        } else if (result === "denied") {
                          toast.error(
                            "Permission denied. Enable in browser settings."
                          );
                        }
                      }}
                    >
                      Enable
                    </Button>
                  )}
                  {permission === "denied" && (
                    <p className="text-muted-foreground text-xs">
                      Enable in browser settings
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-muted/30 hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 opacity-60 transition-colors">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="font-medium">
                  Email Notifications
                </Label>
                <p className="text-muted-foreground text-xs">
                  Receive notifications via email
                  <Badge variant="outline" className="ml-2 py-0 text-[10px]">
                    Coming Soon
                  </Badge>
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifPrefs.emailNotifications}
                onCheckedChange={(checked) =>
                  handleNotificationPrefChange("emailNotifications", checked)
                }
                disabled
              />
            </div>
          </CardContent>
        </Card>

        <Card
          className="animate-slide-up col-span-12 md:col-span-6"
          style={{ animationDelay: "150ms" }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="rounded-lg bg-cyan-100 p-1.5 dark:bg-cyan-900/30">
                <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-muted/30 hover:bg-muted/50 flex flex-col space-y-2 rounded-lg p-3 transition-colors md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                  <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <Label className="font-medium">Export Data</Label>
                  <p className="text-muted-foreground text-xs">
                    Download all your data as Excel
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleExportData}
                className="group"
              >
                <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                Export
              </Button>
            </div>
            <div className="bg-muted/30 hover:bg-muted/50 flex flex-col space-y-2 rounded-lg p-3 transition-colors md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                  <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <Label className="font-medium">Accounts</Label>
                  <p className="text-muted-foreground text-xs">
                    Manage your financial accounts
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild className="group">
                <Link to="/accounts">
                  Manage
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="bg-muted/30 hover:bg-muted/50 flex flex-col space-y-2 rounded-lg p-3 transition-colors md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-900/30">
                  <Tag className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <Label className="font-medium">Categories</Label>
                  <p className="text-muted-foreground text-xs">
                    Manage transaction categories
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                asChild
                className="group w-full md:w-auto"
              >
                <Link to="/outflow-types">
                  Manage
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="animate-slide-up col-span-12 border-red-200 md:col-span-6 dark:border-red-900/50"
          style={{ animationDelay: "200ms" }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-red-600 dark:text-red-400">
              <div className="rounded-lg bg-red-100 p-1.5 dark:bg-red-900/30">
                <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-muted/30 flex flex-col space-y-2 rounded-lg p-3 transition-colors hover:bg-red-50 md:flex-row md:items-center md:justify-between dark:hover:bg-red-950/20">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                  <LogOut className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <Label className="font-medium">Logout</Label>
                  <p className="text-muted-foreground text-xs">
                    Sign out of your account
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 md:w-auto dark:hover:bg-orange-950/30"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
            <div className="flex flex-col space-y-2 rounded-lg border border-red-200/50 bg-red-50/50 p-3 md:flex-row md:items-center md:justify-between dark:border-red-900/30 dark:bg-red-950/20">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-medium text-red-700 dark:text-red-400">
                    Delete All Data
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Permanently delete everything. Cannot be undone.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteData}
                className="w-full md:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All
              </Button>
            </div>
          </CardContent>
        </Card>
        <div
          className="animate-slide-up col-span-12"
          style={{ animationDelay: "250ms" }}
        >
          <UserProfile
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full !h-auto shadow-none border-0",
                card: "shadow-none border-0",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
