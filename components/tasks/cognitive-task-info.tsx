"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Brain,
  Zap,
  Lightbulb,
  Scale,
  BookOpen,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import {
  CognitiveTask,
  TaskComplexity,
  CognitiveLoadType,
  EnergyLevel,
} from "@/lib/cognitive-enhancement/adaptive-task-scheduler";

interface CognitiveTaskInfoProps {
  task: CognitiveTask;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CognitiveTaskInfo({
  task,
  showLabels = false,
  size = "md",
}: CognitiveTaskInfoProps) {
  // Determine icon and color based on cognitive load type
  const getCognitiveLoadIcon = (type: CognitiveLoadType) => {
    switch (type) {
      case "focus":
        return (
          <Zap
            className={`${
              size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
            } text-blue-500`}
          />
        );
      case "creativity":
        return (
          <Lightbulb
            className={`${
              size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
            } text-yellow-500`}
          />
        );
      case "decision-making":
        return (
          <Scale
            className={`${
              size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
            } text-purple-500`}
          />
        );
      case "learning":
        return (
          <BookOpen
            className={`${
              size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
            } text-green-500`}
          />
        );
      case "routine":
        return (
          <RotateCcw
            className={`${
              size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
            } text-gray-500`}
          />
        );
      default:
        return (
          <Brain
            className={`${
              size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
            } text-gray-500`}
          />
        );
    }
  };

  // Get description for cognitive load type
  const getCognitiveLoadDescription = (type: CognitiveLoadType) => {
    switch (type) {
      case "focus":
        return "Requires deep concentration and attention to detail";
      case "creativity":
        return "Involves generating new ideas or creative solutions";
      case "decision-making":
        return "Requires evaluating options and making choices";
      case "learning":
        return "Involves acquiring new knowledge or skills";
      case "routine":
        return "Repetitive or familiar task requiring minimal mental effort";
      default:
        return "Unknown cognitive load type";
    }
  };

  // Get color for complexity
  const getComplexityColor = (complexity: TaskComplexity) => {
    switch (complexity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get color for energy level
  const getEnergyLevelColor = (level: EnergyLevel) => {
    switch (level) {
      case "high":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-teal-100 text-teal-800 border-teal-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // If cognitive load type is not available, show a warning
  if (!task.cognitiveLoadType) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center">
              <AlertTriangle
                className={`${
                  size === "sm"
                    ? "h-3 w-3"
                    : size === "lg"
                    ? "h-5 w-5"
                    : "h-4 w-4"
                } text-amber-500`}
              />
              {showLabels && (
                <span className="ml-1 text-xs text-muted-foreground">
                  Unknown
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Cognitive analysis not available for this task</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Cognitive Load Type */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center">
              {getCognitiveLoadIcon(task.cognitiveLoadType)}
              {showLabels && (
                <span className="ml-1 text-xs capitalize">
                  {task.cognitiveLoadType}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              <strong>Cognitive Load:</strong> {task.cognitiveLoadType}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {getCognitiveLoadDescription(task.cognitiveLoadType)}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Complexity */}
      {task.complexity && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant="outline"
                className={`${getComplexityColor(task.complexity)} ${
                  size === "sm" ? "text-xs px-1 py-0" : ""
                }`}
              >
                {size !== "sm" ? "Complexity: " : ""}
                {task.complexity}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                <strong>Task Complexity:</strong> {task.complexity}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {task.complexity === "high"
                  ? "Requires significant mental effort and focus"
                  : task.complexity === "medium"
                  ? "Moderate mental effort required"
                  : "Minimal mental effort required"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Ideal Energy Level */}
      {task.idealEnergyLevel && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant="outline"
                className={`${getEnergyLevelColor(task.idealEnergyLevel)} ${
                  size === "sm" ? "text-xs px-1 py-0" : ""
                }`}
              >
                {size !== "sm" ? "Energy: " : ""}
                {task.idealEnergyLevel}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                <strong>Ideal Energy Level:</strong> {task.idealEnergyLevel}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {task.idealEnergyLevel === "high"
                  ? "Best performed when you're feeling energetic and alert"
                  : task.idealEnergyLevel === "medium"
                  ? "Can be performed with moderate energy levels"
                  : "Can be performed even when energy is low"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
