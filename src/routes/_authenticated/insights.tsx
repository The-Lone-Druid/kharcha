import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";

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
                    <Tooltip formatter={(value) => [`₹${value}`, "Spent"]} />
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
                          ₹{sub.amount} • Renews {sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      {sub.remind && (
                        <Badge variant="secondary">Reminder On</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  No subscriptions found. Add subscription transactions to see them here.
                </p>
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
