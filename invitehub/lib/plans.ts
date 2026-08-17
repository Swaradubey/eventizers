/**
 * lib/plans.ts
 * ─────────────────────────────────────────────────────────────────────────
 * FRONTEND SINGLE SOURCE OF TRUTH for billing plan definitions.
 *
 * Mirrors backend/src/config/plans.config.js — keep in sync if you update
 * plan names, prices, or features.
 *
 * Valid plan IDs: "free" | "pro" | "business"
 * ─────────────────────────────────────────────────────────────────────────
 */

export type PlanId = "free" | "pro" | "business";

export interface BillingPlan {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  features: string[];
  /** CTA button label on the home pricing section */
  cta: string;
  /** Visual accent colour for the pricing card */
  color: string;
  /** Whether this card is visually highlighted (most popular) */
  highlight: boolean;
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    features: [
      "Up to 3 events/year",
      "25 guests per event",
      "Basic invitation templates",
      "Email invitations",
      "RSVP tracking",
    ],
    cta: "Get Started Free",
    color: "#7A9E7E",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 19,
    features: [
      "Up to 250 guests",
      "SMS & WhatsApp invites",
      "QR Check-in",
      "Reminders & analytics",
    ],
    cta: "Choose Pro",
    color: "#C9A84C",
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 49,
    features: [
      "Unlimited guests",
      "Ticketing & payments",
      "Attendance guarantee",
      "Security Center",
      "Priority support",
    ],
    cta: "Choose Business",
    color: "#9070c0",
    highlight: false,
  },
];

/**
 * Normalise a raw plan string received from the backend.
 * Maps legacy "host" → "business"; unknown values → "free".
 */
export function normalizePlanId(raw: string | null | undefined): PlanId {
  const plan = (raw || "free").toLowerCase().trim();
  if (plan === "host") return "business";
  if (plan === "pro" || plan === "business") return plan;
  return "free";
}

export const VALID_PLAN_IDS: PlanId[] = ["free", "pro", "business"];
export const PAID_PLAN_IDS: Exclude<PlanId, "free">[] = ["pro", "business"];
