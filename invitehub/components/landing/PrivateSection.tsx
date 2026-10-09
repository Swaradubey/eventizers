"use client";

import React from "react";
import { Lock, Shield, KeyRound, UserCheck } from "lucide-react";

export default function PrivateSection() {
  const points = [
    { icon: KeyRound, text: "One-time verification codes (OTP)" },
    { icon: UserCheck, text: "Host-approved guest list only" },
    { icon: Lock, text: "Hide secret venue location until RSVP confirmed" },
    { icon: Shield, text: "Prevent unauthorized link forwards" },
  ];

  return (
    <section id="private" className="relative overflow-hidden bg-[#0c1117] py-20 lg:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        {/* Left text */}
        <div className="order-2 lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Private invitations
          </p>
          <h2 className="font-display text-balance text-[2.6rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl mt-3">
            Forward the invite.
            <span className="block text-primary">Not the access.</span>
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-foreground/70">
            Keep VIP celebrations, private dinners, and secret venues truly exclusive. Private
            invitations verify the guest before revealing the address or schedule.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {points.map((p, i) => {
              const Icon = p.icon;
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#12181d] px-4 py-3.5 text-sm font-medium text-white/90"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Icon className="size-4" />
                  </span>
                  <span>{p.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right card mockup */}
        <div className="order-1 lg:order-2 flex justify-center">
          <div className="relative w-full max-w-sm rounded-[2.5rem] border border-white/10 bg-[#12181d] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-accent">
                <Lock className="size-3.5" />
                VIP Access Protected
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/70">
                Encrypted Link
              </span>
            </div>

            <div className="my-8 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/15 text-primary mb-4">
                <Shield className="size-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white">Guest Verification</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Enter your phone number or email to unlock the private itinerary.
              </p>

              <div className="mt-6 flex flex-col gap-2">
                <input
                  type="text"
                  readOnly
                  value="priya.n@example.com"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-center text-sm font-mono text-white/80"
                />
                <button
                  type="button"
                  className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110 transition"
                >
                  Confirm &amp; View Invitation
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-3 text-center text-[11px] text-white/60">
              Address hidden until identity is confirmed by host.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
