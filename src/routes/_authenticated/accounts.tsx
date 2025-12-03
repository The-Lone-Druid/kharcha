import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Wallet, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { AddAccountDialog } from "@/components/ui/add-account-dialog";
import { type Doc, type Id } from "@convex/_generated/dataModel";

export const Route = createFileRoute("/_authenticated/accounts")({
  component: AccountsPage,
});

function AccountsPage() {
  const accounts = useQuery(api.accounts.listAccounts);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Doc<"accounts"> | null>(
    null
  );

  const archiveAccount = useMutation(api.accounts.archiveAccount);

  const handleDelete = async (accountId: Id<"accounts">) => {
    if (confirm("Are you sure you want to archive this account?")) {
      try {
        await archiveAccount({ id: accountId });
      } catch (error) {
        alert("Failed to archive account");
      }
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 animate-fade-in">
      {/* Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bS0xNiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMC0xNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white/80 hover:text-white hover:bg-white/10 -ml-2"
            >
              <Link to="/settings">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Settings
              </Link>
            </Button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Wallet className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Accounts</h1>
                <p className="text-white/80 text-sm mt-1">
                  Manage your financial accounts and track balances
                </p>
              </div>
            </div>
            <AddAccountDialog
              open={showAddDialog}
              onOpenChange={setShowAddDialog}
              account={editingAccount}
              onSuccess={() => {
                setShowAddDialog(false);
                setEditingAccount(null);
              }}
              trigger={
                <Button className="bg-white text-emerald-600 hover:bg-white/90 shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              }
            />
          </div>
          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/80" />
              <span className="text-white/90 text-sm">
                {accounts?.length ?? 0} accounts
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-300" />
              <span className="text-white/90 text-sm">
                {accounts?.filter((a) => a.type === "Bank").length ?? 0} bank accounts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!accounts ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-16 mt-2" />
              </CardContent>
            </Card>
          ))
        ) : accounts.length === 0 ? (
          <Card className="col-span-full border-dashed animate-fade-in">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                <Wallet className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Create your first account to start tracking your finances
                across different payment methods.
              </p>
              <AddAccountDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onSuccess={() => setShowAddDialog(false)}
                trigger={
                  <Button className="bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Account
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          accounts.map((account, index) => (
            <Card
              key={account._id}
              className="relative group animate-slide-up overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: account.colorHex }}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{
                      backgroundColor: account.colorHex,
                      boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${account.colorHex}`,
                    }}
                  />
                  <span className="font-semibold">{account.name}</span>
                </CardTitle>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AddAccountDialog
                    open={editingAccount?._id === account._id}
                    onOpenChange={(open) => {
                      if (!open) setEditingAccount(null);
                    }}
                    account={account}
                    onSuccess={() => setEditingAccount(null)}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingAccount(account)}
                        className="h-8 w-8 p-0 hover:bg-muted"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(account._id)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Badge
                  variant="secondary"
                  className="mt-2"
                  style={{
                    backgroundColor: `${account.colorHex}15`,
                    color: account.colorHex,
                    borderColor: `${account.colorHex}30`,
                  }}
                >
                  {account.type}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
