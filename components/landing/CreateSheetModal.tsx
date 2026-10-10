"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Clapperboard,
  Wand2,
  ImagePlus,
  Upload,
  Check,
  X,
  User,
  Briefcase,
  ArrowRight,
  Lock,
  CheckCircle,
  Users,
  CreditCard,
  Bell,
  ScanLine,
  SlidersHorizontal,
  ChevronDown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RefreshCw,
  Download,
  Loader2,
  Camera,
} from "lucide-react";
import { TEMPLATES, findTemplate, IMG, type TemplateItem } from "./data";
import ExperienceVisual from "./ExperienceVisual";
import Modal from "./Modal";
import type { Mode } from "./CreateSheetContext";
import { cn } from "@/lib/utils";
import API from "@/services/api";

interface CreateSheetModalProps {
  initialMode?: Mode;
  initialPhoto?: string;
  initialTemplate?: string;
  initialAudience?: "individual" | "pro";
  initialPlan?: string;
  onClose: () => void;
}

const TABS = [
  {
    id: "video",
    label: "AI video template",
    hint: "Pick a style from our library",
    icon: Clapperboard,
  },
  {
    id: "ai",
    label: "Describe it",
    hint: "AI builds the whole event",
    icon: Sparkles,
  },
  {
    id: "viral",
    label: "Make it viral",
    hint: "Something nobody has seen",
    icon: Wand2,
  },
  {
    id: "photos",
    label: "Use photos",
    hint: "Turn memories into the invite",
    icon: ImagePlus,
  },
  {
    id: "upload",
    label: "Upload design",
    hint: "Bring your own artwork",
    icon: Upload,
  },
] as const;

const AUDIENCES = [
  { id: "individual", label: "Individual", icon: User },
  { id: "pro", label: "Pros", icon: Briefcase },
] as const;

