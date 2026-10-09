import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export default function ProComparison() {
  return (
    <section className="relative isolate py-16 lg:py-24">
      <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Two ways to use Eventizers
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-4xl">
            Hosting one night, or selling out every month?
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {/* Individual Card */}
          <div className="flex">
            <article className="flex w-full flex-col rounded-2xl border border-border bg-card p-6 shadow-md transition hover:border-white/20">
              <p className="text-sm font-semibold uppercase tracking-widest text-foreground/60">
                Individual
              </p>
              <p className="mt-2 font-display text-2xl font-extrabold">Free to start</p>
              <p className="mt-2 text-foreground/70">
                For birthdays, weddings, reunions and nights out.
              </p>

              <ul className="mt-5 flex flex-1 flex-col gap-3">
                <li className="flex items-start gap-2.5 text-[15px]">
                  <Check className="mt-0.5 size-4 shrink-0 text-foreground/60" aria-hidden="true" />
                  <span>AI and video invitations from templates</span>
                </li>
                <li className="flex items-start gap-2.5 text-[15px]">
                  <Check className="mt-0.5 size-4 shrink-0 text-foreground/60" aria-hidden="true" />
                  <span>RSVPs and a live guest list</span>
                </li>
                <li className="flex items-start gap-2.5 text-[15px]">
                  <Check className="mt-0.5 size-4 shrink-0 text-foreground/60" aria-hidden="true" />
                  <span>Share by link, text or WhatsApp</span>
                </li>
              </ul>

              <Link
                href="/"
                className="inline-flex min-w-11 select-none items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold tracking-tight transition active:scale-[0.97] glass text-foreground hover:bg-white/15 mt-6 h-12 w-full text-center"
              >
                Create a personal event
              </Link>
            </article>
          </div>

          {/* Pro Card */}
          <div className="flex">
            <article className="tone-card relative flex w-full flex-col rounded-2xl p-6 shadow-xl">
              <span aria-hidden="true" className="spin-border" />
              
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
                Pro
                <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold tracking-wide text-primary-foreground">
                  For creators
                </span>
              </p>
              <p className="mt-2 font-display text-2xl font-extrabold">From $29 a month</p>
              <p className="mt-2 text-foreground/70">
                For promoters, creators, venues and agencies selling tickets.
              </p>

              <ul className="mt-5 flex flex-1 flex-col gap-3">
                <li className="flex items-start gap-2.5 text-[15px]">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>Post to 5 channels from one place</span>
                </li>
                <li className="flex items-start gap-2.5 text-[15px]">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>See which post sold each ticket</span>
                </li>
                <li className="flex items-start gap-2.5 text-[15px]">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>Unified inbox, CRM sync and an AI agent</span>
                </li>
              </ul>

              <a
                href="#plans"
                className="inline-flex min-w-11 select-none items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold tracking-tight transition active:scale-[0.97] bg-primary text-primary-foreground hover:brightness-110 mt-6 h-12 w-full text-center shadow-lg"
              >
                See Pro plans
              </a>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
