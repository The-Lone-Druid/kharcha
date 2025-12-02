import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useTheme } from "@/hooks/use-theme";
import { AddSubscriptionDialog } from "@/components/ui/add-subscription-dialog";
import { CreditCard } from "lucide-react";

// Custom tooltip component that adapts to theme
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  const { theme } = useTheme();

  if (active && payload && payload.length) {
    const data = payload[0];

    // Handle bar chart data (uses label for month)
    return (
      <div className={`rounded-lg border p-3 shadow-lg ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700 text-white'
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <p className="font-medium">{label}</p>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Spent: <span className="font-semibold">₹{data.value}</span>
        </p>
      </div>
    );
  }

  return null;
};

export const Route = createFileRoute("/_authenticated/insights")({
  component: InsightsPage,
});

function InsightsPage() {
  const monthlySpend = useQuery(api.insights.getMonthlySpend);
  const outflowBreakdown = useQuery(api.insights.getOutflowTypeBreakdown, {});
  const subscriptions = useQuery(api.insights.getSubscriptions);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Insights</h2>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Monthly Spend Chart */}
        <Card className="col-span-12">
          <CardHeader>
            <CardTitle>Monthly Spend (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlySpend ? (
              monthlySpend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlySpend} barCategoryGap="10%">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground">
                  No data available
                </p>
              )
            ) : (
              <Skeleton className="h-72 w-full" />
            )}
          </CardContent>
        </Card>

        {/* Outflow Type Breakdown */}
        <Card className="col-span-12 md:col-span-6">
          <CardHeader>
            <CardTitle>Outflow Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {outflowBreakdown ? (
              outflowBreakdown.length > 0 ? (
                <div className="space-y-2">
                  {outflowBreakdown.map((item) => (
                    <div
                      key={item.outflowTypeId}
                      className="flex justify-between"
                    >
                      <span>{item.emoji} {item.name}</span>
                      <Badge>₹{item.total}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  No data available
                </p>
              )
            ) : (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscriptions */}
        <Card className="col-span-12 md:col-span-6">
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions ? (
              subscriptions.length > 0 ? (
                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{sub.provider || "Unknown Provider"}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{sub.amount} • {sub.frequency || "monthly"} • Renews {sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      {sub.remind && (
                        <Badge variant="secondary">Reminder On</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No subscriptions found. Track your recurring payments here.
                  </p>
                  <AddSubscriptionDialog
                    trigger={
                      <Button>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Add Your First Subscription
                      </Button>
                    }
                  />
                </div>
              )
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
