"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Ticket,
  ScanLine,
  BarChart3,
  ArrowUpRight,
  TrendingUp,
  TriangleAlert,
  Check,
  Zap,
  Users,
  Eye,
  UserCheck,
  CalendarDays,
  MapPin,
  Sparkles,
} from "lucide-react";

const REVENUE_DATA = [
  { label: "Nov", value: 3200 },
  { label: "Dec", value: 6800 },
  { label: "Jan", value: 4400 },
  { label: "Feb", value: 8200 },
  { label: "Mar", value: 9800 },
  { label: "Apr", value: 7400 },
  { label: "May", value: 11600 },
  { label: "Jun", value: 14900 },
  { label: "Jul", value: 12200 },
  { label: "Aug", value: 16400 },
  { label: "Sep", value: 19800 },
  { label: "Oct", value: 24500 },
];

export default function IndividualOverview() {
  const { user } = useAuth();
  const [activeChartIndex, setActiveChartIndex] = useState<number | null>(null);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const displayName = user?.name || user?.email?.split("@")[0] || "Host";

  // Formatted date string
  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  // Chart coordinate calculations
  const maxVal = 1.12 * Math.max(...REVENUE_DATA.map((d) => d.value));
  const getX = (index: number) => 8 + (index / (REVENUE_DATA.length - 1)) * 584;
  const getY = (val: number) => 14 + (1 - val / maxVal) * 160;

  const chartCurvePath = REVENUE_DATA.map((item, idx) => {
    if (idx === 0) return `M ${getX(0)} ${getY(item.value)}`;
    const midX = (getX(idx - 1) + getX(idx)) / 2;
    return `C ${midX} ${getY(REVENUE_DATA[idx - 1].value)}, ${midX} ${getY(item.value)}, ${getX(idx)} ${getY(item.value)}`;
  }).join(" ");

  const chartAreaPath = `${chartCurvePath} L ${getX(REVENUE_DATA.length - 1)} 174 L ${getX(0)} 174 Z`;
  const currIndex = activeChartIndex ?? REVENUE_DATA.length - 1;
  const currentChartItem = REVENUE_DATA[currIndex];

  return (
    <div className="flex flex-col gap-10">
      {/* Header / Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {todayStr}
          </p>
          <h1
            className="mt-1.5 text-balance font-display text-3xl font-extrabold leading-[1.02] tracking-tight sm:text-4xl text-foreground"
            style={{ fontFamily: "'Red Rose', Georgia, serif" }}
          >
            {greeting}, {displayName}
          </h1>
          <p className="mt-2 max-w-xl text-pretty text-[15px] leading-relaxed text-foreground/65">
            Your events are active and guest RSVPs are coming in. Here is everything at a glance.
          </p>
        </div>
        <Link
          href="/create-event"
          className="flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-bold text-primary-foreground transition active:scale-95 hover:brightness-110 cursor-pointer"
        >
          <Plus className="size-[18px]" aria-hidden="true" /> New event
        </Link>
      </div>

      {/* Quick Access 3 Cards */}
      <section aria-label="Quick operations" className="grid gap-3 md:grid-cols-3">
        {/* Ticketing */}
        <Link
          href="/dashboard/ticketing"
          className="group flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/40 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Ticket className="size-5" aria-hidden="true" />
            </span>
            <ArrowUpRight
              className="size-5 text-foreground/40 transition group-hover:text-primary"
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Ticketing
            </span>
            <span
              className="font-display text-2xl font-extrabold"
              style={{ fontFamily: "'Red Rose', Georgia, serif" }}
            >
              142 claimed
            </span>
            <span className="text-xs text-foreground/55">78% of capacity claimed</span>
          </div>
        </Link>

        {/* Check-in */}
        <Link
          href="/dashboard/check-in"
          className="group flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/40 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <ScanLine className="size-5" aria-hidden="true" />
            </span>
            <ArrowUpRight
              className="size-5 text-foreground/40 transition group-hover:text-primary"
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Check-in
            </span>
            <span
              className="font-display text-2xl font-extrabold"
              style={{ fontFamily: "'Red Rose', Georgia, serif" }}
            >
              Scanner ready
            </span>
            <span className="text-xs text-foreground/55">Fast QR scan active</span>
          </div>
        </Link>

        {/* Analytics */}
        <Link
          href="/dashboard/analytics"
          className="group flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/40 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <BarChart3 className="size-5" aria-hidden="true" />
            </span>
            <ArrowUpRight
              className="size-5 text-foreground/40 transition group-hover:text-primary"
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Analytics
            </span>
            <span
              className="font-display text-2xl font-extrabold"
              style={{ fontFamily: "'Red Rose', Georgia, serif" }}
            >
              +34% visits
            </span>
            <span className="text-xs text-foreground/55">2,840 total impressions</span>
          </div>
        </Link>
      </section>

      {/* Primary Focus Event Card */}
      <section aria-label="Next event" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2
            className="font-display text-2xl font-extrabold"
            style={{ fontFamily: "'Red Rose', Georgia, serif" }}
          >
            Next event
          </h2>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
            In 9 days
          </span>
        </div>

        <article className="overflow-hidden rounded-3xl border border-white/10 bg-card">
          <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[1.4fr_1fr]">
            <div className="flex flex-col justify-between gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
                  <span className="flex items-center gap-1 font-semibold text-primary">
                    <CalendarDays className="size-3.5" aria-hidden="true" /> Saturday, Oct 31 · 8:00 PM
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden="true" /> The Grand Ballroom & Terrace
                  </span>
                </div>
                <h3
                  className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground"
                  style={{ fontFamily: "'Red Rose', Georgia, serif" }}
                >
                  Golden Autumn Gala
                </h3>
                <p className="text-[15px] leading-relaxed text-foreground/70">
                  An unforgettable evening of live music, culinary pairings, and celebration.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Capacity progress</span>
                  <span className="text-primary">142 of 180 confirmed (78%)</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: "78%" }} />
                </div>
              </div>

              {/* 3 Metric Pills */}
              <dl className="grid grid-cols-3 gap-2 rounded-2xl bg-white/[0.04] p-3 text-center border border-white/5">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-foreground/50">RSVPs</dt>
                  <dd
                    className="mt-1 font-display text-xl font-extrabold text-foreground"
                    style={{ fontFamily: "'Red Rose', Georgia, serif" }}
                  >
                    142
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-foreground/50">Pending</dt>
                  <dd
                    className="mt-1 font-display text-xl font-extrabold text-foreground"
                    style={{ fontFamily: "'Red Rose', Georgia, serif" }}
                  >
                    26
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-foreground/50">Check-in</dt>
                  <dd
                    className="mt-1 font-display text-xl font-extrabold text-primary"
                    style={{ fontFamily: "'Red Rose', Georgia, serif" }}
                  >
                    100%
                  </dd>
                </div>
              </dl>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href="/dashboard/events"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition active:scale-95 hover:brightness-110 cursor-pointer"
                >
                  Manage event
                </Link>
                <Link
                  href="/dashboard/ticketing"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold transition hover:bg-white/10 cursor-pointer"
                >
                  View guest list
                </Link>
              </div>
            </div>

            {/* Event Preview Visual */}
            <div className="relative min-h-[220px] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-black to-accent/20 border border-white/10 p-5 flex flex-col justify-end">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(254,186,8,0.15),transparent_70%)]" />
              <div className="relative z-10">
                <span className="rounded-md bg-black/60 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                  Live invitation
                </span>
                <p
                  className="mt-2 font-display text-2xl font-extrabold text-white leading-tight"
                  style={{ fontFamily: "'Red Rose', Georgia, serif" }}
                >
                  Golden Autumn Gala
                </p>
                <p className="text-xs text-white/70 mt-1">Video invite & QR tickets active</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* Overall KPIs & Milestones */}
      <section aria-label="Key metrics" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-card p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Confirmed Guests
            </span>
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-4" />
            </span>
          </div>
          <p
            className="font-display text-3xl font-extrabold text-foreground"
            style={{ fontFamily: "'Red Rose', Georgia, serif" }}
          >
            1,248
          </p>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="size-3" /> +18% from last month
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-card p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Page Impressions
            </span>
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Eye className="size-4" />
            </span>
          </div>
          <p
            className="font-display text-3xl font-extrabold text-foreground"
            style={{ fontFamily: "'Red Rose', Georgia, serif" }}
          >
            8,940
          </p>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="size-3" /> +24% click rate
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-card p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              RSVP Conversion
            </span>
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <UserCheck className="size-4" />
            </span>
          </div>
          <p
            className="font-display text-3xl font-extrabold text-foreground"
            style={{ fontFamily: "'Red Rose', Georgia, serif" }}
          >
            78.4%
          </p>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <Check className="size-3" /> Excellent pacing
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-card p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Total Revenue
            </span>
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Zap className="size-4" />
            </span>
          </div>
          <p
            className="font-display text-3xl font-extrabold text-primary"
            style={{ fontFamily: "'Red Rose', Georgia, serif" }}
          >
            $24,500
          </p>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="size-3" /> 12 ticket tiers active
          </p>
        </div>
      </section>

      {/* Ticket Revenue Interactive Chart */}
      <section aria-label="Ticket revenue" className="rounded-3xl border border-white/10 bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
          <div>
            <h2
              className="font-display text-2xl font-extrabold text-foreground"
              style={{ fontFamily: "'Red Rose', Georgia, serif" }}
            >
              Ticket revenue
            </h2>
            <p className="text-xs text-foreground/55 mt-1">Growth overview over the past 12 months</p>
          </div>
          <div className="text-right">
            <p
              className="font-display text-3xl font-extrabold text-primary"
              style={{ fontFamily: "'Red Rose', Georgia, serif" }}
            >
              ${currentChartItem.value.toLocaleString()}
            </p>
            <p className="text-xs text-foreground/55">{currentChartItem.label} total</p>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full overflow-hidden">
          <svg viewBox="0 0 600 180" className="w-full h-44 overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area */}
            <path d={chartAreaPath} fill="url(#chartGradient)" />
            {/* Curve */}
            <path d={chartCurvePath} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
            {/* Points */}
            {REVENUE_DATA.map((item, idx) => (
              <circle
                key={item.label}
                cx={getX(idx)}
                cy={getY(item.value)}
                r={idx === currIndex ? 6 : 3}
                fill={idx === currIndex ? "var(--primary)" : "#ffffff"}
                stroke="var(--background)"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setActiveChartIndex(idx)}
              />
            ))}
          </svg>
        </div>

        {/* Month Labels */}
        <div className="flex justify-between mt-3 text-xs text-foreground/45">
          {REVENUE_DATA.map((d, idx) => (
            <span
              key={d.label}
              className={`cursor-pointer transition ${idx === currIndex ? "text-primary font-bold" : "hover:text-foreground"}`}
              onMouseEnter={() => setActiveChartIndex(idx)}
            >
              {d.label}
            </span>
          ))}
        </div>
      </section>

      {/* Recent & Upcoming Events List */}
      <section aria-label="All events" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2
            className="font-display text-2xl font-extrabold text-foreground"
            style={{ fontFamily: "'Red Rose', Georgia, serif" }}
          >
            Your Events
          </h2>
          <Link
            href="/dashboard/events"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View all events <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid gap-3">
          {[
            {
              id: "ev1",
              title: "Golden Autumn Gala",
              date: "Oct 31, 2026 · 8:00 PM",
              location: "The Grand Ballroom",
              guests: "142 / 180",
              status: "Active",
              pct: 78,
            },
            {
              id: "ev2",
              title: "Private Sunset Celebration",
              date: "Nov 14, 2026 · 6:30 PM",
              location: "Skyline Lounge & Terrace",
              guests: "84 / 100",
              status: "Active",
              pct: 84,
            },
            {
              id: "ev3",
              title: "End of Year Milestone Dinner",
              date: "Dec 18, 2026 · 7:00 PM",
              location: "The Glasshouse Pavilion",
              guests: "56 / 80",
              status: "Draft",
              pct: 70,
            },
          ].map((ev) => (
            <article
              key={ev.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-card p-4 transition hover:border-primary/40"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary font-bold">
                  <CalendarDays className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3
                    className="font-display text-lg font-extrabold truncate text-foreground"
                    style={{ fontFamily: "'Red Rose', Georgia, serif" }}
                  >
                    {ev.title}
                  </h3>
                  <p className="text-xs text-foreground/55 truncate">
                    {ev.date} · {ev.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs font-bold text-foreground">{ev.guests} RSVPs</span>
                  <div className="w-24 h-1.5 rounded-full bg-white/10 mt-1 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${ev.pct}%` }} />
                  </div>
                </div>

                <Link
                  href="/dashboard/events"
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:bg-white/10 transition"
                >
                  Manage
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
