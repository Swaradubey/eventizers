"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function CheckInPage() {
  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Check-in</p>
            <h1 className="mt-1.5 text-balance font-display text-3xl font-extrabold leading-[1.02] tracking-tight sm:text-4xl">Door mode</h1>
            <p className="mt-2 max-w-xl text-pretty text-[15px] leading-relaxed text-foreground/65">Scan tickets or search the list. Works on any phone at the door.</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="rounded-3xl border border-white/10 bg-card p-5 sm:p-6">
              <label htmlFor="checkin-event" className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/55">Event</label>
              <select id="checkin-event" className="mb-6 mt-2 h-12 w-full rounded-2xl border border-white/10 bg-background/60 px-4 text-[15px] font-semibold outline-none focus:border-primary">
                <option defaultValue="nyc-rooftop-halloween">NYC Rooftop Halloween · October 31</option>
                <option defaultValue="sunday-rooftop">Sunday Rooftop · November 8</option>
              </select>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm text-foreground/60">Inside now</p>
                  <p className="font-display text-5xl font-extrabold leading-none tabular-nums" aria-live="polite">8<span className="text-2xl text-foreground/45"> / 20</span></p>
                </div>
                <p className="font-display text-2xl font-extrabold text-primary tabular-nums">40%</p>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: "40%" }}></div>
              </div>
              <p className="mt-2 text-xs text-foreground/50">Headcount includes plus-ones.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-card p-5 sm:p-6 flex flex-col items-center gap-4 text-center">
              <div className="relative grid aspect-square w-full max-w-56 place-items-center">
                <svg className="w-full h-full text-white/10" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray="282.7" strokeDashoffset="169.6" />
                </svg>
                <p className="absolute font-display text-4xl font-extrabold tabular-nums sm:text-7xl">40%</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400"><span className="size-2 rounded-full bg-emerald-400" /> 8 checked in</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-foreground/60"><span className="size-2 rounded-full bg-foreground/30" /> 12 pending</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-3">
            <div className="rounded-3xl border border-white/10 bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/20 text-primary"><svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="6" height="6" rx="1.5" /><rect x="15" y="3" width="6" height="6" rx="1.5" /><rect x="3" y="15" width="6" height="6" rx="1.5" /><path d="M15 15h2v2h-2z" /><path d="M21 15v2h-2" /><path d="M15 21v-2h2v2h4" /></svg></span>
                  <div>
                    <p className="text-sm font-medium text-foreground/60">Scanner</p>
                    <p className="font-display text-xl font-extrabold">Camera active</p>
                  </div>
                </div>
                <button className="flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-bold text-primary-foreground shadow-[0_10px_34px_-8px_var(--primary)] transition active:scale-95 cursor-pointer">
                  <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="6" height="6" rx="1.5" /><rect x="15" y="3" width="6" height="6" rx="1.5" /><rect x="3" y="15" width="6" height="6" rx="1.5" /><path d="M15 15h2v2h-2z" /><path d="M21 15v2h-2" /><path d="M15 21v-2h2v2h4" /></svg>
                  Scan next
                </button>
              </div>
              <div className="aspect-video rounded-2xl bg-black/20 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-white/30">
                  <svg className="size-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="6" height="6" rx="1.5" /><rect x="15" y="3" width="6" height="6" rx="1.5" /><rect x="3" y="15" width="6" height="6" rx="1.5" /><path d="M15 15h2v2h-2z" /><path d="M21 15v2h-2" /><path d="M15 21v-2h2v2h4" /></svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-[70%] aspect-square">
                    <div className="absolute inset-0 border-2 border-primary/50 rounded-xl" />
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-xl" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-xl" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-xl" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-xl" />
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-card p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-emerald/20 text-emerald-400"><svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg></span>
                    <div>
                      <p className="text-sm font-medium text-foreground/60">GPS verified</p>
                      <p className="font-display text-xl font-extrabold">Enabled</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">Active</span>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-card p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-amber/20 text-amber-400"><svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></span>
                    <div>
                      <p className="text-sm font-medium text-foreground/60">Offline sync</p>
                      <p className="font-display text-xl font-extrabold">Ready</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-amber-400">Queued: 0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section aria-label="Check-in log" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold">Recent check-ins</h2>
            <Link href="/dashboard/check-in/log" className="text-sm font-semibold text-primary hover:text-primary/80">View all →</Link>
          </div>
          <div className="rounded-3xl border border-white/10 bg-card overflow-hidden">
            <table className="w-full text-left" role="table">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Guest</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Ticket</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Method</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-medium">Sarah Jenkins</td>
                  <td className="px-5 py-4">VIP Pass</td>
                  <td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">QR scan</span></td>
                  <td className="px-5 py-4 text-[13px] text-foreground/55">10:42 AM</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-medium">Marcus Chen +1</td>
                  <td className="px-5 py-4">General Admission</td>
                  <td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-emerald/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">GPS</span></td>
                  <td className="px-5 py-4 text-[13px] text-foreground/55">10:38 AM</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-medium">Olivia Park</td>
                  <td className="px-5 py-4">General Admission</td>
                  <td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">QR scan</span></td>
                  <td className="px-5 py-4 text-[13px] text-foreground/55">10:35 AM</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-medium">James Wilson</td>
                  <td className="px-5 py-4">Early Bird</td>
                  <td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-amber/15 px-2 py-0.5 text-[11px] font-semibold text-amber-400">Manual</span></td>
                  <td className="px-5 py-4 text-[13px] text-foreground/55">10:31 AM</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-medium">Aisha Patel +2</td>
                  <td className="px-5 py-4">VIP Pass</td>
                  <td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-emerald/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">GPS</span></td>
                  <td className="px-5 py-4 text-[13px] text-foreground/55">10:28 AM</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}