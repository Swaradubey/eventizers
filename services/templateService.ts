import API from "./api";
import { 
  NEW_TEMPLATES, 
  NEW_TEMPLATES_CONFIG, 
  registerDynamicTemplates, 
  NewTemplateData 
} from "../lib/newTemplatesData";

export interface Template {
  id: string;
  name: string;
  title?: string;
  category: string;
  badge?: "FREE" | "PREMIUM" | "Trending" | "Free" | "Premium" | string;
  content: string; // JSON string containing styling design (gradient, accentColor, emoji, description)
  isPremium: boolean;
  createdAt?: string;
  thumbnailUrl?: string;
  fullThumbnailUrl?: string;
  imageUrl?: string;
  fullImageUrl?: string;
  coverImage?: string;
  backdrop?: any;
  envelope?: any;
  card?: any;
  defaultTextLayers?: any[];
  textElements?: any[];
  gradient?: string;
  accentColor?: string;
  emoji?: string;
  host?: string;
  venue?: string;
  description?: string;
  image?: string;
  backgroundImage?: string | { url?: string; src?: string };
  backgroundUrl?: string;
  canvasData?: {
    backgroundImage?: string | { url?: string; src?: string };
    layers?: any[];
    [key: string]: any;
  };
  layers?: any[];
  [key: string]: any;
}

export type BackendTemplate = Template;

const mapToTemplate = (t: any): Template => {
  let contentParsed: any = {};
  if (typeof t.content === 'string' && t.content) {
    try {
      contentParsed = JSON.parse(t.content);
    } catch (_) {}
  } else if (typeof t.content === 'object' && t.content) {
    contentParsed = t.content;
  }

  // Extract background image URL from all schema variations
  const rawBg =
    t.backgroundImage ||
    t.backgroundUrl ||
    t.canvasData?.backgroundImage ||
    contentParsed.backgroundImage ||
    contentParsed.backgroundUrl ||
    contentParsed.canvasData?.backgroundImage ||
    contentParsed.card?.artworkUrl ||
    t.card?.artworkUrl ||
    t.imageUrl ||
    t.thumbnailUrl ||
    t.image ||
    null;

  const bgImageUrl = typeof rawBg === 'object' && rawBg !== null
    ? (rawBg.url || rawBg.src || null)
    : (typeof rawBg === 'string' ? rawBg : null);

  const rawLayers =
    t.layers ||
    t.defaultTextLayers ||
    t.textElements ||
    t.canvasData?.layers ||
    contentParsed.layers ||
    contentParsed.defaultTextLayers ||
    contentParsed.canvasData?.layers ||
    [];

  const contentStr = typeof t.content === 'string' && t.content
    ? t.content
    : JSON.stringify({
        gradient: t.gradient || contentParsed.gradient,
        accentColor: t.accentColor || contentParsed.accentColor,
        emoji: t.emoji || contentParsed.emoji,
        host: t.host || contentParsed.host,
        venue: t.venue || contentParsed.venue,
        description: t.description || contentParsed.description,
        image: bgImageUrl || t.image || t.thumbnailUrl || t.imageUrl,
        backgroundImage: bgImageUrl,
        backgroundUrl: bgImageUrl,
        backdrop: t.backdrop || contentParsed.backdrop,
        envelope: t.envelope || contentParsed.envelope,
        card: {
          ...(contentParsed.card || {}),
          ...(t.card || {}),
          artworkUrl: bgImageUrl || t.card?.artworkUrl || contentParsed.card?.artworkUrl,
        },
        canvasData: {
          backgroundImage: bgImageUrl,
          layers: rawLayers,
          ...(t.canvasData || contentParsed.canvasData || {}),
        },
        defaultTextLayers: rawLayers,
      });

  return {
    id: t.id,
    name: t.name || t.title || "Template",
    title: t.title || t.name || "Template",
    category: t.category || "General",
    badge: t.badge || (t.isPremium ? "Premium" : "Free"),
    isPremium: Boolean(t.isPremium),
    content: contentStr,
    thumbnailUrl: t.thumbnailUrl || bgImageUrl || t.imageUrl || t.image,
    fullThumbnailUrl: t.fullThumbnailUrl,
    imageUrl: t.imageUrl || bgImageUrl || t.thumbnailUrl || t.image,
    fullImageUrl: t.fullImageUrl,
    coverImage: t.coverImage || bgImageUrl || t.imageUrl || t.image,
    backgroundImage: bgImageUrl,
    backgroundUrl: bgImageUrl,
    canvasData: {
      backgroundImage: bgImageUrl,
      layers: rawLayers,
      ...(t.canvasData || contentParsed.canvasData || {}),
    },
    backdrop: t.backdrop || contentParsed.backdrop,
    envelope: t.envelope || contentParsed.envelope,
    card: {
      backgroundColor: "#ffffff",
      aspectRatio: "5x7",
      ...(contentParsed.card || {}),
      ...(t.card || {}),
      artworkUrl: bgImageUrl || t.card?.artworkUrl || contentParsed.card?.artworkUrl,
    },
    defaultTextLayers: rawLayers,
    textElements: rawLayers,
    layers: rawLayers,
    gradient: t.gradient || contentParsed.gradient,
    accentColor: t.accentColor || contentParsed.accentColor,
    emoji: t.emoji || contentParsed.emoji,
    host: t.host || contentParsed.host,
    venue: t.venue || contentParsed.venue,
    description: t.description || contentParsed.description,
    image: bgImageUrl || t.image || t.thumbnailUrl || t.imageUrl,
    ...t,
  };
};

