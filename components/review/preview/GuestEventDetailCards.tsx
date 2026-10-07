"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import {
  Bell,
  CalendarPlus,
  Camera,
  ChevronRight,
  Gift,
  MapPin,
  User,
  Users,
} from "lucide-react";
import {
  CARD_LABEL_CLASS,
  DETAIL_CARD_CLASS,
  avatarColorFor,
  buildCalendarUrl,
  buildMapEmbedUrl,
  buildMapsUrl,
  buildEventDateLabels,
  countGoing,
  initialsOf,
  resolvePreviewGuests,
} from "./previewTheme";
import type { EviteGuestPreviewEventDetails, GuestRsvpChoice } from "./previewTypes";

// =============================================================================
// GUEST EVENT DETAIL CARDS — the Evite guest-view information stack that
// animates in beneath the invitation card once the envelope sequence settles.
// Every block is a modular white rounded card (`DETAIL_CARD_CLASS`).
// =============================================================================

export interface GuestEventDetailCardsProps {
  details: EviteGuestPreviewEventDetails;
  cardImageUrl?: string | null;
  rsvp?: GuestRsvpChoice;
  onRsvp?: (choice: Exclude<GuestRsvpChoice, null>) => void;
  /** Fires the mock preview toast (RSVP, view-all, notification prefs…). */
  onNotify?: (message: string) => void;
}

const stackVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const RSVP_OPTIONS: {
  id: Exclude<GuestRsvpChoice, null>;
  label: string;
  active: string;
}[] = [
  {
    id: "going",
    label: "Going",
    active: "border-[#3e5622] bg-[#3e5622]/10 text-[#3e5622]",
  },
  {
    id: "maybe",
    label: "Maybe",
    active: "border-amber-500 bg-amber-50 text-amber-700",
  },
  {
    id: "cant-go",
    label: "Can't Go",
    active: "border-rose-500 bg-rose-50 text-rose-600",
  },
];

const RSVP_TOAST: Record<Exclude<GuestRsvpChoice, null>, string> = {
  going: 'RSVP preview set to "Going" — responses are not saved in preview mode.',
  maybe: 'RSVP preview set to "Maybe" — responses are not saved in preview mode.',
  "cant-go": 'RSVP preview set to "Can\'t Go" — responses are not saved in preview mode.',
};

const GIFT_BRANDS: { id: string; name: React.ReactNode; className: string }[] = [
  {
    id: "amazon",
    name: <span className="text-[19px] font-bold lowercase tracking-tight text-[#111]">amazon</span>,
    className: "hover:border-[#ff9900] hover:shadow-md",
  },
  {
    id: "walmart",
    name: (
      <span className="text-[17px] font-extrabold tracking-tight text-[#0071ce]">
        Walmart<span className="text-[#ffc220]">✦</span>
      </span>
    ),
    className: "hover:border-[#0071ce] hover:shadow-md",
  },
  {
    id: "target",
    name: <span className="text-[17px] font-bold tracking-tight text-[#cc0000]">Target</span>,
    className: "hover:border-[#cc0000] hover:shadow-md",
  },
];

function ActionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section variants={cardVariants} className={`${DETAIL_CARD_CLASS} ${className}`}>
      {children}
    </motion.section>
  );
}

