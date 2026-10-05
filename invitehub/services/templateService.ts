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
  [key: string]: any;
}

export type BackendTemplate = Template;

const mapToTemplate = (t: any): Template => {
  const contentStr = typeof t.content === 'string' && t.content
    ? t.content
    : JSON.stringify({
        gradient: t.gradient,
        accentColor: t.accentColor,
        emoji: t.emoji,
        host: t.host,
        venue: t.venue,
        description: t.description,
        image: t.image || t.thumbnailUrl || t.imageUrl,
        backdrop: t.backdrop,
        envelope: t.envelope,
        card: t.card,
        defaultTextLayers: t.defaultTextLayers,
      });

  return {
    id: t.id,
    name: t.name || t.title || "Template",
    title: t.title || t.name || "Template",
    category: t.category || "General",
    badge: t.badge || (t.isPremium ? "Premium" : "Free"),
    isPremium: Boolean(t.isPremium),
    content: contentStr,
    thumbnailUrl: t.thumbnailUrl || t.imageUrl || t.image,
    fullThumbnailUrl: t.fullThumbnailUrl,
    imageUrl: t.imageUrl || t.thumbnailUrl || t.image,
    fullImageUrl: t.fullImageUrl,
    coverImage: t.coverImage || t.imageUrl || t.image,
    backdrop: t.backdrop,
    envelope: t.envelope,
    card: t.card,
    defaultTextLayers: t.defaultTextLayers || [],
    textElements: t.textElements || t.defaultTextLayers || [],
    gradient: t.gradient,
    accentColor: t.accentColor,
    emoji: t.emoji,
    host: t.host,
    venue: t.venue,
    description: t.description,
    image: t.image || t.thumbnailUrl || t.imageUrl,
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
  tags?: string[];
  description?: string;
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


