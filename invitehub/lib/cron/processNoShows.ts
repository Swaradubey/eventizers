/**
 * Scheduled Worker / Cron Service for No-Show Attendance Commitment Processing
 * Strict TypeScript implementation for triggering and evaluating No-Show penalties and auto-waive timelines.
 */

export interface ProcessNoShowsResult {
  success: boolean;
  eventsProcessed: number;
  noticesSent: number;
  totalWaived: number;
  timestamp: string;
  error?: string;
}

export interface NoShowGuestRecord {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string | null;
  rsvpStatus: string;
  guaranteeStatus: "PENDING" | "WAIVED" | "CHARGED" | string;
  penaltyNoticeSentAt?: string | null;
  guaranteeChargedAt?: string | null;
  guaranteeWaivedAt?: string | null;
  guaranteeAmount?: number;
}

export interface ProcessNoShowsOptions {
  apiUrl?: string;
  forceAll?: boolean;
}

/**
 * Checks whether the host's review window has expired for a given event date.
 * @param eventDate The date when the event ended or occurred
 * @param reviewWindowDays Number of days the host has to review
 * @returns boolean true if the current time is past eventDate + reviewWindowDays
 */
export function isReviewWindowExpired(
  eventDate: string | Date,
  reviewWindowDays: number = 7
): boolean {
  const d = typeof eventDate === "string" ? new Date(eventDate) : eventDate;
  if (isNaN(d.getTime())) return false;

  const expiry = new Date(d.getTime());
  expiry.setDate(expiry.getDate() + reviewWindowDays);
  return expiry.getTime() < Date.now();
}

/**
 * Calculates remaining days in review window timeline.
 * @param eventDate The date when the event ended or occurred
 * @param reviewWindowDays Number of days the host has to review
 * @returns number of days left (0 if expired)
 */
export function calculateDaysRemaining(
  eventDate: string | Date,
  reviewWindowDays: number = 7
): number {
  const d = typeof eventDate === "string" ? new Date(eventDate) : eventDate;
  if (isNaN(d.getTime())) return 0;

  const expiry = new Date(d.getTime());
  expiry.setDate(expiry.getDate() + reviewWindowDays);
  const diffMs = expiry.getTime() - Date.now();
  if (diffMs <= 0) return 0;

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Trigger the No-Show penalty notice processing worker.
 * Connects to the backend background cron route (/api/cron/process-no-shows).
 */
export async function triggerProcessNoShows(
  options: ProcessNoShowsOptions = {}
): Promise<ProcessNoShowsResult> {
  const rawApiUrl = options.apiUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const baseUrl = rawApiUrl.replace(/\/+$/, "");
  const targetUrl = `${baseUrl}/cron/process-no-shows`;

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `HTTP ${res.status}: Failed to process no-shows`);
    }

    const data: ProcessNoShowsResult = await res.json();
    return data;
  } catch (error: any) {
    console.error("[processNoShows] Cron dispatch failed:", error);
    return {
      success: false,
      eventsProcessed: 0,
      noticesSent: 0,
      totalWaived: 0,
      timestamp: new Date().toISOString(),
      error: error?.message || "Unknown error triggering no-shows cron",
    };
  }
}

export default triggerProcessNoShows;
