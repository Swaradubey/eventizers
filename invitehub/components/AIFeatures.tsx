"use client";

import React from "react";
import { Gift, Wine } from "lucide-react";

const leftFeatures = [
  "Event Page",
  "Email Invite",
  "Reminder Schedule",
  "Registry Suggestions",
];

const rightFeatures = [
  "Invitation Copy",
  "SMS Invite",
  "RSVP Questions",
  "Venue Suggestions",
];

export default function AIFeatures() {
  return (
    <section
      id="features"
      className="py-16 md:py-24 bg-gradient-to-b from-[#FAF8F5] via-[#F4F7FC]/70 to-[#FAF8F5] relative overflow-hidden"
    >
      {/* Subtle geometric cross grid background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="ai-features-cross-grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M16 12.5v7M12.5 16h7"
                stroke="#94A3B8"
                strokeWidth="0.85"
                strokeLinecap="round"
                strokeOpacity="0.45"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ai-features-cross-grid)" />
        </svg>
      </div>

      {/* Ambient background pastel glow */}
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Outer Wrapper: Solid pure white background, generous rounded corners, subtle soft border, ambient padding */}
        <div className="bg-white rounded-3xl border border-slate-100/90 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] p-8 sm:p-12 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Text & Features (Width: ~7 Cols / 55-60%) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Top Badge Pill */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EDE9FE] text-[#6D28D9] text-xs font-semibold tracking-wide mb-5 w-fit">
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
                  <path d="m14 7 3 3" />
                  <path d="M5 6v4" />
                  <path d="M19 14v4" />
                  <path d="M10 2v2" />
                  <path d="M7 8H3" />
                  <path d="M21 16h-4" />
                  <path d="M11 3H9" />
                </svg>
                <span>AI Event Creation</span>
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#0F172A] tracking-tight leading-[1.2] mb-4">
                Everything generated in seconds
              </h2>

              {/* Description Paragraph */}
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
                Describe your event once. Our AI instantly produces a complete,
                ready-to-send event — copy, design, schedule, and questions
                included.
              </p>

              {/* Feature Checkmarks Grid: 2-column layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
                {/* Left Column Items */}
                <div className="space-y-3.5">
                  {leftFeatures.map((feature) => (
                    <div
                      key={feature}
                      className="text-sm sm:text-base font-medium text-slate-700 flex items-center gap-2.5"
                    >
                      <svg
                        className="w-5 h-5 text-emerald-500 shrink-0"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="10"
                          cy="10"
                          r="8.25"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M6.75 10.25L8.75 12.25L13.25 7.75"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Right Column Items */}
                <div className="space-y-3.5">
                  {rightFeatures.map((feature) => (
                    <div
                      key={feature}
                      className="text-sm sm:text-base font-medium text-slate-700 flex items-center gap-2.5"
                    >
                      <svg
                        className="w-5 h-5 text-emerald-500 shrink-0"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="10"
                          cy="10"
                          r="8.25"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M6.75 10.25L8.75 12.25L13.25 7.75"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Card Preview Showcase (Width: ~5 Cols / 40-45%) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {/* Background Container */}
              <div className="rounded-3xl bg-gradient-to-br from-[#E8F2FE] via-[#EDF3FF] to-[#E5EFFE] p-6 sm:p-8 min-h-[380px] w-full flex flex-col justify-between items-center relative overflow-hidden border border-blue-100/40">
                {/* Overlapping Preview Cards Container */}
                <div className="relative w-full flex items-center justify-center py-6">
                  <div className="relative flex items-center justify-center">
                    {/* Left Card: Bright Futures Gala (Underneath) */}
                    <div className="w-[180px] h-[240px] rounded-2xl p-4 text-white flex flex-col justify-between select-none relative overflow-hidden bg-gradient-to-b from-[#6366F1] via-[#4F46E5] to-[#2563EB] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.35)] transform -rotate-[7deg] translate-x-3 z-10 transition-transform duration-300 hover:scale-105 hover:z-30 cursor-pointer">
                      {/* Subtle white overlay wireframe rings */}
                      <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full border border-white/50" />
                        <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full border border-white/40" />
                        <div className="absolute top-3 right-3 w-20 h-20 rounded-full border border-white/30" />
                      </div>

                      {/* Top Pill */}
                      <div className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-bold tracking-wide uppercase relative z-10">
                        <span>CHARITY GALA</span>
                        <Gift className="w-3 h-3 text-white" />
                      </div>

                      {/* Center Content */}
                      <div className="my-auto relative z-10">
                        <p className="text-[11px] text-white/80 font-medium">
                          You&apos;re invited to
                        </p>
                        <h4 className="text-base font-bold leading-tight mt-0.5">
                          Bright Futures Gala
                        </h4>
                        <p className="text-[10px] text-white/75 mt-1.5 font-light">
                          Nov 15 · 8:00 PM · Grand Ballroom
                        </p>
                      </div>

                      {/* Bottom Host */}
                      <p className="text-[9px] text-white/60 font-medium relative z-10">
                        Bright Futures Foundation
                      </p>
                    </div>

                    {/* Right Card: Supper Club No. 7 (Overlapping On Top) */}
                    <div className="w-[180px] h-[240px] rounded-2xl p-4 text-white flex flex-col justify-between select-none relative overflow-hidden bg-gradient-to-b from-[#FF7A00] via-[#FF5E62] to-[#FF2A6D] shadow-[0_20px_40px_-10px_rgba(255,42,109,0.35)] transform rotate-[7deg] -translate-x-3 -translate-y-2 z-20 transition-transform duration-300 hover:scale-105 hover:z-30 cursor-pointer">
                      {/* Subtle decorative sparkle dots overlay */}
                      <div className="absolute inset-0 pointer-events-none opacity-30">
                        <div className="absolute top-12 right-6 w-1.5 h-1.5 rounded-full bg-white" />
                        <div className="absolute top-24 left-5 w-1 h-1 rounded-full bg-white" />
                        <div className="absolute bottom-14 right-8 w-2 h-2 rounded-full bg-white" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-white/10 rounded-full blur-lg" />
                      </div>

                      {/* Top Pill */}
                      <div className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-bold tracking-wide uppercase relative z-10">
                        <span>DINNER PARTY</span>
                        <Wine className="w-3 h-3 text-white" />
                      </div>

                      {/* Center Content */}
                      <div className="my-auto relative z-10">
                        <p className="text-[11px] text-white/80 font-medium">
                          You&apos;re invited to
                        </p>
                        <h4 className="text-base font-bold leading-tight mt-0.5">
                          Supper Club No. 7
                        </h4>
                        <p className="text-[10px] text-white/75 mt-1.5 font-light">
                          Fri, May 30 · 7:30 PM
                        </p>
                      </div>

                      {/* Bottom Host */}
                      <p className="text-[9px] text-white/60 font-medium relative z-10">
                        Hosted by Chef Amara
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Showcase Caption */}
                <div className="mt-6 flex items-center gap-1.5 text-xs text-slate-500 font-medium select-none z-10">
                  <svg
                    className="w-4 h-4 text-[#8B5CF6]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    <path d="M5 3v4" />
                    <path d="M19 17v4" />
                    <path d="M3 5h4" />
                    <path d="M17 19h4" />
                  </svg>
                  <span>AI designed these in seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
