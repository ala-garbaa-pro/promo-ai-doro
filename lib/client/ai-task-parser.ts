/**
 * AI-powered task parser
 *
 * This module provides functions to parse natural language task descriptions
 * using AI to extract structured task data.
 */

import { Task } from "@/hooks/use-tasks";
import {
  parseNaturalLanguageTask,
  ParsedTaskData,
} from "@/lib/utils/natural-language-parser";

/**
 * Parse a natural language task description using AI
 *
 * This function first tries to use the built-in parser, and if that doesn't
 * extract all the information, it will use AI to enhance the parsing.
 *
 * @param input The natural language task description
 * @returns A parsed task object
 */
export async function parseTaskWithAI(input: string): Promise<Partial<Task>> {
  // First, use the built-in parser to extract basic information
  const basicParsed = parseNaturalLanguageTask(input);

  try {
    // For now, we'll use the built-in parser and enhance it with additional logic
    // In a future implementation, this would call an AI service like OpenAI
    const enhancedTask = enhanceTaskParsing(basicParsed, input);
    return enhancedTask;
  } catch (error) {
    console.error("Error using AI to parse task:", error);
    // Fall back to the basic parser if AI parsing fails
    return convertToTask(basicParsed);
  }
}

/**
 * Enhance task parsing with additional logic
 *
 * This is a placeholder for AI-powered parsing. In a real implementation,
 * this would call an AI service like OpenAI to extract more information.
 *
 * @param basicParsed The result from the basic parser
 * @param originalInput The original input string
 * @returns An enhanced task object
 */
function enhanceTaskParsing(
  basicParsed: ParsedTaskData,
  originalInput: string
): Partial<Task> {
  const task = convertToTask(basicParsed);

  // Extract additional information that the basic parser might have missed

  // Look for time estimates in the form of "X hours" or "X minutes"
  const timeMatch = originalInput.match(/(\d+)\s*(hour|hr|minute|min)s?/i);
  if (timeMatch) {
    const amount = parseInt(timeMatch[1], 10);
    const unit = timeMatch[2].toLowerCase();

    // Convert time to estimated pomodoros (assuming 1 pomodoro = 25 minutes)
    if (unit.startsWith("hour") || unit.startsWith("hr")) {
      task.estimatedPomodoros = Math.ceil((amount * 60) / 25);
    } else if (unit.startsWith("minute") || unit.startsWith("min")) {
      task.estimatedPomodoros = Math.ceil(amount / 25);
    }
  }

  // Look for priority indicators in the text
  if (!task.priority || task.priority === "medium") {
    const lowPriorityIndicators = [
      "not urgent",
      "can wait",
      "low priority",
      "whenever",
      "someday",
    ];
    const highPriorityIndicators = [
      "urgent",
      "asap",
      "important",
      "critical",
      "high priority",
    ];

    const inputLower = originalInput.toLowerCase();

    if (
      highPriorityIndicators.some((indicator) => inputLower.includes(indicator))
    ) {
      task.priority = "high";
    } else if (
      lowPriorityIndicators.some((indicator) => inputLower.includes(indicator))
    ) {
      task.priority = "low";
    }
  }

  // Extract potential categories from the text only if not already set
  if (!task.category && !basicParsed.category) {
    const categoryIndicators = [
      "work",
      "personal",
      "home",
      "health",
      "finance",
      "study",
      "project",
    ];

    const inputLower = originalInput.toLowerCase();
    const foundCategory = categoryIndicators.find((category) =>
      inputLower.includes(category)
    );

    if (foundCategory) {
      task.category = foundCategory;
    }
  }

  return task;
}

/**
 * Convert ParsedTaskData to Task
 *
 * @param parsedData The data from the parser
 * @returns A task object
 */
function convertToTask(parsedData: ParsedTaskData): Partial<Task> {
  return {
    title: parsedData.title,
    description: "", // The basic parser doesn't extract descriptions
    status: "pending",
    priority: parsedData.priority || "medium",
    estimatedPomodoros: parsedData.estimatedPomodoros,
    dueDate: parsedData.dueDate?.toISOString(),
    tags: parsedData.tags,
    category: parsedData.category,
  };
}

/**
 * In a future implementation, this function would call an AI service
 * to extract more detailed information from the task description.
 *
 * @param input The natural language task description
 * @returns A parsed task object
 */
async function callAIService(input: string): Promise<Partial<Task>> {
  // This is a placeholder for the actual AI service call
  // In a real implementation, this would call an API like OpenAI

  // Example API call structure:
  // const response = await fetch('/api/ai/parse-task', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ input }),
  // });
  //
  // if (!response.ok) {
  //   throw new Error('Failed to parse task with AI');
  // }
  //
  // return await response.json();

  // For now, just return a basic parsed task
  const basicParsed = parseNaturalLanguageTask(input);
  return convertToTask(basicParsed);
}
