"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateSheet } from "./CreateSheetContext";
import { Eyebrow, MaskHeading, Reveal, Cta } from "./motion";

const TIERS = [
  {
    name: "Create",
    price: "Free",
    tagline: "Basic event + RSVP",
    featured: false,
    points: [
      "Event page and RSVP",
      "Guest list and plus-ones",
      "Share by link",
    ],
  },
  {
    name: "Experience",
    price: "From $—",
    tagline: "Premium designs + AI creation",
    featured: true,
    points: [
      "AI-created events and invites",
      "Viral AI invitations",
      "WhatsApp, SMS and email",
    ],
  },
  {
    name: "Cinematic",
    price: "Premium",
    tagline: "AI photo/video invitation experiences",
    featured: false,
    points: [
      "Photo-to-video invitations",
      "Multi-photo sequences",
      "Signature treatments",
    ],
  },
];

const VIDEO_TIERS = [
  {
    label: "Basic animated invite",
    badge: "Included",
    cls: "bg-white/15 text-foreground backdrop-blur",
  },
  {
    label: "Memory animation",
    badge: "Premium Experience",
    cls: "bg-primary text-primary-foreground",
  },
  {
    label: "Multi-photo cinematic sequence",
    badge: "Signature",
    cls: "bg-black/60 text-primary ring-1 ring-primary backdrop-blur",
  },
];

export default function Pricing() {
  const { open } = useCreateSheet();

  return (
    <section id="pricing" className="relative scroll-mt-16 bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Eyebrow>Pricing</Eyebrow>
        <MaskHeading
          className="mt-3"
          lines={["Start free.", "Upgrade the experience."]}
        />

        <ul className="mt-10 grid gap-3 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <li key={tier.name}>
              <Reveal className="h-full">
                <div
                  className={cn(
                    "flex h-full flex-col rounded-[2rem] border p-6",
                    tier.featured
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-white/10 bg-card"
                  )}
                >
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] opacity-70">
                    {tier.name}
                  </p>
                  <p className="mt-3 font-display text-5xl font-extrabold leading-none">
                    {tier.price}
                  </p>
                  <p className="mt-2 text-[15px] font-medium opacity-80">
                    {tier.tagline}
                  </p>
                  <ul className="mt-6 flex flex-col gap-2.5 text-sm font-medium">
                    {tier.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className="mt-4">
          <div className="rounded-[2rem] border border-white/10 p-5 sm:p-6">
            <p className="text-sm font-semibold text-foreground/70">
              Video experiences are priced separately or included in premium plans.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-3">
              {VIDEO_TIERS.map((v) => (
                <li
                  key={v.label}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3"
                >
                  <span className="text-sm font-semibold">{v.label}</span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider",
                      v.cls
                    )}
                  >
                    {v.badge}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal className="mt-8">
          <Cta
            variant="primary"
            onClick={() => open("ai")}
            className="h-14 px-8 text-base"
          >
            See Pricing
          </Cta>
        </Reveal>
      </div>
    </section>
  );
}
