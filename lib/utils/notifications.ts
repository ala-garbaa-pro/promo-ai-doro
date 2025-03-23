"use client";

/**
 * Request permission for desktop notifications
 * @returns Promise that resolves to the permission status
 */
export const requestNotificationPermission =
  async (): Promise<NotificationPermission> => {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notifications");
      return "denied";
    }

    // Check if permission is already granted
    if (Notification.permission === "granted") {
      return "granted";
    }

    // Request permission
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  };

/**
 * Show a desktop notification
 * @param title The title of the notification
 * @param options The notification options
 * @returns The notification object or null if notifications are not supported or permitted
 */
export const showNotification = (
  title: string,
  options?: NotificationOptions
): Notification | null => {
  // Check if the browser supports notifications
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications");
    return null;
  }

  // Check if permission is granted
  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return null;
  }

  // Show notification
  try {
    const notification = new Notification(title, options);
    return notification;
  } catch (error) {
    console.error("Error showing notification:", error);
    return null;
  }
};

/**
 * Play a sound
 * @param sound The sound file to play
 * @param volume The volume (0-1)
 * @returns Promise that resolves when the sound is played
 */
export const playSound = async (
  sound: string,
  volume: number = 1
): Promise<void> => {
  try {
    const audio = new Audio(sound);
    audio.volume = Math.min(Math.max(volume, 0), 1); // Ensure volume is between 0 and 1
    await audio.play();
  } catch (error) {
    console.error("Error playing sound:", error);
  }
};
