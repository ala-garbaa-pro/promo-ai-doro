import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home page",
  description: "Home desc...",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-roboto-sans">
          Welcome to Promo AI-doro
        </h1>
        
        <p className="text-xl text-gray-300 max-w-2xl mx-auto font-geist-mono">
          Your intelligent productivity companion
        </p>
        
        <div className="flex gap-4 justify-center mt-8">
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-roboto-sans">
            Get Started
          </button>
          <button className="px-6 py-3 border border-purple-500 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-300 transform hover:scale-105 font-geist-mono">
            Learn More
          </button>
        </div>
      </div>
    </main>
  );
}
