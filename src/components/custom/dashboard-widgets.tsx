import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { Calendar, Target, TrendingUp } from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
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

    // Handle pie chart data (has payload.name)
    if (data.payload && data.payload.name) {
      return (
        <div
          className={`rounded-lg border p-3 shadow-lg ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800 text-white"
              : "border-gray-200 bg-white text-gray-900"
          }`}
        >
          <p className="font-medium">{data.payload.name}</p>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Amount: <span className="font-semibold">₹{data.value}</span>
          </p>
        </div>
      );
    }

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

export function DashboardWidgets() {
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const monthlySummary = useQuery(api.transactions.getMonthlySummary, {
    month: currentMonth,
  });
  const upcomingEvents = useQuery(api.insights.getUpcomingEvents);
  const accountBudgets = useQuery(api.insights.getAccountBudgetsAndSpending);
  const monthlySpend = useQuery(api.insights.getMonthlySpend);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Total Spent This Month */}
      <Card className="col-span-12 border-amber-500/20 bg-linear-to-br from-amber-500/10 via-orange-500/5 to-transparent transition-colors hover:border-amber-500/40 md:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Spent This Month
          </CardTitle>
          <div className="rounded-lg bg-amber-500/10 p-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          {monthlySummary ? (
            <>
              <div className="bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-2xl font-bold text-transparent">
                ₹{monthlySummary.totalSpent.toLocaleString() || 0}
              </div>
              <p className="text-muted-foreground text-xs">
                +20.1% from last month
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Health */}
      <Card className="col-span-12 border-green-500/20 bg-linear-to-br from-green-500/10 via-emerald-500/5 to-transparent transition-colors hover:border-green-500/40 md:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
          <div className="rounded-lg bg-green-500/10 p-2">
            <Target className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          {accountBudgets !== undefined ? (
            accountBudgets.length > 0 ? (
              <>
                <div className="space-y-3">
                  {accountBudgets.slice(0, 3).map((account) => {
                    const isOverBudget = account.percentage > 100;
                    const isNearBudget = account.percentage > 80 && account.percentage <= 100;
                    const colorClass = isOverBudget
                      ? "text-red-600 dark:text-red-400"
                      : isNearBudget
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-green-600 dark:text-green-400";

                    return (
                      <div key={account.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="truncate font-medium">
                            {account.name}
                          </span>
                          <span className={`font-semibold ${colorClass}`}>
                            {account.percentage}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isOverBudget
                                ? "bg-red-500"
                                : isNearBudget
                                ? "bg-amber-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(account.percentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {accountBudgets.length > 3 && (
                  <p className="text-muted-foreground mt-3 text-xs">
                    +{accountBudgets.length - 3} more accounts
                  </p>
                )}
              </>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  No budgets set
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Set budgets in account settings
                </p>
              </div>
            )
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-2 w-3/4" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 5 Categories Pie Chart */}
      <Card className="col-span-12 border-blue-500/20 bg-linear-to-br from-blue-500/10 via-cyan-500/5 to-transparent transition-colors hover:border-blue-500/40 md:col-span-4">
        <CardHeader>
          <CardTitle>Top 5 Categories This Month</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlySummary?.topTypes ? (
            monthlySummary.topTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={monthlySummary.topTypes.map((item, index) => ({
                      name: item.name,
                      value: item.amount,
                      fill: COLORS[index % COLORS.length],
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) =>
                      percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                    }
                    outerRadius={70}
                    innerRadius={25}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {monthlySummary.topTypes.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center">
                No data available
              </p>
            )
          ) : (
            <Skeleton className="h-48 w-full" />
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="col-span-12 md:col-span-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming (Next 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents ? (
            upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col space-y-2 rounded border p-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-2"
                  >
                    <div>
                      <p className="font-medium">{event.description}</p>
                      <p className="text-muted-foreground text-sm">
                        {format(new Date(event.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        event.type === "renewal" ? "default" : "destructive"
                      }
                      className="self-start sm:self-center"
                    >
                      ₹{event.amount}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center">
                No upcoming events
              </p>
            )
          ) : (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2 rounded border p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-16 self-end" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Spend Chart */}
      <Card className="col-span-12 md:col-span-6">
        <CardHeader>
          <CardTitle>Monthly Spend (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlySpend ? (
            monthlySpend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
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
              <p className="text-muted-foreground text-center">
                No data available
              </p>
            )
          ) : (
            <Skeleton className="h-64 w-full" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
