export interface SecurityStats {
  activeAlerts: number;
  duplicateTickets: number;
  failedVerifications: number;
  securityScore: number;
}

export interface SecurityAlert {
  id: string;
  type: string;
  description: string;
  severity: string;
  isResolved: boolean;
  createdAt: string;
  eventId: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorEmail: string;
  createdAt: string;
  eventId: string;
}

export interface SecurityDashboardData {
  stats: SecurityStats;
  alerts: SecurityAlert[];
  auditLogs: AuditLog[];
}

export interface SecurityDashboardResponse {
  success: boolean;
  data: SecurityDashboardData;
}

export interface SecuritySummary {
  activeAlerts: number;
  duplicateTickets: number;
  failedVerifications: number;
  securityScore: number;
  recentLogs: number;
}

export interface SecuritySummaryResponse {
  success: boolean;
  data: SecuritySummary;
}

export interface SecurityAlertsResponse {
  success: boolean;
  data: SecurityAlert[];
}

export interface SecurityAuditLogsResponse {
  success: boolean;
  data: AuditLog[];
}