// In-memory cache for ultra-fast UI rendering
let cachedTemplates: Template[] | null = null;
let fetchPromise: Promise<Template[]> | null = null;

/**
 * Fetch all templates from backend API and sync with frontend designer registry.
 */
export const getTemplates = async (forceRefresh = false): Promise<Template[]> => {
  if (!forceRefresh && cachedTemplates && cachedTemplates.length > 0) {
    return cachedTemplates;
  }

  if (fetchPromise && !forceRefresh) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const response = await API.get<Template[]>("/templates");
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Register newly fetched templates into the global designer template config
        registerDynamicTemplates(response.data);
        cachedTemplates = response.data.map(mapToTemplate);
        return cachedTemplates;
      }
      cachedTemplates = NEW_TEMPLATES.map(mapToTemplate);
      return cachedTemplates;
    } catch (err) {
      console.warn("[TemplateService] Backend templates fetch failed, falling back to local registry:", err);
      cachedTemplates = NEW_TEMPLATES.map(mapToTemplate);
      return cachedTemplates;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
};

/**
 * Fetch a single template by ID from backend or local registry.
 */
export const getTemplateById = async (templateId: string): Promise<NewTemplateData | null> => {
  if (!templateId) return null;
  const cleanId = templateId.trim();

  // Check local cache first
  if (NEW_TEMPLATES_CONFIG[cleanId]) {
    return NEW_TEMPLATES_CONFIG[cleanId];
  }

  try {
    const response = await API.get<Template>(`/templates/${cleanId}`);
    if (response.data && response.data.id) {
      registerDynamicTemplates([response.data]);
      return NEW_TEMPLATES_CONFIG[response.data.id] || null;
    }
  } catch (err) {
    console.warn(`[TemplateService] Could not fetch template '${templateId}' from backend:`, err);
  }

  return NEW_TEMPLATES_CONFIG[cleanId] || null;
};

/**
 * Upload canvas snapshot or user template image to backend.
 */
export const uploadTemplateImage = async (
  fileOrBlob: File | Blob,
  filename = "canvas_snapshot.png"
): Promise<{ success: boolean; url: string; fileUrl: string; message?: string }> => {
  const formData = new FormData();
  formData.append("templateFile", fileOrBlob, filename);

  const response = await API.post<{
    success: boolean;
    url?: string;
    fileUrl?: string;
    message?: string;
  }>("/templates/upload", formData);

  const finalUrl = response.data.url || response.data.fileUrl || "";
  return {
    success: response.data.success ?? true,
    url: finalUrl,
    fileUrl: finalUrl,
    message: response.data.message,
  };
};

/**
 * Invalidate in-memory template cache so subsequent calls fetch fresh DB data
 */
export const invalidateTemplateCache = () => {
  cachedTemplates = null;
  fetchPromise = null;
};

/**
 * Create a new template (Admin)
 */
export const createTemplate = async (templateData: {
  title?: string;
  name?: string;
  category: string;
  badge?: string;
  isPremium?: boolean;
  imageUrl?: string;
  thumbnailUrl?: string;
  backgroundUrl?: string;
  backgroundImage?: string;
  canvasData?: any;
  tags?: string[];
  description?: string;
  defaultTextLayers?: any[];
  layers?: any[];
  isLayered?: boolean;
  aspectRatio?: string;
  backgroundColor?: string;
}): Promise<Template> => {
  const response = await API.post<{ success: boolean; template: any }>("/templates", templateData);
  invalidateTemplateCache();
  const created = mapToTemplate(response.data.template || response.data);
  registerDynamicTemplates([created]);
  return created;
};

/**
 * Resolve, validate and pre-cache a remote image URL via backend
 */
export const resolveImageUrl = async (url: string): Promise<{ success: boolean; url: string; error?: string }> => {
  try {
    const response = await API.post<{ success: boolean; url: string }>("/templates/resolve-image", { url });
    return {
      success: true,
      url: response.data.url,
    };
  } catch (err: any) {
    return {
      success: false,
      url,
      error: err?.response?.data?.error || err.message || "Failed to resolve image",
    };
  }
};

/**
 * Delete a template by ID (Admin)
 */
export const deleteTemplate = async (templateId: string): Promise<boolean> => {
  await API.delete(`/templates/${templateId}`);
  invalidateTemplateCache();
  return true;
};

const templateService = {
  getTemplates,
  getTemplateById,
  uploadTemplateImage,
  createTemplate,
  deleteTemplate,
  resolveImageUrl,
  invalidateTemplateCache,
};

export default templateService;


