"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import templateService, { Template } from "../../../services/templateService";
import {
  Plus,
  Search,
  Trash2,
  ExternalLink,
  UploadCloud,
  Link as LinkIcon,
  ImageIcon,
  Sparkles,
  Check,
  AlertCircle,
  Filter,
  Layers,
  Eye,
  RefreshCw,
  X,
  Menu,
  Crown,
  Heart,
  Palette,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_CATEGORIES = [
  "Wedding",
  "Birthday",
  "Adult Birthday",
  "Corporate",
  "Bridal Shower",
  "Holiday",
  "Workshop",
  "Charity Gala",
  "Dinner Party",
  "Baby Shower",
];

export default function AdminTemplatesPage() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  // Template List State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBadge, setSelectedBadge] = useState("All");

  // Modal State for Adding Template
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<"upload" | "link">("upload");

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Wedding");
  const [customCategory, setCustomCategory] = useState("");
  const [badge, setBadge] = useState<"Free" | "Premium">("Free");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [previewStatus, setPreviewStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [resolvingUrl, setResolvingUrl] = useState(false);

  // Check if link is a Greetings Island webpage (not direct image CDN)
  const isGreetingsIslandPage = useMemo(() => {
    if (!imageUrl) return false;
    const lower = imageUrl.toLowerCase();
    return lower.includes("greetingsisland.com") && !lower.includes("images.greetingsisland.com");
  }, [imageUrl]);

  // Clean, auto-extract and format image URLs
  const cleanAndSetImageUrl = (raw: string) => {
    let cleaned = raw.trim();
    if (cleaned.includes("google.") && cleaned.includes("imgurl=")) {
      try {
        const parsed = new URL(cleaned);
        const direct = parsed.searchParams.get("imgurl");
        if (direct) cleaned = decodeURIComponent(direct);
      } catch (_) {}
    }
    if (cleaned.includes("google.") && (cleaned.includes("/url?q=") || cleaned.includes("/url?url="))) {
      try {
        const parsed = new URL(cleaned);
        const direct = parsed.searchParams.get("q") || parsed.searchParams.get("url");
        if (direct) cleaned = decodeURIComponent(direct);
      } catch (_) {}
    }
    if (cleaned.includes("dropbox.com")) {
      cleaned = cleaned.replace(/\?dl=0/g, "?raw=1").replace(/&dl=0/g, "&raw=1");
      if (!cleaned.includes("raw=1")) {
        cleaned += (cleaned.includes("?") ? "&" : "?") + "raw=1";
      }
    }
    if (/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)$/i.test(cleaned)) {
      const id = cleaned.split("/").pop();
      cleaned = `https://i.imgur.com/${id}.jpg`;
    }
    setImageUrl(cleaned);
    setPreviewStatus("loading");
  };

  const handleResolveImage = async () => {
    if (!imageUrl.trim()) {
      showToast("Please enter an image link first", "error");
      return;
    }
    try {
      setResolvingUrl(true);
      const res = await templateService.resolveImageUrl(imageUrl.trim());
      if (res.success && res.url) {
        setImageUrl(res.url);
        setPreviewStatus("loaded");
        showToast("Image link resolved & verified successfully!");
      } else {
        showToast(res.error || "Could not resolve image from link", "error");
      }
    } catch (e: any) {
      showToast(e?.message || "Failed to resolve image", "error");
    } finally {
      setResolvingUrl(false);
    }
  };

  // Submit & Delete State
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Route protection
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/admin/templates");
      } else if (user.role !== "ADMIN") {
        router.push("/dashboard/ai-assistant");
      }
    }
  }, [user, authLoading, router]);

  // Load templates
  const loadTemplates = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const list = await templateService.getTemplates(force);
      setTemplates(list);
    } catch (err: any) {
      setError(err?.message || "Failed to load templates.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      loadTemplates();
    }
  }, [user]);

  // Handle File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please choose a valid image file (PNG, JPG, SVG, WebP)", "error");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast("File size exceeds 15MB limit", "error");
      return;
    }

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Please provide a template title", "error");
      return;
    }

    const effectiveCategory = category === "Other" ? (customCategory.trim() || "General") : category;

    try {
      setSubmitting(true);
      let finalImageUrl = "";

      if (addMode === "upload") {
        if (!imageFile) {
          showToast("Please choose an image file to upload", "error");
          setSubmitting(false);
          return;
        }
        // Upload image to backend
        const uploadResult = await templateService.uploadTemplateImage(imageFile, imageFile.name);
        if (!uploadResult.url) {
          throw new Error("Could not upload template image file");
        }
        finalImageUrl = uploadResult.url;
      } else {
        if (!imageUrl.trim()) {
          showToast("Please provide a valid image URL", "error");
          setSubmitting(false);
          return;
        }
        if (isGreetingsIslandPage) {
          showToast("Please paste the direct image link (Right-click card on Greetings Island -> 'Copy Image Address'), or upload the image file directly", "error");
          setSubmitting(false);
          return;
        }
        finalImageUrl = imageUrl.trim();
      }

      await templateService.createTemplate({
        title: title.trim(),
        name: title.trim(),
        category: effectiveCategory,
        badge,
        isPremium: badge === "Premium",
        imageUrl: finalImageUrl,
        thumbnailUrl: finalImageUrl,
        tags: [effectiveCategory, badge],
        description: description.trim(),
      });

      showToast("Template published to public gallery successfully!");
      // Reset form
      setTitle("");
      setImageUrl("");
      setImageFile(null);
      setFilePreview(null);
      setDescription("");
      setPreviewStatus("loading");
      setIsAddModalOpen(false);
      // Reload templates
      await loadTemplates(true);
    } catch (err: any) {
      showToast(err?.response?.data?.error || err?.message || "Failed to create template", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Template
  const handleDelete = async (templateId: string) => {
    try {
      setDeleting(true);
      await templateService.deleteTemplate(templateId);
      showToast("Template deleted successfully");
      setDeleteConfirmId(null);
      await loadTemplates(true);
    } catch (err: any) {
      showToast(err?.response?.data?.error || err?.message || "Could not delete template", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Categories list for filter pills
  const availableCategories = useMemo(() => {
    const set = new Set<string>(["All"]);
    templates.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    PRESET_CATEGORIES.forEach((c) => set.add(c));
    return Array.from(set);
  }, [templates]);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const titleMatch =
        (t.title || t.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.category || "").toLowerCase().includes(search.toLowerCase());

      const categoryMatch =
        selectedCategory === "All" ||
        (t.category || "").toLowerCase() === selectedCategory.toLowerCase();

      const badgeMatch =
        selectedBadge === "All" ||
        (selectedBadge === "Premium" && (t.isPremium || t.badge?.toLowerCase() === "premium")) ||
        (selectedBadge === "Free" && (!t.isPremium && t.badge?.toLowerCase() !== "premium"));

      return titleMatch && categoryMatch && badgeMatch;
    });
  }, [templates, search, selectedCategory, selectedBadge]);

  // Helper to get image preview
  const getDisplayImage = (t: Template) => {
    if (t.thumbnailUrl) return t.thumbnailUrl;
    if (t.imageUrl) return t.imageUrl;
    if (t.image) return t.image;
    const assetId = t.id.startsWith("tpl-") ? t.id.slice(4) : t.id;
    return `/assets/templates/${assetId}-mockup.svg`;
  };

  // Live preview image in modal
  const livePreviewImage = addMode === "upload" ? filePreview : imageUrl;

  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-100/80 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-100/80 flex flex-col font-body text-slate-800 relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6 pb-12 z-10">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-xl border border-blue-100 bg-white/90 hover:bg-blue-50 transition-colors shadow-xs focus:outline-none"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-blue-100/80 text-blue-700 border border-blue-200/60">
                  Admin Studio
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {templates.length} Total Templates
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
                Stationery & Templates Management
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Add new designs via image link or file upload. Existing baseline templates remain untouched.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => loadTemplates(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-blue-100/80 bg-white/90 hover:bg-blue-50 text-slate-700 transition-all shadow-xs disabled:opacity-50"
              title="Refresh templates"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Template</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3.5 border border-blue-100/70 shadow-2xs">
            <div className="text-xs font-medium text-slate-500">Total Live</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{templates.length}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3.5 border border-blue-100/70 shadow-2xs">
            <div className="text-xs font-medium text-slate-500">Free Templates</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">
              {templates.filter((t) => !t.isPremium && t.badge?.toLowerCase() !== "premium").length}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3.5 border border-blue-100/70 shadow-2xs">
            <div className="text-xs font-medium text-slate-500">Premium Templates</div>
            <div className="text-xl font-bold text-purple-600 mt-0.5">
              {templates.filter((t) => t.isPremium || t.badge?.toLowerCase() === "premium").length}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3.5 border border-blue-100/70 shadow-2xs">
            <div className="text-xs font-medium text-slate-500">Categories</div>
            <div className="text-xl font-bold text-blue-600 mt-0.5">
              {availableCategories.length - 1}
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-blue-100/80 shadow-xs mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search templates by title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Badge Filter */}
          <div className="flex items-center gap-1.5 self-center">
            {(["All", "Free", "Premium"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBadge(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedBadge === b
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-blue-100/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-slate-500 font-medium">Loading templates repository...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-blue-100/80 p-12 text-center max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No templates found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or filter tags, or add a new template above.
            </p>
          </div>
        ) : (
          /* Template Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredTemplates.map((t) => {
              const isPremium = t.isPremium || t.badge?.toLowerCase() === "premium";
              const imgSrc = getDisplayImage(t);

              return (
                <motion.div
                  layout
                  key={t.id}
                  className="group bg-white rounded-2xl border border-blue-100/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  {/* Card Image Thumbnail */}
                  <div className="relative aspect-[3/4] bg-[#FAF8F5] overflow-hidden border-b border-slate-100">
                    <img
                      src={imgSrc}
                      alt={t.title || t.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      onError={(e) => {
                        if (!t.thumbnailUrl && !t.imageUrl) {
                          const assetId = t.id.startsWith("tpl-") ? t.id.slice(4) : t.id;
                          e.currentTarget.src = `/assets/templates/${assetId}-bg.svg`;
                        }
                      }}
                    />

                    {/* Top overlay badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold backdrop-blur-sm shadow-2xs ${
                          isPremium
                            ? "bg-purple-900/90 text-purple-100"
                            : "bg-slate-900/80 text-white"
                        }`}
                      >
                        {isPremium && <Crown className="w-3 h-3 text-amber-300" />}
                        {t.badge || (isPremium ? "Premium" : "Free")}
                      </span>

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/90 text-slate-700 backdrop-blur-sm shadow-2xs border border-white/50">
                        {t.category || "General"}
                      </span>
                    </div>

                    {/* Quick Hover Action */}
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-4">
                      <a
                        href={`/canvas?guest=true&templateId=${encodeURIComponent(t.id)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-semibold shadow-md hover:bg-slate-50 transition-all transform hover:scale-105"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Test in Studio</span>
                      </a>
                    </div>
                  </div>

                  {/* Card Details & Actions */}
                  <div className="p-3.5 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 line-clamp-1">
                        {t.title || t.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                        ID: {t.id}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                      <a
                        href={`/canvas?guest=true&templateId=${encodeURIComponent(t.id)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Studio
                      </a>

                      <button
                        onClick={() => setDeleteConfirmId(t.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete template from database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* ================= MODAL: ADD NEW TEMPLATE ================= */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl border border-blue-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Add New Invitation Template</h2>
                    <p className="text-xs text-slate-500">Provide image artwork and design settings</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* 1. Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Template Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Gold Velvet Gala"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* 2. Category & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      {PRESET_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="Other">Other (Custom Category)</option>
                    </select>

                    {category === "Other" && (
                      <input
                        type="text"
                        placeholder="Enter custom category..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="mt-2 w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Access Tier / Badge
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBadge("Free")}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          badge === "Free"
                            ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Free
                      </button>
                      <button
                        type="button"
                        onClick={() => setBadge("Premium")}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          badge === "Premium"
                            ? "bg-purple-600 border-purple-600 text-white shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-300" />
                        Premium
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Image Mode Toggle: Upload vs Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Artwork / Mockup Image <span className="text-rose-500">*</span>
                  </label>

                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-3">
                    <button
                      type="button"
                      onClick={() => setAddMode("upload")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                        addMode === "upload"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Image File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAddMode("link")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                        addMode === "link"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Paste Web Image Link</span>
                    </button>
                  </div>

                  {addMode === "upload" ? (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-blue-50/30 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-slate-700">
                          {imageFile ? imageFile.name : "Click to browse or drag & drop image"}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Supports PNG, JPG, SVG, WebP (up to 15MB)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/... or direct image link"
                            value={imageUrl}
                            onChange={(e) => cleanAndSetImageUrl(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                          />
                        </div>
                        {imageUrl.trim() && (
                          <button
                            type="button"
                            onClick={handleResolveImage}
                            disabled={resolvingUrl}
                            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                            title="Verify and pre-cache this image link via server"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${resolvingUrl ? "animate-spin" : ""}`} />
                            <span>{resolvingUrl ? "Verifying..." : "Verify Link"}</span>
                          </button>
                        )}
                      </div>

                      {/* Greetings Island Specific Helper Banner */}
                      {isGreetingsIslandPage && (
                        <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                          <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                            Greetings Island Webpage Link Detected
                          </div>
                          <p className="mt-1 text-[11px] text-amber-700 leading-relaxed">
                            You pasted the website page URL instead of the direct image link.
                            <br />
                            <strong>How to get the exact image:</strong> On Greetings Island, <strong>Right-Click</strong> on the invitation card image &rarr; choose <strong>&quot;Copy Image Address&quot;</strong> (link begins with <em>https://images.greetingsisland.com/...</em>) and paste it here, OR save the image and click &quot;Upload Image File&quot; above.
                          </p>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-400 mt-1">
                        Enter any direct image URL (SVG, PNG, JPG, WebP).
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Live Preview */}
                {livePreviewImage && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-2xs flex items-center justify-center">
                      {previewStatus === "loading" && (
                        <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center z-10">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}

                      {previewStatus === "error" ? (
                        <div className="flex flex-col items-center justify-center text-center p-2 text-rose-500 z-10">
                          <AlertCircle className="w-5 h-5 mb-1" />
                          <span className="text-[9px] font-semibold leading-tight">Image load failed</span>
                        </div>
                      ) : (
                        <img
                          key={livePreviewImage}
                          src={livePreviewImage}
                          alt="Preview"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className={`w-full h-full object-cover transition-opacity duration-300 ${
                            previewStatus === "loaded" ? "opacity-100" : "opacity-0"
                          }`}
                          onLoad={() => setPreviewStatus("loaded")}
                          onError={() => setPreviewStatus("error")}
                        />
                      )}
                    </div>
                    <div className="text-xs text-slate-600 flex-1">
                      <div className="font-semibold text-slate-900">{title || "Template Title Preview"}</div>
                      <div className="text-slate-500 mt-0.5">
                        Category: <span className="font-medium text-slate-700">{category === "Other" ? customCategory || "Custom" : category}</span>
                      </div>
                      <div className="text-slate-500">
                        Badge: <span className="font-medium text-slate-700">{badge}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {previewStatus === "loaded" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Check className="w-3 h-3" /> Exact Image Ready
                          </span>
                        )}
                        {previewStatus === "error" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            Check URL or click &quot;Verify Link&quot;
                          </span>
                        )}
                        {previewStatus === "loading" && (
                          <span className="text-[11px] text-slate-400">Loading preview...</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Publishing to Gallery...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Publish Template to Gallery</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-5 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Delete Template?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove template ID &quot;{deleteConfirmId}&quot;? This cannot be undone.
              </p>

              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  disabled={deleting}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-emerald-900/90 text-emerald-100 border-emerald-700 backdrop-blur-sm"
                : "bg-rose-900/90 text-rose-100 border-rose-700 backdrop-blur-sm"
            }`}
          >
            {toast.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
