"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Wand2, 
  Send, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  X 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import API from "@/services/api";

const quickPrompts = [
  {
    label: "Whimsical garden birthday party",
    promptText: "Whimsical garden birthday party with pastel floral decor, string lights, and soft pink tones",
  },
  {
    label: "Black-tie wedding reception",
    promptText: "Elegant black-tie wedding reception with gold accents, warm lighting, and luxurious floral arrangements",
  },
  {
    label: "Tech startup product launch",
    promptText: "Sleek modern tech startup launch party with neon lighting, minimalist design, and futuristic vibes",
  },
  {
    label: "Intimate anniversary dinner",
    promptText: "Intimate anniversary dinner with candlelight, rose gold tones, and romantic botanical decor",
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
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!user) {
      try {
        if (prompt.trim()) sessionStorage.setItem("pending_prompt", prompt);
      } catch (e) {}
      router.push("/dashboard/invitations?studio=true&guest=1");
      return;
    }

    if (!prompt.trim()) {
      setErrorMsg("Please provide a description of your event.");
      return;
    }

    setGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        userPrompt: prompt.trim(),
        eventType: "Event",
        title: prompt.trim().substring(0, 80),
        date: new Date().toISOString().split("T")[0],
        venue: "Venue",
      };

      const res = await API.post("/ai/generate-event-template", payload);

      if (res.data && res.data.success && res.data.imageUrl) {
        const imageUrl = res.data.imageUrl;

        if (typeof window !== "undefined") {
          sessionStorage.setItem("pending_upload_invite", imageUrl);
          localStorage.setItem("pending_upload_invite", imageUrl);

          const details = res.data.details || res.data.meta || {};
          const title = details.title || prompt.trim().substring(0, 80);
          sessionStorage.setItem("pending_upload_title", title);
          localStorage.setItem("pending_upload_title", title);

          const stationeryDesign = {
            cardBgColor: "#ffffff",
            textElements: [
              {
                id: "layer-title",
                role: "title",
                text: (details.title || title || "Celebration").toUpperCase(),
                x: 50,
                y: 30,
                fontSize: 34,
                fontFamily: "Playfair Display",
                fontWeight: "800",
                color: "#1E293B",
                align: "center",
                letterSpacing: 2,
              },
              {
                id: "layer-host",
                role: "host",
                text: details.subtitle || "YOU ARE CORDIALLY INVITED TO CELEBRATE",
                x: 50,
                y: 42,
                fontSize: 13,
                fontFamily: "Inter",
                fontWeight: "600",
                color: "#475569",
                align: "center",
                letterSpacing: 1.2,
                casing: "uppercase",
              },
              {
                id: "layer-datetime",
                role: "datetime",
                text: details.date || "Saturday, 25 October • 6:00 PM",
                x: 50,
                y: 54,
                fontSize: 15,
                fontFamily: "Inter",
                fontWeight: "700",
                color: "#1E293B",
                align: "center",
                letterSpacing: 1.5,
              },
              {
                id: "layer-venue",
                role: "venue",
                text: details.venue || "The Grand Palace Hall, City Center",
                x: 50,
                y: 65,
                fontSize: 14,
                fontFamily: "Inter",
                fontWeight: "600",
                color: "#475569",
                align: "center",
                letterSpacing: 0.5,
              },
            ],
          };
          sessionStorage.setItem("pending_stationery_design", JSON.stringify(stationeryDesign));
          localStorage.setItem("pending_stationery_design", JSON.stringify(stationeryDesign));
        }

        const studioUrl = `/dashboard/invitations?uploadedImageUrl=${encodeURIComponent(imageUrl)}&studio=true&aiGenerated=1`;

        setSuccessMsg("AI invitation template generated! Redirecting to Studio...");

        if (onSuccess) {
          onSuccess("ai-generated", studioUrl);
        }

        setTimeout(() => {
          router.push(studioUrl);
        }, 800);
      } else {
        setErrorMsg(res.data?.error || "Failed to generate template. Please try again.");
      }
    } catch (err: any) {
      console.error("AI Template Generation Failed:", err);
      const serverError = err.response?.data?.error;

      if (
        err.response?.status === 429 ||
        (serverError && (
          serverError.toLowerCase().includes("busy") ||
          serverError.toLowerCase().includes("rate limit") ||
          serverError.toLowerCase().includes("too many")
        ))
      ) {
        setErrorMsg("AI service is temporarily busy. Please try again in a moment.");
      } else {
        setErrorMsg(serverError || err.message || "Failed to generate template. Please check Replicate configuration.");
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
          placeholder="e.g. Elegant floral garden wedding, soft pastel tones, gold accents..."
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

      {/* Bottom Primary Action Button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full mt-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#4C6FFF] to-[#00C0F9] hover:opacity-95 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 group"
      >
        {generating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Generating your invitation template...</span>
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
