"use client";

import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "We planned our entire product launch in under an hour. The AI handled invitations, reminders, and check-in flawlessly.",
    name: "Sarah Chen",
    role: "Head of Events, Northwind",
  },
  {
    quote:
      "The attendance guarantee changed everything. No-shows dropped by 60% and our catering waste is finally under control.",
    name: "Marcus Reid",
    role: "Founder, GatherWell",
  },
  {
    quote:
      "It feels like Stripe and Apple had a baby. Our donors love how effortless RSVPs and registries are.",
    name: "Priya Nair",
    role: "Director, Bright Futures Foundation",
  },
];

export default function UseCasesAndTestimonials() {
  return (
    <section
      id="testimonials"
      className="relative pt-10 md:pt-12 pb-20 md:pb-28 bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] overflow-hidden"
    >
      {/* Subtle geometric plus/cross grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.35]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="testimonials-cross-grid"
              width="44"
              height="44"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M22 17v10M17 22h10"
                stroke="#94A3B8"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#testimonials-cross-grid)"
          />
        </svg>
      </div>

      {/* Soft ambient pastel radial glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-cyan-100/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight font-sans mt-2 md:mt-3">
            Loved by hosts everywhere
          </h2>
        </div>

        {/* Testimonial Cards Layout & Styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8 md:mt-10 px-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-8 flex flex-col justify-between"
            >
              <div>
                {/* Star Ratings: Top row of 5 star icons with clean thin outline style */}
                <div className="flex items-center gap-1.5 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-slate-400 stroke-[1.5]"
                    />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-slate-600 font-normal leading-relaxed mb-8">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div>
                <p className="text-slate-900 font-semibold text-base">{t.name}</p>
                <p className="text-slate-500 text-sm mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
