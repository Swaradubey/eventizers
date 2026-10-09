"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  CalendarDays,
  Ticket,
  ScanLine,
  CalendarRange,
  Users,
  MessagesSquare,
  BarChart3,
  Link2,
  Bell,
  X,
  Play,
  ArrowUp,
  Eye,
  Check,
  MoreHorizontal,
} from "lucide-react";

const NOTIFICATIONS = [
  { id: "n1", time: "12 min ago", text: "Ticket sales increased 34% today.", tone: "good" },
  { id: "n2", time: "1 hr ago", text: "Instagram Reel #4 is outperforming your average campaign by 82%.", tone: "good" },
  { id: "n3", time: "3 hrs ago", text: "TikTok engagement is high but RSVP conversion is low.", tone: "warn" },
  { id: "n4", time: "Yesterday", text: "Sunday Rooftop reached 80% capacity.", tone: "good" },
  { id: "n5", time: "Yesterday", text: "NYC Rooftop Halloween is 9 days away and 173 spots remain.", tone: "warn" },
];

const AI_PROMPTS = [
  "How is my event doing?",
  "Which channel is performing best?",
  "Why are ticket sales slowing?",
  "How many more RSVPs do I need?",
  "What should I post tonight?",
  "Create another campaign.",
];

const AI_KNOWLEDGE = [
  {
    match: /how is my event|event doing/i,
    text: "You are at 327 confirmed guests against a goal of 500. You are pacing about 18% below the target needed to reach capacity by October 31. Instagram generated 61% of new RSVPs over the last seven days. Your Breaking News video converted at 8.2%, compared with 3.1% for standard posts. I recommend publishing another variation tonight on Instagram and TikTok.",
    action: "Create a new Breaking News variation",
  },
  {
    match: /channel|performing best/i,
    text: "Instagram leads with 281 RSVPs and $7,785 in revenue. TikTok brings strong reach (17.1K) but converts at roughly 1.1% to RSVP, so it is filling the top of the funnel rather than the event. Direct sharing is small but converts at 16% to RSVP.",
    action: "Create a TikTok variation with a stronger call to action",
  },
  {
    match: /slow|ticket sales/i,
    text: "Ticket sales slowed 22% over the last 48 hours. You have not published since Monday, and your cinematic countdown content historically performs best 5 to 7 days before an event. Instagram remains your highest-converting channel.",
    action: "Create a 10-second countdown Reel",
  },
  {
    match: /rsvp|how many more/i,
    text: "You need 173 more confirmed guests in 9 days, which is about 19 a day. Over the last week you averaged 15 a day. Closing the gap needs roughly 4 more RSVPs daily.",
    action: "Create a Fill Remaining Spots campaign",
  },
  {
    match: /post tonight|tonight/i,
    text: 'Post between 6 and 9 PM, when your audience is most active. A 12-second Reel with the social proof line "327 people are already going" matches your best-performing format.',
    action: "Generate tonight's social proof Reel",
  },
  {
    match: /campaign|create/i,
    text: "I can build a full campaign from your invitation, photos and ticket price: launch video, reel, TikTok, story countdown, social proof, reminder, FOMO and last call. Everything is scheduled across your connected channels once you approve.",
    action: "Generate event campaign",
  },
];

const NAV_ITEMS = [
  { label: "Overview", href: "/pro/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Events", href: "/pro/dashboard/events", icon: CalendarDays },
  { label: "Ticketing", href: "/pro/dashboard/tickets", icon: Ticket },
  { label: "Check-in", href: "/pro/dashboard/check-in", icon: ScanLine },
  { label: "Content management", href: "/pro/dashboard/content", icon: CalendarRange },
  { label: "Audience", href: "/pro/dashboard/audience", icon: Users },
  { label: "Leads & CRM", href: "/pro/dashboard/crm", icon: MessagesSquare },
  { label: "Analytics", href: "/pro/dashboard/analytics", icon: BarChart3 },
  { label: "AI Agent", href: "/pro/dashboard/ai", icon: Sparkles },
  { label: "Connections", href: "/pro/dashboard/connections", icon: Link2 },
];

const MOBILE_PRIMARY_NAV = ["Overview", "Events", "Ticketing", "Check-in", "Content management"];

