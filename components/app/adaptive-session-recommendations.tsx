"use client";

import { useState, useEffect } from "react";
import { useAdaptiveSessions } from "@/hooks/use-adaptive-sessions";
import { useSettings } from "@/lib/contexts/settings-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Clock, Brain, Sparkles, AlertCircle, Check } from "lucide-react";

export function AdaptiveSessionRecommendations() {
  const { toast } = useToast();
  const {
    recommendations,
    focusPatterns,
    isLoading,
    error,
    fetchRecommendations,
    fetchFocusPatterns,
  } = useAdaptiveSessions();
  const { settings, updateTimerSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("recommendations");
  const [showApplied, setShowApplied] = useState(false);

  // Fetch recommendations and focus patterns on component mount
  useEffect(() => {
    fetchRecommendations();
    fetchFocusPatterns();
  }, []);

  // Apply recommended settings to user's settings
  const handleApplyRecommendations = () => {
    if (!recommendations) return;

    updateTimerSettings({
      pomodoroDuration: recommendations.recommendedWorkDuration,
      shortBreakDuration: recommendations.recommendedShortBreakDuration,
      longBreakDuration: recommendations.recommendedLongBreakDuration,
    });

    toast({
      title: "Settings Applied",
      description:
        "Your timer settings have been updated with AI recommendations.",
    });

    setShowApplied(true);
    setTimeout(() => setShowApplied(false), 3000);
  };

  // Get confidence level label and color
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 80) return { label: "High", color: "bg-green-500" };
    if (confidence >= 50) return { label: "Medium", color: "bg-yellow-500" };
    return { label: "Low", color: "bg-red-500" };
  };

  // Format time of day for display
  const formatTimeOfDay = (timeOfDay: string | null) => {
    if (!timeOfDay) return "Not enough data";
    return timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1);
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            AI Session Recommendations
          </CardTitle>
          <CardDescription>
            Analyzing your productivity patterns...
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-full max-w-md">
              <Progress value={45} className="mb-2" />
              <p className="text-center text-sm text-muted-foreground">
                Loading your personalized recommendations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error Loading Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            We encountered an error while analyzing your productivity patterns.
            Please try again later.
          </p>
          <Button
            onClick={() => {
              fetchRecommendations();
              fetchFocusPatterns();
            }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render no data state
  if (!recommendations || !focusPatterns) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            AI Session Recommendations
          </CardTitle>
          <CardDescription>
            Complete more sessions to get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <Clock className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Not Enough Data</h3>
            <p className="text-center text-muted-foreground max-w-sm mb-6">
              Complete more focus sessions to receive AI-powered recommendations
              tailored to your productivity patterns.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get confidence level for display
  const confidenceLevel = getConfidenceLevel(recommendations.confidence);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5" />
          AI Session Recommendations
          {showApplied && (
            <Badge className="ml-2 bg-green-500">
              <Check className="h-3 w-3 mr-1" /> Applied
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Personalized recommendations based on your productivity patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="insights">Focus Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Recommendation Confidence</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on {recommendations.basedOn.totalSessions} sessions
                  </p>
                </div>
                <Badge
                  className={`${confidenceLevel.color} hover:${confidenceLevel.color}`}
                >
                  {confidenceLevel.label} ({recommendations.confidence}%)
                </Badge>
              </div>

              <Progress value={recommendations.confidence} className="h-2" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <h4 className="font-medium">Work Session</h4>
                  </div>
                  <p className="text-2xl font-bold">
                    {recommendations.recommendedWorkDuration} min
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {settings.timer.pomodoroDuration} min
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <h4 className="font-medium">Short Break</h4>
                  </div>
                  <p className="text-2xl font-bold">
                    {recommendations.recommendedShortBreakDuration} min
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {settings.timer.shortBreakDuration} min
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <h4 className="font-medium">Long Break</h4>
                  </div>
                  <p className="text-2xl font-bold">
                    {recommendations.recommendedLongBreakDuration} min
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {settings.timer.longBreakDuration} min
                  </p>
                </div>
              </div>

              {recommendations.basedOn.timeOfDay && (
                <div className="mt-4 bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    <p className="text-sm">
                      <span className="font-medium">Optimal time of day:</span>{" "}
                      {formatTimeOfDay(recommendations.basedOn.timeOfDay)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-1">Focus Score</h4>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold mr-2">
                      {focusPatterns.focusScore}/100
                    </p>
                    <Progress
                      value={focusPatterns.focusScore}
                      className="h-2 flex-1"
                    />
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-1">Completion Rate</h4>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold mr-2">
                      {Math.round(focusPatterns.completionRate)}%
                    </p>
                    <Progress
                      value={Math.round(focusPatterns.completionRate)}
                      className="h-2 flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Optimal Time of Day</h4>
                  <p className="text-lg">
                    {formatTimeOfDay(focusPatterns.optimalTimeOfDay)}
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Most Productive Day</h4>
                  <p className="text-lg">
                    {focusPatterns.mostProductiveDay || "Not enough data"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Optimal Session Duration</h4>
                  <p className="text-lg">
                    {focusPatterns.optimalDuration
                      ? `${focusPatterns.optimalDuration} minutes`
                      : "Not enough data"}
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Average Interruptions</h4>
                  <p className="text-lg">
                    {focusPatterns.averageInterruptions.toFixed(1)} per session
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  <p className="text-sm">
                    <span className="font-medium">AI Insight:</span>{" "}
                    {focusPatterns.completionRate > 70
                      ? "You have an excellent completion rate! Keep up the good work."
                      : focusPatterns.completionRate > 50
                      ? "You're doing well, but try to minimize interruptions to improve your focus."
                      : "Consider shorter work sessions to improve your completion rate."}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          onClick={handleApplyRecommendations}
          className="w-full"
          disabled={recommendations.confidence < 30}
        >
          Apply Recommended Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
