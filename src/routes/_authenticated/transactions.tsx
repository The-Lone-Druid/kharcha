import { AddSubscriptionDialog } from "@/components/custom/add-subscription-dialog";
import { AddTransactionSheet } from "@/components/custom/add-transaction-sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { CreditCard, Edit, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const accounts = useQuery(api.accounts.listAccounts);
  const outflowTypes = useQuery(api.outflowTypes.listOutflowTypes);
  const transactions = useQuery(api.transactions.listTransactions, {
    limit: 50,
  });
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedOutflowType, setSelectedOutflowType] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const handleDelete = async (id: Id<"transactions">) => {
    try {
      await deleteTransaction({ id });
      toast.success("Transaction deleted successfully");
    } catch (error) {
      toast.error("Failed to delete transaction");
      console.error(error);
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter((t) => {
      // Search term filter
      if (
        searchTerm &&
        !t.note?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Account filter
      if (selectedAccount !== "all" && t.accountId !== selectedAccount) {
        return false;
      }

      // Outflow type filter
      if (
        selectedOutflowType !== "all" &&
        t.outflowTypeId !== selectedOutflowType
      ) {
        return false;
      }

      // Date filter
      if (dateFilter !== "all") {
        const transactionDate = new Date(t.date);
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        switch (dateFilter) {
          case "today":
            if (transactionDate < today) return false;
            break;
          case "week":
            if (transactionDate < weekAgo) return false;
            break;
          case "month":
            if (transactionDate < monthAgo) return false;
            break;
        }
      }

      return true;
    });
  }, [
    transactions,
    searchTerm,
    selectedAccount,
    selectedOutflowType,
    dateFilter,
  ]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex-1 space-y-6 p-4 pt-6 duration-500 md:p-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
            Transactions
          </h2>
          <p className="text-muted-foreground mt-1">
            View and manage all your transactions
          </p>
        </div>
        <div className="flex items-stretch gap-3 sm:items-center">
          <AddSubscriptionDialog
            trigger={
              <Button
                variant="outline"
                className="gap-2 shadow-sm transition-all hover:shadow-md"
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Add Subscription</span>
                <span className="sm:hidden">Subscription</span>
              </Button>
            }
          />
          <AddTransactionSheet
            trigger={
              <Button className="from-primary hover:from-primary/90 shadow-primary/25 hover:shadow-primary/40 gap-2 bg-linear-to-r to-orange-600 shadow-lg transition-all hover:to-orange-600/90">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Transaction</span>
                <span className="sm:hidden">Add</span>
              </Button>
            }
          />
        </div>
      </div>
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="bg-muted/30 border-border/50 space-y-4 rounded-xl border p-4">
          {/* Search Bar */}
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-background w-full"
          />

          {/* Filters */}
          <div className="grid grid-cols-12 items-end gap-3">
            <div className="col-span-4">
              <Select
                value={selectedAccount}
                onValueChange={setSelectedAccount}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts?.map((account) => (
                    <SelectItem key={account._id} value={account._id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-4">
              <Select
                value={selectedOutflowType}
                onValueChange={setSelectedOutflowType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {outflowTypes?.map((type) => (
                    <SelectItem key={type._id} value={type._id}>
                      {type.emoji} {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-4">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="group bg-card border-border flex cursor-pointer items-start gap-4 rounded-xl border px-4 py-3 shadow-sm transition-all hover:shadow-md"
              >
                {/* Category Icon */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl shadow-sm"
                  style={{
                    backgroundColor: transaction.outflowType?.colorHex
                      ? `color-mix(in srgb, ${transaction.outflowType.colorHex} 18%, transparent)`
                      : "hsl(var(--primary) / 0.1)",
                  }}
                >
                  {transaction.outflowType?.emoji || "💰"}
                </div>

                {/* Transaction Details */}
                <div className="min-w-0 flex-1">
                  {/* Top row - Title and Amount */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-foreground truncate font-semibold">
                        {transaction.note || "Untitled Transaction"}
                      </h4>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {transaction.outflowType?.name || "Uncategorized"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-lg font-bold text-red-500 dark:text-red-400">
                        -₹{transaction.amount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Bottom row - Meta info */}
                  <div className="border-border/40 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2">
                    {/* Account */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            transaction.account?.colorHex || "#888",
                        }}
                      />
                      <span className="text-muted-foreground text-sm">
                        {transaction.account?.name || "Unknown"}
                      </span>
                    </div>

                    {/* Account Type */}
                    <span className="text-muted-foreground/70 text-sm">
                      {transaction.account?.type || "N/A"}
                    </span>

                    {/* Date & Time */}
                    <span className="text-muted-foreground text-sm">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </span>
                    <span className="text-muted-foreground/70 text-sm">
                      {format(new Date(transaction.date), "h:mm a")}
                    </span>

                    {/* Actions - pushed to right */}
                    <div className="ml-auto flex items-center gap-2">
                      <AddTransactionSheet
                        transaction={transaction}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                          >
                            <Edit className="mr-1 h-3.5 w-3.5" />
                            <span className="text-xs">Edit</span>
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Transaction
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this transaction?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(transaction._id)}
                              className="bg-destructive hover:bg-destructive/90 text-white"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : transactions === undefined ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border-border flex items-start gap-4 rounded-xl border px-4 py-3"
              >
                <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                <div className="flex-1">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                  {/* Bottom row */}
                  <div className="border-border/40 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-2.5 w-2.5 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-14" />
                    <div className="ml-auto">
                      <Skeleton className="h-7 w-14 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <CreditCard className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold">No transactions found</h3>
              <p className="text-muted-foreground mt-1 max-w-xs text-sm">
                {searchTerm ||
                selectedAccount !== "all" ||
                selectedOutflowType !== "all" ||
                dateFilter !== "all"
                  ? "Try adjusting your filters to see more results"
                  : "Start by adding your first transaction"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
