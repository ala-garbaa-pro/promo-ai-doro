"use client";

import { useState, useCallback, useEffect } from "react";
import { TemplateItem } from "@/hooks/use-task-templates";
import { useTemplateItems } from "@/hooks/use-template-items";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AnimatedList } from "@/components/ui/animated-list";
import { DraggableTemplateItem } from "./draggable-template-item";
import { Plus, Loader2 } from "lucide-react";
import { TemplateItemDialog } from "./template-item-dialog";

interface DraggableTemplateItemsListProps {
  templateId: string;
  templateName: string;
}

export function DraggableTemplateItemsList({
  templateId,
  templateName,
}: DraggableTemplateItemsListProps) {
  const {
    items,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
  } = useTemplateItems(templateId);

  // Sort items by order
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  // State to track the current order of items
  const [orderedItems, setOrderedItems] = useState<TemplateItem[]>(sortedItems);

  // State for item dialog
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TemplateItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update ordered items when items change
  useEffect(() => {
    setOrderedItems([...items].sort((a, b) => a.order - b.order));
  }, [items]);

  // Handle item reordering
  const moveItem = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const draggedItem = orderedItems[dragIndex];
      const newItems = [...orderedItems];

      // Remove the item from its original position
      newItems.splice(dragIndex, 1);

      // Insert the item at the new position
      newItems.splice(hoverIndex, 0, draggedItem);

      // Update the state with the new order
      setOrderedItems(newItems);
    },
    [orderedItems]
  );

  // Save the new order to the server when a drag operation ends
  const handleDragEnd = useCallback(async () => {
    // Update the order property of each item
    const reorderedItems = orderedItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    await reorderItems(reorderedItems);
  }, [orderedItems, reorderItems]);

  // Open dialog to create a new item
  const handleAddItem = () => {
    setSelectedItem(null);
    setIsItemDialogOpen(true);
  };

  // Open dialog to edit an existing item
  const handleEditItem = (item: TemplateItem) => {
    setSelectedItem(item);
    setIsItemDialogOpen(true);
  };

  // Handle item save (create or update)
  const handleSaveItem = async (itemData: Partial<TemplateItem>) => {
    setIsSubmitting(true);

    try {
      if (selectedItem) {
        // Update existing item
        await updateItem(selectedItem.id, itemData);
      } else {
        // Create new item
        await createItem(itemData);
      }

      setIsItemDialogOpen(false);
      return true;
    } catch (error) {
      console.error("Error saving item:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading && items.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Template Items</CardTitle>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Template Items</CardTitle>
          <Button onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Items for {templateName}</CardTitle>
          <Button onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {orderedItems.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No items in this template</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add items to create a reusable task template
              </p>
              <Button className="mt-4" onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Item
              </Button>
            </div>
          ) : (
            <AnimatedList
              className="divide-y"
              animation="slide-up"
              staggerDelay={0.05}
            >
              {orderedItems.map((item, index) => (
                <DraggableTemplateItem
                  key={item.id}
                  item={item}
                  index={index}
                  moveItem={moveItem}
                  onDragEnd={handleDragEnd}
                  onEdit={handleEditItem}
                  onDelete={deleteItem}
                />
              ))}
            </AnimatedList>
          )}
        </CardContent>
      </Card>

      {/* Item Dialog */}
      <TemplateItemDialog
        isOpen={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        item={selectedItem}
        onSave={handleSaveItem}
        isSubmitting={isSubmitting}
      />
    </DndProvider>
  );
}
