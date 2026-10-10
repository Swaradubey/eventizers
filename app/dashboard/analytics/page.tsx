"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Analytics</p>
            <h1 className="mt-1.5 text-balance font-display text-3xl font-extrabold leading-[1.02] tracking-tight sm:text-4xl">Across every event</h1>
            <p className="mt-2 max-w-xl text-pretty text-[15px] leading-relaxed text-foreground/65">Revenue, attendance and audience growth, plus which channels and formats earn their keep.</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="flex flex-col justify-between rounded-3xl border p-4 sm:p-5 border-white/10 bg-card">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-foreground/65">Total events</p>
              </div>
              <p className="mt-3 font-display text-[2rem] font-extrabold leading-none tracking-tight sm:text-4xl"><span>12</span></p>
            </div>
            <div className="flex flex-col justify-between rounded-3xl border p-4 sm:p-5 border-white/10 bg-card">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-foreground/65">Total reach</p>
              </div>
              <p className="mt-3 font-display text-[2rem] font-extrabold leading-none tracking-tight sm:text-4xl"><span>2.1M</span></p>
            </div>
            <div className="flex flex-col justify-between rounded-3xl border p-4 sm:p-5 border-white/10 bg-card">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-foreground/65">Total RSVPs</p>
              </div>
              <p className="mt-3 font-display text-[2rem] font-extrabold leading-none tracking-tight sm:text-4xl"><span>9,640</span></p>
            </div>
            <div className="flex flex-col justify-between rounded-3xl border p-4 sm:p-5 border-white/10 bg-card">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-foreground/65">Total tickets</p>
              </div>
              <p className="mt-3 font-display text-[2rem] font-extrabold leading-none tracking-tight sm:text-4xl"><span>3,418</span></p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-card p-6">
              <h2 className="font-display text-lg font-extrabold mb-5">RSVP breakdown</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-emerald-400">Attending</span>
                    <span className="text-sm font-semibold tabular-nums">7,240 (75%)</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-emerald-400 transition-[width] duration-500" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground/70">Pending</span>
                    <span className="text-sm font-semibold tabular-nums">1,680 (17%)</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: "17%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-amber-400">Maybe</span>
                    <span className="text-sm font-semibold tabular-nums">482 (5%)</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-amber-400 transition-[width] duration-500" style={{ width: "5%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-red-400">Declined</span>
                    <span className="text-sm font-semibold tabular-nums">238 (3%)</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-red-400 transition-[width] duration-500" style={{ width: "3%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-card p-6">
              <h2 className="font-display text-lg font-extrabold mb-5">Event performance</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground/70">Open rate</span>
                    <span className="font-bold text-primary tabular-nums">68.4%</span>
                  </div>
                  <div className="mt-2.5 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: "68.4%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground/70">Click rate</span>
                    <span className="font-bold text-primary tabular-nums">12.7%</span>
                  </div>
                  <div className="mt-2.5 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: "12.7%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground/70">Response rate</span>
                    <span className="font-bold text-emerald-400 tabular-nums">75.1%</span>
                  </div>
                  <div className="mt-2.5 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: "75.1%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground/70">Avg response time</span>
                    <span className="font-bold text-foreground/70 tabular-nums">4.2 hrs</span>
                  </div>
                  <div className="mt-2.5 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-foreground/30 rounded-full transition-all duration-500" style={{ width: "45%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section aria-label="Top events" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold">Top events</h2>
              <Link href="/dashboard/analytics/events" className="text-sm font-semibold text-primary hover:text-primary/80">View all →</Link>
            </div>
            <div className="rounded-3xl border border-white/10 bg-card overflow-hidden">
              <table className="w-full text-left" role="table">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Event</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Reach</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">RSVPs</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Open rate</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Click rate</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-medium">NYC Rooftop Halloween</td>
                    <td className="px-5 py-4 tabular-nums text-foreground/70">842,000</td>
                    <td className="px-5 py-4 tabular-nums font-semibold">1,240</td>
                    <td className="px-5 py-4 tabular-nums text-primary">72.1%</td>
                    <td className="px-5 py-4 tabular-nums text-primary">14.3%</td>
                    <td className="px-5 py-4 tabular-nums font-medium text-emerald-400">$42,800</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-medium">Summer Garden Soirée</td>
                    <td className="px-5 py-4 tabular-nums text-foreground/70">412,000</td>
                    <td className="px-5 py-4 tabular-nums font-semibold">890</td>
                    <td className="px-5 py-4 tabular-nums text-primary">68.4%</td>
                    <td className="px-5 py-4 tabular-nums text-primary">11.2%</td>
                    <td className="px-5 py-4 tabular-nums font-medium text-emerald-400">$18,750</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-medium">Corporate Tech Summit</td>
                    <td className="px-5 py-4 tabular-nums text-foreground/70">318,000</td>
                    <td className="px-5 py-4 tabular-nums font-semibold">675</td>
                    <td className="px-5 py-4 tabular-nums text-primary">64.8%</td>
                    <td className="px-5 py-4 tabular-nums text-primary">9.8%</td>
                    <td className="px-5 py-4 tabular-nums font-medium text-emerald-400">$24,300</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-medium">Sunday Rooftop Brunch</td>
                    <td className="px-5 py-4 tabular-nums text-foreground/70">198,000</td>
                    <td className="px-5 py-4 tabular-nums font-semibold">312</td>
                    <td className="px-5 py-4 tabular-nums text-primary">58.2%</td>
                    <td className="px-5 py-4 tabular-nums text-primary">8.1%</td>
                    <td className="px-5 py-4 tabular-nums font-medium text-emerald-400">$6,240</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-medium">Winter Wonderland Gala</td>
                    <td className="px-5 py-4 tabular-nums text-foreground/70">145,000</td>
                    <td className="px-5 py-4 tabular-nums font-semibold">198</td>
                    <td className="px-5 py-4 tabular-nums text-primary">54.7%</td>
                    <td className="px-5 py-4 tabular-nums text-primary">7.4%</td>
                    <td className="px-5 py-4 tabular-nums font-medium text-emerald-400">$8,910</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}