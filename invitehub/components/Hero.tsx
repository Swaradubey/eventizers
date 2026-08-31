"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  PartyPopper,
  Calendar,
  Clock,
  MapPin,
  Users,
  ListChecks,
  ArrowRight,
  FileText,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Loader2,
  ArrowUpRight,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import templateService, { Template } from "../services/templateService";
import eventService from "../services/eventService";
import API from "../services/api";
import { getImageUrl } from "../utils/imageUrl";
import { compressAndNormalizeImage } from "../utils/imageCompressor";
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

const timeOptions = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
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
  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [guestList, setGuestList] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("22:00");
  const [isFullDay, setIsFullDay] = useState(false);
  const [venue, setVenue] = useState("");
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

  // Tab 2: Upload Existing states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
      const timeStr = isFullDay ? "Full Day" : (startTime && endTime ? `${startTime} - ${endTime}` : startTime || endTime || undefined);
      const res = await API.post("/ai/generate-event", {
        prompt: prompt.trim(),
        eventType: eventType || undefined,
        guestCount: guestCount || undefined,
        date: date || undefined,
        time: timeStr,
        venue: venue || undefined,
        guestListName: guestList || undefined,
      });

      if (res.data) {
        setAiEventData(res.data);
        setSuccessMsg("🎉 AI Event generated and saved to your Dashboard!");
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

    // If already saved to database via the AI endpoint
    if (aiEventData.event?.id) {
      setSuccessMsg("🎉 Navigating to your event in Dashboard...");
      setTimeout(() => {
        router.push("/dashboard/events");
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

      const selectedTime = isFullDay ? "09:00" : (startTime || "18:00");
      const res = await eventService.createEvent({
        title: aiEventData.title || "AI Generated Event",
        description: formattedDescription,
        venue: venue || "TBD Venue",
        eventDate: date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        eventTime: selectedTime,
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
        setStartTime("18:00");
        setEndTime("22:00");
        setIsFullDay(false);
        setVenue("");
        setGuestList("");
        setTimeout(() => {
          router.push("/dashboard/events");
        }, 1200);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        // Compress and format normalize mobile camera and high-res images to < 1.5MB
        const { file: compressedFile, dataUrl } = await compressAndNormalizeImage(file, {
          maxDimension: 1920,
          quality: 0.85,
          maxSizeBytes: 1.5 * 1024 * 1024,
        });

        setUploadedFile(compressedFile);
        setPreviewUrl(dataUrl);

        // If user is authenticated, immediately upload to cloud/server for permanent public HTTPS URL
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
    setUploadError(null);
    setUploadTitle("");
    setUploadVenue("");
    setUploadDate("");
    setUploadTime("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenInDesigner = async () => {
    if (!uploadedFile && !previewUrl) {
      setUploadError("Please select an invitation file first.");
      return;
    }

    setIsUploading(true);
    let resolvedPersistentUrl = previewUrl || "";

    // If user is logged in, ensure file is uploaded to get permanent server URL
    if (user && uploadedFile && (!resolvedPersistentUrl || resolvedPersistentUrl.startsWith("data:") || resolvedPersistentUrl.startsWith("blob:"))) {
      try {
        const uploadRes = await templateService.uploadTemplateImage(uploadedFile, uploadedFile.name);
        if (uploadRes && uploadRes.success && uploadRes.url) {
          resolvedPersistentUrl = uploadRes.url;
        }
      } catch (upErr) {
        console.warn("Pre-upload in designer handoff fallback:", upErr);
      }
    }

    try {
      if (resolvedPersistentUrl) {
        safeSetSessionStorage("pending_upload_invite", resolvedPersistentUrl);
      }
      if (uploadedFile) {
        safeSetSessionStorage("pending_upload_name", uploadedFile.name);
        safeSetSessionStorage("pending_upload_type", uploadedFile.type);
      }
      if (uploadTitle) {
        safeSetSessionStorage("pending_upload_title", uploadTitle);
      }
    } catch (e) {
      console.error("Failed to store pending upload:", e);
    } finally {
      setIsUploading(false);
    }

    if (!user) {
      setSuccessMsg("Invitation attached! Redirecting to login to save in designer...");
      setTimeout(() => {
        router.push("/login?redirect=/dashboard/invitations");
      }, 900);
    } else {
      setSuccessMsg("Opening invitation designer...");
      setTimeout(() => {
        router.push("/dashboard/invitations");
      }, 500);
    }
  };

  const handleUploadAndCreateEvent = async () => {
    if (!user) {
      setErrorMsg("Please sign in first to create an event.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (!uploadTitle.trim() || !uploadVenue.trim() || !uploadDate || !uploadTime) {
      setUploadError("Please fill in Event Title, Venue, Date, and Time to create your event.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setSuccessMsg(null);

    try {
      let res;
      if (uploadedFile) {
        const formData = new FormData();
        formData.append("title", uploadTitle.trim());
        formData.append("venue", uploadVenue.trim());
        formData.append("eventDate", uploadDate);
        formData.append("eventTime", uploadTime);
        formData.append("eventType", "Uploaded Invitation");
        formData.append("coverImage", uploadedFile);
        formData.append("imageUrl", uploadedFile);
        res = await eventService.createEvent(formData);
      } else {
        res = await eventService.createEvent({
          title: uploadTitle.trim(),
          venue: uploadVenue.trim(),
          eventDate: uploadDate,
          eventTime: uploadTime,
          eventType: "Uploaded Invitation",
          coverImage: previewUrl || undefined,
        });
      }

      if (res && res.success) {
        const createdImage = res.event?.coverImage || res.event?.imageUrl || previewUrl;
        if (createdImage) {
          safeSetSessionStorage("pending_upload_invite", createdImage);
        }
        setSuccessMsg("🎉 Event created successfully with your uploaded invitation!");
        setTimeout(() => {
          router.push("/dashboard/events");
        }, 1200);
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
    if (!uploadedFile) return;
    setIsExtractingAI(true);
    setUploadError(null);

    setTimeout(() => {
      const cleanName = uploadedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const words = cleanName.split(" ").filter(Boolean);
      const candidate = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

      if (!uploadTitle || uploadTitle === cleanName) {
        setUploadTitle(candidate || "Special Celebration");
      }
      if (!uploadVenue) {
        setUploadVenue("Grand Celebration Ballroom");
      }
      if (!uploadDate) {
        const now = new Date();
        const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
        const nextSat = new Date(now.getTime() + daysUntilSaturday * 24 * 60 * 60 * 1000);
        setUploadDate(nextSat.toISOString().split("T")[0]);
      }
      if (!uploadTime) {
        setUploadTime("18:30");
      }

      setIsExtractingAI(false);
      setSuccessMsg("✨ Extracted invitation details!");
    }, 850);
  };

  return (
    <section className="relative overflow-hidden overflow-x-clip min-h-[90vh] py-12 px-4 flex flex-col justify-center items-center bg-slate-50/40 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]">
      {/* Subtle background grid/plus pattern overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 -z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 12v8M12 16h8' stroke='%23CBD5E1' stroke-width='0.9' stroke-linecap='round' stroke-opacity='0.6' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Atmospheric multi-color radial gradient aura */}
      {/* Left side: Soft subtle purple/lavender glow */}
      <div className="absolute w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(224,231,255,0.6)_0%,rgba(238,242,255,0.3)_45%,transparent_70%)] top-1/4 -left-32 -translate-y-1/2 blur-3xl pointer-events-none" />
      {/* Right/base: Crisp light blue/mesh tint */}
      <div className="absolute w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(224,242,254,0.6)_0%,rgba(240,249,255,0.3)_45%,transparent_70%)] top-1/4 -right-32 -translate-y-1/2 blur-3xl pointer-events-none" />
      {/* Bottom center: Very soft peach/warm tint */}
      <div className="absolute w-[800px] h-[350px] rounded-full bg-[radial-gradient(ellipse,rgba(255,241,242,0.45)_0%,rgba(255,237,213,0.3)_40%,transparent_70%)] bottom-0 left-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

      {/* Subtle scattered gold/beige stars in atmosphere */}
      <span className="absolute top-[14%] left-[10%] text-amber-400/80 text-sm select-none pointer-events-none animate-pulse">✦</span>
      <span className="absolute top-[25%] left-[5%] text-amber-400/60 text-xs select-none pointer-events-none">✦</span>
      <span className="absolute top-[15%] right-[10%] text-amber-400/80 text-sm select-none pointer-events-none animate-pulse">✦</span>
      <span className="absolute top-[28%] right-[6%] text-amber-400/60 text-xs select-none pointer-events-none">✦</span>
      <span className="absolute top-[8%] left-[48%] text-amber-400/40 text-[10px] select-none pointer-events-none">✦</span>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-center items-center overflow-x-clip">
        {/* Top Pill Badge */}
        <div className="rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 px-4 py-1.5 shadow-sm inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span className="text-xs sm:text-sm font-medium text-slate-600">
            AI-Powered Event Operating System
          </span>
        </div>

        {/* Main Heading */}
        <h1
          className="font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-center leading-tight bg-gradient-to-r from-[#4C75F2] via-[#1D77F3] to-[#00A3FF] bg-clip-text text-transparent pb-1 md:whitespace-nowrap"
          style={{ fontSize: "clamp(1.9rem, 4vw, 3.75rem)" }}
        >
          Create Any Event in Under 60 Seconds
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed text-center max-w-2xl mx-auto mt-3 mb-8">
          Invitations, RSVPs, Ticketing, Check-In, Guest<br className="hidden sm:inline" />{" "}
          Management and AI Planning — all in one platform.
        </p>

        {/* Central Hero Card Container with Side Floating Cards */}
        <div className="relative w-full mx-auto max-w-2xl lg:max-w-3xl z-10">
          {/* Left Side Floating Card (Birthday) */}
          <div
            className="hidden lg:flex flex-col justify-between absolute top-6 right-full mr-3 lg:mr-6 w-[160px] lg:w-[180px] h-[230px] lg:h-[250px] p-3.5 rounded-2xl overflow-hidden z-20 select-none pointer-events-none text-left transition-transform duration-300 ease-out"
            style={{
              background: "linear-gradient(160deg, #FF1E56 0%, #E81C65 35%, #FF7A00 80%, #FF9057 100%)",
              transform: "rotate(-6deg)",
              boxShadow: "0 25px 50px -12px rgba(255, 30, 86, 0.45)",
            }}
            aria-hidden="true"
          >
            {/* Concentric arc SVG overlay */}
            <svg
              aria-hidden="true"
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 220 270"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse cx="110" cy="135" rx="85" ry="105" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
              <ellipse cx="110" cy="135" rx="65" ry="82" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
              <ellipse cx="110" cy="135" rx="45" ry="58" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              <ellipse cx="110" cy="135" rx="25" ry="34" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
              <path d="M0 135 Q55 60 110 135 Q165 210 220 135" stroke="rgba(255,255,255,0.09)" strokeWidth="1.2" />
              <path d="M0 100 Q55 30 110 100 Q165 170 220 100" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
              <path d="M0 170 Q55 95 110 170 Q165 245 220 170" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            </svg>

            {/* Badge row */}
            <div className="relative flex justify-between items-center w-full z-10">
              <span className="inline-flex items-center text-[8px] font-bold px-1.5 py-0.5 tracking-wider uppercase text-white bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
                BIRTHDAY
              </span>
              <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-sm">
                <Cake className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Center content */}
            <div className="relative my-auto z-10">
              <div className="text-[8.5px] text-white/80 leading-none">You&apos;re invited to</div>
              <div className="text-[11px] sm:text-xs font-bold text-white leading-tight mt-0.5">
                Maya&apos;s 5th<br />Birthday
              </div>
              <div className="text-[8px] text-white/85 leading-tight mt-0.5">Sat, June 14 · 2:00 PM</div>
            </div>

            {/* Host row */}
            <div className="relative text-[7.5px] text-white/75 mt-auto pt-1.5 border-t border-white/20 z-10">
              Hosted by The Patels
            </div>
          </div>

          {/* Right Side Floating Card (Wedding) */}
          <div
            className="hidden lg:flex flex-col justify-between absolute top-10 left-full ml-3 lg:ml-6 w-[160px] lg:w-[180px] h-[230px] lg:h-[250px] p-3.5 rounded-2xl overflow-hidden z-20 select-none pointer-events-none text-left transition-transform duration-300 ease-out"
            style={{
              background: "linear-gradient(145deg, #4A1FB8 0%, #5825E3 30%, #1565C0 65%, #00D2FF 90%, #00F0FF 100%)",
              transform: "rotate(6deg)",
              boxShadow: "0 25px 50px -12px rgba(74, 31, 184, 0.4), 0 15px 30px -10px rgba(0, 210, 255, 0.3)",
            }}
            aria-hidden="true"
          >
            {/* Orbital ellipse SVG overlay */}
            <svg
              aria-hidden="true"
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 220 270"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse cx="110" cy="135" rx="100" ry="60" stroke="rgba(0,240,255,0.18)" strokeWidth="1.5" />
              <ellipse cx="110" cy="135" rx="100" ry="60" stroke="rgba(0,210,255,0.12)" strokeWidth="1" transform="rotate(40 110 135)" />
              <ellipse cx="110" cy="135" rx="100" ry="60" stroke="rgba(150,100,255,0.13)" strokeWidth="1" transform="rotate(80 110 135)" />
              <ellipse cx="110" cy="135" rx="70" ry="42" stroke="rgba(0,240,255,0.14)" strokeWidth="1" transform="rotate(20 110 135)" />
              <ellipse cx="110" cy="135" rx="70" ry="42" stroke="rgba(150,100,255,0.10)" strokeWidth="1" transform="rotate(60 110 135)" />
              <circle cx="110" cy="135" r="4" fill="rgba(0,240,255,0.35)" />
              <circle cx="110" cy="75" r="2.5" fill="rgba(0,240,255,0.25)" />
              <circle cx="185" cy="135" r="2" fill="rgba(150,100,255,0.3)" />
            </svg>

            {/* Badge row */}
            <div className="relative flex justify-between items-center w-full z-10">
              <span className="inline-flex items-center text-[8px] font-bold px-1.5 py-0.5 tracking-wider uppercase text-white bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
                WEDDING
              </span>
              <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-sm">
                <Heart className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Center content */}
            <div className="relative my-auto z-10">
              <div className="text-[8.5px] text-white/80 leading-none">You&apos;re invited to</div>
              <div className="text-[11px] sm:text-xs font-bold text-white leading-tight mt-0.5">
                Liam &amp;<br />Sofia
              </div>
              <div className="text-[8px] text-white/85 leading-tight mt-0.5">Sept 21 · 5:00 PM<br />Vineyard Estate</div>
            </div>

            {/* Host row */}
            <div className="relative text-[7.5px] text-white/75 mt-auto pt-1.5 border-t border-white/20 z-10">
              Together with their families
            </div>
          </div>

          {/* Central Interactive Hero Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-8 relative z-10 text-left">
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

                {/* Form Fields (Below the prompt box/suggestions) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-left">
                  {/* 1. EVENT TYPE */}
                  <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-3.5 shadow-sm hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100/50 transition-all flex flex-col justify-between">
                    <label className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1.5 select-none">
                      EVENT TYPE
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
                        <option value="" disabled className="text-gray-400">
                          Select event type
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
                  <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-3.5 shadow-sm hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100/50 transition-all flex flex-col justify-between">
                    <label className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1.5 select-none">
                      DATE
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
                  <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-3.5 shadow-sm hover:border-gray-300 transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase select-none">
                        TIME
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
                      {/* Start time pill */}
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

                      {/* End time pill */}
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
                  <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-3.5 shadow-sm hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100/50 transition-all flex flex-col justify-between">
                    <label className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1.5 select-none">
                      VENUE
                    </label>
                    <div className="relative flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="Add location"
                        className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* 5. GUEST GROUP */}
                  <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-3.5 shadow-sm hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100/50 transition-all flex flex-col justify-between">
                    <label className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1.5 select-none">
                      GUEST GROUP
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
                        <option value="" disabled className="text-gray-400">
                          Estimated guest count
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
                  <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-3.5 shadow-sm hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100/50 transition-all flex flex-col justify-between">
                    <label className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1.5 select-none">
                      GUEST LIST
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
                        <option value="" disabled className="text-gray-400">
                          Select a saved list
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

                {/* Bottom Action Button */}
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full mt-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#4C6FFF] to-[#00C0F9] hover:opacity-95 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 group"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating Event with AI...</span>
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
                            <span>Opening Dashboard...</span>
                          </>
                        ) : (
                          <>
                            <span>View in Dashboard</span>
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
                    onClick={() => fileInputRef.current?.click()}
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
                    <p className="text-xs sm:text-sm font-semibold text-gray-800">
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
                          <span className="text-xs font-bold text-gray-900 block leading-tight">
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

                    {/* Preview Area */}
                    <div className="rounded-xl overflow-hidden border border-gray-100 bg-[#F9FAFB] p-3 flex flex-col sm:flex-row items-center gap-3.5">
                      {previewUrl ? (
                        /* Image Preview */
                        <div className="relative w-full sm:w-28 h-32 sm:h-28 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0 shadow-inner group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewUrl}
                            alt={uploadedFile.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white uppercase">
                            {uploadedFile.type.includes("png") ? "PNG" : "JPG"}
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
                          <span className="inline-flex items-center text-[10px] font-semibold text-[#6C5CE7] bg-[#F0EEFF] px-2 py-0.5 rounded-md">
                            Ready to Import
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2">
                          Customize this invitation directly in the designer or pre-fill event details below.
                        </p>

                        <button
                          onClick={handleExtractDetailsAI}
                          disabled={isExtractingAI}
                          className="mt-2 text-[11px] font-semibold text-[#6C5CE7] hover:text-[#5E35B1] inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                          {isExtractingAI ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Analyzing invitation details…</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-[#7C3AED]" />
                              <span>Auto-fill details with AI</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Event Details Form */}
                    <div className="space-y-2.5 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-gray-700">
                          Event Details (Optional for quick setup)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={uploadTitle}
                          onChange={(e) => setUploadTitle(e.target.value)}
                          placeholder="Event Title (e.g. Maya's 5th Birthday)"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#F9FAFB] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
                        />
                        <input
                          type="text"
                          value={uploadVenue}
                          onChange={(e) => setUploadVenue(e.target.value)}
                          placeholder="Venue (e.g. Sweet Retreat Bakery)"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#F9FAFB] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
                        />
                        <input
                          type="date"
                          value={uploadDate}
                          onChange={(e) => setUploadDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#F9FAFB] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
                        />
                        <input
                          type="time"
                          value={uploadTime}
                          onChange={(e) => setUploadTime(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-[#F9FAFB] text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
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
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
