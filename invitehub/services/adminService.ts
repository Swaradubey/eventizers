import API from "./api";
import { Event } from "./eventService";
import { User } from "../context/AuthContext";
import { Guest } from "../types/guestTypes";
import { Invitation } from "../types/invitationTypes";
import { TicketTier } from "../types/ticketingTypes";
import { CheckInGuest, CheckInSummary } from "../types/checkInTypes";
import { Registry } from "../types/registryTypes";

export interface AdminDashboardStats {
  totalEvents: number;
  totalGuests: number;
  averageRsvpRate: number;
  messagesSent: number;
}

interface AdminAuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
}

interface AdminStatsResponse {
  success: boolean;
  stats: AdminDashboardStats;
}

export interface AdminEvent extends Event {
  user?: {
    name: string;
    email: string;
  };
}

export interface AdminEventsResponse {
  success: boolean;
  events: AdminEvent[];
  data?: AdminEvent[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface AdminEventResponse {
  success: boolean;
  event: AdminEvent;
  message?: string;
}

// Admin Guest type with creator info
export interface AdminGuest extends Guest {
  eventTitle: string;
  eventCreator?: {
    name: string;
    email: string;
  } | null;
  isCheckedIn?: boolean;
}

// Admin Invitation type with creator info
export interface AdminInvitation extends Invitation {
  eventTitle?: string;
  eventCreator?: {
    name: string;
    email: string;
  } | null;
}

// Admin TicketTier type with creator info
export interface AdminTicketTier extends TicketTier {
  eventTitle?: string;
  eventCreator?: {
    name: string;
    email: string;
  } | null;
}

// Admin Registry type with creator info
export interface AdminRegistry extends Registry {
  eventTitle?: string;
  eventCreator?: {
    name: string;
    email: string;
  } | null;
}

export interface AdminRegistriesData {
  registries: AdminRegistry[];
  stats: {
    totalRegistries: number;
    activeRegistries: number;
    totalContributions: number;
  };
}

export interface AdminRegistriesResponse {
  success: boolean;
  data: AdminRegistriesData;
}

export const adminLogin = async (email: string, password: string): Promise<AdminAuthResponse> => {
  const response = await API.post<AdminAuthResponse>("/admin/login", { email, password });
  return response.data;
};

export const adminLogout = async (): Promise<any> => {
  const response = await API.post("/admin/logout");
  return response.data;
};

export const getAdminCurrentUser = async (): Promise<AdminAuthResponse> => {
  const response = await API.get<AdminAuthResponse>("/admin/me");
  return response.data;
};

export const getAdminStats = async (): Promise<AdminStatsResponse> => {
  const response = await API.get<AdminStatsResponse>("/admin/dashboard/stats");
  return response.data;
};

export const getAdminEvents = async (page?: number, limit?: number): Promise<AdminEventsResponse> => {
  const response = await API.get<AdminEventsResponse>("/admin/events", {
    params: { page, limit }
  });
  return response.data;
};

export const getAdminEventById = async (id: string): Promise<AdminEventResponse> => {
  const response = await API.get<AdminEventResponse>(`/admin/events/${id}`);
  return response.data;
};

export const createAdminEvent = async (event: Omit<Event, "id">): Promise<AdminEventResponse> => {
  const response = await API.post<AdminEventResponse>("/admin/events", event);
  return response.data;
};

export const updateAdminEvent = async (
  id: string,
  event: Omit<Event, "id" | "createdAt" | "updatedAt">
): Promise<AdminEventResponse> => {
  const response = await API.put<AdminEventResponse>(`/admin/events/${id}`, event);
  return response.data;
};

export const deleteAdminEvent = async (id: string): Promise<any> => {
  const response = await API.delete(`/admin/events/${id}`);
  return response.data;
};

interface AdminEventGuestsResponse {
  success: boolean;
  guests: Guest[];
}

export const getAdminEventGuests = async (eventId: string): Promise<AdminEventGuestsResponse> => {
  const response = await API.get<AdminEventGuestsResponse>(`/admin/events/${eventId}/guests`);
  return response.data;
};

export interface AdminGuestsResponse {
  success: boolean;
  guests: AdminGuest[];
  data?: AdminGuest[];
  pagination?: {
    page: number;
    currentPage: number;
    limit: number;
    total: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const getAdminGuests = async (
  page?: number,
  limit?: number,
  search?: string,
  eventId?: string
): Promise<AdminGuestsResponse> => {
  const response = await API.get<AdminGuestsResponse>("/admin/guests", {
    params: { page, limit, search, eventId }
  });
  return response.data;
};

export const updateAdminGuest = async (id: string, payload: Partial<Guest>): Promise<{ success: boolean; guest: Guest }> => {
  const response = await API.put<{ success: boolean; guest: Guest }>(`/admin/guests/${id}`, payload);
  return response.data;
};

export const deleteAdminGuest = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await API.delete<{ success: boolean; message: string }>(`/admin/guests/${id}`);
  return response.data;
};

export const getAdminInvitations = async (
  page?: number,
  limit?: number
): Promise<{ success: boolean; invitations: AdminInvitation[]; pagination?: any }> => {
  const response = await API.get<{ success: boolean; invitations: AdminInvitation[]; pagination?: any }>("/admin/invitations", {
    params: { page, limit }
  });
  return response.data;
};

export const updateAdminInvitation = async (id: string, payload: Partial<Invitation>): Promise<{ success: boolean; invitation: Invitation }> => {
  const response = await API.put<{ success: boolean; invitation: Invitation }>(`/admin/invitations/${id}`, payload);
  return response.data;
};

export const deleteAdminInvitation = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await API.delete<{ success: boolean; message: string }>(`/admin/invitations/${id}`);
  return response.data;
};

export const getAdminTicketing = async (): Promise<{ success: boolean; tiers: AdminTicketTier[] }> => {
  const response = await API.get<{ success: boolean; tiers: AdminTicketTier[] }>("/admin/ticketing");
  return response.data;
};

export const updateAdminTicketTier = async (
  tierId: string,
  payload: Partial<TicketTier>
): Promise<{ success: boolean; message: string; tier: TicketTier }> => {
  const response = await API.patch<{ success: boolean; message: string; tier: TicketTier }>(
    `/admin/ticketing/tiers/${tierId}`,
    payload
  );
  return response.data;
};

export const deleteAdminTicketTier = async (
  tierId: string
): Promise<{ success: boolean; deleted: boolean; archived: boolean; message: string }> => {
  const response = await API.delete<{ success: boolean; deleted: boolean; archived: boolean; message: string }>(
    `/admin/ticketing/tiers/${tierId}`
  );
  return response.data;
};

export const getAdminCheckInEvents = async (): Promise<{ success: boolean; events: { id: string; title: string }[] }> => {
  const response = await API.get<{ success: boolean; events: { id: string; title: string }[] }>("/admin/check-ins/events");
  return response.data;
};

export const getAdminCheckInSummary = async (eventId: string): Promise<{ success: boolean; summary: CheckInSummary }> => {
  const response = await API.get<{ success: boolean; summary: CheckInSummary }>(`/admin/check-ins/events/${eventId}/summary`);
  return response.data;
};

export const getAdminCheckInGuests = async (
  eventId: string,
  params: { search?: string; status?: string; page?: number; limit?: number } = {}
): Promise<{ success: boolean; guests: CheckInGuest[]; pagination: any }> => {
  const response = await API.get<{ success: boolean; guests: CheckInGuest[]; pagination: any }>(
    `/admin/check-ins/events/${eventId}/guests`,
    { params }
  );
  return response.data;
};

export const checkInAdminGuestManual = async (
  eventId: string,
  guestId: string,
  latitude?: number,
  longitude?: number
): Promise<{ success: boolean; message: string; checkIn: any }> => {
  const response = await API.post<{ success: boolean; message: string; checkIn: any }>(
    `/admin/check-ins/events/${eventId}/manual`,
    { guestId, latitude, longitude }
  );
  return response.data;
};

export const checkInAdminGuestScan = async (
  eventId: string,
  qrCode: string,
  latitude?: number,
  longitude?: number
): Promise<{ success: boolean; message: string; guest: any; checkIn: any }> => {
  const response = await API.post<{ success: boolean; message: string; guest: any; checkIn: any }>(
    `/admin/check-ins/events/${eventId}/scan`,
    { qrCode, latitude, longitude }
  );
  return response.data;
};

export const undoAdminCheckIn = async (checkInId: string): Promise<{ success: boolean; message: string }> => {
  const response = await API.delete<{ success: boolean; message: string }>(`/admin/check-ins/${checkInId}`);
  return response.data;
};

export const getAdminRegistries = async (): Promise<AdminRegistriesResponse> => {
  const response = await API.get<AdminRegistriesResponse>("/admin/registries");
  return response.data;
};

export const updateAdminRegistry = async (id: string, payload: Partial<Registry>): Promise<{ success: boolean; registry: Registry }> => {
  const response = await API.put<{ success: boolean; registry: Registry }>(`/admin/registries/${id}`, payload);
  return response.data;
};

export const deleteAdminRegistry = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await API.delete<{ success: boolean; message: string }>(`/admin/registries/${id}`);
  return response.data;
};

// Admin Billing Types
export interface AdminBillingUser {
  id: number;
  name: string;
  email: string;
  role: string;
  plan: string;
  subscriptionStatus: string;
  billingStatus: string;
  planStartDate: string;
  planExpiryDate: string;
  usage: {
    eventsCreated: number;
    eventsLimit: number;
    guestsUsed: number;
    guestsLimit: number;
    messagesUsed: number;
    messagesLimit: number;
    updatedAt: string;
  };
}

export interface AdminBillingStats {
  totalSubscribers: number;
  freeUsers: number;
  paidUsers: number;
  activeSubscriptions: number;
  expiredPlans: number;
  monthlyRevenue: number;
}

export interface GetBillingUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  currentPlan?: string;
  billingStatus?: string;
  subscriptionStatus?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface AdminBillingUsersResponse {
  success: boolean;
  users: AdminBillingUser[];
  data?: AdminBillingUser[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface AdminBillingStatsResponse {
  success: boolean;
  stats: AdminBillingStats;
}

// Admin Billing API functions
export const getAdminBillingStats = async (): Promise<AdminBillingStatsResponse> => {
  const response = await API.get<AdminBillingStatsResponse>("/admin/billing/stats");
  return response.data;
};

export const getAdminBillingUsers = async (
  params: GetBillingUsersParams = {},
  signal?: AbortSignal
): Promise<AdminBillingUsersResponse> => {
  const response = await API.get<AdminBillingUsersResponse>("/admin/billing/users", {
    params,
    signal
  });
  return response.data;
};

export const updateAdminBillingPlan = async (userId: number, plan: string): Promise<any> => {
  const response = await API.patch(`/admin/billing/users/${userId}/plan`, { plan });
  return response.data;
};

export const resetAdminUserUsage = async (userId: number, type: "events" | "guests" | "messages" | "all"): Promise<any> => {
  const response = await API.post(`/admin/billing/users/${userId}/reset-usage`, { type });
  return response.data;
};

export const updateAdminUserSubscriptionStatus = async (userId: number, status: string): Promise<any> => {
  const response = await API.patch(`/admin/billing/users/${userId}/subscription-status`, { status });
  return response.data;
};

export const updateAdminUserBillingStatus = async (userId: number, status: string): Promise<any> => {
  const response = await API.patch(`/admin/billing/users/${userId}/billing-status`, { status });
  return response.data;
};

export const deleteAdminUser = async (userId: number): Promise<{ success: boolean; message: string }> => {
  const response = await API.delete<{ success: boolean; message: string }>(`/admin/users/${userId}`);
  return response.data;
};

const adminService = {
  adminLogin,
  adminLogout,
  getAdminCurrentUser,
  getAdminStats,
  getAdminEvents,
  getAdminEventById,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  getAdminEventGuests,
  getAdminGuests,
  updateAdminGuest,
  deleteAdminGuest,
  getAdminInvitations,
  updateAdminInvitation,
  deleteAdminInvitation,
  getAdminTicketing,
  updateAdminTicketTier,
  deleteAdminTicketTier,
  getAdminCheckInEvents,
  getAdminCheckInSummary,
  getAdminCheckInGuests,
  checkInAdminGuestManual,
  checkInAdminGuestScan,
  undoAdminCheckIn,
  getAdminRegistries,
  updateAdminRegistry,
  deleteAdminRegistry,
  getAdminBillingStats,
  getAdminBillingUsers,
  updateAdminBillingPlan,
  resetAdminUserUsage,
  updateAdminUserSubscriptionStatus,
  updateAdminUserBillingStatus,
  deleteAdminUser,
};

export default adminService;

