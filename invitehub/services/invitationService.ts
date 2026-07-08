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

export const sendInvitation = async (id: string): Promise<SendInvitationResponse> => {
  const response = await API.post<SendInvitationResponse>(`/invitations/${id}/send`);
  return response.data;
};

export const sendInvitationToGuests = async (
  invitationId: string,
  guestIds?: string[]
): Promise<SendInvitationResponse> => {
  const response = await API.post<SendInvitationResponse>("/invitations/send", {
    invitationId,
    guestIds,
  });
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
};

export default invitationService;
