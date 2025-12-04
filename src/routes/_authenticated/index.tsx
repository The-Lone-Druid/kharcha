import { AddSubscriptionDialog } from "@/components/custom/add-subscription-sheet";
import { AddTransactionSheet } from "@/components/custom/add-transaction-sheet";
import { DashboardWidgets } from "@/components/custom/dashboard-widgets";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex-1 space-y-6 p-4 pt-6 duration-500 md:p-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Track your expenses and manage your finances
          </p>
        </div>
        <div className="flex gap-3">
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
      <DashboardWidgets />
    </div>
  );
}
