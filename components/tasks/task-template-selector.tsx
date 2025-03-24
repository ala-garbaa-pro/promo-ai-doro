"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Plus, Save, Template, Star } from "lucide-react";
import { useTaskTemplates } from "@/hooks/use-task-templates";

interface TaskTemplateSelectorProps {
  onSelectTemplate: (templateText: string) => void;
}

export function TaskTemplateSelector({
  onSelectTemplate,
}: TaskTemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [currentTaskText, setCurrentTaskText] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Get task templates from the hook
  const {
    templates,
    isLoading,
    error,
    createTemplate,
    deleteTemplate,
    updateTemplate,
  } = useTaskTemplates();

  // Save current task as template
  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !currentTaskText.trim() || isCreating) return;

    setIsCreating(true);

    try {
      await createTemplate({
        name: templateName,
        description: templateDescription,
        taskText: currentTaskText,
      });

      toast({
        title: "Template saved",
        description: "Your task template has been saved successfully.",
      });

      // Reset form
      setTemplateName("");
      setTemplateDescription("");
      setSaveDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Set current task text when save dialog opens
  useEffect(() => {
    // Get the task input element
    const taskInput = document.querySelector(
      'input[placeholder*="Add a new task"]'
    ) as HTMLInputElement;

    if (taskInput && saveDialogOpen) {
      setCurrentTaskText(taskInput.value);
    }
  }, [saveDialogOpen]);

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            aria-label="Select template"
          >
            <Template className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          side="bottom"
          sideOffset={5}
        >
          <Command>
            <CommandInput placeholder="Search templates..." />
            <CommandList>
              <CommandEmpty>No templates found.</CommandEmpty>
              <CommandGroup heading="Your Templates">
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading templates...</span>
                  </div>
                ) : templates.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    You don't have any templates yet.
                  </p>
                ) : (
                  templates.map((template) => (
                    <CommandItem
                      key={template.id}
                      onSelect={() => {
                        onSelectTemplate(template.taskText);
                        setOpen(false);
                      }}
                      className="flex items-start py-2"
                    >
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium">{template.name}</div>
                        {template.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {template.description}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {template.taskText}
                        </div>
                      </div>
                      {template.isDefault && (
                        <Star className="h-3 w-3 text-yellow-500 ml-2 flex-shrink-0" />
                      )}
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setSaveDialogOpen(true);
                    setOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Save current task as template
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save this task as a template for future use.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Daily standup"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-description">
                Description (optional)
              </Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Template for daily standup meetings"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-text">Task Text</Label>
              <Textarea
                id="task-text"
                value={currentTaskText}
                onChange={(e) => setCurrentTaskText(e.target.value)}
                placeholder="Daily standup meeting at 9am #work @meetings"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
