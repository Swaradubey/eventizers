import React from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "./proData";

export default function ProFaq() {
  return (
    <section id="faq" className="relative isolate scroll-mt-16 py-20 lg:py-28">
      <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Questions
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-5xl">
            Before you start.
          </h2>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border bg-card px-5 transition-colors duration-300 open:border-primary/50 open:bg-primary/[0.07] shadow-sm"
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-3 text-left text-base font-semibold [&::-webkit-details-marker]:hidden">
                <span className="text-foreground">{item.q}</span>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground/70 transition-colors duration-300 group-open:bg-primary group-open:text-primary-foreground">
                  <ChevronDown
                    className="size-4 transition-transform duration-300 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </span>
              </summary>
              <p className="pb-5 leading-relaxed text-foreground/75 text-[15px]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
