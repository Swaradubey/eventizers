"use client";

import { CheckCircle2 } from "lucide-react";
import InvitationCard from "./InvitationCard";
import { templateCards } from "../lib/templateData";

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

const leftCardData = templateCards.find((c) => c.title === "Bright Futures Gala") || {
  type: "Charity Gala",
  title: "Bright Futures Gala",
  date: "Nov 15",
  time: "8:00 PM",
  host: "Bright Futures Foundation",
  venue: "Grand Ballroom",
  gradient: "linear-gradient(135deg, #c9a84c 0%, #a07820 100%)",
  accentColor: "#a07820",
  emoji: "✨",
  image: "/assets/templates/gala.jpg",
};

const rightCardData = templateCards.find((c) => c.title === "Supper Club No. 7") || {
  type: "Dinner Party",
  title: "Supper Club No. 7",
  date: "Fri, May 30",
  time: "7:30 PM",
  host: "Hosted by Chef Amara",
  gradient: "linear-gradient(135deg, #d4c8a0 0%, #c0b080 100%)",
  accentColor: "#907030",
  emoji: "🍽️",
  image: "/assets/templates/dinner.jpg",
};

const floatingCards = [leftCardData, rightCardData];

export default function AIFeatures() {
  return (
    <section className="py-16 md:py-24 bg-[#2D1B3D] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: text */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-4">
              AI Event Creation
            </p>
            <h2
              className="font-display text-3xl md:text-3xl font-bold text-[#FAF8F5] mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Everything generated
              <br />
              <span className="italic text-[#E8C4B8]">in seconds</span>
            </h2>
            <p className="text-[#FAF8F5]/60 text-lg mb-8 leading-relaxed">
              Describe your event once. Our AI instantly produces a complete, ready-to-send event — copy, design, schedule, and questions included.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7A9E7E] shrink-0" />
                  <span className="text-sm text-[#FAF8F5]/70">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating preview cards */}
          <div className="relative flex flex-col sm:flex-row lg:block items-center justify-center min-h-[420px] sm:min-h-[440px] md:min-h-[400px] lg:min-h-[440px] pt-4 sm:pt-0">
            {floatingCards.map((card, i) => (
              <div
                key={card.title}
                className={`w-60 sm:w-64 md:w-56 lg:w-64 relative sm:absolute transition-all duration-300 ${
                  i === 0
                    ? "rotate-[-3deg] sm:rotate-[-4deg] sm:left-2 md:left-2 lg:left-4 top-0 sm:top-2 md:top-2 lg:top-4 z-[2] mb-6 sm:mb-0"
                    : "rotate-[3deg] sm:rotate-[5deg] sm:right-2 md:right-2 lg:right-4 top-0 sm:top-14 md:top-16 lg:top-20 z-[1]"
                }`}
              >
                <InvitationCard {...card} variant="floating-preview" />
              </div>
            ))}
            <p className="absolute -bottom-2 sm:bottom-0 text-center text-xs text-[#FAF8F5]/40 w-full select-none pointer-events-none">
              AI designed these in seconds
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
