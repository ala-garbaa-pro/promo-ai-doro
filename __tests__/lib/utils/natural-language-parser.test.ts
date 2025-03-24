import {
  parseNaturalLanguageTask,
  generateTaskDescription,
  ParsedTaskData,
} from "@/lib/utils/natural-language-parser";

describe("Natural Language Parser", () => {
  describe("parseNaturalLanguageTask", () => {
    it("parses basic task title", () => {
      const input = "Complete project report";
      const result = parseNaturalLanguageTask(input);

      expect(result).toEqual({
        title: "Complete project report",
        priority: "medium",
        dueDate: undefined,
        tags: [],
        estimatedPomodoros: undefined,
      });
    });

    it("parses task with priority", () => {
      const input = "Complete project report #high";
      const result = parseNaturalLanguageTask(input);

      expect(result).toEqual({
        title: "Complete project report",
        priority: "high",
        dueDate: undefined,
        tags: [],
        estimatedPomodoros: undefined,
      });
    });

    it("parses task with due date", () => {
      const input = "Complete project report by tomorrow";
      const result = parseNaturalLanguageTask(input);

      // Due date should be set to tomorrow
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
      const input = "Complete project report ~3";
      const result = parseNaturalLanguageTask(input);

      expect(result).toEqual({
        title: "Complete project report",
        priority: "medium",
        dueDate: undefined,
        tags: [],
        estimatedPomodoros: 3,
      });
    });

    it("parses task with tags", () => {
      const input = "Complete project report @work @report";
      const result = parseNaturalLanguageTask(input);

      expect(result).toEqual({
        title: "Complete project report",
        priority: "medium",
        dueDate: undefined,
        tags: ["work", "report"],
        estimatedPomodoros: undefined,
      });
    });

    it("parses complex task with multiple attributes", () => {
      const input =
        "Complete project report by friday at 3pm #high ~4 @work @report";
      const result = parseNaturalLanguageTask(input);

      expect(result.title).toBe("Complete project report");
      expect(result.priority).toBe("high");
      expect(result.dueDate).toBeDefined();
      expect(result.tags).toEqual(["work", "report"]);
      expect(result.estimatedPomodoros).toBe(4);
    });

    it("handles empty input", () => {
      const input = "";
      const result = parseNaturalLanguageTask(input);

      expect(result).toEqual({
        title: "",
        priority: "medium",
        dueDate: undefined,
        tags: [],
        estimatedPomodoros: undefined,
      });
    });
  });

  describe("generateTaskDescription", () => {
    it("generates description for basic task", () => {
      const parsedTask: ParsedTaskData = {
        title: "Complete project report",
        priority: "medium",
        dueDate: undefined,
        tags: [],
        estimatedPomodoros: undefined,
      };

      const description = generateTaskDescription(parsedTask);
      expect(description).toBe(
        "Task: Complete project report\nPriority: Medium"
      );
    });

    it("generates description with due date", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const parsedTask: ParsedTaskData = {
        title: "Complete project report",
        priority: "high",
        dueDate: tomorrow,
        tags: [],
        estimatedPomodoros: undefined,
      };

      const description = generateTaskDescription(parsedTask);
      expect(description).toContain("Task: Complete project report");
      expect(description).toContain("Priority: High");
      expect(description).toContain("Due Date:");
    });

    it("generates description with estimated pomodoros", () => {
      const parsedTask: ParsedTaskData = {
        title: "Complete project report",
        priority: "medium",
        dueDate: undefined,
        tags: [],
        estimatedPomodoros: 3,
      };

      const description = generateTaskDescription(parsedTask);
      expect(description).toContain("Task: Complete project report");
      expect(description).toContain("Priority: Medium");
      expect(description).toContain("Estimated Pomodoros: 3");
    });

    it("generates description with tags", () => {
      const parsedTask: ParsedTaskData = {
        title: "Complete project report",
        priority: "medium",
        dueDate: undefined,
        tags: ["work", "report"],
        estimatedPomodoros: undefined,
      };

      const description = generateTaskDescription(parsedTask);
      expect(description).toContain("Task: Complete project report");
      expect(description).toContain("Priority: Medium");
      expect(description).toContain("Tags: work, report");
    });

    it("generates complete description with all attributes", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const parsedTask: ParsedTaskData = {
        title: "Complete project report",
        priority: "high",
        dueDate: tomorrow,
        tags: ["work", "report"],
        estimatedPomodoros: 4,
      };

      const description = generateTaskDescription(parsedTask);
      expect(description).toContain("Task: Complete project report");
      expect(description).toContain("Priority: High");
      expect(description).toContain("Due Date:");
      expect(description).toContain("Estimated Pomodoros: 4");
      expect(description).toContain("Tags: work, report");
    });
  });
});
