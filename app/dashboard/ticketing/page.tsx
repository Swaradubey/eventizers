"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function TicketingPage() {
  return (
    <>
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Ticketing</p>
            <h1 className="mt-1.5 text-balance font-display text-3xl font-extrabold leading-[1.02] tracking-tight sm:text-4xl">Sell every seat</h1>
            <p className="mt-2 max-w-xl text-pretty text-[15px] leading-relaxed text-foreground/65">Ticket types, live orders, promo codes and payouts for all your events.</p>
          </div>
        </div>
        <section aria-label="Ticket totals" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="flex flex-col justify-between rounded-3xl border p-4 sm:p-5 border-white/10 bg-card">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-medium text-foreground/65">Tickets sold</p>
            </div>
            <p className="mt-3 font-display text-[2rem] font-extrabold leading-none tracking-tight sm:text-4xl"><span>1,679</span></p>
          </div>
          <div className="flex flex-col justify-between rounded-3xl border p-4 sm:p-5 border-white/10 bg-card">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-medium text-foreground/65">Still available</p>
            </div>
            <p className="mt-3 font-display text-[2rem] font-extrabold leading-none tracking-tight sm:text-4xl"><span>215</span></p>
          </div>
          <div className="flex flex-col justify-between rounded-3xl border p-4 sm:p-5 border-white/10 bg-card">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-medium text-foreground/65">Gross sales</p>
            </div>
            <p className="mt-3 font-display text-[2rem] font-extrabold leading-none tracking-tight sm:text-4xl"><span>$81,840</span></p>
          </div>
          <div className="flex flex-col justify-between rounded-3xl border p-4 sm:p-5 border-primary/40 bg-primary/10">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-medium text-foreground/65">Net after fees</p>
            </div>
            <p className="mt-3 font-display text-[2rem] font-extrabold leading-none tracking-tight sm:text-4xl"><span>$78,215</span></p>
          </div>
        </section>

        <section aria-label="Events with tickets" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold">Events with tickets</h2>
            <Link href="/dashboard/events/new" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80">
              <span>New event</span>
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="flex flex-col rounded-3xl border border-white/10 bg-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-extrabold leading-snug truncate">NYC Rooftop Halloween</h3>
                  <p className="mt-1 text-sm text-foreground/55">October 31, 2025 · 8:00 PM</p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">Live</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-background/50 p-3">
                  <p className="text-[11px] font-medium text-foreground/55">Tickets sold</p>
                  <p className="mt-1 font-display text-xl font-extrabold">412</p>
                </div>
                <div className="rounded-2xl bg-background/50 p-3">
                  <p className="text-[11px] font-medium text-foreground/55">Revenue</p>
                  <p className="mt-1 font-display text-xl font-extrabold">$24,720</p>
                </div>
                <div className="rounded-2xl bg-background/50 p-3">
                  <p className="text-[11px] font-medium text-foreground/55">Available</p>
                  <p className="mt-1 font-display text-xl font-extrabold">88</p>
                </div>
                <div className="rounded-2xl bg-background/50 p-3">
                  <p className="text-[11px] font-medium text-foreground/55">Sell-through</p>
                  <p className="mt-1 font-display text-xl font-extrabold text-primary">82%</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground/60">Tiers: 3</span>
                  <span className="text-sm text-foreground/60">Promo codes: 2</span>
                </div>
                <Link href="/dashboard/ticketing?eventId=nyc-rooftop-halloween" className="text-sm font-semibold text-primary hover:text-primary/80">Manage tiers →</Link>
              </div>
            </article>

            <article className="flex flex-col rounded-3xl border border-white/10 bg-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-extrabold leading-snug truncate">Sunday Rooftop Brunch</h3>
                  <p className="mt-1 text-sm text-foreground/55">November 8, 2025 · 11:00 AM</p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">Draft</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-background/50 p-3">
                  <p className="text-[11px] font-medium text-foreground/55">Tickets sold</p>
                  <p className="mt-1 font-display text-xl font-extrabold">0</p>
                </div>
                <div className="rounded-2xl bg-background/50 p-3">
                  <p className="text-[11px] font-medium text-foreground/55">Revenue</p>
                  <p className="mt-1 font-display text-xl font-extrabold">$0</p>
                </div>
                <div className="rounded-2xl bg-background/50 p-3">
                  <p className="text-[11px] font-medium text-foreground/55">Available</p>
                  <p className="mt-1 font-display text-xl font-extrabold">200</p>
                </div>
                <div className="rounded-2xl bg-background/50 p-3">
                  <p className="text-[11px] font-medium text-foreground/55">Sell-through</p>
                  <p className="mt-1 font-display text-xl font-extrabold text-foreground/50">0%</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground/60">Tiers: 2</span>
                  <span className="text-sm text-foreground/60">Promo codes: 0</span>
                </div>
                <Link href="/dashboard/ticketing?eventId=sunday-rooftop" className="text-sm font-semibold text-primary hover:text-primary/80">Set up tickets →</Link>
              </div>
            </article>
          </div>
        </section>

        <section aria-label="Recent orders" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold">Recent orders</h2>
            <Link href="/dashboard/ticketing/orders" className="text-sm font-semibold text-primary hover:text-primary/80">View all →</Link>
          </div>
          <div className="rounded-3xl border border-white/10 bg-card overflow-hidden">
            <table className="w-full text-left" role="table">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Order</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Event</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Tier</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Qty</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Amount</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Status</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-mono text-[13px]">#ORD-7842</td>
                  <td className="px-5 py-4 font-medium">NYC Rooftop Halloween</td>
                  <td className="px-5 py-4">VIP Pass</td>
                  <td className="px-5 py-4 tabular-nums">2</td>
                  <td className="px-5 py-4 tabular-nums font-medium">$380</td>
                  <td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">Paid</span></td>
                  <td className="px-5 py-4 text-[13px] text-foreground/55">2 min ago</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-mono text-[13px]">#ORD-7841</td>
                  <td className="px-5 py-4 font-medium">NYC Rooftop Halloween</td>
                  <td className="px-5 py-4">General Admission</td>
                  <td className="px-5 py-4 tabular-nums">4</td>
                  <td className="px-5 py-4 tabular-nums font-medium">$480</td>
                  <td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">Paid</span></td>
                  <td className="px-5 py-4 text-[13px] text-foreground/55">5 min ago</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-mono text-[13px]">#ORD-7840</td>
                  <td className="px-5 py-4 font-medium">NYC Rooftop Halloween</td>
                  <td className="px-5 py-4">Early Bird</td>
                  <td className="px-5 py-4 tabular-nums">1</td>
                  <td className="px-5 py-4 tabular-nums font-medium">$85</td>
                  <td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">Paid</span></td>
                  <td className="px-5 py-4 text-[13px] text-foreground/55">12 min ago</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-mono text-[13px]">#ORD-7839</td>
                  <td className="px-5 py-4 font-medium">NYC Rooftop Halloween</td>
                  <td className="px-5 py-4">General Admission</td>
                  <td className="px-5 py-4 tabular-nums">3</td>
                  <td className="px-5 py-4 tabular-nums font-medium">$360</td>
                  <td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-400">Pending</span></td>
                  <td className="px-5 py-4 text-[13px] text-foreground/55">18 min ago</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-mono text-[13px]">#ORD-7838</td>
                  <td className="px-5 py-4 font-medium">NYC Rooftop Halloween</td>
                  <td className="px-5 py-4">VIP Pass</td>
                  <td className="px-5 py-4 tabular-nums">1</td>
                  <td className="px-5 py-4 tabular-nums font-medium">$190</td>
                  <td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">Paid</span></td>
                  <td className="px-5 py-4 text-[13px] text-foreground/55">25 min ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}