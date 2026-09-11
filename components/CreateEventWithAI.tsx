"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Wand2, 
  Send, 
  ChevronDown, 
  PartyPopper, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ListChecks, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  X 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import API from "@/services/api";

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
  "Anniversary",
  "Conference",
  "Gala",
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

const timeOptions = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
];

const quickPrompts = [
  {
    label: "Whimsical garden birthday party",
    promptText: "Plan a whimsical garden birthday party for 25 guests with pastel floral decor, face painting, acoustic fairy music, and kid-friendly treats under string lights on 15th October 2026.",
  },
  {
    label: "Black-tie wedding reception",
    promptText: "Plan an outdoor wedding reception on 25th Dec 2026 from 6 PM to 10 PM at Central Park Grand Hall for 120 guests with warm lighting, champagne tower, and live jazz.",
  },
  {
    label: "Tech startup product launch",
    promptText: "A sleek modern tech startup launch party for 100 guests with craft cocktails, keynote lighting, interactive demo stations, and a DJ lounge.",
  },
  {
    label: "Intimate anniversary dinner",
    promptText: "An intimate 25th anniversary celebration dinner for 30 close family and friends with custom menu cards, acoustic violin, warm gold tones, and a photo memory wall.",
  },
];

interface CreateEventWithAIProps {
  onSuccess?: (eventId: string, redirectUrl: string) => void;
  className?: string;
}

