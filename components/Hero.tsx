"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { 
  Sparkles, 
  Wand2, 
  Send, 
  LayoutTemplate, 
  Upload, 
  SlidersHorizontal,
  FileUp,
  Check,
  ArrowRight,
  FileText,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Loader2,
  ArrowUpRight,
  Heart,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AuthModal from "./AuthModal";
import templateService, { Template } from "../services/templateService";
import eventService from "../services/eventService";
import API, { getApiErrorMessage } from "../services/api";
import { getImageUrl } from "../utils/imageUrl";
import { compressAndNormalizeImage } from "../utils/imageCompressor";
import { templateCards, matchesCategory } from "../lib/templateData";
import { NEW_TEMPLATE_IMAGES, getTemplateConfig, normalizeTemplateImageUrl, sortTemplatesByPriority } from "../lib/newTemplatesData";
import EviteCardPreview from "./designer/EviteCardPreview";
import AnimatedHeading from "./AnimatedHeading";

const getDefaultEventDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
};

const getDefaultEventTime = () => "18:00";

const getDefaultVenueForTemplate = (tpl?: Template | null) => {
  if (!tpl) return "Celebration Hall";
  try {
    const parsed = typeof tpl.content === "string" ? JSON.parse(tpl.content) : tpl.content;
    if (parsed && parsed.venue) return parsed.venue;
  } catch (e) {}
  const cat = (tpl?.category || "").toLowerCase();
  const name = (tpl?.name || "").toLowerCase();
  if (cat.includes("birthday") || name.includes("birthday")) return "Grand Celebration Hall";
  if (cat.includes("wedding") || name.includes("wedding")) return "Sunset Garden & Ballroom";
  if (cat.includes("baby") || name.includes("baby")) return "The Blossom Lounge";
  if (cat.includes("corporate") || name.includes("corporate")) return "Executive Conference Center";
  if (cat.includes("network") || name.includes("network")) return "The Innovation Hub & Rooftop";
  if (cat.includes("party") || name.includes("gala")) return "Skyline Lounge";
  return "Main Event Hall";
};

const fallbackTemplates: Template[] = sortTemplatesByPriority(
  templateCards.map((tc) => ({
    id: tc.id,
    name: tc.title,
    category: tc.category || tc.type,
    tags: (tc as any).tags || [],
    badge: tc.badge || "FREE",
    content: JSON.stringify({
      gradient: tc.gradient,
      accentColor: tc.accentColor,
      emoji: tc.emoji,
      host: tc.host,
      venue: tc.venue,
      description: tc.description,
      image: tc.image
    }),
    isPremium: (tc.badge || "").toUpperCase() === "PREMIUM",
    priority: (tc as any).priority,
    sortOrder: (tc as any).sortOrder,
    isEditable: (tc as any).isEditable,
    isFeatured: (tc as any).isFeatured,
  }))
);

const defaultTemplateId = templateCards[0]?.id || "tpl-abstract-nature-party";

const getTemplateImage = (templateId?: string | null) => {
  if (!templateId) return null;
  const cfg = getTemplateConfig(templateId);
  if (cfg?.mockupUrl) return cfg.mockupUrl;
  const card = templateCards.find(c => c.id === templateId);
  if (card?.mockupUrl) return card.mockupUrl;
  if (card?.image) return card.image;
  return NEW_TEMPLATE_IMAGES[templateId] || null;
};

const getCardImageUrl = (tpl: any) => {
  let rawUrl: any =
    tpl.thumbnailUrl ||
    tpl.fullThumbnailUrl ||
    tpl.card?.artworkUrl ||
    tpl.card?.fullArtworkUrl ||
    tpl.backgroundImage ||
    tpl.fullBackgroundImage ||
    tpl.canvasData?.backgroundImage ||
    tpl.imageUrl ||
    tpl.fullImageUrl ||
    tpl.mockupUrl ||
    tpl.image;

  if (!rawUrl && tpl.content) {
    try {
      const parsed = typeof tpl.content === "string" ? JSON.parse(tpl.content) : tpl.content;
      rawUrl =
        parsed.thumbnailUrl ||
        parsed.fullThumbnailUrl ||
        parsed.card?.artworkUrl ||
        parsed.card?.fullArtworkUrl ||
        parsed.backgroundImage ||
        parsed.fullBackgroundImage ||
        parsed.canvasData?.backgroundImage ||
        parsed.imageUrl ||
        parsed.mockupUrl ||
        parsed.image;
    } catch (e) {}
  }

  if (!rawUrl) rawUrl = getTemplateImage(tpl.id);
  const urlStr = typeof rawUrl === "object" && rawUrl !== null ? (rawUrl.url || rawUrl.src || "") : (typeof rawUrl === "string" ? rawUrl : "");
  return normalizeTemplateImageUrl(urlStr) || getImageUrl(urlStr);
};

const tabs = [
  { id: 0, label: "AI Create", icon: Sparkles },
  { id: 1, label: "Template", icon: LayoutTemplate },
  { id: 2, label: "Upload Existing", icon: Upload },
];

