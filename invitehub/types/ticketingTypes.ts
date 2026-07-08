export type TicketTierStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT' | 'EXPIRED' | 'ARCHIVED' | 'SCHEDULED';

export interface TicketTier {
  id?: string;
  eventId: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  capacity: number;
  minPerOrder: number;
  maxPerOrder?: number | null;
  salesStartAt?: string | null;
  salesEndAt?: string | null;
  status: TicketTierStatus;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Custom calculated statistics per tier (provided by the service layer)
  quantitySold?: number;
  remainingQuantity?: number;
  revenueEarned?: number;
}

export interface TicketingSummary {
  totalRevenue: number;
  ticketsSold: number;
  capacity: number;
  sellThrough: number;
}

export interface TicketingEventsResponse {
  success: boolean;
  events: {
    id: string;
    title: string;
  }[];
}

export interface TicketingSummaryResponse {
  success: boolean;
  summary: TicketingSummary;
}

export interface TicketTiersResponse {
  success: boolean;
  tiers: TicketTier[];
}

export interface TicketTierResponse {
  success: boolean;
  tier: TicketTier;
  message?: string;
}

export interface DeleteTicketTierResponse {
  success: boolean;
  message: string;
  deleted: boolean;
  archived: boolean;
}
