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
