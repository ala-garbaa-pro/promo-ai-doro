import React from "react";
import { render, screen } from "@testing-library/react";
import { ProductivityHeatmap } from "@/components/analytics/productivity-heatmap";

// Mock sample data
const mockData = [
  { hour: 9, completedSessions: 3, totalMinutes: 75 },
  { hour: 10, completedSessions: 2, totalMinutes: 50 },
  { hour: 11, completedSessions: 1, totalMinutes: 25 },
  { hour: 12, completedSessions: 0, totalMinutes: 0 },
  { hour: 13, completedSessions: 4, totalMinutes: 100 },
  { hour: 14, completedSessions: 2, totalMinutes: 50 },
];

describe("ProductivityHeatmap Component", () => {
  it("renders with data", () => {
    render(<ProductivityHeatmap data={mockData} />);

    // Check title and description
    expect(screen.getByText("Productivity Heatmap")).toBeInTheDocument();
    expect(screen.getByText("Your most productive hours")).toBeInTheDocument();

    // Check hour labels
    expect(screen.getByText("9 AM")).toBeInTheDocument();
    expect(screen.getByText("10 AM")).toBeInTheDocument();
    expect(screen.getByText("11 AM")).toBeInTheDocument();
    expect(screen.getByText("12 PM")).toBeInTheDocument();
    expect(screen.getByText("1 PM")).toBeInTheDocument();
    expect(screen.getByText("2 PM")).toBeInTheDocument();

    // Check legend
    expect(screen.getByText("Less productive")).toBeInTheDocument();
    expect(screen.getByText("More productive")).toBeInTheDocument();
  });

  it("renders empty state when no data is provided", () => {
    render(<ProductivityHeatmap data={[]} />);

    expect(screen.getByText("No data available yet")).toBeInTheDocument();
  });

  it("renders with custom title and description", () => {
    render(
      <ProductivityHeatmap
        data={mockData}
        title="Custom Title"
        description="Custom Description"
      />
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom Description")).toBeInTheDocument();
  });

  it("formats hour correctly", () => {
    render(<ProductivityHeatmap data={mockData} />);

    // Check AM/PM formatting
    expect(screen.getByText("9 AM")).toBeInTheDocument();
    expect(screen.getByText("12 PM")).toBeInTheDocument();
    expect(screen.getByText("1 PM")).toBeInTheDocument();
  });
});
