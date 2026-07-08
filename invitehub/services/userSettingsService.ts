import API from "./api";
import {
  AdminProfileData,
  AdminNotificationSettingsData,
  AdminSecuritySettingsData,
  AdminTeamMemberData,
  AdminPreferencesData
} from "./settingsService";

const userSettingsService = {
  // Profile
  getProfile: async (): Promise<{ success: boolean; data: AdminProfileData }> => {
    const response = await API.get("/user/settings/profile");
    return response.data;
  },

  updateProfile: async (data: AdminProfileData): Promise<{ success: boolean; data: AdminProfileData; message?: string }> => {
    const response = await API.put("/user/settings/profile", data);
    return response.data;
  },

  // Notifications
  getNotifications: async (): Promise<{ success: boolean; data: AdminNotificationSettingsData }> => {
    const response = await API.get("/user/settings/notifications");
    return response.data;
  },

  updateNotifications: async (data: AdminNotificationSettingsData): Promise<{ success: boolean; data: AdminNotificationSettingsData; message?: string }> => {
    const response = await API.put("/user/settings/notifications", data);
    return response.data;
  },

  // Security & Privacy
  getSecurity: async (): Promise<{ success: boolean; data: AdminSecuritySettingsData }> => {
    const response = await API.get("/user/settings/security");
    return response.data;
  },

  updateSecurity: async (data: AdminSecuritySettingsData): Promise<{ success: boolean; data: AdminSecuritySettingsData; message?: string }> => {
    const response = await API.put("/user/settings/security", data);
    return response.data;
  },

  changePassword: async (payload: any): Promise<{ success: boolean; message?: string }> => {
    const response = await API.post("/user/settings/change-password", payload);
    return response.data;
  },

  // Team
  getTeamMembers: async (): Promise<{ success: boolean; data: AdminTeamMemberData[] }> => {
    const response = await API.get("/user/settings/team");
    return response.data;
  },

  inviteTeamMember: async (data: Omit<AdminTeamMemberData, "id" | "createdAt" | "status">): Promise<{ success: boolean; data: AdminTeamMemberData; message?: string }> => {
    const response = await API.post("/user/settings/team", data);
    return response.data;
  },

  updateTeamMember: async (id: string, data: Partial<AdminTeamMemberData>): Promise<{ success: boolean; data: AdminTeamMemberData; message?: string }> => {
    const response = await API.put(`/user/settings/team/${id}`, data);
    return response.data;
  },

  removeTeamMember: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await API.delete(`/user/settings/team/${id}`);
    return response.data;
  },

  // Preferences
  getPreferences: async (): Promise<{ success: boolean; data: AdminPreferencesData }> => {
    const response = await API.get("/user/settings/preferences");
    return response.data;
  },

  updatePreferences: async (data: AdminPreferencesData): Promise<{ success: boolean; data: AdminPreferencesData; message?: string }> => {
    const response = await API.put("/user/settings/preferences", data);
    return response.data;
  },
};

export default userSettingsService;
