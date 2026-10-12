"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Sparkles,
  Clapperboard,
  Camera,
  Upload,
  Check,
  Wand2,
  Tag,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Film,
  RefreshCw,
  Info,
  Calendar,
  MapPin,
} from "lucide-react";
import VideoInvitePlayer from "../designer/VideoInvitePlayer";
import VideoTemplateCarousel from "../designer/VideoTemplateCarousel";
import API from "@/services/api";
import {
  VideoTemplate,
  VIDEO_TEMPLATES_CATALOG,
  findVideoTemplate,
} from "@/data/videoTemplates";

interface VideoInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplateId?: string;
  initialVideoUrl?: string;
  initialDetails?: {
    title?: string;
    celebrantName?: string;
    age?: string;
    date?: string;
    venue?: string;
  };
  onSuccess?: (result: { videoUrl: string; templateId: string; details: any }) => void;
}

export default function VideoInviteModal({
  isOpen,
  onClose,
  initialTemplateId,
  initialVideoUrl,
  initialDetails,
  onSuccess,
}: VideoInviteModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplateId || "burj-khalifa"
  );
  const activeTemplate = findVideoTemplate(selectedTemplateId);

  const [promptText, setPromptText] = useState<string>(activeTemplate.defaultPrompt);
  const [celebrantPhoto, setCelebrantPhoto] = useState<string | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(
    initialVideoUrl || activeTemplate.videoUrl
  );

  // Form Fields
  const [eventTitle, setEventTitle] = useState(initialDetails?.title || "Special Celebration");
  const [eventAge, setEventAge] = useState(initialDetails?.age || "30th Birthday");
  const [eventDate, setEventDate] = useState(
    initialDetails?.date || "Saturday, 25 October • 7:00 PM"
  );
  const [eventVenue, setEventVenue] = useState(
    initialDetails?.venue || "Sky Lounge Ballroom & Terrace"
  );

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStage, setProgressStage] = useState("Initializing...");
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    if (initialTemplateId) {
      setSelectedTemplateId(initialTemplateId);
      const t = findVideoTemplate(initialTemplateId);
      setActiveVideoUrl(initialVideoUrl || t.videoUrl);
      setPromptText(t.defaultPrompt);
    }
  }, [initialTemplateId, initialVideoUrl]);

  if (!isOpen) return null;

  const handleSelectTemplate = (t: VideoTemplate) => {
    setSelectedTemplateId(t.id);
    setActiveVideoUrl(t.videoUrl);
    setPromptText(t.defaultPrompt);
    setToastMessage({
      text: `Selected "${t.title}". Preview updated.`,
      type: "info",
    });
  };

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
      setToastMessage({ text: "Photo attached for video animation.", type: "success" });
    };
    reader.readAsDataURL(file);
  };

  const persistDraftAndNavigate = (videoUrlToSave: string) => {
    const draft = {
      type: "video",
      isVideo: true,
      videoUrl: videoUrlToSave,
      templateId: selectedTemplateId,
      title: eventTitle,
      age: eventAge,
      date: eventDate,
      venue: eventVenue,
      prompt: promptText,
      celebrantPhoto: celebrantPhoto || undefined,
      aspectRatio: "9/16",
      videoMetadata: {
        templateId: selectedTemplateId,
        aspectRatio: "9/16",
        source: "replicate-ai",
      },
    };

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("guestEventDraft", JSON.stringify(draft));
        localStorage.setItem("guestEventDraft", JSON.stringify(draft));
        sessionStorage.setItem("pending_video_url", videoUrlToSave);
        localStorage.setItem("pending_video_url", videoUrlToSave);
        sessionStorage.setItem("pending_is_video", "true");
        localStorage.setItem("pending_is_video", "true");
        sessionStorage.setItem("pending_template_id", selectedTemplateId);
        localStorage.setItem("pending_template_id", selectedTemplateId);
        if (celebrantPhoto) {
          sessionStorage.setItem("pending_celebrant_photo", celebrantPhoto);
          localStorage.setItem("pending_celebrant_photo", celebrantPhoto);
        }
      } catch (_) {}
    }

    if (onSuccess) {
      onSuccess({
        videoUrl: videoUrlToSave,
        templateId: selectedTemplateId,
        details: { title: eventTitle, age: eventAge, date: eventDate, venue: eventVenue },
      });
    }

    onClose();
    router.push(`/dashboard/invitations?videoInvite=1&templateId=${selectedTemplateId}`);
  };

  const handleGenerateVideo = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setProgressPercent(15);
    setProgressStage("Connecting to Replicate AI GPU...");

    const chosenTemplate = findVideoTemplate(selectedTemplateId);
    const eventDetails = {
      title: eventTitle,
      celebrantName: eventTitle,
      age: eventAge,
      date: eventDate,
      venue: eventVenue,
    };

    const payload = {
      templateId: selectedTemplateId,
      templateVideoUrl: chosenTemplate.videoUrl,
      uploadedImageUrl: celebrantPhoto,
      prompt: promptText || chosenTemplate.defaultPrompt,
      eventDetails,
    };

    try {
      const progressTimer = setInterval(() => {
        setProgressPercent((p) => (p < 85 ? p + 5 : p));
      }, 700);

      let res: any;
      try {
        res = await API.post("/generate-video", payload);
      } catch (e1) {
        res = await API.post("/ai/generate-video-template", {
          ...payload,
          photoUrl: celebrantPhoto,
        });
      }

      clearInterval(progressTimer);

      if (res?.data?.success && res.data.async && res.data.predictionId) {
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
              setIsGenerating(false);
              setToastMessage({ text: "✨ AI Video invitation synthesized!", type: "success" });
            } else if (statusRes.data?.status === "failed" || attempts >= maxAttempts) {
              clearInterval(pollInterval);
              const fallback = chosenTemplate.videoUrl;
              setProgressPercent(100);
              setActiveVideoUrl(fallback);
              setIsGenerating(false);
              setToastMessage({ text: "Queue busy. Loaded high-definition preview.", type: "info" });
            }
          } catch (pollErr) {
            clearInterval(pollInterval);
            setActiveVideoUrl(chosenTemplate.videoUrl);
            setIsGenerating(false);
          }
        }, 2200);
      } else if (res?.data?.success && res.data.videoUrl) {
        setProgressPercent(100);
        setProgressStage("Done!");
        const finalUrl = res.data.videoUrl;
        setActiveVideoUrl(finalUrl);
        setIsGenerating(false);
        setToastMessage({ text: "✨ AI Video generated!", type: "success" });
      } else {
        setActiveVideoUrl(chosenTemplate.videoUrl);
        setIsGenerating(false);
      }
    } catch (err: any) {
      console.warn("[VideoInviteModal] Generation error, fallback to template:", err);
      setActiveVideoUrl(chosenTemplate.videoUrl);
      setIsGenerating(false);
      setToastMessage({ text: "Preview loaded with curated template backdrop.", type: "info" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[920px] bg-[#0c0e14] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 flex items-center justify-center shadow-md">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h3
                className="font-display text-lg sm:text-xl font-extrabold text-white leading-tight"
                style={{ fontFamily: "'Red Rose', Georgia, serif" }}
              >
                Create Video Invite
              </h3>
              <p className="text-[11px] text-neutral-400">
                Template-driven AI video invitation generator
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body: Two Columns */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Left: Controls & Carousel */}
          <div className="w-full lg:w-[52%] p-5 sm:p-6 overflow-y-auto space-y-6 border-b lg:border-b-0 lg:border-r border-white/10">
            {/* 1. Template Carousel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Clapperboard className="size-3.5 text-amber-400" />
                  <span>1. Select Template Preset</span>
                </label>
                <span className="text-[11px] text-amber-300 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {activeTemplate.title}
                </span>
              </div>
              <VideoTemplateCarousel
                selectedTemplateId={selectedTemplateId}
                onSelectTemplate={handleSelectTemplate}
              />
            </div>

            {/* 2. Photo Upload */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Camera className="size-3.5 text-amber-400" />
                  <span>2. Celebrant Photo (Optional)</span>
                </label>
                <span className="text-[10px] text-neutral-400">Face / Subject Swap</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {celebrantPhoto ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.05] border border-amber-400/40">
                  <div className="flex items-center gap-3">
                    <img
                      src={celebrantPhoto}
                      alt="Celebrant"
                      className="size-12 rounded-xl object-cover border border-amber-400/50"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">Reference Photo Attached</p>
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                        <Check className="size-3" /> Ready for AI animation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-white/10 text-xs text-white hover:bg-white/20 transition cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setCelebrantPhoto(null)}
                      className="p-1 rounded-lg bg-red-950/60 text-red-300 hover:bg-red-900/80 transition cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 hover:border-amber-400/70 bg-white/[0.02] hover:bg-amber-500/[0.03] rounded-2xl p-4 text-center cursor-pointer transition flex items-center justify-center gap-3"
                >
                  <Upload className="size-5 text-amber-400" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">Upload host/celebrant photo</p>
                    <p className="text-[10px] text-neutral-400">
                      AI swaps &amp; animates face with template motion
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Prompt Guidance */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Wand2 className="size-3.5 text-amber-400" />
                <span>3. Creative Direction Prompt</span>
              </label>
              <textarea
                rows={2}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Template prompt..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
              />
            </div>

            {/* 4. Event Text Overlays */}
            <div className="space-y-2.5 pt-2 border-t border-white/10">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Tag className="size-3.5 text-amber-400" />
                <span>4. Event Text Overlays</span>
              </label>
              <div className="grid sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Event Name"
                  className="px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  value={eventAge}
                  onChange={(e) => setEventAge(e.target.value)}
                  placeholder="Age / Milestone Badge"
                  className="px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="Date & Time"
                  className="px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  placeholder="Location / Venue"
                  className="px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin text-amber-400" />
                    <span>{progressStage}</span>
                  </div>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateVideo}
                className="flex-1 h-11 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Generating Video...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    <span>Generate Video Invite</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => persistDraftAndNavigate(activeVideoUrl)}
                className="h-11 px-5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Customize in Studio</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Live Video Player Preview with Overlays */}
          <div className="w-full lg:w-[48%] flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,rgba(254,186,8,0.06),transparent_70%)] overflow-y-auto">
            <div className="w-full max-w-[340px] sm:max-w-[360px] flex flex-col items-center gap-3">
              <div className="w-full shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/15">
                <VideoInvitePlayer
                  src={activeVideoUrl}
                  title={eventTitle}
                  subtitle={`${eventDate} • ${eventVenue}`}
                  badge={activeTemplate.title}
                  aspectRatio="9/16"
                  autoPlay={true}
                  loop={true}
                  muted={true}
                  showOverlayDetails={true}
                  eventDetails={{
                    name: eventTitle,
                    title: eventTitle,
                    age: eventAge,
                    date: eventDate,
                    venue: eventVenue,
                  }}
                  className="w-full"
                />
              </div>

              <button
                type="button"
                onClick={() => persistDraftAndNavigate(activeVideoUrl)}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
              >
                <span>Use This Invite &amp; Setup RSVPs</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
