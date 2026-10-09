"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Play,
  User,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Upload,
  LayoutDashboard,
} from "lucide-react";
import { useCreateSheet } from "./CreateSheetContext";
import { useAuth } from "@/context/AuthContext";
import { IMG } from "./data";
import ExperienceVisual from "./ExperienceVisual";

const TONES: Record<string, { text: string; button: string }> = {
  gold: { text: "text-primary", button: "bg-primary text-primary-foreground" },
  cherry: { text: "text-accent", button: "bg-accent text-accent-foreground" },
  ivory: { text: "text-white", button: "border border-white/70 text-white" },
  pumpkin: { text: "text-[#ff9e3b]", button: "bg-[#ff9e3b] text-[#220a2e]" },
  violet: { text: "text-[#d175f0]", button: "bg-[#d175f0] text-[#220a2e]" },
};

interface BaseCard {
  id: string;
  label: string;
}

interface PosterCard extends BaseCard {
  type: "poster";
  img: string;
  kicker: string;
  title: React.ReactNode;
  meta: string;
  cta: string;
  tone: keyof typeof TONES;
  video?: boolean;
  halloween?: boolean;
}

interface VideoCard extends BaseCard {
  type: "video";
  kind: string;
}

interface YoursCard extends BaseCard {
  type: "yours";
  img: string;
}

type CarouselCard = PosterCard | VideoCard | YoursCard;

const BASE_CARDS: (PosterCard | VideoCard)[] = [
  {
    type: "poster",
    id: "jessica",
    label: "Milestone birthday",
    img: IMG.jessica,
    kicker: "Jessica turns",
    title: <span className="gold-text block text-[38cqw] leading-[0.78]">40</span>,
    meta: "Sat · Nov 14 · The Roof, NYC",
    cta: "You're invited",
    tone: "gold",
  },
  {
    type: "video",
    id: "premiere",
    label: "Movie Premiere",
    kind: "premiere",
  },
  {
    type: "poster",
    id: "wedding",
    label: "Wedding",
    img: IMG.couple,
    kicker: "Together with their families",
    title: "Sofia & Daniel",
    meta: "June 21 · Lake Como",
    cta: "Reserve your seat",
    tone: "ivory",
  },
  {
    type: "poster",
    id: "haunting",
    label: "Halloween · Haunted house",
    img: IMG.halloweenHouse,
    kicker: "Halloween night",
    title: "The Haunting of Elm St",
    meta: "Oct 31 · Costumes required",
    cta: "Dare to RSVP",
    tone: "pumpkin",
    video: true,
    halloween: true,
  },
  {
    type: "video",
    id: "vhs",
    label: "Retro VHS",
    kind: "vhs",
  },
  {
    type: "poster",
    id: "grad",
    label: "Graduation",
    img: IMG.grad,
    kicker: "Class of 2026",
    title: "Maya graduates",
    meta: "Dinner after · 7 PM",
    cta: "Come celebrate",
    tone: "gold",
  },
  {
    type: "video",
    id: "news",
    label: "Breaking News",
    kind: "news",
  },
  {
    type: "poster",
    id: "monster-mash",
    label: "Halloween · Costume party",
    img: IMG.halloweenCostume,
    kicker: "Costume party",
    title: "Monster Mash",
    meta: "Fri · Oct 31 · 9 PM",
    cta: "I'm in",
    tone: "violet",
    halloween: true,
  },
  {
    type: "poster",
    id: "party",
    label: "House party",
    img: IMG.party,
    kicker: "Breaking",
    title: "Jay's 30th got out of hand",
    meta: "Friday 10 PM · Bring a friend",
    cta: "I'm in",
    tone: "cherry",
  },
  {
    type: "video",
    id: "redcarpet",
    label: "Red Carpet",
    kind: "redcarpet",
  },
  {
    type: "poster",
    id: "pumpkin-patch",
    label: "Halloween · Kids trick-or-treat",
    img: IMG.halloweenKids,
    kicker: "Trick or treat",
    title: "Pumpkin Patch Party",
    meta: "Sat · Oct 31 · 4 PM",
    cta: "Count us in",
    tone: "pumpkin",
    halloween: true,
  },
  {
    type: "poster",
    id: "anniversary",
    label: "Anniversary",
    img: IMG.anniversary,
    kicker: "Twenty-five years",
    title: "Mark & Elena",
    meta: "Sept 6 · Napa Valley",
    cta: "Celebrate with us",
    tone: "gold",
  },
  {
    type: "video",
    id: "golden",
    label: "Golden Milestone",
    kind: "golden",
  },
  {
    type: "poster",
    id: "baby",
    label: "Baby shower",
    img: IMG.baby,
    kicker: "Baby shower",
    title: "Oh baby!",
    meta: "Sun · May 4 · Garden brunch",
    cta: "RSVP",
    tone: "ivory",
  },
  {
    type: "video",
    id: "journey",
    label: "Memory Journey",
    kind: "journey",
  },
  {
    type: "poster",
    id: "concert",
    label: "Afterparty",
    img: IMG.concert,
    kicker: "Afterparty",
    title: "Front row",
    meta: "Doors 8 PM · Guest list only",
    cta: "Get on the list",
    tone: "cherry",
  },
  {
    type: "video",
    id: "editorial",
    label: "Editorial",
    kind: "editorial",
  },
  {
    type: "poster",
    id: "reunion",
    label: "Reunion",
    img: IMG.reunion,
    kicker: "Class of 2006",
    title: "20 years later",
    meta: "Aug 16 · Homecoming weekend",
    cta: "I'll be there",
    tone: "gold",
  },
  {
    type: "video",
    id: "then-now",
    label: "Then & Now",
    kind: "then-now",
  },
  {
    type: "video",
    id: "romantic",
    label: "Love Story",
    kind: "romantic",
  },
];

