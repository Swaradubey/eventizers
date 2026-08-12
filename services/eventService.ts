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
  status?: string;
  createdBy?: number;
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

export const getEvents = async (page?: number, limit?: number): Promise<EventsResponse> => {
  const params = page && limit ? { page, limit } : undefined;
  const response = await API.get<EventsResponse>("/events", { params });
  return response.data;
};

export const getEventById = async (id: string): Promise<EventResponse> => {
  const response = await API.get<EventResponse>(`/events/${id}`);
  return response.data;
};

export const createEvent = async (event: Omit<Event, "id">): Promise<EventResponse> => {
  const response = await API.post<EventResponse>("/events", event);
  return response.data;
};

export const updateEvent = async (
  id: string,
  event: Omit<Event, "id" | "createdAt" | "updatedAt">
): Promise<EventResponse> => {
  const response = await API.put<EventResponse>(`/events/${id}`, event);
  return response.data;
};

export const deleteEvent = async (id: string): Promise<DeleteResponse> => {
  const response = await API.delete<DeleteResponse>(`/events/${id}`);
  return response.data;
};

const eventService = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};

export default eventService;
