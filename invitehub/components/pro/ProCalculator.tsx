"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { PRO_PLANS } from "./proData";

interface ProCalculatorProps {
  onSelectPlan?: (planId: string) => void;
}

export default function ProCalculator({ onSelectPlan }: ProCalculatorProps) {
  const [events, setEvents] = useState(4);
  const [guests, setGuests] = useState(150);
  const [ticketPrice, setTicketPrice] = useState(25);

  const monthlyRevenue = events * guests * ticketPrice;

  const planCalculations = useMemo(() => {
    return PRO_PLANS.map((plan) => {
      const cost = Math.round(plan.annual + monthlyRevenue * plan.feeRate);
      return { plan, cost };
    });
  }, [monthlyRevenue]);

  const bestFit = planCalculations.reduce((prev, curr) =>
    curr.cost < prev.cost ? curr : prev
  );

  const maxCost = Math.max(...planCalculations.map((p) => p.cost), 1);

  return (
    <section
      id="calculator"
      className="relative isolate scroll-mt-16 overflow-hidden py-16 lg:py-24"
    >
      {/* Background backdrop image */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img
          alt=""
          loading="lazy"
          src="/images/pro-stage.png"
          className="kb-slow absolute inset-0 size-full object-cover opacity-25 grayscale-[35%] dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_85%)]" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Run your numbers
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-5xl">
            What would a month of sell-outs look like?
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Controls Card */}
          <div className="tone-card flex flex-col gap-6 rounded-3xl p-6 sm:p-8 bg-card/85 backdrop-blur-xl border border-border shadow-xl">
            {/* Slider 1: Events a month */}
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <label className="text-[15px] font-medium text-foreground/80">
                  Events a month
                </label>
                <output className="font-display text-2xl font-extrabold tabular-nums text-foreground">
                  {events}
                </output>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                step={1}
                value={events}
                onChange={(e) => setEvents(Number(e.target.value))}
                style={{ "--fill": `${((events - 1) / (12 - 1)) * 100}%` } as any}
                className="tone-range mt-2 h-11 w-full cursor-pointer"
              />
            </div>

            {/* Slider 2: Guests per event */}
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <label className="text-[15px] font-medium text-foreground/80">
                  Guests per event
                </label>
                <output className="font-display text-2xl font-extrabold tabular-nums text-foreground">
                  {guests}
                </output>
              </div>
              <input
                type="range"
                min={20}
                max={500}
                step={10}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                style={{ "--fill": `${((guests - 20) / (500 - 20)) * 100}%` } as any}
                className="tone-range mt-2 h-11 w-full cursor-pointer"
              />
            </div>

            {/* Slider 3: Average ticket price */}
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <label className="text-[15px] font-medium text-foreground/80">
                  Average ticket
                </label>
                <output className="font-display text-2xl font-extrabold tabular-nums text-foreground">
                  {ticketPrice === 0 ? "Free" : `$${ticketPrice}`}
                </output>
              </div>
              <input
                type="range"
                min={0}
                max={150}
                step={5}
                value={ticketPrice}
                onChange={(e) => setTicketPrice(Number(e.target.value))}
                style={{ "--fill": `${(ticketPrice / 150) * 100}%` } as any}
                className="tone-range mt-2 h-11 w-full cursor-pointer"
              />
            </div>

            <p className="text-sm text-foreground/60 mt-auto pt-2 border-t border-border/40">
              Assumes every guest buys a ticket. Estimates only.
            </p>
          </div>

          {/* Revenue & Best Fit Result Card */}
          <div className="tone-card relative flex flex-col rounded-3xl p-6 sm:p-8 bg-card/90 backdrop-blur-xl border border-primary/40 shadow-2xl">
            <span aria-hidden="true" className="spin-border" />

            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Ticket revenue a month
            </p>
            <p className="mt-1 font-display text-5xl font-extrabold leading-none text-foreground tabular-nums">
              ${monthlyRevenue.toLocaleString()}
            </p>

            {/* Plan Breakdown Progress Bars */}
            <ul className="mt-6 flex flex-col gap-4" aria-label="Eventizers cost by plan">
              {planCalculations.map(({ plan, cost }) => {
                const isBest = plan.id === bestFit.plan.id;
                return (
                  <li key={plan.id}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className={`font-semibold flex items-center gap-2 ${isBest ? "text-primary" : "text-foreground/75"}`}>
                        {plan.name}
                        {isBest && (
                          <span className="rounded-full bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                            Best fit
                          </span>
                        )}
                      </span>
                      <span className="font-bold tabular-nums text-foreground">
                        ${cost.toLocaleString()}
                        <span className="text-xs font-normal text-foreground/60">/mo</span>
                      </span>
                    </div>

                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-background border border-border/40">
                      <motion.div
                        className={`h-full rounded-full transition-colors ${
                          isBest ? "bg-primary" : "bg-primary/40"
                        }`}
                        initial={false}
                        animate={{ width: `${Math.max(8, (cost / maxCost) * 100)}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* AI Summary Recommendation Box */}
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-background/80 border border-border/60 p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <p className="text-[15px] leading-relaxed text-foreground">
                At this volume, <strong className="text-primary">{bestFit.plan.name}</strong> costs
                the least: the plan plus ticket fees come to{" "}
                <strong className="text-foreground font-extrabold">
                  ${bestFit.cost.toLocaleString()} a month
                </strong>{" "}
                on annual billing.
              </p>
            </div>

            <div data-sticky-hide="true" className="mt-6">
              <button
                type="button"
                onClick={() => onSelectPlan?.(bestFit.plan.id)}
                className="h-14 w-full rounded-full bg-primary font-semibold text-primary-foreground text-base hover:brightness-110 active:scale-[0.98] transition shadow-lg"
              >
                Start with {bestFit.plan.name}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
