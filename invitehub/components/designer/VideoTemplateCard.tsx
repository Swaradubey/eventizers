"use client";

import React, { useState, useRef } from "react";
import { Check, Volume2, VolumeX, Sparkles, Play } from "lucide-react";
import { VideoTemplate } from "@/data/videoTemplates";

interface VideoTemplateCardProps {
  template: VideoTemplate;
  isSelected: boolean;
  onSelect: (template: VideoTemplate) => void;
  className?: string;
}

export default function VideoTemplateCard({
  template,
  isSelected,
  onSelect,
  className = "",
}: VideoTemplateCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isSoundActive, setIsSoundActive] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSound = !isSoundActive;
    setIsSoundActive(nextSound);
    if (videoRef.current) {
      videoRef.current.muted = !nextSound;
    }
  };

  return (
    <div
      onClick={() => onSelect(template)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex flex-col shrink-0 w-[175px] sm:w-[200px] rounded-2xl overflow-hidden border p-2 transition-all duration-300 cursor-pointer select-none ${
        isSelected
          ? "border-amber-400 bg-amber-500/15 shadow-xl shadow-amber-500/15 ring-2 ring-amber-400/60 scale-[1.02]"
          : "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.07] hover:scale-[1.01]"
      } ${className}`}
    >
      {/* Thumbnail & Video Preview Container (9:14 aspect ratio) */}
      <div className="relative aspect-[9/13] w-full rounded-xl overflow-hidden bg-black/80">
        {/* Background poster/image */}
        <img
          src={template.thumbnail}
          alt={template.title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
          }`}
        />

        {/* Hover / Active Video Looper */}
        <video
          ref={videoRef}
          src={template.videoUrl}
          playsInline
          loop
          muted={!isSoundActive}
          preload="none"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
            isHovered || isSelected ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Top Badges: Tier & Selected Checkmark */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10">
          <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[9px] font-bold text-amber-300 uppercase tracking-wider border border-white/10">
            {template.badge || template.tier}
          </span>

          {isSelected ? (
            <div className="size-5 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg animate-in zoom-in-75">
              <Check className="size-3 stroke-[3]" />
            </div>
          ) : (
            <div className="size-5 rounded-full bg-black/50 text-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="size-2.5 fill-current ml-0.5" />
            </div>
          )}
        </div>

        {/* Sound Toggle Indicator Button */}
        <div className="absolute bottom-2 right-2 z-10">
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={isSoundActive ? "Mute audio preview" : "Unmute audio preview"}
            title={isSoundActive ? "Sound On (Click to mute)" : "Sound Off (Click to hear audio)"}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md ${
              isSoundActive
                ? "bg-amber-500 text-black hover:bg-amber-400 ring-1 ring-amber-300"
                : "bg-black/70 text-white/80 hover:text-white hover:bg-black/90 border border-white/15"
            }`}
          >
            {isSoundActive ? (
              <Volume2 className="size-3.5 animate-pulse" />
            ) : (
              <VolumeX className="size-3.5" />
            )}
          </button>
        </div>

        {/* Subtitle / Category gradient banner on preview bottom */}
        <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Info Section */}
      <div className="pt-2 px-1 flex flex-col gap-0.5">
        <h4
          className={`text-xs sm:text-sm font-bold tracking-tight truncate transition-colors ${
            isSelected ? "text-amber-300 font-extrabold" : "text-white group-hover:text-amber-200"
          }`}
        >
          {template.title}
        </h4>
        <div className="flex items-center justify-between text-[10px] text-neutral-400">
          <span className="truncate">{template.category}</span>
          <span className="text-amber-400/90 font-medium shrink-0 flex items-center gap-0.5">
            <Sparkles className="size-2.5" />
            <span>9:16</span>
          </span>
        </div>
      </div>
    </div>
  );
}
