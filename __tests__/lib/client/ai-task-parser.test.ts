import { parseTaskWithAI } from "@/lib/client/ai-task-parser";
import { parseNaturalLanguageTask } from "@/lib/utils/natural-language-parser";

// Mock the natural language parser
jest.mock("@/lib/utils/natural-language-parser", () => ({
  parseNaturalLanguageTask: jest.fn(),
}));

describe("AI Task Parser", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation for the basic parser
    (parseNaturalLanguageTask as jest.Mock).mockImplementation((input) => ({
      title: input,
      priority: undefined,
      estimatedPomodoros: undefined,
      dueDate: undefined,
      tags: undefined,
      category: undefined,
    }));
  });

  it("should parse a simple task", async () => {
    const input = "Complete project report";

    // Mock the basic parser to return a simple result
    (parseNaturalLanguageTask as jest.Mock).mockReturnValue({
      title: "Complete project report",
    });

    const result = await parseTaskWithAI(input);

    // The AI parser enhances with category detection
    expect(result).toMatchObject({
      title: "Complete project report",
      description: "",
      status: "pending",
      priority: "medium",
    });

    // Category is detected from "project" in the input
    expect(result.category).toBe("project");
  });

  it("should parse a task with priority", async () => {
    const input = "Complete project report #high";

    (parseNaturalLanguageTask as jest.Mock).mockReturnValue({
      title: "Complete project report",
      priority: "high",
    });

    const result = await parseTaskWithAI(input);

    // The AI parser enhances with category detection
    expect(result).toMatchObject({
      title: "Complete project report",
      description: "",
      status: "pending",
      priority: "high",
    });

    // Category is detected from "project" in the input
    expect(result.category).toBe("project");
  });

  it("should parse a task with estimated pomodoros", async () => {
    const input = "Complete project report ~3";

    (parseNaturalLanguageTask as jest.Mock).mockReturnValue({
      title: "Complete project report",
      estimatedPomodoros: 3,
    });

    const result = await parseTaskWithAI(input);

    // The AI parser enhances with category detection
    expect(result).toMatchObject({
      title: "Complete project report",
      description: "",
      status: "pending",
      priority: "medium",
      estimatedPomodoros: 3,
    });

    // Category is detected from "project" in the input
    expect(result.category).toBe("project");
  });

  it("should parse a task with due date", async () => {
    const input = "Complete project report by tomorrow";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    (parseNaturalLanguageTask as jest.Mock).mockReturnValue({
      title: "Complete project report",
      dueDate: tomorrow,
    });

    const result = await parseTaskWithAI(input);

    // The AI parser enhances with category detection
    expect(result).toMatchObject({
      title: "Complete project report",
      description: "",
      status: "pending",
      priority: "medium",
      dueDate: tomorrow.toISOString(),
    });

    // Category is detected from "project" in the input
    expect(result.category).toBe("project");
  });

  it("should parse a task with tags", async () => {
    const input = "Complete project report #work #urgent";

    (parseNaturalLanguageTask as jest.Mock).mockReturnValue({
      title: "Complete project report",
      tags: ["work", "urgent"],
    });

    const result = await parseTaskWithAI(input);

    // The AI parser enhances with category detection and priority detection
    expect(result).toMatchObject({
      title: "Complete project report",
      description: "",
      status: "pending",
      tags: ["work", "urgent"],
    });

    // Category is detected from "work" in the tags
    expect(result.category).toBe("work");

    // Priority is detected from "urgent" in the tags
    expect(result.priority).toBe("high");
  });

  it("should parse a task with category", async () => {
    const input = "Complete project report @work";

    (parseNaturalLanguageTask as jest.Mock).mockReturnValue({
      title: "Complete project report",
      category: "work",
    });

    const result = await parseTaskWithAI(input);

    expect(result).toEqual({
      title: "Complete project report",
      description: "",
      status: "pending",
      priority: "medium",
      estimatedPomodoros: undefined,
      dueDate: undefined,
      tags: undefined,
      category: "work",
    });
  });

  it("should enhance parsing with time estimates", async () => {
    const input = "Complete project report in 2 hours";

    // Basic parser doesn't extract time estimates
    (parseNaturalLanguageTask as jest.Mock).mockReturnValue({
      title: "Complete project report in 2 hours",
    });

    const result = await parseTaskWithAI(input);

    // Should convert 2 hours to 5 pomodoros (2 hours = 120 minutes, 120/25 = 4.8, ceil to 5)
    expect(result.estimatedPomodoros).toBe(5);
  });

  it("should enhance parsing with priority indicators", async () => {
    const input = "Complete project report ASAP";

    // Basic parser doesn't extract ASAP as priority
    (parseNaturalLanguageTask as jest.Mock).mockReturnValue({
      title: "Complete project report ASAP",
    });

    const result = await parseTaskWithAI(input);

    // Should detect ASAP as high priority
    expect(result.priority).toBe("high");
  });

  it("should enhance parsing with category detection", async () => {
    const input = "Complete project report for work";

    // Basic parser doesn't extract categories from context
    (parseNaturalLanguageTask as jest.Mock).mockReturnValue({
      title: "Complete project report for work",
    });

    const result = await parseTaskWithAI(input);

    // Should detect "work" as a category
    expect(result.category).toBe("work");
  });

  it("should handle complex task descriptions", async () => {
    const input =
      "Finish the quarterly financial report by next Friday #high ~4 @finance";
    const dueDate = new Date();
    // Set to next Friday
    dueDate.setDate(dueDate.getDate() + ((5 - dueDate.getDay() + 7) % 7));
    dueDate.setHours(23, 59, 59, 999);

    (parseNaturalLanguageTask as jest.Mock).mockReturnValue({
      title: "Finish the quarterly financial report",
      priority: "high",
      estimatedPomodoros: 4,
      dueDate: dueDate,
      category: "finance",
    });

    const result = await parseTaskWithAI(input);

    expect(result).toEqual({
      title: "Finish the quarterly financial report",
      description: "",
      status: "pending",
      priority: "high",
      estimatedPomodoros: 4,
      dueDate: dueDate.toISOString(),
      tags: undefined,
      category: "finance",
    });
  });
});
