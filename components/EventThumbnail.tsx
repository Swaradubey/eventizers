"use client";

import React, { useState, useEffect } from "react";
import { getImageUrl } from "../utils/imageUrl";
import { NEW_TEMPLATE_IMAGES, getTemplateConfig } from "../lib/newTemplatesData";

export const getTemplateImage = (templateId?: string | null): string | null => {
  if (!templateId) return null;
  const mapping: Record<string, string> = {
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
    ...NEW_TEMPLATE_IMAGES,
  };
  if (mapping[templateId]) return mapping[templateId];

  // Dynamically resolve artwork from template config
  const config = getTemplateConfig(templateId);
  if (config) {
    const candidate =
      config.image ||
      config.decorationImage ||
      (config.card as any)?.artworkUrl ||
      (config.card as any)?.borderIllustration ||
      (config.card as any)?.decorativeBorderSvgUrl ||
      null;
    if (candidate) return candidate;
  }
  return null;
};

export interface EventThumbnailEvent {
  id?: string;
  title?: string;
  coverImage?: string | null;
  imageUrl?: string | null;
  thumbnail?: string | null;
  thumbnailUrl?: string | null;
  uploadedFileUrl?: string | null;
  previewUrl?: string | null;
  templatePreviewUrl?: string | null;
  previewImage?: string | null;
  selectedTemplateId?: string | null;
  templateId?: string | null;
  template?: {
    id?: string | null;
    previewUrl?: string | null;
    thumbnailUrl?: string | null;
    imageUrl?: string | null;
    [key: string]: any;
  } | null;
  designData?: {
    previewUrl?: string;
    coverImage?: string;
    [key: string]: any;
  } | null;
  canvasState?: {
    previewUrl?: string | null;
    thumbnailUrl?: string | null;
    imageUrl?: string | null;
    templateId?: string | null;
    [key: string]: any;
  } | string | null;
  invitation?: {
    imageUrl?: string | null;
    previewUrl?: string | null;
    templateId?: string | null;
    [key: string]: any;
  } | null;
  [key: string]: any;
}

export interface EventThumbnailProps {
  event: EventThumbnailEvent;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full" | "custom";
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  roundedClassName?: string;
  onPreview?: (url: string, title?: string, event?: EventThumbnailEvent) => void;
  alt?: string;
  clickable?: boolean;
}

const sizeClasses: Record<string, string> = {
  xs: "w-8 h-8 text-xs",
  sm: "w-10 h-10 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-base",
  xl: "w-20 sm:w-24 h-20 sm:h-24 text-lg",
  full: "w-full h-full text-base",
  custom: "",
};

export default function EventThumbnail({
  event,
  size = "md",
  className = "",
  imageClassName = "",
  fallbackClassName = "",
  roundedClassName = "rounded-xl",
  onPreview,
  alt,
  clickable = true,
}: EventThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  // Parse canvasState if it was returned as a serialized JSON string
  let parsedCanvasState: any = null;
  if (event.canvasState) {
    if (typeof event.canvasState === "object") {
      parsedCanvasState = event.canvasState;
    } else if (typeof event.canvasState === "string") {
      try {
        parsedCanvasState = JSON.parse(event.canvasState);
      } catch (_) {}
    }
  }

  const candidateTemplateId =
    event.selectedTemplateId ||
    event.templateId ||
    event.template?.id ||
    parsedCanvasState?.templateId ||
    parsedCanvasState?.activeTemplateId ||
    event.invitation?.templateId ||
    null;

  // Attempt to resolve the most accurate, high-res artwork or cover image
  const rawImage =
    parsedCanvasState?.backgroundImageUrl ||
    (parsedCanvasState?.cardBg?.type === 'image' ? parsedCanvasState.cardBg.value : null) ||
    event?.previewImage ||
    event?.templatePreviewUrl ||
    event?.previewUrl ||
    event?.imageUrl ||
    event?.coverImage ||
    event?.thumbnailUrl ||
    event?.thumbnail ||
    event?.uploadedFileUrl ||
    event?.invitation?.previewUrl ||
    event?.invitation?.imageUrl ||
    event?.template?.previewUrl ||
    event?.template?.thumbnailUrl ||
    event?.template?.imageUrl ||
    event?.designData?.previewUrl ||
    event?.designData?.coverImage ||
    (typeof event?.canvasState === 'object' && (event.canvasState as any)?.previewUrl) ||
    (typeof event?.canvasState === 'object' && (event.canvasState as any)?.thumbnailUrl) ||
    (typeof event?.canvasState === 'object' && (event.canvasState as any)?.imageUrl) ||
    getTemplateImage(candidateTemplateId) ||
    "/assets/templates/birthday.jpg";

  // 2. Format with URL resolver
  const resolvedUrl = getImageUrl(rawImage);
  const [currentSrc, setCurrentSrc] = useState(resolvedUrl);

  // Reset error & source state when the resolved URL changes
  useEffect(() => {
    setCurrentSrc(resolvedUrl);
    setHasError(false);
  }, [resolvedUrl]);

  const eventTitle = event.title?.trim() || "Event";
  const initialLetter = eventTitle.charAt(0).toUpperCase() || "E";
  const finalAlt = alt || eventTitle;
  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  const handleImageError = () => {
    // If the custom snapshot fails to load, gracefully attempt template artwork before falling back to initial badge
    const tplFallback = candidateTemplateId ? getImageUrl(getTemplateImage(candidateTemplateId)) : "";
    if (tplFallback && currentSrc !== tplFallback) {
      setCurrentSrc(tplFallback);
    } else {
      setHasError(true);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (onPreview && (currentSrc || candidateTemplateId) && !hasError) {
      e.stopPropagation();
      onPreview(currentSrc, eventTitle, event);
    }
  };

  // Fallback badge UI
  const fallbackBadge = (
    <div
      className={`bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm select-none ${roundedClassName} ${currentSizeClass} ${fallbackClassName}`}
      title={eventTitle}
    >
      {initialLetter}
    </div>
  );

  // If no URL or all load attempts failed, render fallback badge directly
  if (!currentSrc || hasError) {
    return (
      <div className={`relative flex-shrink-0 ${className}`}>
        {fallbackBadge}
      </div>
    );
  }

  const isInteractive = clickable && Boolean(onPreview);

  const imageElement = (
    <img
      src={currentSrc}
      alt={finalAlt}
      loading="lazy"
      onError={handleImageError}
      className={`object-cover border border-slate-200/80 shadow-sm flex-shrink-0 ${roundedClassName} ${currentSizeClass} ${imageClassName}`}
    />
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={handleImageClick}
        className={`relative flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${roundedClassName} transition-transform hover:scale-105 active:scale-95 cursor-pointer ${className}`}
        title={`Preview ${eventTitle} invitation`}
      >
        {imageElement}
      </button>
    );
  }

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {imageElement}
    </div>
  );
}