// Framer Motion variants for Floating Cards (Continuous subtle floating animation)
const leftCardVariants = {
  animate: {
    y: [-6, 6, -6],
    rotate: [-3, -1, -3],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const rightCardVariants = {
  animate: {
    y: [6, -6, 6],
    rotate: [1, 3, 1],
    transition: {
      duration: 5.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Seasonal prompts for animated typewriter placeholder effect
const SEASONAL_TYPEWRITER_PROMPTS = [
  "e.g. Spooky Haunted House costume party with pumpkin decor, scary cocktails, and costume contest...",
  "e.g. Cozy Thanksgiving harvest dinner for 20 guests with roast turkey, autumn candles, and warm cider...",
  "e.g. Festive Friendsgiving potluck with fall foliage arrangements, pumpkin pie bar, and acoustic music...",
  "e.g. Victorian Halloween masquerade ball with fog effects, antique candelabras, and live DJ...",
];

function SeasonalTypewriterTextarea({
  value,
  onChange,
  onKeyDown,
  disabled,
  className,
  rows = 3,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  className?: string;
  rows?: number;
}) {
  const [placeholder, setPlaceholder] = useState(SEASONAL_TYPEWRITER_PROMPTS[0]);
  const [promptIdx, setPromptIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(SEASONAL_TYPEWRITER_PROMPTS[0].length);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // If user has already entered text, stop cycling to save CPU
    if (value && value.trim().length > 0) return;

    const currentPrompt = SEASONAL_TYPEWRITER_PROMPTS[promptIdx];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (charIdx < currentPrompt.length) {
        timeout = setTimeout(() => {
          setPlaceholder(currentPrompt.slice(0, charIdx + 1));
          setCharIdx((prev) => prev + 1);
        }, 36);
      } else {
        // Pause at full text
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2400);
      }
    } else {
      if (charIdx > 0) {
        timeout = setTimeout(() => {
          setPlaceholder(currentPrompt.slice(0, charIdx - 1));
          setCharIdx((prev) => prev - 1);
        }, 18);
      } else {
        // Paused at empty, advance to next prompt and pause briefly
        setIsDeleting(false);
        setPromptIdx((prev) => (prev + 1) % SEASONAL_TYPEWRITER_PROMPTS.length);
        timeout = setTimeout(() => {}, 400);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, promptIdx, value]);

  return (
    <textarea
      rows={rows}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
    />
  );
}

export interface HeroAnimationProps {
  className?: string;
}

export default function Hero({ className = "" }: HeroAnimationProps = {}) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Left Floating Template Card Scroll Parallax Transforms:
  const leftY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const leftRotate = useTransform(scrollYProgress, [0, 1], [-7, 0]);
  const leftFade = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.9, 0]);
  const leftScale = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.95, 0.9]);

  // Right Floating Template Card Scroll Parallax Transforms:
  const rightY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const rightRotate = useTransform(scrollYProgress, [0, 1], [7, 0]);
  const rightFade = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.9, 0]);
  const rightScale = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.95, 0.9]);

  // Center AI Event Builder Card Depth & Subtle Scale:
  const centerScale = useTransform(scrollYProgress, [0, 1], [1, 0.98]);
  const centerPerspectiveY = useTransform(scrollYProgress, [0, 1], [0, -12]);

  const { user } = useAuth();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAuthAction, setPendingAuthAction] = useState<"ai" | "upload" | null>(null);

  // Tab 0: AI Create (Active by default)
  const [activeTab, setActiveTab] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiEventData, setAiEventData] = useState<any | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);

  // Tab 1: Template states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [templates, setTemplates] = useState<Template[]>(fallbackTemplates);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplateId);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const templateGridRef = useRef<HTMLDivElement>(null);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Tab 2: Upload Existing states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cleanedPreviewUrl, setCleanedPreviewUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"cleaned" | "original">("cleaned");
  const [detectedTextLayers, setDetectedTextLayers] = useState<any[]>([]);
  const [extractedCardBgColor, setExtractedCardBgColor] = useState<string>("#FAF4E8");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isExtractingAI, setIsExtractingAI] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadVenue, setUploadVenue] = useState("");
  const [uploadDate, setUploadDate] = useState("");
  const [uploadTime, setUploadTime] = useState("");

  const filteredTemplates = useMemo(() => {
    const list = templates.length > 0 ? templates : fallbackTemplates;
    return sortTemplatesByPriority(
      list.filter(
        (t) => matchesCategory(t, selectedCategory)
      )
    );
  }, [templates, selectedCategory]);

  const displayedTemplates = useMemo(() => {
    return filteredTemplates;
  }, [filteredTemplates]);

  const handleTemplateScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 60) {
      if (visibleCount < filteredTemplates.length) {
        setVisibleCount((prev) => Math.min(prev + 18, filteredTemplates.length));
      }
    }
  };

  // Reveal the complete unified template list inside this tab instead of navigating away
  const handleViewAllTemplates = () => {
    setSelectedCategory("All");
    setVisibleCount(Number.MAX_SAFE_INTEGER);
    templateGridRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const quickPrompts = [
    {
      label: "🎃 Halloween Haunted House & Costume Bash",
      promptText: "Plan a spooky Halloween haunted house party for 40 guests with Victorian gothic decor, fog machines, themed cocktails, scary trivia, and a costume contest.",
    },
    {
      label: "🦃 Cozy Friendsgiving & Thanksgiving Harvest Dinner",
      promptText: "Organize a warm Thanksgiving harvest dinner for 20 guests with rustic autumn table settings, roast turkey feast, spiced cider, and a gratitude toast.",
    },
  ];

  // Fetch dynamic templates from backend API, merging with fallback templates
  useEffect(() => {
    let isMounted = true;
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      setErrorMsg(null);
      try {
        const data = await templateService.getTemplates(true);
        if (!isMounted) return;
        const mergedMap = new Map<string, Template>();
        // Add dynamic/backend templates first so newly added admin templates appear at the top
        if (data && data.length > 0) {
          data.forEach((t) => mergedMap.set(String(t.id).toLowerCase(), t));
        }
        // Merge fallback templates deduplicating by ID (case-insensitive)
        fallbackTemplates.forEach((t) => {
          if (!mergedMap.has(String(t.id).toLowerCase())) {
            mergedMap.set(String(t.id).toLowerCase(), t);
          }
        });
        const combined = Array.from(mergedMap.values());
        setTemplates(combined);
        if (combined.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(combined[0].id);
        }
      } catch (err: any) {
        console.error("Failed to load templates:", err);
        if (isMounted) {
          setTemplates(fallbackTemplates);
        }
      } finally {
        if (isMounted) {
          setLoadingTemplates(false);
        }
      }
    };
    fetchTemplates();

    return () => {
      isMounted = false;
    };
  }, []);

  // Restore pending template selection and draft data on login
  useEffect(() => {
    if (user) {
      try {
        const pendingId = sessionStorage.getItem("pending_template_id") || localStorage.getItem("pending_template_id");
        if (pendingId) {
          setSelectedTemplateId(pendingId);
          sessionStorage.removeItem("pending_template_id");
          sessionStorage.removeItem("pending_template_name");
          localStorage.removeItem("pending_template_id");
          localStorage.removeItem("pending_template_name");
        }
        const pendingPrompt = sessionStorage.getItem("pending_prompt");
        if (pendingPrompt) {
          setPrompt(pendingPrompt);
          sessionStorage.removeItem("pending_prompt");
        }
      } catch (e) {
        console.warn("Error restoring pending data:", e);
      }
    }
  }, [user]);

  const handleSelectTemplate = (tpl: Template) => {
    setSelectedTemplateId(tpl.id);
    try {
      localStorage.setItem("pending_template_id", tpl.id);
      localStorage.setItem("pending_template_name", tpl.name);
      sessionStorage.setItem("pending_template_id", tpl.id);
      sessionStorage.setItem("pending_template_name", tpl.name);
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      try {
        sessionStorage.setItem("pending_prompt", prompt.trim());
      } catch (e) {}
      setPendingAuthAction("ai");
      setIsAuthModalOpen(true);
      return;
    }

    if (!prompt.trim()) {
      setErrorMsg("Please provide a description of your event.");
      return;
    }

    setGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setAiEventData(null);

    try {
      const res = await API.post("/ai/generate-event-template", {
        userPrompt: prompt.trim(),
        eventType: "Event",
        title: prompt.trim().substring(0, 80),
        date: new Date().toISOString().split("T")[0],
        venue: "Venue",
      });

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
        setTimeout(() => {
          router.push(studioUrl);
        }, 800);
      } else {
        setErrorMsg(res.data?.error || "Failed to generate template. Please try again.");
      }
    } catch (err: any) {
      console.error("AI Template Generation Failed:", err.response?.data || err.message || err);
      const errorMsg = getApiErrorMessage(err);

      if (
        err.response?.status === 429 ||
        err.response?.status === 504 ||
        (typeof errorMsg === "string" && (
          errorMsg.toLowerCase().includes("busy") ||
          errorMsg.toLowerCase().includes("rate limit") ||
          errorMsg.toLowerCase().includes("too many") ||
          errorMsg.toLowerCase().includes("timed out")
        ))
      ) {
        setErrorMsg("AI service is temporarily busy. Please try again in a moment.");
      } else if (err.response?.status === 404) {
        setErrorMsg("AI endpoint not found. Please check the server configuration.");
      } else if (err.response?.status >= 500) {
        setErrorMsg(errorMsg || "AI service encountered an error. Please try again later.");
      } else {
        setErrorMsg(errorMsg || "Failed to generate template. Please check Replicate configuration.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAiEvent = async () => {
    if (!aiEventData) return;

    if (!user) {
      try {
        const guestDraft = {
          type: "ai",
          aiEventData,
        };
        localStorage.setItem("guestEventDraft", JSON.stringify(guestDraft));
      } catch (e) {}
      setSuccessMsg("🎉 Opening Invitation Designer...");
      setTimeout(() => {
        router.push("/canvas?guest=true");
      }, 500);
      return;
    }

    // If already saved to database via the AI endpoint
    if (aiEventData.event?.id) {
      setSavingEvent(true);
      setSuccessMsg("🎉 Opening Invitation Designer...");
      setTimeout(() => {
        router.push(`/dashboard/invitations?eventId=${aiEventData.event.id}`);
      }, 500);
      return;
    }

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

      const selectedTime = "18:00";
      const eventDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const res = await eventService.createEvent({
        title: aiEventData.title || "AI Generated Event",
        description: formattedDescription,
        venue: "TBD Venue",
        eventDate,
        eventTime: selectedTime,
        eventType: "Other",
        status: "draft",
      });

      if (res && res.success) {
        const eventId = res.event?.id;
        setSuccessMsg("🎉 Event created successfully! Opening Invitation Designer...");
        setAiEventData(null);
        setPrompt("");
        setTimeout(() => {
          router.push(eventId ? `/dashboard/invitations?eventId=${eventId}` : "/dashboard/invitations");
        }, 800);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || "Failed to save event to dashboard.");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleCreateFromTemplate = async (tplToUse?: Template) => {
    if (creatingEvent) return;
    const allTemplates = templates.length > 0 ? templates : fallbackTemplates;
    const targetTpl = tplToUse || allTemplates.find((t) => t.id === selectedTemplateId) || allTemplates[0];
    const targetTplId = targetTpl?.id || selectedTemplateId || "tpl-abstract-nature-party";

    if (!user) {
      try {
        const guestDraft = {
          type: "template",
          templateId: targetTplId,
          templateName: targetTpl?.name || "Event",
        };
        localStorage.setItem("guestEventDraft", JSON.stringify(guestDraft));
      } catch (e) {}
      router.push(`/studio?templateId=${encodeURIComponent(targetTplId)}`);
      return;
    }

    setCreatingEvent(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const finalTitle = targetTpl?.name || "Special Celebration";
      const finalVenue = getDefaultVenueForTemplate(targetTpl);
      const finalDate = getDefaultEventDate();
      const finalTime = getDefaultEventTime();

      const res = await eventService.createEvent({
        title: finalTitle,
        venue: finalVenue,
        eventDate: finalDate,
        eventTime: finalTime,
        eventType: targetTpl?.category || "Other",
        // @ts-ignore
        templateId: targetTplId,
        selectedTemplateId: targetTplId,
      });

      if (res && res.success) {
        const eventId = res.event?.id;
        setSuccessMsg("🎉 Event created successfully from template! Opening Invitation Designer...");
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("pending_template_id", targetTplId);
            localStorage.setItem("pending_template_id", targetTplId);
          } catch (e) {}
        }
        setTimeout(() => {
          const targetUrl = eventId
            ? `/studio?templateId=${encodeURIComponent(targetTplId)}&eventId=${eventId}`
            : `/studio?templateId=${encodeURIComponent(targetTplId)}`;
          router.push(targetUrl);
        }, 600);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || "Failed to create event from template.");
    } finally {
      setCreatingEvent(false);
    }
  };

  // Tab 2: Upload Existing handlers
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!user) {
      setPendingAuthAction("upload");
      setIsAuthModalOpen(true);
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      setPendingAuthAction("upload");
      setIsAuthModalOpen(true);
      return;
    }
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  // Helper to safely downscale large mobile camera photos (< 800KB) so sessionStorage doesn't overflow
  const createSafeDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = (e.target?.result as string) || "";
        if (!result) return resolve("");
        if (result.length < 750 * 1024) {
          return resolve(result);
        }
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const maxDim = 1200;
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL("image/jpeg", 0.85);
              return resolve(compressed);
            }
          } catch (scaleErr) {
            console.warn("Canvas compression fallback:", scaleErr);
          }
          resolve(result);
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const safeSetSessionStorage = (key: string, value: string) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (err) {
      console.warn(`sessionStorage write failed for ${key}:`, err);
      try {
        sessionStorage.removeItem("pending_upload_invite");
        sessionStorage.setItem(key, value);
      } catch (retryErr) {
        console.warn("sessionStorage retry failed:", retryErr);
      }
    }
  };

  const handleFileSelection = async (file: File) => {
    setUploadError(null);
    setErrorMsg(null);

    if (!file) return;

    // 1. Format validation (Supporting mobile formats: HEIC, HEIF, WEBP, PNG, JPG, JPEG, SVG, AVIF, and PDF)
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/heic",
      "image/heif",
      "image/avif",
      "image/gif",
      "image/svg+xml",
      "application/pdf",
    ];
    const extension = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["png", "jpg", "jpeg", "webp", "heic", "heif", "avif", "gif", "svg", "pdf"];

    const isValidType =
      file.type.startsWith("image/") ||
      file.type === "application/pdf" ||
      validTypes.includes(file.type) ||
      (extension && validExtensions.includes(extension));

    if (!isValidType) {
      setUploadError("Unsupported file format. Please upload an image (PNG, JPG, WEBP, HEIC, etc.) or PDF file.");
      return;
    }

    // 2. Size limit validation (15MB)
    const maxBytes = 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`File size exceeds 15MB limit (File is ${formatFileSize(file.size)}). Please choose a smaller file.`);
      return;
    }

    setIsUploading(true);

    // Default title from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const words = cleanName.split(" ").filter(Boolean);
    const formattedTitle = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    setUploadTitle(formattedTitle || "Celebration Invitation");

    const isImage =
      file.type.startsWith("image/") ||
      ["png", "jpg", "jpeg", "webp", "heic", "heif", "avif", "gif", "svg"].includes(extension || "");

    if (isImage) {
      try {
        // Compress and format normalize mobile camera and high-res images (max 1200px, quality 0.8)
        const { file: compressedFile, dataUrl } = await compressAndNormalizeImage(file, {
          maxDimension: 1200,
          quality: 0.8,
          maxSizeBytes: 1.5 * 1024 * 1024,
        });

        setUploadedFile(compressedFile);
        setPreviewUrl(dataUrl);

        // Automatically trigger Replicate inpainting & OCR scanning
        scanInvitationWithAI(dataUrl);

        // If user is authenticated, pre-upload for permanent URL
        if (user) {
          try {
            const uploadRes = await templateService.uploadTemplateImage(compressedFile, compressedFile.name);
            if (uploadRes && uploadRes.success && uploadRes.url) {
              setPreviewUrl(uploadRes.url);
            }
          } catch (uploadErr) {
            console.warn("[Hero] Immediate cloud pre-upload fallback:", uploadErr);
          }
        }
      } catch (e) {
        console.warn("Failed to generate compressed image preview:", e);
        setUploadedFile(file);
      } finally {
        setIsUploading(false);
      }
    } else {
      // PDF file
      setUploadedFile(file);
      setPreviewUrl(null);
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setUploadedFile(null);
    setPreviewUrl(null);
    setCleanedPreviewUrl(null);
    setPreviewMode("cleaned");
    setDetectedTextLayers([]);
    setUploadError(null);
    setUploadTitle("");
    setUploadVenue("");
    setUploadDate("");
    setUploadTime("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const scanInvitationWithAI = async (imageDataUri: string) => {
    if (!imageDataUri) return;
    setIsExtractingAI(true);
    setUploadError(null);
    try {
      const res = await API.post("/ai/scan-invitation", { imageBase64: imageDataUri });
      const data = res.data;
      if (data) {
        if (data.title) setUploadTitle(data.title);
        if (data.venue) setUploadVenue(data.venue);
        if (data.date) setUploadDate(data.date);
        if (data.time) setUploadTime(data.time);
        if (data.cardBgColor) setExtractedCardBgColor(data.cardBgColor);

        if (Array.isArray(data.textBlocks) && data.textBlocks.length > 0) {
          setDetectedTextLayers(data.textBlocks);
        }

        if (data.cleanedImageBase64) {
          setCleanedPreviewUrl(data.cleanedImageBase64);
          setPreviewMode("cleaned");
          setSuccessMsg("✨ Replicate AI erased invitation text & extracted editable typography layers!");
        } else {
          setSuccessMsg("✨ Extracted invitation details and typography!");
        }
      }
    } catch (err: any) {
      console.warn("AI invitation scan warning:", err);
      // Non-blocking: allows continuing standard upload
    } finally {
      setIsExtractingAI(false);
    }
  };

  const handleOpenInDesigner = async () => {
    if (!uploadedFile && !previewUrl && !cleanedPreviewUrl) {
      setUploadError("Please select an invitation file first.");
      return;
    }

    setIsUploading(true);
    const bgToUse = (previewMode === "cleaned" && cleanedPreviewUrl)
      ? cleanedPreviewUrl
      : (cleanedPreviewUrl || previewUrl || "");

    let resolvedPersistentUrl = bgToUse;

    // If needed and user is authenticated, upload original if no cleaned image
    if (user && uploadedFile && !cleanedPreviewUrl && (!resolvedPersistentUrl || resolvedPersistentUrl.startsWith("data:") || resolvedPersistentUrl.startsWith("blob:"))) {
      try {
        const uploadRes = await templateService.uploadTemplateImage(uploadedFile, uploadedFile.name);
        if (uploadRes && uploadRes.success && uploadRes.url) {
          resolvedPersistentUrl = uploadRes.url;
        }
      } catch (upErr) {
        console.warn("Pre-upload in designer handoff fallback:", upErr);
      }
    }

    const typographyLayers = (detectedTextLayers && detectedTextLayers.length > 0)
      ? detectedTextLayers.map((block: any, idx: number) => ({
          id: `replicate-layer-${idx}`,
          role: block.role || "other",
          text: block.text || "",
          x: block.x !== undefined ? (block.x > 1 ? block.x : Math.round(block.x * 100)) : 50,
          y: block.y !== undefined ? (block.y > 1 ? block.y : Math.round(block.y * 100)) : (20 + idx * 10),
          fontSize: block.fontSize || (block.role === "title" ? 32 : 16),
          fontFamily: block.fontFamily || "Inter",
          color: block.color || "#1E293B",
        }))
      : [];

    const stationeryPayload = {
      cardBgColor: extractedCardBgColor || "#FAF4E8",
      backgroundImage: resolvedPersistentUrl || bgToUse || "",
      cleanedImageUrl: cleanedPreviewUrl || "",
      originalImageUrl: previewUrl || "",
      textLayers: typographyLayers,
      textElements: typographyLayers,
    };

    // For guests: store consolidated draft and route directly
    if (!user) {
      try {
        const guestDraft: any = {
          type: "upload",
          uploadUrl: resolvedPersistentUrl || bgToUse || "",
          uploadName: uploadedFile?.name || "",
          uploadType: uploadedFile?.type || "",
          uploadTitle: uploadTitle || "",
          backgroundImage: resolvedPersistentUrl || bgToUse || "",
          cleanedImageUrl: cleanedPreviewUrl || "",
          originalImageUrl: previewUrl || "",
          stationeryDesign: stationeryPayload,
        };
        localStorage.setItem("guestEventDraft", JSON.stringify(guestDraft));
        sessionStorage.setItem("guestEventDraft", JSON.stringify(guestDraft));

        const finalBg = resolvedPersistentUrl || bgToUse || "";
        if (finalBg) {
          safeSetSessionStorage("pending_upload_invite", finalBg);
          try { localStorage.setItem("pending_upload_invite", finalBg); } catch (_) {}
        }
        safeSetSessionStorage("pending_stationery_design", JSON.stringify(stationeryPayload));
        try { localStorage.setItem("pending_stationery_design", JSON.stringify(stationeryPayload)); } catch (_) {}
      } catch (e) {}
      setIsUploading(false);
      const queryImg = (resolvedPersistentUrl && !resolvedPersistentUrl.startsWith("data:"))
        ? `&uploadedImageUrl=${encodeURIComponent(resolvedPersistentUrl)}`
        : "";
      router.push(`/canvas?guest=true${queryImg}`);
      return;
    }

    try {
      const finalBg = resolvedPersistentUrl || bgToUse || "";
      if (finalBg) {
        safeSetSessionStorage("pending_upload_invite", finalBg);
        try { localStorage.setItem("pending_upload_invite", finalBg); } catch (_) {}
      }
      if (uploadedFile) {
        safeSetSessionStorage("pending_upload_name", uploadedFile.name);
        safeSetSessionStorage("pending_upload_type", uploadedFile.type);
      }
      if (uploadTitle) {
        safeSetSessionStorage("pending_upload_title", uploadTitle);
      }
      try {
        sessionStorage.removeItem("pending_template_id");
        localStorage.removeItem("pending_template_id");
      } catch (_) {}

      // Always pass the full stationeryPayload with backgroundImage and typography layers
      safeSetSessionStorage("pending_stationery_design", JSON.stringify(stationeryPayload));
      try { localStorage.setItem("pending_stationery_design", JSON.stringify(stationeryPayload)); } catch (_) {}
    } catch (e) {
      console.error("Failed to store pending upload:", e);
    } finally {
      setIsUploading(false);
    }

    setSuccessMsg("Opening invitation designer...");
    const queryImg = (resolvedPersistentUrl && !resolvedPersistentUrl.startsWith("data:"))
      ? `&uploadedImageUrl=${encodeURIComponent(resolvedPersistentUrl)}`
      : "";
    setTimeout(() => {
      router.push(`/dashboard/invitations?studio=true${queryImg}`);
    }, 500);
  };

  const handleUploadAndCreateEvent = async () => {
    if (!uploadedFile && !previewUrl && !cleanedPreviewUrl) {
      setUploadError("Please select an invitation file first.");
      return;
    }

    if (!user) {
      await handleOpenInDesigner();
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setSuccessMsg(null);

    const bgToUse = (previewMode === "cleaned" && cleanedPreviewUrl)
      ? cleanedPreviewUrl
      : (cleanedPreviewUrl || previewUrl || "");

    const titleToUse = uploadTitle?.trim() || "Uploaded Invitation";
    const venueToUse = uploadVenue?.trim() || "Celebration Venue";
    const dateToUse = uploadDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const timeToUse = uploadTime || "18:00";

    try {
      let res;
      if (cleanedPreviewUrl) {
        res = await eventService.createEvent({
          title: titleToUse,
          venue: venueToUse,
          eventDate: dateToUse,
          eventTime: timeToUse,
          eventType: "Uploaded Invitation",
          coverImage: cleanedPreviewUrl,
        });
      } else if (uploadedFile) {
        const formData = new FormData();
        formData.append("title", titleToUse);
        formData.append("venue", venueToUse);
        formData.append("eventDate", dateToUse);
        formData.append("eventTime", timeToUse);
        formData.append("eventType", "Uploaded Invitation");
        formData.append("coverImage", uploadedFile);
        formData.append("imageUrl", uploadedFile);
        res = await eventService.createEvent(formData);
      } else {
        res = await eventService.createEvent({
          title: titleToUse,
          venue: venueToUse,
          eventDate: dateToUse,
          eventTime: timeToUse,
          eventType: "Uploaded Invitation",
          coverImage: previewUrl || undefined,
        });
      }

      if (res && res.success) {
        const createdImage = res.event?.coverImage || res.event?.imageUrl || bgToUse;
        if (createdImage) {
          safeSetSessionStorage("pending_upload_invite", createdImage);
          try { localStorage.setItem("pending_upload_invite", createdImage); } catch (_) {}
          try {
            sessionStorage.removeItem("pending_template_id");
            localStorage.removeItem("pending_template_id");
          } catch (_) {}
        }

        const typographyLayers = (detectedTextLayers && detectedTextLayers.length > 0)
          ? detectedTextLayers.map((block: any, idx: number) => ({
              id: `replicate-layer-${idx}`,
              role: block.role || "other",
              text: block.text || "",
              x: block.x !== undefined ? (block.x > 1 ? block.x : Math.round(block.x * 100)) : 50,
              y: block.y !== undefined ? (block.y > 1 ? block.y : Math.round(block.y * 100)) : (20 + idx * 10),
              fontSize: block.fontSize || (block.role === "title" ? 32 : 16),
              fontFamily: block.fontFamily || "Inter",
              color: block.color || "#1E293B",
            }))
          : [];

        const stationeryPayload = {
          cardBgColor: extractedCardBgColor || "#FAF4E8",
          backgroundImage: createdImage || bgToUse,
          cleanedImageUrl: cleanedPreviewUrl || "",
          originalImageUrl: previewUrl || "",
          textLayers: typographyLayers,
          textElements: typographyLayers,
        };
        safeSetSessionStorage("pending_stationery_design", JSON.stringify(stationeryPayload));
        try { localStorage.setItem("pending_stationery_design", JSON.stringify(stationeryPayload)); } catch (_) {}

        const eventId = res.event?.id;
        const queryImg = (createdImage && !createdImage.startsWith("data:"))
          ? `&uploadedImageUrl=${encodeURIComponent(createdImage)}`
          : "";
        setSuccessMsg("🎉 Event created successfully! Opening Invitation Designer...");
        setTimeout(() => {
          router.push(eventId ? `/dashboard/invitations?eventId=${eventId}&studio=true${queryImg}` : `/dashboard/invitations?studio=true${queryImg}`);
        }, 800);
      } else {
        setUploadError(res?.message || "Failed to create event from uploaded invitation.");
      }
    } catch (err: any) {
      console.error("Create Event with Upload Error:", err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to create event from uploaded invitation.";
      setUploadError(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleExtractDetailsAI = () => {
    const targetUrl = previewUrl || (uploadedFile ? URL.createObjectURL(uploadedFile) : "");
    if (!targetUrl) return;
    scanInvitationWithAI(targetUrl);
  };

  return (
    <section
      ref={heroRef}
      className={`relative overflow-hidden min-h-[85vh] py-10 md:py-16 px-2 sm:px-4 flex flex-col justify-center items-center bg-transparent will-change-transform ${className}`}
    >

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-2 sm:px-4 md:px-6 flex flex-col justify-center items-center">
        {/* Main Heading */}
        <AnimatedHeading>
          <h1
            className="font-normal font-serif tracking-tight text-3xl sm:text-4xl lg:text-5xl text-center leading-tight bg-gradient-to-r from-[#4C75F2] via-[#1D77F3] to-[#00A3FF] bg-clip-text text-transparent pb-1 md:whitespace-nowrap"
            style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.6rem, 3.5vw, 3.2rem)" }}
          >
            Create Any Event in Under 60 Seconds
          </h1>
        </AnimatedHeading>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed text-center max-w-2xl mx-auto mt-3 mb-8">
          Invitations, RSVPs, Ticketing, Check-In, Guest<br className="hidden sm:inline" />{" "}
          Management and AI Planning — all in one platform.
        </p>

        {/* Central Hero Card Container with Side Floating Cards */}
        <div className="relative w-full mx-auto max-w-xl lg:max-w-2xl xl:max-w-3xl z-10 [perspective:1200px]">
          {/* Left Side Floating Card (Haunted House Party) with Parallax Scroll & Floating Motion */}
          <motion.div
            style={{
              y: leftY,
              opacity: leftFade,
              scale: leftScale,
            }}
            className="hidden lg:block absolute top-6 right-full mr-2 lg:mr-3 xl:mr-5 2xl:mr-7 z-20 will-change-transform select-none"
          >
            <motion.div
              variants={leftCardVariants}
              animate="animate"
              whileHover={{ scale: 1.05, y: -4, transition: { duration: 0.25 } }}
              className="w-40 lg:w-44 xl:w-52 2xl:w-60 aspect-[3/4.2] flex flex-col justify-between p-3.5 sm:p-4 lg:p-4.5 xl:p-5 rounded-2xl shadow-xl border border-white/20 overflow-hidden text-left relative cursor-pointer transition-shadow duration-300 hover:shadow-2xl group"
              style={{
                background: "linear-gradient(160deg, #0C0906 0%, #1A140D 42%, #241A11 74%, #0A0705 100%)",
                boxShadow: "0 25px 50px -12px rgba(76, 29, 149, 0.65), 0 0 28px rgba(255, 138, 0, 0.4)",
              }}
              onClick={() => {
                setPrompt("Plan a spooky Halloween haunted house party for 40 guests with Victorian gothic decor, fog machines, themed cocktails, scary trivia, and a costume contest.");
              }}
              title="Click to use Haunted House party prompt"
            >
            {/* Sepia gothic overlay: glowing full moon, clouds, bats & Victorian haunted mansion */}
            <svg
              aria-hidden="true"
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 180 250"
              fill="none"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="hhSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#17110A" />
                  <stop offset="48%" stopColor="#241B11" />
                  <stop offset="100%" stopColor="#0A0705" />
                </linearGradient>
                <radialGradient id="hhMoonGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F6EBD2" stopOpacity="0.8" />
                  <stop offset="55%" stopColor="#E4D2A8" stopOpacity="0.26" />
                  <stop offset="100%" stopColor="#E4D2A8" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="hhMoon" cx="38%" cy="34%" r="72%">
                  <stop offset="0%" stopColor="#FCF6E6" />
                  <stop offset="60%" stopColor="#EADFC2" />
                  <stop offset="100%" stopColor="#C9B892" />
                </radialGradient>
                <radialGradient id="hhVignette" cx="50%" cy="45%" r="72%">
                  <stop offset="55%" stopColor="#000000" stopOpacity="0" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
                </radialGradient>
                <radialGradient id="hhWindowGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E9C87F" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#E9C87F" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Sepia night sky */}
              <rect width="180" height="250" fill="url(#hhSky)" />

              {/* Cloud bands drifting across the sky */}
              <g fill="#0E0B07">
                <ellipse cx="54" cy="30" rx="48" ry="9" opacity="0.75" />
                <ellipse cx="124" cy="20" rx="52" ry="8" opacity="0.7" />
                <ellipse cx="28" cy="80" rx="40" ry="7" opacity="0.6" />
                <ellipse cx="146" cy="70" rx="46" ry="7" opacity="0.55" />
              </g>

              {/* Glowing full moon */}
              <circle cx="46" cy="56" r="44" fill="url(#hhMoonGlow)" />
              <circle cx="46" cy="56" r="25" fill="url(#hhMoon)" />
              <circle cx="38" cy="49" r="4.6" fill="#D6C9A5" opacity="0.55" />
              <circle cx="56" cy="63" r="3.4" fill="#D6C9A5" opacity="0.5" />
              <circle cx="51" cy="45" r="2.3" fill="#D6C9A5" opacity="0.45" />
              <ellipse cx="62" cy="68" rx="34" ry="5" fill="#100C08" opacity="0.7" />

              {/* Bats flying overhead */}
              <g fill="#080503">
                <path
                  transform="translate(98, 38)"
                  d="M0 -3 C-1.6 -5.6 -4.6 -5.2 -6.2 -2.8 C-8.4 -5.2 -12.2 -4.6 -13.6 -1.8 C-11.2 -1.2 -10 0.6 -8 0.2 C-6.4 2.4 -3.6 3.6 -1.8 2.4 L0 4 L1.8 2.4 C3.6 3.6 6.4 2.4 8 0.2 C10 0.6 11.2 -1.2 13.6 -1.8 C12.2 -4.6 8.4 -5.2 6.2 -2.8 C4.6 -5.2 1.6 -5.6 0 -3 Z"
                />
                <path
                  transform="translate(132, 56) scale(0.68)"
                  d="M0 -3 C-1.6 -5.6 -4.6 -5.2 -6.2 -2.8 C-8.4 -5.2 -12.2 -4.6 -13.6 -1.8 C-11.2 -1.2 -10 0.6 -8 0.2 C-6.4 2.4 -3.6 3.6 -1.8 2.4 L0 4 L1.8 2.4 C3.6 3.6 6.4 2.4 8 0.2 C10 0.6 11.2 -1.2 13.6 -1.8 C12.2 -4.6 8.4 -5.2 6.2 -2.8 C4.6 -5.2 1.6 -5.6 0 -3 Z"
                />
                <path
                  transform="translate(72, 104) scale(0.5)"
                  d="M0 -3 C-1.6 -5.6 -4.6 -5.2 -6.2 -2.8 C-8.4 -5.2 -12.2 -4.6 -13.6 -1.8 C-11.2 -1.2 -10 0.6 -8 0.2 C-6.4 2.4 -3.6 3.6 -1.8 2.4 L0 4 L1.8 2.4 C3.6 3.6 6.4 2.4 8 0.2 C10 0.6 11.2 -1.2 13.6 -1.8 C12.2 -4.6 8.4 -5.2 6.2 -2.8 C4.6 -5.2 1.6 -5.6 0 -3 Z"
                />
              </g>

              {/* Victorian haunted mansion silhouette */}
              <g fill="#070402">
                <polygon points="30,132 51,98 72,132" />
                <rect x="40" y="132" width="22" height="86" />
                <polygon points="110,138 129,106 148,138" />
                <rect x="118" y="138" width="22" height="80" />
                <polygon points="56,154 90,124 124,154" />
                <rect x="60" y="154" width="60" height="64" />
                <rect x="86" y="196" width="12" height="22" />
              </g>
              {/* Lit windows + porch glow */}
              <g fill="#E9C87F">
                <rect x="47" y="146" width="7" height="9" opacity="0.85" />
                <rect x="126" y="152" width="7" height="9" opacity="0.8" />
                <rect x="69" y="166" width="7" height="9" opacity="0.75" />
                <rect x="98" y="166" width="7" height="9" opacity="0.7" />
                <rect x="69" y="184" width="7" height="9" opacity="0.6" />
                <rect x="98" y="184" width="7" height="9" opacity="0.65" />
                <rect x="88" y="200" width="8" height="18" opacity="0.75" />
              </g>
              <circle cx="90" cy="208" r="26" fill="url(#hhWindowGlow)" opacity="0.5" />

              {/* Fog rolling at the base */}
              <g fill="#C9B48A">
                <ellipse cx="40" cy="224" rx="46" ry="7" opacity="0.14" />
                <ellipse cx="132" cy="230" rx="52" ry="8" opacity="0.12" />
                <ellipse cx="86" cy="240" rx="70" ry="9" opacity="0.1" />
              </g>

              {/* Ground */}
              <rect x="0" y="218" width="180" height="32" fill="#060402" />

              {/* Sepia vignette */}
              <rect width="180" height="250" fill="url(#hhVignette)" />
            </svg>

            {/* Badge row */}
            <div className="relative flex justify-between items-center w-full z-10">
              <span className="inline-flex items-center text-[9px] sm:text-[10px] font-extrabold px-2.5 py-1 tracking-[0.14em] uppercase text-[#1E1B4B] bg-orange-400 rounded-full border border-orange-200/80 shadow-[0_0_14px_rgba(255,138,0,0.7)]">
                PREMIUM
              </span>
              <div className="w-6 h-6 rounded-full bg-orange-400/90 border border-orange-200/70 flex items-center justify-center backdrop-blur-sm shadow-[0_0_14px_rgba(255,138,0,0.7)]">
                <Sparkles className="w-3.5 h-3.5 text-[#1E1B4B]" />
              </div>
            </div>

            {/* Center content */}
            <div className="relative my-auto z-10">
              <div className="text-[9px] sm:text-[10px] text-[#E8DCC0]/90 leading-none uppercase tracking-[0.2em] font-semibold">
                You&apos;re invited to a
              </div>
              <div
                className="text-[18px] sm:text-[21px] font-black uppercase text-white leading-[0.95] tracking-tight mt-1.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
                style={{
                  fontFamily: "'Arial Black', 'Impact', 'Haettenschweiler', sans-serif",
                  transform: "skewX(-5deg)",
                }}
              >
                Haunted House<br />Party
              </div>
              <div
                className="text-[8.5px] sm:text-[10px] text-white/90 leading-relaxed mt-2.5 font-semibold uppercase tracking-wide"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                October 18th at 7 PM
                <br />
                The Jackson Residence
              </div>
            </div>

            {/* Footer row */}
            <div className="relative text-[9px] sm:text-[10px] text-[#D9C7A4]/95 mt-auto pt-2 border-t border-white/20 z-10 uppercase tracking-wide flex items-center justify-between">
              <span>Haunted House Party</span>
              <span className="text-orange-400 font-bold">RSVP Now</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side Floating Card (Spooky Witch & Cauldron) with Parallax Scroll & Floating Motion */}
        <motion.div
          style={{
            y: rightY,
            opacity: rightFade,
            scale: rightScale,
          }}
          className="hidden lg:block absolute top-10 left-full ml-2 lg:ml-3 xl:ml-5 2xl:ml-7 z-20 will-change-transform select-none"
        >
          <motion.div
            variants={rightCardVariants}
            animate="animate"
            whileHover={{ scale: 1.05, y: -4, transition: { duration: 0.25 } }}
            className="w-40 lg:w-44 xl:w-52 2xl:w-60 aspect-[3/4.2] flex flex-col justify-between p-3.5 sm:p-4 lg:p-4.5 xl:p-5 rounded-2xl shadow-xl border border-white/20 overflow-hidden text-left relative cursor-pointer transition-shadow duration-300 hover:shadow-2xl group"
            style={{
              background: "#050302 url('/templates/halloween-feast-bg.png') center / cover no-repeat",
              boxShadow: "0 25px 50px -12px rgba(76, 29, 149, 0.6), 0 0 26px rgba(192, 132, 252, 0.45)",
            }}
            onClick={() => {
              setPrompt("Organize a festive Halloween feast & dinner party with eerie cocktail pairings, pumpkin carving, haunted mansion music, and wicked treats.");
            }}
            title="Click to use Halloween Feast party prompt"
          >
            {/* Artwork provided by /templates/halloween-feast-bg.png (spiderwebs, chandelier, cauldron & props) */}

            {/* Badge row */}
            <div className="relative flex justify-between items-center w-full z-10">
              <span className="inline-flex items-center text-[9px] sm:text-[10px] font-extrabold px-2.5 py-1 tracking-[0.14em] uppercase text-[#2E1065] bg-lime-300 rounded-full border border-lime-200/80 shadow-[0_0_14px_rgba(190,243,192,0.7)]">
                TRENDING
              </span>
              <div className="w-6 h-6 rounded-full bg-fuchsia-400/90 border border-fuchsia-200/70 flex items-center justify-center backdrop-blur-sm shadow-[0_0_14px_rgba(232,121,249,0.7)]">
                <Wand2 className="w-3.5 h-3.5 text-[#1A0533]" />
              </div>
            </div>

            {/* Center content */}
            <div className="relative my-auto z-10">
              <div
                className="text-[18px] sm:text-[21px] text-[#F7E9CC] leading-[1.05] tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: "italic",
                  fontWeight: 700,
                }}
              >
                Let&apos;s eat, drink,<br />&amp; be scary!
              </div>
              <div className="text-[8.5px] sm:text-[9.5px] text-white/90 leading-none uppercase tracking-[0.14em] font-semibold mt-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                You&apos;re invited to a spooky
                <br />
                Halloween party!
              </div>
              <div
                className="text-[8.5px] sm:text-[9.5px] text-[#F5C97E] leading-snug mt-2.5 font-semibold uppercase tracking-wide"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                Saturday, October 20th at 7 PM
              </div>
            </div>

            {/* Smooth dark bottom vignette to ensure footer text sits on rich seamless backdrop */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050302] via-[#050302]/80 to-transparent pointer-events-none z-0" />

            {/* Footer row */}
            <div className="relative text-[9px] sm:text-[10px] text-white/85 mt-auto pt-2 border-t border-white/20 z-10 uppercase tracking-wide flex items-center justify-between">
              <span>Spooky Halloween Party</span>
              <span className="text-lime-300 font-bold">RSVP Now</span>
            </div>
          </motion.div>
        </motion.div>

          {/* Central Interactive Hero Card */}
          <motion.div
            style={{
              scale: centerScale,
              y: centerPerspectiveY,
            }}
            className="bg-white rounded-3xl border border-gray-100 shadow-xl p-7 md:p-10 min-h-[400px] relative z-10 text-left will-change-transform"
          >
            {/* Tabs (Top of Card) */}
            <div className="grid grid-cols-3 gap-3 mb-6">
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
                    style={{ fontFamily: "Georgia, serif" }}
                    className={`flex items-center justify-center gap-2 py-3 px-3.5 rounded-2xl text-xs sm:text-sm font-serif font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#F0EEFF] text-[#6C5CE7] border border-[#DDD6FE] font-semibold shadow-sm"
                        : "bg-white text-gray-700 border border-gray-200/90 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#6C5CE7]" : "text-gray-500"}`} />
                    <span style={{ fontFamily: "Georgia, serif" }}>{tab.label}</span>
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
              <div className="space-y-4 sm:space-y-5">
                {/* Heading with Wand icon */}
                <div className="flex items-center justify-between text-gray-800">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-[#7C3AED]" />
                    <span className="font-semibold text-xs sm:text-sm font-serif" style={{ fontFamily: "Georgia, serif" }}>
                      Describe your event and let AI build it
                    </span>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                    <Sparkles className="w-3 h-3 text-[#7C3AED]" /> Seasonal Prompts
                  </span>
                </div>
                
                {/* Input Area (Middle of Card) */}
                <div 
                  className="relative bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all cursor-text min-h-[125px]"
                >
                  <SeasonalTypewriterTextarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    disabled={generating}
                    className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none resize-none pr-12 leading-relaxed min-h-[80px]"
                  />

                  {/* Circular Send Button on the right */}
                  <div className="absolute right-3.5 bottom-3.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerate();
                      }}
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
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  {quickPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPrompt(item.promptText);
                      }}
                      className="flex-1 text-left sm:text-center text-[11px] sm:text-xs font-medium px-4 py-2.5 rounded-full bg-[#F3F0FF] hover:bg-[#ECE8FF] text-gray-700 border border-[#E0D7FE] transition-all truncate cursor-pointer active:scale-95 flex items-center gap-1.5 justify-center hover:border-purple-300 hover:shadow-sm group"
                      title={item.promptText}
                    >
                      <span className="text-[#7C3AED] text-xs transition-transform group-hover:scale-125">✨</span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Bottom Action Button */}
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full mt-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#4C6FFF] to-[#00C0F9] hover:opacity-95 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 group"
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
                        onClick={() => {
                          setAiEventData(null);
                          setPrompt("");
                        }}
                        disabled={savingEvent}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      >
                        Create Another
                      </button>
                      <button
                        onClick={handleSaveAiEvent}
                        disabled={savingEvent}
                        className="flex-[2] py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#4C6FFF] to-[#00C0F9] hover:opacity-95 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-md shadow-blue-500/20"
                      >
                        {savingEvent ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Opening Designer...</span>
                          </>
                        ) : (
                          <>
                            <span>Open in Invitation Designer</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
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
                      <AnimatedHeading delay={0.05}>
                        <h3 className="text-xs sm:text-sm font-normal text-gray-900 font-serif" style={{ fontFamily: "Georgia, serif" }}>
                          Choose from editable templates
                        </h3>
                      </AnimatedHeading>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-[#F0EEFF] text-[#6C5CE7] border border-[#6C5CE7]/20">
                        {filteredTemplates.length} available
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleViewAllTemplates}
                      className="text-[11px] font-semibold text-[#6C5CE7] hover:text-[#5E35B1] hover:underline whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer group"
                    >
                      <span>View All Templates</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </button>
                  </div>
                  
                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {["All", "Halloween", "Wedding", "Baby Shower", "Corporate", "Birthday", "Networking"].map((cat) => {
                      const isSelected = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setVisibleCount(10);
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

                  {/* Templates Grid Container (Evite Style) */}
                  {loadingTemplates ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="w-5 h-5 border-2 border-[#6C5CE7]/30 border-t-[#6C5CE7] rounded-full animate-spin" />
                      <span className="text-xs text-gray-500 ml-3 font-medium">Loading templates...</span>
                    </div>
                  ) : (
                    <div 
                      ref={templateGridRef}
                      onScroll={handleTemplateScroll}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 max-h-[380px] sm:max-h-[440px] overflow-y-auto pr-1.5 pb-2 custom-scrollbar scrollbar-thin scrollbar-thumb-gray-300"
                    >
                      {displayedTemplates.map((tpl) => {
                        const isSelected = selectedTemplateId === tpl.id;
                        const imgUrl = getCardImageUrl(tpl);
                        const tplConfig = getTemplateConfig(tpl.id);
                        const badgeText = tplConfig?.badge || tpl.badge || ((tpl as any).isPremium ? "PREMIUM" : "FREE");
                        const isPremium = String(badgeText).toUpperCase() === "PREMIUM";
                        const isFav = favorites.has(tpl.id);

                        // Build comprehensive template design configuration to match Home page
                        const resolvedTemplate = tplConfig
                          ? {
                              ...tplConfig,
                              isLayered: Boolean(tpl.isLayered || (tplConfig as any).isLayered),
                              defaultTextLayers:
                                tplConfig.defaultTextLayers && tplConfig.defaultTextLayers.length > 0
                                  ? tplConfig.defaultTextLayers
                                  : tpl.defaultTextLayers && tpl.defaultTextLayers.length > 0
                                  ? tpl.defaultTextLayers
                                  : tplConfig.defaultTextLayers,
                              canvasData:
                                tplConfig.canvasData && tplConfig.canvasData.layers && tplConfig.canvasData.layers.length > 0
                                  ? tplConfig.canvasData
                                  : tpl.canvasData && tpl.canvasData.layers && tpl.canvasData.layers.length > 0
                                  ? tpl.canvasData
                                  : tplConfig.canvasData,
                            }
                          : {
                              id: tpl.id,
                              title: tpl.name,
                              category: tpl.category,
                              image: imgUrl,
                              isLayered: Boolean(tpl.isLayered),
                              canvasData: tpl.canvasData,
                              card: {
                                artworkUrl: imgUrl,
                                backgroundColor: "#FFFFFF",
                              },
                              defaultTextLayers:
                                tpl.defaultTextLayers && tpl.defaultTextLayers.length > 0
                                  ? tpl.defaultTextLayers
                                  : [
                                      {
                                        id: "title",
                                        key: "title",
                                        text: tpl.name,
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: 24,
                                        fontWeight: "700",
                                        color: "#111827",
                                        textAlign: "center",
                                        top: 40,
                                        left: 50,
                                      },
                                    ],
                            };

                        return (
                          <div
                            key={tpl.id}
                            onClick={() => {
                              handleSelectTemplate(tpl);
                              handleCreateFromTemplate(tpl);
                            }}
                            className={`group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border bg-white shadow-sm hover:shadow-xl ${
                              isSelected
                                ? "border-[#6C5CE7] ring-2 ring-[#6C5CE7]/30 -translate-y-0.5"
                                : "border-gray-200/90 hover:border-[#6C5CE7]/40 hover:-translate-y-0.5"
                            }`}
                          >
                            {/* Card Image Container: Portrait invitation ratio aspect-[3/4] */}
                            <div className="aspect-[3/4] w-full bg-gray-100 relative overflow-hidden">
                              {/* Pill Badge in Top-Left (Evite style) */}
                              <div className="absolute top-2 left-2 z-20">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase backdrop-blur-md shadow-xs border ${
                                  badgeText.toUpperCase() === "TRENDING"
                                    ? "bg-rose-500/90 text-white border-rose-400/90"
                                    : badgeText.toUpperCase() === "POPULAR"
                                    ? "bg-indigo-500/90 text-white border-indigo-400/90"
                                    : isPremium || badgeText.toUpperCase() === "FEATURED"
                                    ? "bg-[#FCFBF7]/95 text-[#967026] border-[#C5A059]"
                                    : "bg-white/90 text-gray-800 border-white/70"
                                }`}>
                                  {isPremium && <span aria-hidden>👑</span>}
                                  {isPremium ? "Premium" : badgeText}
                                </span>
                              </div>

                              {/* Selected Checkmark Badge */}
                              {isSelected ? (
                                <div className="absolute top-2 right-2 z-20 w-5 h-5 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center shadow-md">
                                  <Check className="w-3 h-3" strokeWidth={3} />
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(tpl.id);
                                  }}
                                  className="absolute top-2 right-2 z-30 w-7 h-7 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xs border border-white/70 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                  aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                                >
                                  <Heart
                                    className={`w-3.5 h-3.5 transition-colors ${isFav ? "fill-rose-500 text-rose-500" : "text-gray-500 hover:text-rose-500"}`}
                                  />
                                </button>
                              )}

                              {/* Invitation Card Visual Preview (Full vector styling, envelope, and artwork) */}
                              <div className="absolute inset-0 w-full h-full overflow-hidden bg-gray-50 flex items-center justify-center">
                                <EviteCardPreview
                                  template={resolvedTemplate}
                                  hoverScale={false}
                                  aspectRatio="full"
                                  className="w-full h-full"
                                  cardOnly={
                                    tpl.id !== "tpl-chic-dinner-cake" &&
                                    tpl.id !== "tpl-modern-gold-black-balloon" &&
                                    tpl.category !== "Bridal Shower" &&
                                    tpl.category !== "bridal_shower"
                                  }
                                />
                              </div>

                              {/* Hover overlay with Evite-style Customize pill button */}
                              <div className="absolute inset-0 z-20 bg-black/30 backdrop-blur-[0.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectTemplate(tpl);
                                    // Create the event from THIS template first so the canvas
                                    // opens against a real event that carries the exact
                                    // template id/canvasData (instead of a previous event).
                                    handleCreateFromTemplate(tpl);
                                  }}
                                  className="px-3.5 py-1.5 rounded-full bg-white text-[11px] font-bold text-gray-900 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer"
                                >
                                  <span>Customize</span>
                                  <ArrowRight className="w-3 h-3 text-[#6C5CE7]" />
                                </button>
                              </div>
                            </div>

                            {/* Card Footer: Clean typography */}
                            <div className="p-2.5 sm:p-3 bg-white">
                              <span className="text-[9px] sm:text-[10px] font-bold text-[#6C5CE7] uppercase tracking-wider block mb-0.5 truncate">
                                {tpl.category}
                              </span>
                              <h4 className="text-xs sm:text-[13px] font-bold text-gray-900 truncate leading-snug group-hover:text-[#6C5CE7] transition-colors" title={tpl.name}>
                                {tpl.name}
                              </h4>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Create Event Button */}
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleCreateFromTemplate()}
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
              <div className="space-y-4">
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif,image/avif,image/gif,image/svg+xml,image/*,application/pdf,.heic,.heif,.webp,.pdf,.png,.jpg,.jpeg"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Upload Error Banner */}
                {uploadError && (
                  <div className="flex items-start justify-between gap-2 p-3 text-xs font-medium bg-red-50/90 border border-red-200/80 text-red-700 rounded-xl transition-all">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>{uploadError}</span>
                    </div>
                    <button
                      onClick={() => setUploadError(null)}
                      className="text-red-500 hover:text-red-700 p-0.5 rounded cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Dropzone (When no file is selected) */}
                {!uploadedFile && (
                  <div
                    onClick={() => {
                      if (!user) {
                        setPendingAuthAction("upload");
                        setIsAuthModalOpen(true);
                        return;
                      }
                      fileInputRef.current?.click();
                    }}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`group border-2 border-dashed rounded-2xl p-7 sm:p-9 text-center transition-all duration-200 cursor-pointer select-none ${
                      isDragging
                        ? "border-[#6C5CE7] bg-[#F0EEFF]/80 ring-4 ring-[#6C5CE7]/20 scale-[1.01] shadow-md"
                        : "border-gray-200 hover:border-[#6C5CE7]/60 hover:bg-[#F0EEFF]/20 bg-[#F9FAFB]/60"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 transition-all duration-300 ${
                        isDragging
                          ? "bg-[#6C5CE7] text-white scale-110 animate-bounce"
                          : "bg-[#F0EEFF] text-[#6C5CE7] group-hover:scale-110 group-hover:bg-[#E4DFFF]"
                      }`}
                    >
                      <FileUp className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 font-serif" style={{ fontFamily: "Georgia, serif" }}>
                      {isDragging ? "Drop your file here to upload!" : "Drag & drop an existing invitation image or PDF"}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Supports PNG, JPG, WEBP, HEIC, or PDF up to 15MB
                    </p>
                    <div className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#6C5CE7] bg-white border border-[#DDD6FE] rounded-xl hover:bg-[#F0EEFF]/60 hover:border-[#6C5CE7] transition-all shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>or click to browse files</span>
                    </div>
                  </div>
                )}

                {/* File Selected Card & Actions */}
                {uploadedFile && (
                  <div className="border border-[#E4DFFF] bg-gradient-to-b from-white to-[#FDFBFF] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                    {/* Top Header Status & Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-normal text-gray-900 block leading-tight font-serif" style={{ fontFamily: "Georgia, serif" }}>
                            File Uploaded Successfully
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {uploadedFile.type === "application/pdf" ? "PDF Document" : "Image Invitation"} · {formatFileSize(uploadedFile.size)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#6C5CE7] bg-[#F0EEFF] hover:bg-[#E4DFFF] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          title="Change File"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span className="hidden sm:inline">Change</span>
                        </button>
                        <button
                          onClick={handleRemoveFile}
                          className="px-2.5 py-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          title="Remove File"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Replicate AI Inpainting / OCR Status Banner */}
                    {isExtractingAI && (
                      <div className="flex items-center gap-2.5 p-3 bg-gradient-to-r from-[#F0EEFF] to-[#FAF5FF] border border-[#DDD6FE] text-[#6C5CE7] rounded-xl text-xs font-semibold shadow-xs animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-[#6C5CE7] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold">✨ Replicate AI is erasing card text & separating layers...</p>
                          <p className="text-[11px] text-[#7C3AED]/80 font-normal">Replicate inpainting removes printed text so you get a spotless background with editable typography.</p>
                        </div>
                      </div>
                    )}

                    {/* Preview Mode Toggle (Cleaned by Replicate vs Original) */}
                    {cleanedPreviewUrl && (
                      <div className="flex items-center justify-between p-1 bg-gray-100/90 rounded-xl border border-gray-200">
                        <button
                          type="button"
                          onClick={() => setPreviewMode("cleaned")}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            previewMode === "cleaned"
                              ? "bg-white text-[#6C5CE7] shadow-xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7]" />
                          <span>✨ Clean Background (Replicate)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewMode("original")}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            previewMode === "original"
                              ? "bg-white text-gray-900 shadow-xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <span>Original Card</span>
                        </button>
                      </div>
                    )}

                    {/* Preview Area */}
                    <div className="rounded-xl overflow-hidden border border-gray-100 bg-[#F9FAFB] p-3 flex flex-col sm:flex-row items-center gap-3.5">
                      {(previewMode === "cleaned" && cleanedPreviewUrl) || previewUrl ? (
                        /* Image Preview */
                        <div className="relative w-full sm:w-28 h-32 sm:h-28 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0 shadow-inner group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={(previewMode === "cleaned" && cleanedPreviewUrl) ? cleanedPreviewUrl : (previewUrl || "")}
                            alt={uploadedFile.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white uppercase">
                            {previewMode === "cleaned" && cleanedPreviewUrl ? "Cleaned" : (uploadedFile.type.includes("png") ? "PNG" : "JPG")}
                          </div>
                        </div>
                      ) : (
                        /* PDF Document Card */
                        <div className="w-full sm:w-28 h-28 rounded-lg border border-red-200 bg-gradient-to-b from-red-50/80 to-red-100/50 flex flex-col items-center justify-center shrink-0 p-2 shadow-inner">
                          <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-sm mb-1.5">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide">
                            PDF File
                          </span>
                        </div>
                      )}

                      {/* File Metadata & Quick AI extract button */}
                      <div className="flex-1 w-full text-left min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate" title={uploadedFile.name}>
                          {uploadedFile.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="inline-flex items-center text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                            {formatFileSize(uploadedFile.size)}
                          </span>
                          {detectedTextLayers.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {detectedTextLayers.length} text layers ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] font-semibold text-[#6C5CE7] bg-[#F0EEFF] px-2 py-0.5 rounded-md">
                              Ready to Import
                            </span>
                          )}
                          {!isExtractingAI && (
                            <button
                              type="button"
                              onClick={handleExtractDetailsAI}
                              className="text-[10px] font-bold text-[#6C5CE7] hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3" />
                              Re-scan with AI
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2">
                          {cleanedPreviewUrl
                            ? "✨ Replicate erased printed text from background. Separated typography will open as editable layers in designer."
                            : "Customize this invitation directly in the designer or create your event right away."}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={handleOpenInDesigner}
                        disabled={isUploading}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] hover:from-[#5E35B1] hover:to-[#7C3AED] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        Open in Invitation Designer
                      </button>

                      <button
                        onClick={handleUploadAndCreateEvent}
                        disabled={isUploading}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#6C5CE7] bg-white border border-[#DDD6FE] hover:bg-[#F0EEFF]/50 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-[#6C5CE7]/30 border-t-[#6C5CE7] rounded-full animate-spin" />
                            Creating event…
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Create Event with Upload
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Sign-In / Register Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAuthAction(null);
        }}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          if (pendingAuthAction === "ai") {
            setPendingAuthAction(null);
            handleGenerate();
          } else if (pendingAuthAction === "upload") {
            setPendingAuthAction(null);
            setTimeout(() => {
              fileInputRef.current?.click();
            }, 100);
          } else {
            setPendingAuthAction(null);
          }
        }}
      />
    </section>
  );
}
