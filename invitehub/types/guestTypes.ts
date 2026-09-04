export interface Guest {
  id?: string;
  eventId: string;
  eventTitle?: string;
  name: string;
  email: string;
  phone?: string | null;
  status: "invited" | "confirmed" | "declined" | "pending";
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
