"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCreateSheet } from "./CreateSheetContext";

const CTA_STYLES: Record<string, string> = {
  primary: "bg-primary text-primary-foreground hover:brightness-110",
  accent: "bg-accent text-accent-foreground hover:brightness-110",
  ghost: "glass text-foreground hover:bg-white/15",
  light: "bg-foreground text-background hover:bg-white",
  dark: "bg-background text-foreground hover:bg-card",
};

export function Cta({
  variant = "primary",
  href,
  className,
  children,
  onClick,
  type = "button",
  disabled,
}: {
  variant?: "primary" | "accent" | "ghost" | "light" | "dark";
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) {
  const cls = cn(
    "inline-flex h-12 min-w-11 select-none items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold tracking-tight transition active:scale-[0.97]",
    CTA_STYLES[variant],
    disabled && "pointer-events-none opacity-50",
    className
  );
  if (href) {
    return (
      <a href={href} className={cls} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function CreateCta({
  mode,
  audience,
  plan,
  variant,
  className,
  children,
}: {
  mode?: any;
  audience?: any;
  plan?: any;
  variant?: "primary" | "accent" | "ghost" | "light" | "dark";
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useCreateSheet();
  return (
    <Cta
      variant={variant}
      className={className}
      onClick={() => open(mode, { audience, plan })}
    >
      {children}
    </Cta>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-[0.22em] text-primary", className)}>
      {children}
    </p>
  );
}

export function MaskHeading({
  lines,
  className,
  as: Component = "h2",
  delay = 0,
  onLoad = false,
}: {
  lines: (string | React.ReactNode)[];
  className?: string;
  as?: any;
  delay?: number;
  onLoad?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const shouldAnimate = onLoad || isInView;

  return (
    <Component
      ref={ref}
      className={cn(
        "font-display text-balance text-[2.6rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl",
        className
      )}
    >
      {lines.map((line, idx) => (
        <span key={idx} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            initial={{ y: "110%" }}
            animate={{ y: shouldAnimate ? "0%" : "110%" }}
            transition={{ duration: 0.85, delay: delay + 0.09 * idx, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Photo({
  src,
  alt = "",
  className,
  kenburns = false,
  priority = false,
  sizes = "(max-width: 768px) 80vw, 400px",
}: {
  src?: string;
  alt?: string;
  className?: string;
  kenburns?: boolean;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", kenburns && "kb", className)}
    />
  );
}

export function Phone({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto aspect-[9/18.5] w-full max-w-[260px] overflow-hidden rounded-[2.4rem] border-[6px] border-[oklch(0.3_0.012_250)] bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      <div className="absolute left-1/2 top-2 z-30 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
      {children}
    </div>
  );
}

export function useOnScreen(rootMargin = "0px"): [React.RefObject<any>, boolean] {
  const ref = useRef<any>(null);
  const [isOnScreen, setIsOnScreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsOnScreen(entry.isIntersecting),
      { rootMargin, threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, isOnScreen];
}

export function useLoopPhase(length: number, durations: number | number[], active = true): number {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!active) return;
    const duration =
      typeof durations === "number"
        ? durations
        : durations[phase] ?? 2000;
    const timer = setTimeout(() => {
      setPhase((p) => (p + 1) % length);
    }, duration);
    return () => clearTimeout(timer);
  }, [phase, active, length, durations]);

  return phase;
}
