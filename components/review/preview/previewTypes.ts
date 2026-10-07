// =============================================================================
// Shared types for the Evite-style guest / email preview experience.
// =============================================================================

/** Which surface the preview shell is rendering. */
export type PreviewMode = "guest" | "email";

/** Viewport toggle in the sticky preview bar. */
export type PreviewDeviceMode = "desktop" | "mobile";

/** Envelope reveal timeline stages (guest mode). */
export type PreviewEnvelopePhase = "sealed" | "opening" | "revealing" | "settled";

/** Guest-view RSVP answers (Going / Maybe / Can't Go). */
export type GuestRsvpChoice = "going" | "maybe" | "cant-go" | null;

/** Email-view RSVP answers (Yes / Maybe / No). */
export type EmailRsvpChoice = "yes" | "maybe" | "no" | null;

export type PreviewRsvpStatus = "going" | "maybe" | "declined" | "pending";

/** A single attendee rendered in the guest-list card. */
export interface PreviewGuest {
  id: string;
  name: string;
  /** Optional pre-computed initials — derived from `name` when omitted. */
  initials?: string;
  status?: PreviewRsvpStatus;
  /** Optional avatar background color. */
  color?: string;
}

/**
 * Event payload consumed by the preview surfaces.
 * `date` / `time` may be raw (e.g. "2026-10-09" / "18:00") or a pre-formatted
 * display string — helpers in `previewTheme` degrade gracefully.
 */
export interface EviteGuestPreviewEventDetails {
  title?: string;
  date?: string;
  time?: string;
  /** Venue name. */
  location?: string;
  /** Street address (used for the map card). */
  address?: string;
  hostNote?: string;
  hostName?: string;
  /** Name shown on the sealed envelope. */
  guestName?: string;
  guests?: PreviewGuest[];
  /** Overrides the derived attendee count badge. */
  guestCount?: number;
}
