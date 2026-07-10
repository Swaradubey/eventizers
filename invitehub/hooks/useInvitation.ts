import { useState, useEffect, useCallback } from "react";
import invitationService from "../services/invitationService";
import eventService, { Event } from "../services/eventService";
import { Invitation, InvitationPayload } from "../types/invitationTypes";

const TEMPLATES_CONFIG: Record<string, {
  image: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  titleSize: number;
  fontWeight: string;
  fontFamily: string;
  buttonColor: string;
  buttonRadius: number;
  textAlignment: string;
  description: string;
}> = {
  "tpl-birthday-maya": {
    image: "/assets/templates/birthday.jpg",
    accentColor: "#e07090",
    backgroundColor: "#FAF8F5",
    textColor: "#2D1B3D",
    titleSize: 48,
    fontWeight: "700",
    fontFamily: "Playfair Display",
    buttonColor: "#e07090",
    buttonRadius: 12,
    textAlignment: "center",
    description: "Come celebrate Maya's 5th birthday with cupcakes, games, and lots of fun!"
  },
  "tpl-wedding-liam": {
    image: "/assets/templates/wedding.jpg",
    accentColor: "#9070c0",
    backgroundColor: "#FAF8F5",
    textColor: "#2D1B3D",
    titleSize: 48,
    fontWeight: "700",
    fontFamily: "Playfair Display",
    buttonColor: "#9070c0",
    buttonRadius: 12,
    textAlignment: "center",
    description: "Join us in celebrating the love and marriage of Liam and Sofia."
  },
  "tpl-corporate-launch": {
    image: "/assets/templates/corporate.jpg",
    accentColor: "#4080b0",
    backgroundColor: "#FAF8F5",
    textColor: "#2D1B3D",
    titleSize: 44,
    fontWeight: "600",
    fontFamily: "Inter",
    buttonColor: "#4080b0",
    buttonRadius: 8,
    textAlignment: "center",
    description: "Be the first to see our next generation of software products and network with industry leaders."
  },
  "tpl-dinner-party": {
    image: "/assets/templates/dinner.jpg",
    accentColor: "#907030",
    backgroundColor: "#FAF8F5",
    textColor: "#2D1B3D",
    titleSize: 48,
    fontWeight: "700",
    fontFamily: "Playfair Display",
    buttonColor: "#907030",
    buttonRadius: 12,
    textAlignment: "center",
    description: "An intimate evening of gourmet dining, fine wine, and great conversation."
  },
  "tpl-baby-shower": {
    image: "/assets/templates/babyshower.jpg",
    accentColor: "#4a9a4a",
    backgroundColor: "#FAF8F5",
    textColor: "#2D1B3D",
    titleSize: 48,
    fontWeight: "700",
    fontFamily: "Playfair Display",
    buttonColor: "#4a9a4a",
    buttonRadius: 12,
    textAlignment: "center",
    description: "A sweet baby shower to celebrate the upcoming arrival of the new baby!"
  },
  "tpl-charity-gala": {
    image: "/assets/templates/gala.jpg",
    accentColor: "#a07820",
    backgroundColor: "#FAF8F5",
    textColor: "#2D1B3D",
    titleSize: 48,
    fontWeight: "700",
    fontFamily: "Playfair Display",
    buttonColor: "#a07820",
    buttonRadius: 12,
    textAlignment: "center",
    description: "An elegant charity gala raising funds for education and youth empowerment."
  },
  "tpl-live-music": {
    image: "/assets/templates/music.jpg",
    accentColor: "#9970d0",
    backgroundColor: "#2D1B3D",
    textColor: "#FAF8F5",
    titleSize: 52,
    fontWeight: "700",
    fontFamily: "Inter",
    buttonColor: "#9970d0",
    buttonRadius: 16,
    textAlignment: "center",
    description: "An evening of live music, delicious drinks, and views of the city skyline."
  },
  "tpl-anniversary-james": {
    image: "/assets/templates/anniversary.jpg",
    accentColor: "#c06840",
    backgroundColor: "#FAF8F5",
    textColor: "#2D1B3D",
    titleSize: 48,
    fontWeight: "700",
    fontFamily: "Playfair Display",
    buttonColor: "#c06840",
    buttonRadius: 12,
    textAlignment: "center",
    description: "Please join us in celebrating the 25th wedding anniversary of James and Elena."
  },
  "tpl-grad-gala": {
    image: "/assets/templates/graduation_gala.jpg",
    accentColor: "#d4af37",
    backgroundColor: "#FAF8F5",
    textColor: "#2D1B3D",
    titleSize: 48,
    fontWeight: "700",
    fontFamily: "Playfair Display",
    buttonColor: "#1e3c72",
    buttonRadius: 8,
    textAlignment: "center",
    description: "Join us for an elegant evening of celebration and dining to honor the outstanding accomplishments of our graduating class."
  },
  "tpl-grad-class2026": {
    image: "/assets/templates/graduation_class_2026.jpg",
    accentColor: "#e67e22",
    backgroundColor: "#FAF8F5",
    textColor: "#2D1B3D",
    titleSize: 46,
    fontWeight: "700",
    fontFamily: "Playfair Display",
    buttonColor: "#d35400",
    buttonRadius: 12,
    textAlignment: "center",
    description: "Raise a glass to the memories we've shared and the bright futures ahead of the class of 2026!"
  },
  "tpl-grad-degree": {
    image: "/assets/templates/graduation_degree.jpg",
    accentColor: "#1abc9c",
    backgroundColor: "#FAF8F5",
    textColor: "#2D1B3D",
    titleSize: 44,
    fontWeight: "600",
    fontFamily: "Inter",
    buttonColor: "#203a43",
    buttonRadius: 6,
    textAlignment: "center",
    description: "You are cordially invited to witness the formal conferring of degrees and academic achievements."
  },
  "tpl-comm-meetup": {
    image: "/assets/templates/community_meetup.jpg",
    accentColor: "#11998e",
    backgroundColor: "#FAF8F5",
    textColor: "#2D1B3D",
    titleSize: 48,
    fontWeight: "700",
    fontFamily: "Playfair Display",
    buttonColor: "#11998e",
    buttonRadius: 20,
    textAlignment: "center",
    description: "Connect with your neighbors for a lovely afternoon of conversation, sharing local updates, and outdoor fun."
  },
  "tpl-comm-celebration": {
    image: "/assets/templates/community_celebration.jpg",
    accentColor: "#ff5e62",
    backgroundColor: "#FAF8F5",
    textColor: "#2D1B3D",
    titleSize: 46,
    fontWeight: "700",
    fontFamily: "Playfair Display",
    buttonColor: "#ff5e62",
    buttonRadius: 14,
    textAlignment: "center",
    description: "Join us for our annual block party! Expect live music, potluck tables, and games for all ages."
  },
  "tpl-comm-volunteer": {
    image: "/assets/templates/community_volunteer.jpg",
    accentColor: "#e91e63",
    backgroundColor: "#FAF8F5",
    textColor: "#2D1B3D",
    titleSize: 48,
    fontWeight: "700",
    fontFamily: "Playfair Display",
    buttonColor: "#e91e63",
    buttonRadius: 10,
    textAlignment: "center",
    description: "To the volunteers who make a difference: this evening is all about celebrating and thanking you."
  },
  "tpl-net-professional": {
    image: "/assets/templates/networking_professional.jpg",
    accentColor: "#6f86d6",
    backgroundColor: "#FAF8F5",
    textColor: "#2D1B3D",
    titleSize: 44,
    fontWeight: "600",
    fontFamily: "Inter",
    buttonColor: "#4e4376",
    buttonRadius: 8,
    textAlignment: "center",
    description: "Expand your network and share industry insights with leading professionals and executives in a relaxed setting."
  },
  "tpl-net-founders": {
    image: "/assets/templates/networking_founders.jpg",
    accentColor: "#00c6ff",
    backgroundColor: "#2D1B3D",
    textColor: "#FAF8F5",
    titleSize: 46,
    fontWeight: "700",
    fontFamily: "Inter",
    buttonColor: "#00c6ff",
    buttonRadius: 8,
    textAlignment: "center",
    description: "A gathering of minds for startup founders, product creators, and innovators. Let's discuss ideas, challenges, and collaborations."
  },
  "tpl-net-connections": {
    image: "/assets/templates/networking_connections.jpg",
    accentColor: "#3a7bd5",
    backgroundColor: "#FAF8F5",
    textColor: "#2D1B3D",
    titleSize: 44,
    fontWeight: "600",
    fontFamily: "Inter",
    buttonColor: "#3a6073",
    buttonRadius: 10,
    textAlignment: "center",
    description: "Join local entrepreneurs and business owners to build meaningful connections, explore opportunities, and grow together."
  }
};

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
          // Initialize a default draft using selectedTemplateId if present
          const tplKey = eventRes.event.selectedTemplateId;
          const tplConfig = tplKey ? TEMPLATES_CONFIG[tplKey] : null;

          const defaultInvitation: Invitation = {
            id: "", // empty indicates it's unsaved/new
            eventId: eventId,
            title: `Invitation to ${eventRes.event.title}`,
            subtitle: tplConfig ? (eventRes.event.venue || "TBD") : "You are cordially invited to celebrate with us.",
            mainText: tplConfig?.description || "Join us for an unforgettable experience filled with joy and celebration. Please RSVP using the button below to secure your spot.",
            accentColor: tplConfig?.accentColor || "#5B5FEF",
            backgroundColor: tplConfig?.backgroundColor || "#FAF8F5",
            textColor: tplConfig?.textColor || "#2D1B3D",
            titleSize: tplConfig?.titleSize || 48,
            fontWeight: tplConfig?.fontWeight || "700",
            fontFamily: tplConfig?.fontFamily || "Playfair Display",
            textAlignment: tplConfig?.textAlignment || "center",
            imageUrl: tplConfig?.image || eventRes.event.coverImage || "",
            buttonText: "RSVP Now",
            buttonColor: tplConfig?.buttonColor || "#5B5FEF",
            buttonRadius: tplConfig?.buttonRadius || 12,
            status: "draft",
          };
          setInvitation(defaultInvitation);
        }
      } catch (err: any) {
        // If API returns 404/error and no invitation exists, create a default local state
        const tplKey = eventRes.event.selectedTemplateId;
        const tplConfig = tplKey ? TEMPLATES_CONFIG[tplKey] : null;

        const defaultInvitation: Invitation = {
          id: "",
          eventId: eventId,
          title: `Invitation to ${eventRes.event.title}`,
          subtitle: tplConfig ? (eventRes.event.venue || "TBD") : "You are cordially invited to celebrate with us.",
          mainText: tplConfig?.description || "Join us for an unforgettable experience filled with joy and celebration. Please RSVP using the button below to secure your spot.",
          accentColor: tplConfig?.accentColor || "#5B5FEF",
          backgroundColor: tplConfig?.backgroundColor || "#FAF8F5",
          textColor: tplConfig?.textColor || "#2D1B3D",
          titleSize: tplConfig?.titleSize || 48,
          fontWeight: tplConfig?.fontWeight || "700",
          fontFamily: tplConfig?.fontFamily || "Playfair Display",
          textAlignment: tplConfig?.textAlignment || "center",
          imageUrl: tplConfig?.image || eventRes.event.coverImage || "",
          buttonText: "RSVP Now",
          buttonColor: tplConfig?.buttonColor || "#5B5FEF",
          buttonRadius: tplConfig?.buttonRadius || 12,
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