function wrap(delta: number, len: number) {
  return ((delta + len / 2) % len + len) % len - len / 2;
}

function VideoBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute left-[5%] top-[3.5%] z-10 flex items-center gap-[1.6cqw] rounded-full bg-black/55 py-[1.4cqw] pl-[2.2cqw] pr-[3cqw] text-[4cqw] font-semibold backdrop-blur-sm">
      <Play className="size-[4.4cqw] fill-current" aria-hidden="true" />
      {children}
    </span>
  );
}

function CardItem({ card, playing }: { card: CarouselCard; playing: boolean }) {
  const style = { "--play": playing ? "running" : "paused" } as React.CSSProperties;

  if (card.type === "video") {
    return (
      <div className="@container relative size-full overflow-hidden bg-black text-white" style={style}>
        <ExperienceVisual kind={card.kind} playing={playing} className="absolute inset-0" />
        <VideoBadge>{card.label}</VideoBadge>
      </div>
    );
  }

  if (card.type === "yours") {
    return (
      <div className="@container relative size-full overflow-hidden bg-black text-white" style={style}>
        <img
          src={card.img}
          alt="Your uploaded photo"
          className="kb absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30" />
        <div className="absolute inset-x-[7%] bottom-[6%] flex flex-col gap-[3cqw]">
          <p className="text-[4.2cqw] font-semibold uppercase tracking-[0.3em] text-primary">Your photo, alive</p>
          <p className="font-display text-[15cqw] font-bold uppercase leading-[0.9]">Your event here</p>
          <span className="flex h-[13cqw] items-center justify-center rounded-full bg-primary text-[5cqw] font-bold text-primary-foreground">
            Create it for real
          </span>
        </div>
      </div>
    );
  }

  const tone = TONES[card.tone] || TONES.gold;

  return (
    <div className="@container relative size-full overflow-hidden bg-black text-white" style={style}>
      <img
        src={card.img}
        alt=""
        className={`absolute inset-0 size-full object-cover ${card.video ? "kb" : ""} ${
          card.halloween ? "saturate-125 contrast-105" : ""
        }`}
      />
      {card.halloween && (
        <div
          className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(70%_50%_at_50%_85%,rgba(255,122,24,0.35),transparent)] mix-blend-screen motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/35" />
      {card.video && <VideoBadge>Video invite</VideoBadge>}
      <div className="absolute inset-x-[7%] bottom-[6%] flex flex-col gap-[2.6cqw]">
        <p className={`text-[3.8cqw] font-semibold uppercase tracking-[0.28em] ${tone.text}`}>{card.kicker}</p>
        <p className="font-display text-[14.5cqw] font-bold uppercase leading-[0.92] text-balance">{card.title}</p>
        <p className="text-[4.4cqw] text-white/80">{card.meta}</p>
        <span className={`mt-[1cqw] flex h-[12.5cqw] items-center justify-center rounded-full text-[4.8cqw] font-bold ${tone.button}`}>
          {card.cta}
        </span>
      </div>
    </div>
  );
}

function StepBadge({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`relative size-9 overflow-hidden rounded-lg ring-2 transition duration-300 ${
        active ? "scale-110 ring-primary opacity-100" : "opacity-60 ring-transparent"
      }`}
    >
      {children}
    </span>
  );
}

