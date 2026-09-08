export interface Guest {
  id?: string;
  eventId: string;
  eventTitle?: string;
  name: string;
  email: string;
  phone?: string | null;
  status: "invited" | "confirmed" | "declined" | "pending";
  rsvpStatus?: string;
  groups?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GuestGroupsResponse {
  success: boolean;
  groups: string[];
  counts?: Record<string, number>;
}

export interface CreateGuestGroupResponse {
  success: boolean;
  group?: { id?: string; name: string; createdAt?: string };
  message?: string;
}

export interface UpdateGroupMembersResponse {
  success: boolean;
  message: string;
  group: string;
  count: number;
}

export interface PaginationMetadata {
  page: number;
  currentPage?: number;
  limit: number;
  total: number;
  totalCount?: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface GuestsResponse {
  success: boolean;
  guests: Guest[];
  pagination?: PaginationMetadata;
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

export interface GuestPortalRegistry {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  goalAmount?: number | null;
  currentAmount?: number | null;
  currency?: string;
  externalUrl?: string | null;
  contributorCount?: number;
}

export interface GuestPortalEvent {
  id: string;
  title: string;
  description?: string | null;
  venue: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  eventDate: string;
  eventTime: string;
  coverImage?: string | null;
  invitation?: any;
  rsvpSettings?: any;
  registries?: GuestPortalRegistry[];
}

export interface GuestPortalInvitationItem {
  guestId: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  rsvpStatus: string;
  respondedAt?: string | null;
  isCheckedIn: boolean;
  event: GuestPortalEvent;
}

export interface GuestPortalResponse {
  success: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    phoneNumber?: string | null;
  };
  invitations: GuestPortalInvitationItem[];
  activeInvitation: GuestPortalInvitationItem | null;
}

