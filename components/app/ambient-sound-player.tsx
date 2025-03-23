"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAmbientSounds, AmbientSoundType } from "@/hooks/use-ambient-sounds";
import { AnimatedTransition } from "@/components/ui/animated-transition";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  CloudRain,
  Tree,
  Coffee,
  Waves,
  Flame,
  Ship,
  Moon,
  Music,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "cloud-rain": <CloudRain className="h-4 w-4" />,
  tree: <Tree className="h-4 w-4" />,
  coffee: <Coffee className="h-4 w-4" />,
  waves: <Waves className="h-4 w-4" />,
  flame: <Flame className="h-4 w-4" />,
  ship: <Ship className="h-4 w-4" />,
  moon: <Moon className="h-4 w-4" />,
  music: <Music className="h-4 w-4" />,
};

export function AmbientSoundPlayer() {
  const { sounds, state, toggleSound, setVolume, getSoundsByType } =
    useAmbientSounds();

  const [activeTab, setActiveTab] = useState<AmbientSoundType>("nature");
  const filteredSounds = getSoundsByType(activeTab);

  return (
    <AnimatedTransition type="scale" duration={0.4}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ambient Sounds</span>
            <div className="flex items-center space-x-2">
              <Slider
                className="w-24"
                value={[state.volume * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => setVolume(value[0] / 100)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setVolume(state.volume > 0 ? 0 : 0.5)}
              >
                {state.volume > 0 ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="nature"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as AmbientSoundType)}
          >
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="nature">Nature</TabsTrigger>
              <TabsTrigger value="ambient">Ambient</TabsTrigger>
              <TabsTrigger value="white_noise">White Noise</TabsTrigger>
              <TabsTrigger value="music">Music</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="grid grid-cols-2 gap-2">
                {filteredSounds.map((sound) => (
                  <Button
                    key={sound.id}
                    variant={
                      state.currentSoundId === sound.id ? "default" : "outline"
                    }
                    className="flex items-center justify-start h-auto py-3 px-4"
                    onClick={() => toggleSound(sound.id)}
                  >
                    <div className="mr-2">
                      {state.currentSoundId === sound.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">{iconMap[sound.icon]}</span>
                      <span>{sound.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AnimatedTransition>
  );
}
