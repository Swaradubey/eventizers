export interface Guest {
  id?: string;
  eventId: string;
  eventTitle?: string;
  name: string;
  email: string;
  phone?: string;
  status: "invited" | "confirmed" | "declined" | "pending";
  createdAt?: string;
  updatedAt?: string;
}

export interface GuestsResponse {
  success: boolean;
  guests: Guest[];
}

export interface GuestResponse {
  success: boolean;
  guest: Guest;
  message?: string;
}

export interface DeleteGuestResponse {
  success: boolean;
  message: string;
}

export interface ImportGuestsResponse {
  success: boolean;
  message: string;
  guests: Guest[];
}
