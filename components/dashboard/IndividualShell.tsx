"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  LayoutDashboard,
  CalendarDays,
  Ticket,
  ScanLine,
  BarChart3,
  Link2,
  Bell,
  X,
  ChevronDown,
  ArrowUp,
  Check,
  MoreHorizontal,
  Loader2,
  LogOut,
  Plus,
  User,
  Settings,
} from "lucide-react";

const NOTIFICATIONS = [
  { id: "n1", time: "10 min ago", text: "RSVP confirmed: Sarah Jenkins + 1 guest.", tone: "good" },
  { id: "n2", time: "1 hr ago", text: "Your invitation was viewed 48 times today.", tone: "good" },
  { id: "n3", time: "3 hrs ago", text: "12 guests have not responded yet. Send a quick reminder.", tone: "warn" },
  { id: "n4", time: "Yesterday", text: "Check-in QR codes generated for all attendees.", tone: "good" },
  { id: "n5", time: "2 days ago", text: "Early bird tickets sold out for Summer Garden Soirée.", tone: "good" },
];

const AI_PROMPTS = [
  "How are my RSVPs tracking?",
  "How many guests haven't responded?",
  "Generate a reminder message for guests.",
  "What is my event check-in readiness?",
  "How can I boost attendance?",
  "Create a new invitation video.",
];

const AI_KNOWLEDGE = [
  {
    match: /rsvp|tracking|confirmed/i,
    text: "You have 142 confirmed RSVPs out of 180 invites sent (78.8% response rate). 26 invites are pending and 12 declined. Your engagement rate is 15% higher than typical private gatherings.",
    action: "Send reminder to 26 pending guests",
  },
  {
    match: /haven't responded|pending/i,
    text: "26 guests haven't responded yet. Peak response times are Friday evenings and Sunday mornings. Sending a quick WhatsApp or SMS nudge now usually recovers 60-70% of pending RSVPs.",
    action: "Draft gentle WhatsApp reminder",
  },
  {
    match: /reminder|message/i,
    text: 'Here is a recommended reminder: "Hey! We are finalizing guest counts and food prep for this weekend. Please confirm your RSVP by tomorrow so we can save your spot! Can\'t wait to celebrate with you."',
    action: "Copy reminder message",
  },
  {
    match: /check-in|qr|readiness/i,
    text: "Your event check-in portal is fully ready. QR passes have been generated for all 142 confirmed attendees. Staff can scan passes instantly using any smartphone camera.",
    action: "Open Check-In Scanner",
  },
  {
    match: /attendance|boost/i,
    text: "Add a 10-second video preview to your event link. Video invitations convert 42% higher and generate 2.5x more peer shares among friend groups.",
    action: "Generate 10-second preview video",
  },
  {
    match: /invitation|create|video/i,
    text: "I can craft a cinematic video invite with personalized music, dynamic typography, and instant RSVP buttons. Just provide an event photo or theme description.",
    action: "Create new invitation",
  },
];

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Events", href: "/dashboard/events", icon: CalendarDays },
  { label: "Ticketing", href: "/dashboard/ticketing", icon: Ticket },
  { label: "Check-in", href: "/dashboard/check-in", icon: ScanLine },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "AI Agent", href: "/dashboard/ai", icon: Sparkles },
  { label: "Connections", href: "/dashboard/connections", icon: Link2 },
];

const MOBILE_PRIMARY_NAV = ["Overview", "Events", "Ticketing", "Check-in"];

