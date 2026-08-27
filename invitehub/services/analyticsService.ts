import API from "./api";

export interface RSVPStatusDetail {
  count: number;
  percentage: number;
}

export interface RSVPBreakdown {
  attending: RSVPStatusDetail;
  declined: RSVPStatusDetail;
  maybe: RSVPStatusDetail;
  pending: RSVPStatusDetail;
}

export interface EventPerformance {
  openRate: number;
  clickRate: number;
}

export interface EventPerformanceItem {
  id: string;
  name: string;
  totalGuests: number;
  rsvpRate: number;
  openRate: number;
}

export interface AnalyticsOverview {
  totalInvitations: number;
  responseRate: number;
  clickRate: number;
  averageResponseTimeDays: number;
  rsvpBreakdown: RSVPBreakdown;
  eventPerformance: EventPerformance;
  eventsPerformance?: EventPerformanceItem[];
}

interface AnalyticsOverviewResponse {
  success: boolean;
  totalInvitations: number;
  responseRate: number;
  clickRate: number;
  averageResponseTimeDays: number;
  rsvpBreakdown: RSVPBreakdown;
  eventPerformance: EventPerformance;
  eventsPerformance?: EventPerformanceItem[];
}

export const getAnalyticsOverview = async (): Promise<AnalyticsOverviewResponse> => {
  const response = await API.get<AnalyticsOverviewResponse>("/analytics/overview");
  return response.data;
};

const analyticsService = {
  getAnalyticsOverview,
};

export default analyticsService;
