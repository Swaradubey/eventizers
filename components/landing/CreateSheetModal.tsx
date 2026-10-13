"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronUp,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RefreshCw,
  Download,
  Loader2,
  Camera,
  Coins,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Share2,
  ExternalLink,
  Copy,
  CheckCheck,
  Mail,
  UserPlus,
  Search,
  Send,
  Eye,
  Type,
  Palette,
  ShieldCheck,
  Sparkle,
  Plus,
  AlertCircle,
} from "lucide-react";
import { TEMPLATES, findTemplate, IMG, type TemplateItem } from "./data";
import ExperienceVisual from "./ExperienceVisual";
import Modal from "./Modal";
import type { Mode } from "./CreateSheetContext";
import { cn } from "@/lib/utils";
import API from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import eventService from "@/services/eventService";
import { VIDEO_TEMPLATES_CATALOG, findVideoTemplate } from "@/data/videoTemplates";
import { createInvitation } from "@/services/invitationService";
import videoInviteService from "@/services/videoInviteService";

interface DraggableTextProps {
  id: string;
  text: string;
  position: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }) => void;
  style: React.CSSProperties;
}

function DraggableText({ id, text, position, onPositionChange, style }: DraggableTextProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      x: position.x,
      y: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      const cardCanvas = document.querySelector('[data-card-canvas]') as HTMLElement;
      if (!cardCanvas) return;
      const rect = cardCanvas.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100;
      const newX = Math.round(Math.max(5, Math.min(95, dragStartRef.current.x + deltaX)));
      const newY = Math.round(Math.max(5, Math.min(95, dragStartRef.current.y + deltaY)));
      onPositionChange({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        dragStartRef.current = null;
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onPositionChange]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      x: position.x,
      y: position.y,
    };
  };

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      const touch = e.touches[0];
      const cardCanvas = document.querySelector('[data-card-canvas]') as HTMLElement;
      if (!cardCanvas) return;
      const rect = cardCanvas.getBoundingClientRect();
      const deltaX = ((touch.clientX - dragStartRef.current.clientX) / rect.width) * 100;
      const deltaY = ((touch.clientY - dragStartRef.current.clientY) / rect.height) * 100;
      const newX = Math.round(Math.max(5, Math.min(95, dragStartRef.current.x + deltaX)));
      const newY = Math.round(Math.max(5, Math.min(95, dragStartRef.current.y + deltaY)));
      onPositionChange({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        dragStartRef.current = null;
      }
    };

    if (isDragging) {
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, onPositionChange]);

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: "translate(-50%, -50%)",
    pointerEvents: "auto",
    ...style,
  };

  return (
    <div
      style={containerStyle}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={isDragging ? "cursor-grabbing" : "cursor-grab hover:cursor-grab"}
      data-draggable-text={id}
    >
      <span style={{ display: "block" }}>{text}</span>
    </div>
  );
}

interface CreateSheetModalProps {
  initialMode?: Mode;
  initialPhoto?: string;
  initialTemplate?: string;
  initialAudience?: "individual" | "pro";
  initialPlan?: string;
  onClose: () => void;
}

// Curated templates matching the reference website
const MODAL_TEMPLATES = [
  { id: "party", title: "House party", tier: "Included", img: "/images/party.webp" },
  { id: "pumpkin-patch", title: "Halloween · Kids trick-or-treat", tier: "Included", img: "/images/halloween-kids.png" },
  { id: "marcus", title: "Milestone birthday", tier: "Included", img: "/images/marcus.webp" },
  { id: "baby", title: "Baby shower", tier: "Included", img: "/images/baby.webp" },
  { id: "concert", title: "Afterparty", tier: "Premium", img: "/images/concert.webp" },
  { id: "reunion", title: "Reunion", tier: "Included", img: "/images/reunion.webp" },
  { id: "haunting", title: "Halloween · Haunted house", tier: "Premium", img: "/images/halloween-house.png" },
  { id: "jessica", title: "Milestone birthday", tier: "Included", img: "/images/jessica.webp" },
  { id: "premiere", title: "Movie Premiere", tier: "Premium", img: "/images/rooftop.webp" },
  { id: "grad", title: "Graduation", tier: "Included", img: "/images/grad.webp" },
  { id: "wedding", title: "Wedding", tier: "Premium", img: "/images/couple.webp" },
  { id: "anniversary", title: "Anniversary", tier: "Premium", img: "/images/anniversary.webp" },
  { id: "vhs", title: "Retro VHS", tier: "Premium", img: "/images/party.webp" },
];

const TEMPLATE_VIDEO_MAP: Record<string, string> = {
  marcus: "/videos/golden-celebration.mp4",
  party: "/videos/celebration-motion.mp4",
  "pumpkin-patch": "/videos/golden-celebration.mp4",
  anniversary: "/videos/golden-celebration.mp4",
  baby: "/videos/golden-celebration.mp4",
  concert: "/videos/celebration-motion.mp4",
  reunion: "/videos/celebration-motion.mp4",
  haunting: "/videos/golden-celebration.mp4",
  jessica: "/videos/golden-celebration.mp4",
  premiere: "/videos/golden-celebration.mp4",
  grad: "/videos/golden-celebration.mp4",
  wedding: "/videos/golden-celebration.mp4",
  vhs: "/videos/celebration-motion.mp4",
};

interface ContactItem {
  id: string;
  name: string;
  email: string;
  category: "Family" | "Friends" | "Work" | "Neighbors";
  avatarBg: string;
}

const DEFAULT_CONTACTS: ContactItem[] = [
  { id: "c1", name: "Ava Carter", email: "ava.carter@example.com", category: "Family", avatarBg: "bg-amber-600" },
  { id: "c2", name: "Noah Rossi", email: "noah.rossi@example.com", category: "Friends", avatarBg: "bg-emerald-600" },
  { id: "c3", name: "Liam Smith", email: "liam.smith@example.com", category: "Work", avatarBg: "bg-blue-600" },
  { id: "c4", name: "Emma Davis", email: "emma.davis@example.com", category: "Friends", avatarBg: "bg-purple-600" },
  { id: "c5", name: "Marcus Johnson", email: "marcus.j@example.com", category: "Neighbors", avatarBg: "bg-rose-600" },
  { id: "c6", name: "Sophia Wilson", email: "sophia.w@example.com", category: "Family", avatarBg: "bg-indigo-600" },
];

