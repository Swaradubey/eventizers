import API from "./api";
import { templateCards } from "../lib/templateData";

export interface Template {
  id: string;
  name: string;
  category: string;
  content: string; // JSON string containing styling design (gradient, accentColor, emoji, description)
  isPremium: boolean;
  createdAt?: string;
}

export const getTemplates = async (): Promise<Template[]> => {
  try {
    const response = await API.get<Template[]>("/templates");
    if (response.data && Array.isArray(response.data) && response.data.length >= templateCards.length) {
      return response.data;
    }
    // Combine API templates with templateCards fallback so callers get all 111 templates
    const map = new Map<string, Template>();
    templateCards.forEach((tc) => {
      map.set(tc.id, {
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
      });
    });

    if (response.data && Array.isArray(response.data)) {
      response.data.forEach((t) => map.set(t.id, t));
    }

    return Array.from(map.values());
  } catch (err) {
    console.warn("API getTemplates failed, returning static templateCards registry:", err);
    return templateCards.map((tc) => ({
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
  }
};

const templateService = {
  getTemplates,
};

export default templateService;

