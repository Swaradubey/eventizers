"use client";

import React from "react";
import Link from "next/link";
import {
  Plus,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Megaphone,
} from "lucide-react";

export default function IndividualEventsPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Events
          </p>
          <h1
            className="mt-1.5 text-balance font-display text-3xl font-extrabold leading-[1.02] tracking-tight sm:text-4xl text-foreground"
            style={{ fontFamily: "'Red Rose', Georgia, serif" }}
          >
            Every event, one place
          </h1>
          <p className="mt-2 max-w-xl text-pretty text-[15px] leading-relaxed text-foreground/65">
            Open an event to see how it is growing and what to do next.
          </p>
        </div>
        <Link
          href="/create-event"
          className="flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-bold text-primary-foreground transition active:scale-95 hover:brightness-110 cursor-pointer"
        >
          <Plus className="size-[18px]" aria-hidden="true" /> New event
        </Link>
      </div>

      {/* Grid of events */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1 */}
        <Link
          href="/pro/events/nyc-rooftop-halloween"
          className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-card transition hover:border-white/25"
        >
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              alt=""
              loading="lazy"
              className="size-full object-cover transition duration-500 group-hover:scale-105"
              style={{ position: "absolute", height: "100%", width: "100%", inset: 0 }}
              src="/images/halloween-house.png"
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
              <h3
                className="font-display text-2xl font-extrabold leading-tight text-foreground"
                style={{ fontFamily: "'Red Rose', Georgia, serif" }}
              >
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
                <dd className="font-display text-lg font-extrabold text-foreground">284</dd>
                <dt className="text-[11px] text-foreground/50">Tickets</dt>
              </div>
              <div>
                <dd className="font-display text-lg font-extrabold text-foreground">$18,540</dd>
                <dt className="text-[11px] text-foreground/50">Revenue</dt>
              </div>
              <div>
                <dd className="font-display text-lg font-extrabold text-foreground">9</dd>
                <dt className="text-[11px] text-foreground/50">Days left</dt>
              </div>
            </dl>
          </div>
        </Link>

        {/* Card 2 */}
        <Link
          href="/pro/events/sunday-rooftop"
          className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-card transition hover:border-white/25"
        >
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              alt=""
              loading="lazy"
              className="size-full object-cover transition duration-500 group-hover:scale-105"
              style={{ position: "absolute", height: "100%", width: "100%", inset: 0 }}
              src="/images/rooftop.webp"
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
              <h3
                className="font-display text-2xl font-extrabold leading-tight text-foreground"
                style={{ fontFamily: "'Red Rose', Georgia, serif" }}
              >
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
                  Sunset countdown <span className="font-normal text-foreground/55">· Scheduled</span>
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
                <dd className="font-display text-lg font-extrabold text-foreground">391</dd>
                <dt className="text-[11px] text-foreground/50">Tickets</dt>
              </div>
              <div>
                <dd className="font-display text-lg font-extrabold text-foreground">$17,200</dd>
                <dt className="text-[11px] text-foreground/50">Revenue</dt>
              </div>
              <div>
                <dd className="font-display text-lg font-extrabold text-foreground">17</dd>
                <dt className="text-[11px] text-foreground/50">Days left</dt>
              </div>
            </dl>
          </div>
        </Link>

        {/* Card 3 */}
        <Link
          href="/pro/events/fashion-week-afterparty"
          className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-card transition hover:border-white/25"
        >
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              alt=""
              loading="lazy"
              className="size-full object-cover transition duration-500 group-hover:scale-105"
              style={{ position: "absolute", height: "100%", width: "100%", inset: 0 }}
              src="/images/party.webp"
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
              <h3
                className="font-display text-2xl font-extrabold leading-tight text-foreground"
                style={{ fontFamily: "'Red Rose', Georgia, serif" }}
              >
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
                <dd className="font-display text-lg font-extrabold text-foreground">1,004</dd>
                <dt className="text-[11px] text-foreground/50">Tickets</dt>
              </div>
              <div>
                <dd className="font-display text-lg font-extrabold text-foreground">$46,100</dd>
                <dt className="text-[11px] text-foreground/50">Revenue</dt>
              </div>
              <div>
                <dd className="font-display text-lg font-extrabold text-foreground">23</dd>
                <dt className="text-[11px] text-foreground/50">Days left</dt>
              </div>
            </dl>
          </div>
        </Link>
      </div>
    </div>
  );
}
