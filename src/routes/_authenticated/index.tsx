import { createFileRoute } from "@tanstack/react-router";
import { DashboardWidgets } from "@/components/ui/dashboard-widgets";
import { AddTransactionSheet } from "@/components/ui/add-transaction-sheet";
import { AddSubscriptionDialog } from "@/components/ui/add-subscription-dialog";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Dashboard
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <AddSubscriptionDialog
            trigger={
              <Button variant="outline" className="w-full sm:w-auto">
                <CreditCard className="mr-2 h-4 w-4" />
                Add Subscription
              </Button>
            }
          />
          <AddTransactionSheet
            trigger={
              <Button className="w-full sm:w-auto">
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
