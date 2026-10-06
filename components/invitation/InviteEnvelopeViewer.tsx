"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CalendarPlus,
  Check,
  CheckCircle,
  Clock,
  MapPin,
  RefreshCw,
  Send,
  Share2,
  Sparkles,
  XCircle,
} from "lucide-react";
import invitationService from "@/services/invitationService";
import InteractiveCard from "@/components/invitation/InteractiveCard";
import {
  resolveCardAspectRatio,
  resolveCardBackground,
  resolveCardDecorations,
  resolveCardImageSrc,
  resolveCardLayers,
} from "@/components/invitation/invitationCardArtwork";

// =============================================================================
// EVITE-STYLE ANIMATED ENVELOPE UNBOXING VIEWER
// Phase 1 — Delivery : closed envelope front (guest name + postage stamp)
// Phase 2 — Flip     : smooth 3D rotateY to the envelope back / flap seam
// Phase 3 — Opening  : flap folds open (rotateX) revealing the interior liner
// Phase 4 — Unboxing : canvas card slides up out of the envelope + scales
// Phase 5 — Details  : title, date, time and RSVP / action buttons
// =============================================================================

type Phase = "delivery" | "flip" | "open" | "unbox" | "details";

const PHASES: Phase[] = ["delivery", "flip", "open", "unbox", "details"];

const DURATION = {
  delivery: 2200,
  flip: 950,
  open: 950,
  unbox: 1500,
};

function parseMaybeJson(value: unknown): any {
  if (value == null) return null;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
}

const GOLD_LINER =
  "linear-gradient(135deg, #8E6516 0%, #C99E32 15%, #F5D77F 30%, #FFF4B8 45%, #D4AF37 60%, #A67C1E 75%, #FBE58D 88%, #7C530B 100%)";

function resolveLiner(raw: unknown): string {
  let liner = typeof raw === "string" ? raw.trim() : "";
  if (!liner || liner === "none") return GOLD_LINER;

  if (
    liner === "#D4AF37" ||
    /gold/i.test(liner) ||
    liner === "metallic-gold"
  ) {
    return GOLD_LINER;
  }
  if (liner.startsWith("url(")) return liner;
  if (liner.includes("gradient(")) return liner;
  if (liner.startsWith("/") || liner.startsWith("http")) {
    return `url('${liner}') center / cover no-repeat`;
  }
  if (/\.(png|jpe?g|svg|webp)($|\?)/i.test(liner)) {
    return `url('${liner}') center / cover no-repeat`;
  }
  return liner;
}

function resolveBackdrop(
  canvasState: unknown,
  fallbackColor: string,
  stageBackdrop?: unknown
) {
  const cs = parseMaybeJson(canvasState);
  const bd =
    parseMaybeJson(stageBackdrop) ??
    stageBackdrop ??
    parseMaybeJson(cs?.stageBackdrop) ??
    cs?.stageBackdrop;
  const value = typeof bd === "string" ? bd : bd?.value;

  if (typeof value === "string" && value.trim()) {
    const v = value.trim();
    if (v.startsWith("url(")) return { image: v, color: fallbackColor };
    if (v.includes("gradient(")) return { image: v, color: fallbackColor };
    if (/^#[0-9a-f]{3,8}$/i.test(v) || /^rgb/i.test(v)) {
      return { image: null, color: v };
    }
    if (/\.(png|jpe?g|svg|webp)($|\?)/i.test(v)) {
      return { image: `url('${v}')`, color: fallbackColor };
    }
  }
  return { image: "url('/assets/backdrops/off-white-linen.svg')", color: fallbackColor };
}

interface EnvelopeDesign {
  color: string;
  flapColor: string;
  liner: string;
  stamp: string | null;
  sticker: string | null;
}

