"use client";

import { useState } from "react";
import { useFocusMode } from "@/lib/contexts/focus-mode-context";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Zap,
  Eye,
  EyeOff,
  BellOff,
  Volume2,
  VolumeX,
  Settings,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface FocusModeToggleProps {
  variant?: "default" | "compact";
}

export function FocusModeToggle({ variant = "default" }: FocusModeToggleProps) {
  const { focusMode, settings, toggleFocusMode, updateSettings } =
    useFocusMode();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Handle shortcut change
  const handleShortcutChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const key = e.key;
    if (key === "Escape" || key === "Tab") return;

    let shortcut = "";
    if (e.altKey) shortcut += "Alt+";
    if (e.ctrlKey) shortcut += "Ctrl+";
    if (e.shiftKey) shortcut += "Shift+";

    // Add the key if it's not a modifier
    if (key !== "Alt" && key !== "Control" && key !== "Shift") {
      shortcut += key.toUpperCase();
    }

    if (shortcut) {
      updateSettings({ toggleShortcut: shortcut });
    }
  };

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={focusMode ? "default" : "outline"}
              size="icon"
              onClick={toggleFocusMode}
              className={focusMode ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              {focusMode ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {focusMode ? "Disable Focus Mode" : "Enable Focus Mode"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{focusMode ? "Disable Focus Mode" : "Enable Focus Mode"}</p>
            <p className="text-xs text-muted-foreground">
              Shortcut: {settings.toggleShortcut}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap
              className={`h-5 w-5 ${
                focusMode ? "text-purple-500" : "text-muted-foreground"
              }`}
            />
            <span className="font-medium">Focus Mode</span>
            {focusMode && (
              <Badge
                variant="outline"
                className="bg-purple-500/10 text-purple-700 border-purple-200"
              >
                Active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={focusMode}
              onCheckedChange={toggleFocusMode}
              id="focus-mode"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              className="h-8 w-8"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Focus Mode Settings</span>
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {focusMode
            ? "Focus Mode is active. Distractions are minimized to help you maintain flow."
            : "Enable Focus Mode to minimize distractions and maintain your flow state."}
        </p>

        {focusMode && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {settings.hideNotifications && (
              <div className="flex flex-col items-center justify-center p-2 bg-muted rounded-md">
                <BellOff className="h-4 w-4 mb-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Notifications
                </span>
              </div>
            )}
            {settings.simplifiedUI && (
              <div className="flex flex-col items-center justify-center p-2 bg-muted rounded-md">
                <Eye className="h-4 w-4 mb-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Simple UI</span>
              </div>
            )}
            {settings.playAmbientSounds && (
              <div className="flex flex-col items-center justify-center p-2 bg-muted rounded-md">
                <Volume2 className="h-4 w-4 mb-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Ambient</span>
              </div>
            )}
            {settings.muteAllSounds && (
              <div className="flex flex-col items-center justify-center p-2 bg-muted rounded-md">
                <VolumeX className="h-4 w-4 mb-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Muted</span>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Focus Mode Settings</DialogTitle>
            <DialogDescription>
              Customize how Focus Mode works to optimize your flow state.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Activation</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-enable" className="flex-1">
                  Auto-enable during flow state
                </Label>
                <Switch
                  id="auto-enable"
                  checked={settings.autoEnable}
                  onCheckedChange={(checked) =>
                    updateSettings({ autoEnable: checked })
                  }
                />
              </div>

              {settings.autoEnable && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-threshold" className="flex-1">
                    Auto-enable threshold
                  </Label>
                  <Select
                    value={settings.autoEnableThreshold}
                    onValueChange={(value: "light" | "deep") =>
                      updateSettings({ autoEnableThreshold: value })
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select threshold" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light Flow</SelectItem>
                      <SelectItem value="deep">Deep Flow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="keyboard-shortcut" className="flex-1">
                  Keyboard shortcut
                </Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="enable-shortcuts"
                    checked={settings.enableShortcuts}
                    onCheckedChange={(checked) =>
                      updateSettings({ enableShortcuts: checked })
                    }
                  />
                  <input
                    type="text"
                    value={settings.toggleShortcut}
                    onKeyDown={handleShortcutChange}
                    readOnly
                    disabled={!settings.enableShortcuts}
                    className="w-[120px] h-9 px-3 rounded-md border border-input bg-background text-sm"
                    placeholder="Press keys..."
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Interface</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="simplified-ui" className="flex-1">
                  Simplified UI
                </Label>
                <Switch
                  id="simplified-ui"
                  checked={settings.simplifiedUI}
                  onCheckedChange={(checked) =>
                    updateSettings({ simplifiedUI: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="hide-navigation" className="flex-1">
                  Hide navigation
                </Label>
                <Switch
                  id="hide-navigation"
                  checked={settings.hideNavigation}
                  onCheckedChange={(checked) =>
                    updateSettings({ hideNavigation: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="dim-interface" className="flex-1">
                  Dim interface
                </Label>
                <Switch
                  id="dim-interface"
                  checked={settings.dimInterface}
                  onCheckedChange={(checked) =>
                    updateSettings({ dimInterface: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reduce-motion" className="flex-1">
                  Reduce motion
                </Label>
                <Switch
                  id="reduce-motion"
                  checked={settings.reduceMotion}
                  onCheckedChange={(checked) =>
                    updateSettings({ reduceMotion: checked })
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notifications</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="hide-notifications" className="flex-1">
                  Hide notifications
                </Label>
                <Switch
                  id="hide-notifications"
                  checked={settings.hideNotifications}
                  onCheckedChange={(checked) =>
                    updateSettings({ hideNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="block-notifications" className="flex-1">
                  Block browser notifications
                </Label>
                <Switch
                  id="block-notifications"
                  checked={settings.blockNotifications}
                  onCheckedChange={(checked) =>
                    updateSettings({ blockNotifications: checked })
                  }
                />
              </div>

              {settings.blockNotifications && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-urgent" className="flex-1">
                    Allow urgent notifications
                  </Label>
                  <Switch
                    id="allow-urgent"
                    checked={settings.allowUrgentNotifications}
                    onCheckedChange={(checked) =>
                      updateSettings({ allowUrgentNotifications: checked })
                    }
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Sound</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="mute-sounds" className="flex-1">
                  Mute all sounds
                </Label>
                <Switch
                  id="mute-sounds"
                  checked={settings.muteAllSounds}
                  onCheckedChange={(checked) =>
                    updateSettings({ muteAllSounds: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="ambient-sounds" className="flex-1">
                  Play ambient sounds
                </Label>
                <Switch
                  id="ambient-sounds"
                  checked={settings.playAmbientSounds}
                  onCheckedChange={(checked) =>
                    updateSettings({ playAmbientSounds: checked })
                  }
                />
              </div>

              {settings.playAmbientSounds && (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-type" className="flex-1">
                      Sound type
                    </Label>
                    <Select
                      value={settings.ambientSoundType}
                      onValueChange={(value) =>
                        updateSettings({ ambientSoundType: value })
                      }
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select sound" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="white-noise">White Noise</SelectItem>
                        <SelectItem value="rain">Rain</SelectItem>
                        <SelectItem value="forest">Forest</SelectItem>
                        <SelectItem value="cafe">Cafe</SelectItem>
                        <SelectItem value="ocean">Ocean</SelectItem>
                        <SelectItem value="binaural">Binaural Beats</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="volume">Volume</Label>
                      <span className="text-sm text-muted-foreground">
                        {settings.ambientSoundVolume}%
                      </span>
                    </div>
                    <Slider
                      id="volume"
                      min={0}
                      max={100}
                      step={5}
                      value={[settings.ambientSoundVolume]}
                      onValueChange={(value) =>
                        updateSettings({ ambientSoundVolume: value[0] })
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsSettingsOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
