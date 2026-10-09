"use client";

import React from "react";
import { IMG } from "./data";

interface ExperienceVisualProps {
  kind?: string;
  playing?: boolean;
  className?: string;
}

export default function ExperienceVisual({
  kind = "premiere",
  playing = true,
  className = "",
}: ExperienceVisualProps) {
  const style = { "--play": playing ? "running" : "paused" } as React.CSSProperties;

  return (
    <div
      className={`@container relative size-full overflow-hidden bg-black text-white ${className}`}
      style={style}
    >
      <VisualContent kind={kind} />
    </div>
  );
}

function VisualContent({ kind }: { kind: string }) {
  switch (kind) {
    case "then-now":
      return <ThenNowVisual />;
    case "premiere":
      return <PremiereVisual />;
    case "vhs":
      return <VhsVisual />;
    case "news":
      return <NewsVisual />;
    case "journey":
      return <JourneyVisual />;
    case "redcarpet":
      return <RedCarpetVisual />;
    case "golden":
      return <GoldenVisual />;
    case "editorial":
      return <EditorialVisual />;
    case "romantic":
      return <RomanticVisual />;
    case "luxury":
      return <LuxuryVisual />;
    case "surprise":
      return <SurpriseVisual />;
    case "meme":
      return <MemeVisual />;
    default:
      return <PremiereVisual />;
  }
}

function BackdropOverlay({ className = "" }: { className?: string }) {
  return <div className={`absolute inset-0 ${className}`} aria-hidden="true" />;
}

/* 1. Then & Now */
function ThenNowVisual() {
  return (
    <>
      <img
        src={IMG.childhood}
        alt=""
        className="kb absolute inset-0 size-full object-cover sepia-[0.5] saturate-[0.8]"
      />
      <div className="wipe absolute inset-0">
        <img src={IMG.jessica} alt="" className="kb absolute inset-0 size-full object-cover" />
      </div>
      <div className="wipe-line absolute inset-y-0 w-0.5 bg-primary shadow-[0_0_20px_var(--primary)]" />
      <BackdropOverlay className="bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      <p className="absolute bottom-[7cqw] left-[7cqw] font-display text-[9cqw] font-extrabold uppercase leading-none">
        1987
        <span className="block text-[3.6cqw] font-medium tracking-[0.2em] text-white/70">
          Jessica, age 5
        </span>
      </p>
      <p className="absolute bottom-[7cqw] right-[7cqw] text-right font-display text-[9cqw] font-extrabold uppercase leading-none text-primary">
        Now
        <span className="block text-[3.6cqw] font-medium tracking-[0.2em] text-white/70">
          Turning 40
        </span>
      </p>
    </>
  );
}

/* 2. Movie Premiere */
function PremiereVisual() {
  return (
    <>
      <img src={IMG.rooftop} alt="" className="kb absolute inset-0 size-full object-cover" />
      <BackdropOverlay className="bg-black/35" />
      <div className="absolute inset-x-0 top-0 h-[13cqw] bg-black" />
      <div className="absolute inset-x-0 bottom-0 h-[13cqw] bg-black" />
      <div className="absolute inset-0 grid place-items-center px-[8cqw] text-center">
        <p className="seq-a absolute text-[4cqw] font-semibold uppercase tracking-[0.35em] text-white/80">
          This November
        </p>
        <p className="seq-b absolute font-display text-[13cqw] font-extrabold uppercase leading-[0.9] tracking-tight">
          Jessica<span className="block text-primary">Turns 40</span>
        </p>
        <p className="seq-c absolute text-[4.4cqw] font-semibold uppercase tracking-[0.3em] text-primary">
          One night only
        </p>
      </div>
    </>
  );
}

/* 3. Retro VHS */
function VhsVisual() {
  return (
    <div className="scanlines absolute inset-0">
      <div className="jitter absolute inset-0">
        <img
          src={IMG.party}
          alt=""
          className="kb absolute inset-0 size-full object-cover contrast-125 saturate-150 [filter:hue-rotate(-8deg)]"
        />
      </div>
      <BackdropOverlay className="bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      <p className="absolute left-[5cqw] top-[6cqw] font-mono text-[5cqw] font-bold tracking-widest">
        PLAY ▶
      </p>
      <p className="absolute right-[5cqw] top-[6cqw] flex items-center gap-[1.5cqw] font-mono text-[5cqw] font-bold text-accent">
        <span className="blink size-[2.4cqw] rounded-full bg-accent" /> REC
      </p>
      <p
        className="absolute inset-x-[5cqw] bottom-[17cqw] font-display text-[14cqw] font-extrabold uppercase leading-[0.9]"
        style={{
          textShadow: "0.6cqw 0 #ff3a5d, -0.6cqw 0 #38bdf8",
        }}
      >
        Jay&apos;s
        <br />
        30th
      </p>
      <p className="absolute bottom-[6cqw] left-[5cqw] font-mono text-[4.6cqw] tracking-widest text-primary">
        NOV 14 1998 &nbsp; 08:14 PM
      </p>
    </div>
  );
}

