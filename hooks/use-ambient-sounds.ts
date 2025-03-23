"use client";

import { useState, useEffect, useRef } from "react";
import { useSettings } from "@/lib/contexts/settings-context";

export type AmbientSoundType = "white_noise" | "nature" | "ambient" | "music";

export interface AmbientSound {
  id: string;
  name: string;
  type: AmbientSoundType;
  url: string;
  icon: string;
}

// Default ambient sounds
export const defaultAmbientSounds: AmbientSound[] = [
  {
    id: "rain",
    name: "Rain",
    type: "nature",
    url: "/sounds/ambient/rain.mp3",
    icon: "cloud-rain",
  },
  {
    id: "forest",
    name: "Forest",
    type: "nature",
    url: "/sounds/ambient/forest.mp3",
    icon: "tree",
  },
  {
    id: "cafe",
    name: "Cafe",
    type: "ambient",
    url: "/sounds/ambient/cafe.mp3",
    icon: "coffee",
  },
  {
    id: "white-noise",
    name: "White Noise",
    type: "white_noise",
    url: "/sounds/ambient/white-noise.mp3",
    icon: "waves",
  },
  {
    id: "fireplace",
    name: "Fireplace",
    type: "ambient",
    url: "/sounds/ambient/fireplace.mp3",
    icon: "flame",
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    type: "nature",
    url: "/sounds/ambient/ocean.mp3",
    icon: "ship",
  },
  {
    id: "night",
    name: "Night Sounds",
    type: "nature",
    url: "/sounds/ambient/night.mp3",
    icon: "moon",
  },
  {
    id: "lofi",
    name: "Lo-Fi Beats",
    type: "music",
    url: "/sounds/ambient/lofi.mp3",
    icon: "music",
  },
];

export interface AmbientSoundState {
  isPlaying: boolean;
  volume: number;
  currentSoundId: string | null;
}

export function useAmbientSounds() {
  const { settings } = useSettings();
  const [sounds, setSounds] = useState<AmbientSound[]>(defaultAmbientSounds);
  const [state, setState] = useState<AmbientSoundState>({
    isPlaying: false,
    volume: settings.notification.ambientSounds.volume / 100,
    currentSoundId: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);

  // Initialize audio context and apply settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContext.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      gainNode.current = audioContext.current.createGain();
      gainNode.current.connect(audioContext.current.destination);

      // Update volume from settings
      setState((prev) => ({
        ...prev,
        volume: settings.notification.ambientSounds.volume / 100,
      }));

      // Auto-play default sound if enabled
      if (
        settings.notification.ambientSounds.enabled &&
        settings.notification.ambientSounds.autoPlay &&
        !state.isPlaying
      ) {
        const defaultSoundId = settings.notification.ambientSounds.defaultSound;
        if (defaultSoundId) {
          setTimeout(() => playSound(defaultSoundId), 500);
        }
      }

      return () => {
        if (audioContext.current) {
          audioContext.current.close();
        }
      };
    }
  }, [settings.notification.ambientSounds]);

  // Play a sound
  const playSound = (soundId: string) => {
    const sound = sounds.find((s) => s.id === soundId);
    if (!sound) return;

    // Stop current sound if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Create and play new audio
    const audio = new Audio(sound.url);
    audio.loop = true;
    audio.volume = state.volume;

    // Connect to audio context for more control
    if (audioContext.current && gainNode.current) {
      const source = audioContext.current.createMediaElementSource(audio);
      source.connect(gainNode.current);
      gainNode.current.gain.value = state.volume;
    }

    audio
      .play()
      .catch((err) => console.error("Error playing ambient sound:", err));
    audioRef.current = audio;

    setState((prev) => ({
      ...prev,
      isPlaying: true,
      currentSoundId: soundId,
    }));
  };

  // Stop current sound
  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isPlaying: false,
      currentSoundId: null,
    }));
  };

  // Set volume
  const setVolume = (volume: number) => {
    const normalizedVolume = Math.min(Math.max(volume, 0), 1);

    if (audioRef.current) {
      audioRef.current.volume = normalizedVolume;
    }

    if (gainNode.current) {
      gainNode.current.gain.value = normalizedVolume;
    }

    setState((prev) => ({
      ...prev,
      volume: normalizedVolume,
    }));
  };

  // Toggle play/pause
  const toggleSound = (soundId: string) => {
    if (state.isPlaying && state.currentSoundId === soundId) {
      stopSound();
    } else {
      playSound(soundId);
    }
  };

  // Get sounds by type
  const getSoundsByType = (type: AmbientSoundType) => {
    return sounds.filter((sound) => sound.type === type);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    sounds,
    state,
    playSound,
    stopSound,
    toggleSound,
    setVolume,
    getSoundsByType,
  };
}
