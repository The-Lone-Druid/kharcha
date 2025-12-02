import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { AddTransactionSheet } from "@/components/ui/add-transaction-sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit } from "lucide-react";
import { format } from "date-fns";
import { api } from "../../../convex/_generated/api";
import { AnimatedList } from "@/components/ui/animated-list";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const transactions = useQuery(api.transactions.listTransactions, {
    limit: 50,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (!searchTerm) return transactions;
    return transactions.filter(t =>
      t.note?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Transactions</h2>
        <div className="flex items-center space-x-2">
          <AddTransactionSheet
            trigger={
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            }
          />
        </div>
      </div>
      <div className="space-y-4">
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <AnimatedList className="space-y-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <Card key={transaction._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{transaction.note || "No note"}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {transaction.account ? `${transaction.account.name} (${transaction.account.type})` : "Unknown Account"}
                        </Badge>
                        <Badge>
                          {transaction.outflowType ? `${transaction.outflowType.emoji} ${transaction.outflowType.name}` : "Unknown Type"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-lg font-semibold">₹{transaction.amount}</p>
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
            <p className="text-center text-muted-foreground">No transactions found.</p>
          )}
        </AnimatedList>
      </div>
    </div>
  );
}