export default function IndividualShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [moreNavOpen, setMoreNavOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Authentication guard
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

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
      text: "Hi! I am your Eventizers AI co-pilot. I can help you track RSVPs, manage ticket sales, draft guest reminders, or optimize check-in. Ask me anything or pick an option below.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close overlays on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNotificationsOpen(false);
        setMoreNavOpen(false);
        setAiAssistantOpen(false);
        setProfileOpen(false);
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
            text: "Your events are currently running smoothly. You have 142 confirmed guests, 26 pending RSVPs, and 100% check-in scanner readiness. Ask me about guest pacing, reminders, or ticket options to dive deeper.",
          };

      setAiMessages((prev) => [...prev, aiResponse]);
      setAiThinking(false);
    }, 700);
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
    }, 1500);
  };

  const isItemActive = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname?.startsWith(item.href + "/");
  };

  // Derive user display info
  const displayName = user?.name || user?.email?.split("@")[0] || "Host";
  const userInitial = displayName.charAt(0).toUpperCase();

  // Show loading while checking auth
  if (authLoading || !user) {
    return (
      <div className="eventizers-root min-h-svh bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-foreground/55">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="individual-dashboard individual-shell dashboard-page eventizers-root min-h-svh bg-background text-foreground selection:bg-primary selection:text-primary-foreground lg:grid lg:grid-cols-[264px_1fr]">
      {/* ============================================================== */}
      {/* Desktop Sidebar */}
      {/* ============================================================== */}
      <aside
        className="sticky top-0 hidden h-svh flex-col gap-4 border-r border-white/10 px-5 pt-5 pb-6 lg:flex overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]"
        aria-label="Individual Dashboard"
      >
        {/* Brand logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" aria-label="Eventizers home" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <span
              className="font-display text-xl font-extrabold tracking-tight"
              style={{ fontFamily: "'Red Rose', Georgia, serif" }}
            >
              eventizers
            </span>
          </Link>
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
        <div className="rounded-2xl bg-white/5 p-3 shrink-0 mt-2">
          <div className="flex items-center gap-3">
            <span
              className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-sm font-extrabold text-primary-foreground"
              style={{ fontFamily: "'Red Rose', Georgia, serif" }}
              aria-label={`${displayName}, user`}
              role="img"
            >
              {userInitial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{displayName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-foreground/60 transition hover:bg-white/10 hover:text-red-400 cursor-pointer"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* Main Content wrapper */}
      {/* ============================================================== */}
      <div className="min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-[4.25rem] items-center justify-end gap-3 border-b border-white/10 bg-background/85 px-4 backdrop-blur-xl sm:px-6">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 lg:hidden">
<Link href="/" aria-label="Eventizers home" className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <span
                className="font-display text-xl font-extrabold tracking-tight"
                style={{ fontFamily: "'Red Rose', Georgia, serif" }}
              >
                eventizers
              </span>
            </Link>
          </div>

          {/* Right side actions group */}
          <div className="flex items-center gap-2 lg:flex">
            {/* Desktop Ask AI button */}
            <button
              type="button"
              onClick={() => setAiAssistantOpen(true)}
              className="h-12 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-bold text-primary-foreground shadow-[0_10px_34px_-8px_var(--primary)] transition active:scale-95 hidden lg:flex cursor-pointer"
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
                className="relative grid size-11 place-items-center rounded-full bg-white/8 transition active:scale-95 hover:bg-white/12 cursor-pointer"
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
                      <h2
                        className="font-display text-base font-extrabold"
                        style={{ fontFamily: "'Red Rose', Georgia, serif" }}
                      >
                        Notifications
                      </h2>
                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        aria-label="Close"
                        className="grid size-9 place-items-center rounded-full bg-white/8 hover:bg-white/15 transition cursor-pointer"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <ul className="max-h-[60svh] divide-y divide-white/8 overflow-y-auto">
                      {NOTIFICATIONS.map((item) => (
                        <li key={item.id} className="flex gap-3 px-5 py-3.5">
                          <span
                            className={`mt-1.5 size-2 shrink-0 rounded-full ${
                              item.tone === "good" ? "bg-emerald-400" : "bg-primary"
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

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-label="Profile menu"
                aria-expanded={profileOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 rounded-full bg-white/8 hover:bg-white/12 transition p-1 pr-3 cursor-pointer"
              >
                <span
                  className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-sm font-extrabold text-primary-foreground"
                  style={{ fontFamily: "'Red Rose', Georgia, serif" }}
                >
                  {userInitial}
                </span>
                <ChevronDown className="size-4 text-foreground/50 hidden sm:block" />
              </button>

              {profileOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setProfileOpen(false)}
                    aria-label="Close profile menu"
                  />
                  <div
                    role="menu"
                    aria-label="Profile menu"
                    className="fixed right-0 top-full mt-2 z-50 w-56 origin-top-right rounded-xl border border-white/10 bg-background shadow-2xl overflow-hidden py-1"
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="font-extrabold text-sm text-foreground font-display" style={{ fontFamily: "'Red Rose', Georgia, serif" }}>
                        {displayName}
                      </p>
                      <p className="text-xs text-foreground/45 truncate">
                        {(user as any)?.email || ''}
                      </p>
                    </div>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        router.push('/dashboard/settings');
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground/80 hover:bg-white/8 hover:text-foreground transition-colors cursor-pointer"
                    >
                      <User className="size-4 text-foreground/50" aria-hidden="true" />
                      Profile
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        router.push('/dashboard/settings');
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground/80 hover:bg-white/8 hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Settings className="size-4 text-foreground/50" aria-hidden="true" />
                      Settings
                    </button>
                    <hr className="my-1 border-white/10" />
                    <button
                      role="menuitem"
                      onClick={async () => {
                        setProfileOpen(false);
                        await handleLogout();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Avatar */}
            <div className="lg:hidden">
              <span
                className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-sm font-extrabold text-primary-foreground"
                style={{ fontFamily: "'Red Rose', Georgia, serif" }}
                aria-label={`${displayName}, user`}
                role="img"
              >
                {userInitial}
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
          className="flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-bold text-primary-foreground shadow-[0_10px_34px_-8px_var(--primary)] transition active:scale-95 pointer-events-auto cursor-pointer"
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
                  {item.label}
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
              className="flex min-h-[4.25rem] w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold text-foreground/60 cursor-pointer"
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
              <h2
                className="font-display text-xl font-extrabold"
                style={{ fontFamily: "'Red Rose', Georgia, serif" }}
              >
                More
              </h2>
              <button
                type="button"
                onClick={() => setMoreNavOpen(false)}
                aria-label="Close"
                className="grid size-11 place-items-center rounded-full bg-white/8 hover:bg-white/15 transition cursor-pointer"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.filter((i) => !MOBILE_PRIMARY_NAV.includes(i.label)).map((item) => {
                const active = isItemActive(item);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMoreNavOpen(false)}
                    className={`flex h-12 items-center gap-3 rounded-2xl px-4 text-base font-medium transition ${
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-foreground/75 hover:bg-white/6 hover:text-foreground"
                    }`}
                  >
                    <item.icon className="size-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => {
                  setMoreNavOpen(false);
                  handleLogout();
                }}
                className="flex h-12 w-full items-center gap-3 rounded-2xl px-4 text-base font-medium text-red-400 hover:bg-red-500/10 transition cursor-pointer"
              >
                <LogOut className="size-5" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* Ask Eventizers AI Assistant Drawer Modal */}
      {/* ============================================================== */}
      {aiAssistantOpen && (
        <>
          <button
            type="button"
            aria-label="Close AI Assistant"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs cursor-default"
            onClick={() => setAiAssistantOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Eventizers AI Assistant"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-white/10 bg-[#0f1418] shadow-2xl animate-in slide-in-from-right duration-300"
          >
            {/* AI Header */}
            <div className="flex h-[4.25rem] items-center justify-between border-b border-white/10 px-5 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Sparkles className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h2
                    className="font-display text-base font-extrabold leading-tight"
                    style={{ fontFamily: "'Red Rose', Georgia, serif" }}
                  >
                    Eventizers AI
                  </h2>
                  <p className="text-xs text-foreground/50">Your event co-pilot</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiAssistantOpen(false)}
                aria-label="Close AI Assistant"
                className="grid size-9 place-items-center rounded-full bg-white/8 hover:bg-white/15 transition cursor-pointer"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* AI Messages Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {aiMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground font-medium rounded-br-xs"
                        : "bg-white/[0.06] text-foreground/90 border border-white/10 rounded-bl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {msg.action && (
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-primary truncate">
                          {msg.action.label}
                        </span>
                        {msg.action.stage === "generating" ? (
                          <span className="flex items-center gap-1.5 text-xs text-primary font-bold">
                            <Loader2 className="size-3 animate-spin" /> Preparing...
                          </span>
                        ) : msg.action.stage === "ready" ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                            <Check className="size-3.5" /> Ready!
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleGenerateAction(msg.id)}
                            className="rounded-full bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1 text-xs font-bold transition cursor-pointer"
                          >
                            Execute
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {aiThinking && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-white/[0.06] px-4 py-3 border border-white/10 text-xs text-foreground/60">
                    <Loader2 className="size-3.5 animate-spin text-primary" />
                    <span>Analyzing your event data...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Quick Prompts Carousel */}
            <div className="px-5 py-2 overflow-x-auto flex gap-2 no-scrollbar shrink-0 border-t border-white/5 bg-white/[0.02]">
              {AI_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSendAi(prompt)}
                  className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-foreground/75 hover:bg-white/10 hover:text-foreground transition shrink-0 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* AI Chat Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAi();
              }}
              className="p-4 border-t border-white/10 flex items-center gap-2 shrink-0 bg-background/90"
            >
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask Eventizers AI about your events..."
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm placeholder:text-foreground/40 focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={!aiInput.trim() || aiThinking}
                aria-label="Send message"
                className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground transition active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <ArrowUp className="size-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
