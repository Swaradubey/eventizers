"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useCreateSheet } from "./CreateSheetContext";

export default function StickyCta() {
  const { open } = useCreateSheet();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const innerHeight = window.innerHeight;
      const target = document.getElementById("start-now");
      const bottomLimit = target
        ? target.getBoundingClientRect().top + scrollY - innerHeight * 0.4
        : Infinity;

      setVisible(scrollY > innerHeight * 0.8 && scrollY < bottomLimit);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 pointer-events-none transition-all duration-300">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/20 bg-[#12181d]/90 px-4 py-2 shadow-2xl backdrop-blur-xl">
        <span className="flex items-center gap-1.5 text-xs font-bold text-white">
          <Sparkles className="size-3.5 text-primary" />
          <span>eventizers</span>
        </span>
        <button
          type="button"
          onClick={() => open("ai")}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow hover:brightness-110 active:scale-95 transition"
        >
          <span>Create Event</span>
          <ArrowRight className="size-3" />
        </button>
      </div>
    </div>
  );
}
