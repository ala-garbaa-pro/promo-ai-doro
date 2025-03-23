import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskCategories } from "@/components/tasks/task-categories";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

// Mock the fetch API
global.fetch = jest.fn();

// Mock the hooks
jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("TaskCategories", () => {
  const mockOnSelectCategory = jest.fn();
  const mockToast = { toast: jest.fn() };
  const mockRouter = { push: jest.fn(), refresh: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([
        { id: "cat1", name: "Work", color: "#3b82f6" },
        { id: "cat2", name: "Personal", color: "#10b981" },
      ]),
    });
  });

  it("renders the component with loading state", async () => {
    render(
      <TaskCategories
        selectedCategory={undefined}
        onSelectCategory={mockOnSelectCategory}
      />
    );

    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });

  it("displays categories after loading", async () => {
    render(
      <TaskCategories
        selectedCategory={undefined}
        onSelectCategory={mockOnSelectCategory}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("All Categories")).toBeInTheDocument();
      expect(screen.getByText("Work")).toBeInTheDocument();
      expect(screen.getByText("Personal")).toBeInTheDocument();
    });
  });

  it("calls onSelectCategory when a category is clicked", async () => {
    render(
      <TaskCategories
        selectedCategory={undefined}
        onSelectCategory={mockOnSelectCategory}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Work")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Work"));
    expect(mockOnSelectCategory).toHaveBeenCalledWith("cat1");
  });

  it("highlights the selected category", async () => {
    render(
      <TaskCategories
        selectedCategory="cat2"
        onSelectCategory={mockOnSelectCategory}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Personal")).toBeInTheDocument();
    });

    // The Personal category should have the secondary variant applied
    const personalButton = screen.getByText("Personal").closest("button");
    expect(personalButton).toHaveClass("secondary");

    // The All Categories button should not have the secondary variant
    const allCategoriesButton = screen
      .getByText("All Categories")
      .closest("button");
    expect(allCategoriesButton).not.toHaveClass("secondary");
  });

  it("opens the add category dialog when the add button is clicked", async () => {
    render(
      <TaskCategories
        selectedCategory={undefined}
        onSelectCategory={mockOnSelectCategory}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("All Categories")).toBeInTheDocument();
    });

    // Click the add button (it has a Plus icon)
    fireEvent.click(screen.getByLabelText("Add Category"));

    // Dialog should be open
    expect(screen.getByText("Add Category")).toBeInTheDocument();
    expect(
      screen.getByText("Create a new category to organize your tasks.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByText("Color")).toBeInTheDocument();
  });

  it("creates a new category when the form is submitted", async () => {
    // Mock the POST request for creating a category
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (url === "/api/categories" && options.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "new-cat",
              name: "New Category",
              color: "#f59e0b",
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: "cat1", name: "Work", color: "#3b82f6" },
            { id: "cat2", name: "Personal", color: "#10b981" },
          ]),
      });
    });

    render(
      <TaskCategories
        selectedCategory={undefined}
        onSelectCategory={mockOnSelectCategory}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("All Categories")).toBeInTheDocument();
    });

    // Open the dialog
    fireEvent.click(screen.getByLabelText("Add Category"));

    // Fill the form
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "New Category" },
    });

    // Select a color
    const colorButtons = screen.getAllByRole("button", { name: "" });
    fireEvent.click(colorButtons[2]); // Select the third color

    // Submit the form
    fireEvent.click(screen.getByText("Add Category", { selector: "button" }));

    // Verify the API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/categories",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("New Category"),
        })
      );

      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Category created",
        })
      );
    });
  });

  it("handles API errors when fetching categories", async () => {
    // Mock a failed API response
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API error"));

    render(
      <TaskCategories
        selectedCategory={undefined}
        onSelectCategory={mockOnSelectCategory}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to load categories")).toBeInTheDocument();
    });
  });
});
