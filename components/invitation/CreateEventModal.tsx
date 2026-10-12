"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import {
  Clapperboard,
  Sparkles,
  Wand2,
  ImagePlus,
  Upload,
  X,
  Check,
  Camera,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertCircle,
  Film,
  Zap,
  Sliders,
  CheckCircle2,
  Calendar,
  MapPin,
  Flame,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import API from "@/services/api";
import {
  TemplateOption,
  CreateEventModalProps,
  CreateAiTemplateResponse,
  VideoStatusResponse,
} from "@/types/videoInvite";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

// Curated list of base templates and category styles
const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: "baby-dance",
    title: "Baby Dance",
    category: "Fun & Kids",
    tier: "Included",
    thumbnail: "/images/baby.webp",
    stylePrefix:
      "Joyful celebratory baby dance animation with high-energy cute moves, colorful confetti bursts, vibrant party lights, cinematic 9:16 mobile frame",
    sampleDescription: "Baby Leo turns 1! Join our joyful first birthday dance party celebration",
  },
  {
    id: "groove-duo",
    title: "Groove Duo",
    category: "Dance & Party",
    tier: "Included",
    thumbnail: "/images/party.webp",
    stylePrefix:
      "Dynamic dancing duo celebrating on the dance floor with synchronized choreography, pulsing club spotlights, disco sparkles, energetic motion",
    sampleDescription: "Join Maya & Alex on the dance floor for their epic anniversary bash",
  },
  {
    id: "mic-drop",
    title: "Mic Drop Rap",
    category: "Hip-Hop & Stage",
    tier: "Premium",
    thumbnail: "/images/concert.webp",
    stylePrefix:
      "Epic hip-hop stage mic drop moment, dramatic smoke cannons, golden laser beams, stadium flashbulbs, superstar hype celebration",
    sampleDescription: "Mic Drop 30! Jordan's headline birthday concert and afterparty",
  },
  {
    id: "burj-khalifa",
    title: "Burj Khalifa Birthday",
    category: "Milestones & Luxury",
    tier: "Signature",
    thumbnail: "/images/rooftop.webp",
    stylePrefix:
      "Spectacular Burj Khalifa skyscraper LED laser celebration, Dubai fountain lights, illuminated personalized birthday projection, golden fireworks",
    sampleDescription: "Dubai Skyline Gala: An extraordinary evening celebrating Marcus's milestone",
  },
  {
    id: "lion-lady",
    title: "Lion & The Lady",
    category: "Fantasy & Royalty",
    tier: "Signature",
    thumbnail: "/images/anniversary.webp",
    stylePrefix:
      "Regal luxury fantasy royal court with magnificent golden lion companion, ethereal golden twilight, velvet banners, opulent royal celebration",
    sampleDescription: "A Royal Court Birthday Celebration for Queen Victoria's 40th",
  },
  {
    id: "rooftop-40th",
    title: "Rooftop 40th Birthday",
    category: "Cocktails & Chic",
    tier: "Premium",
    thumbnail: "/images/jessica.webp",
    stylePrefix:
      "Glamorous VIP penthouse rooftop celebration under city skyline, champagne sparkle fountains, warm ambient fairy lights, golden milestone toast",
    sampleDescription: "Jessica turns 40! Rooftop cocktail evening under the stars",
  },
  {
    id: "grad",
    title: "Graduation",
    category: "Academic & Commencement",
    tier: "Included",
    thumbnail: "/images/grad.webp",
    stylePrefix:
      "Epic cinematic graduation commencement celebration, golden confetti drifting in slow motion, sunlit graduation caps flying, triumphant warm golden rim lighting",
    sampleDescription: "Honoring our class of 2026 graduation banquet & celebration",
  },
  {
    id: "jessica",
    title: "Milestone Birthday",
    category: "Birthdays",
    tier: "Included",
    thumbnail: "/images/jessica.webp",
    stylePrefix:
      "Ultra-luxury milestone birthday celebration, shimmering golden bokeh, floating gold dust particles, elegant soft spotlight illuminating the celebrant",
    sampleDescription: "Jessica turns 30! Rooftop cocktail evening under the skyline",
  },
  {
    id: "premiere",
    title: "Movie Premiere",
    category: "Cinematic & Gala",
    tier: "Premium",
    thumbnail: "/images/rooftop.webp",
    stylePrefix:
      "Hollywood blockbuster movie premiere trailer teaser, dramatic rich red velvet curtains opening, warm golden spotlights, floating particles in dark luxury theatre",
    sampleDescription: "A blockbuster Hollywood-style premiere party for Marcus",
  },
  {
    id: "wedding",
    title: "Wedding & Nuptials",
    category: "Weddings",
    tier: "Premium",
    thumbnail: "/images/couple.webp",
    stylePrefix:
      "Romantic ethereal wedding celebration garden, soft pastel rose petals gently floating in breeze, golden hour sunlight bokeh, floral elegance",
    sampleDescription: "Join us as Sarah & David celebrate their union with an outdoor reception",
  },
  {
    id: "golden",
    title: "Golden Milestone",
    category: "Milestones",
    tier: "Signature",
    thumbnail: "/images/anniversary.webp",
    stylePrefix:
      "Ultra-luxury black and 3D shimmering gold particles, elegant milestone celebration, fluid metallic golden motion, sparkling light reflections",
    sampleDescription: "Celebrating 50 golden years of love, memories, and family",
  },
  {
    id: "vhs",
    title: "Retro VHS",
    category: "Vintage & Nostalgia",
    tier: "Premium",
    thumbnail: "/images/old-beach.webp",
    stylePrefix:
      "Nostalgic 1990s retro home video aesthetic, subtle VHS magnetic tape scanlines, warm CRT glow, vibrant nostalgic party lighting",
    sampleDescription: "Throwback 90s neon basement party with classic retro vibes",
  },
  {
    id: "news",
    title: "Breaking News",
    category: "Novelty & Fun",
    tier: "Included",
    thumbnail: "/images/marcus.webp",
    stylePrefix:
      "Dynamic breaking news broadcast television studio backdrop, rotating digital globe, sleek crimson high-tech motion graphics",
    sampleDescription: "Breaking news bulletin: Marcus is officially hitting half a century",
  },
  {
    id: "party",
    title: "House Party",
    category: "Parties",
    tier: "Included",
    thumbnail: "/images/party.webp",
    stylePrefix:
      "Festive high-energy celebration, colorful confetti explosion in slow motion, floating metallic helium balloons, dynamic party disco lights",
    sampleDescription: "Late night house party with live DJ, cocktails, and dancing",
  },
  {
    id: "redcarpet",
    title: "Red Carpet Gala",
    category: "VIP & Galas",
    tier: "Premium",
    thumbnail: "/images/corporate.webp",
    stylePrefix:
      "Exclusive celebrity red carpet gala, flashing camera flashes and paparazzi light bursts, champagne sparkles, luxury golden velvet stanchions",
    sampleDescription: "VIP black-tie charity gala and champagne celebration",
  },
  {
    id: "baby",
    title: "Baby Shower",
    category: "Family & Kids",
    tier: "Included",
    thumbnail: "/images/baby.webp",
    stylePrefix:
      "Gentle whimsical fairytale dreamscape, pastel cotton clouds, warm golden twinkle stars, soft dreamy anamorphic lens flare",
    sampleDescription: "Welcoming our little miracle with a warm afternoon tea gathering",
  },
];

