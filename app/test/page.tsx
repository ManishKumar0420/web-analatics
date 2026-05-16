
"use client";
import React, { useState } from "react";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
      
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <script async src = "http://127.0.0.1:3000/js/scout.js"></script>
            
      {/* --- NAVIGATION BAR --- */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-indigo-600 tracking-tight">
            SessionLens
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition">
              Features
            </a>
            <a href="#analytics" className="hover:text-indigo-600 transition">
              Analytics
            </a>
            <a href="#docs" className="hover:text-indigo-600 transition">
              Docs
            </a>
          </div>

          <div className="hidden md:block">
            <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm">
              Dashboard
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-600 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-3 shadow-inner">
            <a href="#features" className="block text-slate-600 font-medium">
              Features
            </a>
            <a href="#analytics" className="block text-slate-600 font-medium">
              Analytics
            </a>
            <a href="#docs" className="block text-slate-600 font-medium">
              Docs
            </a>
            <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium">
              Dashboard
            </button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="max-w-6xl mx-auto px-4 py-20 text-center">
        <span className="bg-indigo-50 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full inline-block mb-4">
          Now Live: Next.js 15 Integration
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Real-time user insights without the performance hit.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
          Track session journeys, map raw viewport clicks, and generate
          crystal-clear dynamic heatmaps instantly.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-indigo-700 transition shadow-md shadow-indigo-200">
            Get Started Free
          </button>
          <button className="bg-white text-slate-700 border border-slate-200 px-8 py-3.5 rounded-xl font-medium hover:bg-slate-50 transition">
            Documentation
          </button>
        </div>
      </header>

      {/* --- FEATURES GRID --- */}
      <section
        id="features"
        className="bg-white py-20 border-t border-b border-slate-100"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900">
              Engineered for Modern Web Apps
            </h2>
            <p className="text-slate-500 mt-3">
              Everything you need to visualize client interactions seamlessly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition duration-300">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xl mb-5">
                📍
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Coordinate Normalization
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Automatically maps raw viewport pixels back to responsive
                percentage points. Flawless rendering on mobile, tablet, and
                desktop.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition duration-300">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xl mb-5">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                React Query Caching
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Zero lag data synchronization. Leverages pre-fetched session
                event pipelines to keep your dashboard running at peak
                performance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition duration-300">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xl mb-5">
                📊
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Dynamic Heatmaps
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Intensity-based radial-gradient points displaying exactly where
                users hover, click, and interact inside your application.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="max-w-6xl mx-auto px-4 py-12 text-center text-sm text-slate-400">
        <p>© 2026 SessionLens. Built using React and Tailwind CSS.</p>
      </footer>
    </div>
  );
}
