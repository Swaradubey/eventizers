"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

function CanvasBridgeContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

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

    const queryTemplateId = searchParams.get("templateId");
    if (queryTemplateId) {
      params.set("templateId", queryTemplateId);
      try {
        localStorage.setItem("pending_template_id", queryTemplateId);
        sessionStorage.setItem("pending_template_id", queryTemplateId);
      } catch (e) {}
    }

    if (guestDraft) {
      // Map the consolidated draft fields to the session/local storage keys
      // that InvitationStudio reads on mount
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
        }
      } catch (e) {
        console.warn("Canvas bridge: failed to hydrate session storage:", e);
      }
    }

    // Redirect to the actual canvas editor
    router.replace(`/dashboard/invitations?${params.toString()}`);
  }, [user, authLoading, router, searchParams]);

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
