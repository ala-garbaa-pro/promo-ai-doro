import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBatchTasks } from "@/hooks/use-batch-tasks";

// Mock dependencies
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe("useBatchTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset fetch mock
    (global.fetch as any).mockReset();
  });

  it("should complete batch tasks successfully", async () => {
    // Mock successful fetch responses
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useBatchTasks({ onSuccess }));

    // Initial state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);

    // Complete batch tasks
    await act(async () => {
      const success = await result.current.completeBatchTasks([
        "task1",
        "task2",
      ]);
      expect(success).toBe(true);
    });

    // Check if fetch was called correctly
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith("/api/tasks/task1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "completed" }),
    });
    expect(global.fetch).toHaveBeenCalledWith("/api/tasks/task2", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "completed" }),
    });

    // Check if onSuccess was called
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("should delete batch tasks successfully", async () => {
    // Mock successful fetch responses
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useBatchTasks({ onSuccess }));

    // Delete batch tasks
    await act(async () => {
      const success = await result.current.deleteBatchTasks(["task1", "task2"]);
      expect(success).toBe(true);
    });

    // Check if fetch was called correctly
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith("/api/tasks/task1", {
      method: "DELETE",
    });
    expect(global.fetch).toHaveBeenCalledWith("/api/tasks/task2", {
      method: "DELETE",
    });

    // Check if onSuccess was called
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("should handle partial failures in batch operations", async () => {
    // Mock mixed success/failure responses
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })
      .mockRejectedValueOnce(new Error("Failed to update task"));

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useBatchTasks({ onSuccess }));

    // Complete batch tasks with partial failure
    await act(async () => {
      const success = await result.current.completeBatchTasks([
        "task1",
        "task2",
      ]);
      expect(success).toBe(false); // Should return false due to partial failure
    });

    // Check if fetch was called correctly
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // Check if onSuccess was still called (we still had some successes)
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("should handle authentication requirement", async () => {
    // Override the mock to simulate unauthenticated state
    vi.mocked(
      require("@/components/auth/auth-provider").useAuth
    ).mockReturnValue({
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useBatchTasks());

    // Try to complete batch tasks while unauthenticated
    await act(async () => {
      const success = await result.current.completeBatchTasks([
        "task1",
        "task2",
      ]);
      expect(success).toBe(false);
    });

    // Fetch should not be called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should handle empty task arrays", async () => {
    const { result } = renderHook(() => useBatchTasks());

    // Try to complete an empty batch
    await act(async () => {
      const success = await result.current.completeBatchTasks([]);
      expect(success).toBe(false);
    });

    // Fetch should not be called
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
