import API from "./api";

export interface AdminProfileData {
  fullName: string;
  email: string;
  organization: string;
  profileImage: string;
}

export interface AdminNotificationSettingsData {
  rsvpResponses: boolean;
  eventReminders: boolean;
  securityAlerts: boolean;
  weeklySummary: boolean;
  productUpdates: boolean;
}

export interface AdminSecuritySettingsData {
  twoFactorAuth: boolean;
  publicProfile: boolean;
  dataSharing: boolean;
}

export interface AdminTeamMemberData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface AdminPreferencesData {
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

const settingsService = {
  // Profile
  getProfile: async (): Promise<{ success: boolean; data: AdminProfileData }> => {
    const response = await API.get("/admin/settings/profile");
    return response.data;
  },

  updateProfile: async (data: AdminProfileData): Promise<{ success: boolean; data: AdminProfileData; message?: string }> => {
    const response = await API.put("/admin/settings/profile", data);
    return response.data;
  },

  // Notifications
  getNotifications: async (): Promise<{ success: boolean; data: AdminNotificationSettingsData }> => {
    const response = await API.get("/admin/settings/notifications");
    return response.data;
  },

  updateNotifications: async (data: AdminNotificationSettingsData): Promise<{ success: boolean; data: AdminNotificationSettingsData; message?: string }> => {
    const response = await API.put("/admin/settings/notifications", data);
    return response.data;
  },

  // Security & Privacy
  getSecurity: async (): Promise<{ success: boolean; data: AdminSecuritySettingsData }> => {
    const response = await API.get("/admin/settings/security");
    return response.data;
  },

  updateSecurity: async (data: AdminSecuritySettingsData): Promise<{ success: boolean; data: AdminSecuritySettingsData; message?: string }> => {
    const response = await API.put("/admin/settings/security", data);
    return response.data;
  },

  changePassword: async (payload: any): Promise<{ success: boolean; message?: string }> => {
    const response = await API.post("/admin/settings/change-password", payload);
    return response.data;
  },

  // Team
  getTeamMembers: async (): Promise<{ success: boolean; data: AdminTeamMemberData[] }> => {
    const response = await API.get("/admin/settings/team");
    return response.data;
  },

  inviteTeamMember: async (data: Omit<AdminTeamMemberData, "id" | "createdAt" | "status">): Promise<{ success: boolean; data: AdminTeamMemberData; message?: string }> => {
    const response = await API.post("/admin/settings/team", data);
    return response.data;
  },

  updateTeamMember: async (id: string, data: Partial<AdminTeamMemberData>): Promise<{ success: boolean; data: AdminTeamMemberData; message?: string }> => {
    const response = await API.put(`/admin/settings/team/${id}`, data);
    return response.data;
  },

  removeTeamMember: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await API.delete(`/admin/settings/team/${id}`);
    return response.data;
  },

  // Preferences
  getPreferences: async (): Promise<{ success: boolean; data: AdminPreferencesData }> => {
    const response = await API.get("/admin/settings/preferences");
    return response.data;
  },

  updatePreferences: async (data: AdminPreferencesData): Promise<{ success: boolean; data: AdminPreferencesData; message?: string }> => {
    const response = await API.put("/admin/settings/preferences", data);
    return response.data;
  },
};

export default settingsService;
