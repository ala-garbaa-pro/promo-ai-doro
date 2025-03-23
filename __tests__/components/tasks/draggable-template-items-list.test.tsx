import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DraggableTemplateItemsList } from "@/components/tasks/draggable-template-items-list";
import { useTemplateItems } from "@/hooks/use-template-items";
import { TemplateItem } from "@/hooks/use-task-templates";

// Mock the hooks
jest.mock("@/hooks/use-template-items", () => ({
  useTemplateItems: jest.fn(),
}));

// Mock the react-dnd hooks
jest.mock("react-dnd", () => ({
  useDrag: () => [{ isDragging: false }, jest.fn(), jest.fn()],
  useDrop: () => [{ handlerId: "test-handler" }, jest.fn()],
  DndProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("react-dnd-html5-backend", () => ({
  HTML5Backend: jest.fn(),
}));

// Mock the draggable template item component
jest.mock("@/components/tasks/draggable-template-item", () => ({
  DraggableTemplateItem: ({ item, onEdit, onDelete }: any) => (
    <div data-testid={`template-item-${item.id}`}>
      <span>{item.title}</span>
      <button onClick={() => onEdit(item)}>Edit</button>
      <button onClick={() => onDelete(item.id)}>Delete</button>
    </div>
  ),
}));

// Mock the template item dialog
jest.mock("@/components/tasks/template-item-dialog", () => ({
  TemplateItemDialog: ({ isOpen, onSave }: any) => (
    <div data-testid="template-item-dialog" data-open={isOpen}>
      <button onClick={() => onSave({ title: "New Item" })}>Save</button>
    </div>
  ),
}));

describe("DraggableTemplateItemsList Component", () => {
  const mockItems: TemplateItem[] = [
    {
      id: "1",
      templateId: "template-1",
      title: "Item 1",
      priority: "medium",
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      templateId: "template-1",
      title: "Item 2",
      priority: "high",
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockTemplateItemsHook = {
    items: mockItems,
    isLoading: false,
    error: null,
    fetchItems: jest.fn(),
    createItem: jest.fn().mockResolvedValue({ id: "3", title: "New Item" }),
    updateItem: jest.fn().mockResolvedValue({ id: "1", title: "Updated Item" }),
    deleteItem: jest.fn().mockResolvedValue(true),
    reorderItems: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTemplateItems as jest.Mock).mockReturnValue(mockTemplateItemsHook);
  });

  it("renders the template items list with items", () => {
    render(
      <DraggableTemplateItemsList
        templateId="template-1"
        templateName="Test Template"
      />
    );

    expect(screen.getByText("Items for Test Template")).toBeInTheDocument();
    expect(screen.getByTestId("template-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("template-item-2")).toBeInTheDocument();
  });

  it("renders a message when no items are available", () => {
    (useTemplateItems as jest.Mock).mockReturnValue({
      ...mockTemplateItemsHook,
      items: [],
    });

    render(
      <DraggableTemplateItemsList
        templateId="template-1"
        templateName="Test Template"
      />
    );

    expect(screen.getByText("No items in this template")).toBeInTheDocument();
    expect(
      screen.getByText("Add items to create a reusable task template")
    ).toBeInTheDocument();
  });

  it("shows loading state when loading", () => {
    (useTemplateItems as jest.Mock).mockReturnValue({
      ...mockTemplateItemsHook,
      isLoading: true,
      items: [],
    });

    render(
      <DraggableTemplateItemsList
        templateId="template-1"
        templateName="Test Template"
      />
    );

    expect(screen.getByText("Template Items")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Item" })).toBeDisabled();
  });

  it("shows error state when there is an error", () => {
    (useTemplateItems as jest.Mock).mockReturnValue({
      ...mockTemplateItemsHook,
      error: "Failed to load items",
    });

    render(
      <DraggableTemplateItemsList
        templateId="template-1"
        templateName="Test Template"
      />
    );

    expect(screen.getByText("Failed to load items")).toBeInTheDocument();
  });

  it("opens the item dialog when Add Item button is clicked", () => {
    render(
      <DraggableTemplateItemsList
        templateId="template-1"
        templateName="Test Template"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Item" }));

    expect(screen.getByTestId("template-item-dialog")).toHaveAttribute(
      "data-open",
      "true"
    );
  });

  it("calls createItem when saving a new item", async () => {
    render(
      <DraggableTemplateItemsList
        templateId="template-1"
        templateName="Test Template"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Item" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockTemplateItemsHook.createItem).toHaveBeenCalledWith({
        title: "New Item",
      });
    });
  });

  it("calls deleteItem when delete button is clicked", async () => {
    render(
      <DraggableTemplateItemsList
        templateId="template-1"
        templateName="Test Template"
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    await waitFor(() => {
      expect(mockTemplateItemsHook.deleteItem).toHaveBeenCalledWith("1");
    });
  });
});
