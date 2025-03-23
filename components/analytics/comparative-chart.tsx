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
  ReferenceLine,
} from "recharts";
import {
  format,
  parseISO,
  isValid,
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ComparativeChartProps {
  currentData: any[];
  previousData?: any[];
  dataKey: string;
  title?: string;
  description?: string;
  valueFormatter?: (value: number) => string;
  dateKey?: string;
  comparisonType?: "week" | "month" | "year";
}

export function ComparativeChart({
  currentData = [],
  previousData = [],
  dataKey,
  title = "Comparative Analysis",
  description = "Compare current and previous periods",
  valueFormatter = (value: number) => value.toString(),
  dateKey = "date",
  comparisonType = "week",
}: ComparativeChartProps) {
  const [view, setView] = useState<"bar" | "line">("bar");

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";

    const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    if (!isValid(date)) return dateStr;

    switch (comparisonType) {
      case "week":
        return format(date, "EEE");
      case "month":
        return format(date, "MMM d");
      case "year":
        return format(date, "MMM");
      default:
        return format(date, "MMM d");
    }
  };

  // Get comparison label
  const getComparisonLabel = () => {
    switch (comparisonType) {
      case "week":
        return "Previous Week";
      case "month":
        return "Previous Month";
      case "year":
        return "Previous Year";
      default:
        return "Previous Period";
    }
  };

  // Prepare data for chart
  const prepareChartData = () => {
    // If no previous data, just return current data
    if (!previousData || previousData.length === 0) {
      return currentData.map((item) => ({
        ...item,
        [dataKey]: item[dataKey] || 0,
        formattedDate: formatDate(item[dateKey]),
      }));
    }

    // Combine current and previous data
    return currentData.map((currentItem, index) => {
      const previousItem = previousData[index] || {};

      return {
        ...currentItem,
        [dataKey]: currentItem[dataKey] || 0,
        [`previous${dataKey.charAt(0).toUpperCase() + dataKey.slice(1)}`]:
          previousItem[dataKey] || 0,
        formattedDate: formatDate(currentItem[dateKey]),
      };
    });
  };

  const chartData = prepareChartData();

  // Calculate improvement percentage
  const calculateImprovement = () => {
    if (!previousData || previousData.length === 0) return null;

    const currentTotal = currentData.reduce(
      (sum, item) => sum + (item[dataKey] || 0),
      0
    );
    const previousTotal = previousData.reduce(
      (sum, item) => sum + (item[dataKey] || 0),
      0
    );

    if (previousTotal === 0) return null;

    const percentChange =
      ((currentTotal - previousTotal) / previousTotal) * 100;
    return {
      percentage: Math.round(percentChange),
      isImprovement: percentChange > 0,
    };
  };

  const improvement = calculateImprovement();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={`item-${index}`}
              className={cn(
                "text-sm",
                entry.dataKey.startsWith("previous")
                  ? "text-muted-foreground"
                  : "text-primary"
              )}
            >
              {entry.dataKey.startsWith("previous")
                ? getComparisonLabel()
                : "Current"}
              : {valueFormatter(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-4">
          {improvement && (
            <div
              className={cn(
                "text-sm font-medium",
                improvement.isImprovement ? "text-green-500" : "text-red-500"
              )}
            >
              {improvement.isImprovement ? "+" : ""}
              {improvement.percentage}% vs {getComparisonLabel().toLowerCase()}
            </div>
          )}
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as any)}
            className="w-auto"
          >
            <TabsList className="grid w-[120px] grid-cols-2">
              <TabsTrigger value="bar">Bar</TabsTrigger>
              <TabsTrigger value="line">Line</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {view === "bar" ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="formattedDate" />
                  <YAxis tickFormatter={valueFormatter} width={60} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey={dataKey}
                    name="Current"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  {previousData && previousData.length > 0 && (
                    <Bar
                      dataKey={`previous${
                        dataKey.charAt(0).toUpperCase() + dataKey.slice(1)
                      }`}
                      name={getComparisonLabel()}
                      fill="hsl(var(--muted-foreground))"
                      radius={[4, 4, 0, 0]}
                      opacity={0.6}
                    />
                  )}
                </BarChart>
              ) : (
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="formattedDate" />
                  <YAxis tickFormatter={valueFormatter} width={60} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey={dataKey}
                    name="Current"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  {previousData && previousData.length > 0 && (
                    <Bar
                      dataKey={`previous${
                        dataKey.charAt(0).toUpperCase() + dataKey.slice(1)
                      }`}
                      name={getComparisonLabel()}
                      fill="hsl(var(--muted-foreground))"
                      radius={[4, 4, 0, 0]}
                      opacity={0.6}
                    />
                  )}
                </BarChart>
              )}
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
