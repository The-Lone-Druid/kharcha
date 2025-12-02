import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { AddTransactionSheet } from "@/components/ui/add-transaction-sheet";
import { AddSubscriptionDialog } from "@/components/ui/add-subscription-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { api } from "@convex/_generated/api";
import { AnimatedList } from "@/components/ui/animated-list";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const transactions = useQuery(api.transactions.listTransactions, {
    limit: 50,
  });
  const accounts = useQuery(api.accounts.listAccounts);
  const outflowTypes = useQuery(api.outflowTypes.listOutflowTypes);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedOutflowType, setSelectedOutflowType] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

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

        <AnimatedList>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <Card key={transaction._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {transaction.note || "No note"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {transaction.account
                            ? `${transaction.account.name} (${transaction.account.type})`
                            : "Unknown Account"}
                        </Badge>
                        <Badge>
                          {transaction.outflowType
                            ? `${transaction.outflowType.emoji} ${transaction.outflowType.name}`
                            : "Unknown Type"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-lg font-semibold">
                        ₹{transaction.amount}
                      </p>
                      <AddTransactionSheet
                        transaction={transaction}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : transactions === undefined ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-24" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              No transactions found.
            </p>
          )}
        </AnimatedList>
      </div>
    </div>
  );
}
