"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  RefreshCw,
  Lightbulb,
  Zap,
  Award,
  LineChart,
  CheckCircle2,
  Clock,
  Calendar,
  Brain,
  ListChecks,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AnimatedList } from "@/components/ui/animated-list";

interface AIInsight {
  type: "tip" | "observation" | "recommendation" | "achievement";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  category: "focus" | "tasks" | "habits" | "time" | "general";
  actionable: boolean;
  action?: string;
}

interface AIProductivityInsightsProps {
  className?: string;
}

export function AIProductivityInsights({
  className,
}: AIProductivityInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { toast } = useToast();

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analytics/insights");

      if (!response.ok) {
        throw new Error("Failed to fetch insights");
      }

      const data = await response.json();
      setInsights(data.insights || []);
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError("Failed to load insights. Please try again later.");

      toast({
        title: "Error",
        description: "Failed to load productivity insights",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleRefresh = () => {
    fetchInsights();
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case "focus":
        return <Zap className="h-4 w-4" />;
      case "tasks":
        return <ListChecks className="h-4 w-4" />;
      case "habits":
        return <CheckCircle2 className="h-4 w-4" />;
      case "time":
        return <Clock className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "tip":
        return <Lightbulb className="h-5 w-5" />;
      case "observation":
        return <LineChart className="h-5 w-5" />;
      case "recommendation":
        return <Brain className="h-5 w-5" />;
      case "achievement":
        return <Award className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getColorForPriority = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
      case "low":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      default:
        return "bg-primary/10 text-primary hover:bg-primary/20";
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case "tip":
        return "bg-blue-500/10 text-blue-500";
      case "observation":
        return "bg-purple-500/10 text-purple-500";
      case "recommendation":
        return "bg-amber-500/10 text-amber-500";
      case "achievement":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const filteredInsights =
    activeCategory === "all"
      ? insights
      : insights.filter((insight) => insight.category === activeCategory);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Productivity Insights
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your productivity patterns
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="sr-only">Refresh insights</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">
              Analyzing your productivity data...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Not enough data to generate insights yet. Keep using the app to
              get personalized recommendations.
            </p>
          </div>
        ) : (
          <>
            <Tabs
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="mb-6"
            >
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  All
                </TabsTrigger>
                <TabsTrigger value="focus" className="flex-1">
                  Focus
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex-1">
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="habits" className="flex-1">
                  Habits
                </TabsTrigger>
                <TabsTrigger value="time" className="flex-1">
                  Time
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <AnimatedList
              className="space-y-4"
              animation="slide-up"
              staggerDelay={0.1}
            >
              {filteredInsights.map((insight, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-4 transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-full p-2 ${getColorForType(
                        insight.type
                      )}`}
                    >
                      {getIconForType(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{insight.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getIconForCategory(insight.category)}
                            <span className="ml-1 capitalize">
                              {insight.category}
                            </span>
                          </Badge>
                          <Badge
                            className={`text-xs ${getColorForPriority(
                              insight.priority
                            )}`}
                          >
                            {insight.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                      {insight.actionable && insight.action && (
                        <div className="mt-3 flex items-center">
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Action: {insight.action}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </AnimatedList>
          </>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>
          Insights are generated based on your productivity patterns and may
          become more accurate over time.
        </p>
      </CardFooter>
    </Card>
  );
}