export default function GuestEventDetailCards({
  details,
  rsvp = null,
  onRsvp,
  onNotify,
}: GuestEventDetailCardsProps) {
  const title = (details.title || "").trim() || "You're Invited";
  const hostName = (details.hostName || "").trim();
  const venue = (details.location || "").trim();
  const address = (details.address || "").trim();
  const mapQuery = [venue, address].filter(Boolean).join(", ");

  const date = buildEventDateLabels(details.date, details.time);
  const calendarUrl = buildCalendarUrl({
    title,
    date: details.date,
    time: details.time,
    location: mapQuery,
    details: details.hostNote || "",
  });
  const mapsUrl = buildMapsUrl(mapQuery);
  const mapEmbedUrl = buildMapEmbedUrl(mapQuery);

  const guests = resolvePreviewGuests(details.guests, details.guestName);
  const goingCount = details.guestCount ?? countGoing(guests);
  const primaryGuest = guests[0];

  return (
    <motion.div
      variants={stackVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-xl mx-auto px-4 sm:px-0 pb-16"
    >
      {/* ── 1 · Event title + date/time ── */}
      <ActionCard>
        <h1 className="text-[26px] sm:text-3xl font-bold text-slate-900 leading-tight mb-6 break-words">
          {title}
        </h1>

        <p className={`${CARD_LABEL_CLASS} mb-2`}>Date &amp; Time</p>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            {date.dayLabel ? (
              <p className="text-[15px] font-medium text-slate-800">{date.dayLabel}</p>
            ) : null}
            {date.timeLabel ? (
              <p className="text-[15px] font-medium text-slate-800">{date.timeLabel}</p>
            ) : null}
            {!date.dayLabel && !date.timeLabel ? (
              <p className="text-[15px] font-medium text-slate-800">Date to be announced</p>
            ) : null}
          </div>

          {calendarUrl ? (
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Add to calendar"
              title="Add to calendar"
              className="w-11 h-11 shrink-0 rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition flex items-center justify-center cursor-pointer"
            >
              <CalendarPlus className="w-5 h-5" />
            </a>
          ) : (
            <button
              type="button"
              onClick={() =>
                onNotify?.("Calendar sync becomes available once a date is set.")
              }
              aria-label="Add to calendar"
              title="Add to calendar"
              className="w-11 h-11 shrink-0 rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition flex items-center justify-center cursor-pointer"
            >
              <CalendarPlus className="w-5 h-5" />
            </button>
          )}
        </div>
      </ActionCard>

      {/* ── 2 · Host details ── */}
      <ActionCard>
        <p className={`${CARD_LABEL_CLASS} mb-3`}>Host Details</p>
        <div className="flex items-center gap-2.5 text-slate-800">
          <User className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-sm font-bold uppercase tracking-wide break-words">
            {hostName || "Host to be announced"}
          </span>
        </div>
        {details.hostNote ? (
          <p className="mt-3 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
            {details.hostNote}
          </p>
        ) : null}
      </ActionCard>

      {/* ── 3 · Guest list + RSVP status ── */}
      <ActionCard>
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <p className={CARD_LABEL_CLASS}>Guest List</p>
          <button
            type="button"
            onClick={() =>
              onNotify?.("The full guest list unlocks once invitations are sent.")
            }
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            View all
          </button>
        </div>

        <p className="text-sm font-bold text-slate-900 mb-4">
          {goingCount} guest{goingCount === 1 ? "" : "s"} going
        </p>

        <div className="flex items-center gap-2 flex-wrap mb-5">
          {guests.slice(0, 6).map((guest) => (
            <span
              key={guest.id}
              title={guest.name}
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-white shadow-sm"
              style={{ backgroundColor: guest.color || avatarColorFor(guest.name) }}
            >
              {guest.initials || initialsOf(guest.name)}
            </span>
          ))}
          {guests.length > 6 ? (
            <span className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200">
              +{guests.length - 6}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {RSVP_OPTIONS.map((option) => {
            const active = rsvp === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  onRsvp?.(option.id);
                  onNotify?.(RSVP_TOAST[option.id]);
                }}
                className={`py-2.5 px-2 rounded-full border-2 text-xs font-bold transition cursor-pointer ${
                  active
                    ? `${option.active} ring-2 ring-offset-1 ring-slate-300`
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {primaryGuest ? (
          <p className="mt-4 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {primaryGuest.name} · {rsvp ? `RSVP: ${RSVP_OPTIONS.find((o) => o.id === rsvp)?.label}` : "No response yet"}
          </p>
        ) : null}
      </ActionCard>

      {/* ── 4 · Media / activity ── */}
      <ActionCard className="text-center">
        <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3">
          <Camera className="w-5 h-5 text-slate-500" />
        </div>
        <p className="text-[15px] font-bold text-slate-900 mb-1">Coming soon!</p>
        <p className="text-sm text-slate-600 leading-relaxed">
          You&apos;ll be able to add photos once the event starts.
        </p>
      </ActionCard>

      {/* ── 5 · Gifting / registry ── */}
      <ActionCard>
        <p className={`${CARD_LABEL_CLASS} mb-2`}>Gifting</p>
        <p className="text-[15px] font-bold text-slate-900 mb-5">Browse gift guides</p>

        <div className="flex flex-wrap gap-4">
          {GIFT_BRANDS.map((brand) => (
            <div
              key={brand.id}
              className={`w-[132px] h-[132px] rounded-full border border-slate-200 bg-white flex flex-col items-center justify-center gap-2 transition cursor-pointer ${brand.className}`}
              role="link"
              tabIndex={0}
              onClick={() => onNotify?.(`Opening ${brand.id} gift guide — disabled in preview mode.`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onNotify?.(`Opening ${brand.id} gift guide — disabled in preview mode.`);
                }
              }}
            >
              {brand.name}
              <span className="text-[11px] font-semibold text-[#3e5622] px-3 text-center leading-tight">
                Buy your gift now
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2 text-slate-700">
          <Gift className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium">Buy your gift now</span>
        </div>
      </ActionCard>

      {/* ── 6 · Notification preferences ── */}
      <ActionCard>
        <button
          type="button"
          onClick={() =>
            onNotify?.("Notification preferences are disabled in preview mode.")
          }
          className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
        >
          <span className="flex items-center gap-3 min-w-0">
            <Bell className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-sm font-semibold text-slate-800 truncate">
              Notification preferences
            </span>
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 transition group-hover:translate-x-0.5" />
        </button>
      </ActionCard>

      {/* ── 7 · Location + map ── */}
      {mapQuery ? (
        <ActionCard>
          <p className={`${CARD_LABEL_CLASS} mb-3`}>Location</p>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#3e5622]/10 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-[#3e5622]" />
            </div>
            <div className="min-w-0">
              {venue ? <p className="text-sm font-bold text-slate-900 break-words">{venue}</p> : null}
              {address ? <p className="text-sm text-slate-600 break-words">{address}</p> : null}
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3e5622] hover:underline mt-1.5"
                >
                  Get directions →
                </a>
              ) : null}
            </div>
          </div>

          {mapEmbedUrl ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <iframe
                title="Event location map"
                src={mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-44 border-0"
              />
            </div>
          ) : null}
        </ActionCard>
      ) : null}

      <p className="text-center text-[11px] text-slate-500/80 px-6">
        This is a preview of your invitation — RSVP responses and settings are not saved.
      </p>
    </motion.div>
  );
}
