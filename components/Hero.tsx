"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, Wand2, Play } from "lucide-react";

const eventTypes = [
  "Birthday",
  "Baby Shower",
  "Graduation",
  "Wedding",
  "Corporate Event",
  "Networking",
  "Fundraiser",
  "Community Event",
  "Private Dinner",
];

const guestCounts = [
  "Up to 25 guests",
  "25–50 guests",
  "50–100 guests",
  "100–250 guests",
  "250+ guests",
];

const guestLists = [
  "Family",
  "Close Friends",
  "Work Colleagues",
  "Neighbors",
  "VIP Guests",
];

const tabs = ["AI Create", "Template", "Upload Existing"];

export default function Hero() {
  const [activeTab, setActiveTab] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [guestList, setGuestList] = useState("");
  const [generating, setGenerating] = useState(false);

  const examples = [
    "A whimsical garden birthday party for my daughter turning 5",
    "An elegant black-tie wedding reception for 150 guests",
    "A casual corporate networking night downtown",
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1800));
    setGenerating(false);
    alert("🎉 Your event has been generated! (Demo)");
  };

  return (
    <section className="hero-section">
      {/* Ambient glow orbs */}
      <div className="hero-glow-purple" />
      <div className="hero-glow-gold" />

      {/* Side Ambient Orbs & Rings (responsive styling handles visibility/sizing) */}
      <div className="hero-orb hero-orb-purple-left" />
      <div className="hero-orb hero-orb-gold-right" />
      <div className="hero-ring hero-ring-left" />
      <div className="hero-ring hero-ring-right" />

      {/* Twinkling Sparkles, Stars, and Particles on Left Edge */}
      <div className="hero-decorations-container left-edge">
        <div className="hero-particle particle-1" />
        <div className="hero-star star-1">✦</div>
        <Sparkles className="hero-deco-sparkle sparkle-1" />
        <div className="hero-dot dot-1" />
        <Sparkles className="hero-deco-sparkle sparkle-2 hero-deco-sparkle-purple" />
        <div className="hero-star star-2">✦</div>
      </div>

      {/* Twinkling Sparkles, Stars, and Particles on Right Edge */}
      <div className="hero-decorations-container right-edge">
        <div className="hero-particle particle-2" />
        <Sparkles className="hero-deco-sparkle sparkle-3" />
        <div className="hero-star star-3">✦</div>
        <div className="hero-dot dot-2" />
        <Sparkles className="hero-deco-sparkle sparkle-4 hero-deco-sparkle-purple" />
        <div className="hero-particle particle-3" />
      </div>

      {/* Mobile-friendly sparkles (visible on mobile only, hidden on larger screens via CSS) */}
      <div className="hero-mobile-sparkles">
        <Sparkles className="hero-deco-sparkle sparkle-m1" />
        <Sparkles className="hero-deco-sparkle sparkle-m2" />
      </div>

      {/* Main two-column layout */}
      <div className="hero-content">
        {/* ─── Left Column: Text + Form ─── */}
        <div className="hero-left">
          {/* AI Badge */}
          <div className="hero-ai-badge">
            <Sparkles className="sparkle-icon" />
            <span>AI-Powered Event Operating System</span>
          </div>

          {/* Soft ambient glow behind heading */}
          <div className="hero-heading-glow" />

          {/* Heading */}
          <h1 className="hero-heading">
            <span className="hero-heading-line">Create Any Event</span>
            <span className="hero-heading-line">
              <span className="gold-accent">in Under</span>
            </span>
            <span className="hero-heading-line">
              <span className="gold-accent">60 Seconds</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            Invitations, RSVPs, Ticketing, Check-In, Guest Management and AI
            Planning — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons">
            <a href="#hero-form" className="hero-btn hero-btn-primary">
              <Wand2 className="btn-icon" style={{ width: 16, height: 16 }} />
              Start Creating Free
            </a>
            <button className="hero-btn hero-btn-secondary">
              <Play style={{ width: 14, height: 14 }} />
              Watch Demo
            </button>
          </div>

          {/* Social Proof */}
          <div className="hero-social-proof">
            <div className="hero-avatar-stack">
              {[
                { bg: "#9070c0", init: "AK" },
                { bg: "#C9A84C", init: "MR" },
                { bg: "#7A9E7E", init: "SJ" },
                { bg: "#E8C4B8", init: "PL" },
              ].map((a, i) => (
                <div
                  key={i}
                  className="hero-avatar"
                  style={{ backgroundColor: a.bg, zIndex: 4 - i }}
                >
                  {a.init}
                </div>
              ))}
            </div>
            <div className="hero-social-text">
              <span className="hero-stars">★★★★★ 4.9/5</span>
              <span className="hero-social-label">
                Trusted by 10,000+ Event Creators
              </span>
            </div>
          </div>

          {/* Form card */}
          <div id="hero-form" className="hero-form-card">
            {/* Tabs */}
            <div className="flex gap-1 bg-[#F0EBE8] rounded-xl p-1 mb-5">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 text-xs font-medium py-2 px-3 rounded-lg transition-all ${
                    activeTab === i
                      ? "bg-white text-[#2D1B3D] shadow-sm"
                      : "text-[#2D1B3D]/50 hover:text-[#2D1B3D]/70"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 0 && (
              <div className="space-y-4">
                {/* Prompt textarea */}
                <div>
                  <label className="block text-xs font-medium text-[#2D1B3D]/60 mb-1.5">
                    Describe your event and let AI build it
                  </label>
                  <textarea
                    rows={2}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={examples[0]}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-[#E8C4B8]/50 bg-[#FAF8F5] text-[#2D1B3D] placeholder-[#2D1B3D]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 resize-none transition-all"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {examples.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setPrompt(ex)}
                        className="text-[10px] px-2 py-1 rounded-full bg-[#F0EBE8] text-[#2D1B3D]/60 hover:bg-[#E8C4B8]/40 hover:text-[#2D1B3D] transition-colors"
                      >
                        {ex.length > 38 ? ex.slice(0, 38) + "…" : ex}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Event type */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-[#2D1B3D]/60 mb-1.5">
                      Event Type
                    </label>
                    <div className="relative">
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 text-sm rounded-xl border border-[#E8C4B8]/50 bg-[#FAF8F5] text-[#2D1B3D] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 pr-9 cursor-pointer"
                      >
                        <option value="">Select event type</option>
                        {eventTypes.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D1B3D]/40 pointer-events-none" />
                    </div>
                  </div>

                  {/* Guest count */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-[#2D1B3D]/60 mb-1.5">
                      Guest Group
                    </label>
                    <div className="relative">
                      <select
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 text-sm rounded-xl border border-[#E8C4B8]/50 bg-[#FAF8F5] text-[#2D1B3D] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 pr-9 cursor-pointer"
                      >
                        <option value="">Estimated guest count</option>
                        {guestCounts.map((g) => (
                          <option key={g}>{g}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D1B3D]/40 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-medium text-[#2D1B3D]/60 mb-1.5">Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E8C4B8]/50 bg-[#FAF8F5] text-[#2D1B3D] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-xs font-medium text-[#2D1B3D]/60 mb-1.5">Time</label>
                    <input
                      type="time"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E8C4B8]/50 bg-[#FAF8F5] text-[#2D1B3D] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30"
                    />
                  </div>
                </div>

                {/* Guest list */}
                <div className="relative">
                  <label className="block text-xs font-medium text-[#2D1B3D]/60 mb-1.5">
                    Guest List
                  </label>
                  <div className="relative">
                    <select
                      value={guestList}
                      onChange={(e) => setGuestList(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 text-sm rounded-xl border border-[#E8C4B8]/50 bg-[#FAF8F5] text-[#2D1B3D] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 pr-9 cursor-pointer"
                    >
                      <option value="">Select a saved list</option>
                      {guestLists.map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                      <option>+ Create new list</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D1B3D]/40 pointer-events-none" />
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
                  style={{ backgroundColor: "#2D1B3D" }}
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-[#C9A84C]" />
                      Generate Event with AI
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 1 && (
              <div className="text-center py-10 text-[#2D1B3D]/40 text-sm">
                Browse hundreds of ready-made templates →{" "}
                <a href="#templates" className="underline text-[#C9A84C]">
                  See Templates
                </a>
              </div>
            )}

            {activeTab === 2 && (
              <div className="border-2 border-dashed border-[#E8C4B8]/60 rounded-xl p-10 text-center">
                <p className="text-[#2D1B3D]/40 text-sm">
                  Drag & drop an existing invitation image or PDF
                </p>
                <button className="mt-3 text-xs font-medium text-[#C9A84C] hover:underline">
                  or click to upload
                </button>
              </div>
            )}
          </div>
        </div>


      </div>
    </section>
  );
}
