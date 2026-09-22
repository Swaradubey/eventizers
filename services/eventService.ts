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
  coverImage?: string | null;
  imageUrl?: string | null;
  thumbnail?: string | null;
  thumbnailUrl?: string | null;
  uploadedFileUrl?: string | null;
  previewUrl?: string | null;
  templatePreviewUrl?: string | null;
  previewImage?: string | null;
  canvasState?: any;
  designData?: any;
  selectedTemplateId?: string | null;
  templateId?: string | null;
  template?: {
    id?: string;
    thumbnailUrl?: string;
    previewUrl?: string;
    image?: string;
  } | null;
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
  id?: string;
  eventId?: string;
  rsvpDeadlineEnabled?: boolean;
  rsvpDeadlineDate?: string | Date | null;
  rsvpDeadlineTime?: string | null;
  allowLateRsvp?: boolean;
  allowMaybe?: boolean;
  isPrivateGuestList?: boolean;
  allowPlusOne?: boolean;
  maxAdditionalGuests?: number;

  // Modal and preview aliases
  deadlineEnabled?: boolean;
  deadlineDate?: string;
  deadlineTime?: string;
  allowAfterDeadline?: boolean;
  privateGuestList?: boolean;
  allowGuestsToBringAnyone?: boolean;

  // Legacy fields
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

export interface EventCounts {
  all: number;
  active: number;
  draft: number;
  completed: number;
}

export interface EventsResponse {
  success: boolean;
  events: Event[];
  data?: Event[];
  counts?: EventCounts;
  message?: string;
  error?: string;
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

export const getEvents = async (page?: number, limit?: number, status?: string): Promise<EventsResponse> => {
  const params: Record<string, any> = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (status && status !== "all") params.status = status;

  const response = await API.get<any>("/events", {
    params: Object.keys(params).length > 0 ? params : undefined,
  });

  const raw = response.data;
  if (Array.isArray(raw)) {
    return { success: true, events: raw, data: raw };
  }
  if (raw && Array.isArray(raw.events)) {
    return { success: raw.success !== false, events: raw.events, data: raw.events, ...raw };
  }
  if (raw && Array.isArray(raw.data)) {
    return { success: raw.success !== false, events: raw.data, data: raw.data, ...raw };
  }
  if (raw && raw.success && !raw.events) {
    return { ...raw, events: [], data: [] };
  }
  return { success: true, events: [], data: [], ...raw };
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

export const patchRsvpSettings = async (
  eventId: string,
  settings: Partial<RsvpSettingsData>
): Promise<RsvpSettingsResponse> => {
  const response = await API.patch<RsvpSettingsResponse>(`/events/${eventId}/rsvp-settings`, settings);
  return response.data;
};

export interface EventReminder {
  id?: string;
  eventId?: string;
  enabled: boolean;
  daysBefore: number; // e.g., 14, 7
  sendVia: "Email" | "SMS" | "WhatsApp";
  message: string;
  targetAudience?: "ALL" | "RSVP_PENDING" | "GUARANTEED";
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

export const saveGuaranteeReminders = async (
  eventId: string,
  guaranteeReminders: EventReminder[]
): Promise<RemindersResponse> => {
  let existing: EventReminder[] = [];
  try {
    const res = await API.get<RemindersResponse>(`/events/${eventId}/reminders`);
    if (res.data?.success && Array.isArray(res.data.reminders)) {
      existing = res.data.reminders;
    }
  } catch (_) {}
  const nonGuarantee = existing.filter((r) => r.targetAudience !== "GUARANTEED");
  const taggedGuarantee = guaranteeReminders.map((r) => ({ ...r, targetAudience: "GUARANTEED" as const }));
  const merged = [...nonGuarantee, ...taggedGuarantee];
  const response = await API.put<RemindersResponse>(`/events/${eventId}/reminders`, { reminders: merged });
  return response.data;
};

export interface AttendanceCommitmentMetrics {
  totalConfirmed: number;
  attendedSafe: number;
  noShows: number;
  waivedCount: number;
  chargedCount: number;
  pendingCount: number;
}

export interface NoShowGuest {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  guaranteeStatus: string;
  guaranteeAmount: number;
  rsvpAt?: string;
  penaltyNoticeSentAt?: string | null;
  guaranteeChargedAt?: string | null;
  guaranteeWaivedAt?: string | null;
  eventDate?: string;
  eventTitle?: string;
  reviewWindowDays?: number;
}

export interface AttendanceCommitmentResponse {
  success: boolean;
  metrics: AttendanceCommitmentMetrics;
  noShows: NoShowGuest[];
  error?: string;
}

export interface AttendanceGuaranteeSettings {
  isEnabled: boolean;
  guaranteeAmount: number;
  reviewWindowDays: number;
  eventId?: string;
  id?: string;
  isGuaranteeEnabled?: boolean;
  enabled?: boolean;
  guaranteeFeeAmount?: number;
  amount?: number;
  hostReviewWindow?: number;
  reminders?: EventReminder[];
  guaranteeReminders?: EventReminder[];
}

export interface AttendanceGuaranteeSettingsResponse {
  success: boolean;
  data: AttendanceGuaranteeSettings;
  message?: string;
  error?: string;
}

export const getAttendanceCommitment = async (eventId: string): Promise<AttendanceCommitmentResponse> => {
  const response = await API.get<AttendanceCommitmentResponse>(`/events/${eventId}/attendance-commitment`);
  return response.data;
};

export const getAttendanceGuaranteeSettings = async (): Promise<AttendanceGuaranteeSettingsResponse> => {
  const response = await API.get<AttendanceGuaranteeSettingsResponse>("/security/attendance-guarantee");
  return response.data;
};

export const updateAttendanceGuaranteeSettings = async (
  settings: Partial<AttendanceGuaranteeSettings>
): Promise<AttendanceGuaranteeSettingsResponse> => {
  const response = await API.put<AttendanceGuaranteeSettingsResponse>("/security/attendance-guarantee", settings);
  return response.data;
};

export const waiveGuestGuarantee = async (guestId: string): Promise<{ success: boolean; message: string; guest?: any }> => {
  const response = await API.post<{ success: boolean; message: string; guest?: any }>(`/guests/${guestId}/waive-guarantee`);
  return response.data;
};

export const chargeGuestGuarantee = async (guestId: string): Promise<{ success: boolean; message: string; transactionId?: string; guest?: any }> => {
  const response = await API.post<{ success: boolean; message: string; transactionId?: string; guest?: any }>(`/guests/${guestId}/charge-guarantee`);
  return response.data;
};

export const processNoShowsCron = async (): Promise<{
  success: boolean;
  eventsProcessed: number;
  noticesSent: number;
  totalWaived: number;
  timestamp: string;
  error?: string;
}> => {
  const response = await API.post<{
    success: boolean;
    eventsProcessed: number;
    noticesSent: number;
    totalWaived: number;
    timestamp: string;
    error?: string;
  }>("/cron/process-no-shows");
  return response.data;
};

const eventService = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getRsvpSettings,
  patchRsvpSettings,
  getReminders,
  saveGuaranteeReminders,
  getAttendanceCommitment,
  getAttendanceGuaranteeSettings,
  updateAttendanceGuaranteeSettings,
  waiveGuestGuarantee,
  chargeGuestGuarantee,
  processNoShowsCron,
};

export default eventService;




