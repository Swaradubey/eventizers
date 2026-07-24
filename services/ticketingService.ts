import API from "./api";
import {
  TicketingEventsResponse,
  TicketingSummaryResponse,
  TicketTiersResponse,
  TicketTierResponse,
  DeleteTicketTierResponse,
  TicketTier
} from "../types/ticketingTypes";

export const getTicketingEvents = async (): Promise<TicketingEventsResponse> => {
  const response = await API.get<TicketingEventsResponse>("/ticketing/events");
  return response.data;
};

export const getEventSummary = async (eventId: string): Promise<TicketingSummaryResponse> => {
  const response = await API.get<TicketingSummaryResponse>(`/ticketing/events/${eventId}/summary`);
  return response.data;
};

export const getEventTiers = async (eventId: string): Promise<TicketTiersResponse> => {
  const response = await API.get<TicketTiersResponse>(`/ticketing/events/${eventId}/tiers`);
  return response.data;
};

export const getTicketTierById = async (tierId: string): Promise<TicketTierResponse> => {
  const response = await API.get<TicketTierResponse>(`/ticketing/tiers/${tierId}`);
  return response.data;
};

export const createTicketTier = async (
  eventId: string,
  tier: Omit<TicketTier, "id" | "eventId" | "createdAt" | "updatedAt">
): Promise<TicketTierResponse> => {
  const response = await API.post<TicketTierResponse>(`/ticketing/events/${eventId}/tiers`, tier);
  return response.data;
};

export const updateTicketTier = async (
  tierId: string,
  tier: Omit<TicketTier, "id" | "eventId" | "createdAt" | "updatedAt">
): Promise<TicketTierResponse> => {
  const response = await API.patch<TicketTierResponse>(`/ticketing/tiers/${tierId}`, tier);
  return response.data;
};

export const deleteTicketTier = async (tierId: string): Promise<DeleteTicketTierResponse> => {
  const response = await API.delete<DeleteTicketTierResponse>(`/ticketing/tiers/${tierId}`);
  return response.data;
};

export const createCheckoutSession = async (
  eventId: string,
  ticketTierId: string,
  quantity: number
): Promise<{ checkoutUrl: string; sessionId: string }> => {
  const response = await API.post<{ checkoutUrl: string; sessionId: string }>("/tickets/create-checkout-session", {
    eventId,
    ticketTierId,
    quantity,
  });
  return response.data;
};

export const getMyTickets = async (eventId?: string): Promise<{ success: boolean; tickets: any[] }> => {
  const response = await API.get<{ success: boolean; tickets: any[] }>(
    eventId ? `/tickets/my-tickets?eventId=${eventId}` : "/tickets/my-tickets"
  );
  return response.data;
};

export const getSessionDetails = async (
  sessionId: string
): Promise<{ success: boolean; status?: string; order?: any; ticket?: any; message?: string }> => {
  const response = await API.get<{ success: boolean; status?: string; order?: any; ticket?: any; message?: string }>(
    `/tickets/session/${sessionId}`
  );
  return response.data;
};

export const verifyPayment = async (
  sessionId: string
): Promise<{ success: boolean; status?: string; order?: any; ticket?: any; message?: string }> => {
  const response = await API.post<{ success: boolean; status?: string; order?: any; ticket?: any; message?: string }>(
    `/tickets/verify`,
    { sessionId }
  );
  return response.data;
};

const ticketingService = {
  getTicketingEvents,
  getEventSummary,
  getEventTiers,
  getTicketTierById,
  createTicketTier,
  updateTicketTier,
  deleteTicketTier,
  createCheckoutSession,
  getMyTickets,
  getSessionDetails,
  verifyPayment,
};

export default ticketingService;
