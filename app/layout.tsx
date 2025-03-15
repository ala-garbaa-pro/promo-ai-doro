import type { Metadata } from "next";
import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Pomo AI-doro",
    default: "Pomo AI-doro"
  },
  description: "Your intelligent productivity companion - Boost your focus and productivity with AI-powered Pomodoro technique",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#111827",
  icons: {
    icon: "/favicon.ico"
  },
  openGraph: {
    title: "Pomo AI-doro",
    description: "Your intelligent productivity companion - Boost your focus and productivity with AI-powered Pomodoro technique",
    url: "https://pomo-ai-doro.vercel.app",
    siteName: "Pomo AI-doro",
    locale: "en_US",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} antialiased flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-950`}
      >
        <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-gray-950/80 border-b border-gray-800 px-4 py-3 sm:py-4">
          <div className="container mx-auto max-w-7xl flex justify-between items-center">
            <Link href="/" className="group flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-base sm:text-lg font-semibold font-poppins text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 transition-all">
                Pomo AI-doro
              </div>
            </Link>
            <div className="flex items-center gap-4 sm:gap-6">
              <nav className="hidden md:flex items-center gap-6">
                <a href="/features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="/pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Pricing</a>
                <a href="/blog" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Blog</a>
              </nav>
              <a
                href="https://github.com/PierrunoYT/pomo-ai-doro"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
                className="p-2 rounded-full hover:bg-gray-800 transition-all group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-gray-400 group-hover:fill-white transition-colors"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.09.682-.217.682-.48 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.137 20.166 22 16.42 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <button className="hidden sm:block px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40">
                Get Started
              </button>
              <button className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        <main className="flex-grow">
          {children}
        </main>
        <footer className="border-t border-gray-800 bg-gray-950 py-12">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-lg font-semibold font-poppins text-white">
                    Pomo AI-doro
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">Your intelligent productivity companion powered by AI.</p>
                <div className="flex gap-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                  </a>
                  <a href="https://github.com/PierrunoYT/pomo-ai-doro" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                  </a>
                </div>
              </div>
              <div>
                <h3 className="text-white font-medium mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><a href="/features" className="text-gray-400 hover:text-white text-sm transition-colors">Features</a></li>
                  <li><a href="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</a></li>
                  <li><a href="/integrations" className="text-gray-400 hover:text-white text-sm transition-colors">Integrations</a></li>
                  <li><a href="/changelog" className="text-gray-400 hover:text-white text-sm transition-colors">Changelog</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="/blog" className="text-gray-400 hover:text-white text-sm transition-colors">Blog</a></li>
                  <li><a href="/documentation" className="text-gray-400 hover:text-white text-sm transition-colors">Documentation</a></li>
                  <li><a href="/guides" className="text-gray-400 hover:text-white text-sm transition-colors">Guides</a></li>
                  <li><a href="/help" className="text-gray-400 hover:text-white text-sm transition-colors">Help Center</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About</a></li>
                  <li><a href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a></li>
                  <li><a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-sm text-gray-400 text-center">
                © {new Date().getFullYear()} Pomo AI-doro. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
