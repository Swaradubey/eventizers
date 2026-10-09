"use client";

import React from "react";
import Link from "next/link";
import { User, Briefcase, ArrowRight, LayoutDashboard } from "lucide-react";
import LaunchStage from "./LaunchStage";

interface ProHeroProps {
  onStartTrial: () => void;
}

export default function ProHero({ onStartTrial }: ProHeroProps) {
  return (
    <section className="relative overflow-hidden pt-20 sm:pt-28 md:pt-24">
      {/* Subtle blueprint grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "linear-gradient(to bottom, black 15%, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 15%, transparent 85%)",
        }}
      />

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 sm:px-6 md:flex-row md:items-center md:gap-8 lg:gap-12 xl:gap-16">
        {/* Left Column: Copy & CTAs */}
        <div className="flex max-w-3xl flex-col items-center text-center md:max-w-none md:flex-1 md:items-start md:text-left">
          {/* Audience Switcher */}
          <nav
            aria-label="Choose your experience"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm"
          >
            <Link
              href="/"
              className="flex h-11 min-w-[7.25rem] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors text-foreground/70 hover:text-foreground"
            >
              <User className="size-4" aria-hidden="true" />
              Individual
            </Link>
            <Link
              href="/pro"
              aria-current="page"
              className="flex h-11 min-w-[7.25rem] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors bg-primary text-primary-foreground shadow"
            >
              <Briefcase className="size-4" aria-hidden="true" />
              Pros
            </Link>
          </nav>

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary mt-6">
            Eventizers Pro
          </p>

          <h1 className="font-display text-balance font-extrabold tracking-tight mt-3 text-[2.1rem] leading-[1.02] sm:text-5xl sm:leading-[1.02] lg:text-6xl lg:leading-[1.02] xl:text-7xl xl:leading-[1]">
            <span className="block pb-[0.08em]">
              Create, promote, and grow your events with AI.
            </span>
            <span className="block pb-[0.08em]">
              <span className="text-primary">All in one place.</span>
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-foreground/70 sm:text-lg md:max-w-2xl lg:text-xl lg:leading-relaxed">
            Create stunning AI-powered event videos, publish across social media, manage RSVPs
            and guests, and track your event&apos;s performance — all from one simple dashboard.
          </p>

          <div
            data-sticky-hide="true"
            className="mt-7 flex w-full flex-col items-center gap-3 sm:max-w-md md:items-start"
          >
            <div className="flex w-full flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onStartTrial}
                className="inline-flex min-w-11 select-none items-center justify-center gap-2 rounded-full px-6 font-semibold tracking-tight transition active:scale-[0.97] bg-primary text-primary-foreground hover:brightness-110 h-14 flex-1 text-base shadow-xl"
              >
                Start free trial
              </button>
              <Link
                href="/pro/dashboard"
                className="inline-flex min-w-11 select-none items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 font-semibold tracking-tight transition active:scale-[0.97] hover:bg-white/15 text-white h-14 flex-1 text-base shadow-lg backdrop-blur"
              >
                <LayoutDashboard className="size-5 text-primary" aria-hidden="true" />
                <span>Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 md:justify-start">
              <a
                href="#flow"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-foreground/75 hover:text-white transition"
              >
                See how it works
              </a>
              <Link
                href="/pro/dashboard"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:brightness-110 transition"
              >
                Open live demo <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Animated Phone Stage */}
        <div className="w-full md:w-auto md:shrink-0 md:basis-[344px] lg:basis-[400px]">
          <LaunchStage />
        </div>
      </div>
    </section>
  );
}
