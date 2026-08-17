"use client";

import { Wand2, Mail, BarChart3 } from "lucide-react";

const steps = [
  {
    id: "create",
    title: "Create",
    description:
      "Describe your event and let AI build the page, invitation, RSVP questions, and reminder schedule in seconds.",
    icon: Wand2,
    gradient: "from-blue-600 to-indigo-600",
    shadow: "shadow-indigo-500/20",
  },
  {
    id: "invite",
    title: "Invite",
    description:
      "Send beautiful invitations over email, SMS, and WhatsApp with personalized greetings and one-click RSVP.",
    icon: Mail,
    gradient: "from-sky-400 to-blue-500",
    shadow: "shadow-sky-500/20",
  },
  {
    id: "manage",
    title: "Manage",
    description:
      "Track RSVPs, check guests in with QR codes, manage registries, and monitor everything from one dashboard.",
    icon: BarChart3,
    gradient: "from-emerald-400 to-teal-600",
    shadow: "shadow-emerald-500/20",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-20 md:py-28 bg-gradient-to-b from-[#FAF8F5] via-[#F4F7FC]/70 to-[#FAF8F5] overflow-hidden"
    >
      {/* Faint geometric plus/cross grid pattern matching the application */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="how-it-works-cross-grid"
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
          <rect width="100%" height="100%" fill="url(#how-it-works-cross-grid)" />
        </svg>
      </div>

      {/* Subtle soft pastel ambient glows */}
      <div className="absolute top-12 left-1/4 -translate-x-1/2 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-8 right-1/4 translate-x-1/2 w-96 h-96 bg-purple-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[280px] bg-indigo-100/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header & Typography */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0f172a] tracking-tight font-sans mb-4">
            How Eventizers Works
          </h2>
          <p className="text-[#475569] text-base sm:text-lg leading-relaxed">
            Create, Invite, Manage — three effortless steps to a perfect event.
          </p>
        </div>

        {/* 3-Column Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="bg-white rounded-3xl border border-slate-100 p-8 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col items-center group"
              >
                {/* Rounded Square Badge */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-md ${step.shadow} group-hover:scale-105 transition-transform duration-300`}
                >
                  <Icon className="w-7 h-7 text-white" strokeWidth={2.2} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[#0f172a] mb-3 font-sans">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-[#475569] text-sm sm:text-base leading-relaxed font-sans">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