const PRO_PLANS = [
  {
    id: "creator",
    name: "Creator",
    who: "Solo hosts running one event at a time",
    monthly: 29,
    annual: 23,
    fee: "2.5% on paid tickets",
    featured: false,
    points: [
      "1 active event",
      "3 connected channels",
      "Content calendar and scheduling",
      "Tracking links on every post",
      "Basic analytics",
      "30 AI drafts a month",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    who: "Promoters and creators selling tickets every month",
    monthly: 79,
    annual: 63,
    fee: "1.5% on paid tickets",
    featured: true,
    points: [
      "Unlimited events",
      "All 5 channels, posted from one place",
      "Post-level sales attribution",
      "Unified inbox and CRM sync",
      "AI agent that fixes slow sales",
      "Guest referral links and QR check-in",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    who: "Agencies and venues running many brands",
    monthly: 199,
    annual: 159,
    fee: "0.9% on paid tickets",
    featured: false,
    points: [
      "Everything in Pro",
      "5 team seats with approvals",
      "Multiple brands and workspaces",
      "Audience groups and exports",
      "Custom domain for event pages",
      "Priority support",
    ],
  },
];

const PRESETS = [
  {
    id: "open",
    label: "Open party",
    hint: "Anyone with the link can RSVP",
  },
  {
    id: "private",
    label: "Private invite",
    hint: "Approved guests only, address hidden",
  },
  {
    id: "ticketed",
    label: "Ticketed event",
    hint: "Paid tickets, check-in QR codes",
  },
];

const SETTINGS_GROUPS = [
  { id: "privacy", title: "Privacy and access", icon: Lock, summary: "Public • Anyone can RSVP" },
  { id: "rsvp", title: "RSVP", icon: CheckCircle, summary: "Standard RSVP • Unlimited guests" },
  { id: "guestlist", title: "Guest list and co-hosts", icon: Users, summary: "Visible to guests • Host only" },
  { id: "payments", title: "Payments", icon: CreditCard, summary: "Free event • No ticket fee" },
  { id: "reminders", title: "Reminders", icon: Bell, summary: "24h and 2h before • Email and SMS" },
  { id: "dayof", title: "Day of the event", icon: ScanLine, summary: "QR check-in enabled" },
  { id: "extras", title: "More options", icon: SlidersHorizontal, summary: "Standard event link" },
];

function TemplateThumb({ template, sizes }: { template: TemplateItem; sizes: string }) {
  if (!template) return null;
  if ("kind" in template.preview) {
    return <ExperienceVisual kind={template.preview.kind} className="absolute inset-0" />;
  }
  return (
    <img
      src={template.preview.img}
      alt={template.title}
      className="size-full object-cover"
    />
  );
}

function getTemplatePhoto(template?: TemplateItem | null, customPhoto?: string | null): string {
  if (customPhoto) return customPhoto;
  if (!template) return IMG.jessica;
  if ("img" in template.preview) return template.preview.img;
  if ("kind" in template.preview) {
    const kindMap: Record<string, string> = {
      premiere: IMG.rooftop,
      vhs: IMG.party,
      news: IMG.marcus,
      golden: IMG.marcus,
      journey: IMG.oldBeach,
      redcarpet: IMG.party,
      editorial: IMG.jessica,
      "then-now": IMG.childhood,
      romantic: IMG.couple,
      surprise: IMG.party,
      haunting: IMG.halloweenHouse,
      wedding: IMG.couple,
      party: IMG.party,
      grad: IMG.grad,
      baby: IMG.baby,
      concert: IMG.concert,
      anniversary: IMG.anniversary,
      reunion: IMG.reunion,
    };
    return kindMap[template.preview.kind] || IMG.rooftop;
  }
  return IMG.jessica;
}

function AudienceSwitch({
  value,
  onChange,
  className,
}: {
  value: "individual" | "pro";
  onChange: (val: "individual" | "pro") => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Who is this for"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 w-full",
        className
      )}
    >
      {AUDIENCES.map((item) => {
        const Icon = item.icon;
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex h-11 min-w-[7.25rem] flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors cursor-pointer",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:text-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden={true} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default function CreateSheetModal({
  initialMode = "ai",
  initialPhoto,
  initialTemplate,
  initialAudience = "individual",
  initialPlan = "pro",
  onClose,
}: CreateSheetModalProps) {
  const [audience, setAudience] = useState<"individual" | "pro">(initialAudience);
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [prompt, setPrompt] = useState("");
  const [photos, setPhotos] = useState<string[]>(initialPhoto ? [initialPhoto] : []);
  const router = useRouter();
  const [step, setStep] = useState<"create" | "generating" | "video-preview" | "settings" | "done">("create");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoStage, setVideoStage] = useState("Initializing AI Director...");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoEventTitle, setVideoEventTitle] = useState("");
  const [videoEventDate, setVideoEventDate] = useState("Saturday, 15 November • 7:00 PM");
  const [videoEventVenue, setVideoEventVenue] = useState("Sky Lounge & Terrace");
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [customVideoPhoto, setCustomVideoPhoto] = useState<string | null>(initialPhoto || null);
  const previewFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    findTemplate(initialTemplate)?.id ?? null
  );
  const [isChangingTemplate, setIsChangingTemplate] = useState(
    initialTemplate === undefined || !findTemplate(initialTemplate)
  );
  const [notes, setNotes] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [openSettingsGroup, setOpenSettingsGroup] = useState<string | null>("privacy");

  const selectedTemplate = findTemplate(selectedTemplateId);
  const displayPhoto = customVideoPhoto || (photos.length > 0 ? photos[0] : getTemplatePhoto(selectedTemplate));

  const startVideoGeneration = async () => {
    const activeTemplateId = selectedTemplateId || "premiere";
    const effectivePrompt = (prompt || notes || "").trim();
    setVideoError(null);
    setIsGeneratingVideo(true);
    setVideoProgress(15);
    setVideoStage("Configuring AI Cinematic Scene...");
    setStep("generating");

    const derivedTitle = effectivePrompt
      ? effectivePrompt.split(" on ")[0].split(" at ")[0].slice(0, 40)
      : `${selectedTemplate?.title || "Special"} Celebration`;
    setVideoEventTitle(derivedTitle);

    try {
      const res = await API.post("/ai/generate-video-template", {
        templateId: activeTemplateId,
        title: derivedTitle,
        prompt: effectivePrompt,
        notes: effectivePrompt,
        date: videoEventDate,
        venue: videoEventVenue,
        photoUrl: displayPhoto,
      });

      if (res.data && res.data.success) {
        if (res.data.details) {
          if (res.data.details.title) setVideoEventTitle(res.data.details.title);
          if (res.data.details.date) setVideoEventDate(res.data.details.date);
          if (res.data.details.venue) setVideoEventVenue(res.data.details.venue);
        }

        if (res.data.videoUrl && !res.data.async) {
          setVideoProgress(100);
          setGeneratedVideoUrl(res.data.videoUrl);
          setTimeout(() => {
            setIsGeneratingVideo(false);
            setStep("video-preview");
          }, 800);
          return;
        }

        if (res.data.predictionId) {
          const predictionId = res.data.predictionId;
          setVideoProgress(25);
          setVideoStage("Replicate AI is generating video motion frames...");

          let attempts = 0;
          const maxAttempts = 50;
          const pollInterval = setInterval(async () => {
            attempts++;
            try {
              setVideoProgress((prev) => Math.min(prev + (prev < 80 ? 3 : 1), 94));
              if (attempts === 3) setVideoStage("Replicate AI rendering camera motion...");
              if (attempts === 8) setVideoStage("Rendering volumetric lighting & visual atmosphere...");
              if (attempts === 15) setVideoStage("Interpolating high frame-rate motion...");
              if (attempts === 24) setVideoStage("Finalizing cinematic color grade & invitation layout...");

              const statusRes = await API.get(`/ai/video-status/${predictionId}`);
              if (statusRes.data && statusRes.data.success) {
                const status = statusRes.data.status;
                if (status === "succeeded" && statusRes.data.videoUrl) {
                  clearInterval(pollInterval);
                  setVideoProgress(100);
                  setVideoStage("Video invitation ready!");
                  setGeneratedVideoUrl(statusRes.data.videoUrl);
                  setTimeout(() => {
                    setIsGeneratingVideo(false);
                    setStep("video-preview");
                  }, 600);
                } else if (status === "failed" || status === "canceled") {
                  clearInterval(pollInterval);
                  const fallbackUrl = "/videos/golden-celebration.mp4";
                  setGeneratedVideoUrl(fallbackUrl);
                  setVideoProgress(100);
                  setTimeout(() => {
                    setIsGeneratingVideo(false);
                    setStep("video-preview");
                  }, 600);
                }
              }

              if (attempts >= maxAttempts) {
                clearInterval(pollInterval);
                const fallbackUrl = "/videos/golden-celebration.mp4";
                setGeneratedVideoUrl(fallbackUrl);
                setStep("video-preview");
                setIsGeneratingVideo(false);
              }
            } catch (pollErr) {
              console.error("Poll error:", pollErr);
            }
          }, 3500);

          return;
        }
      }

      setGeneratedVideoUrl("/videos/golden-celebration.mp4");
      setStep("video-preview");
      setIsGeneratingVideo(false);
    } catch (err: any) {
      console.error("Video Generation Error:", err);
      setGeneratedVideoUrl("/videos/golden-celebration.mp4");
      setStep("video-preview");
      setIsGeneratingVideo(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateListRef = useRef<HTMLUListElement>(null);

  const selectedPlan =
    PRO_PLANS.find((p) => p.id === selectedPlanId) || PRO_PLANS[1];

  useEffect(() => {
    if (mode !== "video" || !isChangingTemplate) return;
    const listEl = templateListRef.current;
    const activeEl = listEl?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (listEl && activeEl) {
      listEl.scrollLeft =
        activeEl.offsetLeft - (listEl.clientWidth - activeEl.offsetWidth) / 2;
    }
  }, [mode, isChangingTemplate]);

  useEffect(() => {
    return () => {
      photos.forEach((src) => {
        if (src.startsWith("blob:") && src !== initialPhoto) {
          URL.revokeObjectURL(src);
        }
      });
    };
  }, [photos, initialPhoto]);

  const isPhotosOrUpload = mode === "photos" || mode === "upload";
  const isValid =
    mode === "video"
      ? selectedTemplateId !== null
      : isPhotosOrUpload
      ? photos.length > 0
      : prompt.trim().length > 3;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setCustomVideoPhoto(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal open={true} onClose={onClose} label="Create an event" variant="sheet">
      {step === "generating" ? (
        /* STEP: AI Video Director Generation Loader */
        <div className="relative flex max-h-[88svh] min-h-[460px] flex-col items-center justify-center px-6 py-10 text-center">
          <button
            type="button"
            onClick={() => {
              setIsGeneratingVideo(false);
              setStep("create");
            }}
            aria-label="Cancel"
            className="absolute right-3 top-3 grid size-11 place-items-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
          >
            <X className="size-5" />
          </button>

          {/* Animated Template Photo Preview with Gold Ring & Clapperboard */}
          <div className="relative mb-5">
            <div className="absolute -inset-3 rounded-2xl bg-primary/25 blur-xl animate-pulse" />
            <div className="relative size-24 sm:size-28 overflow-hidden rounded-2xl border-2 border-primary/60 shadow-[0_0_35px_rgba(234,179,8,0.3)] bg-black">
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt={selectedTemplate?.title || "Template"}
                  className="size-full object-cover animate-pulse"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid size-9 place-items-center rounded-full bg-black/70 backdrop-blur-md border border-primary/60 text-primary shadow-lg">
                  <Clapperboard className="size-4.5 animate-bounce" />
                </span>
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3 animate-spin" />
            Replicate AI Video Engine
          </span>

          <h2 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Directing Your Video Invite
          </h2>

          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Crafting a cinematic 9:16 motion invitation for{" "}
            <span className="font-semibold text-foreground">
              {selectedTemplate?.title || "your celebration"}
            </span>.
          </p>

          {/* Progress Bar & Stage */}
          <div className="mt-7 w-full max-w-xs space-y-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500 rounded-full"
                style={{ width: `${videoProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 text-primary font-medium animate-pulse">
                <Loader2 className="size-3 animate-spin" />
                {videoStage}
              </span>
              <span className="font-mono font-bold text-foreground">{videoProgress}%</span>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-left max-w-sm w-full">
            <div className="flex items-start gap-3">
              <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
              <div className="text-xs text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground">What happens next:</p>
                <p className="mt-0.5">
                  Your photo is blended with dynamic motion effects, luxury typography, and interactive RSVP options.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsGeneratingVideo(false);
              setStep("create");
            }}
            className="mt-5 text-xs text-muted-foreground hover:text-foreground underline transition cursor-pointer"
          >
            Cancel and choose another style
          </button>
        </div>
      ) : step === "video-preview" ? (
        /* STEP: Video Preview & Overlay Customization */
        <div className="flex max-h-[88svh] flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Clapperboard className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold leading-none">Your AI Video Invitation</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {selectedTemplate?.title} • 9:16 Vertical Video
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-9 place-items-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="flex flex-col items-center">
              {/* Phone Frame 9:16 Video & Image Player */}
              <div className="relative aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-3xl border-2 border-white/20 bg-black shadow-2xl">
                {/* 1. Base Video / Visual Background */}
                {generatedVideoUrl ? (
                  <video
                    ref={videoRef}
                    src={generatedVideoUrl}
                    poster={displayPhoto || undefined}
                    autoPlay
                    loop
                    playsInline
                    muted={isVideoMuted}
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt={videoEventTitle || "Celebrant"}
                    className="absolute inset-0 size-full object-cover scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black" />
                )}

                {/* 2. Atmospheric dark vignette gradient so text and glowing effects stand out */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

                {/* 3. Prominent Celebrant Portrait Ring Avatar (ONLY shown if custom photo uploaded) */}
                {customVideoPhoto && (
                  <div className="absolute top-[16%] inset-x-0 z-10 flex flex-col items-center pointer-events-none">
                    <div
                      className="relative pointer-events-auto group cursor-pointer"
                      onClick={() => previewFileInputRef.current?.click()}
                      title="Click to change photo"
                    >
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 blur-sm opacity-90 animate-pulse" />
                      <div className="relative size-20 rounded-full border-2 border-amber-300 overflow-hidden shadow-2xl bg-black/50">
                        <img
                          src={customVideoPhoto}
                          alt={videoEventTitle}
                          className="size-full object-cover"
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg border border-black/60 transition group-hover:scale-110">
                        <Camera className="size-3" />
                      </span>
                    </div>
                    <span className="mt-1.5 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300 border border-amber-400/30 shadow">
                      Guest of Honor
                    </span>
                  </div>
                )}

                {/* 4. Floating Top Bar Controls */}
                <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-primary border border-white/15">
                    <Sparkles className="size-2.5" />
                    AI Video Template
                  </span>
                  <div className="flex items-center gap-1.5">
                    {generatedVideoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlayingVideo) {
                              videoRef.current.pause();
                              setIsPlayingVideo(false);
                            } else {
                              videoRef.current.play();
                              setIsPlayingVideo(true);
                            }
                          }
                        }}
                        className="grid size-8 place-items-center rounded-full bg-black/70 backdrop-blur-md text-white/80 hover:text-white border border-white/15 transition cursor-pointer"
                        title={isPlayingVideo ? "Pause" : "Play"}
                      >
                        {isPlayingVideo ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => previewFileInputRef.current?.click()}
                      className="grid size-8 place-items-center rounded-full bg-black/70 backdrop-blur-md text-white/80 hover:text-white border border-white/15 transition cursor-pointer"
                      title="Upload your photo"
                    >
                      <Camera className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsVideoMuted(!isVideoMuted)}
                      className="grid size-8 place-items-center rounded-full bg-black/70 backdrop-blur-md text-white/80 hover:text-white border border-white/15 transition cursor-pointer"
                      title={isVideoMuted ? "Unmute" : "Mute"}
                    >
                      {isVideoMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 6. Floating Bottom RSVP Card */}
                <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/90 to-transparent p-3.5 text-center">
                  <div className="rounded-2xl border border-white/15 bg-black/60 backdrop-blur-md p-3 shadow-xl">
                    <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-primary">
                      You Are Cordially Invited
                    </span>
                    <h4 className="mt-0.5 font-display text-sm font-extrabold uppercase leading-tight tracking-tight text-white line-clamp-1">
                      {videoEventTitle || "Celebration"}
                    </h4>
                    <p className="mt-0.5 text-[11px] font-medium text-white/90">
                      {videoEventDate}
                    </p>
                    <p className="text-[10px] text-white/60 truncate">
                      {videoEventVenue}
                    </p>

                    <div className="mt-2 rounded-full bg-primary/95 py-1.5 text-[10px] font-bold text-primary-foreground shadow">
                      RSVP • WILL YOU ATTEND?
                    </div>
                  </div>
                </div>
              </div>

              {/* Hidden File Input for Instant Photo Change */}
              <input
                ref={previewFileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Quick Details & Photo Customizer */}
              <div className="mt-4 w-full max-w-sm space-y-3 rounded-2xl border border-border bg-card p-4 text-xs">
                {/* Photo Swap Row */}
                <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative size-10 rounded-lg overflow-hidden border border-border bg-black shrink-0">
                      {displayPhoto ? (
                        <img src={displayPhoto} alt="Celebrant" className="size-full object-cover" />
                      ) : (
                        <Camera className="m-auto size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">Template / Event Photo</p>
                      <p className="text-[10px] text-muted-foreground truncate">Visible in video invitation</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => previewFileInputRef.current?.click()}
                    className="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent transition cursor-pointer flex items-center gap-1.5 text-foreground"
                  >
                    <Camera className="size-3 text-primary" />
                    Change Photo
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground block font-medium">Event Title</label>
                  <input
                    type="text"
                    value={videoEventTitle}
                    onChange={(e) => setVideoEventTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    placeholder="e.g. Rahul's 25th Birthday"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground block font-medium">Date & Time</label>
                    <input
                      type="text"
                      value={videoEventDate}
                      onChange={(e) => setVideoEventDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                      placeholder="e.g. Sat, Nov 15 • 7 PM"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground block font-medium">Venue</label>
                    <input
                      type="text"
                      value={videoEventVenue}
                      onChange={(e) => setVideoEventVenue(e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                      placeholder="e.g. Sky Lounge"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-border px-5 py-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem("pending_upload_invite", generatedVideoUrl || displayPhoto || "");
                  sessionStorage.setItem("pending_upload_title", videoEventTitle);
                  sessionStorage.setItem("pending_template_id", selectedTemplateId || "");
                  sessionStorage.setItem("pending_event_type", selectedTemplate?.title || "Video Celebration");
                  sessionStorage.setItem("pending_venue", videoEventVenue);
                  sessionStorage.setItem("pending_event_date", videoEventDate);
                  if (displayPhoto) {
                    sessionStorage.setItem("pending_celebrant_photo", displayPhoto);
                  }

                  localStorage.setItem("pending_upload_invite", generatedVideoUrl || displayPhoto || "");
                  localStorage.setItem("pending_upload_title", videoEventTitle);
                  localStorage.setItem("pending_template_id", selectedTemplateId || "");
                  if (displayPhoto) {
                    localStorage.setItem("pending_celebrant_photo", displayPhoto);
                  }
                }
                onClose();
                router.push(`/dashboard/invitations?studio=true&videoInvite=1&uploadedImageUrl=${encodeURIComponent(generatedVideoUrl || displayPhoto || "")}`);
              }}
              className="h-12 w-full rounded-full bg-primary text-sm font-bold text-primary-foreground shadow hover:brightness-110 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Use This Video & Setup Event</span>
              <ArrowRight className="size-4" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep("create");
                  setIsChangingTemplate(true);
                }}
                className="h-10 flex-1 rounded-full border border-border bg-card text-xs font-semibold hover:bg-muted transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                Change Template
              </button>

              {generatedVideoUrl && (
                <a
                  href={generatedVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="invitation-video.mp4"
                  className="h-10 flex-1 rounded-full border border-border bg-card text-xs font-semibold hover:bg-muted transition cursor-pointer flex items-center justify-center gap-1.5 text-foreground"
                >
                  <Download className="size-3.5" />
                  Download Video
                </a>
              )}
            </div>
          </div>
        </div>
      ) : step === "settings" ? (
        /* STEP 2: Settings */
        <div className="flex max-h-[88svh] flex-col">
          <div className="px-5 pb-4 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Step 2 of 2
            </p>
            <h2 className="mt-1.5 font-display text-3xl font-extrabold leading-none tracking-tight">
              Set up your event
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick a quick setup or open any group. You can change all of this later.
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 flex flex-col gap-5">
            {/* Presets */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick setup
              </p>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      setStatusMessage(
                        `${preset.label} applied. Review the groups below, then save.`
                      )
                    }
                    className="flex min-h-14 w-44 shrink-0 flex-col items-start justify-center rounded-2xl border border-border bg-card px-4 py-2 text-left transition hover:border-primary/60 active:scale-[0.98] cursor-pointer"
                  >
                    <span className="text-[15px] font-semibold leading-tight">
                      {preset.label}
                    </span>
                    <span className="mt-0.5 text-xs leading-snug text-muted-foreground">
                      {preset.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion Groups */}
            <div className="flex flex-col gap-3">
              {SETTINGS_GROUPS.map((grp) => {
                const Icon = grp.icon;
                const isOpen = openSettingsGroup === grp.id;
                return (
                  <div
                    key={grp.id}
                    className="rounded-2xl border border-border bg-card overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenSettingsGroup(isOpen ? null : grp.id)
                      }
                      className="flex w-full items-center justify-between p-4 text-left transition hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl bg-white/5 text-primary">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold">{grp.title}</h3>
                          <p className="text-xs text-muted-foreground">{grp.summary}</p>
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          "size-4 text-muted-foreground transition-transform duration-200",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-border p-4 text-xs text-muted-foreground space-y-2">
                        <p>Configure {grp.title.toLowerCase()} preferences for your guests.</p>
                        <div className="flex items-center justify-between py-1">
                          <span className="text-foreground">Enable active option</span>
                          <span className="text-primary font-semibold">Active</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border px-5 pb-6 pt-4 flex flex-wrap items-center gap-3">
            <p className="min-w-0 flex-1 basis-48 text-sm text-muted-foreground">
              {statusMessage || "All changes saved."}
            </p>
            <button
              type="button"
              onClick={() => setStep("done")}
              className="h-12 rounded-full px-4 text-sm font-semibold text-muted-foreground transition hover:text-foreground cursor-pointer"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={() => setStep("done")}
              className="h-12 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition active:scale-95 cursor-pointer hover:brightness-110"
            >
              Save and continue
            </button>
          </div>
        </div>
      ) : step === "done" ? (
        /* STEP 3: Done Confirmation */
        <div className="flex flex-col items-center gap-4 px-6 pb-10 pt-12 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Check className="size-8" aria-hidden={true} />
          </span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight">
            Great start.
          </h2>
          <p className="max-w-xs text-pretty text-muted-foreground">
            Next, create a free account and we&apos;ll build your event from this.
            Your first event is free. No app required for your guests.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 h-12 rounded-full bg-primary px-8 font-semibold text-primary-foreground hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      ) : audience === "pro" ? (
        /* PRO AUDIENCE SHEET */
        <div className="flex max-h-[88svh] flex-col">
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <div className="mx-auto h-1.5 w-10 rounded-full bg-white/20 sm:hidden" aria-hidden={true} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 grid size-11 place-items-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            <AudienceSwitch value="pro" onChange={setAudience} />
            <h2 className="mt-5 font-display text-3xl font-extrabold leading-none tracking-tight">
              Set up Eventizers Pro
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Post everywhere from one place, track every ticket, and answer every lead.
            </p>
            <div role="radiogroup" aria-label="Choose a plan" className="mt-5 flex flex-col gap-2">
              {PRO_PLANS.map((plan) => {
                const active = plan.id === selectedPlanId;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={cn(
                      "flex min-h-[64px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition cursor-pointer",
                      active
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full border-2",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-foreground/30"
                      )}
                      aria-hidden={true}
                    >
                      {active && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-base font-semibold">
                        {plan.name}
                        {plan.featured && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
                            Popular
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {plan.who}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="font-display text-xl font-extrabold">
                        ${plan.monthly}
                      </span>
                      <span className="block text-xs text-muted-foreground">per month</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <ul className="mt-4 flex flex-col gap-2 rounded-2xl bg-card p-4 text-sm">
              {selectedPlan.points.slice(0, 4).map((pt) => (
                <li key={pt} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden={true} />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-border px-5 pb-6 pt-4">
            <Link
              href="/pro"
              onClick={onClose}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-primary-foreground transition active:scale-[0.98] hover:brightness-110"
            >
              Start 14-day free trial
              <ArrowRight className="size-5" aria-hidden={true} />
            </Link>
            <p className="mt-2 text-center text-sm font-semibold text-primary">
              {selectedPlan.name} free for 14 days, then ${selectedPlan.monthly} per month.
            </p>
            <Link
              href="/pro"
              onClick={onClose}
              className="mt-1 flex h-11 w-full items-center justify-center text-sm font-semibold text-primary hover:underline"
            >
              See everything Pro includes
            </Link>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Preview: this opens the demo dashboard with sample data.
            </p>
          </div>
        </div>
      ) : (
        /* STEP 1: Main Create Event Modal */
        <div className="flex max-h-[88svh] flex-col">
          {/* Top Grab Handle & Close Button */}
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <div
              className="mx-auto h-1.5 w-10 rounded-full bg-white/20 sm:hidden"
              aria-hidden={true}
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 grid size-11 place-items-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            {/* Audience Switcher */}
            <AudienceSwitch value="individual" onChange={setAudience} />

            {/* Title & Subheading */}
            <h2 className="mt-5 font-display text-3xl font-extrabold leading-none tracking-tight">
              What are you celebrating?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick a way to start. Eventizers takes it from there.
            </p>

            {/* 5 Tabs Grid */}
            <div
              role="tablist"
              aria-label="How to start"
              className="mt-5 grid grid-cols-2 gap-2"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === mode;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setMode(tab.id);
                      setPhotos([]);
                    }}
                    className={cn(
                      "flex min-h-[50px] items-center gap-2.5 rounded-2xl border px-3 py-2 text-left transition cursor-pointer",
                      tab.id === "video" && "col-span-2",
                      active
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-muted"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[18px] shrink-0",
                        active ? "text-primary" : "text-muted-foreground"
                      )}
                      aria-hidden={true}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-tight">
                        {tab.label}
                      </span>
                      {tab.id === "video" && (
                        <span className="block text-xs leading-tight text-muted-foreground">
                          {tab.hint}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="mt-5">
              {mode === "video" ? (
                <>
                  {selectedTemplate && !isChangingTemplate ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-primary/60 bg-primary/10 p-3">
                      <span className="relative block aspect-[9/16] w-14 shrink-0 overflow-hidden rounded-xl">
                        <TemplateThumb template={selectedTemplate} sizes="56px" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-primary">
                          Selected template
                        </span>
                        <span className="mt-0.5 block truncate text-base font-semibold">
                          {selectedTemplate.title}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {selectedTemplate.tier}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsChangingTemplate(true)}
                        className="h-11 shrink-0 rounded-full border border-border bg-card px-4 text-sm font-semibold transition hover:bg-muted active:scale-95 cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">Choose a template</p>
                        {selectedTemplate && (
                          <button
                            type="button"
                            onClick={() => setIsChangingTemplate(false)}
                            className="flex h-11 items-center px-1 text-sm font-semibold text-primary cursor-pointer hover:underline"
                          >
                            Keep {selectedTemplate.title}
                          </button>
                        )}
                      </div>
                      <ul
                        ref={templateListRef}
                        role="listbox"
                        aria-label="Invitation templates"
                        className="no-scrollbar relative -mx-5 mt-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2"
                      >
                        {TEMPLATES.map((item) => {
                          const active = selectedTemplateId === item.id;
                          return (
                            <li key={item.id} className="w-[112px] shrink-0 snap-start">
                              <button
                                type="button"
                                role="option"
                                aria-selected={active}
                                onClick={() => {
                                  setSelectedTemplateId(item.id);
                                  setIsChangingTemplate(false);
                                }}
                                className="block w-full text-left cursor-pointer"
                              >
                                <span
                                  className={cn(
                                    "relative block aspect-[9/16] w-full overflow-hidden rounded-2xl border-2 transition",
                                    active ? "border-primary" : "border-transparent"
                                  )}
                                >
                                  <TemplateThumb template={item} sizes="112px" />
                                  {active && (
                                    <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow">
                                      <Check className="size-4" aria-hidden={true} />
                                    </span>
                                  )}
                                </span>
                                <span className="mt-2 block text-[13px] font-semibold leading-tight">
                                  {item.title}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                  {item.tier}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}

                  <label
                    htmlFor="create-video-notes"
                    className="mt-4 block text-sm font-semibold"
                  >
                    Tell us about your event{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="create-video-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Marcus turns 50 on June 21 at the rooftop…"
                    className="mt-2 w-full resize-none rounded-2xl border border-border bg-card p-4 text-base leading-relaxed placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </>
              ) : isPhotosOrUpload ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={mode === "photos"}
                    accept={mode === "photos" ? "image/*" : "image/*,application/pdf"}
                    className="sr-only"
                    onChange={(e) => {
                      if (!e.target.files) return;
                      const files = Array.from(e.target.files)
                        .slice(0, 8)
                        .map((f) => URL.createObjectURL(f));
                      setPhotos(mode === "upload" ? files.slice(0, 1) : files);
                    }}
                    aria-label={mode === "photos" ? "Upload photos" : "Upload your design"}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/25 bg-card p-4 text-center hover:bg-muted cursor-pointer transition"
                  >
                    {photos.length ? (
                      <span className="flex flex-wrap justify-center gap-2">
                        {photos.map((src, idx) => (
                          <span
                            key={idx}
                            className="relative size-16 overflow-hidden rounded-xl border border-white/10"
                          >
                            <img src={src} alt="" className="size-full object-cover" />
                          </span>
                        ))}
                      </span>
                    ) : (
                      <>
                        <ImagePlus className="size-7 text-primary" aria-hidden={true} />
                        <span className="font-semibold">
                          {mode === "photos"
                            ? "Add one photo or many"
                            : "Drop your PNG, JPG or PDF"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {mode === "photos"
                            ? "Old ones work beautifully."
                            : "We add RSVP, guests and reminders around it."}
                        </span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <label htmlFor="create-prompt" className="sr-only">
                    Describe your event
                  </label>
                  <textarea
                    id="create-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder={
                      mode === "ai"
                        ? "Create an elegant rooftop 40th birthday in NYC…"
                        : "Make my 30th birthday feel like a ridiculous Hollywood action trailer…"
                    }
                    className="w-full resize-none rounded-2xl border border-border bg-card p-4 text-base leading-relaxed placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </>
              )}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="border-t border-border px-5 pb-6 pt-4">
            <button
              type="button"
              disabled={!isValid || isGeneratingVideo}
              onClick={() => {
                if (mode === "video" || mode === "ai") {
                  startVideoGeneration();
                } else {
                  setStep("settings");
                }
              }}
              className="h-14 w-full rounded-full bg-primary text-base font-bold text-primary-foreground transition active:scale-[0.98] disabled:opacity-40 hover:brightness-110 cursor-pointer flex items-center justify-center gap-2"
            >
              {mode === "video" ? (
                <>
                  <Clapperboard className="size-5" />
                  <span>Create my video invite</span>
                </>
              ) : mode === "ai" ? (
                <>
                  <Sparkles className="size-5" />
                  <span>Create with AI</span>
                </>
              ) : mode === "viral" ? (
                "Generate concepts"
              ) : mode === "photos" ? (
                "Bring them to life"
              ) : (
                "Add my design"
              )}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Your first event is free. No app required.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
