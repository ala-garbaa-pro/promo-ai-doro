"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Sun,
  Moon,
  Clock,
  Zap,
  Coffee,
  BatteryMedium,
  Save,
  RotateCcw,
} from "lucide-react";
import {
  CognitiveProfile as CognitiveProfileType,
  ChronoType,
} from "@/lib/cognitive-enhancement/adaptive-task-scheduler";
import { useSettings } from "@/lib/contexts/settings-context";
import { useToast } from "@/components/ui/use-toast";

interface CognitiveProfileProps {
  initialProfile: CognitiveProfileType;
  onSave?: (profile: CognitiveProfileType) => void;
}

export function CognitiveProfile({
  initialProfile,
  onSave,
}: CognitiveProfileProps) {
  const [profile, setProfile] = useState<CognitiveProfileType>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const { settings, updateTimerSettings } = useSettings();
  const { toast } = useToast();

  // Handle chronotype change
  const handleChronotypeChange = (value: string) => {
    const chronotype = value as ChronoType;
    let peakHours: number[] = [];
    let productiveHours: number[] = [];
    let lowEnergyHours: number[] = [];

    switch (chronotype) {
      case "early-bird":
        peakHours = [8, 9, 10, 11];
        productiveHours = [7, 8, 9, 10, 11, 12, 13, 14, 15];
        lowEnergyHours = [16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4];
        break;
      case "night-owl":
        peakHours = [18, 19, 20, 21];
        productiveHours = [15, 16, 17, 18, 19, 20, 21, 22, 23];
        lowEnergyHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        break;
      default:
        peakHours = [9, 10, 11, 15, 16];
        productiveHours = [8, 9, 10, 11, 14, 15, 16, 17];
        lowEnergyHours = [12, 13, 21, 22, 23, 0, 1, 2, 3, 4, 5];
    }

    setProfile((prev) => ({
      ...prev,
      chronotype,
      peakHours,
      productiveHours,
      lowEnergyHours,
    }));
  };

  // Handle save
  const handleSave = () => {
    // Update settings based on profile
    updateTimerSettings({
      earlyBirdMode: profile.chronotype === "early-bird",
      nightOwlMode: profile.chronotype === "night-owl",
      pomodoroDuration: profile.focusSessionDuration,
      shortBreakDuration: profile.breakDuration,
    });

    // Call onSave if provided
    if (onSave) {
      onSave(profile);
    }

    setIsEditing(false);

    toast({
      title: "Cognitive profile updated",
      description:
        "Your cognitive profile has been saved and will be used to optimize your task scheduling.",
    });
  };

  // Handle reset
  const handleReset = () => {
    setProfile(initialProfile);
    setIsEditing(false);
  };

  // Get chronotype display name
  const getChronotypeDisplay = (type: ChronoType) => {
    switch (type) {
      case "early-bird":
        return "Early Bird";
      case "night-owl":
        return "Night Owl";
      default:
        return "Intermediate";
    }
  };

  // Get chronotype icon
  const getChronotypeIcon = (type: ChronoType) => {
    switch (type) {
      case "early-bird":
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case "night-owl":
        return <Moon className="h-5 w-5 text-indigo-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>Cognitive Profile</CardTitle>
          </div>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          )}
        </div>
        <CardDescription>
          Your cognitive profile helps optimize task scheduling based on your
          natural rhythms and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chronotype */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getChronotypeIcon(profile.chronotype)}
              <h3 className="text-sm font-medium">Chronotype</h3>
            </div>
            {isEditing ? (
              <Select
                value={profile.chronotype}
                onValueChange={handleChronotypeChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select chronotype" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="early-bird">Early Bird</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="night-owl">Night Owl</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <span className="text-sm">
                {getChronotypeDisplay(profile.chronotype)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {profile.chronotype === "early-bird"
              ? "You're most productive in the morning hours."
              : profile.chronotype === "night-owl"
              ? "You're most productive in the evening hours."
              : "You have balanced energy throughout the day."}
          </p>
        </div>

        {/* Focus Session Duration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h3 className="text-sm font-medium">Focus Session Duration</h3>
            </div>
            <span className="text-sm">
              {profile.focusSessionDuration} minutes
            </span>
          </div>
          {isEditing && (
            <Slider
              value={[profile.focusSessionDuration]}
              min={15}
              max={60}
              step={5}
              onValueChange={(value) =>
                setProfile((prev) => ({
                  ...prev,
                  focusSessionDuration: value[0],
                }))
              }
            />
          )}
          <p className="text-xs text-muted-foreground">
            Your optimal focus session length for maximum productivity.
          </p>
        </div>

        {/* Break Duration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-brown-500" />
              <h3 className="text-sm font-medium">Break Duration</h3>
            </div>
            <span className="text-sm">{profile.breakDuration} minutes</span>
          </div>
          {isEditing && (
            <Slider
              value={[profile.breakDuration]}
              min={3}
              max={15}
              step={1}
              onValueChange={(value) =>
                setProfile((prev) => ({ ...prev, breakDuration: value[0] }))
              }
            />
          )}
          <p className="text-xs text-muted-foreground">
            Your optimal break length to recharge between focus sessions.
          </p>
        </div>

        {/* Context Switching Cost */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BatteryMedium className="h-5 w-5 text-red-500" />
              <h3 className="text-sm font-medium">Context Switching Cost</h3>
            </div>
            <span className="text-sm">{profile.contextSwitchingCost}/10</span>
          </div>
          {isEditing && (
            <Slider
              value={[profile.contextSwitchingCost]}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) =>
                setProfile((prev) => ({
                  ...prev,
                  contextSwitchingCost: value[0],
                }))
              }
            />
          )}
          <p className="text-xs text-muted-foreground">
            How much mental energy you spend when switching between different
            types of tasks.
          </p>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Your cognitive profile is used to optimize task scheduling and
        recommendations.
      </CardFooter>
    </Card>
  );
}
