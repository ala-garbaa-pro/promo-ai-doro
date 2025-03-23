/**
 * Task Parser Utility
 *
 * This utility parses natural language input and extracts task details like
 * title, due date, priority, tags, etc.
 */

export interface ParsedTask {
  title: string;
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
  tags?: string[];
  estimatedPomodoros?: number;
  category?: string;
  isRecurring?: boolean;
  recurringType?: "daily" | "weekly" | "monthly" | "yearly";
  recurringInterval?: number;
}

/**
 * Parse natural language task input and extract task details
 *
 * Examples:
 * - "Call John tomorrow at 3pm p1 #work"
 * - "Submit report every Friday #project"
 * - "Buy groceries today #personal @shopping"
 *
 * @param input The natural language task input
 * @returns ParsedTask object with extracted details
 */
export function parseTaskInput(input: string): ParsedTask {
  // Default task with just the title
  const task: ParsedTask = {
    title: input,
  };

  // Extract due date (e.g., "tomorrow", "next Monday", "on 2023-05-15")
  const datePatterns = [
    { regex: /\b(today)\b/i, handler: () => new Date() },
    {
      regex: /\b(tomorrow)\b/i,
      handler: () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
      },
    },
    {
      regex:
        /\bnext (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      handler: (match: RegExpMatchArray) => {
        const dayOfWeek = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ].indexOf(match[1].toLowerCase());
        const date = new Date();
        const currentDay = date.getDay();
        const daysToAdd = (dayOfWeek + 7 - currentDay) % 7 || 7;
        date.setDate(date.getDate() + daysToAdd);
        return date;
      },
    },
    {
      regex: /\bon (\d{4}-\d{2}-\d{2})\b/i,
      handler: (match: RegExpMatchArray) => new Date(match[1]),
    },
    {
      regex: /\bat (\d{1,2}):(\d{2})\s*(am|pm)?\b/i,
      handler: (match: RegExpMatchArray) => {
        const date = task.dueDate || new Date();
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const ampm = match[3]?.toLowerCase();

        if (ampm === "pm" && hours < 12) hours += 12;
        if (ampm === "am" && hours === 12) hours = 0;

        date.setHours(hours, minutes, 0, 0);
        return date;
      },
    },
  ];

  for (const pattern of datePatterns) {
    const match = input.match(pattern.regex);
    if (match) {
      task.dueDate = pattern.handler(match);
      // Remove the date part from the title
      task.title = task.title.replace(match[0], "").trim();
    }
  }

  // Extract priority (e.g., "p1", "high priority")
  const priorityPatterns = [
    { regex: /\bp1\b/i, priority: "high" as const },
    { regex: /\bp2\b/i, priority: "medium" as const },
    { regex: /\bp3\b/i, priority: "low" as const },
    { regex: /\bhigh priority\b/i, priority: "high" as const },
    { regex: /\bmedium priority\b/i, priority: "medium" as const },
    { regex: /\blow priority\b/i, priority: "low" as const },
  ];

  for (const pattern of priorityPatterns) {
    if (pattern.regex.test(input)) {
      task.priority = pattern.priority;
      // Remove the priority part from the title
      task.title = task.title.replace(pattern.regex, "").trim();
    }
  }

  // Extract tags (e.g., "#work", "#personal")
  const tagMatches = input.match(/#(\w+)/g);
  if (tagMatches) {
    task.tags = tagMatches.map((tag) => tag.substring(1));
    // Remove the tags from the title
    task.title = task.title.replace(/#\w+/g, "").trim();
  }

  // Extract estimated pomodoros (e.g., "2 pomodoros", "3p")
  const pomodoroMatch = input.match(/\b(\d+)\s*(pomodoros?|p)\b/i);
  if (pomodoroMatch) {
    task.estimatedPomodoros = parseInt(pomodoroMatch[1]);
    // Remove the pomodoro part from the title
    task.title = task.title.replace(pomodoroMatch[0], "").trim();
  }

  // Extract category (e.g., "@work", "@home")
  const categoryMatch = input.match(/@(\w+)/);
  if (categoryMatch) {
    task.category = categoryMatch[1];
    // Remove the category from the title
    task.title = task.title.replace(categoryMatch[0], "").trim();
  }

  // Extract recurring patterns (e.g., "every day", "every 2 weeks")
  const recurringPatterns = [
    { regex: /\bevery\s+day\b/i, type: "daily" as const, interval: 1 },
    {
      regex: /\bevery\s+(\d+)\s+days?\b/i,
      type: "daily" as const,
      handler: (match: RegExpMatchArray) => parseInt(match[1]),
    },
    { regex: /\bevery\s+week\b/i, type: "weekly" as const, interval: 1 },
    {
      regex: /\bevery\s+(\d+)\s+weeks?\b/i,
      type: "weekly" as const,
      handler: (match: RegExpMatchArray) => parseInt(match[1]),
    },
    { regex: /\bevery\s+month\b/i, type: "monthly" as const, interval: 1 },
    {
      regex: /\bevery\s+(\d+)\s+months?\b/i,
      type: "monthly" as const,
      handler: (match: RegExpMatchArray) => parseInt(match[1]),
    },
    { regex: /\bevery\s+year\b/i, type: "yearly" as const, interval: 1 },
    {
      regex: /\bevery\s+(\d+)\s+years?\b/i,
      type: "yearly" as const,
      handler: (match: RegExpMatchArray) => parseInt(match[1]),
    },
  ];

  for (const pattern of recurringPatterns) {
    const match = input.match(pattern.regex);
    if (match) {
      task.isRecurring = true;
      task.recurringType = pattern.type;
      task.recurringInterval =
        typeof pattern.interval === "number"
          ? pattern.interval
          : pattern.handler(match);

      // Remove the recurring part from the title
      task.title = task.title.replace(match[0], "").trim();
    }
  }

  // Clean up any extra spaces
  task.title = task.title.replace(/\s+/g, " ").trim();

  return task;
}
