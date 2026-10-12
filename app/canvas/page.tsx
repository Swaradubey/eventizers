"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

function CanvasBridgeContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuest = searchParams?.get("guest") === "true";

  useEffect(() => {
    if (authLoading) return;

    // Read the consolidated guest draft from localStorage or sessionStorage
    let guestDraft: any = null;
    try {
      const raw = localStorage.getItem("guestEventDraft") || sessionStorage.getItem("guestEventDraft");
      if (raw) {
        guestDraft = JSON.parse(raw);
      }
    } catch (e) {}

    const isSafeUrlParam = (val?: string | null): val is string => {
      if (!val || typeof val !== "string") return false;
      const trimmed = val.trim();
      if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return false;
      return trimmed.length < 500;
    };

    // Build the redirect URL to the actual canvas at /dashboard/invitations
    const params = new URLSearchParams();
    searchParams.forEach((val, key) => {
      if (key === "celebrantPhoto" && val) {
        try {
          sessionStorage.setItem("pending_celebrant_photo", val);
          localStorage.setItem("pending_celebrant_photo", val);
        } catch (_) {}
      }
      if (key === "uploadedImageUrl" && val) {
        try {
          sessionStorage.setItem("pending_upload_invite", val);
          localStorage.setItem("pending_upload_invite", val);
        } catch (_) {}
      }
      if (key === "videoUrl" && val) {
        try {
          sessionStorage.setItem("pending_video_url", val);
          localStorage.setItem("pending_video_url", val);
        } catch (_) {}
      }
      if (isSafeUrlParam(val)) {
        params.set(key, val);
      }
    });

    params.set("studio", "true");
    if (isGuest || !user) {
      params.set("guest", "1");
    }

    // Video Invite Flow is the primary workflow for invitation creation & editing
    const isVideoFlow = searchParams.get("videoInvite") !== "0";

    if (isVideoFlow) {
      params.set("videoInvite", "1");
      params.set("aspectRatio", "9/16");
      const vUrl = searchParams.get("videoUrl") || guestDraft?.videoUrl || "";
      if (vUrl) {
        if (isSafeUrlParam(vUrl)) {
          params.set("videoUrl", vUrl);
        }
        try {
          sessionStorage.setItem("pending_video_url", vUrl);
          localStorage.setItem("pending_video_url", vUrl);
        } catch (_) {}
      }
      const media = searchParams.get("uploadedImageUrl") || searchParams.get("imageUrl") || guestDraft?.uploadUrl || guestDraft?.imageUrl || vUrl;
      if (media) {
        if (isSafeUrlParam(media)) {
          params.set("uploadedImageUrl", media);
        }
        try {
          sessionStorage.setItem("pending_upload_invite", media);
          localStorage.setItem("pending_upload_invite", media);
        } catch (_) {}
      }
      const tId = searchParams.get("templateId") || guestDraft?.templateId;
      if (tId) {
        params.set("templateId", tId);
        try {
          sessionStorage.setItem("pending_template_id", tId);
          localStorage.setItem("pending_template_id", tId);
        } catch (_) {}
      }
      const title = searchParams.get("title") || guestDraft?.title || guestDraft?.uploadTitle;
      if (title) {
        params.set("title", title);
        try {
          sessionStorage.setItem("pending_upload_title", title);
          localStorage.setItem("pending_upload_title", title);
        } catch (_) {}
      }
      const date = searchParams.get("date") || guestDraft?.date;
      if (date) {
        params.set("date", date);
        try {
          sessionStorage.setItem("pending_event_date", date);
          localStorage.setItem("pending_event_date", date);
        } catch (_) {}
      }
      const venue = searchParams.get("venue") || guestDraft?.venue;
      if (venue) {
        params.set("venue", venue);
        try {
          sessionStorage.setItem("pending_venue", venue);
          localStorage.setItem("pending_venue", venue);
        } catch (_) {}
      }
      const celeb = searchParams.get("celebrantPhoto") || guestDraft?.celebrantPhoto;
      if (celeb) {
        if (isSafeUrlParam(celeb)) {
          params.set("celebrantPhoto", celeb);
        }
        try {
          sessionStorage.setItem("pending_celebrant_photo", celeb);
          localStorage.setItem("pending_celebrant_photo", celeb);
        } catch (_) {}
      }
      try {
        sessionStorage.setItem("pending_is_video", "true");
        sessionStorage.setItem("pending_aspect_ratio", "9/16");
        localStorage.setItem("pending_is_video", "true");
        localStorage.setItem("pending_aspect_ratio", "9/16");
      } catch (_) {}
    } else {
      const queryUploadedImageUrl = searchParams.get("uploadedImageUrl") || searchParams.get("imageUrl");
      if (queryUploadedImageUrl) {
        params.set("uploadedImageUrl", queryUploadedImageUrl);
      }

      const queryTemplateId = searchParams.get("templateId");
      if (queryTemplateId) {
        params.set("templateId", queryTemplateId);
        try {
          localStorage.setItem("pending_template_id", queryTemplateId);
          sessionStorage.setItem("pending_template_id", queryTemplateId);
          localStorage.removeItem("pending_upload_invite");
          sessionStorage.removeItem("pending_upload_invite");
          localStorage.removeItem("pending_stationery_design");
          sessionStorage.removeItem("pending_stationery_design");
        } catch (e) {}
      }

      const queryTier = searchParams.get("tier");
      if (queryTier) {
        params.set("tier", queryTier);
      }

      if (guestDraft && !queryTemplateId) {
        try {
          if (guestDraft.type === "template" && guestDraft.templateId) {
            params.set("templateId", guestDraft.templateId);
            localStorage.setItem("pending_template_id", guestDraft.templateId);
            sessionStorage.setItem("pending_template_id", guestDraft.templateId);
            if (guestDraft.templateName) {
              localStorage.setItem("pending_template_name", guestDraft.templateName);
              sessionStorage.setItem("pending_template_name", guestDraft.templateName);
            }
          } else if (guestDraft.type === "upload" || guestDraft.uploadUrl || guestDraft.stationeryDesign?.backgroundImage) {
            const bgUrl = guestDraft.stationeryDesign?.backgroundImage || guestDraft.uploadUrl || guestDraft.backgroundImage || "";
            if (bgUrl) {
              localStorage.setItem("pending_upload_invite", bgUrl);
              sessionStorage.setItem("pending_upload_invite", bgUrl);
              if (!bgUrl.startsWith("data:")) {
                params.set("uploadedImageUrl", bgUrl);
              }
            }
            if (guestDraft.uploadName) {
              sessionStorage.setItem("pending_upload_name", guestDraft.uploadName);
            }
            if (guestDraft.uploadType) {
              sessionStorage.setItem("pending_upload_type", guestDraft.uploadType);
            }
            if (guestDraft.uploadTitle) {
              sessionStorage.setItem("pending_upload_title", guestDraft.uploadTitle);
            }
            if (guestDraft.stationeryDesign) {
              sessionStorage.setItem("pending_stationery_design", JSON.stringify(guestDraft.stationeryDesign));
              localStorage.setItem("pending_stationery_design", JSON.stringify(guestDraft.stationeryDesign));
            }
          } else if (guestDraft.type === "ai") {
            if (guestDraft.prompt) {
              sessionStorage.setItem("pending_prompt", guestDraft.prompt);
            }
            if (guestDraft.eventType) {
              sessionStorage.setItem("pending_event_type", guestDraft.eventType);
            }
            if (guestDraft.venue) {
              sessionStorage.setItem("pending_venue", guestDraft.venue);
            }
            if (guestDraft.guestCount) {
              sessionStorage.setItem("pending_guest_count", guestDraft.guestCount);
            }
            if (guestDraft.date) {
              sessionStorage.setItem("pending_event_date", guestDraft.date);
            }
            if (guestDraft.startTime) {
              sessionStorage.setItem("pending_start_time", guestDraft.startTime);
            }
            if (guestDraft.endTime) {
              sessionStorage.setItem("pending_end_time", guestDraft.endTime);
            }
            if (guestDraft.isFullDay !== undefined) {
              sessionStorage.setItem("pending_is_full_day", String(guestDraft.isFullDay));
            }
          }
        } catch (e) {
          console.warn("Canvas bridge: failed to hydrate session storage:", e);
        }
      }
    }

    // Redirect to the actual canvas with strictly sanitized lightweight query parameters
    const finalCleanParams = new URLSearchParams();
    params.forEach((val, key) => {
      if (isSafeUrlParam(val)) {
        finalCleanParams.set(key, val);
      }
    });

    router.replace(`/dashboard/invitations?${finalCleanParams.toString()}`);
  }, [user, authLoading, router, searchParams, isGuest]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Opening Video Invite Studio...</p>
      </div>
    </div>
  );
}

export default function CanvasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      }
    >
      <CanvasBridgeContent />
    </Suspense>
  );
}
