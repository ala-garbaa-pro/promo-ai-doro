import { describe, it, expect } from "@jest/globals";
import { parseNaturalLanguageTask } from "@/lib/utils/natural-language-parser";

describe("Natural Language Task Parser", () => {
  it("should parse a simple task", () => {
    const result = parseNaturalLanguageTask("Buy groceries");
    expect(result.title).toBe("Buy groceries");
    expect(result.dueDate).toBeUndefined();
    expect(result.priority).toBeUndefined();
    expect(result.estimatedPomodoros).toBeUndefined();
    expect(result.tags).toBeUndefined();
    expect(result.category).toBeUndefined();
    expect(result.isRecurring).toBeUndefined();
  });

  it("should parse a task with due date", () => {
    const result = parseNaturalLanguageTask("Finish report by tomorrow at 5pm");
    expect(result.title).toBe("Finish report");
    expect(result.dueDate).toBeDefined();

    // Get tomorrow's date at 5pm
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0);

    // Check that the date is close to what we expect (within a minute)
    const diffInMinutes = Math.abs(
      (result.dueDate!.getTime() - tomorrow.getTime()) / (1000 * 60)
    );
    expect(diffInMinutes).toBeLessThan(1);
  });

  it("should parse a task with priority", () => {
    const result = parseNaturalLanguageTask("Call John #important");
    expect(result.title).toBe("Call John");
    expect(result.priority).toBe("high");
  });

  it("should parse a task with estimated pomodoros", () => {
    const result = parseNaturalLanguageTask("Write blog post ~3 pomodoros");
    expect(result.title).toBe("Write blog post");
    expect(result.estimatedPomodoros).toBe(3);
  });

  it("should parse a task with tags", () => {
    const result = parseNaturalLanguageTask("Review code #work #coding");
    expect(result.title).toBe("Review code");
    expect(result.tags).toEqual(["work", "coding"]);
  });

  it("should parse a task with category", () => {
    const result = parseNaturalLanguageTask("Go for a run @health");
    expect(result.title).toBe("Go for a run");
    expect(result.category).toBe("health");
  });

  it("should parse a recurring task", () => {
    const result = parseNaturalLanguageTask(
      "Team meeting every Monday at 10am"
    );
    expect(result.title).toBe("Team meeting");
    expect(result.isRecurring).toBe(true);
    expect(result.recurringPattern).toBe("weekly");
  });

  it("should parse a complex task with multiple attributes", () => {
    const result = parseNaturalLanguageTask(
      "Prepare presentation by Friday at 3pm ~4 pomodoros #important @work #meeting"
    );
    expect(result.title).toBe("Prepare presentation");
    expect(result.dueDate).toBeDefined();
    expect(result.priority).toBe("high");
    expect(result.estimatedPomodoros).toBe(4);
    expect(result.category).toBe("work");
    expect(result.tags).toContain("meeting");
  });

  it('should handle tasks with "by" in the title correctly', () => {
    const result = parseNaturalLanguageTask("Learn to play guitar by ear");
    expect(result.title).toBe("Learn to play guitar by ear");
    expect(result.dueDate).toBeUndefined();
  });

  it("should handle tasks with special characters", () => {
    const result = parseNaturalLanguageTask("Fix bug in the API @tech #issue");
    expect(result.title).toBe("Fix bug in the API");
    expect(result.category).toBe("tech");
    expect(result.tags).toContain("issue");
  });
});
