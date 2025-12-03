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
} from "lucide-react";
import { useClerk, UserProfile } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import * as XLSX from "xlsx";
import { useAppData } from "../_authenticated";
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
  const { accounts, outflowTypes } = useAppData();
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
    if (currentUser?.preferences && 'notificationPreferences' in currentUser.preferences && currentUser.preferences.notificationPreferences) {
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
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Settings
          </h2>
          <p className="text-muted-foreground mt-1">
            Customize your app preferences
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-12">
        <Card className="col-span-12 md:col-span-6">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-6">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="currency">Currency</Label>
              <Select defaultValue="INR">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="language">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="global-notifications">
                  Enable Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="subscription-reminders">
                  Subscription Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="due-date-reminders">Due Date Reminders</Label>
                <p className="text-sm text-muted-foreground">
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
              <Alert>
                <AlertDescription className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">Browser Notifications:</span>
                    {permission === "granted" ? (
                      <Badge variant="default" className="gap-1">
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
                    <p className="text-xs text-muted-foreground">
                      Enable in browser settings
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email (coming soon)
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

        <Card className="col-span-12 md:col-span-6">
          <CardHeader>
            <CardTitle>Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Export Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Download all your data as Excel file
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <Label className="font-medium">Accounts</Label>
                  <p className="text-sm text-muted-foreground">
                    Manage your financial accounts
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild className="group">
                <Link to="/accounts">
                  Manage
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                  <Tag className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <Label className="font-medium">Categories</Label>
                  <p className="text-sm text-muted-foreground">
                    Manage transaction categories
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild className="w-full md:w-auto group">
                <Link to="/outflow-types">
                  Manage
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-6">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Logout</Label>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full md:w-auto"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-medium">Delete All Data</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all your transactions, accounts, and
                  settings. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteData}
                className="w-full md:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All Data
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="col-span-12">
          <UserProfile
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
