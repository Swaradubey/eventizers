"use client";

import { useState, useEffect } from "react";
import { Sparkles, ChevronDown, Wand2, Play } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import templateService, { Template } from "../services/templateService";
import eventService from "../services/eventService";
import API from "../services/api";
import { getImageUrl } from "../utils/imageUrl";

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

import { NEW_FALLBACK_TEMPLATES, NEW_TEMPLATE_IMAGES } from "../lib/newTemplatesData";
import { templateCards, matchesCategory } from "../lib/templateData";

const fallbackTemplates: Template[] = templateCards.map((tc) => ({
  id: tc.id,
  name: tc.title,
  category: tc.category || tc.type,
  content: JSON.stringify({
    gradient: tc.gradient,
    accentColor: tc.accentColor,
    emoji: tc.emoji,
    host: tc.host,
    venue: tc.venue,
    description: tc.description,
    image: tc.image
  }),
  isPremium: false
}));

const getTemplateImage = (templateId?: string | null) => {
  if (!templateId) return null;
  const card = templateCards.find(c => c.id === templateId);
  if (card?.image) return card.image;
  return NEW_TEMPLATE_IMAGES[templateId] || null;
};

const getCardImageUrl = (tpl: any) => {
  let url = null;
  if (tpl.imageUrl) url = tpl.imageUrl;
  else if (tpl.content) {
    try {
      const parsed = JSON.parse(tpl.content);
      if (parsed.image) url = parsed.image;
    } catch (e) {}
  }
  if (!url) url = getTemplateImage(tpl.id);
  return getImageUrl(url);
};

const tabs = ["AI Create", "Template", "Upload Existing"];

