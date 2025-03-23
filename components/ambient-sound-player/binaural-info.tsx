"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

export function BinauralInfo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Binaural Beats Information</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>About Binaural Beats</DialogTitle>
          <DialogDescription>
            Binaural beats are an auditory illusion created when two slightly
            different frequencies are played separately to each ear.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>
            Your brain perceives the difference between these frequencies as a
            beat, which can influence brainwave activity. Different frequency
            ranges are associated with different mental states:
          </p>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Delta (1-4 Hz)</div>
              <div>Deep sleep, healing</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Theta (4-7 Hz)</div>
              <div>Meditation, creativity</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Alpha (8-12 Hz)</div>
              <div>Relaxed focus, calm</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Beta (13-30 Hz)</div>
              <div>Active thinking, problem-solving</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Gamma (30-100 Hz)</div>
              <div>Peak concentration, cognitive processing</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            For best results, use stereo headphones and keep the volume at a
            comfortable level. If you experience any discomfort, discontinue
            use.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
