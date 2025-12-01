import { createFileRoute } from "@tanstack/react-router";
import { DashboardWidgets } from "@/components/ui/dashboard-widgets";
import { AddTransactionSheet } from "@/components/ui/add-transaction-sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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
      <DashboardWidgets />
    </div>
  );
}
