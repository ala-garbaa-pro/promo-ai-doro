import { parseTaskInput } from "@/lib/utils/task-parser";

describe("Task Parser", () => {
  it("should parse a simple task", () => {
    const result = parseTaskInput("Buy groceries");
    expect(result.title).toBe("Buy groceries");
  });

  it("should parse a task with due date", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const result = parseTaskInput("Buy groceries tomorrow");
    expect(result.title).toBe("Buy groceries");
    expect(result.dueDate?.getDate()).toBe(tomorrow.getDate());
  });

  it("should parse a task with priority", () => {
    const result = parseTaskInput("Buy groceries p1");
    expect(result.title).toBe("Buy groceries");
    expect(result.priority).toBe("high");
  });

  it("should parse a task with tags", () => {
    const result = parseTaskInput("Buy groceries #shopping #personal");
    expect(result.title).toBe("Buy groceries");
    expect(result.tags).toEqual(["shopping", "personal"]);
  });

  it("should parse a task with category", () => {
    const result = parseTaskInput("Buy groceries @home");
    expect(result.title).toBe("Buy groceries");
    expect(result.category).toBe("home");
  });

  it("should parse a task with pomodoros", () => {
    const result = parseTaskInput("Buy groceries 2p");
    expect(result.title).toBe("Buy groceries");
    expect(result.estimatedPomodoros).toBe(2);
  });

  it("should parse a recurring task", () => {
    const result = parseTaskInput("Buy groceries every week");
    expect(result.title).toBe("Buy groceries");
    expect(result.isRecurring).toBe(true);
    expect(result.recurringType).toBe("weekly");
    expect(result.recurringInterval).toBe(1);
  });

  it("should parse a complex task", () => {
    const result = parseTaskInput(
      "Call John tomorrow at 3pm p1 #work @calls 2p every week"
    );
    expect(result.title).toBe("Call John");
    expect(result.priority).toBe("high");
    expect(result.tags).toEqual(["work"]);
    expect(result.category).toBe("calls");
    expect(result.estimatedPomodoros).toBe(2);
    expect(result.isRecurring).toBe(true);
    expect(result.recurringType).toBe("weekly");
    expect(result.recurringInterval).toBe(1);
    expect(result.dueDate).toBeDefined();
  });
});
