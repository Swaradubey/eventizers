"use client";

import React, { useState, useEffect } from "react";
import { getImageUrl } from "../utils/imageUrl";
import { NEW_TEMPLATE_IMAGES } from "../lib/newTemplatesData";

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
  return mapping[templateId] || null;
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
  selectedTemplateId?: string | null;
  designData?: {
    previewUrl?: string;
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
  onPreview?: (url: string, title?: string) => void;
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

  // 1. Resolve raw candidate image from all potential fields
  const rawImage =
    event.imageUrl ||
    event.coverImage ||
    event.thumbnail ||
    event.thumbnailUrl ||
    event.uploadedFileUrl ||
    event.previewUrl ||
    event.designData?.previewUrl ||
    getTemplateImage(event.selectedTemplateId) ||
    "";

  // 2. Format with URL resolver
  const resolvedUrl = getImageUrl(rawImage);

  // Reset error state when the image URL changes
  useEffect(() => {
    setHasError(false);
  }, [resolvedUrl]);

  const eventTitle = event.title?.trim() || "Event";
  const initialLetter = eventTitle.charAt(0).toUpperCase() || "E";
  const finalAlt = alt || eventTitle;
  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  const handleImageClick = (e: React.MouseEvent) => {
    if (onPreview && resolvedUrl && !hasError) {
      e.stopPropagation();
      onPreview(resolvedUrl, eventTitle);
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

  // If no URL or failed to load, render fallback badge directly
  if (!resolvedUrl || hasError) {
    return (
      <div className={`relative flex-shrink-0 ${className}`}>
        {fallbackBadge}
      </div>
    );
  }

  const isInteractive = clickable && Boolean(onPreview);

  const imageElement = (
    <img
      src={resolvedUrl}
      crossOrigin="anonymous"
      alt={finalAlt}
      loading="lazy"
      onError={() => setHasError(true)}
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
