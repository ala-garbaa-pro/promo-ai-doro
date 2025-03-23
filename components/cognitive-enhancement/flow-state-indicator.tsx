"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Brain,
  Zap,
  Clock,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  FlowStateMetrics,
  FlowStateLevel,
  useFlowStateDetection,
} from "@/lib/cognitive-enhancement/flow-state-detection";
import { formatDuration } from "@/lib/utils";

interface FlowStateIndicatorProps {
  compact?: boolean;
  showDetails?: boolean;
}

export function FlowStateIndicator({
  compact = false,
  showDetails = true,
}: FlowStateIndicatorProps) {
  const { metrics, flowTriggers, getFlowStateRecommendations } =
    useFlowStateDetection();
  const [expanded, setExpanded] = useState(!compact);

  // Get color based on flow state
  const getFlowStateColor = (state: FlowStateLevel) => {
    switch (state) {
      case "deep":
        return "bg-purple-500";
      case "light":
        return "bg-blue-500";
      case "entering":
        return "bg-green-500";
      case "exiting":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get label based on flow state
  const getFlowStateLabel = (state: FlowStateLevel) => {
    switch (state) {
      case "deep":
        return "Deep Flow";
      case "light":
        return "Light Flow";
      case "entering":
        return "Entering Flow";
      case "exiting":
        return "Exiting Flow";
      default:
        return "Not in Flow";
    }
  };

  // Get icon based on flow state
  const getFlowStateIcon = (state: FlowStateLevel) => {
    switch (state) {
      case "deep":
        return <Zap className="h-4 w-4" />;
      case "light":
        return <Brain className="h-4 w-4" />;
      case "entering":
        return <Brain className="h-4 w-4" />;
      case "exiting":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (compact) {
    // Compact version (for sidebar or header)
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${getFlowStateColor(
                  metrics.flowState
                )}`}
              />
              <span className="text-sm font-medium">
                {getFlowStateLabel(metrics.flowState)}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="space-y-2">
              <p>
                <strong>Focus Score:</strong> {metrics.focusScore}/100
              </p>
              <p>
                <strong>Duration:</strong>{" "}
                {formatDuration(metrics.focusDuration)}
              </p>
              <p className="text-xs text-muted-foreground">
                Click to view details
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full version
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Flow State Monitor</CardTitle>
          </div>
          {showDetails && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">
                {expanded ? "Collapse" : "Expand"}
              </span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Flow State */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current State</p>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`${getFlowStateColor(
                    metrics.flowState
                  )} text-white border-0`}
                >
                  {getFlowStateIcon(metrics.flowState)}
                  <span className="ml-1">
                    {getFlowStateLabel(metrics.flowState)}
                  </span>
                </Badge>
                {metrics.flowState !== "none" && (
                  <span className="text-sm">
                    {formatDuration(metrics.focusDuration)}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Focus Score</p>
              <p className="text-2xl font-bold">{metrics.focusScore}</p>
            </div>
          </div>

          {/* Focus Score Progress */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted-foreground">Low Focus</span>
              <span className="text-xs text-muted-foreground">Deep Flow</span>
            </div>
            <Progress value={metrics.focusScore} className="h-2" />
          </div>

          {/* Expanded Details */}
          {expanded && showDetails && (
            <div className="pt-2 space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Interaction Rate
                  </p>
                  <p className="font-medium">
                    {metrics.interactionRate.toFixed(1)}/min
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Detection Confidence
                  </p>
                  <p className="font-medium">{metrics.confidenceScore}%</p>
                </div>
              </div>

              {/* Flow Triggers */}
              {metrics.flowState !== "none" && (
                <div>
                  <p className="text-sm font-medium mb-2">Your Flow Triggers</p>
                  <div className="space-y-2">
                    {flowTriggers.slice(0, 2).map((trigger, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <span className="text-sm">{trigger.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {trigger.effectiveness}% effective
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {metrics.flowState === "none" && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Flow State Recommendations
                  </p>
                  <div className="space-y-2">
                    {getFlowStateRecommendations().map((trigger, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="mt-0.5">
                          <Zap className="h-4 w-4 text-blue-500" />
                        </div>
                        <span className="text-sm">{trigger.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  Flow state detection uses your interaction patterns to
                  estimate your current focus level. The longer you use the app,
                  the more accurate it becomes.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
