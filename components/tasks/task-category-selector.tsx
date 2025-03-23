"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TaskCategoryBadge } from "./task-category-badge";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface TaskCategorySelectorProps {
  selectedCategoryIds: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
  maxCategories?: number;
}

export function TaskCategorySelector({
  selectedCategoryIds = [],
  onCategoriesChange,
  maxCategories = 5,
}: TaskCategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/categories");

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    if (selectedCategoryIds.includes(categoryId)) {
      // Remove category
      onCategoriesChange(selectedCategoryIds.filter((id) => id !== categoryId));
    } else {
      // Add category if under max limit
      if (selectedCategoryIds.length < maxCategories) {
        onCategoriesChange([...selectedCategoryIds, categoryId]);
      }
    }
  };

  // Remove a selected category
  const removeCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onCategoriesChange(selectedCategoryIds.filter((id) => id !== categoryId));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 min-h-6">
        {selectedCategoryIds.map((categoryId) => {
          const category = categories.find((c) => c.id === categoryId);

          if (!category) {
            return (
              <TaskCategoryBadge
                key={categoryId}
                categoryId={categoryId}
                showTooltip={false}
              />
            );
          }

          return (
            <Badge
              key={categoryId}
              className="font-normal h-6 px-2 py-0 flex items-center gap-1"
              style={{
                backgroundColor: `${category.color}20`, // 20% opacity
                color: category.color,
                borderColor: `${category.color}40`, // 40% opacity
              }}
              variant="outline"
            >
              <div
                className="h-2 w-2 rounded-full mr-1"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                onClick={(e) => removeCategory(categoryId, e)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {category.name}</span>
              </Button>
            </Badge>
          );
        })}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-sm"
            disabled={selectedCategoryIds.length >= maxCategories}
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            {selectedCategoryIds.length >= maxCategories
              ? `Max ${maxCategories} categories`
              : "Add Category"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" side="bottom">
          <Command>
            <CommandInput placeholder="Search categories..." />

            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {error}
              </div>
            ) : (
              <>
                <CommandEmpty>No categories found.</CommandEmpty>
                <CommandList>
                  <ScrollArea className="h-[200px]">
                    <CommandGroup>
                      {categories.map((category) => {
                        const isSelected = selectedCategoryIds.includes(
                          category.id
                        );
                        return (
                          <CommandItem
                            key={category.id}
                            value={category.id}
                            onSelect={() => toggleCategory(category.id)}
                            className={cn(
                              "flex items-center gap-2",
                              isSelected && "bg-accent"
                            )}
                          >
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span>{category.name}</span>
                            {isSelected && (
                              <Check className="ml-auto h-4 w-4 text-primary" />
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </ScrollArea>
                </CommandList>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
