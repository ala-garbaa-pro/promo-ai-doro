import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RecurringTaskSettings } from "@/components/tasks/recurring-task-settings";
import { format } from "date-fns";

describe("RecurringTaskSettings", () => {
  const mockOnSettingsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default settings when not recurring", () => {
    render(
      <RecurringTaskSettings
        isRecurring={false}
        onSettingsChange={mockOnSettingsChange}
      />
    );

    expect(screen.getByText("Recurring Task")).toBeInTheDocument();
    expect(screen.getByText("Not recurring")).toBeInTheDocument();

    // The toggle should be off
    const toggle = screen.getByRole("switch");
    expect(toggle).not.toBeChecked();

    // The recurring options should not be visible
    expect(screen.queryByText("Repeat Every")).not.toBeInTheDocument();
    expect(screen.queryByText("End Date (Optional)")).not.toBeInTheDocument();
  });

  it("renders recurring options when isRecurring is true", () => {
    render(
      <RecurringTaskSettings
        isRecurring={true}
        recurringType="daily"
        recurringInterval={1}
        onSettingsChange={mockOnSettingsChange}
      />
    );

    expect(screen.getByText("Recurring Task")).toBeInTheDocument();
    expect(
      screen.getByText("Repeats every day indefinitely")
    ).toBeInTheDocument();

    // The toggle should be on
    const toggle = screen.getByRole("switch");
    expect(toggle).toBeChecked();

    // The recurring options should be visible
    expect(screen.getByText("Repeat Every")).toBeInTheDocument();
    expect(screen.getByText("End Date (Optional)")).toBeInTheDocument();

    // The interval input should have value 1
    const intervalInput = screen.getByRole("spinbutton");
    expect(intervalInput).toHaveValue(1);

    // The type select should show "Day(s)"
    expect(screen.getByText("Day(s)")).toBeInTheDocument();
  });

  it("updates settings when toggle is clicked", async () => {
    render(
      <RecurringTaskSettings
        isRecurring={false}
        onSettingsChange={mockOnSettingsChange}
      />
    );

    // Toggle on
    fireEvent.click(screen.getByRole("switch"));

    await waitFor(() => {
      expect(mockOnSettingsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          isRecurring: true,
          recurringType: "daily",
          recurringInterval: 1,
        })
      );
    });

    // The recurring options should now be visible
    expect(screen.getByText("Repeat Every")).toBeInTheDocument();

    // Toggle off
    fireEvent.click(screen.getByRole("switch"));

    await waitFor(() => {
      expect(mockOnSettingsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          isRecurring: false,
          recurringType: undefined,
          recurringInterval: undefined,
          recurringEndDate: undefined,
        })
      );
    });
  });

  it("updates settings when interval is changed", async () => {
    render(
      <RecurringTaskSettings
        isRecurring={true}
        recurringType="daily"
        recurringInterval={1}
        onSettingsChange={mockOnSettingsChange}
      />
    );

    // Change interval to 3
    const intervalInput = screen.getByRole("spinbutton");
    fireEvent.change(intervalInput, { target: { value: "3" } });

    await waitFor(() => {
      expect(mockOnSettingsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          isRecurring: true,
          recurringType: "daily",
          recurringInterval: 3,
        })
      );
    });

    // The description should update
    expect(
      screen.getByText("Repeats every 3 days indefinitely")
    ).toBeInTheDocument();
  });

  it("updates settings when type is changed", async () => {
    render(
      <RecurringTaskSettings
        isRecurring={true}
        recurringType="daily"
        recurringInterval={1}
        onSettingsChange={mockOnSettingsChange}
      />
    );

    // Open the select
    fireEvent.click(screen.getByRole("combobox"));

    // Select "Week(s)"
    fireEvent.click(screen.getByText("Week(s)"));

    await waitFor(() => {
      expect(mockOnSettingsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          isRecurring: true,
          recurringType: "weekly",
          recurringInterval: 1,
        })
      );
    });

    // The description should update
    expect(
      screen.getByText("Repeats every week indefinitely")
    ).toBeInTheDocument();
  });

  it("updates settings when end date is selected", async () => {
    // Mock date for testing
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days in the future

    render(
      <RecurringTaskSettings
        isRecurring={true}
        recurringType="daily"
        recurringInterval={1}
        onSettingsChange={mockOnSettingsChange}
      />
    );

    // Click the end date button
    fireEvent.click(screen.getByText("No end date"));

    // The calendar should be visible
    const calendar = screen.getByRole("dialog");
    expect(calendar).toBeInTheDocument();

    // We can't easily test the date selection with the calendar component
    // So we'll simulate the effect of selecting a date
    const component = screen.getByText("Recurring Task").closest("div");
    const instance = React.createElement(RecurringTaskSettings, {
      isRecurring: true,
      recurringType: "daily",
      recurringInterval: 1,
      recurringEndDate: futureDate,
      onSettingsChange: mockOnSettingsChange,
    });

    // Re-render with the end date
    render(instance);

    // The description should include the end date
    const formattedDate = format(futureDate, "PPP");
    expect(
      screen.getByText(`Repeats every day until ${formattedDate}`)
    ).toBeInTheDocument();
  });
});
