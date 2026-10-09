"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { OCCASIONS } from "./data";
import { useCreateSheet } from "./CreateSheetContext";

export default function Occasions() {
  const { open } = useCreateSheet();

  return (
    <section id="occasions" className="relative bg-background pb-24 pt-20 lg:pt-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Occasions
        </p>
        <h2 className="font-display text-balance text-[2.6rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl mt-3">
          Made for the moments
          <span className="block text-primary">people remember.</span>
        </h2>

        {/* Sticky stacked cards list */}
        <ul className="mt-12 flex flex-col gap-6">
          {OCCASIONS.map((occ, idx) => (
            <li
              key={idx}
              className="sticky"
              style={{ top: `calc(4.5rem + ${0.6 * idx}rem)` }}
            >
              <button
                type="button"
                onClick={() => open("photos")}
                aria-label={`Create a ${occ.title} invitation`}
                className="group relative block h-[55svh] max-h-[500px] min-h-[340px] w-full overflow-hidden rounded-[2.2rem] border border-white/10 bg-black text-left shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.8)] transition hover:border-white/25 sm:h-[65svh]"
              >
                {/* Background image */}
                <img
                  src={occ.image}
                  alt={occ.title}
                  className="kb absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

                {/* Content overlay */}
                <div className="absolute inset-x-6 bottom-6 flex items-end justify-between sm:inset-x-8 sm:bottom-8">
                  <div className="max-w-md">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                      Experience
                    </span>
                    <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
                      {occ.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/80 sm:text-base leading-relaxed">
                      {occ.line}
                    </p>
                  </div>

                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowUpRight className="size-5" />
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
