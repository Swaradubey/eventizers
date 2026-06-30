import API from "./api";
import {
  CheckInSummaryResponse,
  CheckInGuestsResponse,
  CheckInResponse,
  UndoCheckInResponse,
} from "../types/checkInTypes";

export const getCheckInEvents = async (): Promise<{ success: boolean; events: { id: string; title: string }[] }> => {
  const response = await API.get("/ticketing/events");
  return response.data;
};

export const getCheckInSummary = async (eventId: string): Promise<CheckInSummaryResponse> => {
  const response = await API.get<CheckInSummaryResponse>(`/check-ins/events/${eventId}/summary`);
  return response.data;
};

export const getEventGuests = async (
  eventId: string,
  params: { search?: string; status?: string; page?: number; limit?: number } = {}
): Promise<CheckInGuestsResponse> => {
  const response = await API.get<CheckInGuestsResponse>(`/check-ins/events/${eventId}/guests`, {
    params,
  });
  return response.data;
};

export const checkInGuestManual = async (
  eventId: string,
  guestId: string,
  latitude?: number,
  longitude?: number
): Promise<CheckInResponse> => {
  const response = await API.post<CheckInResponse>(`/check-ins/events/${eventId}/manual`, {
    guestId,
    latitude,
    longitude,
  });
  return response.data;
};

export const checkInGuestScan = async (
  eventId: string,
  qrCode: string,
  latitude?: number,
  longitude?: number
): Promise<CheckInResponse> => {
  const response = await API.post<CheckInResponse>(`/check-ins/events/${eventId}/scan`, {
    qrCode,
    latitude,
    longitude,
  });
  return response.data;
};

export const undoCheckIn = async (checkInId: string): Promise<UndoCheckInResponse> => {
  const response = await API.delete<UndoCheckInResponse>(`/check-ins/${checkInId}`);
  return response.data;
};

const checkInService = {
  getCheckInEvents,
  getCheckInSummary,
  getEventGuests,
  checkInGuestManual,
  checkInGuestScan,
  undoCheckIn,
};

export default checkInService;
