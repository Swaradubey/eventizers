"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize2,
  Sparkles,
  Film,
} from "lucide-react";

interface VideoInvitePlayerProps {
  src?: string | null;
  poster?: string | null;
  title?: string;
  subtitle?: string;
  badge?: string;
  aspectRatio?: "9/16" | "5/7" | "16/9" | string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  showOverlayDetails?: boolean;
  eventDetails?: {
    name?: string;
    title?: string;
    age?: string;
    date?: string;
    venue?: string;
  };
}

export default function VideoInvitePlayer({
  src,
  poster,
  title,
  subtitle,
  badge = "AI Video Invite",
  aspectRatio = "9/16",
  autoPlay = true,
  loop = true,
  muted = true,
  className = "",
  showOverlayDetails = true,
  eventDetails,
}: VideoInvitePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveSrc = hasError
    ? "/videos/golden-celebration.mp4"
    : src || "/videos/golden-celebration.mp4";

  // Handle auto-hide controls on mouse idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2800);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("[VideoInvitePlayer] play error:", err);
          setIsPlaying(false);
        });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleReplay = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => console.warn("[VideoInvitePlayer] replay error:", err));
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Number(e.target.value);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const toggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const displayTitle = eventDetails?.name || eventDetails?.title || title || "";
  const displaySubtitle = eventDetails?.date || subtitle || "";
  const displayVenue = eventDetails?.venue || "";
  const displayAge = eventDetails?.age || "";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
      }}
      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-950 border border-white/15 shadow-2xl flex items-center justify-center select-none ${className}`}
      style={{
        aspectRatio: aspectRatio === "9/16" ? "9 / 16" : aspectRatio === "5/7" ? "5 / 7" : "9 / 16",
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={effectiveSrc}
        poster={poster || undefined}
        playsInline
        autoPlay={autoPlay}
        loop={loop}
        muted={isMuted}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration || 0);
            setIsLoaded(true);
            setHasError(false);
          }
        }}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
          }
        }}
        onEnded={() => {
          if (!loop) setIsPlaying(false);
        }}
        onError={() => {
          console.warn("[VideoInvitePlayer] Source failed, falling back to bundled video:", effectiveSrc);
          if (!hasError) setHasError(true);
        }}
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Top Overlay Badges */}
      <div
        className={`absolute top-3 inset-x-3 z-20 flex items-center justify-between transition-opacity duration-300 pointer-events-none ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-bold text-amber-400 uppercase tracking-wider shadow-lg">
          <Sparkles className="size-3 text-amber-400 shrink-0" />
          <span>{badge}</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-white/80">
          <Film className="size-3 text-white/70" />
          <span>9:16 HD</span>
        </span>
      </div>

      {/* Center Big Play/Pause Touch Target */}
      <div
        onClick={togglePlay}
        className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300 bg-black/20 ${
          !isPlaying ? "opacity-100" : showControls ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className="size-14 sm:size-16 rounded-full bg-black/70 hover:bg-black/85 text-white border border-white/30 backdrop-blur-md flex items-center justify-center shadow-2xl transition-transform active:scale-90 hover:scale-105 cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="size-6 sm:size-7 text-white fill-white" />
          ) : (
            <Play className="size-6 sm:size-7 text-white fill-white ml-0.5" />
          )}
        </button>
      </div>

      {/* Event Details Live Overlay (Rendered directly on video) */}
      {showOverlayDetails && (displayTitle || displaySubtitle || displayVenue) && (
        <div
          className={`absolute bottom-16 inset-x-3 sm:inset-x-4 z-20 transition-opacity duration-300 pointer-events-none ${
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-3.5 text-left shadow-2xl space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-wide truncate">
                {displayTitle}
              </h4>
              {displayAge && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/40 text-[10px] font-bold shrink-0">
                  {displayAge}
                </span>
              )}
            </div>
            {displaySubtitle && (
              <p className="text-[10px] sm:text-[11px] text-amber-200/90 font-medium truncate">
                {displaySubtitle}
              </p>
            )}
            {displayVenue && (
              <p className="text-[10px] text-white/70 truncate flex items-center gap-1">
                <span className="text-amber-400">📍</span>
                <span>{displayVenue}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-30 p-2.5 sm:p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 flex flex-col gap-1.5 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Timeline Slider */}
        <div className="flex items-center gap-2 w-full">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Video playback progress"
            className="w-full h-1 sm:h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:h-2 transition-all"
          />
        </div>

        {/* Action Controls & Timestamps */}
        <div className="flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 hover:text-amber-400 transition cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}
            </button>
            <button
              type="button"
              onClick={handleReplay}
              className="p-1 hover:text-amber-400 transition cursor-pointer"
              title="Replay"
            >
              <RotateCcw className="size-3.5" />
            </button>
            <span className="text-[10px] sm:text-[11px] font-mono text-white/75">
              {formatSeconds(currentTime)} / {formatSeconds(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 hover:text-amber-400 transition cursor-pointer rounded-lg hover:bg-white/10"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="size-4 text-red-400" /> : <Volume2 className="size-4 text-emerald-400" />}
            </button>
            <button
              type="button"
              onClick={toggleFullScreen}
              className="p-1.5 hover:text-amber-400 transition cursor-pointer rounded-lg hover:bg-white/10"
              title="Fullscreen"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
