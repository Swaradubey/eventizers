export interface ProPlan {
  id: "creator" | "pro" | "studio";
  name: string;
  who: string;
  monthly: number;
  annual: number;
  fee: string;
  feeRate: number;
  featured: boolean;
  points: string[];
}

export const TRIAL_DAYS = 14;

export const PRO_PLANS: ProPlan[] = [
  {
    id: "creator",
    name: "Creator",
    who: "Solo hosts running one event at a time",
    monthly: 29,
    annual: 23,
    fee: "2.5% on paid tickets",
    feeRate: 0.025,
    featured: false,
    points: [
      "1 active event",
      "3 connected channels",
      "Content calendar and scheduling",
      "Tracking links on every post",
      "Basic analytics",
      "30 AI drafts a month",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    who: "Promoters and creators selling tickets every month",
    monthly: 79,
    annual: 63,
    fee: "1.5% on paid tickets",
    feeRate: 0.015,
    featured: true,
    points: [
      "Unlimited events",
      "All 5 channels, posted from one place",
      "Post-level sales attribution",
      "Unified inbox and CRM sync",
      "AI agent that fixes slow sales",
      "Guest referral links and QR check-in",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    who: "Agencies and venues running many brands",
    monthly: 199,
    annual: 159,
    fee: "0.9% on paid tickets",
    feeRate: 0.009,
    featured: false,
    points: [
      "Everything in Pro",
      "5 team seats with approvals",
      "Multiple brands and workspaces",
      "Audience groups and exports",
      "Custom domain for event pages",
      "Priority support",
    ],
  },
];

export const PRO_NAV = [
  { label: "Individual", href: "/" },
  { label: "How It Works", href: "#flow" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#plans" },
  { label: "FAQ", href: "#faq" },
];

export const BUILT_FOR_TAGS = [
  "Promoters",
  "Venues",
  "DJs",
  "Creators",
  "Agencies",
  "Comedians",
  "Run clubs",
  "Supper clubs",
];

export const FAQ_ITEMS = [
  {
    q: "How does the free trial work?",
    a: "Every Pro plan starts with a 14-day free trial of everything in that plan. Connect your channels, publish, and track sales. You can cancel anytime during the trial, and you only start paying when it ends.",
  },
  {
    q: "Do I have to log in to each social account every time?",
    a: "No. You connect each account once. After that, one idea becomes a Reel, Story, feed post and Short, timed for each channel, and you approve before anything goes out.",
  },
  {
    q: "How does it know which post sold a ticket?",
    a: "Every post carries its own tracking link. When a guest RSVPs or buys, the sale is credited to the post, channel and guest referral link that brought them.",
  },
  {
    q: "Will the AI post without asking me?",
    a: "Never. The agent explains what changed and drafts a fix. Nothing is scheduled until you approve it.",
  },
  {
    q: "Which CRMs can I connect?",
    a: "HubSpot, Salesforce, Pipedrive, Zoho, Google Sheets and Zapier. You choose which leads sync and how fields map.",
  },
  {
    q: "Can I start on Individual and move to Pro later?",
    a: "Yes. You can upgrade at any time, and your events, guests and invitations carry over.",
  },
];

export const FEATURES_DATA = [
  {
    category: "Promote",
    subtitle: "Get in front of the right people, on every channel.",
    features: [
      {
        title: "Omni-channel posting",
        desc: "Instagram, TikTok, Facebook, YouTube and LinkedIn from one composer, each in the right format.",
        icon: "send",
      },
      {
        title: "Content calendar",
        desc: "Plan the countdown, drag posts to a new day, and approve before anything goes out.",
        icon: "calendar",
      },
      {
        title: "Tracking links",
        desc: "Every post carries its own link, so you always know where a guest came from.",
        icon: "link",
      },
      {
        title: "Guest referral links",
        desc: "Give each guest a link to share and see who brings the most friends.",
        icon: "share",
      },
    ],
  },
  {
    category: "Sell",
    subtitle: "Turn attention into tickets, and tickets into people at the door.",
    features: [
      {
        title: "Ticket tiers",
        desc: "Free, early bird, general and VIP, with limits per tier and a public event page.",
        icon: "ticket",
      },
      {
        title: "QR check-in",
        desc: "Scan guests in at the door and watch the count update live.",
        icon: "qr",
      },
      {
        title: "Sales attribution",
        desc: "See revenue by post and channel, from first view to door scan.",
        icon: "chart",
      },
      {
        title: "Revenue view",
        desc: "Track gross, fees and payouts per event, without a spreadsheet.",
        icon: "wallet",
      },
    ],
  },
  {
    category: "Manage",
    subtitle: "Keep every guest and conversation in one place.",
    features: [
      {
        title: "Unified inbox",
        desc: "Messages from Instagram, TikTok, WhatsApp, Facebook and email in one thread list.",
        icon: "inbox",
      },
      {
        title: "CRM sync",
        desc: "Push leads to HubSpot, Salesforce, Pipedrive, Zoho, Google Sheets or Zapier.",
        icon: "contact",
      },
      {
        title: "Audience groups",
        desc: "Segment past guests and invite the right group to the next event.",
        icon: "users",
      },
      {
        title: "AI agent",
        desc: "Spots slow sales, explains why, and drafts the fix. You approve before it posts.",
        icon: "sparkles",
      },
    ],
  },
];
