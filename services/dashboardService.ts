import API from "./api";

export interface DashboardStats {
  totalEvents: number;
  totalGuests: number;
  avgRsvpRate: number;
  messagesSent: number;
}

interface DashboardStatsResponse {
  success: boolean;
  totalEvents: number;
  totalGuests: number;
  avgRsvpRate: number;
  messagesSent: number;
}

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  const response = await API.get<DashboardStatsResponse>("/dashboard/stats");
  return response.data;
};

const dashboardService = {
  getDashboardStats,
};

export default dashboardService;
