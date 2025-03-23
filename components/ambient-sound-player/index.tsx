"use client";

import { Slider } from "@/components/ui/slider";
import { useAmbientSounds } from "@/hooks/use-ambient-sounds";
import { Volume2, VolumeX, Settings2 } from "lucide-react";
import { AmbientSoundCategories } from "./ambient-sound-categories";
import { BinauralInfo } from "./binaural-info";
import { useSettings } from "@/lib/contexts/settings-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AmbientSoundPlayer() {
  const { settings, updateNotificationSettings } = useSettings();
  const {
    sounds,
    state: { isPlaying, volume, currentSoundId },
    toggleSound,
    setVolume,
    stopSound,
  } = useAmbientSounds();

  const { ambientSounds } = settings.notification;

  // Update ambient sound settings
  const updateAmbientSoundSettings = (
    newSettings: Partial<typeof ambientSounds>
  ) => {
    updateNotificationSettings({
      ambientSounds: {
        ...ambientSounds,
        ...newSettings,
      },
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Ambient Sounds</h3>
        <div className="flex items-center gap-2">
          <BinauralInfo />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings2 className="h-4 w-4" />
                <span className="sr-only">Sound Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sound Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={ambientSounds.showDescriptions}
                onCheckedChange={(checked) =>
                  updateAmbientSoundSettings({ showDescriptions: checked })
                }
              >
                Show Descriptions
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={ambientSounds.preferBinauralBeats}
                onCheckedChange={(checked) =>
                  updateAmbientSoundSettings({ preferBinauralBeats: checked })
                }
              >
                Prefer Binaural Beats
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={ambientSounds.autoPlay}
                onCheckedChange={(checked) =>
                  updateAmbientSoundSettings({ autoPlay: checked })
                }
              >
                Auto-play on Start
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AmbientSoundCategories
        sounds={sounds}
        currentSoundId={currentSoundId}
        onToggle={toggleSound}
      />

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={() => volume > 0 && setVolume(0)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={volume === 0 ? "Unmute" : "Mute"}
        >
          {volume === 0 ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>
        <Slider
          value={[volume * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => setVolume(value[0] / 100)}
          aria-label="Volume"
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground w-8 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
}
