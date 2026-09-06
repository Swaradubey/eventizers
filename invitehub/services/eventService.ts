import API from "./api";

export interface Event {
  id?: string;
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
  imageUrl?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  uploadedFileUrl?: string;
  previewUrl?: string;
  designData?: any;
  selectedTemplateId?: string;
  status?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  totalGuests?: number;
  attendingCount?: number;
  declinedCount?: number;
  rsvpRate?: number;
  rsvpSettings?: RsvpSettingsData;
  designSettings?: DesignSettingsData;
  reminders?: EventReminder[];
}

export interface CustomQuestion {
  id: string;
  question: string;
  type?: string;
  options?: string[];
}

export interface RsvpSettingsData {
  rsvpDeadline: string | null;
  allowPlusOnes: boolean;
  maxPlusOnes: number;
  allowMaybeResponse: boolean;
  requirePhoneNumber: boolean;
  collectDietaryRestrictions: boolean;
  collectMealPreference: boolean;
  collectSongRequests: boolean;
  customQuestions: CustomQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

interface EventsResponse {
  success: boolean;
  events: Event[];
}

interface EventResponse {
  success: boolean;
  event: Event;
  message?: string;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface RsvpSettingsResponse {
  success: boolean;
  rsvpSettings: RsvpSettingsData;
  message?: string;
}

export interface TypographySettings {
  titleFont: string;
  bodyFont: string;
}

export interface ColorSchemeSettings {
  preset: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}

export interface BackgroundSettings {
  type: "solid" | "gradient" | "pattern" | "image";
  gradientDirection?: string;
  color?: string;
  patternUrl?: string;
  imageUrl?: string;
}

export interface DesignSettingsData {
  typography: TypographySettings;
  colorScheme: ColorSchemeSettings;
  background: BackgroundSettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface DesignSettingsResponse {
  success: boolean;
  design: DesignSettingsData;
  designSettings?: DesignSettingsData;
  message?: string;
}

export const getEvents = async (page?: number, limit?: number): Promise<EventsResponse> => {
  const params = page && limit ? { page, limit } : undefined;
  const response = await API.get<EventsResponse>("/events", { params });
  return response.data;
};

export const getEventById = async (id: string): Promise<EventResponse> => {
  const response = await API.get<EventResponse>(`/events/${id}`);
  return response.data;
};

export const createEvent = async (event: FormData | Omit<Event, "id">): Promise<EventResponse> => {
  const headers = event instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
  const response = await API.post<EventResponse>("/events", event, { headers });
  return response.data;
};

export const updateEvent = async (
  id: string,
  event: FormData | Omit<Event, "id" | "createdAt" | "updatedAt">
): Promise<EventResponse> => {
  const headers = event instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
  const response = await API.put<EventResponse>(`/events/${id}`, event, { headers });
  return response.data;
};

export const deleteEvent = async (id: string): Promise<DeleteResponse> => {
  const response = await API.delete<DeleteResponse>(`/events/${id}`);
  return response.data;
};

export const getRsvpSettings = async (eventId: string): Promise<RsvpSettingsResponse> => {
  const response = await API.get<RsvpSettingsResponse>(`/events/${eventId}/rsvp-settings`);
  return response.data;
};

export const updateRsvpSettings = async (
  eventId: string,
  settings: Partial<RsvpSettingsData>
): Promise<RsvpSettingsResponse> => {
  const response = await API.put<RsvpSettingsResponse>(`/events/${eventId}/rsvp-settings`, settings);
  return response.data;
};

export const getDesignSettings = async (eventId: string): Promise<DesignSettingsResponse> => {
  const response = await API.get<DesignSettingsResponse>(`/events/${eventId}/design`);
  return response.data;
};

export const updateDesignSettings = async (
  eventId: string,
  settings: Partial<DesignSettingsData>
): Promise<DesignSettingsResponse> => {
  const response = await API.put<DesignSettingsResponse>(`/events/${eventId}/design`, settings);
  return response.data;
};

export interface SendInvitationsOptions {
  personalizedGreeting: boolean;
  calendarLink: boolean;
  mapLink: boolean;
  qrCode: boolean;
}

export interface SendInvitationsPayload {
  deliveryMethod: "email" | "sms" | "whatsapp" | "all";
  options: SendInvitationsOptions;
  testEmail?: string;
}

export interface SendInvitationsResponse {
  success: boolean;
  message: string;
  recipientCount?: number;
  previewUrl?: string | null;
  error?: string;
}

export const sendInvitations = async (
  eventId: string,
  payload: SendInvitationsPayload
): Promise<SendInvitationsResponse> => {
  const response = await API.post<SendInvitationsResponse>(`/events/${eventId}/send-invitations`, payload);
  return response.data;
};

export interface EventReminder {
  id?: string;
  eventId?: string;
  enabled: boolean;
  daysBefore: number; // e.g., 14, 7
  sendVia: "Email" | "SMS" | "WhatsApp";
  message: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RemindersResponse {
  success: boolean;
  reminders: EventReminder[];
  message?: string;
  error?: string;
}

export const getReminders = async (eventId: string): Promise<RemindersResponse> => {
  const response = await API.get<RemindersResponse>(`/events/${eventId}/reminders`);
  return response.data;
};

export const updateReminders = async (
  eventId: string,
  reminders: EventReminder[]
): Promise<RemindersResponse> => {
  const payload = Array.isArray(reminders) ? { reminders } : reminders;
  const response = await API.put<RemindersResponse>(`/events/${eventId}/reminders`, payload);
  return response.data;
};


const eventService = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getRsvpSettings,
  updateRsvpSettings,
  getDesignSettings,
  updateDesignSettings,
  sendInvitations,
  getReminders,
  updateReminders,
};

export default eventService;


