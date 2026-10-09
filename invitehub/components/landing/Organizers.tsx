"use client";

import React, { useState } from "react";
import { Users, Ticket, QrCode, MessageSquare, BarChart, CheckCircle2, ArrowRight } from "lucide-react";
import { useCreateSheet } from "./CreateSheetContext";

export default function Organizers() {
  const { open } = useCreateSheet();
  const [activeTab, setActiveTab] = useState<"guests" | "tickets" | "messages">("guests");

  return (
    <section id="organizers" className="relative scroll-mt-16 overflow-hidden bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          For organizers
        </p>
        <h2 className="font-display text-balance text-[2.6rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl mt-3">
          Create once.
          <span className="block text-primary">Run everything.</span>
        </h2>
        <p className="mt-4 max-w-lg text-base text-foreground/70 sm:text-lg">
          One unified command center for hosts, event planners, and promoters. Track RSVPs, sell
          tickets, broadcast updates, and check guests in at the door.
        </p>

        {/* Dashboard control center mockup */}
        <div className="mt-12 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#12181d] shadow-2xl">
          {/* Mockup header */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/10 p-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="size-3 rounded-full bg-red-500/80" />
              <span className="size-3 rounded-full bg-yellow-500/80" />
              <span className="size-3 rounded-full bg-green-500/80" />
              <span className="ml-2 font-mono text-xs text-white/60">
                eventizers.com/dashboard/event-741
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("guests")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  activeTab === "guests" ? "bg-primary text-primary-foreground" : "text-white/70 hover:bg-white/5"
                }`}
              >
                Guests &amp; RSVPs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tickets")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  activeTab === "tickets" ? "bg-primary text-primary-foreground" : "text-white/70 hover:bg-white/5"
                }`}
              >
                Ticketing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("messages")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  activeTab === "messages" ? "bg-primary text-primary-foreground" : "text-white/70 hover:bg-white/5"
                }`}
              >
                Broadcasts
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-4 border-b border-white/10 p-4 sm:grid-cols-4 sm:p-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Attending</p>
              <p className="font-display text-2xl font-bold text-white mt-1">118 / 130</p>
              <p className="text-[11px] text-primary">91% response rate</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Door Check-In</p>
              <p className="font-display text-2xl font-bold text-white mt-1">84 Scanned</p>
              <p className="text-[11px] text-green-400">Peak: 8:15 PM</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total Revenue</p>
              <p className="font-display text-2xl font-bold text-white mt-1">$3,450</p>
              <p className="text-[11px] text-white/60">Stripe Instant Payout</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Dietary Notes</p>
              <p className="font-display text-2xl font-bold text-white mt-1">14 Flagged</p>
              <p className="text-[11px] text-accent">Catering list synced</p>
            </div>
          </div>

          {/* Tab View */}
          <div className="p-4 sm:p-6">
            {activeTab === "guests" && (
              <div className="space-y-3">
                {[
                  { name: "Priya Nair", status: "Confirmed", plusOne: "+1", time: "2m ago" },
                  { name: "Marcus Thorne", status: "Confirmed", plusOne: "No", time: "14m ago" },
                  { name: "Sofia Alvarez", status: "VIP Host", plusOne: "+2", time: "1h ago" },
                  { name: "David Kim", status: "Confirmed", plusOne: "+1", time: "3h ago" },
                ].map((g, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-3 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-full bg-white/10 font-bold text-white">
                        {g.name[0]}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{g.name}</p>
                        <p className="text-[11px] text-muted-foreground">Plus-ones: {g.plusOne}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {g.status}
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">{g.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "tickets" && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm">VIP Early Access ($45)</span>
                    <span className="text-xs text-primary font-bold">50 / 50 Sold Out</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-primary w-full" />
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm">General Admission ($25)</span>
                    <span className="text-xs text-white/80 font-bold">68 / 80 Sold</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-primary w-[85%]" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "messages" && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex justify-between text-xs font-semibold text-primary mb-1">
                    <span>Broadcast Sent (WhatsApp + SMS)</span>
                    <span>118 Recipients</span>
                  </div>
                  <p className="text-xs text-white/80 font-mono">
                    &ldquo;Looking forward to seeing everyone tonight at 8 PM! Prince St entrance valet is active.&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action CTA */}
          <div className="flex items-center justify-between border-t border-white/10 bg-[#080d11]/80 p-4 sm:px-6">
            <span className="text-xs text-muted-foreground">
              Integrates with Stripe, Apple Wallet, Google Calendar, and WhatsApp.
            </span>
            <button
              type="button"
              onClick={() => open("ai")}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 transition"
            >
              <span>Launch Organizer Portal</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
