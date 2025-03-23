"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, isValid } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TaskCompletionChartProps {
  data: any[];
  title?: string;
  description?: string;
}

export function TaskCompletionChart({
  data = [],
  title = "Task Completion",
  description = "Tasks completed over time",
}: TaskCompletionChartProps) {
  const [view, setView] = useState<"daily" | "cumulative">("daily");

  // Format data for the chart
  const formatChartData = () => {
    if (!data || data.length === 0) return [];

    // Sort data by date
    const sortedData = [...data].sort((a, b) => {
      const dateA = typeof a.date === "string" ? parseISO(a.date) : a.date;
      const dateB = typeof b.date === "string" ? parseISO(b.date) : b.date;
      return dateA.getTime() - dateB.getTime();
    });

    if (view === "daily") {
      return sortedData.map((item) => {
        const date =
          typeof item.date === "string" ? parseISO(item.date) : item.date;
        return {
          date: isValid(date) ? format(date, "MMM dd") : "Invalid Date",
          completedTasks: item.completedTasks || 0,
        };
      });
    } else {
      // Cumulative view - running total
      let cumulativeTotal = 0;

      return sortedData.map((item) => {
        const date =
          typeof item.date === "string" ? parseISO(item.date) : item.date;
        cumulativeTotal += item.completedTasks || 0;

        return {
          date: isValid(date) ? format(date, "MMM dd") : "Invalid Date",
          cumulativeTotal,
        };
      });
    }
  };

  const chartData = formatChartData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as any)}
          className="w-auto"
        >
          <TabsList className="grid w-[180px] grid-cols-2">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="cumulative">Cumulative</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  label={{
                    value: "Tasks",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fill: "hsl(var(--muted-foreground))",
                    },
                  }}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value, name) => {
                    if (name === "completedTasks")
                      return [`${value}`, "Completed Tasks"];
                    if (name === "cumulativeTotal")
                      return [`${value}`, "Total Completed"];
                    return [value, name];
                  }}
                />
                <Legend />
                {view === "daily" ? (
                  <Line
                    type="monotone"
                    dataKey="completedTasks"
                    name="Completed Tasks"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                ) : (
                  <Line
                    type="monotone"
                    dataKey="cumulativeTotal"
                    name="Total Completed"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No data available yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
