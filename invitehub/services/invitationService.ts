import API from "./api";
import {
  Invitation,
  InvitationPayload,
  InvitationResponse,
  InvitationsResponse,
  SendInvitationResponse
} from "../types/invitationTypes";

export const getInvitations = async (): Promise<InvitationsResponse> => {
  const response = await API.get<InvitationsResponse>("/invitations");
  return response.data;
};

export const getInvitationById = async (id: string): Promise<InvitationResponse> => {
  const response = await API.get<InvitationResponse>(`/invitations/${id}`);
  return response.data;
};

export const getInvitationByEvent = async (eventId: string): Promise<InvitationResponse> => {
  const response = await API.get<InvitationResponse>(`/events/${eventId}/invitation`);
  return response.data;
};

export const createInvitation = async (payload: InvitationPayload): Promise<InvitationResponse> => {
  const response = await API.post<InvitationResponse>("/invitations", payload);
  return response.data;
};

export const updateInvitation = async (
  id: string,
  payload: Omit<InvitationPayload, "eventId">
): Promise<InvitationResponse> => {
  const response = await API.put<InvitationResponse>(`/invitations/${id}`, payload);
  return response.data;
};

export const deleteInvitation = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await API.delete<{ success: boolean; message: string }>(`/invitations/${id}`);
  return response.data;
};

export const sendInvitation = async (
  id: string,
  recipients?: string[] | string,
  snapshotUrlOrBase64?: string
): Promise<SendInvitationResponse> => {
  const isUrl = snapshotUrlOrBase64 && /^https?:\/\//i.test(snapshotUrlOrBase64.trim());
  const response = await API.post<SendInvitationResponse>(`/invitations/${id}/send`, {
    recipients,
    snapshotUrl: isUrl ? snapshotUrlOrBase64 : undefined,
    cardSnapshotUrl: isUrl ? snapshotUrlOrBase64 : undefined,
    cardImageBase64: !isUrl ? snapshotUrlOrBase64 : undefined,
  });
  return response.data;
};

export const sendInvitationToGuests = async (
  invitationId: string,
  guestIds?: string[],
  recipients?: string[] | string,
  snapshotUrlOrBase64?: string
): Promise<SendInvitationResponse> => {
  const isUrl = snapshotUrlOrBase64 && /^https?:\/\//i.test(snapshotUrlOrBase64.trim());
  const response = await API.post<SendInvitationResponse>("/invitations/send", {
    invitationId,
    guestIds,
    recipients,
    snapshotUrl: isUrl ? snapshotUrlOrBase64 : undefined,
    cardSnapshotUrl: isUrl ? snapshotUrlOrBase64 : undefined,
    cardImageBase64: !isUrl ? snapshotUrlOrBase64 : undefined,
  });
  return response.data;
};

export interface PublicInvitationResponse {
  success: boolean;
  error?: string;
  invitation: Invitation;
  event: {
    id: string;
    title: string;
    description?: string;
    eventType?: string;
    venue: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    eventDate: string;
    eventTime: string;
    coverImage?: string;
  };
}

export interface PublicRSVPayload {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  rsvpStatus: "confirmed" | "declined" | "attending";
}

export const getPublicInvitation = async (id: string): Promise<PublicInvitationResponse> => {
  const response = await API.get<PublicInvitationResponse>(`/invitations/public/${id}`);
  return response.data;
};

export const submitPublicRSVP = async (payload: PublicRSVPayload): Promise<{ success: boolean; message: string; guest?: any }> => {
  const response = await API.post<{ success: boolean; message: string; guest?: any }>("/invitations/public/rsvp", payload);
  return response.data;
};

const invitationService = {
  getInvitations,
  getInvitationById,
  getInvitationByEvent,
  createInvitation,
  updateInvitation,
  deleteInvitation,
  sendInvitation,
  sendInvitationToGuests,
  getPublicInvitation,
  submitPublicRSVP,
};

export default invitationService;
