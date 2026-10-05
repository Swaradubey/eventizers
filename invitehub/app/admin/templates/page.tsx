"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import templateService, { Template } from "../../../services/templateService";
import {
  Plus, Search, Trash2, ExternalLink, UploadCloud,
  Link as LinkIcon, Sparkles, Check, AlertCircle,
  Layers, Eye, RefreshCw, X, Menu, Crown, Type,
  AlignCenter, AlignLeft, AlignRight, Move,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_CATEGORIES = [
  "Wedding","Birthday","Adult Birthday","Corporate",
  "Bridal Shower","Holiday","Workshop","Charity Gala","Dinner Party","Baby Shower",
];

const FONT_OPTIONS = [
  { label: "Playfair Display", value: "'Playfair Display', Georgia, serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Cinzel", value: "'Cinzel', serif" },
  { label: "Dancing Script", value: "'Dancing Script', cursive" },
  { label: "Great Vibes", value: "'Great Vibes', cursive" },
  { label: "Alex Brush", value: "'Alex Brush', cursive" },
  { label: "Montserrat", value: "'Montserrat', sans-serif" },
  { label: "Caveat", value: "'Caveat', cursive" },
  { label: "Lato", value: "'Lato', sans-serif" },
];

interface TextLayerDraft {
  id: string; key: string; text: string;
  fontFamily: string; fontSize: number; color: string;
  fontWeight: string; textAlign: "left"|"center"|"right";
  top: number; left: number;
  letterSpacing?: number; lineHeight?: number;
}

const makeLayerId = () => `layer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;

const DEFAULT_LAYERS: TextLayerDraft[] = [
  { id:"layer-title", key:"title", text:"Your Event Title",
    fontFamily:"'Playfair Display', Georgia, serif", fontSize:22,
    color:"#1A1A1A", fontWeight:"700", textAlign:"center",
    top:65, left:50, letterSpacing:0.5, lineHeight:1.3 },
  { id:"layer-datetime", key:"datetime", text:"Saturday, November 14 \u2022 6:00 PM",
    fontFamily:"'Inter', sans-serif", fontSize:13,
    color:"#4A4A4A", fontWeight:"400", textAlign:"center",
    top:76, left:50, letterSpacing:0.5, lineHeight:1.3 },
  { id:"layer-venue", key:"venue", text:"The Grand Plaza \u2022 City Center",
    fontFamily:"'Inter', sans-serif", fontSize:12,
    color:"#7A7A7A", fontWeight:"400", textAlign:"center",
    top:84, left:50, letterSpacing:0.3, lineHeight:1.3 },
];
export default function AdminTemplatesPage() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBadge, setSelectedBadge] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<"upload"|"link">("upload");
  const [composerStep, setComposerStep] = useState<"image"|"layers">("image");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Wedding");
  const [customCategory, setCustomCategory] = useState("");
  const [badge, setBadge] = useState<"Free"|"Premium">("Free");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [previewStatus, setPreviewStatus] = useState<"loading"|"loaded"|"error">("loading");
  const [resolvingUrl, setResolvingUrl] = useState(false);
  const [layers, setLayers] = useState<TextLayerDraft[]>(DEFAULT_LAYERS);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>("layer-title");
  const previewRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ id:string; startX:number; startY:number; startTop:number; startLeft:number }|null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message:string; type:"success"|"error" }|null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isGreetingsIslandPage = useMemo(() => {
    if (!imageUrl) return false;
    const lower = imageUrl.toLowerCase();
    return lower.includes("greetingsisland.com") && !lower.includes("images.greetingsisland.com");
  }, [imageUrl]);

  const cleanAndSetImageUrl = (raw: string) => {
    let cleaned = raw.trim();
    if (cleaned.includes("google.") && cleaned.includes("imgurl=")) {
      try { const p = new URL(cleaned); const d = p.searchParams.get("imgurl"); if (d) cleaned = decodeURIComponent(d); } catch (_) {}
    }
    if (cleaned.includes("dropbox.com")) {
      cleaned = cleaned.replace(/\?dl=0/g,"?raw=1").replace(/&dl=0/g,"&raw=1");
      if (!cleaned.includes("raw=1")) cleaned += (cleaned.includes("?")?"&":"?")+"raw=1";
    }
    if (/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)$/i.test(cleaned)) {
      const id = cleaned.split("/").pop(); cleaned = `https://i.imgur.com/${id}.jpg`;
    }
    setImageUrl(cleaned); setPreviewStatus("loading");
  };

  const handleResolveImage = async () => {
    if (!imageUrl.trim()) { showToast("Please enter an image link first","error"); return; }
    try {
      setResolvingUrl(true);
      const res = await templateService.resolveImageUrl(imageUrl.trim());
      if (res.success && res.url) { setImageUrl(res.url); setPreviewStatus("loaded"); showToast("Image link resolved & verified successfully!"); }
      else showToast(res.error||"Could not resolve image from link","error");
    } catch (e:any) { showToast(e?.message||"Failed to resolve image","error"); }
    finally { setResolvingUrl(false); }
  };

  const showToast = (message:string, type:"success"|"error"="success") => {
    setToast({ message, type }); setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/login?redirect=/admin/templates");
      else if (user.role !== "ADMIN") router.push("/dashboard/ai-assistant");
    }
  }, [user, authLoading, router]);

  const loadTemplates = async (force = false) => {
    try {
      if (force) setRefreshing(true); else setLoading(true);
      setError(null);
      const list = await templateService.getTemplates(force);
      setTemplates(list);
    } catch (err:any) { setError(err?.message||"Failed to load templates."); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { if (user && user.role === "ADMIN") loadTemplates(); }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Please choose a valid image file (PNG, JPG, SVG, WebP)","error"); return; }
    if (file.size > 15*1024*1024) { showToast("File size exceeds 15MB limit","error"); return; }
    setImageFile(file); setFilePreview(URL.createObjectURL(file));
  };

  const selectedLayer = useMemo(() => layers.find((l) => l.id===selectedLayerId)??null,[layers,selectedLayerId]);

  const updateLayer = useCallback((id:string, patch:Partial<TextLayerDraft>) => {
    setLayers((prev) => prev.map((l) => (l.id===id?{...l,...patch}:l)));
  }, []);

  const addLayer = () => {
    const id = makeLayerId();
    const nl:TextLayerDraft = { id, key:id, text:"New Text", fontFamily:"'Inter', sans-serif",
      fontSize:14, color:"#1A1A1A", fontWeight:"400", textAlign:"center",
      top:50, left:50, letterSpacing:0.3, lineHeight:1.3 };
    setLayers((prev) => [...prev, nl]); setSelectedLayerId(id);
  };

  const removeLayer = (id:string) => {
    setLayers((prev) => prev.filter((l) => l.id!==id));
    setSelectedLayerId((prev) => (prev===id?null:prev));
  };

  const handleLayerMouseDown = useCallback((e:React.MouseEvent, layerId:string) => {
    e.preventDefault(); e.stopPropagation(); setSelectedLayerId(layerId);
    const layer = layers.find((l) => l.id===layerId);
    if (!layer||!previewRef.current) return;
    draggingRef.current = { id:layerId, startX:e.clientX, startY:e.clientY, startTop:layer.top, startLeft:layer.left };
    const handleMouseMove = (ev:MouseEvent) => {
      if (!draggingRef.current||!previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const dx = ((ev.clientX-draggingRef.current.startX)/rect.width)*100;
      const dy = ((ev.clientY-draggingRef.current.startY)/rect.height)*100;
      const newLeft = Math.max(0,Math.min(100,draggingRef.current.startLeft+dx));
      const newTop = Math.max(0,Math.min(100,draggingRef.current.startTop+dy));
      updateLayer(draggingRef.current.id,{left:newLeft,top:newTop});
    };
    const handleMouseUp = () => {
      draggingRef.current = null;
      window.removeEventListener("mousemove",handleMouseMove);
      window.removeEventListener("mouseup",handleMouseUp);
    };
    window.addEventListener("mousemove",handleMouseMove);
    window.addEventListener("mouseup",handleMouseUp);
  },[layers,updateLayer]);

  const handleProceedToLayers = () => {
    const liveImg = addMode==="upload"?filePreview:imageUrl;
    if (!liveImg) { showToast("Please upload an image or enter an image URL first","error"); return; }
    if (!title.trim()) { showToast("Please provide a template title first","error"); return; }
    setComposerStep("layers");
  };

  const doPublish = async (withLayers:boolean) => {
    if (!title.trim()) { showToast("Please provide a template title","error"); return; }
    const effectiveCategory = category==="Other"?(customCategory.trim()||"General"):category;
    try {
      setSubmitting(true);
      let finalImageUrl = "";
      if (addMode==="upload") {
        if (!imageFile) { showToast("Please choose an image file to upload","error"); setSubmitting(false); return; }
        const uploadResult = await templateService.uploadTemplateImage(imageFile,imageFile.name);
        if (!uploadResult.url) throw new Error("Could not upload template image file");
        finalImageUrl = uploadResult.url;
      } else {
        if (!imageUrl.trim()) { showToast("Please provide a valid image URL","error"); setSubmitting(false); return; }
        if (isGreetingsIslandPage) { showToast("Please paste the direct image link or upload the image file directly","error"); setSubmitting(false); return; }
        finalImageUrl = imageUrl.trim();
      }
      await templateService.createTemplate({
        title:title.trim(), name:title.trim(),
        category:effectiveCategory, badge,
        isPremium:badge==="Premium",
        imageUrl:finalImageUrl, thumbnailUrl:finalImageUrl,
        backgroundUrl:withLayers?finalImageUrl:undefined,
        tags:[effectiveCategory,badge],
        description:description.trim(),
        defaultTextLayers:withLayers&&layers.length>0?layers:undefined,
        isLayered:withLayers&&layers.length>0,
      });
      showToast("Template published to public gallery successfully!");
      setTitle(""); setImageUrl(""); setImageFile(null); setFilePreview(null);
      setDescription(""); setPreviewStatus("loading");
      setLayers(DEFAULT_LAYERS.map((l) => ({...l}))); setSelectedLayerId("layer-title");
      setComposerStep("image"); setIsAddModalOpen(false);
      await loadTemplates(true);
    } catch (err:any) {
      showToast(err?.response?.data?.error||err?.message||"Failed to create template","error");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (templateId:string) => {
    try {
      setDeleting(true);
      await templateService.deleteTemplate(templateId);
      showToast("Template deleted successfully"); setDeleteConfirmId(null);
      await loadTemplates(true);
    } catch (err:any) {
      showToast(err?.response?.data?.error||err?.message||"Could not delete template","error");
    } finally { setDeleting(false); }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false); setComposerStep("image");
    setTitle(""); setImageUrl(""); setImageFile(null); setFilePreview(null);
    setDescription(""); setPreviewStatus("loading");
    setLayers(DEFAULT_LAYERS.map((l) => ({...l}))); setSelectedLayerId("layer-title");
  };

  const availableCategories = useMemo(() => {
    const set = new Set<string>(["All"]);
    templates.forEach((t) => { if (t.category) set.add(t.category); });
    PRESET_CATEGORIES.forEach((c) => set.add(c));
    return Array.from(set);
  }, [templates]);

  const filteredTemplates = useMemo(() => templates.filter((t) => {
    const tm = (t.title||t.name||"").toLowerCase().includes(search.toLowerCase())||(t.category||"").toLowerCase().includes(search.toLowerCase());
    const cm = selectedCategory==="All"||(t.category||"").toLowerCase()===selectedCategory.toLowerCase();
    const bm = selectedBadge==="All"||(selectedBadge==="Premium"&&(t.isPremium||t.badge?.toLowerCase()==="premium"))||(selectedBadge==="Free"&&(!t.isPremium&&t.badge?.toLowerCase()!=="premium"));
    return tm&&cm&&bm;
  }),[templates,search,selectedCategory,selectedBadge]);

  const getDisplayImage = (t:Template) => {
    if (t.thumbnailUrl) return t.thumbnailUrl;
    if (t.imageUrl) return t.imageUrl; if (t.image) return t.image;
    const assetId = t.id.startsWith("tpl-")?t.id.slice(4):t.id;
    return `/assets/templates/${assetId}-mockup.svg`;
  };

  const livePreviewImage = addMode==="upload"?filePreview:imageUrl;

  if (authLoading||!user||user.role!=="ADMIN") {
    return (<div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-100/80 flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-100/80 flex flex-col font-body text-slate-800 relative overflow-hidden">
      <Navbar />
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6 pb-12 z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsOpen(true)} className="md:hidden p-2 rounded-xl border border-blue-100 bg-white/90 hover:bg-blue-50 transition-colors shadow-xs focus:outline-none"><Menu className="w-5 h-5 text-slate-600" /></button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-blue-100/80 text-blue-700 border border-blue-200/60">Admin Studio</span>
                <span className="text-xs text-slate-500 font-medium">{templates.length} Total Templates</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">Stationery & Templates Management</h1>
              <p className="text-sm text-slate-500 mt-0.5">Add new designs via image link or file upload. Existing baseline templates remain untouched.</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button onClick={() => loadTemplates(true)} disabled={refreshing} className="p-2.5 rounded-xl border border-blue-100/80 bg-white/90 hover:bg-blue-50 text-slate-700 transition-all shadow-xs disabled:opacity-50" title="Refresh templates">
              <RefreshCw className={`w-4 h-4 ${refreshing?"animate-spin text-blue-600":""}`} />
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md">
              <Plus className="w-4 h-4 stroke-[2.5]" /><span>Add New Template</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label:"Total Live", value:templates.length, color:"text-slate-900" },
            { label:"Free Templates", value:templates.filter((t) => !t.isPremium&&t.badge?.toLowerCase()!=="premium").length, color:"text-emerald-600" },
            { label:"Premium Templates", value:templates.filter((t) => t.isPremium||t.badge?.toLowerCase()==="premium").length, color:"text-purple-600" },
            { label:"Categories", value:availableCategories.length-1, color:"text-blue-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white/80 backdrop-blur-xs rounded-xl p-3.5 border border-blue-100/70 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">{s.label}</div>
              <div className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-blue-100/80 shadow-xs mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search templates by title or category..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>}
          </div>
          <div className="flex items-center gap-1.5 self-center">
            {(["All","Free","Premium"] as const).map((b) => (
              <button key={b} onClick={() => setSelectedBadge(b)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedBadge===b?"bg-slate-900 text-white shadow-2xs":"bg-slate-100 text-slate-600 hover:bg-slate-200/70"}`}>{b}</button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {availableCategories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${selectedCategory===cat?"bg-blue-600 text-white shadow-xs font-semibold":"bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-blue-100/60"}`}>{cat}</button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-slate-500 font-medium">Loading templates repository...</p>
          </div>
        ) : filteredTemplates.length===0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-blue-100/80 p-12 text-center max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs"><Layers className="w-6 h-6" /></div>
            <h3 className="text-base font-semibold text-slate-900">No templates found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filter tags, or add a new template above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredTemplates.map((t) => {
              const isPremium = t.isPremium||t.badge?.toLowerCase()==="premium";
              const imgSrc = getDisplayImage(t);
              return (
                <motion.div layout key={t.id} className="group bg-white rounded-2xl border border-blue-100/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col">
                  <div className="relative aspect-[3/4] bg-[#FAF8F5] overflow-hidden border-b border-slate-100">
                    <img src={imgSrc} alt={t.title||t.name} referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy"
                      onError={(e) => { if (!t.thumbnailUrl&&!t.imageUrl) { const assetId=t.id.startsWith("tpl-")?t.id.slice(4):t.id; e.currentTarget.src=`/assets/templates/${assetId}-bg.svg`; } }} />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold backdrop-blur-sm shadow-2xs ${isPremium?"bg-purple-900/90 text-purple-100":"bg-slate-900/80 text-white"}`}>
                        {isPremium&&<Crown className="w-3 h-3 text-amber-300" />}
                        {t.badge||(isPremium?"Premium":"Free")}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/90 text-slate-700 backdrop-blur-sm shadow-2xs border border-white/50">{t.category||"General"}</span>
                    </div>
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-4">
                      <a href={`/canvas?guest=true&templateId=${encodeURIComponent(t.id)}`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-semibold shadow-md hover:bg-slate-50 transition-all transform hover:scale-105">
                        <Eye className="w-3.5 h-3.5 text-blue-600" /><span>Test in Studio</span>
                      </a>
                    </div>
                  </div>
                  <div className="p-3.5 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 line-clamp-1">{t.title||t.name}</h3>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">ID: {t.id}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                      <a href={`/canvas?guest=true&templateId=${encodeURIComponent(t.id)}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />Studio
                      </a>
                      <button onClick={() => setDeleteConfirmId(t.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" title="Delete template from database">
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

      {/* ADD TEMPLATE MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div initial={{opacity:0,scale:0.95,y:10}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:10}}
              className="bg-white rounded-3xl shadow-2xl border border-blue-100 w-full overflow-hidden flex flex-col"
              style={{maxWidth:composerStep==="layers"?"940px":"672px",maxHeight:"93vh"}}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    {composerStep==="layers"?<Layers className="w-4 h-4" />:<Plus className="w-4 h-4 stroke-[2.5]" />}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{composerStep==="layers"?"Layer Editor \u2014 Position Text Elements":"Add New Invitation Template"}</h2>
                    <p className="text-xs text-slate-500">{composerStep==="layers"?"Drag layers on the preview to position them. Click a layer to edit properties.":"Provide image artwork and design settings"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {composerStep==="layers"&&<button onClick={() => setComposerStep("image")} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">&larr; Back</button>}
                  <button onClick={handleCloseModal} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Step indicator */}
              <div className="px-6 pt-3 pb-0 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-xs font-semibold ${composerStep==="image"?"text-blue-600":"text-emerald-600"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${composerStep==="image"?"bg-blue-600 text-white":"bg-emerald-100 text-emerald-700"}`}>
                      {composerStep==="image"?"1":<Check className="w-3 h-3" />}
                    </div>
                    <span>Image & Metadata</span>
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                  <div className={`flex items-center gap-1.5 text-xs font-semibold ${composerStep==="layers"?"text-blue-600":"text-slate-400"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${composerStep==="layers"?"bg-blue-600 text-white":"bg-slate-200 text-slate-500"}`}>2</div>
                    <span>Text Layer Editor</span>
                  </div>
                </div>
              </div>

              {composerStep==="image" ? (
                <form onSubmit={(e) => {e.preventDefault();handleProceedToLayers();}} className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Template Title <span className="text-rose-500">*</span></label>
                    <input type="text" required placeholder="e.g. Royal Gold Velvet Gala" value={title} onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        {PRESET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        <option value="Other">Other (Custom Category)</option>
                      </select>
                      {category==="Other"&&<input type="text" placeholder="Enter custom category..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="mt-2 w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Access Tier / Badge</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setBadge("Free")} className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${badge==="Free"?"bg-slate-900 border-slate-900 text-white shadow-xs":"bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}>Free</button>
                        <button type="button" onClick={() => setBadge("Premium")} className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${badge==="Premium"?"bg-purple-600 border-purple-600 text-white shadow-xs":"bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}>
                          <Crown className="w-3.5 h-3.5 text-amber-300" />Premium
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Background Image <span className="text-rose-500">*</span></label>
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-3">
                      {(["upload","link"] as const).map((m) => (
                        <button key={m} type="button" onClick={() => setAddMode(m)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${addMode===m?"bg-white text-slate-900 shadow-xs":"text-slate-500 hover:text-slate-900"}`}>
                          {m==="upload"?<UploadCloud className="w-3.5 h-3.5" />:<LinkIcon className="w-3.5 h-3.5" />}
                          <span>{m==="upload"?"Upload Image File":"Paste Web Image Link"}</span>
                        </button>
                      ))}
                    </div>
                    {addMode==="upload" ? (
                      <div>
                        <input type="file" ref={fileInputRef} accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleFileChange} className="hidden" />
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-blue-50/30 group">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"><UploadCloud className="w-5 h-5" /></div>
                          <p className="text-xs font-semibold text-slate-700">{imageFile?imageFile.name:"Click to browse or drag & drop image"}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Supports PNG, JPG, SVG, WebP (up to 15MB)</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input type="url" placeholder="https://images.unsplash.com/... or direct image link" value={imageUrl} onChange={(e) => cleanAndSetImageUrl(e.target.value)}
                              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400" />
                          </div>
                          {imageUrl.trim()&&(
                            <button type="button" onClick={handleResolveImage} disabled={resolvingUrl} className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer">
                              <Sparkles className={`w-3.5 h-3.5 ${resolvingUrl?"animate-spin":""}`} />
                              <span>{resolvingUrl?"Verifying...":"Verify Link"}</span>
                            </button>
                          )}
                        </div>
                        {isGreetingsIslandPage&&(
                          <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                            <div className="font-semibold flex items-center gap-1.5 text-amber-800"><AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />Greetings Island Webpage Link Detected</div>
                            <p className="mt-1 text-[11px] text-amber-700 leading-relaxed">Right-click the card on Greetings Island &rarr; &quot;Copy Image Address&quot; to get the direct CDN link, or upload the image file directly.</p>
                          </div>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1">Enter any direct image URL (SVG, PNG, JPG, WebP).</p>
                      </div>
                    )}
                  </div>
                  {livePreviewImage&&(
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                      <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-2xs flex items-center justify-center">
                        {previewStatus==="loading"&&<div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center z-10"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
                        {previewStatus==="error"?(
                          <div className="flex flex-col items-center justify-center text-center p-2 text-rose-500 z-10"><AlertCircle className="w-5 h-5 mb-1" /><span className="text-[9px] font-semibold leading-tight">Image load failed</span></div>
                        ):(
                          <img key={livePreviewImage} src={livePreviewImage} alt="Preview" referrerPolicy="no-referrer" crossOrigin="anonymous"
                            className={`w-full h-full object-cover transition-opacity duration-300 ${previewStatus==="loaded"?"opacity-100":"opacity-0"}`}
                            onLoad={() => setPreviewStatus("loaded")} onError={() => setPreviewStatus("error")} />
                        )}
                      </div>
                      <div className="text-xs text-slate-600 flex-1">
                        <div className="font-semibold text-slate-900">{title||"Template Title Preview"}</div>
                        <div className="text-slate-500 mt-0.5">Category: <span className="font-medium text-slate-700">{category==="Other"?customCategory||"Custom":category}</span></div>
                        <div className="text-slate-500">Badge: <span className="font-medium text-slate-700">{badge}</span></div>
                        <div className="mt-1.5">
                          {previewStatus==="loaded"&&<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"><Check className="w-3 h-3" /> Image Ready</span>}
                          {previewStatus==="error"&&<span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">Check URL or click &quot;Verify Link&quot;</span>}
                          {previewStatus==="loading"&&<span className="text-[11px] text-slate-400">Loading preview...</span>}
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description <span className="text-slate-400">(Optional)</span></label>
                    <textarea rows={2} placeholder="Brief description of this template..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button type="submit" className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <Layers className="w-4 h-4" /><span>Next: Edit Text Layers &rarr;</span>
                    </button>
                    <button type="button" onClick={() => doPublish(false)} disabled={submitting} className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer whitespace-nowrap">
                      {submitting?<div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />:<Sparkles className="w-4 h-4" />}
                      <span>Quick Publish</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex-1 flex overflow-hidden min-h-0">
                  {/* Canvas */}
                  <div className="flex-1 p-5 bg-slate-100/60 flex flex-col items-center justify-start overflow-y-auto">
                    <p className="text-[11px] text-slate-500 font-medium mb-3 text-center select-none">
                      <Move className="w-3.5 h-3.5 inline mr-1" />Drag layers to reposition. Click to select and edit.
                    </p>
                    <div ref={previewRef} className="relative rounded-2xl overflow-hidden shadow-xl select-none flex-shrink-0"
                      style={{width:"260px",height:"364px",background:livePreviewImage?`url(${livePreviewImage}) center / cover no-repeat #faf8f5`:"#faf8f5"}}
                      onClick={() => setSelectedLayerId(null)}>
                      {layers.map((layer) => {
                        const isSel = layer.id===selectedLayerId;
                        return (
                          <div key={layer.id}
                            className={`absolute px-1 py-0.5 cursor-move rounded transition-all ${isSel?"ring-2 ring-blue-500 ring-offset-1 bg-blue-50/20":"hover:ring-1 hover:ring-blue-300 hover:ring-offset-1 hover:bg-white/10"}`}
                            style={{top:`${layer.top}%`,left:`${layer.left}%`,transform:"translate(-50%,-50%)",fontFamily:layer.fontFamily,fontSize:`${Math.min(layer.fontSize,22)}px`,color:layer.color,fontWeight:layer.fontWeight,textAlign:layer.textAlign,letterSpacing:layer.letterSpacing?`${layer.letterSpacing}px`:undefined,lineHeight:layer.lineHeight??1.3,whiteSpace:"nowrap",zIndex:isSel?10:5}}
                            onMouseDown={(e) => handleLayerMouseDown(e,layer.id)}
                            onClick={(e) => {e.stopPropagation();setSelectedLayerId(layer.id);}}>
                            {layer.text||"Empty"}
                          </div>
                        );
                      })}
                      {layers.length===0&&<div className="absolute inset-0 flex items-center justify-center"><p className="text-xs text-white/60 font-medium bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-xs">Add a text layer &rarr;</p></div>}
                    </div>
                    {selectedLayer&&<div className="mt-2 text-[11px] text-slate-400 font-mono text-center">Position: {selectedLayer.left.toFixed(1)}% &#x2194; {selectedLayer.top.toFixed(1)}% &#x2195;</div>}
                  </div>

                  {/* Properties panel */}
                  <div className="w-[330px] shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Text Layers</span>
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => {setLayers(DEFAULT_LAYERS.map((l) => ({...l}))); setSelectedLayerId("layer-title");}} className="px-2 py-1 rounded-lg text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">Reset</button>
                          <button type="button" onClick={addLayer} className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors" title="Add layer"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <div className="space-y-1 max-h-[120px] overflow-y-auto">
                        {layers.map((layer) => (
                          <div key={layer.id} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all text-xs ${layer.id===selectedLayerId?"bg-blue-50 border border-blue-200 text-blue-700":"hover:bg-slate-50 text-slate-700 border border-transparent"}`}
                            onClick={() => setSelectedLayerId(layer.id)}>
                            <Type className="w-3 h-3 shrink-0 opacity-50" />
                            <span className="flex-1 truncate font-medium">{layer.text||"(empty)"}</span>
                            <span className="text-[10px] opacity-50">{layer.fontSize}px</span>
                            <button type="button" onClick={(e) => {e.stopPropagation();removeLayer(layer.id);}} className="p-0.5 rounded hover:bg-rose-100 hover:text-rose-600 text-slate-400 transition-colors"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                        {layers.length===0&&<p className="text-center text-xs text-slate-400 py-2">No layers. Click + to add.</p>}
                      </div>
                    </div>

                    {selectedLayer ? (
                      <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Layer Properties</p>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Text Content</label>
                          <textarea rows={2} value={selectedLayer.text} onChange={(e) => updateLayer(selectedLayer.id,{text:e.target.value})}
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Font Family</label>
                          <select value={selectedLayer.fontFamily} onChange={(e) => updateLayer(selectedLayer.id,{fontFamily:e.target.value})} className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                            {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Size (px)</label>
                            <input type="number" min={8} max={96} value={selectedLayer.fontSize} onChange={(e) => updateLayer(selectedLayer.id,{fontSize:Number(e.target.value)})} className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Weight</label>
                            <select value={selectedLayer.fontWeight} onChange={(e) => updateLayer(selectedLayer.id,{fontWeight:e.target.value})} className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                              {[["300","Light"],["400","Regular"],["500","Medium"],["600","SemiBold"],["700","Bold"],["800","ExtraBold"],["900","Black"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Color</label>
                            <div className="flex gap-1.5 items-center">
                              <input type="color" value={selectedLayer.color} onChange={(e) => updateLayer(selectedLayer.id,{color:e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white" />
                              <input type="text" value={selectedLayer.color} onChange={(e) => updateLayer(selectedLayer.id,{color:e.target.value})} className="flex-1 px-2 py-1.5 text-[11px] font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Alignment</label>
                            <div className="flex gap-1">
                              {(["left","center","right"] as const).map((align) => (
                                <button key={align} type="button" onClick={() => updateLayer(selectedLayer.id,{textAlign:align})} className={`flex-1 py-1.5 rounded-lg text-xs transition-colors ${selectedLayer.textAlign===align?"bg-blue-600 text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                                  {align==="left"?<AlignLeft className="w-3 h-3 mx-auto" />:align==="center"?<AlignCenter className="w-3 h-3 mx-auto" />:<AlignRight className="w-3 h-3 mx-auto" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Position (% of canvas size)</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[["Left %","left"],["Top %","top"]].map(([lbl,key]) => (
                              <div key={key}>
                                <label className="block text-[10px] text-slate-500 mb-0.5">{lbl}</label>
                                <input type="number" min={0} max={100} step={0.5}
                                  value={Math.round((selectedLayer as any)[key]*10)/10}
                                  onChange={(e) => updateLayer(selectedLayer.id,{[key]:Number(e.target.value)} as any)}
                                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Letter Spacing</label>
                            <input type="number" min={-2} max={20} step={0.1} value={selectedLayer.letterSpacing??0} onChange={(e) => updateLayer(selectedLayer.id,{letterSpacing:Number(e.target.value)})} className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Line Height</label>
                            <input type="number" min={1} max={3} step={0.05} value={selectedLayer.lineHeight??1.3} onChange={(e) => updateLayer(selectedLayer.id,{lineHeight:Number(e.target.value)})} className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center p-4">
                        <p className="text-xs text-slate-400 text-center">Click a layer on the canvas or in the list to edit its properties</p>
                      </div>
                    )}

                    <div className="p-3 border-t border-slate-100 shrink-0">
                      <button type="button" disabled={submitting} onClick={() => doPublish(true)}
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
                        {submitting?(
                          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Publishing...</span></>
                        ):(
                          <><Sparkles className="w-4 h-4" /><span>Publish Template ({layers.length} layer{layers.length!==1?"s":""})</span></>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmId&&(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3"><AlertCircle className="w-5 h-5" /></div>
              <h3 className="font-bold text-slate-900 text-base">Delete Template?</h3>
              <p className="text-xs text-slate-500 mt-1">Are you sure you want to remove template ID &quot;{deleteConfirmId}&quot;? This cannot be undone.</p>
              <div className="flex gap-2.5 mt-5">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirmId)} disabled={deleting} className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white transition-colors disabled:opacity-50">{deleting?"Deleting...":"Delete"}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast&&(
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 ${toast.type==="success"?"bg-emerald-900/90 text-emerald-100 border-emerald-700 backdrop-blur-sm":"bg-rose-900/90 text-rose-100 border-rose-700 backdrop-blur-sm"}`}>
            {toast.type==="success"?<Check className="w-4 h-4 text-emerald-400" />:<AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
