import API from "./api";
import { templateCards } from "../lib/templateData";

export interface Template {
  id: string;
  name: string;
  category: string;
  badge?: "FREE" | "PREMIUM" | "Trending" | string;
  content: string; // JSON string containing styling design (gradient, accentColor, emoji, description)
  isPremium: boolean;
  createdAt?: string;
}

export const getTemplates = async (): Promise<Template[]> => {
  try {
    const response = await API.get<Template[]>("/templates");
    if (response.data && Array.isArray(response.data) && response.data.length === templateCards.length) {
      return response.data;
    }
    return templateCards.map((tc) => ({
      id: tc.id,
      name: tc.title,
      category: tc.category || tc.type,
      badge: tc.badge || "Free",
      content: JSON.stringify({
        gradient: tc.gradient,
        accentColor: tc.accentColor,
        emoji: tc.emoji,
        host: tc.host,
        venue: tc.venue,
        description: tc.description,
        image: tc.image,
      }),
      isPremium: false,
    }));
  } catch (err) {
    return templateCards.map((tc) => ({
      id: tc.id,
      name: tc.title,
      category: tc.category || tc.type,
      badge: tc.badge || "Free",
      content: JSON.stringify({
        gradient: tc.gradient,
        accentColor: tc.accentColor,
        emoji: tc.emoji,
        host: tc.host,
        venue: tc.venue,
        description: tc.description,
        image: tc.image,
      }),
      isPremium: false,
    }));
  }
};

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

const templateService = {
  getTemplates,
  uploadTemplateImage,
};

export default templateService;


