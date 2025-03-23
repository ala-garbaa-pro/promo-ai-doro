"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BrainCircuit,
  TrendingUp,
  Clock,
  Calendar,
  Lightbulb,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AIInsightsProps {
  data: any;
  onRefreshInsights?: () => Promise<void>;
  isLoading?: boolean;
}

export function AIInsights({
  data,
  onRefreshInsights,
  isLoading = false,
}: AIInsightsProps) {
  const [activeTab, setActiveTab] = useState("productivity");
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>(
    {}
  );

  // Handle insight feedback
  const handleFeedback = (insightId: string, isHelpful: boolean) => {
    // In a real implementation, this would send feedback to the server
    console.log(
      `Insight ${insightId} feedback: ${isHelpful ? "helpful" : "not helpful"}`
    );
    setFeedbackGiven((prev) => ({ ...prev, [insightId]: true }));
  };

  // Generate insights based on the data
  const generateInsights = () => {
    if (!data) return { productivity: [], focus: [], habits: [] };

    const insights = {
      productivity: [
        {
          id: "prod-1",
          title: "Most Productive Day",
          description: data.mostProductiveDay
            ? `Your most productive day is ${data.mostProductiveDay}, with an average of ${data.mostProductiveDayMinutes} minutes of focus time.`
            : "We don't have enough data to determine your most productive day yet.",
          icon: <Calendar className="h-5 w-5" />,
          type: "observation",
        },
        {
          id: "prod-2",
          title: "Productivity Peak",
          description: data.mostProductiveHour
            ? `You're most productive around ${data.mostProductiveHour}, completing the most focus sessions during this time.`
            : "We don't have enough data to determine your productivity peak yet.",
          icon: <TrendingUp className="h-5 w-5" />,
          type: "observation",
        },
        {
          id: "prod-3",
          title: "Task Completion Pattern",
          description: data.taskCompletionRate
            ? `You complete about ${data.taskCompletionRate}% of your tasks. Consider breaking larger tasks into smaller, more manageable ones.`
            : "Start adding and completing tasks to see insights about your task completion patterns.",
          icon: <Lightbulb className="h-5 w-5" />,
          type: "suggestion",
        },
      ],
      focus: [
        {
          id: "focus-1",
          title: "Focus Score Trend",
          description: data.focusScoreTrend
            ? `Your focus score has ${
                data.focusScoreTrend === "increasing" ? "improved" : "decreased"
              } by ${data.focusScoreChange}% compared to last month.`
            : "Continue using the app to see trends in your focus score.",
          icon: <BrainCircuit className="h-5 w-5" />,
          type: "observation",
        },
        {
          id: "focus-2",
          title: "Session Completion",
          description: data.sessionCompletionRate
            ? `You complete ${
                data.sessionCompletionRate
              }% of your focus sessions. ${
                data.sessionCompletionRate < 70
                  ? "Try shorter sessions to improve completion rate."
                  : "Great job staying focused!"
              }`
            : "Complete more focus sessions to see insights about your session completion rate.",
          icon: <Clock className="h-5 w-5" />,
          type:
            data.sessionCompletionRate && data.sessionCompletionRate < 70
              ? "suggestion"
              : "praise",
        },
        {
          id: "focus-3",
          title: "Optimal Session Length",
          description: data.optimalSessionLength
            ? `Your most successful focus sessions are around ${data.optimalSessionLength} minutes long.`
            : "We need more data to determine your optimal session length.",
          icon: <Lightbulb className="h-5 w-5" />,
          type: "suggestion",
        },
      ],
      habits: [
        {
          id: "habit-1",
          title: "Consistency",
          description: data.consistencyStreak
            ? `You've maintained a ${data.consistencyStreak}-day streak of focus sessions. Keep it up!`
            : "Try to use the app daily to build a consistent habit.",
          icon: <Calendar className="h-5 w-5" />,
          type:
            data.consistencyStreak && data.consistencyStreak > 3
              ? "praise"
              : "suggestion",
        },
        {
          id: "habit-2",
          title: "Time of Day Pattern",
          description: data.timeOfDayPattern
            ? `You tend to focus most during the ${data.timeOfDayPattern} hours.`
            : "We need more data to identify your preferred focus time.",
          icon: <Clock className="h-5 w-5" />,
          type: "observation",
        },
        {
          id: "habit-3",
          title: "Weekly Pattern",
          description: data.weekdayVsWeekend
            ? `You're ${
                data.weekdayVsWeekend === "weekday"
                  ? "more productive on weekdays"
                  : "more productive on weekends"
              } than ${
                data.weekdayVsWeekend === "weekday" ? "weekends" : "weekdays"
              }.`
            : "Continue using the app to see patterns in your weekly productivity.",
          icon: <TrendingUp className="h-5 w-5" />,
          type: "observation",
        },
      ],
    };

    return insights;
  };

  const insights = generateInsights();

  // Get badge color based on insight type
  const getInsightBadgeColor = (type: string) => {
    switch (type) {
      case "observation":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "suggestion":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "praise":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <CardTitle>AI Insights</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshInsights}
          disabled={isLoading || !onRefreshInsights}
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
          />
          Refresh Insights
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
            <TabsTrigger value="focus">Focus</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
          </TabsList>

          {Object.keys(insights).map((key) => (
            <TabsContent key={key} value={key} className="space-y-4 mt-4">
              {isLoading ? (
                // Loading state
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <Skeleton className="h-6 w-1/3" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : insights[key as keyof typeof insights].length > 0 ? (
                // Insights
                insights[key as keyof typeof insights].map((insight) => (
                  <Card key={insight.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {insight.icon}
                            <h3 className="font-semibold">{insight.title}</h3>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              getInsightBadgeColor(insight.type)
                            )}
                          >
                            {insight.type.charAt(0).toUpperCase() +
                              insight.type.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>

                        {/* Feedback buttons */}
                        {!feedbackGiven[insight.id] && (
                          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                            <span>Was this helpful?</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => handleFeedback(insight.id, true)}
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              Yes
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => handleFeedback(insight.id, false)}
                            >
                              <ThumbsDown className="h-3 w-3 mr-1" />
                              No
                            </Button>
                          </div>
                        )}

                        {feedbackGiven[insight.id] && (
                          <div className="mt-4 text-xs text-muted-foreground">
                            Thanks for your feedback!
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                // No insights
                <div className="flex flex-col items-center justify-center py-8">
                  <BrainCircuit className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Not enough data to generate insights yet.
                    <br />
                    Continue using the app to see AI-powered insights.
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