export default function OrganizerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [moreNavOpen, setMoreNavOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  // AI chat states
  const [aiMessages, setAiMessages] = useState<Array<{
    id: string;
    role: "ai" | "user";
    text: string;
    action?: {
      label: string;
      stage: "idle" | "generating" | "ready" | "scheduled";
    };
  }>>([
    {
      id: "init",
      role: "ai",
      text: "Hi Alex. I can see all of your events, channels and campaigns. Ask me anything, or pick a question below.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [previewSnippetOpen, setPreviewSnippetOpen] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close overlays on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNotificationsOpen(false);
        setMoreNavOpen(false);
        setAiAssistantOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Scroll AI messages to bottom
  useEffect(() => {
    if (aiAssistantOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiMessages, aiThinking, aiAssistantOpen]);

  const handleSendAi = (textToSend?: string) => {
    const q = (textToSend ?? aiInput).trim();
    if (!q) return;

    const userMsgId = String(Date.now());
    setAiMessages((prev) => [...prev, { id: userMsgId, role: "user", text: q }]);
    setAiInput("");
    setAiThinking(true);

    setTimeout(() => {
      const matched = AI_KNOWLEDGE.find((k) => k.match.test(q));
      const aiResponse = matched
        ? {
            id: String(Date.now() + 1),
            role: "ai" as const,
            text: matched.text,
            action: matched.action ? { label: matched.action, stage: "idle" as const } : undefined,
          }
        : {
            id: String(Date.now() + 1),
            role: "ai" as const,
            text: "Right now NYC Rooftop Halloween has 327 of 500 guests confirmed and $18,540 in ticket revenue. Ask me about channels, content, pacing or what to post next and I will go deeper.",
          };

      setAiMessages((prev) => [...prev, aiResponse]);
      setAiThinking(false);
    }, 800);
  };

  const handleGenerateAction = (msgId: string) => {
    setAiMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.action
          ? { ...m, action: { ...m.action, stage: "generating" } }
          : m
      )
    );
    setTimeout(() => {
      setAiMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.action
            ? { ...m, action: { ...m.action, stage: "ready" } }
            : m
        )
      );
    }, 1700);
  };

  const handleApproveAction = (msgId: string) => {
    setAiMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.action
          ? { ...m, action: { ...m.action, stage: "scheduled" } }
          : m
      )
    );
  };

  const isItemActive = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname?.startsWith(item.href + "/");
  };

  return (
    <div className="eventizers-root min-h-svh bg-background text-foreground selection:bg-primary selection:text-primary-foreground lg:grid lg:grid-cols-[264px_1fr]">
      {/* ============================================================== */}
      {/* Desktop Sidebar */}
      {/* ============================================================== */}
      <aside
        className="sticky top-0 hidden h-svh flex-col gap-8 border-r border-white/10 px-5 py-6 lg:flex"
        aria-label="Organizer"
      >
        {/* Brand logo */}
        <div className="flex items-center gap-2">
          <Link href="/pro/dashboard" aria-label="Eventizers home" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight">eventizers</span>
          </Link>
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary-foreground">
            Pro
          </span>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center gap-3 rounded-2xl px-3.5 text-[15px] font-medium transition ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-foreground/70 hover:bg-white/6 hover:text-foreground"
                }`}
              >
                <item.icon className="size-[18px]" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile card */}
        <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-sm font-extrabold text-primary-foreground"
            aria-label="Alex, organizer"
            role="img"
          >
            A
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Alex Rivera</p>
            <p className="truncate text-xs text-foreground/55">Eventizers Events</p>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* Main Content wrapper */}
      {/* ============================================================== */}
      <div className="min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-[4.25rem] items-center justify-between gap-3 border-b border-white/10 bg-background/85 px-4 backdrop-blur-xl sm:px-6">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/pro/dashboard" aria-label="Eventizers home" className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight">eventizers</span>
            </Link>
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary-foreground">
              Pro
            </span>
          </div>

          <p className="hidden text-sm text-foreground/55 lg:block">
            Eventizers Pro · Organizer dashboard
          </p>

          <div className="flex items-center gap-2">
            {/* Desktop Ask AI button */}
            <button
              type="button"
              onClick={() => setAiAssistantOpen(true)}
              className="h-12 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-bold text-primary-foreground shadow-[0_10px_34px_-8px_var(--primary)] transition active:scale-95 hidden lg:flex"
            >
              <Sparkles className="size-[18px]" aria-hidden="true" /> Ask Eventizers AI
            </button>

            {/* Notifications toggle button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((prev) => !prev)}
                aria-label={`Notifications, ${NOTIFICATIONS.length} new`}
                aria-expanded={notificationsOpen}
                className="relative grid size-11 place-items-center rounded-full bg-white/8 transition active:scale-95 hover:bg-white/12"
              >
                <Bell className="size-5" aria-hidden="true" />
                <span className="absolute right-2.5 top-2.5 size-2.5 rounded-full bg-accent ring-2 ring-background" />
              </button>

              {/* Notifications Popover */}
              {notificationsOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close notifications"
                    className="fixed inset-0 z-40 cursor-default bg-transparent"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div
                    role="dialog"
                    aria-label="Notifications"
                    className="fixed inset-x-3 top-[4.5rem] z-50 origin-top-right overflow-hidden rounded-3xl border border-white/10 bg-[#12181d] shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-[3.25rem] sm:w-[380px]"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                      <h2 className="font-display text-base font-extrabold">Notifications</h2>
                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        aria-label="Close"
                        className="grid size-9 place-items-center rounded-full bg-white/8 hover:bg-white/15 transition"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <ul className="max-h-[60svh] divide-y divide-white/8 overflow-y-auto">
                      {NOTIFICATIONS.map((item) => (
                        <li key={item.id} className="flex gap-3 px-5 py-3.5">
                          <span
                            className={`mt-1.5 size-2 shrink-0 rounded-full ${
                              item.tone === "good" ? "bg-positive" : "bg-primary"
                            }`}
                            aria-hidden="true"
                          />
                          <div>
                            <p className="text-[14px] leading-snug">{item.text}</p>
                            <p className="mt-1 text-xs text-foreground/45">{item.time}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Organizer Avatar */}
            <div className="lg:hidden">
              <span
                className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-sm font-extrabold text-primary-foreground"
                aria-label="Alex, organizer"
                role="img"
              >
                A
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="mx-auto w-full max-w-[1180px] px-4 pb-44 pt-6 sm:px-6 lg:pb-16 lg:pt-8">
          {children}
        </main>
      </div>

      {/* ============================================================== */}
      {/* Mobile Floating Action Button */}
      {/* ============================================================== */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setAiAssistantOpen(true)}
          className="flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-bold text-primary-foreground shadow-[0_10px_34px_-8px_var(--primary)] transition active:scale-95 pointer-events-auto"
        >
          <Sparkles className="size-[18px]" aria-hidden="true" /> Ask Eventizers AI
        </button>
      </div>

      {/* ============================================================== */}
      {/* Mobile Bottom Navigation Bar */}
      {/* ============================================================== */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-background/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2">
          {NAV_ITEMS.filter((i) => MOBILE_PRIMARY_NAV.includes(i.label)).map((item) => {
            const active = isItemActive(item);
            return (
              <li key={item.label} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[4.25rem] flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
                    active ? "text-primary" : "text-foreground/60"
                  }`}
                >
                  <item.icon className="size-[22px]" aria-hidden="true" />
                  {item.label === "Content management" ? "Content" : item.label}
                </Link>
              </li>
            );
          })}
          {/* More link opens drawer */}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreNavOpen(true)}
              aria-haspopup="dialog"
              className="flex min-h-[4.25rem] w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold text-foreground/60"
            >
              <MoreHorizontal className="size-[22px]" aria-hidden="true" />
              More
            </button>
          </li>
        </ul>
      </nav>

      {/* ============================================================== */}
      {/* Mobile More Navigation Drawer Sheet */}
      {/* ============================================================== */}
      {moreNavOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[55] bg-black/60 cursor-default"
            onClick={() => setMoreNavOpen(false)}
          />
          <div
            role="dialog"
            aria-label="More"
            className="fixed inset-x-0 bottom-0 z-[56] rounded-t-[2rem] border border-white/10 bg-[#12181d] p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:hidden animate-in slide-in-from-bottom duration-300"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold">More</h2>
              <button
                type="button"
                onClick={() => setMoreNavOpen(false)}
                aria-label="Close"
                className="grid size-11 place-items-center rounded-full bg-white/8 hover:bg-white/15 transition"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-3">
              {NAV_ITEMS.filter((i) => !MOBILE_PRIMARY_NAV.includes(i.label)).map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setMoreNavOpen(false)}
                    className="flex h-16 items-center gap-3 rounded-2xl bg-white/7 px-4 text-[15px] font-semibold transition active:scale-95 hover:bg-white/10"
                  >
                    <item.icon className="size-5 text-primary" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* Eventizers AI Assistant Modal / Drawer */}
      {/* ============================================================== */}
      {aiAssistantOpen && (
        <>
          <button
            type="button"
            aria-label="Close assistant"
            onClick={() => setAiAssistantOpen(false)}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px] cursor-default"
          />
          <aside
            role="dialog"
            aria-label="Eventizers AI assistant"
            className="fixed inset-x-0 bottom-0 z-[61] flex h-[86svh] flex-col overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#12181d] sm:inset-y-0 sm:left-auto sm:right-0 sm:h-svh sm:w-[440px] sm:rounded-none sm:rounded-l-[2rem] animate-in slide-in-from-right duration-300"
          >
            {/* AI Assistant Header */}
            <header className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Sparkles className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-extrabold leading-none">Eventizers AI</h2>
                  <p className="mt-1 text-xs text-foreground/55">
                    Knows every event, channel and campaign
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiAssistantOpen(false)}
                aria-label="Close"
                className="grid size-11 place-items-center rounded-full bg-white/8 transition hover:bg-white/15 active:scale-95"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </header>

            {/* AI Assistant Chat Body */}
            <div className="flex min-h-0 flex-1 flex-col">
              <div
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
                role="log"
                aria-live="polite"
              >
                <ul className="flex flex-col gap-3">
                  {aiMessages.map((msg) => (
                    <li
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-3xl px-4 py-3 text-[14px] leading-relaxed ${
                          msg.role === "user"
                            ? "rounded-br-lg bg-primary text-primary-foreground font-medium"
                            : "rounded-bl-lg bg-white/8 text-foreground"
                        }`}
                      >
                        <p>{msg.text}</p>

                        {/* Interactive Suggestion / Action Card */}
                        {msg.action && (
                          <div className="mt-3 rounded-2xl border border-white/12 bg-white/5 p-3.5">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary">
                              Suggested action
                            </p>
                            <p className="mt-1 text-[13px] font-semibold">{msg.action.label}</p>

                            <div className="mt-3">
                              {msg.action.stage === "idle" && (
                                <button
                                  type="button"
                                  onClick={() => handleGenerateAction(msg.id)}
                                  className="flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground shadow-md transition hover:brightness-110 active:scale-95"
                                >
                                  <Sparkles className="size-3.5" aria-hidden="true" /> Generate campaign
                                </button>
                              )}

                              {msg.action.stage === "generating" && (
                                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                  <span className="size-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                  Creating video reel &amp; copy…
                                </div>
                              )}

                              {(msg.action.stage === "ready" ||
                                msg.action.stage === "scheduled") && (
                                <div className="mt-3 flex items-center gap-3">
                                  <div className="relative aspect-[9/16] w-16 shrink-0 overflow-hidden rounded-xl bg-black">
                                    <img
                                      src="/images/halloween-costume.png"
                                      alt=""
                                      className="size-full object-cover"
                                    />
                                    <span className="absolute inset-0 grid place-items-center bg-black/25">
                                      <Play
                                        className="size-5 fill-foreground text-foreground"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  </div>
                                  <p className="min-w-0 text-[13px] leading-snug text-foreground/75">
                                    10-second Reel · Instagram + TikTok · Tonight 7:30 PM
                                  </p>
                                </div>
                              )}

                              {msg.action.stage === "ready" && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPreviewSnippetOpen((prev) => ({
                                        ...prev,
                                        [msg.id]: !prev[msg.id],
                                      }))
                                    }
                                    className="flex h-11 items-center gap-1.5 rounded-full bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/15 active:scale-95"
                                  >
                                    <Eye className="size-4" aria-hidden="true" /> Preview
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveAction(msg.id)}
                                    className="flex h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:brightness-110 active:scale-95"
                                  >
                                    <Check className="size-4" aria-hidden="true" /> Approve &amp; schedule
                                  </button>
                                </div>
                              )}

                              {previewSnippetOpen[msg.id] && msg.action.stage === "ready" && (
                                <p className="mt-3 rounded-xl bg-black/30 p-3 text-[13px] leading-relaxed text-foreground/80">
                                  “327 people are already going. 173 spots left. Halloween night, above the skyline.”
                                  <span className="mt-1 block text-foreground/50">
                                    Caption · #NYCHalloween · CTA: Get tickets
                                  </span>
                                </p>
                              )}

                              {msg.action.stage === "scheduled" && (
                                <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-positive">
                                  <Check className="size-4" aria-hidden="true" /> Scheduled. I&apos;ll report results tomorrow morning.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}

                  {/* Thinking Indicator */}
                  {aiThinking && (
                    <li className="flex">
                      <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-lg bg-white/8 px-4 py-4">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="size-2 rounded-full bg-foreground/60 animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                          />
                        ))}
                      </div>
                    </li>
                  )}
                </ul>
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions Carousel & Input Form */}
              <div className="border-t border-white/10 bg-background/60 p-3">
                <div className="-mx-3 mb-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none]">
                  {AI_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSendAi(prompt)}
                      className="h-10 shrink-0 rounded-full border border-white/12 bg-white/5 px-4 text-[13px] font-medium transition hover:bg-white/10 active:scale-95 whitespace-nowrap"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAi();
                  }}
                  className="flex items-center gap-2"
                >
                  <label htmlFor="ask-ai-input" className="sr-only">
                    Ask Eventizers AI
                  </label>
                  <input
                    id="ask-ai-input"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask about your events…"
                    autoComplete="off"
                    className="h-12 min-w-0 flex-1 rounded-full border border-white/12 bg-white/6 px-5 text-base placeholder:text-foreground/45 focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Send"
                    disabled={!aiInput.trim()}
                    className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition active:scale-95 disabled:opacity-40"
                  >
                    <ArrowUp className="size-5" aria-hidden="true" />
                  </button>
                </form>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
