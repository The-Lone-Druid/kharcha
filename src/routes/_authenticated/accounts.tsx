import { AddAccountDialog } from "@/components/custom/add-account-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@convex/_generated/api";
import { type Doc, type Id } from "@convex/_generated/dataModel";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Edit, Plus, Trash2, Wallet } from "lucide-react";
import { useState } from "react";

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
    <div className="animate-fade-in flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 text-white shadow-xl md:p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bS0xNiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMC0xNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="-ml-2 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Link to="/settings">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Settings
              </Link>
            </Button>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Wallet className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">Accounts</h1>
                <p className="mt-1 text-sm text-white/80">
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
                <Button className="bg-white text-emerald-600 shadow-lg hover:bg-white/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              }
            />
          </div>
          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-white/80" />
              <span className="text-sm text-white/90">
                {accounts?.length ?? 0} accounts
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-300" />
              <span className="text-sm text-white/90">
                {accounts?.filter((a) => a.type === "Bank").length ?? 0} bank
                accounts
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
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="mt-2 h-6 w-16" />
              </CardContent>
            </Card>
          ))
        ) : accounts.length === 0 ? (
          <Card className="animate-fade-in col-span-full border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/30">
                <Wallet className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No accounts yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm text-center">
                Create your first account to start tracking your finances across
                different payment methods.
              </p>
              <AddAccountDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onSuccess={() => setShowAddDialog(false)}
                trigger={
                  <Button className="bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:from-emerald-600 hover:to-teal-600">
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
              className="group animate-slide-up relative overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className="absolute top-0 right-0 left-0 h-1"
                style={{ backgroundColor: account.colorHex }}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <div
                    className="h-4 w-4 rounded-full shadow-sm"
                    style={{
                      backgroundColor: account.colorHex,
                      boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${account.colorHex}`,
                    }}
                  />
                  <span className="font-semibold">{account.name}</span>
                </CardTitle>
                <div className="flex items-center space-x-1">
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
                        className="hover:bg-muted h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(account._id)}
                    className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
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
                {account.budget && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="text-sm font-medium">
                      ₹{account.budget.toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
