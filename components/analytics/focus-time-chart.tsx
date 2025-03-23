"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
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

interface FocusTimeChartProps {
  data: any[];
  title?: string;
  description?: string;
}

export function FocusTimeChart({
  data = [],
  title = "Daily Focus Time",
  description = "Hours spent focusing each day",
}: FocusTimeChartProps) {
  const [view, setView] = useState<"daily" | "weekly">("daily");

  // Format data for the chart
  const formatChartData = () => {
    if (!data || data.length === 0) return [];

    if (view === "daily") {
      return data.map((item) => {
        const date =
          typeof item.date === "string" ? parseISO(item.date) : item.date;
        return {
          date: isValid(date) ? format(date, "MMM dd") : "Invalid Date",
          focusTime: Math.round(((item.totalWorkMinutes || 0) / 60) * 10) / 10, // Convert to hours with 1 decimal
          completedSessions: item.completedWorkSessions || 0,
        };
      });
    } else {
      // Weekly view - group by week
      const weeklyData: Record<string, any> = {};

      data.forEach((item) => {
        const date =
          typeof item.date === "string" ? parseISO(item.date) : item.date;
        if (!isValid(date)) return;

        const weekKey = format(date, "w-yyyy"); // Week number and year
        const weekLabel = `Week ${format(date, "w")}`;

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            week: weekLabel,
            focusTime: 0,
            completedSessions: 0,
          };
        }

        weeklyData[weekKey].focusTime += (item.totalWorkMinutes || 0) / 60;
        weeklyData[weekKey].completedSessions +=
          item.completedWorkSessions || 0;
      });

      return Object.values(weeklyData).map((week) => ({
        ...week,
        focusTime: Math.round(week.focusTime * 10) / 10, // Round to 1 decimal
      }));
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
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey={view === "daily" ? "date" : "week"}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  yAxisId="left"
                  label={{
                    value: "Hours",
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
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Sessions",
                    angle: 90,
                    position: "insideRight",
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
                    if (name === "focusTime")
                      return [`${value} hours`, "Focus Time"];
                    if (name === "completedSessions")
                      return [`${value}`, "Completed Sessions"];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="focusTime"
                  name="Focus Time"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="completedSessions"
                  name="Completed Sessions"
                  fill="hsl(var(--secondary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
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
