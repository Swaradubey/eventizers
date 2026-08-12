import API from "./api";
import {
  Guest,
  GuestResponse,
  GuestsResponse,
  DeleteGuestResponse,
  ImportGuestsResponse
} from "../types/guestTypes";

export const getGuests = async (
  pageOrSearch?: number | string,
  limitOrEventId?: number | string,
  search?: string,
  eventId?: string
): Promise<GuestsResponse> => {
  let params: Record<string, any> = {};

  if (typeof pageOrSearch === "number") {
    params.page = pageOrSearch;
    if (typeof limitOrEventId === "number") {
      params.limit = limitOrEventId;
    }
    if (search) params.search = search;
    if (eventId) params.eventId = eventId;
  } else {
    if (pageOrSearch) params.search = pageOrSearch;
    if (typeof limitOrEventId === "string") params.eventId = limitOrEventId;
  }

  const response = await API.get<GuestsResponse>("/guests", { params });
  return response.data;
};

export const getGuestById = async (id: string): Promise<GuestResponse> => {
  const response = await API.get<GuestResponse>(`/guests/${id}`);
  return response.data;
};

export const createGuest = async (guest: Omit<Guest, "id">): Promise<GuestResponse> => {
  const response = await API.post<GuestResponse>("/guests", guest);
  return response.data;
};

export const updateGuest = async (
  id: string,
  guest: Omit<Guest, "id" | "createdAt" | "updatedAt">
): Promise<GuestResponse> => {
  const response = await API.put<GuestResponse>(`/guests/${id}`, guest);
  return response.data;
};

export const deleteGuest = async (id: string): Promise<DeleteGuestResponse> => {
  const response = await API.delete<DeleteGuestResponse>(`/guests/${id}`);
  return response.data;
};

export const importGuests = async (eventId: string, csvText: string): Promise<ImportGuestsResponse> => {
  const response = await API.post<ImportGuestsResponse>("/guests/import/csv", {
    eventId,
    csvText
  });
  return response.data;
};

const guestService = {
  getGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
  importGuests,
};

export default guestService;
