import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Wallet } from "lucide-react";
import { useState } from "react";
import { AddAccountDialog } from "@/components/ui/add-account-dialog";
import { type Doc, type Id } from "@convex/_generated/dataModel";
import { useAppData } from "../_authenticated";

export const Route = createFileRoute("/_authenticated/accounts")({
  component: AccountsPage,
});

function AccountsPage() {
  const { accounts } = useAppData();
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Accounts
        </h2>
        <div className="flex items-center space-x-2">
          <AddAccountDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
            account={editingAccount}
            onSuccess={() => {
              setShowAddDialog(false);
              setEditingAccount(null);
            }}
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts ? (
          accounts.map((account) => (
            <Card key={account._id} className="relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: account.colorHex }}
                  />
                  {account.name}
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
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(account._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="mt-2">
                  {account.type}
                </Badge>
              </CardContent>
            </Card>
          ))
        ) : (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-6 w-12" />
              </CardContent>
            </Card>
          ))
        )}

        {accounts && accounts.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No accounts yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first account to start tracking your finances.
              </p>
              <AddAccountDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onSuccess={() => setShowAddDialog(false)}
                trigger={
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Account
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
