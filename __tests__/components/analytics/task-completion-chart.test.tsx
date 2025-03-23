import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskCompletionChart } from "@/components/analytics/task-completion-chart";

// Mock the recharts library
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: any) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ dataKey, name, stroke }: any) => (
    <div
      data-testid={`line-${dataKey}`}
      data-name={name}
      data-stroke={stroke}
    />
  ),
  XAxis: ({ dataKey }: any) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: ({ label }: any) => (
    <div data-testid="y-axis" data-label={label?.value} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock sample data
const mockData = [
  {
    date: "2023-05-01",
    completedTasks: 3,
  },
  {
    date: "2023-05-02",
    completedTasks: 5,
  },
];

describe("TaskCompletionChart Component", () => {
  it("renders with data", () => {
    render(<TaskCompletionChart data={mockData} />);

    // Check if chart components are rendered
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("line-completedTasks")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();

    // Check title and description
    expect(screen.getByText("Task Completion")).toBeInTheDocument();
    expect(screen.getByText("Tasks completed over time")).toBeInTheDocument();
  });

  it("renders empty state when no data is provided", () => {
    render(<TaskCompletionChart data={[]} />);

    expect(screen.getByText("No data available yet")).toBeInTheDocument();
  });

  it("renders with custom title and description", () => {
    render(
      <TaskCompletionChart
        data={mockData}
        title="Custom Title"
        description="Custom Description"
      />
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom Description")).toBeInTheDocument();
  });

  it("switches between daily and cumulative views", async () => {
    render(<TaskCompletionChart data={mockData} />);

    // Default view should be daily
    expect(screen.getByRole("tab", { name: /daily/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Switch to cumulative view
    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: /cumulative/i }));

    // Cumulative tab should now be selected
    expect(screen.getByRole("tab", { name: /cumulative/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});
