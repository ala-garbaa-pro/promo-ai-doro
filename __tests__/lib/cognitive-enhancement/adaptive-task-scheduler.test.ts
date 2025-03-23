import {
  estimateTaskComplexity,
  determineCognitiveLoadType,
  determineIdealEnergyLevel,
  generateTimeBlocks,
  scheduleTasks,
  CognitiveTask,
  TaskComplexity,
  CognitiveLoadType,
  EnergyLevel,
} from "@/lib/cognitive-enhancement/adaptive-task-scheduler";

describe("Adaptive Task Scheduler", () => {
  describe("estimateTaskComplexity", () => {
    it("should estimate high complexity for tasks with many pomodoros", () => {
      const task = {
        id: "1",
        title: "Complex task",
        status: "todo",
        priority: "high",
        estimatedPomodoros: 5,
      };

      expect(estimateTaskComplexity(task)).toBe("high");
    });

    it("should estimate medium complexity for tasks with medium pomodoros", () => {
      const task = {
        id: "2",
        title: "Medium task",
        status: "todo",
        priority: "medium",
        estimatedPomodoros: 3,
      };

      expect(estimateTaskComplexity(task)).toBe("medium");
    });

    it("should estimate low complexity for simple tasks", () => {
      const task = {
        id: "3",
        title: "Simple task",
        status: "todo",
        priority: "low",
        estimatedPomodoros: 1,
      };

      expect(estimateTaskComplexity(task)).toBe("low");
    });

    it("should consider keywords in the title", () => {
      const task = {
        id: "4",
        title: "Research new algorithm",
        status: "todo",
        priority: "low",
        estimatedPomodoros: 2,
      };

      // "Research" and "algorithm" are complexity keywords
      expect(estimateTaskComplexity(task)).toBe("medium");
    });
  });

  describe("determineCognitiveLoadType", () => {
    it("should determine focus load type for analytical tasks", () => {
      const task = {
        id: "1",
        title: "Analyze data and review results",
        status: "todo",
        priority: "high",
      };

      expect(determineCognitiveLoadType(task)).toBe("focus");
    });

    it("should determine creativity load type for creative tasks", () => {
      const task = {
        id: "2",
        title: "Design new logo and brainstorm ideas",
        status: "todo",
        priority: "medium",
      };

      expect(determineCognitiveLoadType(task)).toBe("creativity");
    });

    it("should determine decision-making load type for decision tasks", () => {
      const task = {
        id: "3",
        title: "Evaluate options and decide on strategy",
        status: "todo",
        priority: "high",
      };

      expect(determineCognitiveLoadType(task)).toBe("decision-making");
    });

    it("should determine learning load type for learning tasks", () => {
      const task = {
        id: "4",
        title: "Learn new framework and practice examples",
        status: "todo",
        priority: "medium",
      };

      expect(determineCognitiveLoadType(task)).toBe("learning");
    });

    it("should determine routine load type for routine tasks", () => {
      const task = {
        id: "5",
        title: "Update documentation and organize files",
        status: "todo",
        priority: "low",
      };

      expect(determineCognitiveLoadType(task)).toBe("routine");
    });
  });

  describe("determineIdealEnergyLevel", () => {
    it("should recommend high energy for high complexity tasks", () => {
      const task: CognitiveTask = {
        id: "1",
        title: "Complex analysis",
        status: "todo",
        priority: "high",
        complexity: "high",
        cognitiveLoadType: "focus",
      };

      expect(determineIdealEnergyLevel(task)).toBe("high");
    });

    it("should recommend high energy for medium complexity focus tasks", () => {
      const task: CognitiveTask = {
        id: "2",
        title: "Data analysis",
        status: "todo",
        priority: "medium",
        complexity: "medium",
        cognitiveLoadType: "focus",
      };

      expect(determineIdealEnergyLevel(task)).toBe("high");
    });

    it("should recommend medium energy for medium complexity creative tasks", () => {
      const task: CognitiveTask = {
        id: "3",
        title: "Design mockup",
        status: "todo",
        priority: "medium",
        complexity: "medium",
        cognitiveLoadType: "creativity",
      };

      expect(determineIdealEnergyLevel(task)).toBe("medium");
    });

    it("should recommend low energy for routine tasks", () => {
      const task: CognitiveTask = {
        id: "4",
        title: "File organization",
        status: "todo",
        priority: "low",
        complexity: "low",
        cognitiveLoadType: "routine",
      };

      expect(determineIdealEnergyLevel(task)).toBe("low");
    });
  });

  describe("generateTimeBlocks", () => {
    it("should generate time blocks for a day", () => {
      const date = new Date("2023-01-01T12:00:00");
      const blocks = generateTimeBlocks(date);

      // Should generate blocks from 8 AM to 6 PM (10 hours * 2 blocks per hour = 20 blocks)
      expect(blocks.length).toBe(20);

      // First block should be at 8 AM
      expect(blocks[0].startTime.getHours()).toBe(8);
      expect(blocks[0].startTime.getMinutes()).toBe(0);

      // Last block should be at 5:30 PM
      expect(blocks[blocks.length - 1].startTime.getHours()).toBe(17);
      expect(blocks[blocks.length - 1].startTime.getMinutes()).toBe(30);
    });

    it("should mark blocks as unavailable if they overlap with existing events", () => {
      const date = new Date("2023-01-01T12:00:00");
      const existingEvents = [
        {
          start: new Date("2023-01-01T10:00:00"),
          end: new Date("2023-01-01T11:00:00"),
        },
      ];

      const blocks = generateTimeBlocks(date, undefined, existingEvents);

      // Blocks at 10:00 and 10:30 should be unavailable
      const tenAMBlock = blocks.find(
        (block) =>
          block.startTime.getHours() === 10 &&
          block.startTime.getMinutes() === 0
      );
      const tenThirtyAMBlock = blocks.find(
        (block) =>
          block.startTime.getHours() === 10 &&
          block.startTime.getMinutes() === 30
      );

      expect(tenAMBlock?.available).toBe(false);
      expect(tenThirtyAMBlock?.available).toBe(false);

      // Other blocks should be available
      const nineAMBlock = blocks.find(
        (block) =>
          block.startTime.getHours() === 9 && block.startTime.getMinutes() === 0
      );
      expect(nineAMBlock?.available).toBe(true);
    });
  });

  describe("scheduleTasks", () => {
    it("should schedule tasks based on priority and complexity", () => {
      const tasks: CognitiveTask[] = [
        {
          id: "1",
          title: "High priority task",
          status: "todo",
          priority: "high",
          complexity: "high",
          cognitiveLoadType: "focus",
          idealEnergyLevel: "high",
          estimatedDuration: 60,
        },
        {
          id: "2",
          title: "Medium priority task",
          status: "todo",
          priority: "medium",
          complexity: "medium",
          cognitiveLoadType: "creativity",
          idealEnergyLevel: "medium",
          estimatedDuration: 30,
        },
        {
          id: "3",
          title: "Low priority task",
          status: "todo",
          priority: "low",
          complexity: "low",
          cognitiveLoadType: "routine",
          idealEnergyLevel: "low",
          estimatedDuration: 15,
        },
      ];

      const date = new Date("2023-01-01T12:00:00");
      const timeBlocks = generateTimeBlocks(date);

      const scheduled = scheduleTasks(tasks, timeBlocks);

      // All tasks should be scheduled
      expect(scheduled.length).toBe(3);

      // Tasks should be scheduled in order of priority
      expect(scheduled[0].task.id).toBe("1");
      expect(scheduled[1].task.id).toBe("2");
      expect(scheduled[2].task.id).toBe("3");
    });

    it("should match tasks with appropriate energy levels", () => {
      const tasks: CognitiveTask[] = [
        {
          id: "1",
          title: "High energy task",
          status: "todo",
          priority: "high",
          complexity: "high",
          cognitiveLoadType: "focus",
          idealEnergyLevel: "high",
          estimatedDuration: 30,
        },
        {
          id: "2",
          title: "Medium energy task",
          status: "todo",
          priority: "medium",
          complexity: "medium",
          cognitiveLoadType: "creativity",
          idealEnergyLevel: "medium",
          estimatedDuration: 30,
        },
        {
          id: "3",
          title: "Low energy task",
          status: "todo",
          priority: "low",
          complexity: "low",
          cognitiveLoadType: "routine",
          idealEnergyLevel: "low",
          estimatedDuration: 30,
        },
      ];

      // Create time blocks with specific energy levels
      const timeBlocks = [
        {
          startTime: new Date("2023-01-01T09:00:00"),
          endTime: new Date("2023-01-01T09:30:00"),
          energyLevel: "high" as EnergyLevel,
          available: true,
        },
        {
          startTime: new Date("2023-01-01T10:00:00"),
          endTime: new Date("2023-01-01T10:30:00"),
          energyLevel: "medium" as EnergyLevel,
          available: true,
        },
        {
          startTime: new Date("2023-01-01T11:00:00"),
          endTime: new Date("2023-01-01T11:30:00"),
          energyLevel: "low" as EnergyLevel,
          available: true,
        },
      ];

      const scheduled = scheduleTasks(tasks, timeBlocks);

      // All tasks should be scheduled
      expect(scheduled.length).toBe(3);

      // Tasks should be matched with appropriate energy levels
      expect(
        scheduled.find((s) => s.task.id === "1")?.timeBlock.energyLevel
      ).toBe("high");
      expect(
        scheduled.find((s) => s.task.id === "2")?.timeBlock.energyLevel
      ).toBe("medium");
      expect(
        scheduled.find((s) => s.task.id === "3")?.timeBlock.energyLevel
      ).toBe("low");
    });
  });
});