function PhotoStrip({ onPhoto }: { onPhoto: (url: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { open } = useCreateSheet();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prev) => (prev + 1) % 3);
    }, 1100);
    return () => clearInterval(timer);
  }, []);

  const steps = ["Photo", "Animation", "Invite"];

  return (
    <div className="glass flex max-w-xl flex-col gap-3 rounded-[1.75rem] p-3 sm:max-md:flex-row sm:max-md:items-center sm:max-md:justify-between sm:max-md:gap-4 sm:max-md:rounded-full sm:max-md:py-2.5 sm:max-md:pl-4 sm:max-md:pr-2.5 md:p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <StepBadge active={phase === 0}>
            <img src={IMG.childhood} alt="" className="size-full object-cover sepia-[0.4]" />
          </StepBadge>
          <ArrowRight className="size-3 text-muted-foreground" />
          <StepBadge active={phase === 1}>
            <span className="grid size-full place-items-center bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
          </StepBadge>
          <ArrowRight className="size-3 text-muted-foreground" />
          <StepBadge active={phase === 2}>
            <img src={IMG.jessica} alt="" className="size-full object-cover" />
          </StepBadge>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">Make one with your photo</p>
          <p className="text-xs text-muted-foreground">
            {steps.map((label, idx) => (
              <span key={label} className={`transition-colors ${idx === phase ? "text-primary" : ""}`}>
                {label}
                {idx < 2 && " → "}
              </span>
            ))}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Upload a photo to preview"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              onPhoto(url);
            }
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold !text-black text-black transition active:scale-[0.97] sm:max-md:flex-none cursor-pointer"
        >
          <Upload className="size-4 !text-black text-black" aria-hidden="true" />
          <span className="!text-black text-black">Upload Photo</span>
        </button>
        <button
          type="button"
          onClick={() => open("ai")}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-sm font-semibold transition hover:bg-white/10 active:scale-[0.97] sm:max-md:flex-none cursor-pointer"
        >
          <Sparkles className="size-4 text-primary" aria-hidden="true" /> Try with AI
        </button>
      </div>
    </div>
  );
}

