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

    // Read the consolidated guest draft from localStorage
    let guestDraft: any = null;
    try {
      const raw = localStorage.getItem("guestEventDraft");
      if (raw) {
        guestDraft = JSON.parse(raw);
      }
    } catch (e) {}

    // If authenticated, clear any stale guest draft and redirect to the real canvas
    if (user) {
      try {
        localStorage.removeItem("guestEventDraft");
      } catch (e) {}
      router.replace("/dashboard/invitations?studio=true");
      return;
    }

    // Build the redirect URL to the actual canvas at /dashboard/invitations
    const params = new URLSearchParams();
    params.set("studio", "true");
    params.set("guest", "1");

    if (guestDraft) {
      // Map the consolidated draft fields to the legacy sessionStorage keys
      // that InvitationStudio already reads on mount
      try {
        if (guestDraft.type === "template" && guestDraft.templateId) {
          params.set("templateId", guestDraft.templateId);
          localStorage.setItem("pending_template_id", guestDraft.templateId);
          sessionStorage.setItem("pending_template_id", guestDraft.templateId);
          if (guestDraft.templateName) {
            localStorage.setItem("pending_template_name", guestDraft.templateName);
            sessionStorage.setItem("pending_template_name", guestDraft.templateName);
          }
        } else if (guestDraft.type === "upload" && guestDraft.uploadUrl) {
          localStorage.setItem("pending_upload_invite", guestDraft.uploadUrl);
          sessionStorage.setItem("pending_upload_invite", guestDraft.uploadUrl);
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

    // Redirect to the actual canvas
    router.replace(`/dashboard/invitations?${params.toString()}`);
  }, [user, authLoading, router, searchParams, isGuest]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Opening Canvas Editor...</p>
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
