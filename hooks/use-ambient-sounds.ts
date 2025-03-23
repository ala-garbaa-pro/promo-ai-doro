"use client";

import { useState, useEffect, useRef } from "react";
import { useSettings } from "@/lib/contexts/settings-context";

export type AmbientSoundType =
  | "white_noise"
  | "nature"
  | "ambient"
  | "music"
  | "binaural"
  | "focus";

export interface AmbientSound {
  id: string;
  name: string;
  type: AmbientSoundType;
  url: string;
  icon: string;
  description?: string;
  frequency?: {
    base?: number; // Base frequency in Hz
    beat?: number; // Beat frequency in Hz
  };
}

// Default ambient sounds
export const defaultAmbientSounds: AmbientSound[] = [
  // Nature sounds
  {
    id: "rain",
    name: "Rain",
    type: "nature",
    url: "/sounds/ambient/rain.mp3",
    icon: "cloud-rain",
    description: "Gentle rainfall to help you focus",
  },
  {
    id: "forest",
    name: "Forest",
    type: "nature",
    url: "/sounds/ambient/forest.mp3",
    icon: "tree",
    description: "Peaceful forest ambience with birds chirping",
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    type: "nature",
    url: "/sounds/ambient/ocean.mp3",
    icon: "ship",
    description: "Calming ocean waves for relaxation",
  },
  {
    id: "night",
    name: "Night Sounds",
    type: "nature",
    url: "/sounds/ambient/night.mp3",
    icon: "moon",
    description: "Crickets and gentle night ambience",
  },
  {
    id: "thunderstorm",
    name: "Thunderstorm",
    type: "nature",
    url: "/sounds/ambient/thunderstorm.mp3",
    icon: "cloud-lightning",
    description: "Distant thunder with rainfall",
  },

  // Ambient sounds
  {
    id: "cafe",
    name: "Cafe",
    type: "ambient",
    url: "/sounds/ambient/cafe.mp3",
    icon: "coffee",
    description: "Coffee shop ambience with quiet chatter",
  },
  {
    id: "fireplace",
    name: "Fireplace",
    type: "ambient",
    url: "/sounds/ambient/fireplace.mp3",
    icon: "flame",
    description: "Crackling fireplace for cozy focus",
  },
  {
    id: "library",
    name: "Library",
    type: "ambient",
    url: "/sounds/ambient/library.mp3",
    icon: "book",
    description: "Quiet library ambience for deep work",
  },
  {
    id: "keyboard",
    name: "Keyboard Typing",
    type: "ambient",
    url: "/sounds/ambient/keyboard.mp3",
    icon: "keyboard",
    description: "Mechanical keyboard typing sounds",
  },

  // White noise
  {
    id: "white-noise",
    name: "White Noise",
    type: "white_noise",
    url: "/sounds/ambient/white-noise.mp3",
    icon: "waves",
    description: "Pure white noise to mask distractions",
  },
  {
    id: "brown-noise",
    name: "Brown Noise",
    type: "white_noise",
    url: "/sounds/ambient/brown-noise.mp3",
    icon: "wind",
    description: "Lower frequency noise for deeper focus",
  },
  {
    id: "pink-noise",
    name: "Pink Noise",
    type: "white_noise",
    url: "/sounds/ambient/pink-noise.mp3",
    icon: "activity",
    description: "Balanced noise spectrum for concentration",
  },

  // Music
  {
    id: "lofi",
    name: "Lo-Fi Beats",
    type: "music",
    url: "/sounds/ambient/lofi.mp3",
    icon: "music",
    description: "Relaxing lo-fi hip hop beats",
  },
  {
    id: "classical",
    name: "Classical Focus",
    type: "music",
    url: "/sounds/ambient/classical.mp3",
    icon: "music",
    description: "Classical music for enhanced concentration",
  },
  {
    id: "ambient-music",
    name: "Ambient Music",
    type: "music",
    url: "/sounds/ambient/ambient-music.mp3",
    icon: "music",
    description: "Atmospheric ambient music for deep work",
  },

  // Binaural beats
  {
    id: "alpha-waves",
    name: "Alpha Waves",
    type: "binaural",
    url: "/sounds/ambient/binaural/alpha.mp3",
    icon: "brain",
    description: "8-12 Hz - Relaxed focus and creativity",
    frequency: {
      base: 200,
      beat: 10,
    },
  },
  {
    id: "beta-waves",
    name: "Beta Waves",
    type: "binaural",
    url: "/sounds/ambient/binaural/beta.mp3",
    icon: "zap",
    description: "13-30 Hz - Active thinking and problem-solving",
    frequency: {
      base: 200,
      beat: 20,
    },
  },
  {
    id: "theta-waves",
    name: "Theta Waves",
    type: "binaural",
    url: "/sounds/ambient/binaural/theta.mp3",
    icon: "moon",
    description: "4-7 Hz - Deep relaxation and meditation",
    frequency: {
      base: 200,
      beat: 6,
    },
  },
  {
    id: "gamma-waves",
    name: "Gamma Waves",
    type: "binaural",
    url: "/sounds/ambient/binaural/gamma.mp3",
    icon: "sparkles",
    description: "30-100 Hz - Peak concentration and cognition",
    frequency: {
      base: 200,
      beat: 40,
    },
  },

  // Focus-optimized sounds
  {
    id: "deep-focus",
    name: "Deep Focus",
    type: "focus",
    url: "/sounds/ambient/focus/deep-focus.mp3",
    icon: "target",
    description: "Specially designed audio for maximum concentration",
  },
  {
    id: "flow-state",
    name: "Flow State",
    type: "focus",
    url: "/sounds/ambient/focus/flow-state.mp3",
    icon: "droplets",
    description: "Audio engineered to help achieve flow state",
  },
  {
    id: "study-focus",
    name: "Study Focus",
    type: "focus",
    url: "/sounds/ambient/focus/study-focus.mp3",
    icon: "book-open",
    description: "Optimized for learning and information retention",
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
  const oscillatorNodes = useRef<OscillatorNode[]>([]);
  const binauralActive = useRef<boolean>(false);

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
    stopSound();

    // Check if this is a binaural beat
    if (sound.type === "binaural" && sound.frequency && audioContext.current) {
      playBinauralBeat(sound);
      return;
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

  // Play binaural beat
  const playBinauralBeat = (sound: AmbientSound) => {
    if (!audioContext.current || !gainNode.current || !sound.frequency) return;

    // Clean up any existing oscillators
    oscillatorNodes.current.forEach((osc) => {
      osc.stop();
      osc.disconnect();
    });
    oscillatorNodes.current = [];

    const { base = 200, beat = 10 } = sound.frequency;

    // Create left ear oscillator
    const leftOsc = audioContext.current.createOscillator();
    leftOsc.type = "sine";
    leftOsc.frequency.value = base;

    // Create right ear oscillator with the beat frequency difference
    const rightOsc = audioContext.current.createOscillator();
    rightOsc.type = "sine";
    rightOsc.frequency.value = base + beat;

    // Create stereo panner for each oscillator
    const leftPanner = audioContext.current.createStereoPanner();
    leftPanner.pan.value = -1; // Full left

    const rightPanner = audioContext.current.createStereoPanner();
    rightPanner.pan.value = 1; // Full right

    // Connect the oscillators to their respective panners
    leftOsc.connect(leftPanner);
    rightOsc.connect(rightPanner);

    // Connect panners to gain node
    leftPanner.connect(gainNode.current);
    rightPanner.connect(gainNode.current);

    // Set volume
    gainNode.current.gain.value = state.volume * 0.3; // Lower volume for comfort

    // Start oscillators
    leftOsc.start();
    rightOsc.start();

    // Store references for cleanup
    oscillatorNodes.current = [leftOsc, rightOsc];
    binauralActive.current = true;

    setState((prev) => ({
      ...prev,
      isPlaying: true,
      currentSoundId: sound.id,
    }));
  };

  // Stop current sound
  const stopSound = () => {
    // Stop regular audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Stop binaural beats
    if (binauralActive.current && oscillatorNodes.current.length > 0) {
      oscillatorNodes.current.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (err) {
          console.error("Error stopping oscillator:", err);
        }
      });
      oscillatorNodes.current = [];
      binauralActive.current = false;
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
      // For binaural beats, use a lower volume multiplier for comfort
      const volumeMultiplier = binauralActive.current ? 0.3 : 1;
      gainNode.current.gain.value = normalizedVolume * volumeMultiplier;
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
