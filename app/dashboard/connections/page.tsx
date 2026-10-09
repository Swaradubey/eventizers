"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Link2,
  Check,
  CircleAlert,
  Unplug,
  Lock,
  MessageCircle,
  Calendar,
  Instagram,
  Mail,
} from "lucide-react";

export default function IndividualConnectionsPage() {
  const [connections, setConnections] = useState([
    {
      id: "whatsapp",
      name: "WhatsApp Messaging",
      account: "Connected · +1 (555) 382-9104",
      type: "Instant RSVP & updates",
      connected: true,
      icon: MessageCircle,
      color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
    },
    {
      id: "calendar",
      name: "Google Calendar",
      account: "Connected · alex@eventizers.com",
      type: "Automatic guest invite sync",
      connected: true,
      icon: Calendar,
      color: "text-blue-400 bg-blue-500/15 border-blue-500/30",
    },
    {
      id: "instagram",
      name: "Instagram Story & DM",
      account: "Connected · @eventizersevents",
      type: "Visual invite stickers & shares",
      connected: true,
      icon: Instagram,
      color: "text-pink-400 bg-pink-500/15 border-pink-500/30",
    },
    {
      id: "email",
      name: "Email Delivery",
      account: "Connected · verified sender domain",
      type: "High-deliverability RSVP emails",
      connected: true,
      icon: Mail,
      color: "text-amber-400 bg-amber-500/15 border-amber-500/30",
    },
  ]);

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Connections
          </p>
          <h1
            className="mt-1.5 text-balance font-display text-3xl font-extrabold leading-[1.02] tracking-tight sm:text-4xl text-foreground"
            style={{ fontFamily: "'Red Rose', Georgia, serif" }}
          >
            Link your accounts & channels
          </h1>
          <p className="mt-2 max-w-xl text-pretty text-[15px] leading-relaxed text-foreground/65">
            Connect your communication channels once. Eventizers delivers invitations, tracks replies, and syncs calendar schedules seamlessly.
          </p>
        </div>
      </div>

      <p className="text-sm text-foreground/60">
        4 of 4 essential channels active
      </p>

      {/* Connection Cards */}
      <ul className="grid gap-3 md:grid-cols-2">
        {connections.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.id}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-card p-5"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`grid shrink-0 place-items-center rounded-2xl size-12 border ${item.color}`}
                >
                  <Icon className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="font-display text-xl font-extrabold leading-tight text-foreground"
                    style={{ fontFamily: "'Red Rose', Georgia, serif" }}
                  >
                    {item.name}
                  </p>
                  <p className="truncate text-sm text-foreground/60 mt-0.5">
                    {item.account}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold bg-emerald-500/15 text-emerald-400">
                  <Check className="size-3.5" /> Connected
                </span>
                <span className="text-xs text-foreground/45">{item.type}</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="h-11 flex-1 rounded-full text-sm font-bold transition active:scale-95 bg-white/10 hover:bg-white/15 text-foreground cursor-pointer"
                >
                  Configure
                </button>
                <button
                  type="button"
                  aria-label={`Manage ${item.name}`}
                  className="grid size-11 place-items-center rounded-full bg-white/8 text-foreground/70 hover:bg-white/15 transition active:scale-95 cursor-pointer"
                >
                  <Unplug className="size-[18px]" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Privacy & Security Card */}
      <section className="rounded-3xl border border-white/10 bg-card p-5 sm:p-6 flex gap-4">
        <Lock className="mt-1 size-5 shrink-0 text-primary" />
        <div>
          <h2
            className="font-display text-lg font-extrabold text-foreground"
            style={{ fontFamily: "'Red Rose', Georgia, serif" }}
          >
            Your credentials stay encrypted and private
          </h2>
          <p className="mt-1 text-[15px] leading-relaxed text-foreground/70">
            You sign in securely via official OAuth APIs. Eventizers only receives permission to dispatch invitations and sync event dates with your approval.
          </p>
        </div>
      </section>

      {/* Status Legend */}
      <section aria-label="Connection states">
        <h2
          className="mb-1 font-display text-2xl font-extrabold text-foreground"
          style={{ fontFamily: "'Red Rose', Georgia, serif" }}
        >
          Connection Status Guide
        </h2>
        <p className="mb-4 text-sm text-foreground/60">
          If any connection requires a token refresh, you will see it here and in your top notifications.
        </p>

        <ul className="grid gap-2.5 md:grid-cols-2">
          <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-card p-4">
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
            <div>
              <p className="font-semibold text-foreground">Connected & Active</p>
              <p className="text-sm text-foreground/60">Real-time RSVP dispatch and notification sync are live.</p>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-card p-4">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-foreground">Refresh Required</p>
              <p className="text-sm text-foreground/60">Session expired after 60 days. One click re-authenticates.</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
