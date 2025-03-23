"use client";

import { useState, useEffect, useRef } from "react";

interface AmbientSoundPlayerHook {
  isPlaying: boolean;
  currentSound: string | null;
  volume: number;
  playSound: (soundUrl: string, loop?: boolean) => void;
  pauseSound: () => void;
  stopSound: () => void;
  setVolume: (volume: number) => void;
}

export function useAmbientSoundPlayer(): AmbientSoundPlayerHook {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(0.5); // 0 to 1
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;

      // Clean up when component unmounts
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
      };
    }
  }, []);

  // Play a sound
  const playSound = (soundUrl: string, loop = false) => {
    if (!audioRef.current) return;

    // If the same sound is already playing, don't restart it
    if (isPlaying && currentSound === soundUrl) return;

    // If a different sound is playing, stop it first
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Set up the new sound
    audioRef.current.src = soundUrl;
    audioRef.current.loop = loop;
    audioRef.current.volume = volume;

    // Play the sound
    const playPromise = audioRef.current.play();

    // Handle play promise (required for modern browsers)
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setCurrentSound(soundUrl);
        })
        .catch((error) => {
          console.error("Error playing sound:", error);
          setIsPlaying(false);
          setCurrentSound(null);
        });
    }
  };

  // Pause the current sound
  const pauseSound = () => {
    if (!audioRef.current || !isPlaying) return;

    audioRef.current.pause();
    setIsPlaying(false);
  };

  // Stop the current sound
  const stopSound = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentSound(null);
  };

  // Set the volume
  const setVolume = (newVolume: number) => {
    // Ensure volume is between 0 and 1
    const clampedVolume = Math.min(Math.max(newVolume, 0), 1);

    setVolumeState(clampedVolume);

    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  };

  return {
    isPlaying,
    currentSound,
    volume,
    playSound,
    pauseSound,
    stopSound,
    setVolume,
  };
}
