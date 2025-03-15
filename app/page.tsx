import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32 lg:py-40">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent opacity-30"></div>
        </div>

        {/* Animated circles */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full filter blur-3xl animate-float opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-float opacity-30" style={{ animationDelay: '1s' }}></div>

        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-poppins tracking-tight mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">Focus Better</span> with
                <span className="block mt-2 text-white">Pomo AI-doro</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 mb-8 font-mono">
                Boost your productivity with our AI-powered Pomodoro timer that adapts to your work habits and helps you stay focused.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link href="/timer" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-medium text-center shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40">
                  Get Started Free
                </Link>
                <Link href="/about" className="px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-lg transition-all duration-300 transform hover:scale-105 text-center">
                  Learn More
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-400 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-400">
                  <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.674 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
                <span className="mx-2">•</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-400">
                  <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                </svg>
                <span>Privacy focused</span>
              </div>
            </div>

            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl blur-2xl opacity-30 animate-pulse-subtle"></div>
                <div className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-2 bg-gray-800 border-b border-gray-700 flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="mx-auto text-xs text-gray-400 font-mono">Pomo AI-doro</div>
                  </div>
                  <div className="p-6 flex flex-col items-center">
                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                      <div className="text-4xl font-bold text-white">25:00</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-medium text-sm">Start Focus</button>
                      <button className="px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-lg transition-all text-sm">Take Break</button>
                    </div>
                    <div className="mt-6 w-full bg-gray-800 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-2 font-mono">AI Suggestions:</div>
                      <div className="text-sm text-white">Based on your patterns, try a 30-minute focus session followed by a 7-minute break for optimal productivity.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-poppins mb-4">Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">Pomo AI-doro</span>?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Our AI-powered Pomodoro timer adapts to your work habits and helps you achieve peak productivity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-400">
                  <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                  <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-poppins">Smart Scheduling</h3>
              <p className="text-gray-400">Our AI analyzes your productivity patterns and suggests optimal work and break intervals tailored to your habits.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-400">
                  <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-poppins">Performance Analytics</h3>
              <p className="text-gray-400">Track your focus sessions, breaks, and productivity trends with detailed analytics and visualizations.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-400">
                  <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-poppins">Focus Boosters</h3>
              <p className="text-gray-400">AI-powered suggestions and techniques to help you overcome distractions and maintain deep focus.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-400">
                  <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-poppins">Cross-Platform Sync</h3>
              <p className="text-gray-400">Seamlessly sync your sessions across all your devices with real-time updates and cloud storage.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-400">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-poppins">Smart Notifications</h3>
              <p className="text-gray-400">Receive intelligent reminders and notifications that adapt to your work context and focus state.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-400">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM6.262 6.072a8.25 8.25 0 1010.562-.766 4.5 4.5 0 01-1.318 1.357L14.25 7.5l.165.33a.809.809 0 01-1.086 1.085l-.604-.302a1.125 1.125 0 00-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 01-2.288 4.04l-.723.724a1.125 1.125 0 01-1.298.21l-.153-.076a1.125 1.125 0 01-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 01-.21-1.298L9.75 12l-1.64-1.64a6 6 0 01-1.676-3.257l-.172-1.03z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-poppins">Global Community</h3>
              <p className="text-gray-400">Connect with a community of productivity enthusiasts, share techniques, and participate in focus challenges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 via-transparent to-transparent opacity-30"></div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold font-poppins mb-4">Ready to Boost Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">Productivity</span>?</h2>
              <p className="text-gray-400 mb-8">Join thousands of users who have transformed their work habits with Pomo AI-doro.</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-medium text-center shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40">
                  Start for Free
                </Link>
                <Link href="/demo" className="px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-lg transition-all duration-300 transform hover:scale-105 text-center">
                  Watch Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
