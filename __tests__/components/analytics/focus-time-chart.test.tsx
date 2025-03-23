import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FocusTimeChart } from "@/components/analytics/focus-time-chart";

// Mock the recharts library
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: any) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ dataKey, name, fill }: any) => (
    <div data-testid={`bar-${dataKey}`} data-name={name} data-fill={fill} />
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
    totalWorkMinutes: 120,
    completedWorkSessions: 2,
  },
  {
    date: "2023-05-02",
    totalWorkMinutes: 180,
    completedWorkSessions: 3,
  },
];

describe("FocusTimeChart Component", () => {
  it("renders with data", () => {
    render(<FocusTimeChart data={mockData} />);

    // Check if chart components are rendered
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-focusTime")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();

    // Check title and description
    expect(screen.getByText("Daily Focus Time")).toBeInTheDocument();
    expect(
      screen.getByText("Hours spent focusing each day")
    ).toBeInTheDocument();
  });

  it("renders empty state when no data is provided", () => {
    render(<FocusTimeChart data={[]} />);

    expect(screen.getByText("No data available yet")).toBeInTheDocument();
  });

  it("renders with custom title and description", () => {
    render(
      <FocusTimeChart
        data={mockData}
        title="Custom Title"
        description="Custom Description"
      />
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom Description")).toBeInTheDocument();
  });

  it("switches between daily and weekly views", async () => {
    render(<FocusTimeChart data={mockData} />);

    // Default view should be daily
    expect(screen.getByRole("tab", { name: /daily/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Switch to weekly view
    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: /weekly/i }));

    // Weekly tab should now be selected
    expect(screen.getByRole("tab", { name: /weekly/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});
