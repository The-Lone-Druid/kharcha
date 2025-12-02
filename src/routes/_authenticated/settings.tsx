import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme";
import { Trash2, Wallet, Tag, LogOut, Download } from "lucide-react";
import { useClerk, UserProfile } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import * as XLSX from "xlsx";
import { useAppData } from "../_authenticated";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { signOut } = useClerk();
  const { accounts, outflowTypes } = useAppData();

  const transactions = useQuery(api.transactions.listTransactions, {
    limit: 10000,
  });

  console.log(theme);

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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Settings
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
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

        <Card>
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

        <Card>
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
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Accounts</Label>
                  <p className="text-sm text-muted-foreground">
                    Manage your accounts
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link to="/accounts">Manage</Link>
              </Button>
            </div>
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Categories</Label>
                  <p className="text-sm text-muted-foreground">
                    Manage transaction categories
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild className="w-full md:w-auto">
                <Link to="/outflow-types">Manage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
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
        <UserProfile />
      </div>
    </div>
  );
}
