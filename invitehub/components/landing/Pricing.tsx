"use client";

import React from "react";
import { Check, Sparkles } from "lucide-react";
import { useCreateSheet } from "./CreateSheetContext";

export default function Pricing() {
  const { open } = useCreateSheet();

  const plans = [
    {
      name: "Create",
      price: "Free",
      period: "forever",
      tagline: "Basic event + RSVP",
      highlighted: false,
      cta: "Start Free",
      features: [
        "Event web page & interactive RSVP",
        "Up to 50 guests included",
        "Standard static invitations",
        "Direct shareable link",
        "Calendar sync for guests",
      ],
    },
    {
      name: "Experience",
      price: "$19",
      period: "per event",
      tagline: "Cinematic motion & full tools",
      highlighted: true,
      cta: "Create an Experience",
      badge: "Most Popular",
      features: [
        "Everything in Free, plus:",
        "Cinematic AI video invitations",
        "Unlimited guest capacity",
        "WhatsApp & SMS broadcasting",
        "QR code ticketing & door check-in",
        "Autonomous AI Guest Manager",
      ],
    },
    {
      name: "Pro Host",
      price: "$49",
      period: "per month",
      tagline: "For planners & frequent hosts",
      highlighted: false,
      cta: "Get Pro Host",
      features: [
        "Everything in Experience, plus:",
        "Unlimited events every month",
        "Custom branding & white-label links",
        "Multi-host & VIP management",
        "Priority GPU video rendering",
        "Dedicated event concierge support",
      ],
    },
  ];

  return (
    <section id="pricing" className="relative scroll-mt-16 bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Pricing
        </p>
        <h2 className="font-display text-balance text-[2.6rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl mt-3">
          Start free.
          <span className="block text-primary">Upgrade the experience.</span>
        </h2>
        <p className="mt-4 max-w-xl text-base text-foreground/75 sm:text-lg">
          No subscriptions required to start. Create your first invitation free, and only upgrade if you want video motion or ticketing.
        </p>

        {/* 3 Tier Cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col justify-between rounded-[2.2rem] border p-8 shadow-xl transition-all ${
                p.highlighted
                  ? "border-primary bg-[#12181d] ring-2 ring-primary/30"
                  : "border-white/10 bg-[#12181d] hover:border-white/20"
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-primary-foreground shadow">
                  {p.badge}
                </span>
              )}

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] opacity-70">
                  {p.name}
                </p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-extrabold text-white leading-none">
                    {p.price}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">/{p.period}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground/80">{p.tagline}</p>

                <div className="my-6 h-px bg-white/10" />

                <ul className="flex flex-col gap-3 text-xs sm:text-sm">
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-foreground/85">
                      <Check className="mt-0.5 size-4 text-primary shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => open(p.highlighted ? "video" : "ai")}
                  className={`flex h-12 w-full items-center justify-center rounded-full font-bold text-sm transition active:scale-95 ${
                    p.highlighted
                      ? "bg-primary text-primary-foreground hover:brightness-110 shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