/* 4. Breaking News */
function NewsVisual() {
  return (
    <>
      <img src={IMG.marcus} alt="" className="kb absolute inset-0 size-full object-cover" />
      <BackdropOverlay className="bg-gradient-to-t from-black/85 via-transparent to-black/40" />
      <div className="absolute left-[5cqw] top-[6cqw] flex items-center gap-[2cqw] rounded-sm bg-accent px-[2.6cqw] py-[1cqw] text-[3.2cqw] font-bold uppercase tracking-wider">
        <span className="blink size-[2cqw] rounded-full bg-white" />
        Live
      </div>
      <div className="absolute inset-x-0 bottom-[11cqw]">
        <p className="ml-[5cqw] inline-block bg-accent px-[3cqw] py-[1cqw] text-[4cqw] font-extrabold uppercase tracking-wide">
          Breaking
        </p>
        <p className="bg-white px-[5cqw] py-[3cqw] font-display text-[8.4cqw] font-extrabold uppercase leading-[0.95] text-[#12181d]">
          Marcus is turning 50
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-[9cqw] items-center overflow-hidden bg-[#12181d]">
        <div className="marquee flex w-max whitespace-nowrap text-[3.6cqw] font-semibold uppercase tracking-widest text-primary">
          <span className="px-[3cqw]">
            Sources confirm: dinner, dancing, zero speeches &nbsp;•&nbsp; Friday 8pm &nbsp;•&nbsp; Guests urged to RSVP &nbsp;•&nbsp; Cake: unconfirmed &nbsp;•&nbsp;
          </span>
          <span className="px-[3cqw]">
            Sources confirm: dinner, dancing, zero speeches &nbsp;•&nbsp; Friday 8pm &nbsp;•&nbsp; Guests urged to RSVP &nbsp;•&nbsp; Cake: unconfirmed &nbsp;•&nbsp;
          </span>
        </div>
      </div>
    </>
  );
}

/* 5. Memory Journey */
function JourneyVisual() {
  return (
    <>
      <div className="fade4 absolute inset-0" style={{ animationDelay: "0s" }}>
        <img src={IMG.oldBeach} alt="" className="kb absolute inset-0 size-full object-cover" />
        <BackdropOverlay className="bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <p className="absolute bottom-[10cqw] left-[7cqw] font-display text-[20cqw] font-extrabold leading-none tracking-tight">
          1986
        </p>
      </div>
      <div className="fade4 absolute inset-0" style={{ animationDelay: "3s" }}>
        <img src={IMG.oldBike} alt="" className="kb absolute inset-0 size-full object-cover" />
        <BackdropOverlay className="bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <p className="absolute bottom-[10cqw] left-[7cqw] font-display text-[20cqw] font-extrabold leading-none tracking-tight">
          1994
        </p>
      </div>
      <div className="fade4 absolute inset-0" style={{ animationDelay: "6s" }}>
        <img src={IMG.childhood} alt="" className="kb absolute inset-0 size-full object-cover" />
        <BackdropOverlay className="bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <p className="absolute bottom-[10cqw] left-[7cqw] font-display text-[20cqw] font-extrabold leading-none tracking-tight">
          2003
        </p>
      </div>
      <div className="fade4 absolute inset-0" style={{ animationDelay: "9s" }}>
        <img src={IMG.jessica} alt="" className="kb absolute inset-0 size-full object-cover" />
        <BackdropOverlay className="bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <p className="absolute bottom-[10cqw] left-[7cqw] font-display text-[20cqw] font-extrabold leading-none tracking-tight">
          Today
        </p>
      </div>
      <div className="absolute inset-x-[7cqw] bottom-[6cqw] flex gap-[1.5cqw]">
        {[0, 3, 6, 9].map((delay, idx) => (
          <span key={idx} className="h-[1cqw] flex-1 overflow-hidden rounded-full bg-white/25">
            <span
              className="fade4 block size-full bg-primary"
              style={{ animationDelay: `${delay}s` }}
            />
          </span>
        ))}
      </div>
    </>
  );
}

/* 6. Red Carpet */
function RedCarpetVisual() {
  return (
    <>
      <img src={IMG.jessica} alt="" className="kb absolute inset-0 size-full object-cover" />
      <BackdropOverlay className="bg-gradient-to-t from-[#60121e]/90 via-transparent to-black/50" />
      <div className="flash absolute inset-0 bg-white" style={{ animationDelay: "0s" }} />
      <div className="flash absolute inset-0 bg-white" style={{ animationDelay: "1.1s" }} />
      <div className="flash absolute inset-0 bg-white" style={{ animationDelay: "2.1s" }} />
      <p className="absolute inset-x-0 top-[7cqw] text-center text-[3.6cqw] font-semibold uppercase tracking-[0.5em] text-primary">
        World premiere
      </p>
      <p className="absolute inset-x-0 bottom-[12cqw] text-center font-display text-[12cqw] font-extrabold uppercase leading-[0.9]">
        Jessica
        <span className="block text-[5cqw] font-medium tracking-[0.4em] text-white/80">
          Arrives at 8
        </span>
      </p>
    </>
  );
}

/* 7. Golden Milestone */
function GoldenVisual() {
  return (
    <>
      <img
        src={IMG.couple}
        alt=""
        className="kb absolute inset-0 size-full object-cover brightness-[0.55]"
      />
      <BackdropOverlay className="bg-gradient-to-b from-black/40 to-black/80" />
      {[
        { left: "12%", delay: "0s" },
        { left: "28%", delay: "0.9s" },
        { left: "46%", delay: "1.8s" },
        { left: "64%", delay: "2.7s" },
        { left: "80%", delay: "3.6s" },
      ].map((pos, idx) => (
        <span
          key={idx}
          className="rise absolute bottom-[10cqw] size-[1.6cqw] rounded-full bg-primary"
          style={{ left: pos.left, animationDelay: pos.delay }}
        />
      ))}
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="gold-text font-display text-[46cqw] font-extrabold leading-[0.8]">25</p>
          <p className="mt-[4cqw] text-[4.2cqw] font-medium uppercase tracking-[0.45em] text-primary">
            Golden years
          </p>
          <p className="mt-[1.5cqw] text-[3.4cqw] uppercase tracking-[0.3em] text-white/70">
            Daniel &amp; Maya
          </p>
        </div>
      </div>
    </>
  );
}

/* 8. Editorial */
function EditorialVisual() {
  return (
    <>
      <img
        src={IMG.grad}
        alt=""
        className="kb absolute inset-0 size-full object-cover grayscale-[0.2]"
      />
      <BackdropOverlay className="bg-gradient-to-b from-black/50 via-transparent to-black/70" />
      <p className="absolute inset-x-0 top-[3cqw] text-center font-display text-[30cqw] font-extrabold uppercase leading-[0.85] tracking-[-0.04em] mix-blend-difference">
        Maya
      </p>
      <div className="absolute bottom-[8cqw] left-[6cqw] max-w-[60%] text-[4.2cqw] font-medium uppercase leading-snug tracking-wider">
        <p className="text-primary">The Class of ‘26 Issue</p>
        <p className="mt-[1cqw]">The cap toss of the year</p>
        <p className="mt-[1cqw] text-white/70">Dinner, 7pm. Dress: proud.</p>
      </div>
    </>
  );
}

/* 9. Romantic Film */
function RomanticVisual() {
  return (
    <>
      <img
        src={IMG.couple}
        alt=""
        className="kb absolute inset-0 size-full object-cover saturate-110"
      />
      <BackdropOverlay className="bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
      <div className="absolute inset-x-[7%] bottom-[8%] flex flex-col gap-[2cqw]">
        <p className="text-[3.8cqw] font-semibold uppercase tracking-[0.3em] text-white/80">
          The Wedding Celebration
        </p>
        <p className="font-display text-[14cqw] font-bold leading-tight">Sofia &amp; Daniel</p>
        <p className="text-[4.2cqw] text-white/70">Villa Balbiano, Lake Como</p>
      </div>
    </>
  );
}

/* 10. Luxury Envelope */
function LuxuryVisual() {
  return (
    <>
      <img src={IMG.anniversary} alt="" className="kb absolute inset-0 size-full object-cover" />
      <BackdropOverlay className="bg-gradient-to-t from-black/90 via-black/30 to-black/50" />
      <div className="absolute inset-x-[8%] bottom-[8%] rounded-2xl border border-white/20 bg-black/40 p-[5cqw] backdrop-blur-md">
        <p className="text-[3.5cqw] font-semibold uppercase tracking-[0.3em] text-primary">
          Cordially Invited
        </p>
        <p className="mt-[1cqw] font-display text-[11cqw] font-bold">Silver Jubilee</p>
        <p className="text-[4cqw] text-white/80">Mark &amp; Elena · September 6</p>
      </div>
    </>
  );
}

/* 11. Surprise */
function SurpriseVisual() {
  return (
    <>
      <img
        src={IMG.concert}
        alt=""
        className="kb absolute inset-0 size-full object-cover contrast-125"
      />
      <BackdropOverlay className="bg-gradient-to-t from-black/90 via-black/10 to-black/30" />
      <div className="absolute inset-0 grid place-items-center p-4 text-center">
        <p className="rounded-full bg-accent px-[4cqw] py-[1.5cqw] text-[4cqw] font-extrabold uppercase tracking-widest text-white">
          VIP Surprise
        </p>
        <p className="font-display text-[15cqw] font-extrabold uppercase leading-none text-primary">
          Front Row
        </p>
        <p className="text-[4.2cqw] font-semibold uppercase tracking-wider text-white/90">
          Doors open 8 PM
        </p>
      </div>
    </>
  );
}

/* 12. Meme Energy */
function MemeVisual() {
  return (
    <>
      <img src={IMG.party} alt="" className="kb absolute inset-0 size-full object-cover" />
      <div className="absolute inset-x-0 top-[6cqw] px-[4cqw] text-center font-display text-[9cqw] font-black uppercase text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
        ME CELEBRATING AGAIN
      </div>
      <div className="absolute inset-x-0 bottom-[6cqw] px-[4cqw] text-center font-display text-[9cqw] font-black uppercase text-primary drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
        RSVP BEFORE IT LEAKS
      </div>
    </>
  );
}
