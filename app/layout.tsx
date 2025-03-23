import type { Metadata } from "next";
import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import LayoutWrapper from "@/components/app/layout-wrapper";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SettingsProvider } from "@/lib/contexts/settings-context";
import { AccessibilityProvider } from "@/lib/contexts/accessibility-context";
import { OfflineSyncProvider } from "@/components/app/offline-sync-provider";
import { Analytics } from "@vercel/analytics/react";
import ServiceWorkerRegister from "./sw-register";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Pomo AI-doro",
    default: "Pomo AI-doro",
  },
  description:
    "Your intelligent productivity companion - Boost your focus and productivity with AI-powered Pomodoro technique",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pomo AI-doro",
  },
  icons: {
    icon: "/favicon.ico",
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} antialiased flex flex-col min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SettingsProvider>
              <AccessibilityProvider>
                <OfflineSyncProvider>
                  <LayoutWrapper>{children}</LayoutWrapper>
                  <Toaster />
                  <Analytics />
                  <ServiceWorkerRegister />
                </OfflineSyncProvider>
              </AccessibilityProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
