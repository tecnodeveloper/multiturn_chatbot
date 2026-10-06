"use client";

import React, { FC } from "react";
import Link from "next/link";
import { RotateCcw, AlertTriangle } from "lucide-react";

interface AnalyticsErrorViewProps {
  error?: string | null;
  errorCode?: string | number;
  onRetry?: () => void;
}

export const AnalyticsErrorView: FC<AnalyticsErrorViewProps> = ({
  error,
  errorCode = "404",
  onRetry,
}) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#06080d] text-white overflow-hidden px-4 select-none">
      {/* Decorative Wavy Dotted Background SVG (matching the custom curved dots aesthetic) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <svg
          className="w-full h-full opacity-60 min-w-[1000px] min-h-[700px]"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="waveGradCyan" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
              <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#14b8a6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="waveGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
            </linearGradient>
            
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#083344" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06080d" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Subtle Ambient Radial Glow in center */}
          <circle cx="720" cy="450" r="500" fill="url(#centerGlow)" />

          {/* Lower Sweeping Dotted Wave Band */}
          {[...Array(14)].map((_, i) => {
            const offset = i * 22;
            const opacity = Math.sin((i / 14) * Math.PI) * 0.9 + 0.1;
            return (
              <path
                key={`lower-wave-${i}`}
                d={`M -100 ${520 + offset} C 350 ${680 + offset * 0.7}, 820 ${780 + offset * 0.4}, 1600 ${320 + offset * 0.9}`}
                stroke="url(#waveGradCyan)"
                strokeWidth={i % 3 === 0 ? "2.5" : "1.8"}
                strokeDasharray="4 8"
                strokeOpacity={opacity}
              />
            );
          })}

          {/* Upper Sweeping Dotted Wave Band */}
          {[...Array(12)].map((_, i) => {
            const offset = i * 24;
            const opacity = Math.sin((i / 12) * Math.PI) * 0.75 + 0.15;
            return (
              <path
                key={`upper-wave-${i}`}
                d={`M -80 ${300 - offset * 0.8} C 420 ${200 - offset * 0.4}, 950 ${240 - offset * 0.2}, 1600 ${offset * 1.1}`}
                stroke="url(#waveGradBlue)"
                strokeWidth={i % 2 === 0 ? "2.2" : "1.6"}
                strokeDasharray="3 7"
                strokeOpacity={opacity}
              />
            );
          })}
        </svg>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-2xl w-full text-center flex flex-col items-center">
        {/* Error Code (e.g. 404) */}
        <h1 className="text-8xl sm:text-9xl font-bold tracking-tight text-white mb-6 drop-shadow-md">
          {errorCode}
        </h1>

        {/* Primary Message */}
        <p className="text-lg sm:text-xl md:text-2xl font-normal text-zinc-100 max-w-xl leading-relaxed mb-2">
          Don&apos;t worry &mdash; the analytics module is currently not working.
        </p>

        {/* Subtitle / Reassurance */}
        <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-lg leading-relaxed mb-9">
          It&apos;s just on our side, not yours. Our servers ran into a database problem.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-9 py-3.5 rounded-full bg-[#17a398] hover:bg-[#149288] text-white font-medium text-base shadow-[0_0_30px_rgba(23,163,152,0.35)] hover:shadow-[0_0_40px_rgba(23,163,152,0.55)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Home Page
          </Link>

          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:text-white font-medium text-sm transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>

        {/* Subtle Technical Detail / Diagnostics Pill (Expandable / Non-intrusive) */}
        {error && (
          <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800/80 text-[11.5px] text-zinc-500 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500/80 flex-shrink-0" />
            <span className="truncate max-w-md">System diagnosis: {error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
