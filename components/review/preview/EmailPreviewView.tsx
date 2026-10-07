"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CalendarPlus,
  Clock,
  Mail,
  MapPin,
  User,
} from "lucide-react";
import {
  buildEventDateLabels,
  buildCalendarUrl,
  buildMapsUrl,
  initialsOf,
} from "./previewTheme";
import type { EmailRsvpChoice, EviteGuestPreviewEventDetails } from "./previewTypes";

// =============================================================================
// EMAIL PREVIEW VIEW — single-column Evite-style email simulation.
//   1. Envelope header band (sender + subject rows)
//   2. Embedded invitation card graphic
//   3. Yes / Maybe / No RSVP call-to-action row
//   4. Essential event details in a single-column email rhythm
// =============================================================================

export interface EmailPreviewViewProps {
  details: EviteGuestPreviewEventDetails;
  cardImageUrl?: string | null;
  rsvp?: EmailRsvpChoice;
  onRsvp?: (choice: Exclude<EmailRsvpChoice, null>) => void;
  onNotify?: (message: string) => void;
}

const RSVP_TOAST: Record<Exclude<EmailRsvpChoice, null>, string> = {
  yes: 'Email RSVP preview set to "Yes" — nothing is sent from preview mode.',
  maybe: 'Email RSVP preview set to "Maybe" — nothing is sent from preview mode.',
  no: 'Email RSVP preview set to "No" — nothing is sent from preview mode.',
};

export default function EmailPreviewView({
  details,
  cardImageUrl,
  rsvp = null,
  onRsvp,
  onNotify,
}: EmailPreviewViewProps) {
  const title = (details.title || "").trim() || "You're Invited";
  const hostName = (details.hostName || "").trim();
  const venue = (details.location || "").trim();
  const address = (details.address || "").trim();
  const locationLine = [venue, address].filter(Boolean).join(", ");

  const date = buildEventDateLabels(details.date, details.time);
  const calendarUrl = buildCalendarUrl({
    title,
    date: details.date,
    time: details.time,
    location: locationLine,
    details: details.hostNote || "",
  });
  const mapsUrl = buildMapsUrl(locationLine);

  const rsvpButtons: {
    id: Exclude<EmailRsvpChoice, null>;
    label: string;
    className: string;
  }[] = [
    { id: "yes", label: "Yes", className: "bg-[#3e5622] hover:bg-[#32481b] text-white" },
    { id: "maybe", label: "Maybe", className: "bg-neutral-800 hover:bg-neutral-700 text-white" },
    {
      id: "no",
      label: "No",
      className: "bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[640px] mx-auto px-4 sm:px-0 pb-16"
    >
      <div className="bg-white rounded-2xl shadow-[0_18px_50px_-24px_rgba(0,0,0,0.4)] border border-gray-200 overflow-hidden">
        {/* ── 1 · Envelope simulation header ── */}
        <div
          className="px-5 sm:px-7 pt-6 pb-5 text-white"
          style={{ background: "linear-gradient(150deg, #2b3129 0%, #1e2329 60%, #171b1f 100%)" }}
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[#3e5622] flex items-center justify-center text-sm font-bold shrink-0">
              {initialsOf(hostName)}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white/90 truncate">
                {hostName || "Your host"} via InviteHub
              </p>
              <p className="text-[11px] text-white/55 truncate">
                invitations@invitehub.com · to you
              </p>
            </div>
            <Mail className="w-5 h-5 text-white/40 ml-auto shrink-0" />
          </div>

          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9dcae]">
            You&apos;re invited
          </p>
          <p className="mt-1 text-lg font-bold leading-snug break-words">{title}</p>

          {/* envelope flap motif */}
          <div className="mt-4 relative h-14 rounded-lg overflow-hidden bg-[#a2713f]/90">
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                background: "linear-gradient(180deg, #b58556 0%, #9a6c42 100%)",
              }}
            />
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/85">
                Preview envelope
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-7 py-6 space-y-6">
          {/* ── 2 · Card graphic ── */}
          <div className="mx-auto w-full max-w-[340px]">
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-white shadow-[0_16px_34px_-16px_rgba(0,0,0,0.45)] ring-1 ring-black/10">
              {cardImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cardImageUrl}
                  alt={`${title} invitation card`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-5 text-center bg-gradient-to-br from-[#3e5622] via-[#587a37] to-[#87a864]">
                  <span className="font-serif font-bold text-white text-lg leading-tight">
                    {title}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/75">
                    You&apos;re invited
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── 3 · RSVP CTA row ── */}
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 mb-3">
              Will you be attending?
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {rsvpButtons.map((option) => {
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
                    className={`py-3 rounded-full text-sm font-bold transition cursor-pointer ${option.className} ${
                      active ? "ring-2 ring-offset-2 ring-[#3e5622]" : ""
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 4 · Essential details (single column) ── */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <div className="flex items-start gap-3">
              <CalendarPlus className="w-4 h-4 mt-0.5 text-[#3e5622] shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Date &amp; Time
                </p>
                <p className="text-sm font-semibold text-slate-800 break-words">
                  {date.combinedLabel || "To be announced"}
                </p>
                {calendarUrl ? (
                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#3e5622] hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    Add to calendar
                  </a>
                ) : null}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-4 h-4 mt-0.5 text-[#3e5622] shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Host
                </p>
                <p className="text-sm font-semibold text-slate-800 break-words">
                  {hostName || "To be announced"}
                </p>
              </div>
            </div>

            {locationLine ? (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-[#3e5622] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    Location
                  </p>
                  <p className="text-sm font-semibold text-slate-800 break-words">
                    {locationLine}
                  </p>
                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#3e5622] hover:underline inline-flex items-center gap-1 mt-0.5"
                    >
                      Get directions
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 mt-0.5 text-[#3e5622] shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  From your host
                </p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line break-words">
                  {details.hostNote?.trim() || "No additional note."}
                </p>
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => onNotify?.("“View invitation” is disabled in preview mode.")}
            className="w-full py-3.5 rounded-full bg-[#3e5622] hover:bg-[#32481b] text-white text-sm font-bold transition cursor-pointer"
          >
            View invitation
          </button>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-4 text-center space-y-1.5">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              You&apos;re receiving this because you&apos;re invited to {title}.
            </p>
            <p className="text-[11px] font-semibold text-slate-400">
              Preview only — no email was sent and RSVP responses are not recorded.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
