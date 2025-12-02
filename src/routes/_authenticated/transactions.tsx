import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { AddTransactionSheet } from "@/components/ui/add-transaction-sheet";
import { AddSubscriptionDialog } from "@/components/ui/add-subscription-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Edit, CreditCard, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { api } from "@convex/_generated/api";
import { useMemo, useState } from "react";
import { useAppData } from "../_authenticated";
import { toast } from "sonner";
import type { Id } from "@convex/_generated/dataModel";

export const Route = createFileRoute("/_authenticated/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const { accounts, outflowTypes } = useAppData();
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Transactions
        </h2>
        <div className="flex items-stretch sm:items-center gap-2">
          <AddSubscriptionDialog
            trigger={
              <Button variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Add Subscription
              </Button>
            }
          />
          <AddTransactionSheet
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            }
          />
        </div>
      </div>
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />

          {/* Filters */}
          <div className="grid grid-cols-12 gap-3 items-end">
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
                className="group flex items-start gap-4 px-4 py-3 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                {/* Category Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm"
                  style={{
                    backgroundColor: transaction.outflowType?.colorHex
                      ? `color-mix(in srgb, ${transaction.outflowType.colorHex} 18%, transparent)`
                      : 'hsl(var(--primary) / 0.1)',
                  }}
                >
                  {transaction.outflowType?.emoji || "💰"}
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  {/* Top row - Title and Amount */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-foreground truncate">
                        {transaction.note || "Untitled Transaction"}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {transaction.outflowType?.name || "Uncategorized"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-lg font-mono text-red-500 dark:text-red-400">
                        -₹{transaction.amount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  
                  {/* Bottom row - Meta info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 pt-2 border-t border-border/40">
                    {/* Account */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: transaction.account?.colorHex || "#888",
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {transaction.account?.name || "Unknown"}
                      </span>
                    </div>
                    
                    {/* Account Type */}
                    <span className="text-sm text-muted-foreground/70">
                      {transaction.account?.type || "N/A"}
                    </span>
                    
                    {/* Date & Time */}
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </span>
                    <span className="text-sm text-muted-foreground/70">
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
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">Edit</span>
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this transaction? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(transaction._id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
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
              <div key={i} className="flex items-start gap-4 px-4 py-3 rounded-xl bg-card border border-border">
                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
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
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 pt-2 border-t border-border/40">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="w-2.5 h-2.5 rounded-full" />
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
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">No transactions found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {searchTerm || selectedAccount !== "all" || selectedOutflowType !== "all" || dateFilter !== "all"
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
