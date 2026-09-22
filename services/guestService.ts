import API from "./api";
import {
  Guest,
  GuestResponse,
  GuestsResponse,
  DeleteGuestResponse,
  ImportGuestsResponse,
  GuestGroupsResponse,
  CreateGuestGroupResponse,
  UpdateGroupMembersResponse
} from "../types/guestTypes";

export const getGuests = async (
  pageOrSearch?: number | string,
  limitOrEventId?: number | string,
  search?: string,
  eventId?: string,
  group?: string
): Promise<GuestsResponse> => {
  let params: Record<string, any> = {};

  if (typeof pageOrSearch === "number") {
    params.page = pageOrSearch;
    if (typeof limitOrEventId === "number") {
      params.limit = limitOrEventId;
    }
    if (search) params.search = search;
    if (eventId) params.eventId = eventId;
    if (group && group !== "all") params.group = group;
  } else {
    if (pageOrSearch) params.search = pageOrSearch;
    if (typeof limitOrEventId === "string") params.eventId = limitOrEventId;
    if (group && group !== "all") params.group = group;
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
  guest: Partial<Guest> | Omit<Guest, "id" | "createdAt" | "updatedAt">
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

export const getGuestGroups = async (): Promise<GuestGroupsResponse> => {
  const response = await API.get<GuestGroupsResponse>("/guests/groups");
  return response.data;
};

export const createGuestGroup = async (name: string): Promise<CreateGuestGroupResponse> => {
  const response = await API.post<CreateGuestGroupResponse>("/guests/groups", { name });
  return response.data;
};

export const deleteGuestGroup = async (name: string): Promise<{ success: boolean; message: string }> => {
  const response = await API.delete<{ success: boolean; message: string }>(`/guests/groups/${encodeURIComponent(name)}`);
  return response.data;
};

export const updateGroupMembers = async (
  groupName: string,
  guestIds: string[]
): Promise<UpdateGroupMembersResponse> => {
  const response = await API.put<UpdateGroupMembersResponse>(
    `/guests/groups/${encodeURIComponent(groupName)}/members`,
    { guestIds }
  );
  return response.data;
};

// ─── Guest change sync (cross-page invalidation) ─────────────────────────────
// There is no React Query/SWR in this app, so we use a lightweight window event
// as a shared invalidation bus. Any producer (Canvas modal, studio, etc.) calls
// notifyGuestsChanged() after a mutation; consumers (Guest page, dashboards)
// subscribe and refetch their guest/group queries.
export const GUESTS_CHANGED_EVENT = "invitehub:guests-changed";

export const notifyGuestsChanged = (): void => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(GUESTS_CHANGED_EVENT, { detail: { source: "guest-mutation" } }));
  }
};

export const subscribeToGuestsChanged = (listener: () => void): (() => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(GUESTS_CHANGED_EVENT, listener);
  return () => window.removeEventListener(GUESTS_CHANGED_EVENT, listener);
};

// ─── Map selected guests onto an event's guest collection ────────────────────
// Called by the Canvas "Apply & Add Guests" handler. Guests already belonging to
// the event are left untouched; guests from other events / account-wide contacts
// are assigned to this event via PUT /guests/:id so they appear in the event's
// guest list and counts on the Guest Management page.
export const assignGuestsToEvent = async (
  guests: Array<{ id?: string; eventId?: string }>,
  eventId: string
): Promise<{ success: boolean; assignedCount: number }> => {
  if (!eventId) return { success: true, assignedCount: 0 };

  const toAssign = guests.filter((g) => g.id && g.eventId !== eventId);
  if (toAssign.length === 0) return { success: true, assignedCount: 0 };

  const results = await Promise.allSettled(
    toAssign.map((g) => updateGuest(g.id as string, { eventId }))
  );

  const assignedCount = results.filter((r) => r.status === "fulfilled" && r.value?.success).length;
  return { success: assignedCount > 0, assignedCount };
};

// GUEST PORTAL API METHODS
export const getMyGuestPortal = async (): Promise<any> => {
  const response = await API.get("/guests/me/portal");
  return response.data;
};

export const submitGuestRsvp = async (payload: {
  guestId: string;
  eventId?: string;
  status: string;
  plusOnes?: number;
  dietaryRestrictions?: string;
  notes?: string;
}): Promise<{ success: boolean; message: string; guest?: any }> => {
  const response = await API.post("/guests/me/rsvp", payload);
  return response.data;
};

export const selfCheckInGuest = async (payload: {
  guestId: string;
  eventId?: string;
}): Promise<{ success: boolean; message: string; checkIn?: any }> => {
  const response = await API.post("/guests/me/check-in", payload);
  return response.data;
};

export const uploadGuestGalleryPhoto = async (payload: {
  eventId?: string;
  photoUrl: string;
  caption?: string;
}): Promise<{ success: boolean; message: string; photo?: any }> => {
  const response = await API.post("/guests/me/gallery", payload);
  return response.data;
};

const guestService = {
  getGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
  importGuests,
  getGuestGroups,
  createGuestGroup,
  deleteGuestGroup,
  updateGroupMembers,
  getMyGuestPortal,
  submitGuestRsvp,
  selfCheckInGuest,
  uploadGuestGalleryPhoto,
};

export default guestService;

