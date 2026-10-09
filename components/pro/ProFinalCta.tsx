import React from "react";
import Link from "next/link";

interface ProFinalCtaProps {
  onStartTrial: () => void;
}

export default function ProFinalCta({ onStartTrial }: ProFinalCtaProps) {
  return (
    <section className="pb-20 lg:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div>
          <div
            data-sticky-hide="true"
            className="relative isolate overflow-hidden rounded-3xl border border-primary/40 px-6 py-16 text-center sm:px-12 lg:py-24 shadow-2xl"
          >
            {/* Background image */}
            <img
              alt=""
              loading="lazy"
              src="/images/pro-concert.png"
              className="-z-20 absolute inset-0 size-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-b from-background/85 via-background/70 to-background/95"
            />

            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-balance text-foreground sm:text-5xl">
              Your next event deserves a promotion desk.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-foreground/85">
              Start free for 14 days. Connect your channels, post once, and see what sells.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onStartTrial}
                className="inline-flex min-w-11 select-none items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition active:scale-[0.97] bg-primary text-primary-foreground hover:brightness-110 h-14 w-full px-8 text-base sm:w-auto shadow-xl"
              >
                Start free trial
              </button>
              <Link
                href="/pro/dashboard"
                className="inline-flex min-w-11 select-none items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition active:scale-[0.97] glass text-foreground hover:bg-white/15 h-14 w-full bg-background/40 px-7 text-base backdrop-blur sm:w-auto border border-border"
              >
                Try the live demo
              </Link>
            </div>

            <Link
              href="/"
              className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-foreground/80 hover:text-white transition"
            >
              Hosting a personal event? Switch to Individual
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