export default function Hero() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [guestList, setGuestList] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiEventData, setAiEventData] = useState<any | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);

  // Template tab states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateVenue, setTemplateVenue] = useState("");
  const [templateDate, setTemplateDate] = useState("");
  const [templateTime, setTemplateTime] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const examples = [
    "A whimsical garden birthday party for my daughter turning 5",
    "An elegant black-tie wedding reception for 150 guests",
    "A casual corporate networking night downtown",
  ];

  // Fetch templates when tab is activated
  useEffect(() => {
    if (activeTab === 1 && templates.length === 0) {
      const fetchTemplates = async () => {
        setLoadingTemplates(true);
        setErrorMsg(null);
        try {
          const data = await templateService.getTemplates();
          const mergedMap = new Map<string, Template>();
          fallbackTemplates.forEach(t => mergedMap.set(t.id, t));
          if (data && data.length > 0) {
            data.forEach(t => mergedMap.set(t.id, t));
          }
          const combined = Array.from(mergedMap.values());
          setTemplates(combined);
          if (combined.length > 0) {
            setSelectedTemplateId(combined[0].id);
          }
        } catch (err: any) {
          console.error("Failed to load templates:", err);
          setTemplates(fallbackTemplates);
          setSelectedTemplateId(fallbackTemplates[0].id);
        } finally {
          setLoadingTemplates(false);
        }
      };
      fetchTemplates();
    }
  }, [activeTab, templates.length]);

  const handleGenerate = async () => {
    if (!user) {
      setErrorMsg("Please sign in first to generate an AI event.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (!prompt.trim()) {
      setErrorMsg("Please describe your event first.");
      return;
    }

    setGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setAiEventData(null);

    try {
      const res = await API.post("/ai/generate-event", {
        prompt: prompt.trim(),
        eventType: eventType || undefined,
        guestCount: guestCount || undefined,
        date: date || undefined,
        time: time || undefined,
        guestListName: guestList || undefined
      });

      if (res.data) {
        setAiEventData(res.data);
        setSuccessMsg("🎉 AI Event plan generated! Please review it below.");
      }
    } catch (err: any) {
      console.error("Frontend AI Create Request Failed:", err.response?.data || err.message || err);
      const status = err.response?.status;
      const serverError = err.response?.data?.error;

      if (
        status === 429 ||
        (serverError && (
          serverError.toLowerCase().includes("quota") ||
          serverError.toLowerCase().includes("unavailable") ||
          serverError.toLowerCase().includes("rate limit")
        ))
      ) {
        setErrorMsg(
          "Gemini service is temporarily unavailable. Please try again in a few moments."
        );
      } else if (
        status === 401 ||
        status === 403 ||
        (serverError && (
          serverError.toLowerCase().includes("invalid gemini api key") ||
          serverError.toLowerCase().includes("unauthorized")
        ))
      ) {
        setErrorMsg("Invalid Gemini API key.");
      } else if (
        serverError && serverError.toLowerCase().includes("gemini api key is not configured")
      ) {
        setErrorMsg("Gemini API key is not configured.");
      } else {
        setErrorMsg(serverError || "Failed to generate event with AI. Please try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAiEvent = async () => {
    if (!aiEventData || !user) return;

    setSavingEvent(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formattedDescription = `${aiEventData.description || ""}

✨ **Theme**: ${aiEventData.theme || "TBD"}
💰 **Estimated Budget**: ${aiEventData.estimatedBudget || "TBD"}

📅 **Schedule**:
${aiEventData.schedule?.map((item: string) => `• ${item}`).join('\n') || 'None'}

🎈 **Decor**:
${aiEventData.decor?.map((item: string) => `• ${item}`).join('\n') || 'None'}

🍴 **Food & Drink**:
${aiEventData.food?.map((item: string) => `• ${item}`).join('\n') || 'None'}

🎮 **Activities**:
${aiEventData.activities?.map((item: string) => `• ${item}`).join('\n') || 'None'}

✅ **Checklist**:
${aiEventData.checklist?.map((item: string) => `• ${item}`).join('\n') || 'None'}`;

      const res = await eventService.createEvent({
        title: aiEventData.title || "AI Generated Event",
        description: formattedDescription,
        venue: "TBD Venue",
        eventDate: date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        eventTime: time || "18:00",
        eventType: eventType || "Other",
        status: "draft",
      });

      if (res && res.success) {
        setSuccessMsg("🎉 Event created successfully and saved to your dashboard!");
        setAiEventData(null);
        setPrompt("");
        setEventType("");
        setGuestCount("");
        setDate("");
        setTime("");
        setGuestList("");
        setTimeout(() => {
          router.push("/dashboard/events");
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || "Failed to save event to dashboard.");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleCreateFromTemplate = async () => {
    if (!user) {
      setErrorMsg("Please sign in first to create an event.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (!templateTitle.trim() || !templateVenue.trim() || !templateDate || !templateTime) {
      setErrorMsg("Please fill in all fields (Title, Venue, Date, Time) to create the event.");
      return;
    }

    setCreatingEvent(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const selectedTpl = (templates.length > 0 ? templates : fallbackTemplates).find(t => t.id === selectedTemplateId);
      const res = await eventService.createEvent({
        title: templateTitle.trim(),
        venue: templateVenue.trim(),
        eventDate: templateDate,
        eventTime: templateTime,
        eventType: selectedTpl?.category || "Other",
        // @ts-ignore
        templateId: selectedTemplateId,
        selectedTemplateId: selectedTemplateId
      });

      if (res && res.success) {
        setSuccessMsg("🎉 Event created successfully from template!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || "Failed to create event from template.");
    } finally {
      setCreatingEvent(false);
    }
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
      <div className="hero-content !max-w-[1400px] !w-full !px-4 sm:!px-6 lg:!px-8 mx-auto">
        {/* ─── Left Column: Text + Form ─── */}
        <div className="hero-left !max-w-full">
          {/* AI Badge */}
          <div className="hero-ai-badge">
            <Sparkles className="sparkle-icon" />
            <span>AI-Powered Event Operating System</span>
          </div>

          {/* Soft ambient glow behind heading */}
          <div className="hero-heading-glow" />

          {/* Heading container with decorative cards */}
          <div className="hero-heading-container">
            {/* Left Decorative Invitation Card - Birthday */}
            <div className="hero-deco-card left-card" aria-hidden="true">
              <div className="hero-deco-card-inner">
                <div className="hero-deco-card-badge">BIRTHDAY</div>
                <div className="hero-deco-card-invite">You’re invited to</div>
                <div className="hero-deco-card-title">Maya’s 5th Birthday</div>
                <div className="hero-deco-card-details">Sat, June 14 · 2:00 PM</div>
                <div className="hero-deco-card-footer">Hosted by The Patels</div>
              </div>
            </div>

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

            {/* Right Decorative Invitation Card - Wedding */}
            <div className="hero-deco-card right-card" aria-hidden="true">
              <div className="hero-deco-card-inner">
                <div className="hero-deco-card-badge">WEDDING</div>
                <div className="hero-deco-card-invite">You’re invited to</div>
                <div className="hero-deco-card-title">Liam & Sofia</div>
                <div className="hero-deco-card-details">
                  Sept 21 · 5:00 PM
                  <br />
                  Vineyard Estate
                </div>
                <div className="hero-deco-card-footer">Together with their families</div>
              </div>
            </div>
          </div>

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
          <div id="hero-form" className="hero-form-card !max-w-[1400px] !w-full mx-auto">
            {/* Tabs */}
            <div className="flex p-1 bg-[#F5F2F0] rounded-[14px] mb-6 shadow-inner border border-[#E8C4B8]/30">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(i);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 text-[13px] font-semibold py-2 px-3 rounded-[10px] transition-all duration-200 ${
                    activeTab === i
                      ? "bg-white text-[#2D1B3D] shadow-[0_2px_8px_rgba(45,27,61,0.08)]"
                      : "text-[#2D1B3D]/50 hover:text-[#2D1B3D]/80 hover:bg-white/40"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Error/Success Feedbacks */}
            {errorMsg && (
              <div className="p-3 mb-4 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl transition-all">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 mb-4 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl transition-all">
                {successMsg}
              </div>
            )}

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
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E8C4B8]/50 bg-[#FAF8F5] text-[#2D1B3D] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-xs font-medium text-[#2D1B3D]/60 mb-1.5">Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
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

                {aiEventData && (
                  <div className="mt-6 p-5 bg-white border border-[#E8C4B8]/40 rounded-2xl shadow-inner text-left text-[#2D1B3D]/95 space-y-4 max-h-[500px] overflow-y-auto">
                    <div className="flex justify-between items-start border-b border-[#E8C4B8]/20 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#2D1B3D] leading-tight">
                          {aiEventData.title}
                        </h3>
                        <p className="text-[10px] text-[#2D1B3D]/60 mt-1">
                          ✨ Theme: <span className="font-semibold text-[#C9A84C]">{aiEventData.theme}</span>
                        </p>
                      </div>
                      <div className="bg-[#FAF8F5] px-2 py-0.5 rounded-lg border border-[#E8C4B8]/20 text-[9px] font-bold text-[#C9A84C] whitespace-nowrap">
                        Budget: {aiEventData.estimatedBudget}
                      </div>
                    </div>

                    <div className="text-[11px] leading-relaxed text-[#2D1B3D]/80">
                      <p>{aiEventData.description}</p>
                    </div>

                    {/* Timeline Schedule */}
                    {aiEventData.schedule && aiEventData.schedule.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-[#E8C4B8]/10">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                          📅 Proposed Timeline
                        </h4>
                        <ul className="space-y-0.5">
                          {aiEventData.schedule.map((item: string, idx: number) => (
                            <li key={idx} className="text-[11px] flex items-start gap-1">
                              <span className="text-[#C9A84C] shrink-0 font-semibold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Emojis/Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E8C4B8]/10 text-[11px]">
                      {/* Decor */}
                      {aiEventData.decor && aiEventData.decor.length > 0 && (
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-[#2D1B3D]/50 uppercase tracking-wider text-[10px]">
                            🎈 Decor Ideas
                          </h4>
                          <ul className="space-y-0.5 text-[#2D1B3D]/80">
                            {aiEventData.decor.map((item: string, idx: number) => (
                              <li key={idx}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Food */}
                      {aiEventData.food && aiEventData.food.length > 0 && (
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-[#2D1B3D]/50 uppercase tracking-wider text-[10px]">
                            🍴 Food & Drink
                          </h4>
                          <ul className="space-y-0.5 text-[#2D1B3D]/80">
                            {aiEventData.food.map((item: string, idx: number) => (
                              <li key={idx}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Activities */}
                      {aiEventData.activities && aiEventData.activities.length > 0 && (
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-[#2D1B3D]/50 uppercase tracking-wider text-[10px]">
                            🎮 Games & Activities
                          </h4>
                          <ul className="space-y-0.5 text-[#2D1B3D]/80">
                            {aiEventData.activities.map((item: string, idx: number) => (
                              <li key={idx}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Checklist */}
                      {aiEventData.checklist && aiEventData.checklist.length > 0 && (
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-[#2D1B3D]/50 uppercase tracking-wider text-[10px]">
                            ✅ Plan Checklist
                          </h4>
                          <ul className="space-y-0.5 text-[#2D1B3D]/80">
                            {aiEventData.checklist.map((item: string, idx: number) => (
                              <li key={idx}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-[#E8C4B8]/20">
                      <button
                        onClick={() => setAiEventData(null)}
                        disabled={savingEvent}
                        className="flex-1 py-2 rounded-xl border border-[#E8C4B8]/60 text-xs font-semibold text-[#2D1B3D] bg-white hover:bg-[#FAF8F5] active:scale-95 transition-all disabled:opacity-50"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleSaveAiEvent}
                        disabled={savingEvent}
                        className="flex-[2] py-2 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                        style={{ backgroundColor: "#2D1B3D" }}
                      >
                        {savingEvent ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving Event...
                          </>
                        ) : (
                          <>
                            Confirm & Create Event
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 1 && (
              <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Template Selection Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#2D1B3D]">Choose from editable templates</h3>
                  
                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "Wedding", "Baby Shower", "Corporate", "Birthday", "Community", "Networking", "Private Dinner", "Fundraiser", "Graduation"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 text-[11px] font-semibold rounded-full transition-all border ${
                          selectedCategory === cat 
                            ? "bg-[#9070c0] text-white border-[#9070c0] shadow-sm" 
                            : "bg-white text-[#2D1B3D]/60 border-[#E8C4B8]/50 hover:border-[#9070c0]/40 hover:text-[#2D1B3D]"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Templates Grid */}
                  {loadingTemplates ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="w-5 h-5 border-2 border-[#9070c0]/30 border-t-[#9070c0] rounded-full animate-spin" />
                      <span className="text-xs text-[#2D1B3D]/60 ml-3 font-medium">Loading templates...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                      {(templates.length > 0 ? templates : fallbackTemplates)
                        .filter(t => matchesCategory(t.category, selectedCategory))
                        .map(tpl => (
                        <div 
                          key={tpl.id}
                          onClick={() => setSelectedTemplateId(tpl.id)}
                          className={`group relative flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border bg-white ${
                            selectedTemplateId === tpl.id 
                              ? "border-[#9070c0] shadow-[0_4px_12px_rgba(144,112,192,0.2)] ring-1 ring-[#9070c0]" 
                              : "border-[#E8C4B8]/50 hover:border-[#9070c0]/50 hover:shadow-md hover:-translate-y-1"
                          }`}
                        >
                          {/* Preview Area */}
                          <div className="aspect-[4/3] w-full bg-gradient-to-br from-[#F5F2F0] to-[#E8C4B8]/20 relative overflow-hidden">
                             {getCardImageUrl(tpl) ? (
                               <>
                                 <img src={getCardImageUrl(tpl)!} alt={tpl.name} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                                 {/* Subtle dark gradient overlay */}
                                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                               </>
                             ) : (
                               <>
                                 <div className="absolute inset-0 bg-gradient-to-br from-[#9070c0]/5 to-[#C9A84C]/10 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-80" />
                                 <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-300">
                                    <Sparkles className="w-8 h-8" />
                                 </div>
                               </>
                             )}
                             {/* Selection indicator */}
                             <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${
                               selectedTemplateId === tpl.id ? "bg-[#9070c0] scale-100 opacity-100" : "bg-white/80 scale-75 opacity-0 group-hover:opacity-100"
                             }`}>
                               {selectedTemplateId === tpl.id && (
                                 <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                   <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                 </svg>
                               )}
                             </div>
                          </div>
                          {/* Card Content */}
                          <div className="p-3 flex flex-col gap-1 bg-white flex-1">
                             <span className="text-[9px] font-bold tracking-wider uppercase text-[#9070c0] truncate">{tpl.category}</span>
                             <h4 className="text-[11px] font-semibold text-[#2D1B3D] leading-snug line-clamp-2">{tpl.name}</h4>
                          </div>
                        </div>
                      ))}
                      {(templates.length > 0 ? templates : fallbackTemplates).filter(t => matchesCategory(t.category, selectedCategory)).length === 0 && (
                        <div className="col-span-full py-8 text-center text-[#2D1B3D]/50 text-xs">
                          No templates found for this category.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Event Details Form */}
                <div className="space-y-4 pt-5 border-t border-[#E8C4B8]/30">
                  <h4 className="text-xs font-semibold text-[#2D1B3D]/80 mb-2">Event Details</h4>
                  
                  {/* Select Template Dropdown */}
                  <div className="relative">
                    <div className="relative">
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 text-sm rounded-xl border border-[#E8C4B8]/50 bg-[#FAF8F5] text-[#2D1B3D] focus:outline-none focus:ring-2 focus:ring-[#9070c0]/30 pr-9 cursor-pointer font-medium transition-all hover:bg-white"
                      >
                        {(templates.length > 0 ? templates : fallbackTemplates).map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D1B3D]/40 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={templateTitle}
                        onChange={(e) => setTemplateTitle(e.target.value)}
                        placeholder="Event Title (e.g. Maya's 5th Birthday)"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E8C4B8]/50 bg-[#FAF8F5] text-[#2D1B3D] placeholder-[#2D1B3D]/40 focus:outline-none focus:ring-2 focus:ring-[#9070c0]/30 transition-all hover:bg-white"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={templateVenue}
                        onChange={(e) => setTemplateVenue(e.target.value)}
                        placeholder="Venue (e.g. Sweet Retreat Bakery)"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E8C4B8]/50 bg-[#FAF8F5] text-[#2D1B3D] placeholder-[#2D1B3D]/40 focus:outline-none focus:ring-2 focus:ring-[#9070c0]/30 transition-all hover:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="date"
                          value={templateDate}
                          onChange={(e) => setTemplateDate(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E8C4B8]/50 bg-[#FAF8F5] text-[#2D1B3D] focus:outline-none focus:ring-2 focus:ring-[#9070c0]/30 transition-all hover:bg-white"
                        />
                      </div>

                      <div>
                        <input
                          type="time"
                          value={templateTime}
                          onChange={(e) => setTemplateTime(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E8C4B8]/50 bg-[#FAF8F5] text-[#2D1B3D] focus:outline-none focus:ring-2 focus:ring-[#9070c0]/30 transition-all hover:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateFromTemplate}
                    disabled={creatingEvent}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0 mt-4"
                    style={{ backgroundColor: "#9070c0" }}
                  >
                    {creatingEvent ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating event…
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Create Event from Template
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="border-2 border-dashed border-[#E8C4B8]/60 rounded-xl p-10 text-center text-xs">
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
