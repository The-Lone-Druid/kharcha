import { AddSubscriptionDialog } from "@/components/custom/add-subscription-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Calendar, CreditCard, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";

// Custom tooltip component that adapts to theme
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  const { theme } = useTheme();

  if (active && payload && payload.length) {
    const data = payload[0];

    // Handle bar chart data (uses label for month)
    return (
      <div
        className={`rounded-lg border p-3 shadow-lg ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800 text-white"
            : "border-gray-200 bg-white text-gray-900"
        }`}
      >
        <p className="font-medium">{label}</p>
        <p
          className={`text-sm ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
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
  const subscriptionBreakdown = useQuery(
    api.insights.getSubscriptionBreakdown,
    {}
  );
  const subscriptionSpendOverTime = useQuery(
    api.insights.getSubscriptionSpendOverTime,
    { months: 12 }
  );
  const projectedSubscriptionSpend = useQuery(
    api.insights.getProjectedSubscriptionSpend,
    { monthsAhead: 12 }
  );

  const [projectionMonths, setProjectionMonths] = useState<string>("12");
  const [historicalMonths, setHistoricalMonths] = useState<string>("12");

  // Fetch with selected months
  const customProjection = useQuery(
    api.insights.getProjectedSubscriptionSpend,
    { monthsAhead: parseInt(projectionMonths) }
  );

  const customHistorical = useQuery(api.insights.getSubscriptionSpendOverTime, {
    months: parseInt(historicalMonths),
  });

  // Calculate totals for current month and year
  const currentMonthTotal = useMemo(() => {
    if (!subscriptionSpendOverTime || subscriptionSpendOverTime.length === 0)
      return 0;
    return (
      subscriptionSpendOverTime[subscriptionSpendOverTime.length - 1]?.amount ||
      0
    );
  }, [subscriptionSpendOverTime]);

  const currentYearTotal = useMemo(() => {
    if (!subscriptionSpendOverTime) return 0;
    const currentYear = new Date().getFullYear();
    return subscriptionSpendOverTime
      .filter((m) => m.month.startsWith(currentYear.toString()))
      .reduce((sum, m) => sum + m.amount, 0);
  }, [subscriptionSpendOverTime]);

  const projectedYearTotal = useMemo(() => {
    if (!projectedSubscriptionSpend) return 0;
    return projectedSubscriptionSpend
      .slice(0, 12)
      .reduce((sum, m) => sum + m.amount, 0);
  }, [projectedSubscriptionSpend]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex-1 space-y-6 p-4 pt-6 duration-500 md:p-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
            Insights
          </h2>
          <p className="text-muted-foreground mt-1">
            Analyze your spending patterns and trends
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Subscriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Monthly Spend Chart */}
            <Card className="col-span-12 border-violet-500/20 bg-linear-to-br from-violet-500/5 via-purple-500/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-lg bg-violet-500/10 p-2">
                    <TrendingUp className="h-4 w-4 text-violet-500" />
                  </div>
                  Monthly Spend (Last 12 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {monthlySpend ? (
                  monthlySpend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlySpend} barCategoryGap="10%">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-border"
                        />
                        <XAxis
                          dataKey="month"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          fontSize={12}
                          className="fill-muted-foreground"
                        />
                        <YAxis
                          fontSize={12}
                          className="fill-muted-foreground"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="total"
                          fill="url(#colorGradient)"
                          radius={[4, 4, 0, 0]}
                        />
                        <defs>
                          <linearGradient
                            id="colorGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center">
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
                          <span>
                            {item.emoji} {item.name}
                          </span>
                          <Badge>₹{item.total.toLocaleString()}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center">
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
                <CardTitle>Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptions ? (
                  subscriptions.length > 0 ? (
                    <div className="space-y-3">
                      {subscriptions.slice(0, 5).map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-medium">
                              {sub.provider || "Unknown Provider"}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              ₹{sub.amount} • {sub.frequency || "monthly"}
                            </p>
                          </div>
                          {sub.remind && (
                            <Badge variant="secondary">Reminder On</Badge>
                          )}
                        </div>
                      ))}
                      {subscriptions.length > 5 && (
                        <p className="text-muted-foreground text-center text-sm">
                          +{subscriptions.length - 5} more subscriptions
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <CreditCard className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                      <p className="text-muted-foreground mb-4">
                        No subscriptions found. Track your recurring payments
                        here.
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
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
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
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Summary Cards */}
            <Card className="col-span-12 md:col-span-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Month
                </CardTitle>
                <Calendar className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{currentMonthTotal.toLocaleString()}
                </div>
                <p className="text-muted-foreground text-xs">
                  Subscription spending this month
                </p>
              </CardContent>
            </Card>

            <Card className="col-span-12 md:col-span-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Year
                </CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{currentYearTotal.toLocaleString()}
                </div>
                <p className="text-muted-foreground text-xs">
                  Total subscription spending this year
                </p>
              </CardContent>
            </Card>

            <Card className="col-span-12 md:col-span-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Projected (12 months)
                </CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{projectedYearTotal.toLocaleString()}
                </div>
                <p className="text-muted-foreground text-xs">
                  Estimated spending for next 12 months
                </p>
              </CardContent>
            </Card>

            {/* Historical Spend Chart */}
            <Card className="col-span-12">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Subscription Spend Over Time</CardTitle>
                  <Select
                    value={historicalMonths}
                    onValueChange={setHistoricalMonths}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                      <SelectItem value="24">24 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {customHistorical ? (
                  customHistorical.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={customHistorical}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="monthLabel"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center">
                      No historical data available
                    </p>
                  )
                ) : (
                  <Skeleton className="h-72 w-full" />
                )}
              </CardContent>
            </Card>

            {/* Projected Spend Chart */}
            <Card className="col-span-12">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Projected Subscription Spend</CardTitle>
                  <Select
                    value={projectionMonths}
                    onValueChange={setProjectionMonths}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                      <SelectItem value="24">24 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {customProjection ? (
                  customProjection.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={customProjection}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="monthLabel"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="amount" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center">
                      No projection data available
                    </p>
                  )
                ) : (
                  <Skeleton className="h-72 w-full" />
                )}
              </CardContent>
            </Card>

            {/* Subscription Breakdown by Provider */}
            <Card className="col-span-12">
              <CardHeader>
                <CardTitle>Subscription Breakdown by Provider</CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptionBreakdown ? (
                  subscriptionBreakdown.breakdown.length > 0 ? (
                    <div className="space-y-3">
                      {subscriptionBreakdown.breakdown
                        .sort((a, b) => b.amount - a.amount)
                        .map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{item.provider}</p>
                              <p className="text-muted-foreground text-sm">
                                {item.count} transaction
                                {item.count > 1 ? "s" : ""}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-base">
                              ₹{item.amount.toLocaleString()}
                            </Badge>
                          </div>
                        ))}
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Total</span>
                          <Badge className="text-base">
                            ₹{subscriptionBreakdown.total.toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center">
                      No subscription data available
                    </p>
                  )
                ) : (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