const VIRAL_MODIFIER_TAGS = [
  "Cinematic Lighting",
  "Trendy Transitions",
  "Dynamic Camera Zoom",
  "Volumetric Fog & Bokeh",
  "Hyper-realistic 4K",
  "High-Energy Party Vibe",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export default function CreateEventModal({
  isOpen = true,
  initialMode = "video",
  initialTemplateId = "grad",
  initialPhotoUrl,
  onClose,
  onSuccess,
}: CreateEventModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pendingActionRef = useRef<((forceWithSample?: boolean) => void) | null>(null);

  // Tab & Flow states
  const [activeTab, setActiveTab] = useState<"video" | "ai" | "viral" | "photos" | "upload">(initialMode);
  const [step, setStep] = useState<"compose" | "generating" | "preview">("compose");

  // Template State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId);
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");

  // Prompt & Viral state
  const [eventDescription, setEventDescription] = useState("");
  const [isViral, setIsViral] = useState(false);
  const [activeViralTags, setActiveViralTags] = useState<string[]>([
    "Cinematic Lighting",
    "Trendy Transitions",
  ]);

  // Upload States
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [uploadedPhotoPreview, setUploadedPhotoPreview] = useState<string | null>(initialPhotoUrl || null);
  const [designAsset, setDesignAsset] = useState<File | null>(null);
  const [designAssetPreview, setDesignAssetPreview] = useState<string | null>(null);

  // Event Details State
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("Saturday, 15 November • 7:00 PM");
  const [eventVenue, setEventVenue] = useState("Sky Lounge & Terrace");

  // Generation / Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStage, setProgressStage] = useState("Initializing AI Engine...");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [activeInviteId, setActiveInviteId] = useState<string | null>(null);

  // Video Player Controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  // UI Toast & Validation Alerts
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" | "warning" } | null>(null);
  const [showPhotoWarningModal, setShowPhotoWarningModal] = useState(false);

  // File Input References
  const photoInputRef = useRef<HTMLInputElement>(null);
  const designInputRef = useRef<HTMLInputElement>(null);

  const selectedTemplate =
    TEMPLATE_OPTIONS.find((t) => t.id === selectedTemplateId) || TEMPLATE_OPTIONS[0];

  // Auto-fill Title if empty based on selected template
  useEffect(() => {
    if (!eventTitle) {
      setEventTitle(`${selectedTemplate.title} Celebration`);
    }
  }, [selectedTemplate, eventTitle]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (uploadedPhotoPreview && uploadedPhotoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(uploadedPhotoPreview);
      }
      if (designAssetPreview && designAssetPreview.startsWith("blob:")) {
        URL.revokeObjectURL(designAssetPreview);
      }
    };
  }, [uploadedPhotoPreview, designAssetPreview]);

  // Toast Auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Validate and handle photo upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setToast({
        type: "error",
        message: "Invalid file format. Please upload a PNG, JPG, or WebP photo.",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setToast({
        type: "error",
        message: `Photo exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller file.`,
      });
      return;
    }

    setUploadedPhoto(file);
    const objectUrl = URL.createObjectURL(file);
    setUploadedPhotoPreview(objectUrl);
    setToast({
      type: "success",
      message: "Personal photo attached successfully!",
    });
  };

  // Validate and handle design upload
  const handleDesignSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setToast({
        type: "error",
        message: "Invalid file format. Please upload a PNG, JPG, or WebP design asset.",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setToast({
        type: "error",
        message: "Design asset exceeds 10MB limit. Please upload a smaller image.",
      });
      return;
    }

    setDesignAsset(file);
    const objectUrl = URL.createObjectURL(file);
    setDesignAssetPreview(objectUrl);
    setToast({
      type: "success",
      message: "Layout design asset uploaded successfully!",
    });
  };

  const removePhoto = () => {
    if (uploadedPhotoPreview && uploadedPhotoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(uploadedPhotoPreview);
    }
    setUploadedPhoto(null);
    setUploadedPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const removeDesign = () => {
    if (designAssetPreview && designAssetPreview.startsWith("blob:")) {
      URL.revokeObjectURL(designAssetPreview);
    }
    setDesignAsset(null);
    setDesignAssetPreview(null);
    if (designInputRef.current) designInputRef.current.value = "";
  };

  const toggleViralTag = (tag: string) => {
    setActiveViralTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Main Generation Initiation
  const handleCreateVideoInvite = async (forceWithSamplePhoto = false) => {
    // 0. Mandatory Authentication Check
    if (!user) {
      pendingActionRef.current = (force?: boolean) => {
        handleCreateVideoInvite(force ?? forceWithSamplePhoto);
      };
      setIsAuthModalOpen(true);
      return;
    }

    // 1. Photo verification check
    if (!uploadedPhoto && !uploadedPhotoPreview && !forceWithSamplePhoto) {
      setShowPhotoWarningModal(true);
      return;
    }

    setShowPhotoWarningModal(false);
    setIsGenerating(true);
    setStep("generating");
    setProgressPercent(12);
    setProgressStage("Uploading media assets to cloud storage...");

    try {
      // 2. Prepare FormData payload (supports direct multipart photo & design upload)
      const formData = new FormData();
      formData.append("selectedTemplateId", selectedTemplateId);
      formData.append("userDescription", eventDescription);
      formData.append("isViral", isViral ? "true" : "false");
      formData.append("eventTitle", eventTitle);
      formData.append("eventDate", eventDate);
      formData.append("eventVenue", eventVenue);

      if (activeViralTags.length > 0 && isViral) {
        formData.append("viralModifiers", activeViralTags.join(", "));
      }

      if (uploadedPhoto) {
        formData.append("photo", uploadedPhoto);
      } else if (uploadedPhotoPreview && !uploadedPhotoPreview.startsWith("blob:")) {
        formData.append("uploadedPhotoUrl", uploadedPhotoPreview);
      } else if (forceWithSamplePhoto) {
        formData.append("allowSamplePhoto", "true");
      }

      if (designAsset) {
        formData.append("design", designAsset);
      } else if (designAssetPreview && !designAssetPreview.startsWith("blob:")) {
        formData.append("designUrl", designAssetPreview);
      }

      setProgressPercent(24);
      setProgressStage("Configuring AI Image-to-Video scene & style prompt...");

      // 3. API Call: POST /api/video-invites/create-ai-template
      const response = await API.post<CreateAiTemplateResponse>(
        "/video-invites/create-ai-template",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const data = response.data;

      if (!data || !data.success) {
        throw new Error(data?.error || "AI Video generation could not be initialized.");
      }

      // If returned directly with videoUrl (synchronous or fallback)
      if (data.videoUrl && !data.async) {
        setProgressPercent(100);
        setProgressStage("Video invitation rendered successfully!");
        setGeneratedVideoUrl(data.videoUrl);
        setActiveInviteId(data.inviteId || null);

        if (data.warning) {
          setToast({ type: "warning", message: data.warning });
        }

        setTimeout(() => {
          setIsGenerating(false);
          setStep("preview");
        }, 600);
        return;
      }

      // If async prediction returned, initiate polling
      if (data.predictionId) {
        const predictionId = data.predictionId;
        setActiveInviteId(data.inviteId || null);
        setProgressPercent(36);
        setProgressStage("Replicate AI is generating video motion frames...");

        let pollCount = 0;
        const maxPolls = 60; // Up to ~3 minutes
        const pollInterval = setInterval(async () => {
          pollCount++;
          try {
            // Update simulated progress smoothly
            setProgressPercent((prev) => {
              if (prev < 50) return prev + 4;
              if (prev < 80) return prev + 2;
              if (prev < 95) return prev + 1;
              return 95;
            });

            if (pollCount === 3) {
              setProgressStage("Generating 9:16 mobile camera motion vectors...");
            } else if (pollCount === 8) {
              setProgressStage("Applying cinematic volumetric lighting and color grade...");
            } else if (pollCount === 16) {
              setProgressStage("Interpolating high frame-rate motion sequence...");
            } else if (pollCount === 24) {
              setProgressStage("Finalizing AI motion loop & typography layer...");
            }

            const statusRes = await API.get<VideoStatusResponse>(
              `/video-invites/status/${predictionId}`
            );

            const statusData = statusRes.data;

            if (statusData && statusData.success) {
              if (statusData.status === "succeeded" && statusData.videoUrl) {
                clearInterval(pollInterval);
                setProgressPercent(100);
                setProgressStage("Video invite ready!");
                setGeneratedVideoUrl(statusData.videoUrl);
                setTimeout(() => {
                  setIsGenerating(false);
                  setStep("preview");
                }, 500);
              } else if (
                statusData.status === "failed" ||
                statusData.status === "canceled"
              ) {
                clearInterval(pollInterval);
                throw new Error(
                  statusData.error || "Video generation encountered an AI rendering timeout."
                );
              }
            }

            if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
              throw new Error("Generation timed out. Please try again or pick another style.");
            }
          } catch (pollErr: any) {
            clearInterval(pollInterval);
            console.error("[VideoInvites] Polling error:", pollErr);
            // Graceful fallback to prevent halting user flow
            const fallbackVideo =
              "/videos/golden-celebration.mp4";
            setGeneratedVideoUrl(fallbackVideo);
            setProgressPercent(100);
            setToast({
              type: "warning",
              message: pollErr.message || "Replicate queue was busy. Loaded high-quality preview.",
            });
            setTimeout(() => {
              setIsGenerating(false);
              setStep("preview");
            }, 600);
          }
        }, 2000);

        return;
      }

      throw new Error("Invalid response received from AI service.");
    } catch (err: any) {
      console.error("[VideoInvites] Generation exception:", err);
      setIsGenerating(false);
      setStep("compose");
      setToast({
        type: "error",
        message:
          err.response?.data?.error ||
          err.message ||
          "Failed to generate video invite. Please check your network and try again.",
      });
    }
  };

  // Redirect to Canvas / Studio Editor
  const handleProceedToCanvasStudio = () => {
    if (!user) {
      pendingActionRef.current = () => handleProceedToCanvasStudio();
      setIsAuthModalOpen(true);
      return;
    }

    const finalMedia = generatedVideoUrl || uploadedPhotoPreview || "";

    if (typeof window !== "undefined") {
      try {
        const guestDraft = {
          type: "video",
          isVideo: Boolean(generatedVideoUrl),
          videoUrl: generatedVideoUrl || "",
          imageUrl: uploadedPhotoPreview || "",
          uploadUrl: finalMedia,
          uploadTitle: eventTitle,
          uploadName: eventTitle,
          celebrantPhoto: uploadedPhotoPreview || "",
          templateId: selectedTemplateId || "haunting",
          templateName: selectedTemplate?.title || "Video Celebration",
          title: eventTitle,
          venue: eventVenue,
          date: eventDate,
          aspectRatio: "9/16",
        };

        sessionStorage.setItem("guestEventDraft", JSON.stringify(guestDraft));
        localStorage.setItem("guestEventDraft", JSON.stringify(guestDraft));

        sessionStorage.setItem("pending_upload_invite", finalMedia);
        sessionStorage.setItem("pending_video_url", generatedVideoUrl || "");
        sessionStorage.setItem("pending_upload_title", eventTitle);
        sessionStorage.setItem("pending_template_id", selectedTemplateId);
        sessionStorage.setItem("pending_venue", eventVenue);
        sessionStorage.setItem("pending_event_date", eventDate);
        sessionStorage.setItem("pending_is_video", generatedVideoUrl ? "true" : "false");
        sessionStorage.setItem("pending_aspect_ratio", "9/16");
        if (uploadedPhotoPreview) {
          sessionStorage.setItem("pending_celebrant_photo", uploadedPhotoPreview);
        }
        if (activeInviteId) {
          sessionStorage.setItem("pending_invite_id", activeInviteId);
        }

        localStorage.setItem("pending_upload_invite", finalMedia);
        localStorage.setItem("pending_video_url", generatedVideoUrl || "");
        localStorage.setItem("pending_upload_title", eventTitle);
        localStorage.setItem("pending_template_id", selectedTemplateId);
        localStorage.setItem("pending_venue", eventVenue);
        localStorage.setItem("pending_event_date", eventDate);
        localStorage.setItem("pending_is_video", generatedVideoUrl ? "true" : "false");
        localStorage.setItem("pending_aspect_ratio", "9/16");
        if (uploadedPhotoPreview) {
          localStorage.setItem("pending_celebrant_photo", uploadedPhotoPreview);
        }
      } catch (_) {}
    }

    if (onSuccess) {
      onSuccess({
        videoUrl: finalMedia,
        inviteId: activeInviteId || "",
        details: { title: eventTitle, date: eventDate, venue: eventVenue },
      });
    }

    if (onClose) onClose();

    const isSafeUrlParam = (val?: string | null): val is string => {
      if (!val || typeof val !== "string") return false;
      const trimmed = val.trim();
      if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return false;
      return trimmed.length < 500;
    };

    const params = new URLSearchParams();
    params.set("studio", "true");
    params.set("videoInvite", "1");
    params.set("aspectRatio", "9/16");
    if (isSafeUrlParam(generatedVideoUrl)) params.set("videoUrl", generatedVideoUrl);
    if (isSafeUrlParam(finalMedia)) params.set("uploadedImageUrl", finalMedia);
    if (selectedTemplateId) params.set("templateId", selectedTemplateId);
    if (eventTitle) params.set("title", eventTitle);
    if (eventDate) params.set("date", eventDate);
    if (eventVenue) params.set("venue", eventVenue);
    if (isSafeUrlParam(uploadedPhotoPreview)) params.set("celebrantPhoto", uploadedPhotoPreview);

    router.push(`/canvas?${params.toString()}`);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create AI Video Invitation"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300"
    >
      {/* Toast Notification Container */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "fixed top-5 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-semibold max-w-md w-full animate-in slide-in-from-top-4 duration-300",
            toast.type === "error" && "bg-red-950/90 text-red-100 border-red-700/80 backdrop-blur-lg",
            toast.type === "success" && "bg-emerald-950/90 text-emerald-100 border-emerald-700/80 backdrop-blur-lg",
            toast.type === "warning" && "bg-amber-950/90 text-amber-100 border-amber-700/80 backdrop-blur-lg"
          )}
        >
          {toast.type === "error" && <AlertCircle className="size-5 shrink-0 text-red-400" />}
          {toast.type === "success" && <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />}
          {toast.type === "warning" && <Info className="size-5 shrink-0 text-amber-400" />}
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Main Modal Window */}
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-white/15 bg-neutral-950 text-white shadow-[0_20px_80px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Subtle Decorative Golden Glow Behind Header */}
        <div className="absolute -top-24 -left-24 size-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        {/* ---------------------------------------------------- */}
        {/* STEP: GENERATING LOADER */}
        {/* ---------------------------------------------------- */}
        {step === "generating" ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center min-h-[460px]">
            <div className="relative mb-6">
              <div className="absolute -inset-4 rounded-3xl bg-amber-500/20 blur-2xl animate-pulse" />
              <div className="relative size-28 sm:size-32 rounded-3xl border-2 border-amber-400/60 overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.3)] bg-black">
                {uploadedPhotoPreview ? (
                  <img
                    src={uploadedPhotoPreview}
                    alt="Celebrant"
                    className="size-full object-cover animate-pulse"
                  />
                ) : (
                  <img
                    src={selectedTemplate.thumbnail}
                    alt={selectedTemplate.title}
                    className="size-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 grid place-items-center">
                  <span className="grid size-10 place-items-center rounded-full bg-black/75 backdrop-blur-md border border-amber-400 text-amber-400 shadow-xl">
                    <Film className="size-5 animate-spin" />
                  </span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
              <Sparkles className="size-3.5 animate-spin" />
              Replicate Image-to-Video Engine
            </span>

            <h2 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              Rendering AI Motion Invitation
            </h2>

            <p className="mt-2 text-sm text-neutral-400 max-w-md">
              Transforming your photo into a cinematic 9:16 mobile invite for{" "}
              <span className="font-semibold text-white">{selectedTemplate.title}</span>.
            </p>

            {/* Progress Bar & Stage Indicator */}
            <div className="mt-8 w-full max-w-sm space-y-3">
              <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                  <Loader2 className="size-3.5 animate-spin" />
                  {progressStage}
                </span>
                <span className="font-mono font-bold text-white">{progressPercent}%</span>
              </div>
            </div>

            <div className="mt-7 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left max-w-sm w-full text-xs text-neutral-400">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-400" /> What's happening:
              </p>
              <p className="mt-1 leading-relaxed">
                Replicate AI analyzes your photo's facial features and surroundings to create
                seamless video camera motion, aesthetic lighting, and RSVP card layout.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsGenerating(false);
                setStep("compose");
              }}
              className="mt-6 text-xs text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Cancel and edit details
            </button>
          </div>
        ) : step === "preview" ? (
          /* ---------------------------------------------------- */
          /* STEP: VIDEO PREVIEW & CANVAS REDIRECT */
          /* ---------------------------------------------------- */
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/5">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  <Film className="size-4.5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Your AI Video Invitation</h3>
                  <p className="text-xs text-neutral-400">
                    {selectedTemplate.title} • 9:16 Vertical Video Ready
                  </p>
                </div>
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="grid size-9 place-items-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>

            {/* Video Player Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col items-center">
              <div className="relative aspect-[9/16] w-full max-w-[290px] rounded-3xl border-2 border-white/20 bg-black shadow-2xl overflow-hidden group">
                {/* 1. Motion Video Player */}
                {generatedVideoUrl ? (
                  <video
                    ref={videoPlayerRef}
                    src={generatedVideoUrl}
                    poster={uploadedPhotoPreview || selectedTemplate.thumbnail}
                    autoPlay
                    loop
                    playsInline
                    muted={isMuted}
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : (
                  <img
                    src={uploadedPhotoPreview || selectedTemplate.thumbnail}
                    alt={eventTitle}
                    className="absolute inset-0 size-full object-cover"
                  />
                )}

                {/* 2. Atmospheric Dark Vignette Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

                {/* 3. Guest of Honor Avatar Ring (if photo provided) */}
                {uploadedPhotoPreview && (
                  <div className="absolute top-[15%] inset-x-0 z-10 flex flex-col items-center pointer-events-none">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 blur-sm opacity-90 animate-pulse" />
                      <div className="relative size-18 rounded-full border-2 border-amber-300 overflow-hidden shadow-2xl bg-black">
                        <img
                          src={uploadedPhotoPreview}
                          alt={eventTitle}
                          className="size-full object-cover"
                        />
                      </div>
                    </div>
                    <span className="mt-1.5 rounded-full bg-black/80 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300 border border-amber-400/30">
                      Guest of Honor
                    </span>
                  </div>
                )}

                {/* 4. Top Controls Bar */}
                <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-amber-300 border border-white/15">
                    <Sparkles className="size-2.5" />
                    AI Animated Invite
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (videoPlayerRef.current) {
                          if (isPlaying) {
                            videoPlayerRef.current.pause();
                            setIsPlaying(false);
                          } else {
                            videoPlayerRef.current.play();
                            setIsPlaying(true);
                          }
                        }
                      }}
                      className="grid size-8 place-items-center rounded-full bg-black/70 backdrop-blur-md text-white/80 hover:text-white border border-white/15 transition cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="grid size-8 place-items-center rounded-full bg-black/70 backdrop-blur-md text-white/80 hover:text-white border border-white/15 transition cursor-pointer"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 5. Bottom RSVP Invitation Card */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-3.5 text-center">
                  <div className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md p-3 shadow-xl">
                    <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-amber-400">
                      You Are Cordially Invited
                    </span>
                    <h4 className="mt-0.5 font-display text-sm font-extrabold uppercase leading-tight tracking-tight text-white line-clamp-1">
                      {eventTitle}
                    </h4>
                    <p className="mt-0.5 text-[11px] font-medium text-white/90">
                      {eventDate}
                    </p>
                    <p className="text-[10px] text-white/60 truncate">
                      {eventVenue}
                    </p>
                    <div className="mt-2.5 rounded-full bg-amber-400 py-1.5 text-[10px] font-bold text-black shadow">
                      RSVP • WILL YOU ATTEND?
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Details Quick Editor */}
              <div className="mt-5 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-4 text-xs space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-400">Event Title</label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    placeholder="Celebration title..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-neutral-400">Date & Time</label>
                    <input
                      type="text"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-neutral-400">Venue</label>
                    <input
                      type="text"
                      value={eventVenue}
                      onChange={(e) => setEventVenue(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-white/10 p-5 bg-white/5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleProceedToCanvasStudio}
                className="h-12 w-full rounded-full bg-amber-400 text-black font-bold text-sm shadow hover:bg-amber-300 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Use This Video & Setup Event</span>
                <ArrowRight className="size-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("compose");
                    setIsTemplateDrawerOpen(true);
                  }}
                  className="h-10 flex-1 rounded-full border border-white/15 bg-white/5 text-xs font-semibold hover:bg-white/10 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="size-3.5" />
                  Try Another Template
                </button>

                {generatedVideoUrl && (
                  <a
                    href={generatedVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download="invite-video.mp4"
                    className="h-10 flex-1 rounded-full border border-white/15 bg-white/5 text-xs font-semibold hover:bg-white/10 transition cursor-pointer flex items-center justify-center gap-1.5 text-white"
                  >
                    <Download className="size-3.5" />
                    Download Video
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ---------------------------------------------------- */
          /* STEP: COMPOSE / DESIGN FLOW */
          /* ---------------------------------------------------- */
          <div className="flex flex-col h-full overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                  <Sparkles className="size-3" />
                  Image-to-Video Creator
                </span>
                <h2 className="mt-1 font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Design Your Video Invite
                </h2>
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="grid size-9 place-items-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
              {/* 5 Tab Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" role="tablist">
                {[
                  { id: "video", label: "AI video template", icon: Clapperboard },
                  { id: "ai", label: "Describe it", icon: Sparkles },
                  { id: "viral", label: "Make it viral", icon: Wand2 },
                  { id: "photos", label: "Use photos", icon: ImagePlus },
                  { id: "upload", label: "Upload design", icon: Upload },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        if (tab.id === "video") {
                          setIsTemplateDrawerOpen(true);
                        } else if (tab.id === "photos") {
                          photoInputRef.current?.click();
                        } else if (tab.id === "upload") {
                          designInputRef.current?.click();
                        }
                      }}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-xs font-semibold transition cursor-pointer",
                        active
                          ? "border-amber-400 bg-amber-400/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                          : "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", active ? "text-amber-400" : "text-neutral-400")} />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ---------------------------------------------------- */}
              {/* 1. SELECTED TEMPLATE CARD */}
              {/* ---------------------------------------------------- */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Selected Template
                  </span>
                  <span className="text-[11px] text-amber-400 font-medium">
                    9:16 Vertical AI Motion
                  </span>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-950/20 via-neutral-900 to-black p-3.5 shadow-lg">
                  <div className="relative aspect-[9/16] w-14 shrink-0 overflow-hidden rounded-xl border border-amber-400/50 bg-black">
                    <img
                      src={selectedTemplate.thumbnail}
                      alt={selectedTemplate.title}
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <Film className="size-4 text-white drop-shadow" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30 uppercase">
                        {selectedTemplate.tier}
                      </span>
                      <span className="text-[11px] text-neutral-400 truncate">
                        {selectedTemplate.category}
                      </span>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-white truncate">
                      {selectedTemplate.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                      {selectedTemplate.stylePrefix}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTemplateDrawerOpen(true)}
                    className="h-10 shrink-0 rounded-full border border-white/20 bg-white/10 px-4 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="size-3 text-amber-300" />
                    Change
                  </button>
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* 2. DESCRIBE IT & EVENT DETAILS */}
              {/* ---------------------------------------------------- */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="event-description-input" className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Tell us about your event{" "}
                    <span className="text-[11px] font-normal text-neutral-500">(optional)</span>
                  </label>
                  <span className="text-[11px] text-neutral-500">
                    {eventDescription.length}/300
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    id="event-description-input"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value.slice(0, 300))}
                    rows={3}
                    placeholder="e.g. Marcus turns 50 on June 21 at Sky Lounge rooftop with golden hour cocktails and formal black tie attire..."
                    className="w-full resize-none rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none leading-relaxed transition"
                  />
                </div>

                {/* Quick Suggestion Prompts */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "Hollywood movie trailer style",
                    "Rooftop sunset champagne party",
                    "Golden jubilee celebration",
                    "Black-tie gala",
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setEventDescription((prev) =>
                          prev ? `${prev}, ${chip}` : chip
                        )
                      }
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-neutral-400 hover:text-white hover:border-white/25 transition cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* 3. MAKE IT VIRAL MODIFIER */}
              {/* ---------------------------------------------------- */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/20 via-white/5 to-black p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "grid size-8 place-items-center rounded-xl border transition",
                        isViral
                          ? "bg-purple-500/20 border-purple-400 text-purple-300"
                          : "bg-white/5 border-white/10 text-neutral-400"
                      )}
                    >
                      <Flame className="size-4.5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Make it viral</span>
                        {isViral && (
                          <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-400/40 animate-pulse">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400">
                        Adds cinematic lighting, fast-paced transitions & trending social hooks
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isViral}
                    onClick={() => setIsViral(!isViral)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      isViral ? "bg-purple-600" : "bg-white/20"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        isViral ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                {/* Sub Modifier Chips */}
                {isViral && (
                  <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1.5 animate-in fade-in duration-200">
                    {VIRAL_MODIFIER_TAGS.map((tag) => {
                      const active = activeViralTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleViralTag(tag)}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1",
                            active
                              ? "border-purple-400 bg-purple-500/20 text-purple-200"
                              : "border-white/10 bg-white/5 text-neutral-400 hover:text-white"
                          )}
                        >
                          {active && <Check className="size-3 text-purple-300" />}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ---------------------------------------------------- */}
              {/* 4. UPLOADS: USE PHOTOS & UPLOAD DESIGN */}
              {/* ---------------------------------------------------- */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Media & Design Assets
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* USE PHOTOS UPLOAD ZONE */}
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <Camera className="size-3.5 text-amber-400" />
                          Use photos (Required)
                        </span>
                        <span className="text-[10px] text-neutral-400">PNG, JPG ≤ 10MB</span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Upload personal photos of the celebrant or couple to animate into the video.
                      </p>
                    </div>

                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />

                    {uploadedPhotoPreview ? (
                      <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/15 bg-black/50 p-2.5">
                        <div className="relative size-12 shrink-0 rounded-lg overflow-hidden border border-amber-400/50 bg-black">
                          <img
                            src={uploadedPhotoPreview}
                            alt="Uploaded celebrant"
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">
                            {uploadedPhoto?.name || "Personal Photo"}
                          </p>
                          <p className="text-[10px] text-emerald-400 font-medium">Ready for animation</p>
                        </div>
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="p-1 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition cursor-pointer"
                          title="Remove photo"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-black/30 p-3.5 text-xs font-semibold text-neutral-300 hover:text-white hover:border-amber-400/60 transition cursor-pointer"
                      >
                        <ImagePlus className="size-4 text-amber-400" />
                        <span>Choose personal photo</span>
                      </button>
                    )}
                  </div>

                  {/* UPLOAD DESIGN ASSET ZONE */}
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <Upload className="size-3.5 text-purple-400" />
                          Upload design (Optional)
                        </span>
                        <span className="text-[10px] text-neutral-400">Overlay artwork</span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Add existing invitation artwork, custom borders, or event logos.
                      </p>
                    </div>

                    <input
                      ref={designInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleDesignSelect}
                      className="hidden"
                    />

                    {designAssetPreview ? (
                      <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/15 bg-black/50 p-2.5">
                        <div className="relative size-12 shrink-0 rounded-lg overflow-hidden border border-purple-400/50 bg-black">
                          <img
                            src={designAssetPreview}
                            alt="Uploaded design"
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">
                            {designAsset?.name || "Design Overlay"}
                          </p>
                          <p className="text-[10px] text-purple-300 font-medium">Design asset attached</p>
                        </div>
                        <button
                          type="button"
                          onClick={removeDesign}
                          className="p-1 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition cursor-pointer"
                          title="Remove design"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => designInputRef.current?.click()}
                        className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-black/30 p-3.5 text-xs font-semibold text-neutral-300 hover:text-white hover:border-purple-400/60 transition cursor-pointer"
                      >
                        <Upload className="size-4 text-purple-400" />
                        <span>Upload layout or logo</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* PRIMARY CTA FOOTER */}
            {/* ---------------------------------------------------- */}
            <div className="border-t border-white/10 p-5 sm:p-6 bg-white/5 flex flex-col gap-2">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => {
                  if (!user) {
                    pendingActionRef.current = () => handleCreateVideoInvite(false);
                    setIsAuthModalOpen(true);
                    return;
                  }
                  handleCreateVideoInvite(false);
                }}
                className="h-14 w-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-extrabold text-base shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2.5"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    <span>Directing Your Video Invite...</span>
                  </>
                ) : (
                  <>
                    <Clapperboard className="size-5" />
                    <span>Create my video invite</span>
                    <Sparkles className="size-4.5" />
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-neutral-400">
                Powered by Replicate AI • Image-to-Video Engine • Instant 9:16 Mobile Delivery
              </p>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TEMPLATE SELECTION DRAWER */}
        {/* ---------------------------------------------------- */}
        {isTemplateDrawerOpen && (
          <div className="absolute inset-0 z-40 bg-neutral-950 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Choose a Base Template Style
                </h3>
                <p className="text-xs text-neutral-400">
                  Select an occasion aesthetic to direct your video motion
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateDrawerOpen(false)}
                className="grid size-9 place-items-center rounded-full hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Drawer Content Grid */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {TEMPLATE_OPTIONS.map((tmpl) => {
                const isSelected = tmpl.id === selectedTemplateId;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId(tmpl.id);
                      setIsTemplateDrawerOpen(false);
                      if (!eventTitle || eventTitle.includes("Celebration")) {
                        setEventTitle(`${tmpl.title} Celebration`);
                      }
                    }}
                    className={cn(
                      "group relative flex flex-col rounded-2xl border p-2.5 text-left transition cursor-pointer",
                      isSelected
                        ? "border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25"
                    )}
                  >
                    <div className="relative aspect-[9/16] w-full rounded-xl overflow-hidden bg-black mb-2">
                      <img
                        src={tmpl.thumbnail}
                        alt={tmpl.title}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-amber-400 text-black shadow">
                          <Check className="size-3.5 stroke-[3]" />
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 rounded-full bg-black/70 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold uppercase text-amber-300">
                        {tmpl.tier}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate">{tmpl.title}</h4>
                    <p className="text-[11px] text-neutral-400 truncate">{tmpl.category}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* GRACEFUL PHOTO WARNING MODAL */}
        {/* ---------------------------------------------------- */}
        {showPhotoWarningModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="rounded-3xl border border-amber-400/40 bg-neutral-900 p-6 text-center max-w-sm w-full shadow-2xl space-y-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 mx-auto">
                <Camera className="size-6" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">Upload Your Photo First</h4>
                <p className="mt-1 text-xs text-neutral-300 leading-relaxed">
                  Image-to-Video models require a starting image of the guest of honor or couple
                  to animate into your video invitation.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPhotoWarningModal(false);
                    photoInputRef.current?.click();
                  }}
                  className="h-11 w-full rounded-full bg-amber-400 text-black font-bold text-xs shadow hover:bg-amber-300 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <ImagePlus className="size-4" />
                  <span>Upload My Photo Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      setShowPhotoWarningModal(false);
                      pendingActionRef.current = () => handleCreateVideoInvite(true);
                      setIsAuthModalOpen(true);
                      return;
                    }
                    handleCreateVideoInvite(true);
                  }}
                  className="h-10 w-full rounded-full border border-white/20 bg-white/5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  Proceed with Template Default Photo
                </button>

                <button
                  type="button"
                  onClick={() => setShowPhotoWarningModal(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-400 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mandatory Sign-in Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            pendingActionRef.current = null;
          }}
          initialMode="signin"
          onSuccess={() => {
            setIsAuthModalOpen(false);
            if (pendingActionRef.current) {
              const act = pendingActionRef.current;
              pendingActionRef.current = null;
              act();
            }
          }}
        />
      </div>
    </div>
  );
}
