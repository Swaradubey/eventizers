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

  // Events list for dropdown
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(queryEventId);

  // Invitation hook for target event
  const {
    invitation,
    setInvitation,
    event,
    saveInvitation,
  } = useInvitation(selectedEventId);

  // Protected route check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

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

  if (authLoading || !user) {
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
