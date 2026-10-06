import { NEW_TEMPLATE_IMAGES } from "@/lib/newTemplatesData";

/**
 * Local `/public/assets/templates/*` artwork for the classic template ids.
 * Used as a fallback whenever an invitation only stores a snapshot / data URL.
 */
export const TEMPLATE_IMAGE_FALLBACK: Record<string, string> = {
  "tpl-birthday-maya": "/assets/templates/birthday.jpg",
  "tpl-wedding-liam": "/assets/templates/wedding.jpg",
  "tpl-corporate-launch": "/assets/templates/corporate.jpg",
  "tpl-dinner-party": "/assets/templates/dinner.jpg",
  "tpl-baby-shower": "/assets/templates/babyshower.jpg",
  "tpl-charity-gala": "/assets/templates/gala.jpg",
  "tpl-live-music": "/assets/templates/music.jpg",
  "tpl-anniversary-james": "/assets/templates/anniversary.jpg",
  "tpl-grad-gala": "/assets/templates/graduation_gala.jpg",
  "tpl-grad-class2026": "/assets/templates/graduation_class_2026.jpg",
  "tpl-grad-degree": "/assets/templates/graduation_degree.jpg",
  "tpl-comm-meetup": "/assets/templates/community_meetup.jpg",
  "tpl-comm-celebration": "/assets/templates/community_celebration.jpg",
  "tpl-comm-volunteer": "/assets/templates/community_volunteer.jpg",
  "tpl-net-professional": "/assets/templates/networking_professional.jpg",
  "tpl-net-founders": "/assets/templates/networking_founders.jpg",
  "tpl-net-connections": "/assets/templates/networking_connections.jpg",
};

export function getTemplateImage(templateId?: string | null): string | null {
  if (!templateId) return null;
  return TEMPLATE_IMAGE_FALLBACK[templateId] || NEW_TEMPLATE_IMAGES[templateId] || null;
}
