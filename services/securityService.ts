import API from "./api";
import { SecurityDashboardResponse } from "../types/securityTypes";

/**
 * Fetch the security dashboard stats, alerts, and audit logs
 */
export const getSecurityDashboard = async (): Promise<SecurityDashboardResponse> => {
  const response = await API.get<SecurityDashboardResponse>("/security/dashboard");
  return response.data;
};

/**
 * Delete an audit log entry
 */
export const deleteAuditLog = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await API.delete<{ success: boolean; message: string }>(`/security/audit-logs/${id}`);
  return response.data;
};

const securityService = {
  getSecurityDashboard,
  deleteAuditLog,
};

export default securityService;
