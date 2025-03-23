"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface TaskCategoryBadgeProps {
  categoryId?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function TaskCategoryBadge({
  categoryId,
  size = "md",
  showTooltip = true,
}: TaskCategoryBadgeProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Size classes
  const sizeClasses = {
    sm: "h-4 text-xs px-1.5 py-0",
    md: "h-5 text-xs px-2 py-0",
    lg: "h-6 text-sm px-2.5 py-0.5",
  };

  useEffect(() => {
    if (!categoryId) {
      setCategory(null);
      return;
    }

    const fetchCategory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/categories/${categoryId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch category");
        }

        const data = await response.json();
        setCategory(data);
      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Failed to load category");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  if (!categoryId) {
    return null;
  }

  if (isLoading) {
    return <Skeleton className={`w-16 ${sizeClasses[size]}`} />;
  }

  if (error || !category) {
    return null;
  }

  const badgeContent = (
    <Badge
      className={`font-normal ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${category.color}20`, // 20% opacity
        color: category.color,
        borderColor: `${category.color}40`, // 40% opacity
      }}
      variant="outline"
    >
      {category.name}
    </Badge>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
          <TooltipContent>
            <p>Category: {category.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badgeContent;
}

// Component to display multiple category badges
interface TaskCategoryBadgesProps {
  categoryIds: string[];
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  maxDisplay?: number;
}

export function TaskCategoryBadges({
  categoryIds,
  size = "md",
  showTooltip = true,
  maxDisplay = 3,
}: TaskCategoryBadgesProps) {
  if (!categoryIds || categoryIds.length === 0) {
    return null;
  }

  const displayedCategories = categoryIds.slice(0, maxDisplay);
  const remainingCount = categoryIds.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1">
      {displayedCategories.map((id) => (
        <TaskCategoryBadge
          key={id}
          categoryId={id}
          size={size}
          showTooltip={showTooltip}
        />
      ))}

      {remainingCount > 0 && (
        <Badge
          className={`font-normal ${
            size === "sm"
              ? "h-4 text-xs"
              : size === "lg"
              ? "h-6 text-sm"
              : "h-5 text-xs"
          }`}
          variant="outline"
        >
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}
