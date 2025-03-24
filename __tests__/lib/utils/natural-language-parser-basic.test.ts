import {
  parseNaturalLanguageTask,
  generateTaskDescription,
} from "@/lib/utils/natural-language-parser";

describe("Natural Language Parser", () => {
  describe("parseNaturalLanguageTask", () => {
    it("parses basic task title", () => {
      const input = "Complete project report";
      const result = parseNaturalLanguageTask(input);

      expect(result.title).toBe("Complete project report");
    });

    it("parses task with high priority", () => {
      const input = "Complete project report #important";
      const result = parseNaturalLanguageTask(input);

      expect(result.title).toBe("Complete project report");
      expect(result.priority).toBe("high");
    });

    it("parses task with medium priority", () => {
      const input = "Complete project report #medium";
      const result = parseNaturalLanguageTask(input);

      expect(result.title).toBe("Complete project report");
      expect(result.priority).toBe("medium");
    });

    it("parses task with low priority", () => {
      const input = "Complete project report #low";
      const result = parseNaturalLanguageTask(input);

      expect(result.title).toBe("Complete project report");
      expect(result.priority).toBe("low");
    });

    it("parses task with due date", () => {
      const input = "Complete project report tomorrow";
      const result = parseNaturalLanguageTask(input);

      expect(result.title).toBe("Complete project report");
      expect(result.dueDate).toBeDefined();

      // Check if the date is set to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      // Compare only the date part (ignoring time)
      const resultDate = new Date(result.dueDate as Date);
      expect(resultDate.getDate()).toBe(tomorrow.getDate());
      expect(resultDate.getMonth()).toBe(tomorrow.getMonth());
      expect(resultDate.getFullYear()).toBe(tomorrow.getFullYear());
    });

    it("parses task with estimated pomodoros", () => {
      const input = "Complete project report ~3 pomodoros";
      const result = parseNaturalLanguageTask(input);

      expect(result.title).toBe("Complete project report");
      expect(result.estimatedPomodoros).toBe(3);
    });

    it("parses task with category", () => {
      const input = "Complete project report @work";
      const result = parseNaturalLanguageTask(input);

      expect(result.title).toBe("Complete project report");
      expect(result.category).toBe("work");
    });

    it("parses task with tags", () => {
      const input = "Complete project report #report #urgent";
      const result = parseNaturalLanguageTask(input);

      expect(result.title).toBe("Complete project report");
      expect(result.tags).toContain("report");
      expect(result.tags).toContain("urgent");
    });

    it("parses complex task with multiple attributes", () => {
      const input =
        "Complete project report tomorrow #important ~4 pomodoros @work";
      const result = parseNaturalLanguageTask(input);

      expect(result.title).toBe("Complete project report");
      expect(result.priority).toBe("high");
      expect(result.dueDate).toBeDefined();
      expect(result.estimatedPomodoros).toBe(4);
      expect(result.category).toBe("work");
    });

    it("handles empty input", () => {
      const input = "";
      const result = parseNaturalLanguageTask(input);

      expect(result.title).toBe("");
    });
  });

  describe("generateTaskDescription", () => {
    it("generates description for basic task", () => {
      const parsedTask = {
        title: "Complete project report",
      };

      const description = generateTaskDescription(parsedTask);
      expect(description).toBe("Task: Complete project report");
    });

    it("generates description with due date", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const parsedTask = {
        title: "Complete project report",
        priority: "high",
        dueDate: tomorrow,
      };

      const description = generateTaskDescription(parsedTask);
      expect(description).toContain("Task: Complete project report");
      expect(description).toContain("Priority: High");
      expect(description).toContain("Due:");
    });

    it("generates description with estimated pomodoros", () => {
      const parsedTask = {
        title: "Complete project report",
        priority: "medium",
        estimatedPomodoros: 3,
      };

      const description = generateTaskDescription(parsedTask);
      expect(description).toContain("Task: Complete project report");
      expect(description).toContain("Priority: Medium");
      expect(description).toContain("Estimated Pomodoros: 3");
    });

    it("generates description with category", () => {
      const parsedTask = {
        title: "Complete project report",
        priority: "medium",
        category: "work",
      };

      const description = generateTaskDescription(parsedTask);
      expect(description).toContain("Task: Complete project report");
      expect(description).toContain("Priority: Medium");
      expect(description).toContain("Category: work");
    });

    it("generates description with tags", () => {
      const parsedTask = {
        title: "Complete project report",
        priority: "medium",
        tags: ["work", "report"],
      };

      const description = generateTaskDescription(parsedTask);
      expect(description).toContain("Task: Complete project report");
      expect(description).toContain("Priority: Medium");
      expect(description).toContain("Tags: work, report");
    });

    it("generates complete description with all attributes", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const parsedTask = {
        title: "Complete project report",
        priority: "high",
        dueDate: tomorrow,
        estimatedPomodoros: 4,
        category: "work",
        tags: ["report", "urgent"],
        isRecurring: true,
        recurringPattern: "weekly",
      };

      const description = generateTaskDescription(parsedTask);
      expect(description).toContain("Task: Complete project report");
      expect(description).toContain("Priority: High");
      expect(description).toContain("Due:");
      expect(description).toContain("Estimated Pomodoros: 4");
      expect(description).toContain("Category: work");
      expect(description).toContain("Tags: report, urgent");
      expect(description).toContain("Recurring: weekly");
    });
  });
});
