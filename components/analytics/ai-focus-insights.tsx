"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Clock, Zap, Calendar } from "lucide-react";
import { AnimatedTransition } from "@/components/ui/animated-transition";

interface FocusInsight {
  id: string;
  title: string;
  description: string;
  type: "tip" | "insight" | "recommendation";
  icon: React.ReactNode;
}

interface AIFocusInsightsProps {
  userId?: string;
  completedSessions?: number;
  totalFocusTime?: number; // in minutes
  averageSessionLength?: number; // in minutes
  focusScore?: number; // 0-100
  streak?: number; // consecutive days
  mostProductiveTime?: string;
}

export function AIFocusInsights({
  userId,
  completedSessions = 0,
  totalFocusTime = 0,
  averageSessionLength = 0,
  focusScore = 0,
  streak = 0,
  mostProductiveTime = "",
}: AIFocusInsightsProps) {
  const [insights, setInsights] = useState<FocusInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate insights based on user data
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call or complex calculation
    setTimeout(() => {
      const generatedInsights: FocusInsight[] = [];

      // Default insights for new users
      if (completedSessions === 0) {
        generatedInsights.push({
          id: "welcome",
          title: "Welcome to Pomo AI-doro!",
          description:
            "Complete your first focus session to receive personalized productivity insights.",
          type: "tip",
          icon: <Brain className="h-5 w-5" />,
        });

        generatedInsights.push({
          id: "pomodoro-tip",
          title: "Pomodoro Technique",
          description:
            "The ideal Pomodoro session is 25 minutes of focused work followed by a 5-minute break.",
          type: "tip",
          icon: <Clock className="h-5 w-5" />,
        });
      } else {
        // Insights for users with data

        // Focus score insight
        if (focusScore > 0) {
          generatedInsights.push({
            id: "focus-score",
            title: "Focus Score Analysis",
            description:
              focusScore > 70
                ? `Great job! Your focus score of ${focusScore} is above average. Keep up the good work!`
                : `Your focus score is ${focusScore}. Try to minimize distractions during your focus sessions to improve.`,
            type: "insight",
            icon: <TrendingUp className="h-5 w-5" />,
          });
        }

        // Session length insight
        if (averageSessionLength > 0) {
          const idealLength = 25;
          const difference = Math.abs(averageSessionLength - idealLength);
          const percentDiff = (difference / idealLength) * 100;

          if (percentDiff > 20) {
            generatedInsights.push({
              id: "session-length",
              title: "Session Length Optimization",
              description:
                averageSessionLength < idealLength
                  ? `Your average session length of ${averageSessionLength} minutes is shorter than the recommended 25 minutes. Try gradually increasing your focus time.`
                  : `Your average session length of ${averageSessionLength} minutes is longer than the recommended 25 minutes. Consider taking more frequent breaks to maintain optimal focus.`,
              type: "recommendation",
              icon: <Clock className="h-5 w-5" />,
            });
          }
        }

        // Streak insight
        if (streak > 0) {
          generatedInsights.push({
            id: "streak",
            title: "Consistency Streak",
            description: `You've maintained a ${streak}-day productivity streak! Consistency is key to building lasting habits.`,
            type: "insight",
            icon: <Zap className="h-5 w-5" />,
          });
        }

        // Most productive time
        if (mostProductiveTime) {
          generatedInsights.push({
            id: "productive-time",
            title: "Peak Productivity Time",
            description: `Based on your history, you're most productive during ${mostProductiveTime}. Consider scheduling your most important tasks during this time.`,
            type: "recommendation",
            icon: <Calendar className="h-5 w-5" />,
          });
        }
      }

      setInsights(generatedInsights);
      setIsLoading(false);
    }, 1000);
  }, [
    completedSessions,
    totalFocusTime,
    averageSessionLength,
    focusScore,
    streak,
    mostProductiveTime,
  ]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Focus Insights
        </CardTitle>
        <CardDescription>
          Personalized productivity recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-20 bg-muted animate-pulse rounded-lg"></div>
            <div className="h-20 bg-muted animate-pulse rounded-lg"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <AnimatedTransition
                key={insight.id}
                type="fade"
                duration={0.4}
                delay={index * 0.1}
              >
                <div
                  className={`rounded-lg p-4 border ${
                    insight.type === "tip"
                      ? "bg-blue-500/5 border-blue-500/10"
                      : insight.type === "insight"
                      ? "bg-green-500/5 border-green-500/10"
                      : "bg-amber-500/5 border-amber-500/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center ${
                        insight.type === "tip"
                          ? "bg-blue-500/10 text-blue-500"
                          : insight.type === "insight"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {insight.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {insight.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedTransition>
            ))}

            {completedSessions > 0 && (
              <AnimatedTransition
                type="fade"
                duration={0.4}
                delay={insights.length * 0.1}
              >
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Focus Score</h4>
                    <span className="text-sm font-medium">
                      {focusScore}/100
                    </span>
                  </div>
                  <Progress
                    value={focusScore}
                    className={`h-2 ${
                      focusScore > 70
                        ? "bg-green-500/20"
                        : focusScore > 40
                        ? "bg-amber-500/20"
                        : "bg-red-500/20"
                    }`}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Your focus score is calculated based on your session
                    completion rate, focus duration, and consistency.
                  </p>
                </div>
              </AnimatedTransition>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
