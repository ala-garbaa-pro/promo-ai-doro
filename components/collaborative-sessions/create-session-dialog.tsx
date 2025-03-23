"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSession: (sessionData: any) => Promise<void>;
}

export function CreateSessionDialog({
  open,
  onOpenChange,
  onCreateSession,
}: CreateSessionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
    maxParticipants: 10,
    workDuration: 25 * 60, // 25 minutes in seconds
    breakDuration: 5 * 60, // 5 minutes in seconds
    longBreakDuration: 15 * 60, // 15 minutes in seconds
    sessionsBeforeLongBreak: 4,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPublic: checked }));
  };

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [name]: value[0] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onCreateSession(formData);
      // Reset form
      setFormData({
        name: "",
        description: "",
        isPublic: true,
        maxParticipants: 10,
        workDuration: 25 * 60,
        breakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        sessionsBeforeLongBreak: 4,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Collaborative Session</DialogTitle>
          <DialogDescription>
            Create a new collaborative session to work together with others.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Session Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter session name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the purpose of this session"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isPublic">Public Session</Label>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={handleSwitchChange}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxParticipants">
                  Max Participants: {formData.maxParticipants}
                </Label>
              </div>
              <Slider
                id="maxParticipants"
                min={1}
                max={20}
                step={1}
                value={[formData.maxParticipants]}
                onValueChange={(value) =>
                  handleSliderChange("maxParticipants", value)
                }
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="workDuration">
                  Work Duration: {Math.floor(formData.workDuration / 60)}{" "}
                  minutes
                </Label>
              </div>
              <Slider
                id="workDuration"
                min={5 * 60}
                max={60 * 60}
                step={5 * 60}
                value={[formData.workDuration]}
                onValueChange={(value) =>
                  handleSliderChange("workDuration", value)
                }
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="breakDuration">
                  Break Duration: {Math.floor(formData.breakDuration / 60)}{" "}
                  minutes
                </Label>
              </div>
              <Slider
                id="breakDuration"
                min={1 * 60}
                max={15 * 60}
                step={1 * 60}
                value={[formData.breakDuration]}
                onValueChange={(value) =>
                  handleSliderChange("breakDuration", value)
                }
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="longBreakDuration">
                  Long Break Duration:{" "}
                  {Math.floor(formData.longBreakDuration / 60)} minutes
                </Label>
              </div>
              <Slider
                id="longBreakDuration"
                min={5 * 60}
                max={30 * 60}
                step={5 * 60}
                value={[formData.longBreakDuration]}
                onValueChange={(value) =>
                  handleSliderChange("longBreakDuration", value)
                }
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sessionsBeforeLongBreak">
                  Sessions Before Long Break: {formData.sessionsBeforeLongBreak}
                </Label>
              </div>
              <Slider
                id="sessionsBeforeLongBreak"
                min={1}
                max={8}
                step={1}
                value={[formData.sessionsBeforeLongBreak]}
                onValueChange={(value) =>
                  handleSliderChange("sessionsBeforeLongBreak", value)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Session"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
