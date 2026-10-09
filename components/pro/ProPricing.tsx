"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { PRO_PLANS, TRIAL_DAYS } from "./proData";

interface ProPricingProps {
  onSelectPlan: (planId: string) => void;
}

export default function ProPricing({ onSelectPlan }: ProPricingProps) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [activePlanIdx, setActivePlanIdx] = useState(1); // default Pro

  return (
    <section
      id="plans"
      className="relative isolate scroll-mt-16 overflow-hidden border-y border-border py-16 lg:py-28"
    >
      {/* Concert backdrop image */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img
          alt=""
          loading="lazy"
          src="/images/concert.webp"
          className="kb-slow absolute inset-0 size-full object-cover opacity-25 grayscale-[35%] dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_85%)]" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Pro pricing
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-5xl">
            Pick the plan that fits your calendar.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-foreground/70">
            Try any plan free for {TRIAL_DAYS} days. Free events never carry a platform fee.
          </p>
        </div>

        {/* Billing Period Switcher */}
        <div
          role="group"
          aria-label="Billing period"
          className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-background p-1 shadow-sm"
        >
          <button
            type="button"
            aria-pressed={!isAnnual}
            onClick={() => setIsAnnual(false)}
            className={`flex h-11 min-w-28 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
              !isAnnual
                ? "bg-primary text-primary-foreground shadow"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            aria-pressed={isAnnual}
            onClick={() => setIsAnnual(true)}
            className={`flex h-11 min-w-28 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
              isAnnual
                ? "bg-primary text-primary-foreground shadow"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            Annual
            <span className="text-xs font-bold opacity-80 bg-white/20 px-1.5 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>

        {/* Plan Cards Grid */}
        <ul
          data-sticky-hide="true"
          className="no-scrollbar relative -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 pt-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {PRO_PLANS.map((plan, idx) => (
            <li
              key={plan.id}
              className="flex w-[86%] shrink-0 snap-center sm:w-[58%] lg:w-auto"
            >
              <article
                className={`tone-card relative flex w-full flex-col rounded-3xl p-6 sm:p-7 shadow-xl border ${
                  plan.featured
                    ? "border-primary/50 bg-background/95"
                    : "border-border/80 bg-background/90"
                }`}
              >
                {/* Rotating glow border on featured plan */}
                {plan.featured && <span aria-hidden="true" className="spin-border" />}

                {/* Most Popular Badge */}
                {plan.featured && (
                  <span className="absolute right-5 top-5 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground shadow">
                    Most popular
                  </span>
                )}

                <h3 className="tone-text font-display text-2xl font-extrabold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 min-h-12 text-sm text-foreground/70">{plan.who}</p>

                <p className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-extrabold tabular-nums text-foreground">
                    ${isAnnual ? plan.annual : plan.monthly}
                  </span>
                  <span className="text-sm text-foreground/65">per month</span>
                </p>

                <p className="tone-chip mt-3 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold">
                  {TRIAL_DAYS}-day free trial
                </p>

                <p className="mt-2 text-xs text-foreground/60">
                  Then {isAnnual ? "billed annually" : "billed monthly"}. {plan.fee}.
                </p>

                <ul className="mt-6 flex flex-1 flex-col gap-3 border-t border-border/40 pt-6">
                  {plan.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-[14px] leading-snug">
                      <Check className="tone-text mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="text-foreground/85">{pt}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.id)}
                  className={`mt-7 h-14 w-full rounded-full text-base font-semibold tracking-tight transition active:scale-[0.98] ${
                    plan.featured
                      ? "bg-primary text-primary-foreground hover:brightness-110 shadow-lg"
                      : "glass text-foreground hover:bg-white/15 border border-border"
                  }`}
                >
                  Try {plan.name} free for {TRIAL_DAYS} days
                </button>

                <p className="mt-2 text-center text-xs text-foreground/55">
                  Cancel anytime during the trial.
                </p>
              </article>
            </li>
          ))}
        </ul>

        {/* Mobile Stepper Indicator */}
        <div
          role="group"
          aria-label="Choose a plan"
          className="flex items-center justify-center gap-1 mt-4 lg:hidden"
        >
          {PRO_PLANS.map((plan, idx) => (
            <button
              key={plan.id}
              type="button"
              aria-label={`Show ${plan.name} plan`}
              onClick={() => setActivePlanIdx(idx)}
              className="grid h-11 min-w-8 place-items-center px-1"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  idx === activePlanIdx ? "w-7 bg-primary" : "w-2 bg-foreground/25"
                }`}
              />
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-foreground/55 sm:text-sm lg:mt-8">
          Preview pricing. Final plans may change at launch.
        </p>
      </div>
    </section>
  );
}
