"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Ticket,
  ScanLine,
  Megaphone,
  ArrowUpRight,
  TrendingUp,
  TriangleAlert,
  Check,
  Zap,
  DollarSign,
  Users,
  Eye,
  UserCheck,
  CalendarDays,
  MapPin,
  Sparkles,
} from "lucide-react";

const REVENUE_DATA = [
  { label: "Nov", value: 6200 },
  { label: "Dec", value: 9800 },
  { label: "Jan", value: 7400 },
  { label: "Feb", value: 11200 },
  { label: "Mar", value: 12800 },
  { label: "Apr", value: 10400 },
  { label: "May", value: 15600 },
  { label: "Jun", value: 18900 },
  { label: "Jul", value: 16200 },
  { label: "Aug", value: 21400 },
  { label: "Sep", value: 24800 },
  { label: "Oct", value: 30000 },
];

export default function ProOverview() {
  const [activeChartIndex, setActiveChartIndex] = useState<number | null>(null);

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
    <>
      <div className="flex flex-col gap-10">
            {/* Header / Greeting */}
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Thursday, October 22
                </p>
                <h1 className="mt-1.5 text-balance font-display text-3xl font-extrabold leading-[1.02] tracking-tight sm:text-4xl">
                  Good evening, Alex
                </h1>
                <p className="mt-2 max-w-xl text-pretty text-[15px] leading-relaxed text-foreground/65">
                  NYC Rooftop Halloween needs a push to hit 500. Here is everything else at a glance.
                </p>
              </div>
              <Link
                href="/create-event"
                className="flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-bold text-primary-foreground transition active:scale-95 hover:brightness-110"
              >
                <Plus className="size-[18px]" aria-hidden="true" /> New event
              </Link>
            </div>

            {/* Run your events 3 cards */}
            <section aria-label="Run your events" className="grid gap-3 md:grid-cols-3">
              {/* Ticketing */}
              <Link
                href="/pro/dashboard/tickets"
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
                  <span className="font-display text-2xl font-extrabold">1,679 sold</span>
                  <span className="text-sm leading-relaxed text-foreground/60 text-pretty">
                    $134,870 across tiers, promo codes and payouts
                  </span>
                </div>
              </Link>

              {/* Check-in */}
              <Link
                href="/pro/dashboard/check-in"
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
                  <span className="font-display text-2xl font-extrabold">4 of 12 in</span>
                  <span className="text-sm leading-relaxed text-foreground/60 text-pretty">
                    Scan tickets or search the guest list at the door
                  </span>
                </div>
              </Link>

              {/* Event campaigns */}
              <Link
                href="/pro/dashboard/events"
                className="group flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/40 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Megaphone className="size-5" aria-hidden="true" />
                  </span>
                  <ArrowUpRight
                    className="size-5 text-foreground/40 transition group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                    Event campaigns
                  </span>
                  <span className="font-display text-2xl font-extrabold">2 of 3 linked</span>
                  <span className="text-sm leading-relaxed text-foreground/60 text-pretty">
                    Campaigns now live inside each event. Create one with AI video or connect your ads
                  </span>
                </div>
              </Link>
            </section>

            {/* Event Health & AI Insights Grid */}
            <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
              {/* Event Health Card */}
              <section className="rounded-3xl border bg-card p-5 sm:p-6 border-primary/30">
                <div className="flex items-start gap-5">
                  <div className="relative size-36 shrink-0">
                    <svg
                      viewBox="0 0 120 120"
                      className="size-full -rotate-90"
                      role="img"
                      aria-label="327 of 500 guests confirmed"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        strokeWidth="10"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray="326.7256"
                        strokeDashoffset="114.354"
                        style={{ transition: "stroke-dashoffset 1.4s ease-out" }}
                      />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center text-center">
                      <div>
                        <p className="font-display text-3xl font-extrabold leading-none">
                          <span>327</span>
                        </p>
                        <p className="mt-1 text-xs text-foreground/55">of 500</p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/55">
                      Event health
                    </p>
                    <p className="mt-1.5 flex items-center gap-2 font-display text-2xl font-extrabold leading-tight text-primary">
                      <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />
                      Needs attention
                    </p>
                    <p className="mt-2 text-pretty text-sm leading-relaxed text-foreground/70">
                      Pacing about 18% below the line needed to reach capacity by October 31.
                    </p>
                  </div>
                </div>

                <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-white/6 px-2 py-3">
                    <dt className="text-xs text-foreground/55">Goal</dt>
                    <dd className="mt-0.5 font-display text-xl font-extrabold">500</dd>
                  </div>
                  <div className="rounded-2xl bg-white/6 px-2 py-3">
                    <dt className="text-xs text-foreground/55">Remaining</dt>
                    <dd className="mt-0.5 font-display text-xl font-extrabold">173</dd>
                  </div>
                  <div className="rounded-2xl bg-white/6 px-2 py-3">
                    <dt className="text-xs text-foreground/55">Days left</dt>
                    <dd className="mt-0.5 font-display text-xl font-extrabold">9</dd>
                  </div>
                </dl>

                <ul className="mt-5 flex flex-col gap-3">
                  <li className="flex items-start gap-3 text-[14px] leading-snug">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent/20 text-accent">
                      <TrendingUp className="size-3 rotate-90" aria-hidden="true" />
                    </span>
                    Ticket sales slowed 22% in the last 48 hours
                  </li>
                  <li className="flex items-start gap-3 text-[14px] leading-snug">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-positive/20 text-positive">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    Instagram still converts best, 61% of new RSVPs
                  </li>
                  <li className="flex items-start gap-3 text-[14px] leading-snug">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                      <TriangleAlert className="size-3" aria-hidden="true" />
                    </span>
                    No new content published in 3 days
                  </li>
                </ul>
              </section>

              {/* AI Insights column */}
              <section aria-label="AI insights" className="flex flex-col gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/55">
                  What AI noticed today
                </h2>

                <article className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 sm:p-5">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                    <Sparkles className="size-3.5" aria-hidden="true" />
                    AI insight
                  </p>
                  <p className="text-pretty text-[15px] font-medium leading-snug">
                    Instagram is currently producing 2.4x more RSVPs than TikTok.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      
                    }}
                    className="mt-auto inline-flex h-11 w-fit items-center gap-1.5 rounded-full bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/15 active:scale-95"
                  >
                    View analysis
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </button>
                </article>

                <article className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 sm:p-5">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                    <TrendingUp className="size-3.5" aria-hidden="true" />
                    Opportunity
                  </p>
                  <p className="text-pretty text-[15px] font-medium leading-snug">
                    Your strongest engagement occurs between 6 and 9 PM.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      
                    }}
                    className="mt-auto inline-flex h-11 w-fit items-center gap-1.5 rounded-full bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/15 active:scale-95"
                  >
                    Schedule
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </button>
                </article>

                <article className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 sm:p-5">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                    <Zap className="size-3.5" aria-hidden="true" />
                    Action needed
                  </p>
                  <p className="text-pretty text-[15px] font-medium leading-snug">
                    173 additional attendees are needed to reach capacity.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      
                    }}
                    className="mt-auto inline-flex h-11 w-fit items-center gap-1.5 rounded-full bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/15 active:scale-95"
                  >
                    Create post
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </button>
                </article>
              </section>
            </div>

            {/* This Year section */}
            <section aria-label="This year">
              <h2 className="mb-4 font-display text-2xl font-extrabold">This year</h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                {/* Events this year */}
                <div className="flex flex-col justify-between rounded-3xl border p-4 sm:p-5 border-white/10 bg-card">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-foreground/65">Events this year</p>
                    <CalendarDays className="size-4 shrink-0 text-foreground/40" aria-hidden="true" />
                  </div>
                  <p className="mt-3 font-display text-[2rem] font-extrabold leading-none tracking-tight sm:text-4xl">
                    <span>12</span>
                  </p>
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-positive/15 text-positive">
                      <TrendingUp className="size-3" aria-hidden="true" />
                      +3 vs last year
                    </span>
                  </div>
                </div>

                {/* Ticket revenue */}
                <div className="flex flex-col justify-between rounded-3xl border p-4 sm:p-5 border-primary/40 bg-primary/10">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-foreground/65">Ticket revenue</p>
                    <DollarSign className="size-4 shrink-0 text-foreground/40" aria-hidden="true" />
                  </div>
                  <p className="mt-3 font-display text-[2rem] font-extrabold leading-none tracking-tight sm:text-4xl">
                    <span>$184,620</span>
                  </p>
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-positive/15 text-positive">
                      <TrendingUp className="size-3" aria-hidden="true" />
                      +31%
                    </span>
                  </div>
                </div>

                {/* Total attendees */}
                <div className="flex flex-col justify-between rounded-3xl border p-4 sm:p-5 border-white/10 bg-card">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-foreground/65">Total attendees</p>
                    <Users className="size-4 shrink-0 text-foreground/40" aria-hidden="true" />
                  </div>
                  <p className="mt-3 font-display text-[2rem] font-extrabold leading-none tracking-tight sm:text-4xl">
                    <span>8,421</span>
                  </p>
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-positive/15 text-positive">
                      <TrendingUp className="size-3" aria-hidden="true" />
                      +18%
                    </span>
                  </div>
                </div>

                {/* Social reach */}
                <div className="flex flex-col justify-between rounded-3xl border p-4 sm:p-5 border-white/10 bg-card">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-foreground/65">Social reach</p>
                    <Eye className="size-4 shrink-0 text-foreground/40" aria-hidden="true" />
                  </div>
                  <p className="mt-3 font-display text-[2rem] font-extrabold leading-none tracking-tight sm:text-4xl">
                    <span>2.1M</span>
                  </p>
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-positive/15 text-positive">
                      <TrendingUp className="size-3" aria-hidden="true" />
                      +42%
                    </span>
                  </div>
                </div>

                {/* Unique guests */}
                <div className="flex flex-col justify-between rounded-3xl border p-4 sm:p-5 border-white/10 bg-card col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-foreground/65">Unique guests</p>
                    <UserCheck className="size-4 shrink-0 text-foreground/40" aria-hidden="true" />
                  </div>
                  <p className="mt-3 font-display text-[2rem] font-extrabold leading-none tracking-tight sm:text-4xl">
                    <span>18,230</span>
                  </p>
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-positive/15 text-positive">
                      <TrendingUp className="size-3" aria-hidden="true" />
                      +12%
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Active events */}
            <section aria-label="Active events">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                <div className="min-w-0">
                  <h2 className="mt-1.5 text-balance font-display text-3xl font-extrabold leading-[1.02] tracking-tight sm:text-4xl">
                    Active events
                  </h2>
                </div>
                <Link
                  href="/pro/dashboard/events"
                  className="flex h-11 items-center rounded-full bg-white/8 px-4 text-sm font-semibold hover:bg-white/12 transition"
                >
                  View all
                </Link>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Event 1: NYC Rooftop Halloween */}
                <Link
                  href="/pro/events/nyc-rooftop-halloween"
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-card transition hover:border-white/25"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src="/images/halloween-house.png"
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                      style={{ position: "absolute", height: "100%", width: "100%", inset: 0 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur bg-primary/20 text-primary">
                      Needs attention
                    </span>
                    <span className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-black/40 backdrop-blur transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <ArrowUpRight className="size-5" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <div>
                      <h3 className="font-display text-2xl font-extrabold leading-tight">
                        NYC Rooftop Halloween
                      </h3>
                      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/65">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="size-4" aria-hidden="true" /> October 31
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-4" aria-hidden="true" /> New York City
                        </span>
                      </p>
                      <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
                        <Megaphone className="size-3.5 text-primary" aria-hidden="true" />
                        <span>
                          Launch campaign <span className="font-normal text-foreground/55">· Live</span>
                        </span>
                      </p>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-baseline justify-between text-sm">
                        <span className="text-foreground/65">327 of 500 confirmed</span>
                        <span className="font-display font-extrabold">65%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-primary" style={{ width: "65%" }} />
                      </div>
                    </div>

                    <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-white/8 pt-4 text-center">
                      <div>
                        <dd className="font-display text-lg font-extrabold">284</dd>
                        <dt className="text-[11px] text-foreground/50">Tickets</dt>
                      </div>
                      <div>
                        <dd className="font-display text-lg font-extrabold">$18,540</dd>
                        <dt className="text-[11px] text-foreground/50">Revenue</dt>
                      </div>
                      <div>
                        <dd className="font-display text-lg font-extrabold">9</dd>
                        <dt className="text-[11px] text-foreground/50">Days left</dt>
                      </div>
                    </dl>
                  </div>
                </Link>

                {/* Event 2: Sunday Rooftop */}
                <Link
                  href="/pro/events/sunday-rooftop"
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-card transition hover:border-white/25"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src="/images/rooftop.webp"
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                      style={{ position: "absolute", height: "100%", width: "100%", inset: 0 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur bg-positive/20 text-positive">
                      On track
                    </span>
                    <span className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-black/40 backdrop-blur transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <ArrowUpRight className="size-5" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <div>
                      <h3 className="font-display text-2xl font-extrabold leading-tight">
                        Sunday Rooftop
                      </h3>
                      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/65">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="size-4" aria-hidden="true" /> November 8
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-4" aria-hidden="true" /> Brooklyn
                        </span>
                      </p>
                      <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
                        <Megaphone className="size-3.5 text-primary" aria-hidden="true" />
                        <span>
                          Sunset countdown{" "}
                          <span className="font-normal text-foreground/55">· Scheduled</span>
                        </span>
                      </p>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-baseline justify-between text-sm">
                        <span className="text-foreground/65">423 of 460 confirmed</span>
                        <span className="font-display font-extrabold">92%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-primary" style={{ width: "92%" }} />
                      </div>
                    </div>

                    <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-white/8 pt-4 text-center">
                      <div>
                        <dd className="font-display text-lg font-extrabold">391</dd>
                        <dt className="text-[11px] text-foreground/50">Tickets</dt>
                      </div>
                      <div>
                        <dd className="font-display text-lg font-extrabold">$17,200</dd>
                        <dt className="text-[11px] text-foreground/50">Revenue</dt>
                      </div>
                      <div>
                        <dd className="font-display text-lg font-extrabold">17</dd>
                        <dt className="text-[11px] text-foreground/50">Days left</dt>
                      </div>
                    </dl>
                  </div>
                </Link>

                {/* Event 3: Fashion Week Afterparty */}
                <Link
                  href="/pro/events/fashion-week-afterparty"
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-card transition hover:border-white/25"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src="/images/party.webp"
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                      style={{ position: "absolute", height: "100%", width: "100%", inset: 0 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur bg-foreground text-background">
                      Sold out
                    </span>
                    <span className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-black/40 backdrop-blur transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <ArrowUpRight className="size-5" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <div>
                      <h3 className="font-display text-2xl font-extrabold leading-tight">
                        Fashion Week Afterparty
                      </h3>
                      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/65">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="size-4" aria-hidden="true" /> November 14
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-4" aria-hidden="true" /> New York City
                        </span>
                      </p>
                      <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
                        <Megaphone className="size-3.5 text-foreground/40" aria-hidden="true" />
                        <span className="text-foreground/50">No campaign linked</span>
                      </p>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-baseline justify-between text-sm">
                        <span className="text-foreground/65">1,120 of 1,120 confirmed</span>
                        <span className="font-display font-extrabold">100%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-primary" style={{ width: "100%" }} />
                      </div>
                    </div>

                    <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-white/8 pt-4 text-center">
                      <div>
                        <dd className="font-display text-lg font-extrabold">1,004</dd>
                        <dt className="text-[11px] text-foreground/50">Tickets</dt>
                      </div>
                      <div>
                        <dd className="font-display text-lg font-extrabold">$46,100</dd>
                        <dt className="text-[11px] text-foreground/50">Revenue</dt>
                      </div>
                      <div>
                        <dd className="font-display text-lg font-extrabold">23</dd>
                        <dt className="text-[11px] text-foreground/50">Days left</dt>
                      </div>
                    </dl>
                  </div>
                </Link>
              </div>
            </section>

            {/* Ticket revenue Interactive Area Chart */}
            <section className="rounded-3xl border border-white/10 bg-card p-5 sm:p-6">
              <h2 className="font-display text-2xl font-extrabold">Ticket revenue</h2>
              <p className="mb-4 mt-1 text-sm text-foreground/60">
                Last 12 months. Touch the chart to inspect a month.
              </p>

              <figure className="relative">
                <figcaption className="sr-only">Ticket revenue by month</figcaption>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-xs text-foreground/60">
                  <span>{currentChartItem.label}</span>
                  <span className="font-display text-lg font-extrabold text-foreground">
                    ${currentChartItem.value.toLocaleString("en-US")}
                  </span>
                </div>

                <svg
                  viewBox="0 0 600 200"
                  role="img"
                  aria-label="Ticket revenue by month"
                  className="h-auto w-full touch-pan-y cursor-crosshair"
                  onPointerMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = (e.clientX - rect.left) / rect.width;
                    const idx = Math.max(
                      0,
                      Math.min(
                        REVENUE_DATA.length - 1,
                        Math.round(ratio * (REVENUE_DATA.length - 1))
                      )
                    );
                    setActiveChartIndex(idx);
                  }}
                  onPointerLeave={() => setActiveChartIndex(null)}
                >
                  <defs>
                    <linearGradient id="revenue-chart-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.38" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid guide lines */}
                  {[0.25, 0.5, 0.75].map((pct) => (
                    <line
                      key={pct}
                      x1={8}
                      x2={592}
                      y1={14 + 160 * pct}
                      y2={14 + 160 * pct}
                      stroke="currentColor"
                      strokeOpacity="0.07"
                    />
                  ))}

                  {/* Shaded Area fill */}
                  <path d={chartAreaPath} fill="url(#revenue-chart-fill)" />

                  {/* Spline line stroke */}
                  <path
                    d={chartCurvePath}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Vertical guide line on active point */}
                  <line
                    x1={getX(currIndex)}
                    x2={getX(currIndex)}
                    y1={14}
                    y2={174}
                    stroke="var(--primary)"
                    strokeOpacity="0.35"
                    strokeDasharray="3 4"
                  />

                  {/* Active Point Circle Indicator */}
                  <circle
                    cx={getX(currIndex)}
                    cy={getY(currentChartItem.value)}
                    r="5"
                    fill="var(--background)"
                    stroke="var(--primary)"
                    strokeWidth="2.5"
                  />

                  {/* X Axis Month Labels */}
                  {REVENUE_DATA.map((item, idx) => {
                    if (idx % 2 === 0 || idx === REVENUE_DATA.length - 1) {
                      return (
                        <text
                          key={item.label}
                          x={getX(idx)}
                          y={194}
                          textAnchor={
                            idx === 0
                              ? "start"
                              : idx === REVENUE_DATA.length - 1
                              ? "end"
                              : "middle"
                          }
                          className="fill-foreground/45"
                          fontSize="11"
                        >
                          {item.label}
                        </text>
                      );
                    }
                    return null;
                  })}
                </svg>
              </figure>
            </section>
          </div>
    </>
  );
}
