import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";

export const Route = createFileRoute("/_authenticated/insights")({
  component: InsightsPage,
});

function InsightsPage() {
  const monthlySpend = useQuery(api.insights.getMonthlySpend);
  const outflowBreakdown = useQuery(api.insights.getOutflowTypeBreakdown, {});

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Insights</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Spend Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Monthly Spend (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlySpend && monthlySpend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySpend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value}`, "Spent"]} />
                  <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground">
                No data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Outflow Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Outflow Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {outflowBreakdown && outflowBreakdown.length > 0 ? (
              <div className="space-y-2">
                {outflowBreakdown.map((item) => (
                  <div
                    key={item.outflowTypeId}
                    className="flex justify-between"
                  >
                    <span>{item.outflowTypeId}</span>
                    <Badge>₹{item.total}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                No data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