export default function CreateSheetModal({
  initialMode = "ai",
  initialPhoto,
  initialTemplate,
  initialAudience = "individual",
  initialPlan = "pro",
  onClose,
}: CreateSheetModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // 1. Modal Stepper State: 1 | 2 | 3 | 4
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // 2. Audience & Credits State
  const [audience, setAudience] = useState<"individual" | "pro">(initialAudience);
  const [credits, setCredits] = useState(30);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [isBuyingCredits, setIsBuyingCredits] = useState(false);
  const [creditNotification, setCreditNotification] = useState<string | null>(null);
  const [selectedCreditPack, setSelectedCreditPack] = useState<number>(25);

  // Sync real-time credits from backend
  useEffect(() => {
    let mounted = true;
    videoInviteService
      .getCredits()
      .then((res) => {
        if (mounted && res?.credits !== undefined) {
          setCredits(res.credits);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch remote credits:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Clear credit notification toast after 4.5s
  useEffect(() => {
    if (creditNotification) {
      const timer = setTimeout(() => setCreditNotification(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [creditNotification]);

  // 3. Step 1: Format & Mode State
  const [inviteFormat, setInviteFormat] = useState<"image" | "video">(
    initialMode === "video" ? "video" : "image"
  );

  // If initialTemplate was passed from a carousel click, start in "template" mode with that template selected
  const [creationMode, setCreationMode] = useState<"describe" | "template" | "upload">(
    initialTemplate ? "template" : "describe"
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(initialTemplate || null);
  // Video template selection state (for when inviteFormat === "video" && creationMode === "template")
  const [selectedVideoTemplateId, setSelectedVideoTemplateId] = useState<string>("burj-khalifa");

  // isDesignReady is false initially; only becomes true after AI generates or user confirms template
  const [isDesignReady, setIsDesignReady] = useState(false);
  const [designSubTab, setDesignSubTab] = useState<"details" | "style" | "background" | "envelope">("details");

  // Step 1 Details & Options
  const [prompt, setPrompt] = useState("");
  const [isViral, setIsViral] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [videoSize, setVideoSize] = useState<"9:16" | "4:5" | "1:1" | "16:9">("9:16");
  const [videoLength, setVideoLength] = useState<"5 sec" | "10 sec" | "15 sec">("10 sec");
  const [aiModel, setAiModel] = useState<"fast" | "auto" | "quality" | "cinematic">("auto");
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");
  const [userPhoto, setUserPhoto] = useState<string | null>(initialPhoto || null);
  const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);
  const [generationStage, setGenerationStage] = useState<string>("");

  // Dynamic Credits calculation: Video invite creation costs 2 credits
  const getRequiredCredits = () => {
    if (inviteFormat === "video") return 2;
    if (creationMode === "template") return 2;
    if (aiModel === "fast") return 2;
    if (aiModel === "auto") return 3;
    if (aiModel === "quality") return 4;
    if (aiModel === "cinematic") return 6;
    return 3;
  };

  // Event Attributes
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventVenue, setEventVenue] = useState("");

  const [showTitleOnInvite, setShowTitleOnInvite] = useState(true);
  const [showDateOnInvite, setShowDateOnInvite] = useState(true);
  const [showVenueOnInvite, setShowVenueOnInvite] = useState(true);

  // Style & Envelope settings
  const [selectedFont, setSelectedFont] = useState("Playfair Display");
  const [titleAlignment, setTitleAlignment] = useState<"left" | "center" | "right">("center");
  const [titleFontSize, setTitleFontSize] = useState(42);
  const [titleColor, setTitleColor] = useState("#FFFFFF");
  const [titleLetterSpacing, setTitleLetterSpacing] = useState(2);
  const [titleLineHeight, setTitleLineHeight] = useState(1.1);
  const [titleFontWeight, setTitleFontWeight] = useState<"400" | "500" | "600" | "700" | "800" | "900">("800");
  const [titleTextShadow, setTitleTextShadow] = useState(false);
  const [datetimeFontSize, setDatetimeFontSize] = useState(15);
  const [datetimeColor, setDatetimeColor] = useState("#FFFFFF");
  const [venueFontSize, setVenueFontSize] = useState(14);
  const [venueColor, setVenueColor] = useState("rgba(255, 255, 255, 0.85)");
  const [textPositions, setTextPositions] = useState<Record<string, { x: number; y: number }>>({
    title: { x: 50, y: 32 },
    datetime: { x: 50, y: 50 },
    venue: { x: 50, y: 60 },
  });
  const [envelopeReveal, setEnvelopeReveal] = useState(true);
  const [envelopeColor, setEnvelopeColor] = useState("#6B1D2F");
  const [envelopeSeal, setEnvelopeSeal] = useState("Gold Wax Seal");

  // Step 2: Event Setup State
  const [quickSetup, setQuickSetup] = useState<"open" | "private" | "ticketed" | "host-copay">("private");
  const [openAccordion, setOpenAccordion] = useState<string | null>("privacy");
  const [privacyMode, setPrivacyMode] = useState<"public" | "private">("private");
  const [hideAddressUntilApproved, setHideAddressUntilApproved] = useState(true);
  const [rsvpSpots, setRsvpSpots] = useState(40);
  const [allowPlusOnes, setAllowPlusOnes] = useState(true);
  const [isPaidEvent, setIsPaidEvent] = useState(false);
  const [ticketPrice, setTicketPrice] = useState("25");
  const [sendReminders, setSendReminders] = useState(true);
  const [qrCheckInEnabled, setQrCheckInEnabled] = useState(true);

  // Step 3: Guests State
  const [contacts, setContacts] = useState<ContactItem[]>(DEFAULT_CONTACTS);
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [guestCategoryFilter, setGuestCategoryFilter] = useState<string>("All");
  const [guestSearchQuery, setGuestSearchQuery] = useState("");
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newGuestCategory, setNewGuestCategory] = useState<"Family" | "Friends" | "Work" | "Neighbors">("Friends");

  // Step 4: Publish & AI Generation Output State
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string>("");
  const [isPublished, setIsPublished] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Video Player Controls
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardCanvasRef = useRef<HTMLDivElement>(null);

  // Current templates list matching reference website (22 for video, 11 for image)
  const currentTemplates =
    inviteFormat === "video" ? TEMPLATES : TEMPLATES.filter((t) => "img" in t.preview);

  // Find selected template item
  const selectedTemplate = selectedTemplateId
    ? findTemplate(selectedTemplateId) || TEMPLATES.find((t) => t.id === selectedTemplateId) || null
    : null;

  // Active video source when inviteFormat === "video"
  const activeVideoSrc =
    generatedVideoUrl ||
    (inviteFormat === "video"
      ? creationMode === "template"
        ? findVideoTemplate(selectedVideoTemplateId).videoUrl
        : (selectedTemplateId && TEMPLATE_VIDEO_MAP[selectedTemplateId]) || "/videos/golden-celebration.mp4"
      : null);

  // Active display photo for preview
  // When in video+template mode, use the selected video template's thumbnail so preview matches the card
  const activeVideoTemplate = (inviteFormat === "video" && creationMode === "template")
    ? findVideoTemplate(selectedVideoTemplateId)
    : null;

  const activeDisplayPhoto =
    userPhoto ||
    generatedImageUrl ||
    (activeVideoTemplate ? activeVideoTemplate.thumbnail : null) ||
    (selectedTemplate && "img" in selectedTemplate.preview ? selectedTemplate.preview.img : "/images/marcus.webp");

  // Dynamic slug calculation
  const cleanSlug =
    publishedSlug ||
    (eventTitle
      ? eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : "celebration");

  // Handle Photo Upload (image or video)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserPhotoFile(file);
      if (file.type.startsWith("video/")) {
        const vUrl = URL.createObjectURL(file);
        setGeneratedVideoUrl(vUrl);
        setInviteFormat("video");
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const res = event.target?.result as string;
          if (res) {
            setUserPhoto(res);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Buy Credits Handler
  const handleBuyCredits = async (amount: number) => {
    setIsBuyingCredits(true);
    try {
      const res = await videoInviteService.buyCredits(amount);
      if (res.success) {
        setCredits(res.credits);
        setCreditNotification(`Successfully purchased ${amount} credits! New balance: ${res.credits} credits`);
        setIsBuyCreditsOpen(false);
      }
    } catch (err) {
      console.error("Failed to buy credits:", err);
      setCreditNotification("Failed to purchase credits. Please try again.");
    } finally {
      setIsBuyingCredits(false);
    }
  };

  // Main Generation Handler for Step 1
  const handleGenerateInvite = async () => {
    const requiredCredits = getRequiredCredits();

    // Check balance
    if (credits < requiredCredits) {
      setCreditNotification(`Insufficient credits (${requiredCredits} credits required). Please buy credits.`);
      setIsBuyCreditsOpen(true);
      return;
    }

    // Mode-specific validation for video invites
    if (inviteFormat === "video" && creationMode === "template" && !userPhoto) {
      setCreditNotification("Please add your photo! A photo is required for the video template.");
      fileInputRef.current?.click();
      return;
    }

    setIsGenerating(true);

    try {
      if (inviteFormat === "image") {
        if (creationMode === "template") {
          if (userPhoto) {
            // User selected template AND uploaded photo -> Generate AI artwork via Node.js Backend & Replicate!
            setGenerationStage("Replicate AI transforming photo into template artwork...");
            try {
              const res = await API.post("/ai/generate-event-template", {
                templateId: selectedTemplateId || "marcus",
                userPhoto: userPhoto,
                title: eventTitle,
                eventType: "Celebration",
                prompt: prompt || (selectedTemplate?.title ? `${selectedTemplate.title} celebration` : undefined),
              });
              if (res.data?.imageUrl) {
                setGeneratedImageUrl(res.data.imageUrl);
              } else {
                setGeneratedImageUrl(userPhoto || (selectedTemplate && "img" in selectedTemplate.preview ? selectedTemplate.preview.img : "/images/marcus.webp"));
              }
            } catch (err) {
              console.warn("Backend AI template generation error, fallback to Next.js route:", err);
              try {
                const fallbackRes = await fetch("/api/generate-image", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    templateId: selectedTemplateId || "marcus",
                    userPhoto,
                    title: eventTitle,
                    eventType: "Celebration",
                    prompt: prompt || selectedTemplate?.title,
                  }),
                });
                const fbData = await fallbackRes.json();
                setGeneratedImageUrl(fbData.imageUrl || userPhoto);
              } catch (_) {
                setGeneratedImageUrl(userPhoto || (selectedTemplate && "img" in selectedTemplate.preview ? selectedTemplate.preview.img : "/images/marcus.webp"));
              }
            }
          } else {
            // No custom photo uploaded: use the polished template directly
            const chosenImage =
              (selectedTemplate && "img" in selectedTemplate.preview
                ? selectedTemplate.preview.img
                : "/images/marcus.webp");
            setGeneratedImageUrl(chosenImage);
          }
          setCredits((prev) => Math.max(0, prev - requiredCredits));
          setIsGenerating(false);
          setIsDesignReady(true);
          return;
        }

        if (creationMode === "upload") {
          // 2. User uploaded their photo/flyer directly
          const chosenImage = userPhoto || "/images/marcus.webp";
          setGeneratedImageUrl(chosenImage);
          setCredits((prev) => Math.max(0, prev - requiredCredits));
          setIsGenerating(false);
          setIsDesignReady(true);
          return;
        }

        // 3. User gave a prompt ("Describe it"): Generate via Node.js Backend & Replicate FLUX
        setGenerationStage("Replicate FLUX generating mobile invitation artwork...");
        try {
          const res = await API.post("/ai/generate-event-template", {
            prompt: prompt || (selectedTemplate?.title ? `${selectedTemplate.title} celebration` : "Luxury party celebration"),
            eventType: "Celebration",
            title: eventTitle,
            templateId: selectedTemplateId || "marcus",
            userPhoto: userPhoto || undefined,
          });
          if (res.data?.imageUrl) {
            setGeneratedImageUrl(res.data.imageUrl);
          } else {
            setGeneratedImageUrl(
              (selectedTemplate && "img" in selectedTemplate.preview ? selectedTemplate.preview.img : null) ||
                "/images/marcus.webp"
            );
          }
        } catch (_) {
          // Next.js fallback
          try {
            const fbRes = await fetch("/api/generate-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: prompt || (selectedTemplate?.title ? `${selectedTemplate.title} celebration` : "Luxury party celebration"),
                eventType: "Celebration",
                title: eventTitle,
                templateId: selectedTemplateId || "marcus",
                userPhoto: userPhoto || undefined,
              }),
            });
            const fbData = await fbRes.json();
            setGeneratedImageUrl(fbData?.imageUrl || "/images/marcus.webp");
          } catch {
            setGeneratedImageUrl(
              (selectedTemplate && "img" in selectedTemplate.preview ? selectedTemplate.preview.img : null) ||
                "/images/marcus.webp"
            );
          }
        }

        setCredits((prev) => Math.max(0, prev - requiredCredits));
        setIsGenerating(false);
        setIsDesignReady(true);
      } else {
        // Video Generation: Replicate AI ByteDance Seedance Video Model
        const chosenVideoFallback =
          (selectedTemplateId && TEMPLATE_VIDEO_MAP[selectedTemplateId]) ||
          "/videos/golden-celebration.mp4";
        let finalVideoUrl = chosenVideoFallback;

        setGenerationStage("Connecting to ByteDance Seedance AI...");
        setCreditNotification("2 credits deducted for AI Video generation");

        try {
          const res = await videoInviteService.generateVideo({
            creationMode: creationMode === "describe" ? "describe" : "template",
            templateId: selectedTemplateId || selectedVideoTemplateId || "premiere",
            prompt: prompt,
            userDescription: prompt,
            uploadedPhotoUrl: userPhoto || undefined,
            photo: userPhotoFile || undefined,
            eventTitle: eventTitle || "Special Celebration",
            eventDate: eventDate ? `${eventDate} • ${eventTime}` : undefined,
            eventVenue: eventVenue || undefined,
            aspectRatio: "9:16",
            isViral: isViral,
            waitForCompletion: false,
          });

          if (res?.remainingCredits !== undefined) {
            setCredits(res.remainingCredits);
          } else {
            setCredits((prev) => Math.max(0, prev - 2));
          }

          if (res?.async && res?.predictionId) {
            setGenerationStage("ByteDance Seedance animating photo into 24fps video...");
            const predictionId = res.predictionId;
            let attempts = 0;
            const maxAttempts = 35; // 35 * 2.5s = ~88s
            while (attempts < maxAttempts) {
              await new Promise((r) => setTimeout(r, 2500));
              attempts++;
              try {
                const statusRes = await videoInviteService.checkStatus(predictionId);
                if (statusRes?.status === "succeeded" && statusRes?.videoUrl) {
                  finalVideoUrl = statusRes.videoUrl;
                  setCreditNotification("AI Video generated successfully!");
                  break;
                } else if (statusRes?.status === "failed" || statusRes?.status === "canceled") {
                  if (statusRes.refunded) {
                    if (statusRes.remainingCredits !== undefined) {
                      setCredits(statusRes.remainingCredits);
                    } else {
                      setCredits((prev) => prev + 2);
                    }
                    setCreditNotification("Generation failed. 2 credits refunded to your balance.");
                  }
                  console.warn("Replicate Seedance prediction failed, using template fallback");
                  break;
                } else {
                  setGenerationStage(
                    `Seedance AI rendering 9:16 mobile motion... (${Math.min(95, 20 + attempts * 2.5).toFixed(0)}%)`
                  );
                }
              } catch (_) {}
            }
          } else if (res?.videoUrl) {
            finalVideoUrl = res.videoUrl;
            setCreditNotification("AI Video generated successfully!");
          }
        } catch (err: any) {
          console.warn("Video generation error, using fallback video:", err);
          if (err?.response?.data?.refunded) {
            if (err.response.data.remainingCredits !== undefined) {
              setCredits(err.response.data.remainingCredits);
            } else {
              setCredits((prev) => prev + 2);
            }
            setCreditNotification("Generation failed. 2 credits refunded.");
          } else if (err?.response?.status === 402) {
            setCreditNotification("Insufficient credits. Please purchase credits to continue.");
            setIsBuyCreditsOpen(true);
            setIsGenerating(false);
            return;
          }
        }

        setGeneratedVideoUrl(finalVideoUrl);
        setIsPlayingVideo(true);
        setIsGenerating(false);
        setIsDesignReady(true);
      }
    } catch (err) {
      console.error("Generation error:", err);
      setIsGenerating(false);
      setIsDesignReady(true);
    }
  };

  // Step 4: Publish Event to Database
  const handlePublishEvent = async () => {
    setIsPublishing(true);

    try {
      const cover = generatedVideoUrl || generatedImageUrl || activeDisplayPhoto || "/images/party.webp";
      const createdSlug = cleanSlug + "-" + Math.random().toString(36).substring(2, 6);

      // 1. Create Event via eventService (connected to Neon PostgreSQL)
      let eventId: string | undefined;
      try {
        const newEvtRes = await eventService.createEvent({
          title: eventTitle,
          venue: eventVenue,
          eventDate: new Date(eventDate).toISOString(),
          eventTime: eventTime + ":00",
          coverImage: cover,
          videoUrl: generatedVideoUrl || undefined,
          isVideo: Boolean(generatedVideoUrl),
          selectedTemplateId: selectedTemplateId || undefined,
          status: "published",
        });
        if (newEvtRes?.event?.id) {
          eventId = newEvtRes.event.id;
        }
      } catch (err) {
        console.warn("Event creation in DB notice:", err);
      }

      // 2. Create Base Invitation
      if (eventId) {
        try {
          await createInvitation({
            eventId,
            title: eventTitle,
            subtitle: eventVenue,
            mainText: `You are cordially invited to celebrate with us.`,
            imageUrl: cover,
            accentColor: envelopeColor,
            fontFamily: selectedFont,
            buttonText: "RSVP Now",
          });
        } catch (_) {}
      }

      setPublishedSlug(createdSlug);
      setIsPublishing(false);
      setIsPublished(true);
    } catch (publishErr) {
      console.error("Publishing error:", publishErr);
      setIsPublishing(false);
      setIsPublished(true);
    }
  };

  const copyEventLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/e/${cleanSlug}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const matchCategory = guestCategoryFilter === "All" || c.category === guestCategoryFilter;
    const matchSearch =
      !guestSearchQuery ||
      c.name.toLowerCase().includes(guestSearchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(guestSearchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <Modal open={true} onClose={onClose} label="Create an event" variant="wide">
      <div className="relative flex h-full max-h-[96svh] sm:max-h-[88vh] w-full flex-col overflow-hidden bg-[#0c1015] text-white">
        {/* ========================================================= */}
        {/* TOP HEADER STEPPER (1. Create -> 2. Event setup -> 3. Guests -> 4. Publish) */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3 shrink-0 bg-[#0c1015] z-20">
          <div className="flex flex-1 items-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar py-0.5">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="flex items-center gap-2.5 text-left transition cursor-pointer shrink-0"
            >
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full text-xs font-bold transition",
                  activeStep === 1
                    ? "border-2 border-amber-400 bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                    : activeStep > 1
                    ? "bg-amber-400 text-black"
                    : "border border-white/30 text-white/60"
                )}
              >
                {activeStep > 1 ? <Check className="size-4 stroke-[3]" /> : "1"}
              </span>
              <div>
                <span className={cn("block text-xs sm:text-sm font-bold leading-none", activeStep === 1 ? "text-white" : "text-white/80")}>
                  Create
                </span>
                <span className="hidden sm:block text-[11px] text-white/50 leading-tight mt-0.5">
                  Design and details
                </span>
              </div>
            </button>

            <div className={cn("h-0.5 w-6 sm:w-10 rounded transition shrink-0", activeStep > 1 ? "bg-amber-400" : "bg-white/15")} />

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="flex items-center gap-2.5 text-left transition cursor-pointer shrink-0"
            >
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full text-xs font-bold transition",
                  activeStep === 2
                    ? "border-2 border-amber-400 bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                    : activeStep > 2
                    ? "bg-amber-400 text-black"
                    : "border border-white/30 text-white/60"
                )}
              >
                {activeStep > 2 ? <Check className="size-4 stroke-[3]" /> : "2"}
              </span>
              <div>
                <span className={cn("block text-xs sm:text-sm font-bold leading-none", activeStep === 2 ? "text-white" : "text-white/80")}>
                  Event setup
                </span>
                <span className="hidden sm:block text-[11px] text-white/50 leading-tight mt-0.5">
                  Privacy and RSVP
                </span>
              </div>
            </button>

            <div className={cn("h-0.5 w-6 sm:w-10 rounded transition shrink-0", activeStep > 2 ? "bg-amber-400" : "bg-white/15")} />

            {/* Step 3 */}
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="flex items-center gap-2.5 text-left transition cursor-pointer shrink-0"
            >
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full text-xs font-bold transition",
                  activeStep === 3
                    ? "border-2 border-amber-400 bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                    : activeStep > 3
                    ? "bg-amber-400 text-black"
                    : "border border-white/30 text-white/60"
                )}
              >
                {activeStep > 3 ? <Check className="size-4 stroke-[3]" /> : "3"}
              </span>
              <div>
                <span className={cn("block text-xs sm:text-sm font-bold leading-none", activeStep === 3 ? "text-white" : "text-white/80")}>
                  Guests
                </span>
                <span className="hidden sm:block text-[11px] text-white/50 leading-tight mt-0.5">
                  Who and how
                </span>
              </div>
            </button>

            <div className={cn("h-0.5 w-6 sm:w-10 rounded transition shrink-0", activeStep > 3 ? "bg-amber-400" : "bg-white/15")} />

            {/* Step 4 */}
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="flex items-center gap-2.5 text-left transition cursor-pointer shrink-0"
            >
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full text-xs font-bold transition",
                  activeStep === 4
                    ? "border-2 border-amber-400 bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                    : "border border-white/30 text-white/60"
                )}
              >
                4
              </span>
              <div>
                <span className={cn("block text-xs sm:text-sm font-bold leading-none", activeStep === 4 ? "text-white" : "text-white/80")}>
                  Publish
                </span>
                <span className="hidden sm:block text-[11px] text-white/50 leading-tight mt-0.5">
                  Link and RSVPs
                </span>
              </div>
            </button>
          </div>

          {/* Close X Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="grid size-8 sm:size-9 place-items-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer ml-2 sm:ml-3 shrink-0"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Mobile View Switcher (< lg screens) */}
        <div className="flex lg:hidden items-center justify-center p-2 bg-black/40 border-b border-white/10 shrink-0 z-10">
          <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMobileTab("form")}
              className={cn(
                "rounded-full px-4 py-1.5 transition cursor-pointer",
                mobileTab === "form" ? "bg-amber-400 text-black shadow" : "text-white/70 hover:text-white"
              )}
            >
              Edit Details
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className={cn(
                "rounded-full px-4 py-1.5 transition flex items-center gap-1.5 cursor-pointer",
                mobileTab === "preview" ? "bg-amber-400 text-black shadow" : "text-white/70 hover:text-white"
              )}
            >
              <Eye className="size-3.5" />
              Preview Invite
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TWO-COLUMN BODY (Left: Form Content, Right: Live Preview) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-0 flex-1 overflow-hidden">
          {/* --------------------------------------------------------- */}
          {/* LEFT COLUMN (~60%): STEP CONTENT */}
          {/* --------------------------------------------------------- */}
          <div
            className={cn(
              "lg:col-span-7 flex flex-col min-h-0 h-full border-r border-white/10 overflow-hidden",
              mobileTab === "preview" ? "hidden lg:flex" : "flex"
            )}
          >
            {/* Scrollable Form Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-6">
            {/* ================= STEP 1: CREATE ================= */}
            {activeStep === 1 && (
              <>
                {/* Audience Toggle (Individual vs Pros) */}
                <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 p-1 w-full max-w-sm">
                  <button
                    type="button"
                    onClick={() => setAudience("individual")}
                    className={cn(
                      "flex h-9 flex-1 items-center justify-center gap-2 rounded-full text-xs font-bold transition cursor-pointer",
                      audience === "individual"
                        ? "bg-amber-400 text-black shadow"
                        : "text-white/70 hover:text-white"
                    )}
                  >
                    <User className="size-3.5" />
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudience("pro")}
                    className={cn(
                      "flex h-9 flex-1 items-center justify-center gap-2 rounded-full text-xs font-bold transition cursor-pointer",
                      audience === "pro"
                        ? "bg-amber-400 text-black shadow"
                        : "text-white/70 hover:text-white"
                    )}
                  >
                    <Briefcase className="size-3.5" />
                    Pros
                  </button>
                </div>

                {!isDesignReady ? (
                  /* SUB-VIEW A: CHOOSE FORMAT & CREATION MODE */
                  <div className="space-y-5">
                    {/* Header + Credits */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                        Create your invite
                      </h2>
                      <button
                        type="button"
                        onClick={() => setIsBuyCreditsOpen(true)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition cursor-pointer group shadow-sm",
                          inviteFormat === "video" && credits < 2
                            ? "border-red-500/50 bg-red-500/15 text-red-300 hover:bg-red-500/25"
                            : "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
                        )}
                        title="Click to buy more credits"
                      >
                        <Coins className={cn("size-3.5", inviteFormat === "video" && credits < 2 ? "text-red-400" : "text-amber-400")} />
                        <span>{credits} credits</span>
                        <span className="rounded bg-amber-400/25 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-amber-300 group-hover:bg-amber-400 group-hover:text-black transition">
                          + Buy
                        </span>
                      </button>
                    </div>

                    {/* Insufficient Credits Banner for Video Invite */}
                    {inviteFormat === "video" && credits < 2 && (
                      <div className="flex items-center justify-between rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="size-4 text-red-400 shrink-0" />
                          <span>
                            <strong>Low balance:</strong> 2 credits required to generate a video invite.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsBuyCreditsOpen(true)}
                          className="inline-flex items-center gap-1 font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer shrink-0 ml-2"
                        >
                          <Coins className="size-3 text-amber-400" />
                          Buy Credits
                        </button>
                      </div>
                    )}

                    {/* Format Radios (Image Invite vs Video Invite) */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setInviteFormat("image")}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border p-3.5 text-left transition cursor-pointer",
                          inviteFormat === "image"
                            ? "border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        )}
                      >
                        <span className={cn("grid size-10 place-items-center rounded-xl", inviteFormat === "image" ? "bg-amber-400/20 text-amber-300" : "bg-white/10 text-white/70")}>
                          <ImagePlus className="size-5" />
                        </span>
                        <div>
                          <span className="block text-sm font-bold leading-tight">Image invite</span>
                          <span className="block text-[11px] text-white/60 leading-tight mt-0.5">A designed picture</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInviteFormat("video")}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border p-3.5 text-left transition cursor-pointer",
                          inviteFormat === "video"
                            ? "border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        )}
                      >
                        <span className={cn("grid size-10 place-items-center rounded-xl", inviteFormat === "video" ? "bg-amber-400/20 text-amber-300" : "bg-white/10 text-white/70")}>
                          <Clapperboard className="size-5" />
                        </span>
                        <div>
                          <span className="block text-sm font-bold leading-tight">Video invite</span>
                          <span className="block text-[11px] text-white/60 leading-tight mt-0.5">Animated and shareable</span>
                        </div>
                      </button>
                    </div>

                    {/* Mode Tabs (Describe it, Pick a template, Upload yours) */}
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 p-1.5">
                      <button
                        type="button"
                        onClick={() => setCreationMode("describe")}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer",
                          creationMode === "describe"
                            ? "border border-amber-400 bg-amber-400/15 text-amber-300"
                            : "text-white/70 hover:text-white"
                        )}
                      >
                        <Sparkles className="size-3.5" />
                        Describe it
                      </button>

                      <button
                        type="button"
                        onClick={() => setCreationMode("template")}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer",
                          creationMode === "template"
                            ? "border border-amber-400 bg-amber-400/15 text-amber-300"
                            : "text-white/70 hover:text-white"
                        )}
                      >
                        <SlidersHorizontal className="size-3.5" />
                        Pick a template
                      </button>

                      <button
                        type="button"
                        onClick={() => setCreationMode("upload")}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer",
                          creationMode === "upload"
                            ? "border border-amber-400 bg-amber-400/15 text-amber-300"
                            : "text-white/70 hover:text-white"
                        )}
                      >
                        <Upload className="size-3.5" />
                        Upload yours
                      </button>
                    </div>

                    {/* MODE 1: DESCRIBE IT */}
                    {creationMode === "describe" && (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="describe-event-prompt" className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
                            Tell us about your event
                          </label>
                          <textarea
                            id="describe-event-prompt"
                            rows={3}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="An elegant rooftop 40th birthday in NYC..."
                            className="w-full rounded-2xl border border-white/15 bg-white/5 p-4 text-sm leading-relaxed placeholder:text-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                          />
                        </div>

                        {/* Make it viral checkbox */}
                        <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isViral}
                            onChange={(e) => setIsViral(e.target.checked)}
                            className="size-4 rounded border-white/20 bg-white/10 text-amber-400 focus:ring-0 cursor-pointer"
                          />
                          <Wand2 className="size-3.5 text-amber-400" />
                          <span>Make it viral</span>
                          <span className="text-white/50 font-normal">Something nobody has seen</span>
                        </label>

                        {/* Add photos optional */}
                        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
                          <div className="flex items-center gap-3">
                            <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-white/80">
                              <Camera className="size-4" />
                            </span>
                            <div>
                              <span className="block text-xs font-bold">Add photos (optional)</span>
                              <span className="block text-[11px] text-white/50">Personalize your invitation artwork</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold hover:bg-white/15 transition cursor-pointer"
                          >
                            {userPhoto ? "Change photo" : "Upload photo"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* MODE 2: PICK A TEMPLATE */}
                    {creationMode === "template" && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-bold text-white">Choose a template</span>
                            <span className="text-xs text-white/50">
                              {selectedTemplate ? selectedTemplate.title : `${currentTemplates.length} styles`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition cursor-pointer shadow",
                              inviteFormat === "video"
                                ? "bg-amber-400 text-black hover:bg-amber-300"
                                : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                            )}
                          >
                            <Camera className="size-3.5" />
                            {userPhoto ? (
                              <>
                                <span>Photo added</span>
                                <span className="text-[10px] opacity-70 font-semibold">Change</span>
                              </>
                            ) : (
                              <>
                                <span>{inviteFormat === "video" ? "Add your photo" : "Add photos"}</span>
                                <span className={cn("text-[10px]", inviteFormat === "video" ? "opacity-75 font-semibold" : "text-white/50")}>
                                  {inviteFormat === "video" ? "Required" : "Optional"}
                                </span>
                              </>
                            )}
                          </button>
                        </div>

                        <ul
                          role="listbox"
                          aria-label="Invitation templates"
                          className="mt-2 grid grid-cols-3 gap-x-2.5 gap-y-3 sm:grid-cols-5 max-h-[350px] overflow-y-auto pr-1"
                        >
                          {currentTemplates.map((tpl) => {
                            const isSelected = selectedTemplateId === tpl.id;
                            return (
                              <li key={tpl.id}>
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={isSelected}
                                  onClick={() => {
                                    setSelectedTemplateId(tpl.id);
                                  }}
                                  className="block w-full text-left cursor-pointer group"
                                >
                                  <span
                                    className={cn(
                                      "relative block aspect-[4/5] w-full overflow-hidden rounded-xl border-2 transition bg-black",
                                      isSelected
                                        ? "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                                        : "border-transparent hover:border-white/25"
                                    )}
                                  >
                                    {"kind" in tpl.preview ? (
                                      <ExperienceVisual
                                        kind={tpl.preview.kind}
                                        playing={true}
                                        className="absolute inset-0 pointer-events-none"
                                      />
                                    ) : (
                                      <img
                                        src={tpl.preview.img}
                                        alt={tpl.title}
                                        className="size-full object-cover transition duration-300 group-hover:scale-105"
                                      />
                                    )}
                                    {isSelected && (
                                      <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-amber-400 text-black shadow">
                                        <Check className="size-4 stroke-[3]" />
                                      </span>
                                    )}
                                  </span>
                                  <span className="mt-1.5 block truncate text-xs font-semibold leading-tight text-white">
                                    {tpl.title}
                                  </span>
                                  <span className="block text-[11px] leading-tight text-white/50 mt-0.5">
                                    {tpl.tier}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* MODE 3: UPLOAD YOURS */}
                    {creationMode === "upload" && (
                      <div className="space-y-4">
                        {userPhoto ? (
                          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="relative size-16 rounded-xl overflow-hidden border border-amber-400/40 bg-black shrink-0">
                                <img src={userPhoto} alt="Uploaded preview" className="size-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                                  <Check className="size-3.5 stroke-[3]" />
                                  <span>Photo uploaded successfully</span>
                                </div>
                                <p className="text-[11px] text-white/60 truncate mt-0.5">
                                  Formatted into 9:16 mobile invitation card
                                </p>
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="text-[11px] font-semibold text-amber-400 hover:underline mt-1 cursor-pointer"
                                >
                                  Upload a different photo
                                </button>
                              </div>
                            </div>

                            {/* Animate with Replicate AI prompt banner */}
                            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <Sparkles className="size-4 text-amber-400 shrink-0" />
                                <div>
                                  <span className="block text-xs font-bold text-white">Animate with Replicate AI</span>
                                  <span className="block text-[10px] text-white/60">Turn this photo into an animated 24fps video invite</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setInviteFormat("video");
                                }}
                                className={cn(
                                  "rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer shrink-0",
                                  inviteFormat === "video"
                                    ? "bg-amber-400 text-black shadow"
                                    : "border border-amber-400/40 bg-white/5 text-amber-300 hover:bg-amber-400/20"
                                )}
                              >
                                {inviteFormat === "video" ? "Video active" : "Enable video"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-6 text-center cursor-pointer hover:border-amber-400/70 hover:bg-white/10 transition"
                          >
                            <div className="grid size-12 place-items-center rounded-full bg-amber-400/10 text-amber-400 mb-2">
                              <Upload className="size-6" />
                            </div>
                            <span className="text-sm font-bold text-white">Upload your design or flyer</span>
                            <span className="text-xs text-white/50 mt-1 max-w-xs">
                              PNG, JPG, WebP or MP4 up to 15MB. We'll optimize it into a 9:16 interactive mobile invite.
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hidden Photo Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/mp4"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />

                    {/* Expandable "More options" Panel matching user screenshot */}
                    {showMoreOptions && (
                      <div className="rounded-2xl border border-white/15 bg-[#0f141c] p-4 sm:p-5 space-y-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-1">
                          <h3 className="text-sm sm:text-base font-bold text-white">More options</h3>
                          <button
                            type="button"
                            onClick={() => setShowMoreOptions(false)}
                            aria-label="Close more options"
                            className="grid size-7 place-items-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
                          >
                            <X className="size-4" />
                          </button>
                        </div>

                        {/* Video size / Image size */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">
                              {inviteFormat === "video" ? "Video size" : "Image size"}
                            </span>
                            <span className="text-white/50 text-[11px]">Reels, TikTok and Stories</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { id: "9:16", label: "Story", iconH: "h-5 w-3.5" },
                              { id: "4:5", label: "Portrait", iconH: "h-4.5 w-3.5" },
                              { id: "1:1", label: "Square", iconH: "size-4" },
                              { id: "16:9", label: "Wide", iconH: "h-3.5 w-5" },
                            ].map((size) => {
                              const isSelected = videoSize === size.id;
                              return (
                                <button
                                  key={size.id}
                                  type="button"
                                  onClick={() => setVideoSize(size.id as any)}
                                  className={cn(
                                    "flex flex-col items-center justify-center rounded-2xl border p-2.5 sm:p-3 text-center transition cursor-pointer",
                                    isSelected
                                      ? "border-amber-400 bg-amber-400/10 shadow-[0_0_12px_rgba(251,191,36,0.25)] text-white"
                                      : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
                                  )}
                                >
                                  <div className={cn("rounded-[3px] border-2 border-current mx-auto mb-1.5 flex items-center justify-center", size.iconH)} />
                                  <span className="block text-xs font-bold leading-tight">{size.id}</span>
                                  <span className="block text-[10px] text-white/50 leading-tight mt-0.5">{size.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Length (only when inviteFormat === 'video') */}
                        {inviteFormat === "video" && (
                          <div className="space-y-2">
                            <span className="block text-xs font-bold text-white">Length</span>
                            <div className="grid grid-cols-3 gap-2">
                              {["5 sec", "10 sec", "15 sec"].map((len) => {
                                const isSelected = videoLength === len;
                                return (
                                  <button
                                    key={len}
                                    type="button"
                                    onClick={() => setVideoLength(len as any)}
                                    className={cn(
                                      "rounded-xl sm:rounded-2xl border py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-center transition cursor-pointer",
                                      isSelected
                                        ? "border-amber-400 bg-amber-400/10 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.2)]"
                                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
                                    )}
                                  >
                                    {len}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* AI model */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">AI model</span>
                            <span className="text-white/50 text-[11px]">Higher quality uses more credits</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              {
                                id: "fast",
                                name: "Fast",
                                desc: "Quick drafts",
                                credits: inviteFormat === "video" ? "6 credits" : "2 credits",
                              },
                              {
                                id: "auto",
                                name: "Auto",
                                desc: "Best fit, recommended",
                                credits: inviteFormat === "video" ? "12 credits" : "3 credits",
                              },
                              {
                                id: "quality",
                                name: "Quality",
                                desc: "Richer detail",
                                credits: inviteFormat === "video" ? "18 credits" : "4 credits",
                              },
                              {
                                id: "cinematic",
                                name: "Cinematic",
                                desc: "Best motion and polish",
                                credits: inviteFormat === "video" ? "24 credits" : "6 credits",
                              },
                            ].map((model) => {
                              const isSelected = aiModel === model.id;
                              return (
                                <button
                                  key={model.id}
                                  type="button"
                                  onClick={() => setAiModel(model.id as any)}
                                  className={cn(
                                    "relative flex flex-col justify-between rounded-2xl border p-2.5 sm:p-3 text-left transition cursor-pointer min-h-[78px]",
                                    isSelected
                                      ? "border-amber-400 bg-amber-400/10 shadow-[0_0_12px_rgba(251,191,36,0.2)]"
                                      : "border-white/10 bg-white/5 hover:border-white/20"
                                  )}
                                >
                                  {isSelected && (
                                    <span className="absolute top-2 right-2 text-amber-400">
                                      <Check className="size-3.5 stroke-[3]" />
                                    </span>
                                  )}
                                  <div>
                                    <span className="block text-xs font-bold text-white leading-tight">{model.name}</span>
                                    <span className="block text-[10px] text-white/50 leading-tight mt-0.5 line-clamp-1">{model.desc}</span>
                                  </div>
                                  <span className="block text-[11px] font-bold text-amber-400 mt-2">
                                    {model.credits}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* SUB-VIEW B: DESIGN YOUR INVITE (Details, Style, Background, Envelope) */
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                        Design your invite
                      </h2>
                      <p className="text-xs text-white/60 mt-0.5">
                        Your AI draft is ready. Editing never costs credits, and Premium extras are free to try.
                      </p>
                    </div>

                    {/* 4 Sub-Tabs: Details, Style, Background, Envelope */}
                    <div className="grid grid-cols-4 gap-2 border-b border-white/10 pb-3">
                      <button
                        type="button"
                        onClick={() => setDesignSubTab("details")}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition cursor-pointer",
                          designSubTab === "details"
                            ? "bg-white/15 text-amber-300 border border-white/20"
                            : "text-white/60 hover:text-white"
                        )}
                      >
                        <Calendar className="size-3.5" />
                        Details
                      </button>

                      <button
                        type="button"
                        onClick={() => setDesignSubTab("style")}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition cursor-pointer",
                          designSubTab === "style"
                            ? "bg-white/15 text-amber-300 border border-white/20"
                            : "text-white/60 hover:text-white"
                        )}
                      >
                        <Type className="size-3.5" />
                        Style
                      </button>

                      <button
                        type="button"
                        onClick={() => setDesignSubTab("background")}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition cursor-pointer",
                          designSubTab === "background"
                            ? "bg-white/15 text-amber-300 border border-white/20"
                            : "text-white/60 hover:text-white"
                        )}
                      >
                        <Palette className="size-3.5" />
                        Background
                      </button>

                      <button
                        type="button"
                        onClick={() => setDesignSubTab("envelope")}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition cursor-pointer",
                          designSubTab === "envelope"
                            ? "bg-white/15 text-amber-300 border border-white/20"
                            : "text-white/60 hover:text-white"
                        )}
                      >
                        <Mail className="size-3.5" />
                        Envelope
                      </button>
                    </div>

                    {/* SUBTAB 1: DETAILS */}
                    {designSubTab === "details" && (
                      <div className="space-y-4">
                        {/* Event title */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span>Event title</span>
                            <label className="flex items-center gap-1.5 text-[11px] text-white/70 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={showTitleOnInvite}
                                onChange={(e) => setShowTitleOnInvite(e.target.checked)}
                                className="size-3.5 rounded bg-white/10 text-amber-400"
                              />
                              Show on invite
                            </label>
                          </div>
                          <input
                            type="text"
                            value={eventTitle}
                            onChange={(e) => setEventTitle(e.target.value)}
                            placeholder="e.g. Marcus turns 50"
                            className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                        {/* Date and time */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span>Date and time</span>
                            <label className="flex items-center gap-1.5 text-[11px] text-white/70 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={showDateOnInvite}
                                onChange={(e) => setShowDateOnInvite(e.target.checked)}
                                className="size-3.5 rounded bg-white/10 text-amber-400"
                              />
                              Show on invite
                            </label>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="date"
                              value={eventDate}
                              onChange={(e) => setEventDate(e.target.value)}
                              className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                            />
                            <input
                              type="time"
                              value={eventTime}
                              onChange={(e) => setEventTime(e.target.value)}
                              className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Venue */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span>Venue</span>
                            <label className="flex items-center gap-1.5 text-[11px] text-white/70 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={showVenueOnInvite}
                                onChange={(e) => setShowVenueOnInvite(e.target.checked)}
                                className="size-3.5 rounded bg-white/10 text-amber-400"
                              />
                              Show on invite
                            </label>
                          </div>
                          <input
                            type="text"
                            value={eventVenue}
                            onChange={(e) => setEventVenue(e.target.value)}
                            placeholder="e.g. Sky Lounge, Rooftop"
                            className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* SUBTAB 2: STYLE */}
                    {designSubTab === "style" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                            Typography Font
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {["Playfair Display", "DM Sans", "Cinzel", "Montserrat", "Bebas Neue", "Caveat", "Londrina Solid", "Permanent Marker", "Dancing Script", "Inter"].map((font) => (
                              <button
                                key={font}
                                type="button"
                                onClick={() => setSelectedFont(font)}
                                className={cn(
                                  "rounded-xl border p-2.5 text-xs text-left font-medium transition cursor-pointer",
                                  selectedFont === font
                                    ? "border-amber-400 bg-amber-400/15 text-amber-300"
                                    : "border-white/10 bg-white/5 hover:border-white/20"
                                )}
                              >
                                {font}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                            Text Alignment
                          </label>
                          <div className="flex items-center gap-2">
                            {(["left", "center", "right"] as const).map((align) => (
                              <button
                                key={align}
                                type="button"
                                onClick={() => setTitleAlignment(align)}
                                className={cn(
                                  "flex-1 rounded-xl border py-2 text-xs font-bold uppercase transition cursor-pointer",
                                  titleAlignment === align
                                    ? "border-amber-400 bg-amber-400/15 text-amber-300"
                                    : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                                )}
                              >
                                {align}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                            Title Font Size
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="24"
                              max="72"
                              value={titleFontSize}
                              onChange={(e) => setTitleFontSize(parseInt(e.target.value))}
                              className="flex-1 h-2 bg-white/10 rounded-lg appearance-none accent-amber-400 cursor-pointer"
                            />
                            <span className="text-sm font-bold text-amber-300 w-12 text-right">{titleFontSize}px</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                            Title Color
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={titleColor}
                              onChange={(e) => setTitleColor(e.target.value)}
                              className="size-10 rounded-xl border border-white/20 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={titleColor}
                              onChange={(e) => setTitleColor(e.target.value)}
                              className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none font-mono"
                              placeholder="#FFFFFF"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                            Title Letter Spacing
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="10"
                              step="0.5"
                              value={titleLetterSpacing}
                              onChange={(e) => setTitleLetterSpacing(parseFloat(e.target.value))}
                              className="flex-1 h-2 bg-white/10 rounded-lg appearance-none accent-amber-400 cursor-pointer"
                            />
                            <span className="text-sm font-bold text-amber-300 w-12 text-right">{titleLetterSpacing}px</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                            Title Line Height
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0.8"
                              max="2"
                              step="0.1"
                              value={titleLineHeight}
                              onChange={(e) => setTitleLineHeight(parseFloat(e.target.value))}
                              className="flex-1 h-2 bg-white/10 rounded-lg appearance-none accent-amber-400 cursor-pointer"
                            />
                            <span className="text-sm font-bold text-amber-300 w-12 text-right">{titleLineHeight}</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                            Title Font Weight
                          </label>
                          <div className="flex items-center gap-2 flex-wrap">
                            {["400", "500", "600", "700", "800", "900"].map((weight) => (
                              <button
                                key={weight}
                                type="button"
                                onClick={() => setTitleFontWeight(weight as any)}
                                className={cn(
                                  "rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer",
                                  titleFontWeight === weight
                                    ? "border-amber-400 bg-amber-400/15 text-amber-300"
                                    : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                                )}
                              >
                                {weight}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                            Title Text Shadow
                          </label>
                          <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={titleTextShadow}
                              onChange={(e) => setTitleTextShadow(e.target.checked)}
                              className="size-4 rounded border-white/20 bg-white/10 text-amber-400 focus:ring-0 cursor-pointer"
                            />
                            <span>Add subtle shadow for better readability</span>
                          </label>
                        </div>

                        <div className="border-t border-white/10 pt-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                            Date & Time Font Size
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="10"
                              max="24"
                              value={datetimeFontSize}
                              onChange={(e) => setDatetimeFontSize(parseInt(e.target.value))}
                              className="flex-1 h-2 bg-white/10 rounded-lg appearance-none accent-amber-400 cursor-pointer"
                            />
                            <span className="text-sm font-bold text-amber-300 w-12 text-right">{datetimeFontSize}px</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                            Date & Time Color
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={datetimeColor}
                              onChange={(e) => setDatetimeColor(e.target.value)}
                              className="size-10 rounded-xl border border-white/20 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={datetimeColor}
                              onChange={(e) => setDatetimeColor(e.target.value)}
                              className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none font-mono"
                              placeholder="#FFFFFF"
                            />
                          </div>
                        </div>

                        <div className="border-t border-white/10 pt-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                            Venue Font Size
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="10"
                              max="20"
                              value={venueFontSize}
                              onChange={(e) => setVenueFontSize(parseInt(e.target.value))}
                              className="flex-1 h-2 bg-white/10 rounded-lg appearance-none accent-amber-400 cursor-pointer"
                            />
                            <span className="text-sm font-bold text-amber-300 w-12 text-right">{venueFontSize}px</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                            Venue Color
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={venueColor}
                              onChange={(e) => setVenueColor(e.target.value)}
                              className="size-10 rounded-xl border border-white/20 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={venueColor}
                              onChange={(e) => setVenueColor(e.target.value)}
                              className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none font-mono"
                              placeholder="rgba(255, 255, 255, 0.85)"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUBTAB 3: BACKGROUND */}
                    {designSubTab === "background" && (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                          <span className="block text-xs font-bold">Custom Image Background</span>
                          <div className="flex items-center gap-3">
                            <div className="relative size-14 rounded-xl overflow-hidden border border-white/20 bg-black shrink-0">
                              {activeDisplayPhoto ? (
                                <img src={activeDisplayPhoto} alt="Background" className="size-full object-cover" />
                              ) : (
                                <div className="size-full bg-white/10" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20 transition cursor-pointer"
                              >
                                Change photo
                              </button>
                              <p className="text-[10px] text-white/50">Supports high-res PNG, JPG or WebP</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUBTAB 4: ENVELOPE */}
                    {designSubTab === "envelope" && (
                      <div className="space-y-4">
                        {/* Envelope reveal toggle */}
                        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold">Envelope reveal</span>
                              <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                                Premium
                              </span>
                            </div>
                            <p className="text-[11px] text-white/50 mt-0.5">
                              Guests tap an envelope to open your invite.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEnvelopeReveal(!envelopeReveal)}
                            className={cn(
                              "relative h-6 w-11 rounded-full transition cursor-pointer",
                              envelopeReveal ? "bg-amber-400" : "bg-white/20"
                            )}
                          >
                            <span
                              className={cn(
                                "absolute top-1 size-4 rounded-full bg-black transition",
                                envelopeReveal ? "left-6" : "left-1"
                              )}
                            />
                          </button>
                        </div>

                        {/* Envelope colours */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                            Envelope colour
                          </label>
                          <div className="flex items-center gap-2.5">
                            {[
                              { id: "#6B1D2F", name: "Burgundy" },
                              { id: "#1E293B", name: "Navy" },
                              { id: "#2D4A3E", name: "Sage" },
                              { id: "#835C4A", name: "Terracotta" },
                              { id: "#111827", name: "Charcoal" },
                              { id: "#C59B27", name: "Gold" },
                            ].map((col) => (
                              <button
                                key={col.id}
                                type="button"
                                onClick={() => setEnvelopeColor(col.id)}
                                className={cn(
                                  "size-8 rounded-full border-2 transition cursor-pointer",
                                  envelopeColor === col.id ? "border-amber-400 scale-110" : "border-transparent"
                                )}
                                style={{ backgroundColor: col.id }}
                                title={col.name}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Seal */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                            Seal
                          </label>
                          <div className="flex items-center gap-2">
                            {["Gold Wax Seal", "Royal Crest", "Star Seal", "Heart Wax"].map((seal) => (
                              <button
                                key={seal}
                                type="button"
                                onClick={() => setEnvelopeSeal(seal)}
                                className={cn(
                                  "rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer",
                                  envelopeSeal === seal
                                    ? "border-amber-400 bg-amber-400/15 text-amber-300"
                                    : "border-white/10 bg-white/5 hover:border-white/20"
                                )}
                              >
                                {seal}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Premium Notice Banner */}
                    <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 flex items-start gap-2.5 text-xs text-amber-200">
                      <Sparkles className="size-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-bold">Premium in use:</span> Custom background, Envelope. You can upgrade when you publish.
                      </div>
                    </div>

                  </div>
                )}
              </>
            )}

            {/* ================= STEP 2: EVENT SETUP ================= */}
            {activeStep === 2 && (
              <div className="space-y-5">
                <div>
                  <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-400">
                    STEP 2 OF 4
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
                    Set up your event
                  </h2>
                  <p className="text-xs text-white/60 mt-0.5">
                    Your title, date and venue are already saved. Pick a quick setup or open any group.
                  </p>
                </div>

                {/* Quick Setup Pills */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                    Quick setup
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "open", title: "Open party", desc: "Anyone with link can RSVP" },
                      { id: "private", title: "Private invite", desc: "Approved guests only" },
                      { id: "ticketed", title: "Ticketed", desc: "Guests pay, QR check-in" },
                      { id: "host-copay", title: "Host co-pay", desc: "You pay, guests reserve" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setQuickSetup(opt.id as any)}
                        className={cn(
                          "rounded-2xl border p-3 text-left transition cursor-pointer",
                          quickSetup === opt.id
                            ? "border-amber-400 bg-amber-400/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        )}
                      >
                        <span className="block text-xs font-bold text-white">{opt.title}</span>
                        <span className="block text-[10px] text-white/50 mt-0.5 leading-tight">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accordions */}
                <div className="space-y-2">
                  {/* 1. Privacy and access */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(openAccordion === "privacy" ? null : "privacy")}
                      className="flex w-full items-center justify-between p-4 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl bg-amber-400/10 text-amber-400">
                          <Lock className="size-4" />
                        </span>
                        <div>
                          <span className="block text-xs font-bold">Privacy and access</span>
                          <span className="block text-[11px] text-white/50">
                            {privacyMode === "public" ? "Public • Anyone can RSVP" : "Private • Approval needed"}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={cn("size-4 transition", openAccordion === "privacy" && "rotate-180")} />
                    </button>

                    {openAccordion === "privacy" && (
                      <div className="border-t border-white/10 p-4 space-y-3 bg-black/30">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPrivacyMode("public")}
                            className={cn(
                              "flex-1 rounded-xl border p-2.5 text-xs font-semibold text-center transition cursor-pointer",
                              privacyMode === "public" ? "border-amber-400 bg-amber-400/15 text-amber-300" : "border-white/10 bg-white/5"
                            )}
                          >
                            Public
                          </button>
                          <button
                            type="button"
                            onClick={() => setPrivacyMode("private")}
                            className={cn(
                              "flex-1 rounded-xl border p-2.5 text-xs font-semibold text-center transition cursor-pointer",
                              privacyMode === "private" ? "border-amber-400 bg-amber-400/15 text-amber-300" : "border-white/10 bg-white/5"
                            )}
                          >
                            Private (Approval needed)
                          </button>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={hideAddressUntilApproved}
                            onChange={(e) => setHideAddressUntilApproved(e.target.checked)}
                            className="size-3.5 rounded bg-white/10 text-amber-400"
                          />
                          Hide address until guest RSVP is approved
                        </label>
                      </div>
                    )}
                  </div>

                  {/* 2. RSVP Capacity & +1s */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(openAccordion === "rsvp" ? null : "rsvp")}
                      className="flex w-full items-center justify-between p-4 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl bg-amber-400/10 text-amber-400">
                          <CheckCircle className="size-4" />
                        </span>
                        <div>
                          <span className="block text-xs font-bold">RSVP & Capacity</span>
                          <span className="block text-[11px] text-white/50">{rsvpSpots} spots • +1 allowed</span>
                        </div>
                      </div>
                      <ChevronDown className={cn("size-4 transition", openAccordion === "rsvp" && "rotate-180")} />
                    </button>

                    {openAccordion === "rsvp" && (
                      <div className="border-t border-white/10 p-4 space-y-3 bg-black/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Capacity limit:</span>
                          <input
                            type="number"
                            value={rsvpSpots}
                            onChange={(e) => setRsvpSpots(Number(e.target.value))}
                            className="w-24 rounded-lg border border-white/15 bg-black/50 px-2 py-1 text-xs text-right text-white"
                          />
                        </div>
                        <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allowPlusOnes}
                            onChange={(e) => setAllowPlusOnes(e.target.checked)}
                            className="size-3.5 rounded bg-white/10 text-amber-400"
                          />
                          Allow each guest to bring +1 companion
                        </label>
                      </div>
                    )}
                  </div>

                  {/* 3. Payments */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(openAccordion === "payments" ? null : "payments")}
                      className="flex w-full items-center justify-between p-4 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl bg-amber-400/10 text-amber-400">
                          <CreditCard className="size-4" />
                        </span>
                        <div>
                          <span className="block text-xs font-bold">Payments & Tickets</span>
                          <span className="block text-[11px] text-white/50">
                            {isPaidEvent ? `$${ticketPrice} per ticket` : "Free event • No ticket fee"}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={cn("size-4 transition", openAccordion === "payments" && "rotate-180")} />
                    </button>

                    {openAccordion === "payments" && (
                      <div className="border-t border-white/10 p-4 space-y-3 bg-black/30">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsPaidEvent(false)}
                            className={cn(
                              "flex-1 rounded-xl border p-2 text-xs font-semibold cursor-pointer",
                              !isPaidEvent ? "border-amber-400 bg-amber-400/15 text-amber-300" : "border-white/10"
                            )}
                          >
                            Free Event
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsPaidEvent(true)}
                            className={cn(
                              "flex-1 rounded-xl border p-2 text-xs font-semibold cursor-pointer",
                              isPaidEvent ? "border-amber-400 bg-amber-400/15 text-amber-300" : "border-white/10"
                            )}
                          >
                            Paid Tickets
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 3: GUESTS ================= */}
            {activeStep === 3 && (
              <div className="space-y-5">
                <div>
                  <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-400">
                    STEP 3 OF 4
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
                    Who are you inviting?
                  </h2>
                  <p className="text-xs text-white/60 mt-0.5">
                    Choose guests from your contacts, or add someone new. Only the people you tick get an invite.
                  </p>
                </div>

                {/* Search Bar + Add Guest */}
                <div className="flex items-center gap-2.5">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                    <input
                      type="text"
                      value={guestSearchQuery}
                      onChange={(e) => setGuestSearchQuery(e.target.value)}
                      placeholder="Search by name or email"
                      className="w-full rounded-2xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddGuestModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                  >
                    <UserPlus className="size-4 text-amber-400" />
                    <span>Add guest</span>
                  </button>
                </div>

                {/* Category Pills (All, Family, Friends, Work, Neighbors) */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {["All", "Family", "Friends", "Work", "Neighbors"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setGuestCategoryFilter(cat)}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer shrink-0",
                        guestCategoryFilter === cat
                          ? "bg-amber-400 text-black"
                          : "border border-white/15 bg-white/5 text-white/70 hover:text-white"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Contacts List with Checkboxes */}
                <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-xs text-white/60">
                    <span>
                      {selectedGuestIds.length > 0
                        ? `${selectedGuestIds.length} selected`
                        : "No one selected yet"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const shownIds = filteredContacts.map((c) => c.id);
                        setSelectedGuestIds((prev) => Array.from(new Set([...prev, ...shownIds])));
                      }}
                      className="text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      Select shown
                    </button>
                  </div>

                  <div className="max-h-[220px] overflow-y-auto divide-y divide-white/5">
                    {filteredContacts.map((contact) => {
                      const isChecked = selectedGuestIds.includes(contact.id);
                      return (
                        <div
                          key={contact.id}
                          onClick={() => {
                            setSelectedGuestIds((prev) =>
                              isChecked ? prev.filter((id) => id !== contact.id) : [...prev, contact.id]
                            );
                          }}
                          className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="size-4 rounded border-white/20 bg-white/10 text-amber-400 cursor-pointer"
                            />
                            <span className={cn("grid size-8 place-items-center rounded-full text-xs font-bold text-white", contact.avatarBg)}>
                              {contact.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                            <div>
                              <span className="block text-xs font-bold text-white leading-none">{contact.name}</span>
                              <span className="block text-[11px] text-white/50 leading-tight mt-0.5">{contact.email}</span>
                            </div>
                          </div>

                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] text-white/60">
                            {contact.category}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 4: PUBLISH ================= */}
            {activeStep === 4 && (
              <div className="space-y-5">
                <div>
                  <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-400">
                    STEP 4 OF 4
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
                    Ready to publish
                  </h2>
                  <p className="text-xs text-white/60 mt-0.5">
                    Review what you set up. The details you entered build your event page, so you only fill them in once.
                  </p>
                </div>

                {/* Review Table Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-white/60">Event</span>
                    <span className="font-bold text-white">{eventTitle}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-white/60">When</span>
                    <span className="font-bold text-white">{eventDate} • {eventTime}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-white/60">Where</span>
                    <span className="font-bold text-white">{eventVenue}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-white/60">Access</span>
                    <span className="font-bold text-white">
                      {privacyMode === "public" ? "Public • Anyone can RSVP" : "Private • Approval needed"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-white/60">RSVP</span>
                    <span className="font-bold text-white">{rsvpSpots} spots • +1 each</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-white/60">Guests</span>
                    <span className="font-bold text-white">
                      {selectedGuestIds.length > 0 ? `${selectedGuestIds.length} invited` : "None yet"}
                    </span>
                  </div>
                </div>

                {/* Your event page slug card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                  <div>
                    <span className="block text-[11px] text-white/50">Your event page</span>
                    <span className="block text-sm font-mono font-bold text-amber-300">
                      /e/{cleanSlug}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyEventLink}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold hover:bg-white/20 transition cursor-pointer"
                  >
                    {copiedLink ? <CheckCheck className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    <span>{copiedLink ? "Copied" : "Copy link"}</span>
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* STICKY FOOTER ACTION BAR (Pins cleanly at the bottom) */}
          <div className="shrink-0 border-t border-white/10 bg-[#0c1015]/95 backdrop-blur-md px-4 sm:px-6 py-3 z-20">
            {/* Step 1 Sub-View A (Creation Mode) Footer */}
            {activeStep === 1 && !isDesignReady && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                    className={cn(
                      "inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold transition cursor-pointer shrink-0",
                      showMoreOptions
                        ? "border-amber-400 bg-amber-400/10 text-white shadow-[0_0_12px_rgba(251,191,36,0.2)]"
                        : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                    )}
                  >
                    <SlidersHorizontal className="size-3.5" />
                    <span className="hidden sm:inline">More options</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300">
                      <Coins className="size-3 text-amber-400" />
                      {getRequiredCredits()} credits
                    </span>
                    {showMoreOptions ? (
                      <ChevronUp className="size-3.5 ml-0.5 text-amber-400" />
                    ) : (
                      <ChevronDown className="size-3.5 ml-0.5 opacity-60" />
                    )}
                  </button>

                  {/* Buy Credits Button right next to More options */}
                  <button
                    type="button"
                    onClick={() => setIsBuyCreditsOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/15 px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-400/25 hover:border-amber-400 transition cursor-pointer shadow-sm active:scale-95 shrink-0"
                  >
                    <Coins className="size-3.5 text-amber-400" />
                    <span>Buy Credits</span>
                  </button>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    disabled={isGenerating || (inviteFormat === "video" && credits < 2)}
                    onClick={() => {
                      if (inviteFormat === "video" && credits < 2) {
                        setIsBuyCreditsOpen(true);
                        return;
                      }
                      handleGenerateInvite();
                    }}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-full px-5 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold transition active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.3)]",
                      inviteFormat === "video" && credits < 2
                        ? "bg-amber-400/35 text-black/60 cursor-not-allowed border border-amber-400/20"
                        : "bg-amber-400 text-black hover:bg-amber-300 cursor-pointer"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>{generationStage || "Generating..."}</span>
                      </>
                    ) : inviteFormat === "video" && credits < 2 ? (
                      <span className="flex items-center gap-1.5">
                        <Coins className="size-4 text-black/60" />
                        <span>Buy Credits to Create</span>
                      </span>
                    ) : inviteFormat === "video" ? (
                      <span>Create my video invite</span>
                    ) : creationMode === "template" ? (
                      <span>Create from template</span>
                    ) : creationMode === "upload" ? (
                      <span>Create from photo</span>
                    ) : (
                      <span>Create with AI</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 1 Sub-View B (Design Customizer) Footer */}
            {activeStep === 1 && isDesignReady && (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsDesignReady(false)}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold hover:bg-white/10 transition cursor-pointer"
                >
                  ← Back to styles
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-black transition hover:bg-amber-300 active:scale-95 shadow cursor-pointer"
                >
                  <span>Continue to event setup</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            )}

            {/* Step 2 Footer */}
            {activeStep === 2 && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCheck className="size-3.5" /> All changes saved.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="rounded-full px-3 sm:px-4 py-2 text-xs font-semibold text-white/70 hover:text-white transition cursor-pointer"
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="rounded-full bg-amber-400 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold text-black transition hover:bg-amber-300 active:scale-95 shadow cursor-pointer"
                  >
                    Save and continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 Footer */}
            {activeStep === 3 && (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold hover:bg-white/10 transition cursor-pointer"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="rounded-full bg-amber-400 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold text-black transition hover:bg-amber-300 active:scale-95 shadow cursor-pointer"
                >
                  {selectedGuestIds.length > 0
                    ? `Continue with ${selectedGuestIds.length} guests`
                    : "Continue without inviting"}
                </button>
              </div>
            )}

            {/* Step 4 Footer */}
            {activeStep === 4 && (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold hover:bg-white/10 transition cursor-pointer"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={handlePublishEvent}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold text-black transition hover:bg-amber-300 active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.3)] cursor-pointer"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Publishing event...</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span>Publish event page</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* RIGHT COLUMN (~40%): LIVE PREVIEW & METADATA */}
        {/* --------------------------------------------------------- */}
        <div
          className={cn(
            "lg:col-span-5 flex flex-col min-h-0 h-full overflow-y-auto bg-black/40 p-4 sm:p-5 space-y-4",
            mobileTab === "form" ? "hidden lg:flex" : "flex"
          )}
        >
          <span className="block text-xs font-extrabold uppercase tracking-wider text-white/50">
            LIVE PREVIEW
          </span>

          {/* 9:16 Vertical Mobile Phone Mockup */}
          <div
            ref={cardCanvasRef}
            data-card-canvas="true"
            className="relative mx-auto aspect-[9/16] w-full max-w-[210px] sm:max-w-[240px] xl:max-w-[260px] overflow-hidden rounded-[2rem] border-2 border-white/20 bg-[#070a0e] shadow-2xl shrink-0"
          >
              {/* If no template chosen and design not ready -> "Your invite appears here" */}
              {(!selectedTemplate && !activeDisplayPhoto && !generatedVideoUrl) ? (
                <div className="absolute inset-0 grid place-items-center p-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Sparkles className="size-8 text-amber-400 animate-pulse" />
                    <span className="text-sm font-bold text-white/80">Your invite appears here</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Media Background (ExperienceVisual, Video, or Image) */}
                  {generatedVideoUrl ? (
                    <video
                      ref={videoRef}
                      key={generatedVideoUrl}
                      src={generatedVideoUrl}
                      autoPlay
                      loop
                      playsInline
                      muted={isVideoMuted}
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : creationMode === "template" && selectedTemplate && "kind" in selectedTemplate.preview ? (
                    <ExperienceVisual
                      kind={selectedTemplate.preview.kind}
                      photo={userPhoto || undefined}
                      playing={isPlayingVideo}
                      className="absolute inset-0"
                    />
                  ) : activeVideoSrc ? (
                    <video
                      ref={videoRef}
                      key={activeVideoSrc}
                      src={activeVideoSrc}
                      autoPlay
                      loop
                      playsInline
                      muted={isVideoMuted}
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : (
                    <img
                      src={userPhoto || (selectedTemplate && "img" in selectedTemplate.preview ? selectedTemplate.preview.img : activeDisplayPhoto || "/images/marcus.webp")}
                      alt={eventTitle}
                      className="absolute inset-0 size-full object-cover"
                    />
                  )}

                  {/* Dark Gradient Vignette for Text Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

                  {/* Floating Top Tag */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-amber-300 border border-white/10 shadow-sm">
                      <Sparkles className="size-2.5" />
                      {inviteFormat === "video" || activeVideoSrc ? "AI Video Invite" : "AI Image Invite"}
                    </span>
                  </div>

                  {/* Video Player Floating Controls */}
                  {activeVideoSrc && (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
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
                        className="grid size-6 place-items-center rounded-full bg-black/70 backdrop-blur-md text-white/80 hover:text-white transition cursor-pointer"
                      >
                        {isPlayingVideo ? <Pause className="size-2.5" /> : <Play className="size-2.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsVideoMuted(!isVideoMuted)}
                        className="grid size-6 place-items-center rounded-full bg-black/70 backdrop-blur-md text-white/80 hover:text-white transition cursor-pointer"
                      >
                        {isVideoMuted ? <VolumeX className="size-2.5" /> : <Volume2 className="size-2.5" />}
                      </button>
                    </div>
                  )}

                  {/* Dynamic Live Text Overlays */}
                  <div
                    className="absolute inset-0 z-10 pointer-events-none"
                    ref={cardCanvasRef}
                  >
                    {showTitleOnInvite && eventTitle && (
                      <DraggableText
                        id="title"
                        text={eventTitle}
                        position={textPositions.title}
                        onPositionChange={(pos) => setTextPositions((prev) => ({ ...prev, title: pos }))}
                        style={{
                          fontFamily: selectedFont,
                          fontSize: `${titleFontSize}px`,
                          color: titleColor,
                          letterSpacing: `${titleLetterSpacing}px`,
                          lineHeight: titleLineHeight,
                          fontWeight: titleFontWeight,
                          textShadow: titleTextShadow ? "0 2px 4px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.3)" : "none",
                          textAlign: titleAlignment,
                          textTransform: "uppercase",
                        }}
                      />
                    )}
                    {showDateOnInvite && eventDate && eventTime && (
                      <DraggableText
                        id="datetime"
                        text={`${eventDate} • ${eventTime}`}
                        position={textPositions.datetime}
                        onPositionChange={(pos) => setTextPositions((prev) => ({ ...prev, datetime: pos }))}
                        style={{
                          fontSize: `${datetimeFontSize}px`,
                          color: datetimeColor,
                          fontWeight: "500",
                          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                          textAlign: titleAlignment,
                        }}
                      />
                    )}
                    {showVenueOnInvite && eventVenue && (
                      <DraggableText
                        id="venue"
                        text={eventVenue}
                        position={textPositions.venue}
                        onPositionChange={(pos) => setTextPositions((prev) => ({ ...prev, venue: pos }))}
                        style={{
                          fontSize: `${venueFontSize}px`,
                          color: venueColor,
                          fontWeight: "500",
                          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                          textAlign: titleAlignment,
                        }}
                      />
                    )}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 bottom-8 z-10 pointer-events-none"
                      style={{ textAlign: titleAlignment }}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400 block">
                        YOU'RE INVITED
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Summary Metadata Table matching screenshot */}
            <div className="space-y-2 border-t border-white/10 pt-4 text-xs">
              <div className="flex items-center justify-between text-white/60">
                <span>Started from</span>
                <span className="font-bold text-white">
                  {creationMode === "describe" ? "Describe it" : creationMode === "template" ? "AI template" : "Upload"}
                </span>
              </div>
              <div className="flex items-center justify-between text-white/60">
                <span>Style</span>
                <span className="font-bold text-white">
                  {creationMode === "template"
                    ? (selectedTemplate?.title || "Not chosen yet")
                    : aiModel === "cinematic"
                    ? "Cinematic"
                    : aiModel === "quality"
                    ? "Quality"
                    : aiModel === "fast"
                    ? "Fast"
                    : "AI picks"}
                </span>
              </div>
              <div className="flex items-center justify-between text-white/60">
                <span>Format</span>
                <span className="font-bold text-white">{inviteFormat === "video" ? "9:16 · 10 sec" : "Image"}</span>
              </div>
              <div className="flex items-center justify-between text-white/60">
                <span>Plan</span>
                <span className="font-bold text-white">Free trial</span>
              </div>
              <div className="flex items-center justify-between text-white/60">
                <span>Credits</span>
                <span className="font-bold text-amber-300">
                  {getRequiredCredits()} credits
                </span>
              </div>
            </div>

            {/* Next Step Info Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs space-y-2">
              {activeStep === 1 && (
                <>
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <ArrowRight className="size-3.5" />
                    <span>Next: Event setup</span>
                  </div>
                  <ul className="space-y-1 text-white/70 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-amber-400" />
                      Choose who can see it and who can RSVP
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-amber-400" />
                      Co-hosts, reminders and payments
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-amber-400" />
                      Your details are reused, so nothing to retype
                    </li>
                  </ul>
                </>
              )}

              {activeStep === 2 && (
                <>
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <ArrowRight className="size-3.5" />
                    <span>Next: Guests</span>
                  </div>
                  <ul className="space-y-1 text-white/70 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-amber-400" />
                      Start with a sample guest list
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-amber-400" />
                      Choose how invites are sent
                    </li>
                  </ul>
                </>
              )}

              {activeStep === 3 && (
                <>
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <ArrowRight className="size-3.5" />
                    <span>Next: Publish</span>
                  </div>
                  <ul className="space-y-1 text-white/70 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-amber-400" />
                      Review everything in one place
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-amber-400" />
                      Get your event page link
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-amber-400" />
                      Send invites and watch RSVPs come in
                    </li>
                  </ul>
                </>
              )}

              {activeStep === 4 && (
                <>
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <ArrowRight className="size-3.5" />
                    <span>After this</span>
                  </div>
                  <ul className="space-y-1 text-white/70 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-amber-400" />
                      Reminders go out automatically
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-amber-400" />
                      Guests RSVP without an app
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-amber-400" />
                      Check guests in at the door
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Guest Modal */}
      {showAddGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#111827] p-5 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Add a new guest</h3>
              <button
                type="button"
                onClick={() => setShowAddGuestModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-white/15 bg-black/50 p-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-1">Email</label>
                <input
                  type="email"
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  placeholder="e.g. john@example.com"
                  className="w-full rounded-xl border border-white/15 bg-black/50 p-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-1">Category</label>
                <select
                  value={newGuestCategory}
                  onChange={(e) => setNewGuestCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-white/15 bg-black/50 p-2.5 text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="Friends">Friends</option>
                  <option value="Family">Family</option>
                  <option value="Work">Work</option>
                  <option value="Neighbors">Neighbors</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddGuestModal(false)}
                className="rounded-full px-4 py-1.5 text-xs text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newGuestName.trim()) {
                    const newId = "c-" + Date.now();
                    const newContact: ContactItem = {
                      id: newId,
                      name: newGuestName.trim(),
                      email: newGuestEmail.trim() || `${newGuestName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
                      category: newGuestCategory,
                      avatarBg: "bg-amber-600",
                    };
                    setContacts((prev) => [newContact, ...prev]);
                    setSelectedGuestIds((prev) => [...prev, newId]);
                    setShowAddGuestModal(false);
                    setNewGuestName("");
                    setNewGuestEmail("");
                  }
                }}
                className="rounded-full bg-amber-400 px-5 py-1.5 text-xs font-bold text-black hover:bg-amber-300"
              >
                Add Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Published Modal */}
      {isPublished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-amber-400/30 bg-[#0c1015] p-6 text-white text-center space-y-5 shadow-2xl">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40">
              <Check className="size-8 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold tracking-tight">Your event is published!</h3>
              <p className="text-xs text-white/60 mt-1">
                Your event page and interactive invitation are live. Share the link with your guests!
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-300 truncate mr-2">
                /e/{cleanSlug}
              </span>
              <button
                type="button"
                onClick={copyEventLink}
                className="inline-flex items-center gap-1 rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-black"
              >
                {copiedLink ? <CheckCheck className="size-3.5" /> : <Copy className="size-3.5" />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/e/${cleanSlug}`);
                }}
                className="rounded-full border border-white/20 bg-white/10 py-3 text-xs font-bold text-white hover:bg-white/20 cursor-pointer"
              >
                View Live Event
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/dashboard/events");
                }}
                className="rounded-full bg-amber-400 py-3 text-xs font-extrabold text-black hover:bg-amber-300 cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Credit Notification Toast */}
      {creditNotification && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full border border-amber-400/40 bg-black/95 px-4 py-2.5 text-xs font-bold text-amber-200 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
          <Coins className="size-4 text-amber-400 shrink-0" />
          <span>{creditNotification}</span>
        </div>
      )}

      {/* Buy Credits Modal Dialog */}
      {isBuyCreditsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-amber-400/30 bg-[#0e131b] p-6 text-white shadow-[0_0_50px_rgba(251,191,36,0.2)]">
            <button
              type="button"
              onClick={() => setIsBuyCreditsOpen(false)}
              className="absolute top-4 right-4 grid size-8 place-items-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="grid size-12 place-items-center rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300">
                <Coins className="size-6 text-amber-400" />
              </span>
              <div>
                <h3 className="text-lg font-bold">Buy Creation Credits</h3>
                <p className="text-xs text-white/60">
                  Current balance: <span className="text-amber-300 font-bold">{credits} credits</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-white/70 mb-5 leading-relaxed">
              Video invites powered by ByteDance Seedance AI cost <strong className="text-amber-300">2 credits</strong> per generation. Select a credit pack to top-up instantly:
            </p>

            {/* Credit Pack Options */}
            <div className="space-y-2.5 mb-6">
              {[
                {
                  amount: 10,
                  price: "$5",
                  invites: "5 video invites",
                  popular: false,
                  badge: "Starter",
                },
                {
                  amount: 25,
                  price: "$10",
                  invites: "12 video invites",
                  popular: true,
                  badge: "Most Popular",
                },
                {
                  amount: 60,
                  price: "$20",
                  invites: "30 video invites",
                  popular: false,
                  badge: "Best Value",
                },
              ].map((pack) => {
                const isSelected = selectedCreditPack === pack.amount;
                return (
                  <button
                    key={pack.amount}
                    type="button"
                    onClick={() => setSelectedCreditPack(pack.amount)}
                    className={cn(
                      "w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition cursor-pointer",
                      isSelected
                        ? "border-amber-400 bg-amber-400/15 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "grid size-5 place-items-center rounded-full border text-[10px] font-bold",
                          isSelected
                            ? "border-amber-400 bg-amber-400 text-black"
                            : "border-white/30"
                        )}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-white">
                            {pack.amount} Credits
                          </span>
                          {pack.badge && (
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase",
                                pack.popular
                                  ? "bg-amber-400 text-black"
                                  : "bg-white/10 text-white/80"
                              )}
                            >
                              {pack.badge}
                            </span>
                          )}
                        </div>
                        <span className="block text-[11px] text-white/50">
                          {pack.invites}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-amber-300">
                        {pack.price}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsBuyCreditsOpen(false)}
                className="flex-1 rounded-full border border-white/15 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBuyingCredits}
                onClick={() => handleBuyCredits(selectedCreditPack)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 py-2.5 text-xs font-extrabold text-black hover:bg-amber-300 active:scale-95 transition shadow-[0_0_15px_rgba(251,191,36,0.25)] cursor-pointer"
              >
                {isBuyingCredits ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Purchase {selectedCreditPack} Credits</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal Guard */}
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
    </Modal>
  );
}
