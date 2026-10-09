import React from "react";
import { BUILT_FOR_TAGS } from "./proData";

export default function ProBuiltFor() {
  const repeatedTags = [...BUILT_FOR_TAGS, ...BUILT_FOR_TAGS];

  return (
    <section aria-label="Who Pro is for" className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 lg:pt-20">
      <div className="flex items-center gap-6 border-y border-border/60 py-5">
        <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50">
          Built for
        </p>
        <div
          className="flex min-w-0 flex-1 overflow-hidden"
          style={{
            maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <ul
            aria-hidden="true"
            className="marquee flex w-max shrink-0 items-center"
            style={{ animationDuration: "50s" }}
          >
            {repeatedTags.map((tag, idx) => (
              <li key={`${tag}-${idx}`} className="flex items-center gap-8 pr-8">
                <span className="whitespace-nowrap font-display text-base font-semibold text-foreground/70 sm:text-lg">
                  {tag}
                </span>
                <span className="size-1 shrink-0 rounded-full bg-primary" />
              </li>
            ))}
          </ul>
          <p className="sr-only">{BUILT_FOR_TAGS.join(", ")}</p>
        </div>
      </div>
    </section>
  );
}
