"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  CognitiveTask,
  TimeBlock,
  CognitiveLoadType,
} from "@/lib/cognitive-enhancement/adaptive-task-scheduler";
import { format } from "date-fns";

interface CognitiveLoadChartProps {
  scheduledTasks: { task: CognitiveTask; timeBlock: TimeBlock }[];
  date: Date;
  title?: string;
  description?: string;
}

export function CognitiveLoadChart({
  scheduledTasks,
  date,
  title = "Cognitive Load Distribution",
  description = "Your cognitive workload throughout the day",
}: CognitiveLoadChartProps) {
  const [view, setView] = useState<"load-type" | "energy-level">("load-type");

  // Prepare data for the chart
  const prepareLoadTypeData = () => {
    // Create a map of hours to cognitive load types
    const hourMap: Record<number, Record<CognitiveLoadType, number>> = {};

    // Initialize hours from 8 to 18 (8 AM to 6 PM)
    for (let hour = 8; hour <= 18; hour++) {
      hourMap[hour] = {
        focus: 0,
        creativity: 0,
        "decision-making": 0,
        learning: 0,
        routine: 0,
      };
    }

    // Count tasks by hour and cognitive load type
    scheduledTasks.forEach(({ task, timeBlock }) => {
      if (task.cognitiveLoadType) {
        const hour = timeBlock.startTime.getHours();
        if (hourMap[hour]) {
          hourMap[hour][task.cognitiveLoadType] += 1;
        }
      }
    });

    // Convert to chart data format
    return Object.entries(hourMap).map(([hour, loadTypes]) => ({
      hour: `${hour}:00`,
      ...loadTypes,
    }));
  };

  const prepareEnergyLevelData = () => {
    // Create a map of hours to energy levels
    const hourMap: Record<
      number,
      { high: number; medium: number; low: number }
    > = {};

    // Initialize hours from 8 to 18 (8 AM to 6 PM)
    for (let hour = 8; hour <= 18; hour++) {
      hourMap[hour] = { high: 0, medium: 0, low: 0 };
    }

    // Count tasks by hour and energy level
    scheduledTasks.forEach(({ task, timeBlock }) => {
      if (task.idealEnergyLevel) {
        const hour = timeBlock.startTime.getHours();
        if (hourMap[hour]) {
          hourMap[hour][task.idealEnergyLevel] += 1;
        }
      }
    });

    // Convert to chart data format
    return Object.entries(hourMap).map(([hour, energyLevels]) => ({
      hour: `${hour}:00`,
      ...energyLevels,
    }));
  };

  const loadTypeData = prepareLoadTypeData();
  const energyLevelData = prepareEnergyLevelData();

  // Define colors for cognitive load types
  const loadTypeColors = {
    focus: "#3b82f6", // blue
    creativity: "#eab308", // yellow
    "decision-making": "#a855f7", // purple
    learning: "#22c55e", // green
    routine: "#6b7280", // gray
  };

  // Define colors for energy levels
  const energyLevelColors = {
    high: "#a855f7", // purple
    medium: "#3b82f6", // blue
    low: "#14b8a6", // teal
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="text-sm font-medium mt-1">
            {format(date, "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as any)}
          className="w-auto"
        >
          <TabsList className="grid w-[220px] grid-cols-2">
            <TabsTrigger value="load-type">Cognitive Load</TabsTrigger>
            <TabsTrigger value="energy-level">Energy Level</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={view === "load-type" ? loadTypeData : energyLevelData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="hour" />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value, name) => [
                  value,
                  name.charAt(0).toUpperCase() +
                    name.slice(1).replace("-", " "),
                ]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend
                formatter={(value) =>
                  value.charAt(0).toUpperCase() +
                  value.slice(1).replace("-", " ")
                }
              />

              {view === "load-type" ? (
                <>
                  <Bar
                    dataKey="focus"
                    stackId="a"
                    name="Focus"
                    fill={loadTypeColors.focus}
                  />
                  <Bar
                    dataKey="creativity"
                    stackId="a"
                    name="Creativity"
                    fill={loadTypeColors.creativity}
                  />
                  <Bar
                    dataKey="decision-making"
                    stackId="a"
                    name="Decision Making"
                    fill={loadTypeColors["decision-making"]}
                  />
                  <Bar
                    dataKey="learning"
                    stackId="a"
                    name="Learning"
                    fill={loadTypeColors.learning}
                  />
                  <Bar
                    dataKey="routine"
                    stackId="a"
                    name="Routine"
                    fill={loadTypeColors.routine}
                  />
                </>
              ) : (
                <>
                  <Bar
                    dataKey="high"
                    stackId="a"
                    name="High Energy"
                    fill={energyLevelColors.high}
                  />
                  <Bar
                    dataKey="medium"
                    stackId="a"
                    name="Medium Energy"
                    fill={energyLevelColors.medium}
                  />
                  <Bar
                    dataKey="low"
                    stackId="a"
                    name="Low Energy"
                    fill={energyLevelColors.low}
                  />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
