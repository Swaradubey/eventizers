import API from "./api";
import { Event } from "./eventService";
import { User } from "../context/AuthContext";

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

interface AdminEventsResponse {
  success: boolean;
  events: AdminEvent[];
}

interface AdminEventResponse {
  success: boolean;
  event: AdminEvent;
  message?: string;
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

export const getAdminEvents = async (): Promise<AdminEventsResponse> => {
  const response = await API.get<AdminEventsResponse>("/admin/events");
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
};

export default adminService;
