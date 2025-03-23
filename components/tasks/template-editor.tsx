"use client";

import { useState } from "react";
import { TaskTemplate } from "@/hooks/use-task-templates";
import { useTaskTemplates } from "@/hooks/use-task-templates";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { DraggableTemplateItemsList } from "./draggable-template-items-list";

interface TemplateEditorProps {
  template: TaskTemplate;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
}

export function TemplateEditor({
  template,
  isOpen,
  onOpenChange,
  onBack,
}: TemplateEditorProps) {
  const { updateTemplate } = useTaskTemplates();
  const [activeTab, setActiveTab] = useState("details");
  const [formData, setFormData] = useState<Partial<TaskTemplate>>({
    name: template.name,
    description: template.description || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);

    try {
      await updateTemplate(template.id, formData);
      // Stay on the same screen, just update the template details
    } catch (error) {
      console.error("Error updating template:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <DialogTitle>Edit Template: {template.name}</DialogTitle>
          </div>
          <DialogDescription>
            Manage your template details and items
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Template Details</TabsTrigger>
            <TabsTrigger value="items">Template Items</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="pt-4">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Template name"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Template description"
                    className="resize-none"
                    rows={4}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={isSubmitting || !formData.name}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="items" className="pt-4">
            <DraggableTemplateItemsList
              templateId={template.id}
              templateName={template.name}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
