import { useState, useEffect, useCallback } from "react";
import invitationService from "../services/invitationService";
import eventService, { Event } from "../services/eventService";
import { Invitation, InvitationPayload } from "../types/invitationTypes";

export const useInvitation = (eventId: string | null) => {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear notifications helper
  const clearNotifications = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // Fetch Event and Invitation data
  const fetchData = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Event details
      const eventRes = await eventService.getEventById(eventId);
      if (eventRes.success && eventRes.event) {
        setEvent(eventRes.event);
      } else {
        throw new Error(eventRes.message || "Failed to load event details.");
      }

      // 2. Fetch existing invitation
      try {
        const inviteRes = await invitationService.getInvitationByEvent(eventId);
        if (inviteRes.success && inviteRes.invitation) {
          setInvitation(inviteRes.invitation);
        } else {
          // Initialize a default draft if it does not exist
          const defaultInvitation: Invitation = {
            id: "", // empty indicates it's unsaved/new
            eventId: eventId,
            title: `Invitation to ${eventRes.event.title}`,
            subtitle: "You are cordially invited to celebrate with us.",
            mainText: "Join us for an unforgettable experience filled with joy and celebration. Please RSVP using the button below to secure your spot.",
            accentColor: "#5B5FEF",
            backgroundColor: "#F6F9FC",
            textColor: "#1A1118",
            titleSize: 48,
            fontWeight: "700",
            fontFamily: "Playfair Display",
            textAlignment: "center",
            imageUrl: eventRes.event.coverImage || "",
            buttonText: "RSVP Now",
            buttonColor: "#5B5FEF",
            buttonRadius: 12,
            status: "draft",
          };
          setInvitation(defaultInvitation);
        }
      } catch (err: any) {
        // If API returns 404/error and no invitation exists, create a default local state
        const defaultInvitation: Invitation = {
          id: "",
          eventId: eventId,
          title: `Invitation to ${eventRes.event.title}`,
          subtitle: "You are cordially invited to celebrate with us.",
          mainText: "Join us for an unforgettable experience filled with joy and celebration. Please RSVP using the button below to secure your spot.",
          accentColor: "#5B5FEF",
          backgroundColor: "#F6F9FC",
          textColor: "#1A1118",
          titleSize: 48,
          fontWeight: "700",
          fontFamily: "Playfair Display",
          textAlignment: "center",
          imageUrl: eventRes.event.coverImage || "",
          buttonText: "RSVP Now",
          buttonColor: "#5B5FEF",
          buttonRadius: 12,
          status: "draft",
        };
        setInvitation(defaultInvitation);
      }
    } catch (err: any) {
      console.error("Error loading invitation data:", err);
      setError(err.response?.data?.error || err.message || "Failed to load designer data.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save / Update Invitation
  const saveInvitation = async (formData: InvitationPayload) => {
    if (!eventId || !invitation) return null;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    // Validate Title String Length / Font Size range locally
    if (!formData.title || formData.title.trim() === "") {
      setError("Title is required.");
      setSaving(false);
      return null;
    }
    if (formData.titleSize !== undefined && (formData.titleSize < 20 || formData.titleSize > 80)) {
      setError("Title size must be between 20 and 80.");
      setSaving(false);
      return null;
    }

    try {
      let savedInvite: Invitation;
      if (!invitation.id || invitation.id === "") {
        // Create new invitation
        const payload: InvitationPayload = {
          ...formData,
          eventId,
          status: formData.status || "draft",
        };
        const res = await invitationService.createInvitation(payload);
        savedInvite = res.invitation;
        setSuccessMessage("Invitation draft saved successfully!");
      } else {
        // Update existing invitation
        const payload = {
          ...formData,
          status: formData.status || invitation.status,
        };
        const res = await invitationService.updateInvitation(invitation.id, payload);
        savedInvite = res.invitation;
        setSuccessMessage("Invitation saved successfully!");
      }
      setInvitation(savedInvite);
      return savedInvite;
    } catch (err: any) {
      console.error("Error saving invitation:", err);
      setError(err.response?.data?.error || "Failed to save the invitation.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Send Invitation (POST /api/invitations/:id/send)
  const queueInvitation = async () => {
    if (!invitation || !invitation.id) {
      setError("Please save the invitation before sending.");
      return;
    }

    setSending(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await invitationService.sendInvitation(invitation.id);
      if (res.success) {
        setSuccessMessage(res.message || "Invitation successfully queued for sending!");
        setInvitation(prev => prev ? { ...prev, status: "published" } : null);
      } else {
        throw new Error(res.message || "Failed to queue invitation.");
      }
    } catch (err: any) {
      console.error("Error sending invitation:", err);
      setError(err.response?.data?.error || err.message || "Failed to send the invitation.");
    } finally {
      setSending(false);
    }
  };

  return {
    invitation,
    setInvitation,
    event,
    loading,
    saving,
    sending,
    error,
    successMessage,
    clearNotifications,
    saveInvitation,
    queueInvitation,
  };
};