function Carousel({ userPhoto }: { userPhoto?: string }) {
  const { open, openPreview } = useCreateSheet();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [cardWidth, setCardWidth] = useState(172);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const cards: CarouselCard[] = useMemo(() => {
    if (userPhoto) {
      return [{ type: "yours", id: "yours", label: "Your photo", img: userPhoto }, ...BASE_CARDS];
    }
    return BASE_CARDS;
  }, [userPhoto]);

  const spacing = cardWidth + 14;
  const cardHeight = Math.round(1.55 * cardWidth);
  const scaleRatio = cardWidth / 190;
  const desktopFactor = isDesktop ? 0.5 : 1;
  const containerHeight = isDesktop ? Math.round(2 * cardWidth + 12) : cardHeight + Math.round(96 * scaleRatio);

  const posRef = useRef(0);
  const inertiaRef = useRef(0);
  const pointerRef = useRef<{ x: number; distance: number; id: number } | null>(null);
  const didDragRef = useRef(false);
  const hoveredRef = useRef(false);
  const lastActiveRef = useRef(0);

  // Resize measurement observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const w = Math.min(250, Math.max(132, Math.round(0.36 * el.clientWidth)));
      if (window.innerWidth < 1024) {
        setIsDesktop(false);
        setCardWidth(w);
        return;
      }
      let top = 0;
      for (let p: HTMLElement | null = el; p; p = p.offsetParent as HTMLElement) {
        top += p.offsetTop;
      }
      const h = Math.floor((window.innerHeight - top - 64 - 12) / 2);
      setIsDesktop(true);
      setCardWidth(Math.max(116, Math.min(280, w + 30, h)));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const sec = el.closest("section");
    if (sec) ro.observe(sec);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Update card transform positions
  const applyTransform = useCallback(() => {
    const len = cards.length;
    for (let i = 0; i < len; i++) {
      const cardEl = cardRefs.current[i];
      if (!cardEl) continue;
      const dist = wrap(i - posRef.current, len);
      const clamped = Math.min(Math.abs(dist), 4.5);
      const rotate = Math.sign(dist) * clamped * 5.5;
      const translateY = clamped * clamped * 7 * scaleRatio * desktopFactor;
      const cardScale = 1 + 0.12 * Math.max(0, 1 - Math.abs(dist));
      cardEl.style.transform = `translate3d(${dist * spacing}px, ${translateY}px, 0) rotate(${rotate}deg) scale(${cardScale})`;
      cardEl.style.zIndex = String(Math.round(100 - 10 * Math.abs(dist)));
    }
    const currentActive = ((Math.round(posRef.current) % len) + len) % len;
    if (currentActive !== lastActiveRef.current) {
      lastActiveRef.current = currentActive;
      setActiveIndex(currentActive);
    }
  }, [cards.length, desktopFactor, scaleRatio, spacing]);

  // Continuous animation frame loop with inertia & auto-drift
  useEffect(() => {
    let lastTime = 0;
    let rafId: number;

    const onFrame = (time: number) => {
      if (!lastTime) lastTime = time;
      const delta = Math.min(time - lastTime, 64);
      lastTime = time;

      if (inertiaRef.current !== 0) {
        const step = inertiaRef.current * (1 - Math.exp(-delta / 150));
        inertiaRef.current -= step;
        posRef.current += step;
        if (Math.abs(inertiaRef.current) < 0.002) {
          posRef.current += inertiaRef.current;
          inertiaRef.current = 0;
        }
      } else if (!pointerRef.current) {
        // Continuous smooth auto-scroll drift
        const speed = 0.16 * (hoveredRef.current ? 0.3 : 1);
        posRef.current += (speed * delta) / 1000;
      }

      applyTransform();
      rafId = requestAnimationFrame(onFrame);
    };

    rafId = requestAnimationFrame(onFrame);
    return () => cancelAnimationFrame(rafId);
  }, [applyTransform]);

  // When user photo changes, smoothly scroll to index 0
  useEffect(() => {
    if (!userPhoto) return;
    const t = cards.length;
    posRef.current = ((posRef.current % t) + t) % t;
    inertiaRef.current = wrap(0 - posRef.current, t);
  }, [userPhoto, cards.length]);

  const step = (dir: number) => {
    const target = Math.round(posRef.current + inertiaRef.current + dir);
    inertiaRef.current = target - posRef.current;
  };

  const onPointerUp = () => {
    pointerRef.current = null;
  };

  const handleCardClick = (card: CarouselCard) => {
    if (card.type === "yours") {
      open("photos", { photo: card.img });
    } else {
      openPreview(card.id);
    }
  };

  const activeCard = cards[activeIndex] ?? cards[0];

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Example invitations"
      className="relative"
    >
      {/* Cards Stage */}
      <div
        ref={containerRef}
        className="relative w-full cursor-grab touch-pan-y select-none overflow-x-clip active:cursor-grabbing [&_img]:pointer-events-none"
        style={{ height: containerHeight }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          pointerRef.current = { x: e.clientX, distance: 0, id: e.pointerId };
          didDragRef.current = false;
          inertiaRef.current = 0;
        }}
        onPointerMove={(e) => {
          const ptr = pointerRef.current;
          if (!ptr) return;
          const delta = e.clientX - ptr.x;
          ptr.x = e.clientX;
          ptr.distance += Math.abs(delta);
          if (ptr.distance > 6 && !didDragRef.current) {
            didDragRef.current = true;
            e.currentTarget.setPointerCapture(ptr.id);
          }
          if (didDragRef.current) {
            posRef.current -= delta / spacing;
            applyTransform();
          }
        }}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") hoveredRef.current = true;
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") hoveredRef.current = false;
          onPointerUp();
        }}
        onClickCapture={(e) => {
          if (didDragRef.current) {
            e.stopPropagation();
            e.preventDefault();
            didDragRef.current = false;
          }
        }}
      >
        {cards.map((card, idx) => (
          <div
            key={card.id}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            className="absolute left-1/2 top-4 will-change-transform sm:top-8 lg:top-3"
            style={{
              width: cardWidth,
              height: cardHeight,
              marginLeft: -cardWidth / 2,
            }}
          >
            <button
              type="button"
              tabIndex={-1}
              aria-label={`Start with the ${card.label} invitation`}
              onClick={() => handleCardClick(card)}
              className="block size-full rounded-[1.7rem] bg-foreground p-[5px] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)] transition-transform active:scale-[0.98] cursor-pointer"
            >
              <span className="block size-full overflow-hidden rounded-[1.3rem]">
                <CardItem card={card} playing={true} />
              </span>
            </button>
          </div>
        ))}

        {/* Gradient edge masks */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[200] w-8 bg-gradient-to-r from-background to-transparent sm:w-24"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[200] w-8 bg-gradient-to-l from-background to-transparent sm:w-24"
          aria-hidden="true"
        />
      </div>

      {/* Prev / Next controls & active label */}
      <div className="mt-1 flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Previous invitation"
          onClick={() => step(-1)}
          className="grid size-11 place-items-center rounded-full border border-foreground/15 bg-foreground/5 transition-colors hover:border-primary hover:text-primary active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <p className="w-52 truncate text-center text-sm font-semibold text-foreground/80" aria-live="off">
          {activeCard?.label}
        </p>
        <button
          type="button"
          aria-label="Next invitation"
          onClick={() => step(1)}
          className="grid size-11 place-items-center rounded-full border border-foreground/15 bg-foreground/5 transition-colors hover:border-primary hover:text-primary active:scale-95 cursor-pointer"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default function Hero() {
  const { open } = useCreateSheet();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | undefined>();

  useEffect(() => {
    setMounted(true);
    return () => {
      if (userPhoto) URL.revokeObjectURL(userPhoto);
    };
  }, [userPhoto]);

  const dashboardHref =
    user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard";

  return (
    <section id="top" className="relative isolate overflow-hidden pt-16">
      {/* Background radial gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_0%,rgba(254,186,8,0.18),transparent)]"
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-3 pt-5 text-center sm:px-6 sm:pb-6 sm:pt-8 md:pt-12 lg:pb-2 lg:pt-6">
        {/* Experience Selector: Individual vs Pros */}
        <nav
          aria-label="Choose your experience"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm"
        >
          <Link
            href="/"
            aria-current="page"
            className="flex h-11 min-w-[7.25rem] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors bg-primary text-primary-foreground"
          >
            <User className="size-4" aria-hidden="true" />
            Individual
          </Link>
          <Link
            href="/pro"
            className="flex h-11 min-w-[7.25rem] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors text-foreground/70 hover:text-foreground"
          >
            <Briefcase className="size-4" aria-hidden="true" />
            Pros
          </Link>
        </nav>

        {mounted && user && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            <span>
              Welcome back, {user.name || user.email?.split("@")[0]}
            </span>
          </div>
        )}

        <p className="mt-3 text-xs font-medium tracking-wide text-foreground/70 sm:mt-5 sm:text-base lg:mt-3 lg:text-sm">
          Boring static invitation days are gone
        </p>

        <h1 className="font-display font-extrabold tracking-tight mt-2 text-balance text-[2.15rem] leading-[1.05] sm:mt-3 sm:text-6xl lg:mt-2 lg:text-[clamp(2.5rem,7.5vh,4.5rem)]">
          <span className="block pb-[0.08em]">
            <span>Create Unforgettable</span>
          </span>
          <span className="block pb-[0.08em]">
            <span className="text-primary">Video Invitations with AI</span>
          </span>
        </h1>

        <p className="mt-3 max-w-2xl text-pretty text-sm leading-snug text-foreground/75 sm:mt-4 sm:text-lg sm:leading-relaxed lg:mt-3 lg:text-base">
          Create invitations from an idea, a photo, a video, or your own design. Eventizers brings
          them to life, then helps you manage everything that comes after.
        </p>

        <div className="mt-4 flex w-full flex-col items-stretch gap-2 sm:mt-6 sm:w-auto sm:flex-row sm:items-center sm:gap-3 lg:mt-4">
          <button
            type="button"
            onClick={() => open("ai")}
            className="inline-flex min-w-11 select-none items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition active:scale-[0.97] bg-primary text-primary-foreground hover:brightness-110 h-12 px-8 text-base sm:h-14 lg:h-12 shadow-lg cursor-pointer"
          >
            Create Your Event
          </button>
          {mounted && user ? (
            <Link
              href={dashboardHref}
              className="inline-flex min-w-11 select-none items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition active:scale-[0.97] border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 h-12 px-7 text-base sm:h-14 lg:h-12 shadow"
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <a
              href="#video"
              className="inline-flex min-w-11 select-none items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition active:scale-[0.97] glass text-foreground hover:bg-white/15 h-12 px-7 text-base sm:h-14 lg:h-12"
            >
              See Video Invites
            </a>
          )}
        </div>

        <p className="mt-2 text-xs text-muted-foreground sm:mt-3 lg:mt-2">
          Your first event is free. No app required.
        </p>
      </div>

      {/* Interactive Arc Carousel with Physics and Auto-Drift */}
      <Carousel userPhoto={userPhoto} />

      {/* Make one with your photo bar */}
      <div className="mx-auto w-full max-w-xl px-4 pb-12 pt-4 sm:px-6">
        <PhotoStrip onPhoto={setUserPhoto} />
      </div>
    </section>
  );
}
