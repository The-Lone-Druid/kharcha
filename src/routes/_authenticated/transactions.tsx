import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { DataTable } from "@/components/ui/data-table";
import { AddTransactionSheet } from "@/components/ui/add-transaction-sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import type { Transaction } from "@/types";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";

export const Route = createFileRoute("/_authenticated/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const transactions = useQuery(api.transactions.listTransactions, {
    limit: 50,
  });

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.getValue("date")), "MMM dd, yyyy"),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => `₹${row.getValue("amount")}`,
    },
    {
      accessorKey: "note",
      header: "Note",
    },
    {
      accessorKey: "accountId",
      header: "Account",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("accountId")}</Badge>
      ),
    },
    {
      accessorKey: "outflowTypeId",
      header: "Type",
      cell: ({ row }) => <Badge>{row.getValue("outflowTypeId")}</Badge>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <AddTransactionSheet
            transaction={transaction as Doc<"transactions">}
            trigger={
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            }
          />
        );
      },
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <div className="flex items-center space-x-2">
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
      <DataTable
        columns={columns}
        data={transactions ?? []}
        searchKey="note"
        searchPlaceholder="Search transactions..."
      />
    </div>
  );
}
