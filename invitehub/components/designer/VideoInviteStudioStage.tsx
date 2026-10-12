"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Clapperboard,
  Wand2,
  Upload,
  X,
  Check,
  Camera,
  Play,
  RotateCcw,
  ArrowRight,
  Loader2,
  AlertCircle,
  Film,
  Zap,
  Sliders,
  CheckCircle2,
  Calendar,
  MapPin,
  RefreshCw,
  Info,
  Layers,
  ChevronRight,
  Tag,
  User,
} from "lucide-react";
import VideoInvitePlayer from "./VideoInvitePlayer";
import VideoTemplateCarousel from "./VideoTemplateCarousel";
import API from "@/services/api";
import {
  VideoTemplate,
  VIDEO_TEMPLATES_CATALOG,
  findVideoTemplate,
} from "@/data/videoTemplates";
import { StudioDesignState } from "./InvitationStudio";

const STYLE_MODIFIERS = [
  "Cinematic Lighting",
  "Trendy Transitions",
  "Dynamic Camera Zoom",
  "Volumetric Fog & Bokeh",
  "Hyper-realistic 4K",
  "High-Energy Party Vibe",
];

const PROMPT_INSPIRATION_CHIPS = [
  { label: "Hollywood Golden Gala", text: "Hollywood red carpet premiere gala with golden bokeh, spotlights, and luxury champagne vibes" },
  { label: "Dubai Laser Fireworks", text: "Spectacular Burj Khalifa skyscraper LED laser celebration with illuminated birthday projections and golden fireworks" },
  { label: "Hip-Hop Superstar Stage", text: "Epic hip-hop stage mic drop moment, dramatic smoke cannons, golden laser beams, and stadium flashbulbs" },
  { label: "Joyful Dance Energy", text: "High-energy joyful dance party celebration with colorful confetti bursts and vibrant club lighting" },
  { label: "Regal Royal Fantasy", text: "Regal luxury fantasy royal court with magnificent golden lion companion and ethereal golden twilight" },
  { label: "90s Retro Neon", text: "Throwback 90s neon synthwave aesthetic with vibrant club lighting and retro scanlines" },
];

interface VideoInviteStudioStageProps {
  designState: StudioDesignState;
  onUpdateDesignState: (updater: (prev: StudioDesignState) => StudioDesignState) => void;
  onProceedToDetails: () => void;
  onSaveDraft?: (payload?: any) => Promise<any>;
}

