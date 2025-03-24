"use client";

import { useState } from "react";
import { NaturalLanguageTaskInput } from "./natural-language-task-input";
import { ParsedTaskData } from "@/lib/utils/natural-language-parser";
import { createTaskFromNaturalLanguage } from "@/lib/server/actions/task-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Lightbulb } from "lucide-react";

export function TaskInputDemo() {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleTaskCreate = async (taskData: ParsedTaskData) => {
    try {
      setIsCreating(true);
      const result = await createTaskFromNaturalLanguage(taskData);

      if (result.success) {
        toast({
          title: "Task created",
          description: "Your task was successfully created.",
        });
      } else {
        toast({
          title: "Error creating task",
          description: result.error || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error creating task",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Natural Language Task Input</CardTitle>
        <CardDescription>
          Add tasks using natural language - just type what you need to do
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <NaturalLanguageTaskInput
          onTaskCreate={handleTaskCreate}
          placeholder="Add a task using natural language..."
        />

        <div className="bg-muted p-4 rounded-md">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <Lightbulb className="h-4 w-4" />
            <span>Try these examples:</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
            <li>"Finish report by tomorrow at 5pm #important"</li>
            <li>"Call John on Friday at 10am @work"</li>
            <li>"Weekly team meeting every Monday at 10am"</li>
            <li>"Workout for 30 minutes ~2 pomodoros #health"</li>
            <li>"Buy groceries today #shopping"</li>
            <li>"Read book chapter every day #learning"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