export default function CreateEventWithAI({ onSuccess, className = "" }: CreateEventWithAIProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [guestList, setGuestList] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("22:00");
  const [isFullDay, setIsFullDay] = useState(false);
  const [venue, setVenue] = useState("");

  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!user) {
      setErrorMsg("Please sign in first to generate an event with AI.");
      setTimeout(() => router.push("/login?redirect=/dashboard/ai-assistant"), 1500);
      return;
    }

    // Bypass manual field requirement checks if prompt.trim().length > 0
    if (!prompt.trim()) {
      setErrorMsg("Please provide a description of your event.");
      return;
    }

    setGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const timeStr = isFullDay
        ? "Full Day"
        : (startTime && endTime ? `${startTime} - ${endTime}` : startTime || endTime || undefined);

      const payload = {
        userPrompt: prompt.trim(),
        prompt: prompt.trim(),
        eventType: eventType || undefined,
        guestCount: guestCount || undefined,
        date: date || undefined,
        time: timeStr,
        startTime: isFullDay ? undefined : startTime,
        endTime: isFullDay ? undefined : endTime,
        isFullDay,
        venue: venue.trim() || undefined,
        guestListName: guestList || undefined,
      };

      const res = await API.post("/ai/generate-event", payload);

      if (res.data && res.data.success) {
        const createdEventId = res.data.eventId || res.data.event?.id;
        const targetTplId = res.data.templateId || res.data.selectedTemplateId || "tpl-cake-and-confetti";

        if (typeof window !== "undefined") {
          sessionStorage.setItem("pending_template_id", targetTplId);
          localStorage.setItem("pending_template_id", targetTplId);
          if (res.data.stationeryDesign) {
            sessionStorage.setItem("pending_stationery_design", JSON.stringify(res.data.stationeryDesign));
          }
        }

        const redirectDestination = res.data.redirectUrl || (createdEventId ? `/dashboard/invitations?eventId=${createdEventId}&studio=true&templateId=${targetTplId}` : "/dashboard/invitations?studio=true");

        setSuccessMsg("🎉 Event created successfully with AI! Redirecting to Evite Invitation Studio...");

        if (onSuccess && createdEventId) {
          onSuccess(createdEventId, redirectDestination);
        }

        setTimeout(() => {
          router.push(redirectDestination);
        }, 800);
      } else {
        setErrorMsg(res.data?.error || "Failed to generate event with AI. Please try again.");
      }
    } catch (err: any) {
      console.error("AI Event Generation Failed:", err);
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
        setErrorMsg("AI service is temporarily busy. Please try again in a moment.");
      } else if (
        status === 401 ||
        status === 403 ||
        (serverError && (
          serverError.toLowerCase().includes("invalid gemini api key") ||
          serverError.toLowerCase().includes("unauthorized")
        ))
      ) {
        setErrorMsg("Authentication or API configuration error. Please try again later.");
      } else {
        setErrorMsg(serverError || err.message || "Failed to generate event with AI. Please try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Heading */}
      <div className="flex items-center gap-2 text-gray-800">
        <Wand2 className="w-4 h-4 text-[#7C3AED]" />
        <span className="font-semibold text-xs sm:text-sm">
          Describe your event and let AI build it
        </span>
      </div>

      {/* Alerts / Feedback */}
      {errorMsg && (
        <div className="p-3 text-xs font-medium bg-red-50/90 border border-red-200/80 text-red-700 rounded-xl transition-all flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="p-0.5 text-red-500 hover:text-red-700 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3 text-xs font-medium bg-emerald-50/90 border border-emerald-200/80 text-emerald-700 rounded-xl transition-all flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="p-0.5 text-emerald-500 hover:text-emerald-700 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Textarea with Blue Send Button */}
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
          placeholder="e.g. Plan an outdoor wedding reception on 25th Dec 2026 from 6 PM to 10 PM at Central Park Grand Hall for 120 guests..."
          className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none resize-none pr-12 leading-relaxed"
          disabled={generating}
        />

        {/* Circular Blue Send Button */}
        <div className="absolute right-3 bottom-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-white flex items-center justify-center shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            title="Generate Event with AI"
            aria-label="Generate Event with AI"
          >
            {generating ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 -translate-x-0.5 translate-y-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Prompt Pills */}
      <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
        {quickPrompts.slice(0, 2).map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setPrompt(item.promptText)}
            className="flex-1 text-left sm:text-center text-[11px] sm:text-xs font-medium px-3.5 py-1.5 rounded-full bg-[#F3F0FF] hover:bg-[#ECE8FF] text-gray-700 border border-[#E0D7FE] transition-all truncate cursor-pointer active:scale-95 flex items-center gap-1.5 justify-center"
            title={item.promptText}
          >
            <span className="text-[#7C3AED] text-xs">✨</span>
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Optional Form Field Overrides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-left">
        {/* 1. EVENT TYPE */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-3.5 shadow-xs hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100/50 transition-all flex flex-col justify-between">
          <label className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1.5 select-none">
            EVENT TYPE (OPTIONAL OVERRIDE)
          </label>
          <div className="relative flex items-center gap-2">
            <PartyPopper className="w-4 h-4 text-gray-400 flex-shrink-0 pointer-events-none" />
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className={`w-full bg-transparent text-xs sm:text-sm focus:outline-none appearance-none cursor-pointer pr-6 font-medium ${
                eventType ? "text-gray-800" : "text-gray-400"
              }`}
            >
              <option value="" className="text-gray-400">
                Let AI infer from prompt
              </option>
              {eventTypes.map((t) => (
                <option key={t} value={t} className="text-gray-800">
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 pointer-events-none" />
          </div>
        </div>

        {/* 2. DATE */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-3.5 shadow-xs hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100/50 transition-all flex flex-col justify-between">
          <label className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1.5 select-none">
            DATE (OPTIONAL OVERRIDE)
          </label>
          <div className="relative flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-gray-800 focus:outline-none cursor-pointer font-medium pr-6"
            />
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 pointer-events-none" />
          </div>
        </div>

        {/* 3. TIME */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-3.5 shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase select-none">
              TIME (OPTIONAL OVERRIDE)
            </label>
            <div
              className="flex items-center gap-1.5 cursor-pointer select-none"
              onClick={() => setIsFullDay(!isFullDay)}
            >
              <span className="text-xs font-medium text-gray-500">Full Day</span>
              <button
                type="button"
                role="switch"
                aria-checked={isFullDay}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullDay(!isFullDay);
                }}
                className={`relative inline-flex h-4 w-7 sm:h-5 sm:w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isFullDay ? "bg-[#4C6FFF]" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isFullDay ? "translate-x-3 sm:translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`relative flex-1 flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50/90 border border-gray-200/80 rounded-xl transition-all ${
                isFullDay ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <select
                disabled={isFullDay}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-transparent text-xs text-gray-800 focus:outline-none appearance-none cursor-pointer pr-4 font-medium"
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 pointer-events-none" />
            </div>

            <span className="text-gray-400 font-semibold text-xs">-</span>

            <div
              className={`relative flex-1 flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50/90 border border-gray-200/80 rounded-xl transition-all ${
                isFullDay ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              <select
                disabled={isFullDay}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-transparent text-xs text-gray-800 focus:outline-none appearance-none cursor-pointer pr-4 font-medium pl-1"
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 4. VENUE */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-3.5 shadow-xs hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100/50 transition-all flex flex-col justify-between">
          <label className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1.5 select-none">
            VENUE (OPTIONAL OVERRIDE)
          </label>
          <div className="relative flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Let AI infer or enter venue"
              className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* 5. GUEST GROUP */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-3.5 shadow-xs hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100/50 transition-all flex flex-col justify-between">
          <label className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1.5 select-none">
            GUEST GROUP (OPTIONAL OVERRIDE)
          </label>
          <div className="relative flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400 flex-shrink-0 pointer-events-none" />
            <select
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className={`w-full bg-transparent text-xs sm:text-sm focus:outline-none appearance-none cursor-pointer pr-6 font-medium ${
                guestCount ? "text-gray-800" : "text-gray-400"
              }`}
            >
              <option value="" className="text-gray-400">
                Let AI infer or select count
              </option>
              {guestCounts.map((g) => (
                <option key={g} value={g} className="text-gray-800">
                  {g}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 pointer-events-none" />
          </div>
        </div>

        {/* 6. GUEST LIST */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-3.5 shadow-xs hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100/50 transition-all flex flex-col justify-between">
          <label className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1.5 select-none">
            GUEST LIST (OPTIONAL OVERRIDE)
          </label>
          <div className="relative flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-gray-400 flex-shrink-0 pointer-events-none" />
            <select
              value={guestList}
              onChange={(e) => setGuestList(e.target.value)}
              className={`w-full bg-transparent text-xs sm:text-sm focus:outline-none appearance-none cursor-pointer pr-6 font-medium ${
                guestList ? "text-gray-800" : "text-gray-400"
              }`}
            >
              <option value="" className="text-gray-400">
                Select a saved list (optional)
              </option>
              {guestLists.map((l) => (
                <option key={l} value={l} className="text-gray-800">
                  {l}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bottom Primary Action Button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full mt-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#4C6FFF] to-[#00C0F9] hover:opacity-95 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 group"
      >
        {generating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Building your event with AI...</span>
          </>
        ) : (
          <>
            <span>Generate Event with AI</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </div>
  );
}
