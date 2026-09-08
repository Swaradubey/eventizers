import API from "./api";

export interface GpsEvent {
  id: string;
  title: string;
  venue?: string;
  address?: string;
  venueLatitude?: number | string | null;
  venueLongitude?: number | string | null;
  geofenceRadius?: number;
}

export interface GpsArrival {
  id: string;
  guestId?: string | null;
  guestName: string;
  guestEmail?: string | null;
  method: string;
  distanceMeters?: number | null;
  checkedInAt: string;
  deviceInfo?: string | null;
}

export interface GpsCheckInResult {
  success: boolean;
  message?: string;
  distance?: number;
  geofenceRadius?: number;
  checkIn?: any;
  error?: string;
  eventLocation?: {
    venue: string;
    latitude: number;
    longitude: number;
  };
}

export interface ArrivalsResponse {
  success: boolean;
  count: number;
  arrivals: GpsArrival[];
}

export const getEventsList = async (): Promise<GpsEvent[]> => {
  try {
    const res = await API.get("/events");
    if (res.data && res.data.events) {
      return res.data.events;
    }
  } catch (err) {
    console.warn("Falling back to ticketing events...", err);
  }

  try {
    const fallbackRes = await API.get("/ticketing/events");
    return fallbackRes.data.events || [];
  } catch (err) {
    console.error("Failed to load events list:", err);
    return [];
  }
};

export const getEventDetails = async (eventId: string): Promise<GpsEvent | null> => {
  try {
    const res = await API.get(`/events/${eventId}`);
    return res.data.event || null;
  } catch (err) {
    console.error("Failed to load event details:", err);
    return null;
  }
};

export const submitGpsCheckIn = async (
  eventId: string,
  coords: { latitude: number; longitude: number }
): Promise<GpsCheckInResult> => {
  const res = await API.post<GpsCheckInResult>(`/events/${eventId}/gps-checkin`, coords);
  return res.data;
};

export const getLiveArrivals = async (eventId: string): Promise<ArrivalsResponse> => {
  const res = await API.get<ArrivalsResponse>(`/events/${eventId}/arrivals`);
  return res.data;
};

export const updateGeofenceRadius = async (
  eventId: string,
  params: { geofenceRadius: number; venueLatitude?: number; venueLongitude?: number }
): Promise<any> => {
  const res = await API.patch(`/events/${eventId}/geofence`, params);
  return res.data;
};

const gpsCheckInService = {
  getEventsList,
  getEventDetails,
  submitGpsCheckIn,
  getLiveArrivals,
  updateGeofenceRadius,
};

export default gpsCheckInService;
