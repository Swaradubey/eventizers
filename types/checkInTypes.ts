export interface CheckInSummary {
  checkedIn: number;
  pending: number;
  total: number;
}

export interface CheckInSummaryResponse {
  success: boolean;
  summary: CheckInSummary;
}

export interface CheckInGuest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ticketTier: string;
  status: "CHECKED_IN" | "PENDING";
  checkedInAt?: string | null;
  method?: "QR" | "MANUAL" | null;
  gpsVerified: boolean;
  checkInId?: string | null;
}

export interface CheckInGuestsResponse {
  success: boolean;
  guests: CheckInGuest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CheckInRecord {
  id: string;
  eventId: string;
  guestId?: string | null;
  ticketId?: string | null;
  checkedInAt: string;
  checkedInById?: string | null;
  method: "QR" | "MANUAL";
  latitude?: number | null;
  longitude?: number | null;
  deviceInfo?: string | null;
  notes?: string | null;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  checkIn?: CheckInRecord;
  guest?: CheckInGuest;
}

export interface UndoCheckInResponse {
  success: boolean;
  message: string;
}
