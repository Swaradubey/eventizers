"use client";

import { Gift, Wine, Calendar, Users, MapPin } from "lucide-react";

const features = [
  "Event Page",
  "Invitation Copy",
  "Email Invite",
  "SMS Invite",
  "Reminder Schedule",
  "RSVP Questions",
  "Registry Suggestions",
  "Venue Suggestions",
];

export default function AIFeatures() {
  return (
    <section
      id="features"
      className="py-16 md:py-24 bg-gradient-to-b from-[#FAF8F5] via-[#F4F0FB]/50 to-[#FAF8F5] relative overflow-hidden"
    >
      {/* Ambient background pastel glow */}
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main white card container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.06)] p-6 sm:p-10 lg:p-14">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left Column: Typography & List Items */}
            <div className="flex flex-col justify-center">
              {/* Category Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3E8FF] border border-[#E9D5FF] text-[#7E22CE] text-xs font-semibold tracking-wide w-fit mb-5 shadow-sm">
                <span className="text-sm">🪄</span>
                <span>AI Event Creation</span>
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#0f172a] tracking-tight leading-[1.15] mb-5 font-sans">
                Everything generated in seconds
              </h2>

              {/* Description Text */}
              <p className="text-[#475569] text-base sm:text-lg mb-8 leading-relaxed">
                Describe your event once. Our AI instantly produces a complete,
                ready-to-send event — copy, design, schedule, and questions included.
              </p>

              {/* Feature Checklist (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-emerald-500 bg-emerald-50/70 flex items-center justify-center shrink-0 text-emerald-500">
                      <svg
                        className="w-3 h-3 stroke-emerald-600"
                        viewBox="0 0 12 12"
                        fill="none"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2.5 6.2L4.8 8.5L9.5 3.5" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Preview Cards Container */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-6 sm:p-8 border border-blue-100/60 shadow-inner flex flex-col items-center justify-center relative min-h-[440px] sm:min-h-[480px]">
              {/* Cards Wrapper */}
              <div className="relative w-full max-w-md h-[340px] sm:h-[360px] flex items-center justify-center">
                {/* Left Preview Card */}
                <div className="w-56 sm:w-64 absolute left-2 sm:left-4 top-2 sm:top-4 z-10 rotate-[-4deg] rounded-2xl bg-white shadow-[0_15px_35px_-5px_rgba(79,70,229,0.18)] border border-slate-200/80 overflow-hidden transition-transform duration-300 hover:rotate-0 hover:scale-105 hover:z-30">
                  {/* Card Gradient Header */}
                  <div className="h-28 sm:h-32 bg-gradient-to-br from-indigo-500 to-purple-600 p-3.5 relative flex flex-col justify-between overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                    {/* Pill Tag */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold tracking-wider uppercase w-fit">
                      <Gift className="w-3 h-3 text-white" />
                      <span>CHARITY GALA</span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 bg-white flex flex-col gap-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      You&apos;re invited to
                    </p>
                    <h3 className="font-sans text-base font-bold text-slate-900 leading-snug">
                      Bright Futures Gala
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">Nov 15 · 8:00 PM · Grand Ballroom</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 pt-2 border-t border-slate-100">
                      <MapPin className="w-3 h-3 text-purple-500 shrink-0" />
                      <span className="truncate font-medium text-slate-600">
                        Bright Futures Foundation
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Preview Card (Tilted / Layered) */}
                <div className="w-56 sm:w-64 absolute right-2 sm:right-4 top-10 sm:top-14 z-20 rotate-[5deg] rounded-2xl bg-white shadow-[0_20px_40px_-5px_rgba(249,115,22,0.22)] border border-slate-200/80 overflow-hidden transition-transform duration-300 hover:rotate-0 hover:scale-105 hover:z-30">
                  {/* Card Gradient Header */}
                  <div className="h-28 sm:h-32 bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 p-3.5 relative flex flex-col justify-between overflow-hidden">
                    <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/15 rounded-full blur-xl pointer-events-none" />
                    {/* Pill Tag */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/25 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold tracking-wider uppercase w-fit">
                      <Wine className="w-3 h-3 text-white" />
                      <span>DINNER PARTY</span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 bg-white flex flex-col gap-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      You&apos;re invited to
                    </p>
                    <h3 className="font-sans text-base font-bold text-slate-900 leading-snug">
                      Supper Club No. 7
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                      <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span className="truncate">Fri, May 30 · 7:30 PM</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 pt-2 border-t border-slate-100">
                      <Users className="w-3 h-3 text-pink-500 shrink-0" />
                      <span className="truncate font-medium text-slate-600">
                        Hosted by Chef Amara
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Caption */}
              <p className="text-center text-xs font-medium text-slate-500/90 mt-4 select-none">
                ✨ AI designed these in seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
