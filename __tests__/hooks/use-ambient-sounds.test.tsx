import { renderHook, act } from "@testing-library/react";
import { useAmbientSounds } from "@/hooks/use-ambient-sounds";
import { SettingsProvider } from "@/lib/contexts/settings-context";
import React from "react";

// Mock the Audio API
global.Audio = jest.fn().mockImplementation(() => ({
  pause: jest.fn(),
  play: jest.fn().mockResolvedValue(undefined),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock AudioContext
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockStart = jest.fn();
const mockStop = jest.fn();

const mockCreateOscillator = jest.fn().mockImplementation(() => ({
  connect: mockConnect,
  disconnect: mockDisconnect,
  start: mockStart,
  stop: mockStop,
  frequency: { value: 0 },
  type: "sine",
}));

const mockCreateGain = jest.fn().mockImplementation(() => ({
  connect: mockConnect,
  gain: { value: 0 },
}));

const mockCreateStereoPanner = jest.fn().mockImplementation(() => ({
  connect: mockConnect,
  pan: { value: 0 },
}));

const mockCreateMediaElementSource = jest.fn().mockImplementation(() => ({
  connect: mockConnect,
}));

global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: mockCreateOscillator,
  createGain: mockCreateGain,
  createStereoPanner: mockCreateStereoPanner,
  createMediaElementSource: mockCreateMediaElementSource,
  destination: {},
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Wrapper component for the hook
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
);

describe("useAmbientSounds", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useAmbientSounds(), { wrapper });

    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.currentSoundId).toBeNull();
    expect(result.current.sounds.length).toBeGreaterThan(0);
  });

  it("should play a sound", () => {
    const { result } = renderHook(() => useAmbientSounds(), { wrapper });

    act(() => {
      result.current.playSound("rain");
    });

    expect(result.current.state.isPlaying).toBe(true);
    expect(result.current.state.currentSoundId).toBe("rain");
    expect(global.Audio).toHaveBeenCalled();
  });

  it("should stop a sound", () => {
    const { result } = renderHook(() => useAmbientSounds(), { wrapper });

    act(() => {
      result.current.playSound("rain");
    });

    expect(result.current.state.isPlaying).toBe(true);

    act(() => {
      result.current.stopSound();
    });

    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.currentSoundId).toBeNull();
  });

  it("should toggle a sound", () => {
    const { result } = renderHook(() => useAmbientSounds(), { wrapper });

    // Play sound
    act(() => {
      result.current.toggleSound("rain");
    });

    expect(result.current.state.isPlaying).toBe(true);
    expect(result.current.state.currentSoundId).toBe("rain");

    // Stop sound
    act(() => {
      result.current.toggleSound("rain");
    });

    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.currentSoundId).toBeNull();

    // Play different sound
    act(() => {
      result.current.toggleSound("forest");
    });

    expect(result.current.state.isPlaying).toBe(true);
    expect(result.current.state.currentSoundId).toBe("forest");
  });

  it("should set volume", () => {
    const { result } = renderHook(() => useAmbientSounds(), { wrapper });

    act(() => {
      result.current.playSound("rain");
    });

    act(() => {
      result.current.setVolume(0.5);
    });

    expect(result.current.state.volume).toBe(0.5);
  });

  it("should play binaural beats", () => {
    const { result } = renderHook(() => useAmbientSounds(), { wrapper });

    // Find a binaural sound
    const binauralSound = result.current.sounds.find(
      (s) => s.type === "binaural"
    );

    if (binauralSound) {
      act(() => {
        result.current.playSound(binauralSound.id);
      });

      expect(result.current.state.isPlaying).toBe(true);
      expect(result.current.state.currentSoundId).toBe(binauralSound.id);
      expect(mockCreateOscillator).toHaveBeenCalled();
      expect(mockCreateStereoPanner).toHaveBeenCalled();
      expect(mockStart).toHaveBeenCalled();
    }
  });

  it("should filter sounds by type", () => {
    const { result } = renderHook(() => useAmbientSounds(), { wrapper });

    const natureSounds = result.current.getSoundsByType("nature");
    const binauralSounds = result.current.getSoundsByType("binaural");

    expect(natureSounds.every((s) => s.type === "nature")).toBe(true);
    expect(binauralSounds.every((s) => s.type === "binaural")).toBe(true);
  });
});
