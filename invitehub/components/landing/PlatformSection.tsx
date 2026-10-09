"use client";

import React from "react";
import { Users, QrCode, MessageSquare, BarChart3, ShieldCheck, Ticket } from "lucide-react";
import { IMG } from "./data";

export default function PlatformSection() {
  const features = [
    {
      icon: Users,
      title: "Real-Time RSVP",
      blurb: "Track yes, maybe, and plus-ones instantly. Dietary questions and custom meal choices included.",
    },
    {
      icon: Ticket,
      title: "Ticketing & Payments",
      blurb: "Sell paid tickets or collect free registrations. Secure Stripe checkout with zero hidden fees.",
    },
    {
      icon: QrCode,
      title: "Instant QR Check-In",
      blurb: "Staff or hosts can scan guests in 0.5s from their phone camera. No special hardware required.",
    },
    {
      icon: MessageSquare,
      title: "Broadcast Messaging",
      blurb: "Send announcements, parking instructions, or last-minute updates via WhatsApp, SMS, or email.",
    },
    {
      icon: BarChart3,
      title: "Host Analytics",
      blurb: "See who opened the invite, who forwarded it, and live attendance metrics in real-time.",
    },
    {
      icon: ShieldCheck,
      title: "Privacy Controls",
      blurb: "Private links, guest list approval, password gating, and anti-leak protections.",
    },
  ];

  return (
    <section id="platform" className="relative overflow-hidden bg-[#0a0f14] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          The invitation becomes the event
        </p>
        <h2 className="font-display text-balance text-[2.6rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl mt-3">
          Beautiful on the outside.
          <span className="block text-primary">Powerful underneath.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-foreground/75 sm:text-lg">
          Not just pretty invitations — an entire operating system to run your guest list,
          RSVPs, tickets, and door check-in.
        </p>
      </div>

      {/* Bento feature cards */}
      <div className="mx-auto mt-16 grid max-w-6xl gap-5 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="group relative flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#12181d] p-6 shadow-xl transition hover:border-white/20 hover:bg-[#151c22]"
            >
              <div>
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-white">
                  {feat.title}
                </h3>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                  {feat.blurb}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
