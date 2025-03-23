"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Repeat, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface RecurringTaskSettingsProps {
  isRecurring: boolean;
  recurringType?: "daily" | "weekly" | "monthly" | "yearly";
  recurringInterval?: number;
  recurringEndDate?: Date;
  onSettingsChange: (settings: {
    isRecurring: boolean;
    recurringType?: "daily" | "weekly" | "monthly" | "yearly";
    recurringInterval?: number;
    recurringEndDate?: Date;
  }) => void;
}

export function RecurringTaskSettings({
  isRecurring,
  recurringType = "daily",
  recurringInterval = 1,
  recurringEndDate,
  onSettingsChange,
}: RecurringTaskSettingsProps) {
  const [localIsRecurring, setLocalIsRecurring] = useState(isRecurring);
  const [localRecurringType, setLocalRecurringType] = useState(recurringType);
  const [localRecurringInterval, setLocalRecurringInterval] =
    useState(recurringInterval);
  const [localRecurringEndDate, setLocalRecurringEndDate] =
    useState(recurringEndDate);

  // Update parent component when settings change
  useEffect(() => {
    onSettingsChange({
      isRecurring: localIsRecurring,
      recurringType: localIsRecurring ? localRecurringType : undefined,
      recurringInterval: localIsRecurring ? localRecurringInterval : undefined,
      recurringEndDate: localIsRecurring ? localRecurringEndDate : undefined,
    });
  }, [
    localIsRecurring,
    localRecurringType,
    localRecurringInterval,
    localRecurringEndDate,
    onSettingsChange,
  ]);

  // Get recurring description
  const getRecurringDescription = () => {
    if (!localIsRecurring) return "Not recurring";

    let typeText = "";
    switch (localRecurringType) {
      case "daily":
        typeText =
          localRecurringInterval === 1
            ? "day"
            : `${localRecurringInterval} days`;
        break;
      case "weekly":
        typeText =
          localRecurringInterval === 1
            ? "week"
            : `${localRecurringInterval} weeks`;
        break;
      case "monthly":
        typeText =
          localRecurringInterval === 1
            ? "month"
            : `${localRecurringInterval} months`;
        break;
      case "yearly":
        typeText =
          localRecurringInterval === 1
            ? "year"
            : `${localRecurringInterval} years`;
        break;
    }

    let endText = localRecurringEndDate
      ? ` until ${format(localRecurringEndDate, "PPP")}`
      : " indefinitely";

    return `Repeats every ${typeText}${endText}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="recurring-toggle">Recurring Task</Label>
          <div className="text-sm text-muted-foreground">
            {getRecurringDescription()}
          </div>
        </div>
        <Switch
          id="recurring-toggle"
          checked={localIsRecurring}
          onCheckedChange={setLocalIsRecurring}
        />
      </div>

      {localIsRecurring && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recurring-type">Repeat Every</Label>
              <div className="flex gap-2">
                <Input
                  id="recurring-interval"
                  type="number"
                  min={1}
                  value={localRecurringInterval}
                  onChange={(e) =>
                    setLocalRecurringInterval(
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                  className="w-20"
                />
                <Select
                  value={localRecurringType}
                  onValueChange={(value) =>
                    setLocalRecurringType(
                      value as "daily" | "weekly" | "monthly" | "yearly"
                    )
                  }
                >
                  <SelectTrigger id="recurring-type" className="flex-1">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Day(s)</SelectItem>
                    <SelectItem value="weekly">Week(s)</SelectItem>
                    <SelectItem value="monthly">Month(s)</SelectItem>
                    <SelectItem value="yearly">Year(s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurring-end-date">End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localRecurringEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localRecurringEndDate
                      ? format(localRecurringEndDate, "PPP")
                      : "No end date"}
                    {localRecurringEndDate && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-4 w-4 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocalRecurringEndDate(undefined);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localRecurringEndDate}
                    onSelect={setLocalRecurringEndDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="flex items-start">
              <Repeat className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p>
                  This task will automatically repeat according to the schedule.
                  Each occurrence will be created as a separate task.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
