"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useInvitation } from "../../../hooks/useInvitation";
import eventService, { Event } from "../../../services/eventService";
import InvitationStudio from "../../../components/designer/InvitationStudio";

function InvitationPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEventId = searchParams?.get("eventId") || null;
  const queryTemplateId = searchParams?.get("templateId") || null;
  const isGuest = searchParams?.get("guest") === "1";

  // Events list for dropdown
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(queryEventId);

  // Hydrate guest draft from localStorage on mount
  useEffect(() => {
    if (!isGuest || user) return;
    try {
      const raw = localStorage.getItem("guestEventDraft");
      if (!raw) return;
      const draft = JSON.parse(raw);

      if (draft.type === "template" && draft.templateId) {
        if (!sessionStorage.getItem("pending_template_id")) {
          sessionStorage.setItem("pending_template_id", draft.templateId);
          localStorage.setItem("pending_template_id", draft.templateId);
        }
      } else if (draft.type === "upload" && draft.uploadUrl) {
        if (!sessionStorage.getItem("pending_upload_invite")) {
          sessionStorage.setItem("pending_upload_invite", draft.uploadUrl);
          localStorage.setItem("pending_upload_invite", draft.uploadUrl);
        }
        if (draft.uploadName && !sessionStorage.getItem("pending_upload_name")) {
          sessionStorage.setItem("pending_upload_name", draft.uploadName);
        }
        if (draft.uploadType && !sessionStorage.getItem("pending_upload_type")) {
          sessionStorage.setItem("pending_upload_type", draft.uploadType);
        }
        if (draft.uploadTitle && !sessionStorage.getItem("pending_upload_title")) {
          sessionStorage.setItem("pending_upload_title", draft.uploadTitle);
        }
        if (draft.stationeryDesign && !sessionStorage.getItem("pending_stationery_design")) {
          sessionStorage.setItem("pending_stationery_design", JSON.stringify(draft.stationeryDesign));
        }
      } else if (draft.type === "ai") {
        if (draft.prompt && !sessionStorage.getItem("pending_prompt")) {
          sessionStorage.setItem("pending_prompt", draft.prompt);
        }
        if (draft.eventType && !sessionStorage.getItem("pending_event_type")) {
          sessionStorage.setItem("pending_event_type", draft.eventType);
        }
        if (draft.venue && !sessionStorage.getItem("pending_venue")) {
          sessionStorage.setItem("pending_venue", draft.venue);
        }
        if (draft.guestCount && !sessionStorage.getItem("pending_guest_count")) {
          sessionStorage.setItem("pending_guest_count", draft.guestCount);
        }
        if (draft.date && !sessionStorage.getItem("pending_event_date")) {
          sessionStorage.setItem("pending_event_date", draft.date);
        }
        if (draft.startTime && !sessionStorage.getItem("pending_start_time")) {
          sessionStorage.setItem("pending_start_time", draft.startTime);
        }
        if (draft.endTime && !sessionStorage.getItem("pending_end_time")) {
          sessionStorage.setItem("pending_end_time", draft.endTime);
        }
        if (draft.isFullDay !== undefined && !sessionStorage.getItem("pending_is_full_day")) {
          sessionStorage.setItem("pending_is_full_day", String(draft.isFullDay));
        }
      }
    } catch (e) {
      console.warn("Canvas page: failed to hydrate guest draft:", e);
    }
  }, [isGuest, user]);

  // Invitation hook for target event
  const {
    invitation,
    setInvitation,
    event,
    saveInvitation,
  } = useInvitation(selectedEventId);

  // Protected route check removed: guest users can access Canvas editor

  // Load user events for selector
  useEffect(() => {
    if (user) {
      eventService
        .getEvents()
        .then((res) => {
          if (res.success && res.events) {
            setEvents(res.events);
            if (!queryEventId && res.events.length > 0) {
              setSelectedEventId(res.events[0].id || null);
            }
          }
        })
        .catch((err) => console.error("Error loading events for canvas:", err));
    }
  }, [user, queryEventId]);

  // Synchronize when queryEventId changes
  useEffect(() => {
    if (queryEventId) {
      setSelectedEventId(queryEventId);
    }
  }, [queryEventId]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading Canvas Studio...</p>
        </div>
      </div>
    );
  }

  const activeEvent = event || events.find((e) => e.id === selectedEventId) || events[0] || null;
  const queryUploadedImageUrl =
    searchParams?.get("uploadedImageUrl") ||
    searchParams?.get("customBackgroundUrl") ||
    searchParams?.get("imageUrl") ||
    null;

  const hasPendingUpload =
    Boolean(queryUploadedImageUrl) ||
    (typeof window !== "undefined" &&
      Boolean(
        sessionStorage.getItem("pending_upload_invite") ||
        localStorage.getItem("pending_upload_invite")
      ));

  const resolvedTemplateId = hasPendingUpload
    ? null
    : (queryTemplateId ||
       invitation?.templateId ||
       activeEvent?.selectedTemplateId ||
       (typeof window !== "undefined"
         ? sessionStorage.getItem("pending_template_id") || localStorage.getItem("pending_template_id")
         : null));

  return (
    <InvitationStudio
      initialEvent={activeEvent}
      initialInvitation={invitation}
      events={events}
      selectedEventId={selectedEventId}
      templateIdQuery={resolvedTemplateId}
      uploadedImageUrl={queryUploadedImageUrl}
      onSelectEvent={(eventId) => {
        setSelectedEventId(eventId);
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("eventId", eventId);
          window.history.pushState({}, "", url.toString());
        }
      }}
      onSave={async (payload) => {
        if (!user) {
          // Store draft locally for later sync after auth
          try {
            localStorage.setItem("guestDraft", JSON.stringify(payload));
          } catch (e) {}
          return null;
        }
        let targetEventId = payload.eventId || selectedEventId || activeEvent?.id;
        if (!targetEventId && payload.title) {
          try {
            const newEvtRes = await eventService.createEvent({
              title: payload.title || "My Celebration",
              venue: payload.mainText || payload.eventVenue || "Venue TBD",
              eventDate: new Date(Date.now() + 14 * 86400000).toISOString(),
              eventTime: "18:00:00",
              status: "draft",
            });
            if (newEvtRes.success && newEvtRes.event) {
              targetEventId = newEvtRes.event.id;
              setSelectedEventId(targetEventId);
              setEvents((prev) => [newEvtRes.event, ...prev]);
              payload.eventId = targetEventId;
            }
          } catch (createEvtErr: any) {
            console.error("Failed to auto-create event for invitation:", createEvtErr);
          }
        }
        const saved = await saveInvitation(payload);
        if (saved) {
          setInvitation(saved);
        }
        return saved;
      }}
      onBack={() => {
        router.push("/dashboard");
      }}
    />
  );
}

export default function InvitationDesignerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      }
    >
      <InvitationPageContent />
    </Suspense>
  );
}
