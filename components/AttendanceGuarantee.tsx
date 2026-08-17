"use client";

import React from "react";
import { Users, Briefcase, Heart, Building2 } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "RSVP Deadline",
    description: "Guests confirm before the cutoff date.",
  },
  {
    step: 2,
    title: "Attendance Confirmation",
    description: "GPS check-in verifies who actually arrives.",
  },
  {
    step: 3,
    title: "Host Review Window",
    description: "Review no-shows for up to 7 days after.",
  },
  {
    step: 4,
    title: "Charge or Waive",
    description: "Decide how to handle each no-show fairly.",
  },
];

const eventTypes = [
  {
    title: "Consumers",
    description: "Birthdays, weddings, dinners, and personal celebrations.",
    icon: Users,
  },
  {
    title: "Businesses",
    description: "Conferences, launches, networking, and team events.",
    icon: Briefcase,
  },
  {
    title: "Nonprofits",
    description: "Fundraisers, galas, donation drives, and community events.",
    icon: Heart,
  },
  {
    title: "Enterprises",
    description: "Multi-team events with SSO, approvals, and analytics.",
    icon: Building2,
  },
];

export default function AttendanceGuarantee() {
  return (
    <section
      id="attendance-guarantee"
      className="relative pt-16 md:pt-20 pb-8 md:pb-10 bg-gradient-to-b from-[#FAF8F5] via-[#F4F7FC]/70 to-[#FAF8F5] overflow-hidden"
    >
      {/* Subtle geometric plus/cross grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="attendance-cross-grid"
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
          <rect width="100%" height="100%" fill="url(#attendance-cross-grid)" />
        </svg>
      </div>

      {/* Soft ambient pastel radial glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-purple-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-blue-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-cyan-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Elements (Centered) */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-full px-4 py-1 text-sm font-medium shadow-sm">
            <span>🛡️</span>
            <span>Attendance Guarantee</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 tracking-tight font-sans">
            Reduce no-shows with confidence
          </h2>

          {/* Subheading */}
          <p className="text-slate-600 mt-2 text-base md:text-lg leading-relaxed">
            A fair, transparent flow that respects guests while protecting your resources.
          </p>
        </div>

        {/* 4-Step Horizontal Timeline / Progress Flow */}
        <div className="relative max-w-5xl mx-auto mt-12">
          {/* Thin subtle cyan/blue line connecting the center of all circle icons on desktop */}
          <div className="absolute top-6 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-blue-300 via-cyan-300 to-indigo-300 hidden md:block z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {steps.map((item) => (
              <div
                key={item.step}
                className="group bg-white/80 hover:bg-white backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 hover:border-blue-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_-6px_rgba(37,99,235,0.08)] transition-all duration-300 flex flex-col items-center text-center"
              >
                {/* Number Badge: Solid circular blue gradient icon */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-semibold text-lg ring-4 ring-white shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
                  {item.step}
                </div>

                {/* Step Title */}
                <h3 className="font-semibold text-slate-900 mt-4 text-center text-base">
                  {item.title}
                </h3>

                {/* Step Description */}
                <p className="text-sm text-slate-500 text-center mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Built for every kind of event Section */}
        <div className="mt-16 md:mt-20 pt-4">
          {/* Section Header (Centered) */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center font-sans tracking-tight">
              Built for every kind of event
            </h2>
          </div>

          {/* 4-Column Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mt-10 px-4">
            {eventTypes.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.title}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col"
                >
                  {/* Clean purple/blue icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50/80 border border-purple-100/60 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform duration-300">
                    <IconComponent className="w-6 h-6 text-purple-600" />
                  </div>

                  {/* Title */}
                  <h3 className="text-slate-900 font-semibold text-lg mt-3">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

