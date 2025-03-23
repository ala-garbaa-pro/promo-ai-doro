"use client";

import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Bell,
  Palette,
  User,
  Database,
  Save,
  RotateCcw,
  Volume2,
  Moon,
  Sun,
  Laptop,
  BellRing,
  BellOff,
  Download,
  Trash2,
  Shield,
  Accessibility,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { useSettings } from "@/lib/contexts/settings-context";
import { useAccessibility } from "@/lib/contexts/accessibility-context";
import { SkipToContent } from "@/components/accessibility/skip-to-content";
import AccessibilitySettings from "./accessibility";
import { useRef } from "react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const {
    settings,
    updateTimerSettings,
    updateNotificationSettings,
    updateThemeSettings,
    resetSettings,
    saveSettings,
    hasUnsavedChanges,
    exportSettings,
    importSettings,
  } = useSettings();
  const { announceToScreenReader } = useAccessibility();

  // Refs for keyboard navigation
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Handle timer settings change
  const handleTimerSettingChange = (
    key: keyof typeof settings.timer,
    value: number | boolean
  ) => {
    updateTimerSettings({ [key]: value });
  };

  // Handle notification settings change
  const handleNotificationSettingChange = (
    key: keyof typeof settings.notification,
    value: string | boolean | number
  ) => {
    updateNotificationSettings({ [key]: value });
  };

  // Handle theme settings change
  const handleThemeSettingChange = (
    key: keyof typeof settings.theme,
    value: string
  ) => {
    updateThemeSettings({ [key]: value as any });
  };

  // Handle save settings
  const handleSaveSettings = () => {
    saveSettings();
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
  };

  // Handle reset settings
  const handleResetSettings = () => {
    resetSettings();
    toast({
      title: "Settings reset",
      description: "Your settings have been reset to default values.",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <SkipToContent contentId="settings-content" />
      <div
        className="flex items-center justify-between mb-8"
        id="settings-content"
        ref={mainContentRef}
        tabIndex={-1}
      >
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize your Pomo AI-doro experience
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleResetSettings}
            className="border-border text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={!hasUnsavedChanges}
            aria-label="Save changes"
          >
            <Save className="h-4 w-4 mr-2" />
            {hasUnsavedChanges ? "Save Changes" : "Saved"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="timer" className="w-full">
        <TabsList className="w-full mb-6 grid grid-cols-6 h-auto">
          <TabsTrigger value="timer" className="flex items-center gap-2 py-3">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Timer</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2 py-3"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2 py-3">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Theme</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2 py-3">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2 py-3">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
          <TabsTrigger
            value="accessibility"
            className="flex items-center gap-2 py-3"
          >
            <Accessibility className="h-4 w-4" />
            <span className="hidden sm:inline">Accessibility</span>
          </TabsTrigger>
        </TabsList>

        {/* Timer Settings */}
        <TabsContent value="timer">
          <Card>
            <CardHeader>
              <CardTitle>Timer Settings</CardTitle>
              <CardDescription>
                Customize your Pomodoro timer durations and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pomodoroDuration">
                    Pomodoro Duration (minutes)
                  </Label>
                  <Input
                    id="pomodoroDuration"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.timer.pomodoroDuration}
                    onChange={(e) =>
                      handleTimerSettingChange(
                        "pomodoroDuration",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortBreakDuration">
                    Short Break Duration (minutes)
                  </Label>
                  <Input
                    id="shortBreakDuration"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.timer.shortBreakDuration}
                    onChange={(e) =>
                      handleTimerSettingChange(
                        "shortBreakDuration",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longBreakDuration">
                    Long Break Duration (minutes)
                  </Label>
                  <Input
                    id="longBreakDuration"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.timer.longBreakDuration}
                    onChange={(e) =>
                      handleTimerSettingChange(
                        "longBreakDuration",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="longBreakInterval">
                  Long Break Interval (pomodoros)
                </Label>
                <Input
                  id="longBreakInterval"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.timer.longBreakInterval}
                  onChange={(e) =>
                    handleTimerSettingChange(
                      "longBreakInterval",
                      parseInt(e.target.value)
                    )
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Number of pomodoros before a long break
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoStartBreaks">Auto-start Breaks</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically start breaks when a pomodoro ends
                    </p>
                  </div>
                  <Switch
                    id="autoStartBreaks"
                    checked={settings.timer.autoStartBreaks}
                    onCheckedChange={(checked) =>
                      handleTimerSettingChange("autoStartBreaks", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoStartPomodoros">
                      Auto-start Pomodoros
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically start pomodoros when a break ends
                    </p>
                  </div>
                  <Switch
                    id="autoStartPomodoros"
                    checked={settings.timer.autoStartPomodoros}
                    onCheckedChange={(checked) =>
                      handleTimerSettingChange("autoStartPomodoros", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Customize how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="soundEnabled">Sound Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Play a sound when a timer ends
                    </p>
                  </div>
                  <Switch
                    id="soundEnabled"
                    checked={settings.notification.soundEnabled}
                    onCheckedChange={(checked) =>
                      handleNotificationSettingChange("soundEnabled", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="desktopNotificationsEnabled">
                      Desktop Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show a notification when a timer ends
                    </p>
                  </div>
                  <Switch
                    id="desktopNotificationsEnabled"
                    checked={settings.notification.desktopNotificationsEnabled}
                    onCheckedChange={(checked) =>
                      handleNotificationSettingChange(
                        "desktopNotificationsEnabled",
                        checked
                      )
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="volume">Notification Volume</Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.notification.volume}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    id="volume"
                    disabled={!settings.notification.soundEnabled}
                    min={0}
                    max={100}
                    step={1}
                    value={[settings.notification.volume]}
                    onValueChange={(value) =>
                      handleNotificationSettingChange("volume", value[0])
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="notificationSound">Notification Sound</Label>
                <Select
                  disabled={!settings.notification.soundEnabled}
                  value={settings.notification.notificationSound}
                  onValueChange={(value) =>
                    handleNotificationSettingChange("notificationSound", value)
                  }
                >
                  <SelectTrigger id="notificationSound">
                    <SelectValue placeholder="Select a sound" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bell">Bell</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="chime">Chime</SelectItem>
                    <SelectItem value="marimba">Marimba</SelectItem>
                    <SelectItem value="xylophone">Xylophone</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex justify-end mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!settings.notification.soundEnabled}
                    onClick={() => {
                      // In a real app, this would play the selected sound
                      toast({
                        title: "Sound Preview",
                        description: `Playing ${settings.notification.notificationSound} sound.`,
                      });
                    }}
                  >
                    <Volume2 className="h-3 w-3 mr-2" />
                    Test Sound
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize the appearance of the app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Color Theme</Label>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-2 ${
                      theme === "light" ? "border-primary" : ""
                    }`}
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-2 ${
                      theme === "dark" ? "border-primary" : ""
                    }`}
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-2 ${
                      theme === "system" ? "border-primary" : ""
                    }`}
                    onClick={() => setTheme("system")}
                  >
                    <Laptop className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <Select
                  value={settings.theme.accentColor}
                  onValueChange={(value) =>
                    handleThemeSettingChange("accentColor", value)
                  }
                >
                  <SelectTrigger id="accentColor">
                    <SelectValue placeholder="Select accent color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indigo">Indigo</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  This setting will be applied in a future update
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size</Label>
                <Select
                  value={settings.theme.fontSize}
                  onValueChange={(value) =>
                    handleThemeSettingChange("fontSize", value)
                  }
                >
                  <SelectTrigger id="fontSize">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  This setting will be applied in a future update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  defaultValue={user?.name || ""}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  placeholder="Your email"
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  Your email address is used for login and cannot be changed
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter a new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                />
              </div>

              <Button className="w-full">Update Password</Button>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all of your data
                </p>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    // In a real app, this would show a confirmation dialog
                    toast({
                      title: "Account Deletion",
                      description:
                        "This feature is not implemented in this demo.",
                      variant: "destructive",
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Settings */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Export Your Data</h3>
                <p className="text-sm text-muted-foreground">
                  Download all your data in a JSON format
                </p>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Clear Local Data</h3>
                <p className="text-sm text-muted-foreground">
                  Clear all locally stored data and settings
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // In a real app, this would clear local storage
                    toast({
                      title: "Data Cleared",
                      description: "Your local data has been cleared.",
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Data
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analyticsConsent">
                      Anonymous Usage Analytics
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Help us improve by sending anonymous usage data
                    </p>
                  </div>
                  <Switch id="analyticsConsent" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketingConsent">
                      Marketing Communications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and improvements
                    </p>
                  </div>
                  <Switch id="marketingConsent" defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-start gap-4">
                  <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Privacy Policy</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      We take your privacy seriously. Your data is stored
                      securely and never shared with third parties without your
                      consent.
                    </p>
                    <Button
                      variant="link"
                      className="px-0 h-auto text-sm text-primary"
                    >
                      Read our full privacy policy
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibility Settings */}
        <TabsContent value="accessibility">
          <AccessibilitySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