export default function VideoInviteStudioStage({
  designState,
  onUpdateDesignState,
  onProceedToDetails,
  onSaveDraft,
}: VideoInviteStudioStageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial selected template
  const initialTplId =
    designState.activeTemplateId ||
    designState.templateId ||
    (typeof window !== "undefined" ? sessionStorage.getItem("pending_template_id") : null) ||
    "burj-khalifa";

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTplId);
  const initialTemplate = findVideoTemplate(initialTplId);

  // Creative prompt state prefilled with template default
  const [promptText, setPromptText] = useState<string>(
    (designState as any).userPrompt ||
      (typeof window !== "undefined" ? sessionStorage.getItem("pending_prompt") : null) ||
      initialTemplate.defaultPrompt
  );

  const [activeModifiers, setActiveModifiers] = useState<string[]>([
    "Cinematic Lighting",
    "Trendy Transitions",
  ]);

  // Reference celebrant/host photo
  const [celebrantPhoto, setCelebrantPhoto] = useState<string | null>(
    (designState as any).celebrantPhoto ||
      (typeof window !== "undefined"
        ? sessionStorage.getItem("pending_celebrant_photo") || localStorage.getItem("pending_celebrant_photo")
        : null)
  );

  // Active Video Source
  const initialVideoUrl =
    designState.videoUrl ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("pending_video_url") || localStorage.getItem("pending_video_url")
      : null) ||
    initialTemplate.videoUrl;

  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(initialVideoUrl);

  // Generation progress state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>("Initializing Replicate AI Engine...");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Event text overlay form fields
  const [eventTitle, setEventTitle] = useState(designState.eventDetails.title || "Special Celebration");
  const [eventHostName, setEventHostName] = useState((designState.eventDetails as any).celebrantName || "");
  const [eventAge, setEventAge] = useState((designState.eventDetails as any).age || "Milestone");
  const [eventDate, setEventDate] = useState(designState.eventDetails.date || "Saturday, 25 October • 7:00 PM");
  const [eventVenue, setEventVenue] = useState(designState.eventDetails.venue || "Skyline Ballroom & Terrace");

  // Keep internal state updated if parent eventDetails change
  useEffect(() => {
    if (designState.eventDetails.title && designState.eventDetails.title !== eventTitle) {
      setEventTitle(designState.eventDetails.title);
    }
    if (designState.eventDetails.date && designState.eventDetails.date !== eventDate) {
      setEventDate(designState.eventDetails.date);
    }
    if (designState.eventDetails.venue && designState.eventDetails.venue !== eventVenue) {
      setEventVenue(designState.eventDetails.venue);
    }
  }, [designState.eventDetails]);

  // Helper to persist draft locally
  const persistDraftLocally = (video: string, tplId: string, celebPhoto?: string | null) => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem("pending_video_url", video);
      localStorage.setItem("pending_video_url", video);
      sessionStorage.setItem("pending_is_video", "true");
      localStorage.setItem("pending_is_video", "true");
      sessionStorage.setItem("pending_template_id", tplId);
      localStorage.setItem("pending_template_id", tplId);
      sessionStorage.setItem("pending_aspect_ratio", "9/16");
      if (promptText) {
        sessionStorage.setItem("pending_prompt", promptText);
      }
      if (celebPhoto) {
        sessionStorage.setItem("pending_celebrant_photo", celebPhoto);
        localStorage.setItem("pending_celebrant_photo", celebPhoto);
      }

      const guestDraft = {
        type: "video",
        isVideo: true,
        videoUrl: video,
        templateId: tplId,
        title: eventTitle,
        celebrantName: eventHostName,
        age: eventAge,
        date: eventDate,
        venue: eventVenue,
        prompt: promptText,
        celebrantPhoto: celebPhoto || undefined,
        aspectRatio: "9/16",
        videoMetadata: {
          templateId: tplId,
          aspectRatio: "9/16",
          source: "replicate-ai",
        },
      };
      sessionStorage.setItem("guestEventDraft", JSON.stringify(guestDraft));
      localStorage.setItem("guestEventDraft", JSON.stringify(guestDraft));
    } catch (_) {}
  };

  // Sync to parent state whenever active video or details update
  const syncToParent = (nextVideoUrl: string, nextTplId: string, nextPhoto?: string | null) => {
    persistDraftLocally(nextVideoUrl, nextTplId, nextPhoto);

    onUpdateDesignState((prev) => ({
      ...prev,
      videoUrl: nextVideoUrl,
      isVideo: true,
      activeTemplateId: nextTplId,
      templateId: nextTplId,
      aspectRatio: "9/16",
      backgroundImageUrl: nextVideoUrl,
      cardBg: {
        type: "image",
        value: nextVideoUrl,
      },
      card: {
        ...(prev.card || {}),
        artworkUrl: nextVideoUrl,
        videoUrl: nextVideoUrl,
        isVideo: true,
        aspectRatio: "9/16",
        celebrantPhoto: nextPhoto ?? (prev.card?.celebrantPhoto || null),
      },
      celebrantPhoto: nextPhoto ?? (prev as any).celebrantPhoto,
      eventDetails: {
        ...prev.eventDetails,
        title: eventTitle,
        date: eventDate,
        venue: eventVenue,
        celebrantName: eventHostName,
        age: eventAge,
      } as any,
    }));
  };

  // Select a template from the carousel
  const handleSelectTemplate = (template: VideoTemplate) => {
    setSelectedTemplateId(template.id);
    setActiveVideoUrl(template.videoUrl);
    setPromptText(template.defaultPrompt);
    syncToParent(template.videoUrl, template.id, celebrantPhoto);
    setToastMessage({
      text: `Selected "${template.title}". Updated prompt & motion preview.`,
      type: "info",
    });
  };

  // Toggle style modifier tag
  const toggleModifier = (tag: string) => {
    setActiveModifiers((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToastMessage({ text: "Please upload an image file (JPG, PNG, WebP).", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCelebrantPhoto(dataUrl);
      syncToParent(activeVideoUrl, selectedTemplateId, dataUrl);
      setToastMessage({ text: "Photo reference attached for character replacement.", type: "success" });
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setCelebrantPhoto(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pending_celebrant_photo");
      localStorage.removeItem("pending_celebrant_photo");
    }
    syncToParent(activeVideoUrl, selectedTemplateId, null);
  };

  // Trigger Replicate video generation via Backend API with structured template guidance
  const handleGenerateVideo = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setProgressPercent(12);
    setProgressStage("Connecting to Replicate AI GPU...");

    const chosenTemplate = findVideoTemplate(selectedTemplateId);
    const fullPrompt = `${promptText || chosenTemplate.defaultPrompt}. Style modifiers: ${activeModifiers.join(
      ", "
    )}. Celebration: ${eventTitle}${eventAge ? " - " + eventAge : ""}.`;

    const eventDetails = {
      title: eventTitle,
      celebrantName: eventHostName || eventTitle,
      age: eventAge,
      date: eventDate,
      venue: eventVenue,
    };

    const payload = {
      templateId: selectedTemplateId,
      templateVideoUrl: chosenTemplate.videoUrl,
      uploadedImageUrl: celebrantPhoto,
      prompt: fullPrompt,
      eventDetails,
    };

    try {
      // Step progress animation simulation
      const progressTimer = setInterval(() => {
        setProgressPercent((p) => {
          if (p < 30) return p + 6;
          if (p < 60) return p + 4;
          if (p < 88) return p + 2;
          return p;
        });
      }, 700);

      const stageTimer1 = setTimeout(() => {
        setProgressStage("Applying template motion & character features...");
      }, 1400);

      const stageTimer2 = setTimeout(() => {
        setProgressStage("Synthesizing 9:16 vertical motion scene on cloud GPU...");
      }, 3200);

      // Attempt primary generate-video endpoint
      let res: any;
      try {
        res = await API.post("/generate-video", payload);
      } catch (err1) {
        // Fallback to /ai/generate-video-template
        res = await API.post("/ai/generate-video-template", {
          ...payload,
          photoUrl: celebrantPhoto,
          title: eventTitle,
          date: eventDate,
          venue: eventVenue,
        });
      }

      clearInterval(progressTimer);
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      if (res?.data?.success && res.data.async && res.data.predictionId) {
        // Poll status
        setProgressStage("Rendering HD frames via Replicate prediction pipeline...");
        const predictionId = res.data.predictionId;
        let attempts = 0;
        const maxAttempts = 20;

        const pollInterval = setInterval(async () => {
          attempts += 1;
          try {
            let statusRes: any;
            try {
              statusRes = await API.get(`/video-status/${predictionId}`);
            } catch (_) {
              statusRes = await API.get(`/ai/video-status/${predictionId}`);
            }

            if (statusRes.data?.status === "succeeded" && statusRes.data.videoUrl) {
              clearInterval(pollInterval);
              setProgressPercent(100);
              setProgressStage("Personalized video invite generated successfully!");
              const finalUrl = statusRes.data.videoUrl;
              setActiveVideoUrl(finalUrl);
              syncToParent(finalUrl, selectedTemplateId, celebrantPhoto);
              setIsGenerating(false);
              setToastMessage({ text: "✨ AI Video invitation synthesized!", type: "success" });
            } else if (statusRes.data?.status === "failed" || attempts >= maxAttempts) {
              clearInterval(pollInterval);
              // Fallback to high-quality template video
              const fallback = chosenTemplate.videoUrl;
              setProgressPercent(100);
              setActiveVideoUrl(fallback);
              syncToParent(fallback, selectedTemplateId, celebrantPhoto);
              setIsGenerating(false);
              setToastMessage({ text: "Queue busy. Loaded high-definition preview.", type: "info" });
            }
          } catch (pollErr) {
            clearInterval(pollInterval);
            const fallback = chosenTemplate.videoUrl;
            setProgressPercent(100);
            setActiveVideoUrl(fallback);
            syncToParent(fallback, selectedTemplateId, celebrantPhoto);
            setIsGenerating(false);
          }
        }, 2200);
      } else if (res?.data?.success && res.data.videoUrl) {
        setProgressPercent(100);
        setProgressStage("Complete!");
        const finalUrl = res.data.videoUrl;
        setActiveVideoUrl(finalUrl);
        syncToParent(finalUrl, selectedTemplateId, celebrantPhoto);
        setIsGenerating(false);
        setToastMessage({ text: "✨ AI Video invite generated!", type: "success" });
      } else {
        const fallback = chosenTemplate.videoUrl;
        setProgressPercent(100);
        setActiveVideoUrl(fallback);
        syncToParent(fallback, selectedTemplateId, celebrantPhoto);
        setIsGenerating(false);
        setToastMessage({ text: "Template preview loaded successfully.", type: "info" });
      }
    } catch (err: any) {
      console.warn("[VideoInviteStudio] Generation failed, using instant template preview:", err);
      const fallback = chosenTemplate.videoUrl;
      setProgressPercent(100);
      setActiveVideoUrl(fallback);
      syncToParent(fallback, selectedTemplateId, celebrantPhoto);
      setIsGenerating(false);
      setToastMessage({ text: "Preview loaded with curated template backdrop.", type: "info" });
    }
  };

  const selectedTemplate = findVideoTemplate(selectedTemplateId);

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-0 bg-[#0a0c10] text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-2xl border text-xs sm:text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
            toastMessage.type === "error"
              ? "bg-red-950/90 text-red-100 border-red-700/80 backdrop-blur-md"
              : toastMessage.type === "success"
                ? "bg-emerald-950/90 text-emerald-100 border-emerald-700/80 backdrop-blur-md"
                : "bg-slate-900/90 text-slate-100 border-slate-700/80 backdrop-blur-md"
          }`}
        >
          {toastMessage.type === "error" && <AlertCircle className="size-4 text-red-400 shrink-0" />}
          {toastMessage.type === "success" && <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />}
          {toastMessage.type === "info" && <Info className="size-4 text-amber-400 shrink-0" />}
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 p-1 hover:bg-white/10 rounded-md text-white/60 hover:text-white cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LEFT COLUMN: Controls, Carousel & Generator Parameters         */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full lg:w-[50%] xl:w-[48%] h-auto lg:h-full flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto min-h-0 bg-neutral-950/90 backdrop-blur-2xl">
        <div className="p-5 sm:p-7 space-y-7">
          {/* Section Header */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide">
              <Sparkles className="size-3.5" />
              <span>Template-Driven AI Video Generator</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white"
              style={{ fontFamily: "'Red Rose', Georgia, serif" }}
            >
              Select Template &amp; Animate
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Choose a curated video motion preset, upload your photo for subject animation, and configure event text overlays.
            </p>
          </div>

          {/* 1. Template Carousel & Selection Picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Clapperboard className="size-3.5 text-amber-400" />
                <span>1. Choose Video Template Preset</span>
              </label>
              <span className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {selectedTemplate?.title}
              </span>
            </div>

            {/* Video Template Carousel with horizontal scrolling */}
            <VideoTemplateCarousel
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={handleSelectTemplate}
            />
          </div>

          {/* 2. Photo Upload for Character & Subject Replacement */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Camera className="size-3.5 text-amber-400" />
                <span>2. Upload Photo (Celebrant / Host)</span>
              </label>
              <span className="text-[11px] text-neutral-400">Character Animation</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {celebrantPhoto ? (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] border border-amber-400/40 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="size-14 rounded-2xl overflow-hidden bg-black/60 border border-amber-400/50 shadow-inner">
                    <img src={celebrantPhoto} alt="Celebrant reference" className="size-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Photo Attached</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Ready
                      </span>
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Replicate will animate this face into {selectedTemplate.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-semibold transition cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 transition cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-white/20 hover:border-amber-400/70 bg-white/[0.02] hover:bg-amber-500/[0.04] rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
              >
                <div className="size-11 rounded-full bg-white/5 group-hover:bg-amber-500/15 text-neutral-400 group-hover:text-amber-400 flex items-center justify-center transition shadow-inner">
                  <Upload className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-200 group-hover:text-amber-300">
                    Click to upload celebrant photo
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    PNG, JPG, or WebP. AI swaps &amp; animates the subject with template motion
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 3. Custom Prompt & Description (Prefilled with Template Defaults) */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Wand2 className="size-3.5 text-amber-400" />
                <span>3. Prompt &amp; Motion Guidance</span>
              </label>
              <button
                type="button"
                onClick={() => setPromptText(selectedTemplate.defaultPrompt)}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Reset to default
              </button>
            </div>

            <textarea
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Creative direction for AI video animation..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition resize-none leading-relaxed"
            />

            {/* Prompt Inspiration Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-neutral-400 font-semibold block">Quick Prompt Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_INSPIRATION_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setPromptText(chip.text)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-neutral-300 hover:text-white transition cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Modifiers */}
            <div className="pt-2">
              <span className="text-[10px] text-neutral-400 font-semibold block mb-1.5">Style Modifiers:</span>
              <div className="flex flex-wrap gap-1.5">
                {STYLE_MODIFIERS.map((mod) => {
                  const isActive = activeModifiers.includes(mod);
                  return (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => toggleModifier(mod)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                        isActive
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-white/[0.03] text-neutral-400 border-white/10 hover:text-white"
                      }`}
                    >
                      {isActive && <Check className="size-2.5 text-amber-400" />}
                      <span>{mod}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Event Text Overlays (Rendered directly on video preview) */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Tag className="size-3.5 text-amber-400" />
                <span>4. Event Text Overlays (Rendered on Video)</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="size-3" /> Live Preview
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <span className="block text-[10px] text-neutral-400 uppercase font-semibold mb-1">
                  Event Name / Title
                </span>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => {
                    setEventTitle(e.target.value);
                    syncToParent(activeVideoUrl, selectedTemplateId, celebrantPhoto);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="e.g. Jessica's 30th Birthday"
                />
              </div>

              <div>
                <span className="block text-[10px] text-neutral-400 uppercase font-semibold mb-1">
                  Age / Milestone Badge
                </span>
                <input
                  type="text"
                  value={eventAge}
                  onChange={(e) => {
                    setEventAge(e.target.value);
                    syncToParent(activeVideoUrl, selectedTemplateId, celebrantPhoto);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="e.g. 30th Milestone"
                />
              </div>

              <div>
                <span className="block text-[10px] text-neutral-400 uppercase font-semibold mb-1">
                  Date &amp; Time
                </span>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => {
                    setEventDate(e.target.value);
                    syncToParent(activeVideoUrl, selectedTemplateId, celebrantPhoto);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="Saturday, 25 October • 7:00 PM"
                />
              </div>

              <div>
                <span className="block text-[10px] text-neutral-400 uppercase font-semibold mb-1">
                  Location / Venue
                </span>
                <input
                  type="text"
                  value={eventVenue}
                  onChange={(e) => {
                    setEventVenue(e.target.value);
                    syncToParent(activeVideoUrl, selectedTemplateId, celebrantPhoto);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="Sky Lounge Ballroom, NYC"
                />
              </div>
            </div>
          </div>

          {/* Generation Progress Indicator (When Active) */}
          {isGenerating && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-amber-400" />
                  <span>{progressStage}</span>
                </div>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons: Generate Video & Continue */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateVideo}
              className="w-full sm:flex-1 h-12 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin text-slate-950" />
                  <span>Generating Video Invite...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4 text-slate-950" />
                  <span>Generate Video Invite</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onProceedToDetails}
              className="w-full sm:w-auto h-12 px-6 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs tracking-wide transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Continue to Details</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT COLUMN: Video Player with Live Text Overlays             */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full lg:w-[50%] xl:w-[52%] flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto relative min-h-0 bg-[radial-gradient(ellipse_at_top,rgba(254,186,8,0.08),transparent_70%)]">
        {/* Responsive Video Preview Wrapper */}
        <div className="w-full max-w-[380px] sm:max-w-[420px] flex flex-col items-center gap-4">
          {/* Header pill above player */}
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              <Film className="size-3.5 text-amber-400" />
              <span>Personalized Preview</span>
            </span>
            <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              {selectedTemplate.title}
            </span>
          </div>

          {/* Live Video Player with Standard Playback Controls & Real-Time Text Overlays */}
          <div className="w-full shadow-[0_25px_70px_rgba(0,0,0,0.85)] ring-1 ring-white/15 rounded-3xl overflow-hidden">
            <VideoInvitePlayer
              src={activeVideoUrl}
              title={eventTitle}
              subtitle={`${eventDate} • ${eventVenue}`}
              badge={selectedTemplate.title}
              aspectRatio="9/16"
              autoPlay={true}
              loop={true}
              muted={true}
              showOverlayDetails={true}
              eventDetails={{
                name: eventHostName || eventTitle,
                title: eventTitle,
                age: eventAge,
                date: eventDate,
                venue: eventVenue,
              }}
              className="w-full"
            />
          </div>

          {/* Quick Actions below Player */}
          <div className="w-full flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleGenerateVideo}
              disabled={isGenerating}
              className="h-10 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="size-3.5 text-amber-400" />
              <span>Regenerate Animation</span>
            </button>

            <button
              type="button"
              onClick={onProceedToDetails}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 text-xs font-extrabold transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <span>Setup Event RSVPs</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
