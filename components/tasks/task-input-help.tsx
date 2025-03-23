"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

/**
 * Help dialog that explains how to use the natural language task input feature.
 */
export function TaskInputHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Task input help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Natural Language Task Input</DialogTitle>
          <DialogDescription>
            You can use natural language to quickly add tasks with details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <h3 className="font-medium">Examples:</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Call John tomorrow at 3pm p1 #work</li>
              <li>Submit report every Friday #project</li>
              <li>Buy groceries today #personal @shopping</li>
              <li>Review presentation next Monday 2p</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium">Supported Patterns:</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Dates:</strong> today, tomorrow, next Monday, on
                2023-05-15
              </li>
              <li>
                <strong>Times:</strong> at 3pm, at 15:30
              </li>
              <li>
                <strong>Priority:</strong> p1 (high), p2 (medium), p3 (low)
              </li>
              <li>
                <strong>Tags:</strong> #work, #personal, #project
              </li>
              <li>
                <strong>Categories:</strong> @work, @home, @shopping
              </li>
              <li>
                <strong>Pomodoros:</strong> 2p, 3 pomodoros
              </li>
              <li>
                <strong>Recurring:</strong> every day, every 2 weeks, every
                month
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium">Tips:</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You can combine multiple patterns in a single input</li>
              <li>The order of patterns doesn't matter</li>
              <li>
                Everything that's not recognized as a pattern becomes part of
                the task title
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
