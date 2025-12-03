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
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Track your expenses and manage your finances
          </p>
        </div>
        <div className="flex gap-3">
          <AddSubscriptionDialog
            trigger={
              <Button variant="outline" className="gap-2 shadow-sm hover:shadow-md transition-all">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Add Subscription</span>
                <span className="sm:hidden">Subscription</span>
              </Button>
            }
          />
          <AddTransactionSheet
            trigger={
              <Button className="gap-2 bg-linear-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Transaction</span>
                <span className="sm:hidden">Add</span>
              </Button>
            }
          />
        </div>
      </div>
      <DashboardWidgets />
    </div>
  );
}