function resolveEnvelope(canvasState: unknown, invitationEnvelope?: unknown): EnvelopeDesign {
  const cs = parseMaybeJson(canvasState);
  const directRaw = parseMaybeJson(invitationEnvelope);
  const direct = directRaw && typeof directRaw === "object" ? directRaw : {};
  const env = { ...(parseMaybeJson(cs?.envelope) ?? {}), ...(direct ?? {}) };
  const color = env.outerColor || env.color || "#8C5A32";
  const flapColor = env.flapColor || env.outerColor || env.color || color;
  const liner = resolveLiner(env.linerCss || env.innerLiner || env.liner || env.linerColor);
  return {
    color,
    flapColor,
    liner,
    stamp: env.stamp || env.stampEmoji || null,
    sticker: env.sticker || env.stickerEmoji || null,
  };
}

const STAMP_EMOJI: Record<string, string> = {
  "blush-floral": "🌸",
  "pink-roses": "🌹",
  "red-rose": "🥀",
  "sweet-heart": "❤️",
  "party-neon": "🎉",
  "holiday-ornament": "✨",
  cherries: "🍒",
  strawberry: "🍓",
  "moon-stars": "🌙",
  celebrate: "🥂",
  "olive-branch": "🌿",
  "sparkle-magic": "⭐",
  "birthday-cake": "🎂",
  "vintage-airmail": "✈️",
  airmail: "✈️",
  rose: "🌹",
  wax: "⚜️",
  cake: "🎂",
};

const PETALS = [
  { left: "6%", top: "14%", size: 16, delay: 0, rotate: 20 },
  { left: "88%", top: "22%", size: 13, delay: 0.6, rotate: -30 },
  { left: "16%", top: "66%", size: 11, delay: 1.1, rotate: 45 },
  { left: "78%", top: "72%", size: 15, delay: 0.3, rotate: -15 },
  { left: "46%", top: "6%", size: 10, delay: 1.4, rotate: 12 },
  { left: "92%", top: "48%", size: 12, delay: 0.9, rotate: 60 },
  { left: "4%", top: "40%", size: 14, delay: 1.7, rotate: -45 },
  { left: "62%", top: "88%", size: 12, delay: 0.5, rotate: 30 },
];

// Crossfading layers that sit on top of the flap so the exterior paper can
// dissolve into the interior liner while the flap is edge-on to the viewer.
function FlapOverlays({
  envelope,
  revealed,
}: {
  envelope: EnvelopeDesign;
  revealed: boolean;
}) {
  const t = "opacity 280ms ease";
  return (
    <>
      <span
        aria-hidden
        className="absolute inset-0 block"
        style={{
          background: envelope.liner,
          backgroundColor: "#D4AF37",
          opacity: revealed ? 1 : 0,
          transition: t,
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 block"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 55%, rgba(0,0,0,0.22) 100%)",
          opacity: revealed ? 0 : 1,
          transition: t,
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 block"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 45%, rgba(0,0,0,0.14) 100%)",
          opacity: revealed ? 1 : 0,
          transition: t,
        }}
      />
    </>
  );
}

