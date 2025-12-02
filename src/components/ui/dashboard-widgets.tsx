import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingUp, Calendar, Target } from "lucide-react";
import { format } from "date-fns";
import { api } from "../../../convex/_generated/api";

export function DashboardWidgets() {
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const monthlySummary = useQuery(api.transactions.getMonthlySummary, {
    month: currentMonth,
  });
  const upcomingEvents = useQuery(api.insights.getUpcomingEvents);
  const trackingStreak = useQuery(api.insights.getTrackingStreak);
  const monthlySpend = useQuery(api.insights.getMonthlySpend);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Total Spent This Month */}
      <Card className="col-span-12 md:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Spent This Month
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{monthlySummary?.totalSpent.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            +20.1% from last month
          </p>
        </CardContent>
      </Card>

      {/* Tracking Streak */}
      <Card className="col-span-12 md:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tracking Streak</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{trackingStreak || 0}</div>
          <p className="text-xs text-muted-foreground">consecutive days</p>
        </CardContent>
      </Card>

      {/* Top 5 Categories Pie Chart */}
      <Card className="col-span-12 md:col-span-4">
        <CardHeader>
          <CardTitle>Top 5 Categories This Month</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlySummary?.topTypes && monthlySummary.topTypes.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={monthlySummary.topTypes.map((item, index) => ({
                    name: item.outflowTypeId,
                    value: item.amount,
                    fill: COLORS[index % COLORS.length],
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground">
              No data available
            </p>
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
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="space-y-2">
              {upcomingEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-2 border rounded space-y-2 sm:space-y-0"
                >
                  <div>
                    <p className="font-medium">{event.description}</p>
                    <p className="text-sm text-muted-foreground">
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
            <p className="text-center text-muted-foreground">
              No upcoming events
            </p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Spend Chart */}
      <Card className="col-span-12 md:col-span-6">
        <CardHeader>
          <CardTitle>Monthly Spend (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlySpend && monthlySpend.length > 0 ? (
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
    </div>
  );
}
