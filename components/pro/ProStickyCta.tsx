"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ProStickyCtaProps {
  onStartTrial: () => void;
}

export default function ProStickyCta({ onStartTrial }: ProStickyCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const innerHeight = window.innerHeight;
      const hideElements = document.querySelectorAll("[data-sticky-hide]");
      const isOverHiddenElement = Array.from(hideElements).some((el) => {
        const rect = el.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < innerHeight;
      });

      // Show after scrolling past hero and when not hovering over buttons with data-sticky-hide
      setVisible(scrollY > 0.8 * innerHeight && !isOverHiddenElement);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
        >
          <button
            type="button"
            onClick={onStartTrial}
            className="pointer-events-auto flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-primary-foreground shadow-[0_10px_40px_-8px_var(--primary)] transition active:scale-[0.97]"
          >
            <Sparkles className="size-5" aria-hidden="true" />
            Start free trial
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
