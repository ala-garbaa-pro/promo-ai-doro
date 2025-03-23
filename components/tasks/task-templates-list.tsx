"use client";

import { useState } from "react";
import { useTaskTemplates, TaskTemplate } from "@/hooks/use-task-templates";
import { TemplateEditor } from "./template-editor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  FileText,
  Copy,
  Pencil,
  Trash2,
  MoreVertical,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { TaskCategoryBadge } from "./task-category-badge";

interface TaskTemplatesListProps {
  onEditTemplate?: (template: TaskTemplate) => void;
  onApplyTemplate?: (template: TaskTemplate) => void;
}

export function TaskTemplatesList({
  onEditTemplate,
  onApplyTemplate,
}: TaskTemplatesListProps) {
  const {
    templates,
    isLoading,
    error,
    createTemplate,
    deleteTemplate,
    applyTemplate,
  } = useTaskTemplates();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<TaskTemplate>>({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(
    null
  );
  const { toast } = useToast();

  // Handle create template
  const handleCreateTemplate = async () => {
    if (!newTemplate.name) {
      toast({
        title: "Name required",
        description: "Please enter a name for your template.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const result = await createTemplate(newTemplate);

    setIsSubmitting(false);

    if (result) {
      setIsCreateDialogOpen(false);
      setNewTemplate({
        name: "",
        description: "",
      });
    }
  };

  // Handle apply template
  const handleApplyTemplate = async (template: TaskTemplate) => {
    const success = await applyTemplate(template.id);

    if (success && onApplyTemplate) {
      onApplyTemplate(template);
    }
  };

  // Handle edit template
  const handleEditTemplate = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  // Handle close editor
  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedTemplate(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Task Templates
          </h2>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Task Templates
          </h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Task Templates</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No templates found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create a template to save time on repetitive tasks.
            </p>
            <Button
              className="mt-4"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      Created{" "}
                      {format(new Date(template.createdAt), "MMM d, yyyy")}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Template
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleApplyTemplate(template)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Apply Template
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Template
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {template.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No description
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {template.categoryId && (
                    <TaskCategoryBadge
                      categoryId={template.categoryId}
                      size="sm"
                    />
                  )}

                  {template.isRecurring && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="mr-1 h-3 w-3" />
                      Recurring
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Apply Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
            <DialogDescription>
              Create a new task template to save time on repetitive tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, name: e.target.value })
                }
                placeholder="Template name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTemplate.description || ""}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    description: e.target.value,
                  })
                }
                placeholder="Template description"
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Editor */}
      {selectedTemplate && (
        <TemplateEditor
          template={selectedTemplate}
          isOpen={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          onBack={handleCloseEditor}
        />
      )}
    </div>
  );
}
