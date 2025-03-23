"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FocusScoreGaugeProps {
  score: number;
  previousScore?: number;
  title?: string;
  description?: string;
}

export function FocusScoreGauge({
  score = 0,
  previousScore,
  title = "Focus Score",
  description = "Your focus effectiveness score",
}: FocusScoreGaugeProps) {
  const [view, setView] = useState<"gauge" | "comparison">("gauge");
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate the score on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  // Get color based on score
  const getScoreColor = (value: number) => {
    if (value < 30) return "hsl(var(--destructive))";
    if (value < 50) return "hsl(var(--warning))";
    if (value < 70) return "hsl(var(--amber))";
    if (value < 90) return "hsl(var(--success))";
    return "hsl(var(--primary))";
  };

  // Get text description based on score
  const getScoreDescription = (value: number) => {
    if (value < 30) return "Needs improvement";
    if (value < 50) return "Fair";
    if (value < 70) return "Good";
    if (value < 90) return "Great";
    return "Excellent";
  };

  // Calculate score change percentage
  const getScoreChange = () => {
    if (previousScore === undefined || previousScore === 0) return null;
    const change = score - previousScore;
    const percentage = Math.round((change / previousScore) * 100);
    return { change, percentage };
  };

  const scoreChange = getScoreChange();

  // Prepare data for gauge chart
  const gaugeData = [
    { name: "Score", value: animatedScore },
    { name: "Remaining", value: 100 - animatedScore },
  ];

  // Prepare data for comparison chart
  const comparisonData =
    previousScore !== undefined
      ? [
          { name: "Current", value: score },
          { name: "Previous", value: previousScore },
        ]
      : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {previousScore !== undefined && (
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as any)}
            className="w-auto"
          >
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="gauge">Gauge</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {view === "gauge" ? (
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell
                      key="score"
                      fill={getScoreColor(animatedScore)}
                      cornerRadius={10}
                    />
                    <Cell key="remaining" fill="hsl(var(--muted))" />
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Score"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              ) : (
                <PieChart>
                  <Pie
                    data={comparisonData}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    <Cell fill={getScoreColor(score)} />
                    <Cell fill="hsl(var(--muted-foreground))" />
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value}%`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="mt-4 text-center">
            <div className="text-4xl font-bold">
              {animatedScore}
              <span className="text-xl">%</span>
            </div>
            <div
              className={cn(
                "text-sm font-medium",
                `text-${getScoreColor(animatedScore)
                  .replace("hsl(var(--", "")
                  .replace("))", "")}`
              )}
            >
              {getScoreDescription(animatedScore)}
            </div>
            {scoreChange && (
              <div
                className={cn(
                  "text-xs mt-1",
                  scoreChange.change > 0
                    ? "text-green-500"
                    : scoreChange.change < 0
                    ? "text-red-500"
                    : "text-muted-foreground"
                )}
              >
                {scoreChange.change > 0 ? "+" : ""}
                {scoreChange.change}% ({scoreChange.percentage}%{" "}
                {scoreChange.change > 0 ? "increase" : "decrease"})
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
