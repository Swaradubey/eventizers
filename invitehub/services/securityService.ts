import API from "./api";
import {
  SecurityDashboardResponse,
  SecuritySummaryResponse,
  SecurityAlertsResponse,
  SecurityAuditLogsResponse,
} from "../types/securityTypes";

/**
 * Fetch the security dashboard stats, alerts, and audit logs
 */
export const getSecurityDashboard = async (): Promise<SecurityDashboardResponse> => {
  const response = await API.get<SecurityDashboardResponse>("/security/dashboard");
  return response.data;
};

/**
 * Fetch the security summary (counts and score)
 */
export const getSecuritySummary = async (): Promise<SecuritySummaryResponse> => {
  const response = await API.get<SecuritySummaryResponse>("/security/summary");
  return response.data;
};

/**
 * Fetch security alerts
 */
export const getSecurityAlerts = async (): Promise<SecurityAlertsResponse> => {
  const response = await API.get<SecurityAlertsResponse>("/security/alerts");
  return response.data;
};

/**
 * Fetch audit logs
 */
export const getSecurityAuditLogs = async (): Promise<SecurityAuditLogsResponse> => {
  const response = await API.get<SecurityAuditLogsResponse>("/security/audit-logs");
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
  getSecuritySummary,
  getSecurityAlerts,
  getSecurityAuditLogs,
  deleteAuditLog,
};

export default securityService;