// The lower folded-back seams of the envelope. Rendered identically in the
// flipping envelope's back face and in the opened envelope stack so the layer
// swap in phase 2 → 3 is pixel-identical.
function BottomFolds({ color }: { color: string }) {
  return (
    <div
      className="absolute left-0 right-0 overflow-hidden"
      style={{
        top: "64%",
        bottom: 0,
        borderRadius: "0 0 12px 12px",
        background: color,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(45deg, rgba(0,0,0,0.16) 0%, transparent 42%), linear-gradient(-45deg, rgba(0,0,0,0.16) 0%, transparent 42%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: 4, background: "linear-gradient(to bottom, rgba(0,0,0,0.42), transparent)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, rgba(255,255,255,0.10) 0%, transparent 45%, rgba(0,0,0,0.16) 100%)",
        }}
      />
    </div>
  );
}

export interface InviteEnvelopeViewerProps {
  invitationId: string;
  initialData?: { invitation: any; event: any } | null;
  guestName?: string;
  guestMode?: boolean;
}

export default function InviteEnvelopeViewer({
  invitationId,
  initialData = null,
  guestName = "",
  guestMode = false,
}: InviteEnvelopeViewerProps) {
  const prefersReducedMotion = useReducedMotion();

  const [invitation, setInvitation] = useState<any>(initialData?.invitation ?? null);
  const [eventData, setEventData] = useState<any>(initialData?.event ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("delivery");
  const [started, setStarted] = useState(false);
  const [flapRevealed, setFlapRevealed] = useState(false);
  const [flapSettled, setFlapSettled] = useState(false);
  const [envelopeGone, setEnvelopeGone] = useState(false);

  const [cardAspect, setCardAspect] = useState<number | null>(null);
  const [cardImgFailed, setCardImgFailed] = useState(false);
  const [viewportW, setViewportW] = useState(0);

  const [copied, setCopied] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<"confirmed" | "declined" | "maybe">("confirmed");
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  const timersRef = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);
  const addTimer = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);
  const scheduledRef = useRef(false);

  // ── Data (only when the server component could not prerender it) ──────────
  useEffect(() => {
    if (initialData || !invitationId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await invitationService.getPublicInvitation(invitationId);
        if (cancelled) return;
        if (res?.success && res.invitation) {
          setInvitation(res.invitation);
          setEventData(res.event);
        } else {
          setError(res?.error || "Invitation not found.");
        }
      } catch (err: any) {
        if (!cancelled) setError("Unable to load this invitation. Please check the link.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [invitationId, initialData]);

  // ── Viewport width (responsive geometry) ─────────────────────────────────
  useEffect(() => {
    const update = () => setViewportW(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── Timeline ─────────────────────────────────────────────────────────────
  const runTimeline = useCallback(() => {
    clearTimers();
    setStarted(true);
    setPhase("flip");
    const t1 = DURATION.flip;
    const t2 = t1 + DURATION.open;
    // t1 — the flip lands on the envelope back
    addTimer(() => setPhase("open"), t1);
    // midpoint of the fold: the flap is edge-on, swap exterior → liner
    addTimer(() => setFlapRevealed(true), t1 + Math.round(DURATION.open / 2));
    // t2 — flap fully open, let it settle behind the body and lift the card
    addTimer(() => {
      setFlapSettled(true);
      setPhase("unbox");
    }, t2);
    addTimer(() => setEnvelopeGone(true), t2 + Math.round(DURATION.unbox * 0.45));
    addTimer(() => setPhase("details"), t2 + DURATION.unbox);
  }, [addTimer, clearTimers]);

  const skipToDetails = useCallback(() => {
    clearTimers();
    scheduledRef.current = true;
    setStarted(true);
    setFlapRevealed(true);
    setFlapSettled(true);
    setEnvelopeGone(true);
    setPhase("details");
  }, [clearTimers]);

  // Auto-start the delivery phase once. `scheduledRef` guards against the
  // effect re-running (e.g. `useReducedMotion` resolving null → false) and
  // queueing a duplicate timer. Timers live in `timersRef` so `clearTimers`
  // (tap / replay / unmount) always cancels them.
  useEffect(() => {
    if (prefersReducedMotion) {
      skipToDetails();
      return;
    }
    if (phase !== "delivery" || started || scheduledRef.current) return;
    scheduledRef.current = true;
    addTimer(() => runTimeline(), DURATION.delivery);
  }, [phase, started, prefersReducedMotion, addTimer, runTimeline, skipToDetails]);

  const replay = useCallback(() => {
    clearTimers();
    scheduledRef.current = false;
    setFlapRevealed(false);
    setFlapSettled(false);
    setEnvelopeGone(false);
    setPhase("delivery");
    setStarted(false);
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  // ── Card artwork (background + live layers + static fallback) ─────────────
  const cardLayers = useMemo(() => resolveCardLayers(invitation, eventData), [invitation, eventData]);
  const cardBackground = useMemo(
    () => resolveCardBackground(invitation, eventData),
    [invitation, eventData]
  );
  const cardDecorations = useMemo(
    () =>
      resolveCardDecorations(
        invitation,
        eventData,
        cardBackground.type === "image" ? cardBackground.value : undefined
      ),
    [invitation, eventData, cardBackground]
  );
  const resolvedCardRatio = useMemo(
    () => resolveCardAspectRatio(invitation, eventData),
    [invitation, eventData]
  );
  const cardImageSrc = useMemo(
    () => resolveCardImageSrc(invitation, eventData),
    [invitation, eventData]
  );
  // Live canvas layers win over the flattened snapshot: the studio persists
  // `previewUrl` as a clean background image, so the static image alone would
  // render a card with no text at all.
  const layeredCard = cardLayers.length > 0;

  // ── Geometry ─────────────────────────────────────────────────────────────
  const cardW = viewportW ? Math.min(340, Math.round(viewportW * 0.84)) : 300;
  const envW = viewportW ? Math.min(360, Math.round(viewportW * 0.82)) : 320;
  const envH = Math.round(envW / 1.55);
  const envBottom = 48;
  const cardRatio = cardAspect && cardAspect > 0 ? cardAspect : resolvedCardRatio;
  const cardH = Math.round(cardW / cardRatio);
  const stageH = Math.max(500, cardH + 80);
  const yUp = Math.round(stageH / 2 - (envBottom + envH / 2));
  const scaleInside = Math.max(
    0.16,
    Math.min(0.44, (envH * 0.78) / cardH, (envW * 0.6) / cardW)
  );

  const idx = PHASES.indexOf(phase);
  const showFlipper = idx <= 1;
  const showOpenStack = idx >= 2;
  const flapOpen = idx >= 2;
  const cardOut = idx >= 3;

  // ── Theme tokens ─────────────────────────────────────────────────────────
  const theme = useMemo(() => {
    const bg = invitation?.backgroundColor || "#FAF8F5";
    const text = invitation?.textColor || "#1A1118";
    const accent = invitation?.accentColor || "#C9A84C";
    const button = invitation?.buttonColor || accent;
    const radius =
      invitation?.buttonRadius !== undefined ? `${invitation.buttonRadius}px` : "12px";
    const family =
      invitation?.fontFamily === "Playfair Display"
        ? "'Playfair Display', Georgia, serif"
        : invitation?.fontFamily && invitation.fontFamily !== "sans-serif"
        ? `'${invitation.fontFamily}', Georgia, serif`
        : "'Inter', system-ui, sans-serif";
    return { bg, text, accent, button, radius, family };
  }, [invitation]);

  const envelope = useMemo(
    () =>
      resolveEnvelope(
        eventData?.canvasState ?? invitation?.canvasState,
        invitation?.envelope ?? invitation?.canvasState?.envelope
      ),
    [eventData, invitation]
  );
  const backdrop = useMemo(
    () =>
      resolveBackdrop(eventData?.canvasState, theme.bg, invitation?.stageBackdrop),
    [eventData, invitation, theme.bg]
  );

  const resolvedName = (guestName || "").trim();

  const stampEmoji = envelope.stamp
    ? STAMP_EMOJI[envelope.stamp] || (envelope.stamp.length <= 4 ? envelope.stamp : "🌸")
    : "🌸";

  const eventDateLabel = useMemo(() => {
    const raw = eventData?.eventDate;
    if (!raw) return null;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return String(raw);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [eventData]);

  const eventTimeLabel = useMemo(() => {
    const raw = eventData?.eventTime;
    if (!raw) return null;
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return String(raw);
  }, [eventData]);

  const fullVenue = [
    eventData?.venue,
    eventData?.address,
    eventData?.city,
    eventData?.state,
    eventData?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const calendarUrl = useMemo(() => {
    const title = encodeURIComponent(invitation?.title || eventData?.title || "Event");
    const details = encodeURIComponent(invitation?.mainText || eventData?.description || "");
    const location = encodeURIComponent(fullVenue);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  }, [invitation, eventData, fullVenue]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullVenue || eventData?.venue || ""
  )}`;

  const copyShareLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  const submitRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpError(null);
    if (!rsvpName.trim()) return setRsvpError("Please enter your full name.");
    if (!rsvpEmail.trim() || !rsvpEmail.includes("@"))
      return setRsvpError("Please enter a valid email address.");
    try {
      setRsvpSubmitting(true);
      const res = await invitationService.submitPublicRSVP({
        eventId: invitation?.eventId || eventData?.id,
        name: rsvpName.trim(),
        email: rsvpEmail.trim(),
        rsvpStatus,
      });
      if (res.success) setRsvpDone(true);
      else setRsvpError(res.message || "Failed to submit your RSVP.");
    } catch (err: any) {
      setRsvpError(err?.response?.data?.error || "Error submitting your response.");
    } finally {
      setRsvpSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-center px-6">
        <div className="w-11 h-11 border-4 border-[#2D1B3D]/15 border-t-[#2D1B3D] rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#2D1B3D]/70">Preparing your invitation…</p>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-center px-6">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[#2D1B3D] mb-2">Invitation Not Found</h2>
        <p className="text-sm text-[#2D1B3D]/60 max-w-sm">
          {error || "This invitation link may be invalid or has been removed."}
        </p>
      </div>
    );
  }

  const flipperStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    margin: "0 auto",
    bottom: envBottom,
    width: envW,
    height: envH,
  };

  const faceStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: 12,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    overflow: "hidden",
    boxShadow: "0 22px 45px rgba(0,0,0,0.28), 0 6px 16px rgba(0,0,0,0.18)",
  };

  // The back face must NOT use overflow:hidden — the opened envelope stack
  // (which it swaps with) can't clip the flap, so both layers share the same
  // square flap corners and rounded body instead.
  const backFaceStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: 12,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    boxShadow: "0 22px 45px rgba(0,0,0,0.28), 0 6px 16px rgba(0,0,0,0.18)",
  };

  return (
    <div className="relative w-full overflow-x-hidden font-sans">
      {/* ─── TEXTURED BACKGROUND ─── */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: backdrop.color || theme.bg,
          backgroundImage: backdrop.image || undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0) 55%), radial-gradient(100% 70% at 50% 100%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 60%)",
        }}
      />

      {/* ─── FLOATING PETALS ─── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {PETALS.map((p, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute block rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size * 0.7,
              background: `linear-gradient(135deg, ${theme.accent}cc, ${theme.accent}55)`,
              opacity: 0.35,
            }}
            animate={{ y: [0, -18, 0], rotate: [0, p.rotate, 0], x: [0, 8, 0] }}
            transition={{ duration: 7 + i, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* ─── TOP BAR ─── */}
      <header className="relative z-30 flex items-center justify-between px-5 sm:px-8 pt-6 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-md"
            style={{
              backgroundColor: "rgba(255,255,255,0.72)",
              color: theme.text,
              border: `1px solid ${theme.accent}55`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: theme.accent }} />
            You&apos;re Cordially Invited
          </span>
          {guestMode && (
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-md"
              style={{
                backgroundColor: theme.accent,
                color: "#ffffff",
              }}
            >
              Guest preview
            </span>
          )}
        </div>
        <button
          onClick={copyShareLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-md transition-colors"
          style={{
            backgroundColor: "rgba(255,255,255,0.72)",
            color: theme.text,
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Share"}
        </button>
      </header>

      {/* ─── STAGE (envelope + card) ─── */}
      <main className="relative z-10 flex flex-col items-center px-4">
        <div
          className="relative w-full"
          style={{
            height: stageH,
            maxWidth: 720,
            transition: "height 450ms ease",
            perspective: "1600px",
          }}
        >
          {/* PHASE 1–2 : flipping envelope (front → back) */}
          <motion.div
            aria-hidden={!showFlipper}
            className="absolute"
            style={{
              ...flipperStyle,
              transformStyle: "preserve-3d",
              visibility: showFlipper ? "visible" : "hidden",
              opacity: showFlipper ? 1 : 0,
            }}
            animate={{ rotateY: idx >= 1 ? 180 : 0 }}
            transition={{ duration: DURATION.flip / 1000, ease: [0.4, 0, 0.2, 1] }}
            initial={false}
          >
            {/* FRONT — addressed face */}
            <div
              style={{
                ...faceStyle,
                background: `linear-gradient(150deg, ${envelope.flapColor} 0%, ${envelope.color} 55%, ${envelope.color} 100%)`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, transparent 45%, rgba(0,0,0,0.18) 100%)",
                }}
              />
              {/* postage stamp */}
              <div
                className="absolute flex flex-col items-center justify-center"
                style={{
                  top: 12,
                  right: 14,
                  width: 46,
                  height: 54,
                  background: "#fffdf7",
                  border: "2px dashed rgba(255,255,255,0.75)",
                  borderRadius: 3,
                  boxShadow: "0 3px 8px rgba(0,0,0,0.28)",
                }}
              >
                <span className="text-xl leading-none">{stampEmoji}</span>
                <span className="text-[6px] font-bold uppercase tracking-[0.14em] text-slate-600 mt-1">
                  Post
                </span>
              </div>

              {/* guest address */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.32em]"
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  Invitation for
                </span>
                <p
                  className="mt-1 leading-tight break-words"
                  style={{
                    fontFamily: "'Great Vibes', 'Dancing Script', cursive",
                    fontSize: envW > 300 ? 34 : 27,
                    color: "rgba(255,255,255,0.97)",
                    textShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    maxWidth: "78%",
                  }}
                >
                  {resolvedName || "Guest\u2019s Name"}
                </p>
                <div className="mt-3 flex flex-col gap-1.5 w-2/3 opacity-45">
                  <span className="block h-[2px] rounded bg-white/80" />
                  <span className="block h-[2px] rounded bg-white/60 w-4/5 mx-auto" />
                  <span className="block h-[2px] rounded bg-white/45 w-3/5 mx-auto" />
                </div>
              </div>
            </div>

            {/* BACK — flap seam (must render identically to the opened stack) */}
            <div
              style={{
                ...backFaceStyle,
                transform: "rotateY(180deg)",
                background: envelope.color,
              }}
            >
              <div
                className="absolute left-0 right-0 top-0"
                style={{
                  height: "64%",
                  clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                  background: envelope.flapColor,
                }}
              >
                <FlapOverlays envelope={envelope} revealed={false} />
              </div>
              <BottomFolds color={envelope.color} />
            </div>
          </motion.div>

          {/* PHASE 3–5 : opened envelope + emerging card (single flat stack) */}
          <div
            className="absolute"
            style={{
              ...flipperStyle,
              zIndex: 10,
              visibility: showOpenStack ? "visible" : "hidden",
              opacity: showOpenStack ? 1 : 0,
              transition: "opacity 120ms linear",
            }}
          >
            {/* flap — folds up/back; fades out with the envelope */}
            <div
              className="absolute inset-0"
              style={{
                zIndex: flapSettled ? 2 : 20,
                perspective: "1100px",
                opacity: envelopeGone ? 0 : 1,
                transition: "opacity 700ms ease",
              }}
            >
              <motion.div
                className="absolute left-0 right-0 top-0"
                style={{
                  height: "64%",
                  transformOrigin: "top center",
                  clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                  background: envelope.flapColor,
                }}
                initial={false}
                animate={{ rotateX: flapOpen ? 172 : 0 }}
                transition={{ duration: DURATION.open / 1000, ease: [0.36, 0, 0.2, 1] }}
              >
                <FlapOverlays envelope={envelope} revealed={flapRevealed} />
              </motion.div>
            </div>

            {/* envelope body / interior */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                zIndex: 10,
                borderRadius: 12,
                background: envelope.color,
                opacity: envelopeGone ? 0 : 1,
                transition: "opacity 700ms ease",
                boxShadow: envelopeGone
                  ? "none"
                  : "0 22px 45px rgba(0,0,0,0.28), 0 6px 16px rgba(0,0,0,0.18)",
              }}
            >
              {/* interior liner */}
              <div
                className="absolute left-0 right-0 top-0"
                style={{
                  height: "64%",
                  background: envelope.liner,
                  backgroundColor: "#D4AF37",
                  boxShadow: "inset 0 6px 18px rgba(0,0,0,0.24)",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 45%, rgba(0,0,0,0.16) 100%)",
                  }}
                />
              </div>
              {/* folded back seams */}
              <BottomFolds color={envelope.color} />
            </div>

            {/* THE CARD — slides up out of the envelope */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ zIndex: 5, pointerEvents: "none" }}
            >
              <motion.div
                className="flex items-center justify-center"
                style={{ width: cardW }}
                initial={false}
                animate={{
                  y: cardOut ? -yUp : 0,
                  scale: cardOut ? 1 : scaleInside,
                }}
                transition={{
                  duration: DURATION.unbox / 1000,
                  ease: [0.22, 0.9, 0.28, 1],
                }}
              >
                <InteractiveCard
                  width={cardW}
                  aspectRatio={cardRatio}
                  background={layeredCard ? cardBackground : null}
                  backgroundColor={theme.bg}
                  decorations={layeredCard ? cardDecorations : []}
                  layers={layeredCard ? cardLayers : []}
                  imageSrc={!layeredCard && !cardImgFailed ? cardImageSrc : null}
                  fontFamily={theme.family}
                  accentColor={theme.accent}
                  textColor={theme.text}
                  fallbackTitle={invitation?.title || eventData?.title}
                  fallbackDate={eventDateLabel}
                  onImageLoad={setCardAspect}
                  onImageError={() => setCardImgFailed(true)}
                />
              </motion.div>
            </div>
          </div>

          {/* PHASE 1 affordance — tap to open */}
          {idx === 0 && (
            <motion.button
              onClick={runTimeline}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold shadow-xl backdrop-blur-md"
              style={{
                bottom: envBottom + envH + 26,
                backgroundColor: theme.button,
                color: "#fff",
                letterSpacing: "0.06em",
              }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
                  style={{ backgroundColor: "#fff" }}
                />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              Tap to open your invitation
            </motion.button>
          )}
        </div>

        {/* ─── PHASE 5 : EVENT DETAILS ─── */}
        <motion.section
          initial={false}
          animate={{
            opacity: idx >= 4 ? 1 : 0,
            y: idx >= 4 ? 0 : 26,
          }}
          transition={{ duration: 0.6, ease: [0.22, 0.9, 0.28, 1] }}
          className="w-full max-w-xl pb-16 pt-2"
          aria-hidden={idx < 4}
          style={{ pointerEvents: idx >= 4 ? "auto" : "none" }}
        >
          <div
            className="rounded-3xl p-7 sm:p-9 backdrop-blur-md"
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              border: `1px solid ${theme.accent}33`,
              boxShadow: "0 24px 60px rgba(0,0,0,0.16)",
              textAlign: "center",
            }}
          >
            <span
              className="inline-block px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ backgroundColor: `${theme.accent}1f`, color: theme.accent }}
            >
              The Invitation
            </span>

            <h1
              className="mt-4 leading-tight"
              style={{
                fontFamily: theme.family,
                fontSize: "clamp(28px, 6vw, 44px)",
                fontWeight: invitation?.fontWeight || 700,
                color: theme.text,
              }}
            >
              {invitation?.title || eventData?.title}
            </h1>

            {(invitation?.subtitle || eventData?.eventType) && (
              <p className="mt-2 text-sm font-semibold" style={{ color: theme.accent }}>
                {invitation?.subtitle || eventData?.eventType}
              </p>
            )}

            {(invitation?.mainText || eventData?.description) && (
              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                {invitation?.mainText || eventData?.description}
              </p>
            )}

            {/* Date / Time / Venue */}
            <div className="mt-6 space-y-3 text-left">
              {eventDateLabel && (
                <div className="flex items-start gap-3.5">
                  <div
                    className="p-2.5 rounded-xl shrink-0"
                    style={{ backgroundColor: `${theme.accent}18` }}
                  >
                    <Calendar style={{ color: theme.accent, width: 18, height: 18 }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</p>
                    <p className="text-sm font-bold text-gray-900">{eventDateLabel}</p>
                  </div>
                </div>
              )}
              {eventTimeLabel && (
                <div className="flex items-start gap-3.5">
                  <div
                    className="p-2.5 rounded-xl shrink-0"
                    style={{ backgroundColor: `${theme.accent}18` }}
                  >
                    <Clock style={{ color: theme.accent, width: 18, height: 18 }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Time</p>
                    <p className="text-sm font-bold text-gray-900">{eventTimeLabel}</p>
                  </div>
                </div>
              )}
              {(eventData?.venue || fullVenue) && (
                <div className="flex items-start gap-3.5">
                  <div
                    className="p-2.5 rounded-xl shrink-0"
                    style={{ backgroundColor: `${theme.accent}18` }}
                  >
                    <MapPin style={{ color: theme.accent, width: 18, height: 18 }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Venue</p>
                    <p className="text-sm font-bold text-gray-900 break-words">{eventData?.venue}</p>
                    {fullVenue && (
                      <p className="text-xs text-gray-500 break-words">{fullVenue}</p>
                    )}
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold mt-1 hover:underline"
                      style={{ color: theme.accent }}
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* RSVP / ACTION BUTTONS */}
            <div className="mt-7 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setRsvpOpen((v) => !v)}
                  className="flex-1 py-3.5 px-5 rounded-xl text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.99]"
                  style={{ backgroundColor: theme.button, borderRadius: theme.radius }}
                >
                  {rsvpDone ? "Update your RSVP" : invitation?.buttonText || "RSVP Now"}
                </button>
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 px-5 rounded-xl text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm inline-flex items-center justify-center gap-2"
                  style={{ borderRadius: theme.radius }}
                >
                  <CalendarPlus className="w-4 h-4 text-emerald-600" />
                  Add to Calendar
                </a>
              </div>

              {/* Inline RSVP panel */}
              {rsvpOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 pb-1 text-left">
                    {rsvpDone ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-2">
                        <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-bold text-emerald-900">RSVP Confirmed!</p>
                        <button
                          onClick={() => setRsvpDone(false)}
                          className="text-xs font-semibold text-emerald-700 underline"
                        >
                          Update Response
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={submitRsvp} className="space-y-3">
                        {rsvpError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <span>{rsvpError}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                          {(
                            [
                              { key: "confirmed", label: "Yes", icon: CheckCircle, active: "border-emerald-600 bg-emerald-50 text-emerald-900" },
                              { key: "maybe", label: "Maybe", icon: Clock, active: "border-amber-600 bg-amber-50 text-amber-900" },
                              { key: "declined", label: "No", icon: XCircle, active: "border-rose-600 bg-rose-50 text-rose-900" },
                            ] as const
                          ).map((opt) => {
                            const Icon = opt.icon;
                            const active = rsvpStatus === opt.key;
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => setRsvpStatus(opt.key)}
                                className={`py-2.5 px-2 rounded-xl border-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                  active ? opt.active : "border-gray-200 bg-white text-gray-600"
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                        <input
                          type="text"
                          required
                          value={rsvpName}
                          onChange={(e) => setRsvpName(e.target.value)}
                          placeholder="Full name"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2"
                          style={{ "--tw-ring-color": theme.accent } as unknown as React.CSSProperties}
                        />
                        <input
                          type="email"
                          required
                          value={rsvpEmail}
                          onChange={(e) => setRsvpEmail(e.target.value)}
                          placeholder="Email address"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2"
                          style={{ "--tw-ring-color": theme.accent } as unknown as React.CSSProperties}
                        />
                        <button
                          type="submit"
                          disabled={rsvpSubmitting}
                          className="w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                          style={{ backgroundColor: theme.button, borderRadius: theme.radius }}
                        >
                          {rsvpSubmitting ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" /> Submitting…
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" /> Submit RSVP
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              onClick={replay}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: theme.text }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Replay animation
            </button>
            <a
              href={`/invitation/${invitation?.id || invitationId}`}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: theme.text }}
            >
              Full details
            </a>
          </div>
        </motion.section>
      </main>

      {/* footer */}
      <footer className="relative z-10 pb-8 text-center text-[11px] font-semibold opacity-55" style={{ color: theme.text }}>
        Sent with <span style={{ color: theme.accent }}>InviteHub</span>
      </footer>
    </div>
  );
}
