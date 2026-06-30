"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, Wand2 } from "lucide-react";

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
    <section className="relative min-h-screen pt-28 pb-20 overflow-hidden bg-[#FAF8F5]">
      {/* Decorative background blobs */}
      <div
        className="absolute top-10 right-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, #E8C4B8 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, #7A9E7E 0%, transparent 70%)",
        }}
      />

      {/* Floating invitation previews */}
      <div className="absolute left-4 top-32 hidden lg:block animate-[float_6s_ease-in-out_infinite]">
        <div className="invite-card card-border-gold w-48 overflow-hidden shadow-xl rotate-[-6deg]">
          <div
            className="h-20 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #f9c5d1 0%, #f5a7b8 100%)",
            }}
          >
            <span className="text-4xl">🎂</span>
          </div>
          <div className="p-3">
            <p className="text-[9px] uppercase tracking-widest text-[#2D1B3D]/40 mb-0.5">Birthday</p>
            <p
              className="font-display text-sm font-semibold text-[#2D1B3D]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Maya&apos;s 5th Birthday
            </p>
            <p className="text-[10px] text-[#2D1B3D]/50 mt-1">Sat, June 14 · 2:00 PM</p>
            <p className="text-[10px] text-[#2D1B3D]/40">Hosted by The Patels</p>
          </div>
        </div>
      </div>

      <div className="absolute right-4 top-40 hidden lg:block animate-[float_5s_ease-in-out_1s_infinite]">
        <div className="invite-card card-border-gold w-48 overflow-hidden shadow-xl rotate-[5deg]">
          <div
            className="h-20 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #d4b8e8 0%, #b8a0d4 100%)",
            }}
          >
            <span className="text-4xl">💍</span>
          </div>
          <div className="p-3">
            <p className="text-[9px] uppercase tracking-widest text-[#2D1B3D]/40 mb-0.5">Wedding</p>
            <p
              className="font-display text-sm font-semibold text-[#2D1B3D]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Liam &amp; Sofia
            </p>
            <p className="text-[10px] text-[#2D1B3D]/50 mt-1">Sept 21 · 5:00 PM</p>
            <p className="text-[10px] text-[#2D1B3D]/40">Vineyard Estate</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2D1B3D]/5 border border-[#C9A84C]/20 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span className="text-xs font-medium text-[#2D1B3D]/70">
            AI-Powered Event Operating System
          </span>
        </div>

        <h1
          className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-[#2D1B3D] leading-[1.08] mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Create Any Event{" "}
          <span className="italic gold-shimmer">in Under</span>
          <br />
          <span className="gold-shimmer">60 Seconds</span>
        </h1>

        <p className="text-base md:text-lg text-[#2D1B3D]/60 max-w-xl mx-auto mb-10 leading-relaxed">
          Invitations, RSVPs, Ticketing, Check-In, Guest Management and AI Planning — all in one place.
        </p>

        {/* Form card */}
        <div
          id="hero-form"
          className="bg-white rounded-2xl shadow-xl border border-[#E8C4B8]/30 p-6 text-left"
        >
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
    </section>
  );
}
