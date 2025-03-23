"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AmbientSoundType, AmbientSound } from "@/hooks/use-ambient-sounds";
import { AmbientSoundButton } from "./ambient-sound-button";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/contexts/settings-context";

interface AmbientSoundCategoriesProps {
  sounds: AmbientSound[];
  currentSoundId: string | null;
  onToggle: (soundId: string) => void;
}

export function AmbientSoundCategories({
  sounds,
  currentSoundId,
  onToggle,
}: AmbientSoundCategoriesProps) {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<AmbientSoundType>(
    (settings.notification.ambientSounds.defaultCategory as AmbientSoundType) ||
      "nature"
  );

  // Update active tab when settings change
  useEffect(() => {
    setActiveTab(
      (settings.notification.ambientSounds
        .defaultCategory as AmbientSoundType) || "nature"
    );
  }, [settings.notification.ambientSounds.defaultCategory]);

  // Map friendly names for categories
  const categoryNames: Record<AmbientSoundType, string> = {
    nature: "Nature",
    ambient: "Ambient",
    white_noise: "White Noise",
    music: "Music",
    binaural: "Binaural Beats",
    focus: "Focus",
  };

  // Get unique categories from sounds
  const categories = Array.from(
    new Set(sounds.map((sound) => sound.type))
  ) as AmbientSoundType[];

  return (
    <div className="w-full">
      <Tabs
        defaultValue="nature"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as AmbientSoundType)}
        className="w-full"
      >
        <TabsList
          className="grid w-full"
          style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}
        >
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="text-xs sm:text-sm"
            >
              {categoryNames[category]}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {sounds
                .filter((sound) => sound.type === category)
                .map((sound) => (
                  <AmbientSoundButton
                    key={sound.id}
                    sound={sound}
                    isActive={currentSoundId === sound.id}
                    onClick={() => onToggle(sound.id)}
                    className={cn(
                      "h-auto py-3 flex flex-col items-center justify-center gap-2",
                      sound.type === "binaural" &&
                        "border-purple-400 hover:border-purple-500",
                      sound.type === "focus" &&
                        "border-blue-400 hover:border-blue-500"
                    )}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
