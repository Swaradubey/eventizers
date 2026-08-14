"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  ChevronDown, 
  Wand2, 
  Send, 
  LayoutTemplate, 
  Upload, 
  Cake, 
  Heart, 
  SlidersHorizontal,
  FileUp,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import templateService, { Template } from "../services/templateService";
import eventService from "../services/eventService";
import API from "../services/api";
import { getImageUrl } from "../utils/imageUrl";
import { templateCards, matchesCategory } from "../lib/templateData";
import { NEW_TEMPLATE_IMAGES } from "../lib/newTemplatesData";

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

const tabs = [
  { id: 0, label: "AI Create", icon: Sparkles },
  { id: 1, label: "Template", icon: LayoutTemplate },
  { id: 2, label: "Upload Existing", icon: Upload },
];

export default function Hero() {
  const { user } = useAuth();
  const router = useRouter();

  // Tab 0: AI Create (Active by default)
  const [activeTab, setActiveTab] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [guestList, setGuestList] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiEventData, setAiEventData] = useState<any | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);

  // Tab 1: Template states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateVenue, setTemplateVenue] = useState("");
  const [templateDate, setTemplateDate] = useState("");
  const [templateTime, setTemplateTime] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [visibleCount, setVisibleCount] = useState(18);

  const filteredTemplates = useMemo(() => {
    const list = templates.length > 0 ? templates : fallbackTemplates;
    return list.filter((t) => matchesCategory(t.category, selectedCategory));
  }, [templates, selectedCategory]);

  const displayedTemplates = useMemo(() => {
    return filteredTemplates.slice(0, visibleCount);
  }, [filteredTemplates, visibleCount]);

  const handleTemplateScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 60) {
      if (visibleCount < filteredTemplates.length) {
        setVisibleCount((prev) => Math.min(prev + 18, filteredTemplates.length));
      }
    }
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const quickPrompts = [
    {
      label: "A whimsical garden birthday party for my daughter turning 5",
      promptText: "Plan a whimsical garden birthday party for my daughter turning 5 with pastel floral decor, face painting, acoustic fairy music, and kid-friendly treats under string lights.",
    },
    {
      label: "An elegant black-tie wedding reception for 150 guests",
      promptText: "An elegant black-tie wedding reception for 150 guests featuring candlelight dinner, live jazz quartet, champagne tower, and modern luxury floral arrangements.",
    },
  ];

  // Fetch templates when Template tab is activated
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
        guestListName: guestList || undefined,
      });

      if (res.data) {
        setAiEventData(res.data);
        setSuccessMsg("🎉 AI Event plan generated! Review your plan below.");
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
        setErrorMsg("Gemini service is temporarily busy. Please try again in a moment.");
      } else if (
        status === 401 ||
        status === 403 ||
        (serverError && (
          serverError.toLowerCase().includes("invalid gemini api key") ||
          serverError.toLowerCase().includes("unauthorized")
        ))
      ) {
        setErrorMsg("Invalid Gemini API key.");
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
      {/* Subtle cross grid background pattern */}
      <div className="hero-cross-grid" />

      {/* Atmospheric pastel glows */}
      <div className="hero-glow-left-pastel" />
      <div className="hero-glow-right-pastel" />
      <div className="hero-glow-top-warm" />

      {/* Subtle scattered gold/beige stars in atmosphere */}
      <span className="hero-gold-star top-[14%] left-[10%]">✦</span>
      <span className="hero-gold-star top-[25%] left-[5%] text-xs opacity-60">✦</span>
      <span className="hero-gold-star top-[15%] right-[10%]">✦</span>
      <span className="hero-gold-star top-[28%] right-[6%] text-xs opacity-60">✦</span>
      <span className="hero-gold-star top-[8%] left-[48%] text-[10px] opacity-40">✦</span>

      {/* Main Content */}
      <div className="hero-content">
        {/* Pill Badge */}
        <div className="hero-pill-badge">
          <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>AI-Powered Event Operating System</span>
        </div>

        {/* Main Headline */}
        <h1 className="hero-headline-blue">
          Create Any Event in Under 60 Seconds
        </h1>

        {/* Subheadline (2 neat lines) */}
        <p className="hero-subheadline">
          Invitations, RSVPs, Ticketing, Check-In, Guest<br />
          Management and AI Planning — all in one platform.
        </p>

        {/* Central Hero Card Container with Side Floating Cards */}
        <div className="hero-card-container">
          {/* Left Side Floating Card (Tilted 3D effect) - Birthday */}
          <div className="hero-deco-card left-card" aria-hidden="true">
            <div className="hero-deco-card-inner">
              <div className="hero-deco-card-header">
                <div className="hero-deco-card-tag">
                  BIRTHDAY
                </div>
                <div className="hero-deco-card-icon-bubble">
                  <Cake className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              
              <div>
                <div className="hero-deco-card-invite">You&apos;re invited to</div>
                <div className="hero-deco-card-title">Maya&apos;s 5th Birthday</div>
                <div className="hero-deco-card-details">Sat, June 14 · 2:00 PM</div>
              </div>

              <div className="hero-deco-card-footer">Hosted by The Patels</div>
            </div>
          </div>

          {/* Right Side Floating Card (Tilted 3D effect) - Wedding */}
          <div className="hero-deco-card right-card" aria-hidden="true">
            <div className="hero-deco-card-inner">
              <div className="hero-deco-card-header">
                <div className="hero-deco-card-tag">
                  WEDDING
                </div>
                <div className="hero-deco-card-icon-bubble">
                  <Heart className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div>
                <div className="hero-deco-card-invite">You&apos;re invited to</div>
                <div className="hero-deco-card-title">Liam &amp; Sofia</div>
                <div className="hero-deco-card-details">
                  Sept 21 · 5:00 PM · Vineyard Estate
                </div>
              </div>

              <div className="hero-deco-card-footer">Together with their families</div>
            </div>
          </div>

          {/* Central Interactive Hero Card */}
          <div className="hero-interactive-card">
            {/* Tabs (Top of Card) */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#F0EEFF] text-[#6C5CE7] border border-[#DDD6FE] font-semibold shadow-sm"
                        : "bg-white text-gray-700 border border-gray-200/90 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#6C5CE7]" : "text-gray-500"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Error and Success Alerts */}
            {errorMsg && (
              <div className="p-3 mb-4 text-xs font-medium bg-red-50/90 border border-red-200/80 text-red-700 rounded-xl transition-all">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 mb-4 text-xs font-medium bg-emerald-50/90 border border-emerald-200/80 text-emerald-700 rounded-xl transition-all">
                {successMsg}
              </div>
            )}

            {/* ─── TAB 0: AI CREATE ─── */}
            {activeTab === 0 && (
              <div className="space-y-3.5">
                {/* Heading with Wand icon */}
                <div className="flex items-center gap-2 text-gray-800">
                  <Wand2 className="w-4 h-4 text-[#7C3AED]" />
                  <span className="font-semibold text-xs sm:text-sm">
                    Describe your event and let AI build it
                  </span>
                </div>
                
                {/* Input Area (Middle of Card) */}
                <div className="relative bg-white rounded-2xl border border-gray-200 p-3 sm:p-3.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <textarea
                    rows={2}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    placeholder="e.g. Plan a rustic outdoor wedding for 120 guests with a warm autumn palette, live acoustic music, and a relaxed dinner under string lights..."
                    className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none resize-none pr-12 leading-relaxed"
                  />

                  {/* Circular Send Button on the right */}
                  <div className="absolute right-3 bottom-3">
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#93C5FD] hover:bg-[#60A5FA] text-white flex items-center justify-center shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                      title="Generate Event"
                      aria-label="Generate Event"
                    >
                      {generating ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 -translate-x-0.5 translate-y-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Prompt Pills (Bottom of Card) */}
                <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
                  {quickPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(item.promptText)}
                      className="flex-1 text-left sm:text-center text-[11px] sm:text-xs font-medium px-3.5 py-1.5 rounded-full bg-[#F3F0FF] hover:bg-[#ECE8FF] text-gray-700 border border-[#E0D7FE] transition-all truncate cursor-pointer active:scale-95 flex items-center gap-1.5 justify-center"
                      title={item.promptText}
                    >
                      <span className="text-[#7C3AED] text-xs">✨</span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Optional Fine-Tuning Dropdowns Toggle */}
                <div className="pt-1">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-gray-400" />
                    <span>{showDetails ? "Hide extra details" : "+ Customize date, guests, or type"}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`} />
                  </button>

                  {showDetails && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5 pt-2.5 border-t border-gray-100">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Event Type</label>
                        <select
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="">Select type (Optional)</option>
                          {eventTypes.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Guest Group</label>
                        <select
                          value={guestCount}
                          onChange={(e) => setGuestCount(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="">Estimated guest count</option>
                          {guestCounts.map((g) => (
                            <option key={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Date</label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Time</label>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Generated AI Event Plan Display */}
                {aiEventData && (
                  <div className="mt-4 p-4 bg-[#F9FAFB] border border-gray-200 rounded-2xl text-left space-y-3 max-h-[450px] overflow-y-auto">
                    <div className="flex justify-between items-start border-b border-gray-200 pb-2.5">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 leading-tight">
                          {aiEventData.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          ✨ Theme: <span className="font-semibold text-blue-600">{aiEventData.theme}</span>
                        </p>
                      </div>
                      <div className="bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 text-[10px] font-bold text-blue-700">
                        Budget: {aiEventData.estimatedBudget}
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">
                      {aiEventData.description}
                    </p>

                    {/* Timeline Schedule */}
                    {aiEventData.schedule && aiEventData.schedule.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-gray-200/60">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          📅 Proposed Timeline
                        </h4>
                        <ul className="space-y-0.5">
                          {aiEventData.schedule.map((item: string, idx: number) => (
                            <li key={idx} className="text-xs text-gray-700 flex items-start gap-1">
                              <span className="text-blue-500 font-bold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Grid Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-gray-200/60 text-xs">
                      {aiEventData.decor && aiEventData.decor.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-500 uppercase tracking-wider text-[10px] mb-0.5">
                            🎈 Decor Ideas
                          </h4>
                          <ul className="space-y-0.5 text-gray-700">
                            {aiEventData.decor.map((item: string, idx: number) => (
                              <li key={idx}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiEventData.food && aiEventData.food.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-500 uppercase tracking-wider text-[10px] mb-0.5">
                            🍴 Food & Drink
                          </h4>
                          <ul className="space-y-0.5 text-gray-700">
                            {aiEventData.food.map((item: string, idx: number) => (
                              <li key={idx}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2.5 border-t border-gray-200">
                      <button
                        onClick={() => setAiEventData(null)}
                        disabled={savingEvent}
                        className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleSaveAiEvent}
                        disabled={savingEvent}
                        className="flex-[2] py-2 rounded-xl text-xs font-semibold text-white bg-[#181126] hover:bg-[#251A3A] flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-sm"
                      >
                        {savingEvent ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving Event...
                          </>
                        ) : (
                          <>Confirm & Create Event</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 1: TEMPLATE ─── */}
            {activeTab === 1 && (
              <div className="space-y-3.5 text-left">
                <div>
                  {/* Heading & Counter Badge + View All CTA */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        Choose from editable templates
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-[#F0EEFF] text-[#6C5CE7] border border-[#6C5CE7]/20">
                        200+ available
                      </span>
                    </div>

                    <a
                      href="#templates"
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById("templates");
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth" });
                        } else {
                          router.push("/dashboard/invitations");
                        }
                      }}
                      className="text-[11px] font-semibold text-[#6C5CE7] hover:text-[#5E35B1] hover:underline whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer group"
                    >
                      <span>View All 200+ Templates</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </a>
                  </div>
                  
                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {["All", "Wedding", "Baby Shower", "Corporate", "Birthday", "Networking"].map((cat) => {
                      const isSelected = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setVisibleCount(18);
                          }}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-all border cursor-pointer ${
                            isSelected
                              ? "bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-sm ring-2 ring-[#6C5CE7]/20"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Templates Scrollable Grid Container */}
                  {loadingTemplates ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="w-5 h-5 border-2 border-[#6C5CE7]/30 border-t-[#6C5CE7] rounded-full animate-spin" />
                      <span className="text-xs text-gray-500 ml-3 font-medium">Loading templates...</span>
                    </div>
                  ) : (
                    <div 
                      onScroll={handleTemplateScroll}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 max-h-[380px] sm:max-h-[420px] overflow-y-auto pr-1.5 pb-2 custom-scrollbar scrollbar-thin scrollbar-thumb-gray-300"
                    >
                      {displayedTemplates.map((tpl) => {
                        const isSelected = selectedTemplateId === tpl.id;
                        const imgUrl = getCardImageUrl(tpl);
                        return (
                          <div
                            key={tpl.id}
                            onClick={() => {
                              setSelectedTemplateId(tpl.id);
                              if (!templateTitle) {
                                setTemplateTitle(tpl.name);
                              }
                            }}
                            className={`group relative flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border bg-white ${
                              isSelected
                                ? "border-[#6C5CE7] ring-2 ring-[#6C5CE7]/30 shadow-md transform -translate-y-0.5"
                                : "border-gray-200 hover:border-[#6C5CE7]/50 hover:shadow-sm"
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 z-10 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center shadow-md">
                                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={3} />
                              </div>
                            )}
                            <div className="aspect-[4/3] w-full bg-gray-100 relative overflow-hidden">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={tpl.name}
                                  loading="lazy"
                                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                                  <Sparkles className="w-5 h-5 text-indigo-400" />
                                </div>
                              )}
                            </div>
                            <div className="p-2 sm:p-2.5">
                              <span className="text-[9px] font-bold text-[#6C5CE7] uppercase tracking-wider block mb-0.5 truncate">
                                {tpl.category}
                              </span>
                              <h4 className="text-[11px] font-semibold text-gray-900 truncate" title={tpl.name}>
                                {tpl.name}
                              </h4>
                            </div>
                          </div>
                        );
                      })}

                      {/* Infinite Scroll / Lazy Load & CTA Trigger */}
                      {visibleCount < filteredTemplates.length && (
                        <div
                          onClick={() => setVisibleCount((prev) => Math.min(prev + 18, filteredTemplates.length))}
                          className="col-span-2 sm:col-span-3 py-2.5 px-4 rounded-xl border border-dashed border-[#6C5CE7]/40 bg-[#F0EEFF]/30 hover:bg-[#F0EEFF]/70 text-[#6C5CE7] text-xs font-semibold text-center cursor-pointer transition-all flex items-center justify-center gap-2 hover:border-[#6C5CE7]"
                        >
                          <span>Load More Templates ({filteredTemplates.length - visibleCount} remaining)</span>
                          <span>↓</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Event Details Form */}
                <div className="space-y-2.5 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={templateTitle}
                      onChange={(e) => setTemplateTitle(e.target.value)}
                      placeholder="Event Title (e.g. Maya's 5th Birthday)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#F9FAFB] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
                    />
                    <input
                      type="text"
                      value={templateVenue}
                      onChange={(e) => setTemplateVenue(e.target.value)}
                      placeholder="Venue (e.g. Sweet Retreat Bakery)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#F9FAFB] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
                    />
                    <input
                      type="date"
                      value={templateDate}
                      onChange={(e) => setTemplateDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#F9FAFB] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
                    />
                    <input
                      type="time"
                      value={templateTime}
                      onChange={(e) => setTemplateTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#F9FAFB] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
                    />
                  </div>

                  <button
                    onClick={handleCreateFromTemplate}
                    disabled={creatingEvent}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-[#6C5CE7] hover:bg-[#5E35B1] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    {creatingEvent ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating event…
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        Create Event from Template
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ─── TAB 2: UPLOAD EXISTING ─── */}
            {activeTab === 2 && (
              <div className="border-2 border-dashed border-gray-200 hover:border-[#6C5CE7]/50 rounded-2xl p-8 text-center transition-all bg-[#F9FAFB]/50">
                <div className="w-10 h-10 rounded-full bg-[#F0EEFF] text-[#6C5CE7] mx-auto flex items-center justify-center mb-2.5">
                  <FileUp className="w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-800">
                  Drag &amp; drop an existing invitation image or PDF
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Supports PNG, JPG, or PDF up to 10MB
                </p>
                <button className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-[#6C5CE7] bg-white border border-gray-200 rounded-xl hover:bg-[#F0EEFF]/50 transition-all shadow-sm cursor-pointer">
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
