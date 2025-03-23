import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AnalyticsPage from "@/app/app/analytics/page";

// Mock the useAuth hook
jest.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "Test User" },
    isAuthenticated: true,
  }),
}));

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        totalWorkSessions: 10,
        completedWorkSessions: 8,
        totalWorkMinutes: 240,
        totalBreakMinutes: 60,
        avgFocusScore: 85,
        completedTasks: 12,
        dailyAnalytics: [
          {
            date: "2023-05-01",
            totalWorkMinutes: 120,
            completedWorkSessions: 4,
            completedTasks: 5,
          },
          {
            date: "2023-05-02",
            totalWorkMinutes: 120,
            completedWorkSessions: 4,
            completedTasks: 7,
          },
        ],
        productivityByHour: [
          { hour: 9, completedSessions: 3, totalMinutes: 75 },
          { hour: 10, completedSessions: 2, totalMinutes: 50 },
          { hour: 11, completedSessions: 1, totalMinutes: 25 },
          { hour: 12, completedSessions: 0, totalMinutes: 0 },
          { hour: 13, completedSessions: 4, totalMinutes: 100 },
          { hour: 14, completedSessions: 2, totalMinutes: 50 },
        ],
      }),
  })
) as jest.Mock;

// Mock the chart components
jest.mock("@/components/analytics/focus-time-chart", () => ({
  FocusTimeChart: ({ data, title, description }: any) => (
    <div
      data-testid="focus-time-chart"
      data-title={title}
      data-description={description}
    >
      {data ? `Chart with ${data.length} data points` : "No data"}
    </div>
  ),
}));

jest.mock("@/components/analytics/task-completion-chart", () => ({
  TaskCompletionChart: ({ data, title, description }: any) => (
    <div
      data-testid="task-completion-chart"
      data-title={title}
      data-description={description}
    >
      {data ? `Chart with ${data.length} data points` : "No data"}
    </div>
  ),
}));

jest.mock("@/components/analytics/productivity-heatmap", () => ({
  ProductivityHeatmap: ({ data, title, description }: any) => (
    <div
      data-testid="productivity-heatmap"
      data-title={title}
      data-description={description}
    >
      {data ? `Heatmap with ${data.length} data points` : "No data"}
    </div>
  ),
}));

describe("Analytics Page Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the analytics page with data", async () => {
    render(<AnalyticsPage />);

    // Check page title
    expect(
      screen.getByRole("heading", { name: /analytics/i })
    ).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      // Check metric cards
      expect(screen.getByText("4h 0m")).toBeInTheDocument(); // 240 minutes = 4h 0m
      expect(screen.getByText("8")).toBeInTheDocument(); // 8 completed sessions
      expect(screen.getByText("12")).toBeInTheDocument(); // 12 completed tasks
      expect(screen.getByText("85")).toBeInTheDocument(); // 85 avg focus score
    });

    // Check if charts are rendered
    expect(screen.getByTestId("focus-time-chart")).toBeInTheDocument();
    expect(screen.getByTestId("task-completion-chart")).toBeInTheDocument();
  });

  it("switches between time ranges", async () => {
    render(<AnalyticsPage />);

    const user = userEvent.setup();

    // Default should be month
    expect(screen.getByRole("tab", { name: /month/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Switch to week
    await user.click(screen.getByRole("tab", { name: /week/i }));

    // Week tab should now be selected
    expect(screen.getByRole("tab", { name: /week/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Fetch should be called with weekly endpoint
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/analytics/weekly"),
      expect.anything()
    );
  });

  it("switches between overview tabs", async () => {
    render(<AnalyticsPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("4h 0m")).toBeInTheDocument();
    });

    const user = userEvent.setup();

    // Default should be overview
    expect(screen.getByRole("tab", { name: /overview/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Switch to focus tab
    await user.click(screen.getByRole("tab", { name: /focus/i }));

    // Focus tab should now be selected
    expect(screen.getByRole("tab", { name: /focus/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Focus content should be visible
    expect(screen.getByText("Focus Insights")).toBeInTheDocument();
  });

  it("handles loading state", async () => {
    // Mock fetch to delay response
    global.fetch = jest.fn(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ totalWorkSessions: 10 }),
              }),
            100
          )
        )
    ) as jest.Mock;

    render(<AnalyticsPage />);

    // Loading state should be visible
    expect(screen.getByText("Loading analytics data...")).toBeInTheDocument();

    // Wait for data to load
    await waitFor(
      () => {
        expect(
          screen.queryByText("Loading analytics data...")
        ).not.toBeInTheDocument();
      },
      { timeout: 200 }
    );
  });

  it("handles error state", async () => {
    // Mock fetch to return error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({ error: "Failed to fetch analytics data" }),
      })
    ) as jest.Mock;

    render(<AnalyticsPage />);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(
        screen.getByText(
          "Failed to load analytics data. Please try again later."
        )
      ).toBeInTheDocument();
    });
  });
});
