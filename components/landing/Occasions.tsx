"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { OCCASIONS } from "./data";
import { useCreateSheet } from "./CreateSheetContext";
import { Eyebrow, MaskHeading, Photo } from "./motion";

export default function Occasions() {
  const { open } = useCreateSheet();

  return (
    <section id="occasions" className="relative bg-background pb-24 pt-20 lg:pt-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Eyebrow>Occasions</Eyebrow>
        <MaskHeading
          className="mt-3"
          lines={["Made for the moments", "people remember."]}
        />

        <ul className="mt-10 flex flex-col gap-4">
          {OCCASIONS.map((item, idx) => (
            <li
              key={item.title}
              className="sticky"
              style={{ top: `calc(4.5rem + ${0.6 * idx}rem)` }}
            >
              <button
                type="button"
                onClick={() => open("photos")}
                aria-label={`Create a ${item.title} invitation`}
                className="group relative block h-[62svh] max-h-[560px] min-h-[380px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-black text-left shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.8)] sm:h-[70svh]"
              >
                <Photo
                  src={item.image}
                  kenburns
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-8">
                  <div>
                    <h3 className="font-display text-balance text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-base text-white/80 sm:text-lg">
                      {item.line}
                    </p>
                  </div>
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition group-hover:rotate-45">
                    <ArrowUpRight className="size-5" aria-hidden />
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
