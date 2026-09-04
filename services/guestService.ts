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
};

export default guestService;
