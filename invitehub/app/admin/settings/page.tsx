"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../../../components/Navbar";
import { useSidebar } from "../../../context/SidebarContext";
import settingsService, {
  AdminProfileData,
  AdminNotificationSettingsData,
  AdminSecuritySettingsData,
  AdminTeamMemberData,
  AdminPreferencesData
} from "../../../services/settingsService";
import {
  User,
  Bell,
  Shield,
  Users,
  Sliders,
  CheckCircle,
  AlertCircle,
  X,
  Lock,
  Plus,
  Trash2,
  Key,
  Globe,
  Settings,
  Mail,
  Loader2,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  // Navigation state
  const [activeTab, setActiveTab] = useState("profile");

  // Loading & Error states
  const [pageLoading, setPageLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Profile Form States
  const [profileData, setProfileData] = useState<AdminProfileData>({
    fullName: "",
    email: "",
    organization: "",
    profileImage: ""
  });

  // Notifications Form States
  const [notificationData, setNotificationData] = useState<AdminNotificationSettingsData>({
    rsvpResponses: true,
    eventReminders: true,
    securityAlerts: true,
    weeklySummary: false,
    productUpdates: false
  });

  // Privacy & Security States
  const [securityData, setSecurityData] = useState<AdminSecuritySettingsData>({
    twoFactorAuth: false,
    publicProfile: true,
    dataSharing: true
  });

  // Change Password States
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Team Management States
  const [teamMembers, setTeamMembers] = useState<AdminTeamMemberData[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "Member"
  });

  // Preferences Form States
  const [preferencesData, setPreferencesData] = useState<AdminPreferencesData>({
    theme: "light",
    language: "en",
    timezone: "UTC",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "24h"
  });

  // Auth Guard check
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/admin/login");
      } else if (user.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  // Load all settings data on mount
  useEffect(() => {
    if (user && user.role === "ADMIN") {
      loadSettings();
    }
  }, [user]);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const loadSettings = async () => {
    setPageLoading(true);
    setError(null);
    try {
      const [profileRes, notifRes, secRes, teamRes, prefRes] = await Promise.all([
        settingsService.getProfile(),
        settingsService.getNotifications(),
        settingsService.getSecurity(),
        settingsService.getTeamMembers(),
        settingsService.getPreferences()
      ]);

      if (profileRes.success) setProfileData(profileRes.data);
      if (notifRes.success) setNotificationData(notifRes.data);
      if (secRes.success) setSecurityData(secRes.data);
      if (teamRes.success) setTeamMembers(teamRes.data);
      if (prefRes.success) setPreferencesData(prefRes.data);

    } catch (err: any) {
      console.error("Error loading settings:", err);
      setError(err.response?.data?.error || "Failed to load admin settings database.");
    } finally {
      setPageLoading(false);
    }
  };

  // Profile Save
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.fullName || !profileData.email) {
      showToast("Full Name and Email are required.", "error");
      return;
    }
    setSaveLoading(true);
    try {
      const res = await settingsService.updateProfile(profileData);
      if (res.success) {
        showToast(res.message || "Profile updated successfully!");
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to update profile.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // Notification Toggle Auto-Save
  const handleNotificationToggle = async (key: keyof AdminNotificationSettingsData) => {
    const updated = { ...notificationData, [key]: !notificationData[key] };
    setNotificationData(updated);
    try {
      const res = await settingsService.updateNotifications(updated);
      if (res.success) {
        showToast("Notification settings auto-saved.");
      }
    } catch (err: any) {
      showToast("Failed to save notification settings.", "error");
      // revert state
      setNotificationData(notificationData);
    }
  };

  // Security Toggle Auto-Save
  const handleSecurityToggle = async (key: keyof AdminSecuritySettingsData) => {
    const updated = { ...securityData, [key]: !securityData[key] };
    setSecurityData(updated);
    try {
      const res = await settingsService.updateSecurity(updated);
      if (res.success) {
        showToast("Security settings auto-saved.");
      }
    } catch (err: any) {
      showToast("Failed to save security settings.", "error");
      // revert state
      setSecurityData(securityData);
    }
  };

  // Password Update
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("All password fields are required.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }

    setSaveLoading(true);
    try {
      const res = await settingsService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      if (res.success) {
        showToast("Password updated successfully!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to change password.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // Invite Team Member
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) {
      showToast("Name and Email are required.", "error");
      return;
    }
    setSaveLoading(true);
    try {
      const res = await settingsService.inviteTeamMember(inviteForm);
      if (res.success) {
        showToast(res.message || "Team member invited!");
        setInviteModalOpen(false);
        setInviteForm({ name: "", email: "", role: "Member" });
        loadSettings();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to invite team member.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // Remove Team Member
  const handleRemoveMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    try {
      const res = await settingsService.removeTeamMember(id);
      if (res.success) {
        showToast("Team member removed successfully.");
        loadSettings();
      }
    } catch (err: any) {
      showToast("Failed to remove team member.", "error");
    }
  };

  // Preferences Save
  const handlePreferencesSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await settingsService.updatePreferences(preferencesData);
      if (res.success) {
        showToast("Preferences saved successfully!");
      }
    } catch (err: any) {
      showToast("Failed to save preferences.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#2D1B3D] animate-spin" />
      </div>
    );
  }

  const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Privacy & Security", icon: Shield },
    { id: "team", label: "Team", icon: Users },
    { id: "preferences", label: "Preferences", icon: Sliders }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-body text-[#2D1B3D] relative">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-8 pt-4 md:pt-6 pb-10 z-10">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-4xl md:text-5xl font-semibold text-[#2D1B3D] font-display">
                Settings
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/25">
                Admin
              </span>
            </div>
            <p className="text-sm text-[#2D1B3D]/60 mt-1">
              Configure system preferences, security, profiles and manage team accounts.
            </p>
          </div>
        </div>

        {pageLoading ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-[#2D1B3D]/40 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-800">Database Connection Issue</h3>
            <p className="text-sm text-red-700 mt-2">{error}</p>
            <button
              onClick={loadSettings}
              className="mt-5 px-5 py-2.5 text-xs font-bold text-white bg-red-700 rounded-xl hover:bg-red-800 transition-all"
            >
              Retry Loading Settings
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Vertical Navigation Menu */}
            <aside className="w-full lg:w-64 bg-white border border-[#E8C4B8]/30 rounded-2xl p-3 shadow-sm flex flex-col gap-1.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all relative ${
                      isActive
                        ? "text-[#5C4318] bg-[#FAF0D6] border border-[#EAD8AF]/50 shadow-sm"
                        : "text-[#8C7A5B] hover:bg-[#FAF8F5] hover:text-[#5C4318]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#C9A84C]" : "text-[#8C7A5B]"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </aside>

            {/* Right Tab Content Panel */}
            <section className="flex-1 w-full bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 md:p-8 shadow-sm min-h-[500px]">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <form onSubmit={handleProfileSave} className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-bold font-display">Profile Details</h3>
                    <p className="text-xs text-[#2D1B3D]/50 mt-0.5">Manage your user identity and organization info.</p>
                  </div>

                  {/* Profile Image & Preview */}
                  <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20 rounded-full border border-[#E8C4B8]/40 bg-[#FAF8F5] overflow-hidden flex items-center justify-center">
                      {profileData.profileImage ? (
                        <img
                          src={profileData.profileImage}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).src = "";
                            showToast("Unable to load profile image URL", "error");
                          }}
                        />
                      ) : (
                        <User className="w-8 h-8 text-[#8C7A5B]/50" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                        Profile Image URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        value={profileData.profileImage}
                        onChange={(e) => setProfileData({ ...profileData, profileImage: e.target.value })}
                        className="w-full max-w-md px-3.5 py-2 text-xs border border-[#E8C4B8]/30 rounded-xl focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter full name"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        className="px-3.5 py-2.5 text-xs border border-[#E8C4B8]/30 rounded-xl focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Enter email address"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="px-3.5 py-2.5 text-xs border border-[#E8C4B8]/30 rounded-xl focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                        Organization / Company
                      </label>
                      <input
                        type="text"
                        placeholder="Enter organization name"
                        value={profileData.organization}
                        onChange={(e) => setProfileData({ ...profileData, organization: e.target.value })}
                        className="px-3.5 py-2.5 text-xs border border-[#E8C4B8]/30 rounded-xl focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#E8C4B8]/20 flex justify-end">
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {saveLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-bold font-display">Notification Settings</h3>
                    <p className="text-xs text-[#2D1B3D]/50 mt-0.5">Toggle alert channels and digest frequencies.</p>
                  </div>

                  <div className="divide-y divide-[#E8C4B8]/20 flex flex-col">
                    {[
                      { key: "rsvpResponses", title: "RSVP Responses", desc: "Get notified as soon as any guest sends their RSVP status." },
                      { key: "eventReminders", title: "Event Reminders", desc: "Receive automated system notification updates before events start." },
                      { key: "securityAlerts", title: "Security Alerts", desc: "Get alerted immediately on new login activities or authorization changes." },
                      { key: "weeklySummary", title: "Weekly Summary Report", desc: "Weekly newsletter digest summarizing metrics, ticks, and check-ins." },
                      { key: "productUpdates", title: "Product Updates", desc: "Stay informed about features, product roadmap updates and alerts." }
                    ].map((item) => {
                      const value = notificationData[item.key as keyof AdminNotificationSettingsData];
                      return (
                        <div key={item.key} className="py-4.5 flex justify-between items-center gap-4">
                          <div className="flex-1 flex flex-col gap-0.5">
                            <h4 className="text-xs font-bold text-[#2D1B3D]">{item.title}</h4>
                            <p className="text-[11px] text-[#2D1B3D]/55 leading-relaxed">{item.desc}</p>
                          </div>
                          {/* Toggle Switch */}
                          <button
                            onClick={() => handleNotificationToggle(item.key as keyof AdminNotificationSettingsData)}
                            className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-all outline-none ${
                              value ? "bg-[#C9A84C]" : "bg-[#E8C4B8]/30"
                            }`}
                          >
                            <div
                              className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-all duration-200 ${
                                value ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Privacy & Security Tab */}
              {activeTab === "security" && (
                <div className="flex flex-col gap-8">
                  {/* Security Toggles */}
                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="text-lg font-bold font-display">Privacy Settings</h3>
                      <p className="text-xs text-[#2D1B3D]/50 mt-0.5">Control data visibility and auth preferences.</p>
                    </div>

                    <div className="divide-y divide-[#E8C4B8]/20 flex flex-col">
                      {[
                        { key: "twoFactorAuth", title: "Two-factor Authentication (2FA)", desc: "Enforce verification verification code check on admin logins." },
                        { key: "publicProfile", title: "Public Directory Profile", desc: "Let external visitors discover your admin page profile." },
                        { key: "dataSharing", title: "Anonymous Data Sharing", desc: "Participate in usage metrics reporting for better server updates." }
                      ].map((item) => {
                        const value = securityData[item.key as keyof AdminSecuritySettingsData];
                        return (
                          <div key={item.key} className="py-4.5 flex justify-between items-center gap-4">
                            <div className="flex-1 flex flex-col gap-0.5">
                              <h4 className="text-xs font-bold text-[#2D1B3D]">{item.title}</h4>
                              <p className="text-[11px] text-[#2D1B3D]/55 leading-relaxed">{item.desc}</p>
                            </div>
                            <button
                              onClick={() => handleSecurityToggle(item.key as keyof AdminSecuritySettingsData)}
                              className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-all outline-none ${
                                value ? "bg-[#C9A84C]" : "bg-[#E8C4B8]/30"
                              }`}
                            >
                              <div
                                className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-all duration-200 ${
                                  value ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Password Change Form */}
                  <form onSubmit={handlePasswordSave} className="flex flex-col gap-5 border-t border-[#E8C4B8]/20 pt-8">
                    <div>
                      <h3 className="text-lg font-bold font-display flex items-center gap-2">
                        <Key className="w-5 h-5 text-[#C9A84C]" />
                        Change Password
                      </h3>
                      <p className="text-xs text-[#2D1B3D]/50 mt-0.5">Change password settings regularly to keep account safe.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4.5 max-w-md">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                          Current Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="px-3.5 py-2.5 text-xs border border-[#E8C4B8]/30 rounded-xl focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="px-3.5 py-2.5 text-xs border border-[#E8C4B8]/30 rounded-xl focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="px-3.5 py-2.5 text-xs border border-[#E8C4B8]/30 rounded-xl focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex justify-start">
                      <button
                        type="submit"
                        disabled={saveLoading}
                        className="px-5 py-2.5 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {saveLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Team Management Tab */}
              {activeTab === "team" && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold font-display">Team Management</h3>
                      <p className="text-xs text-[#2D1B3D]/50 mt-0.5">Control roles and authorizations of team members.</p>
                    </div>
                    <button
                      onClick={() => setInviteModalOpen(true)}
                      className="px-4 py-2.5 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl flex items-center gap-2 transition-all shadow-sm focus:outline-none"
                    >
                      <Plus className="w-4 h-4" />
                      Invite Member
                    </button>
                  </div>

                  {/* Team Members List */}
                  <div className="border border-[#E8C4B8]/30 rounded-2xl overflow-hidden mt-2">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-[#E8C4B8]/30 bg-[#FAF8F5]/50">
                            <th className="py-3.5 px-4.5 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Name</th>
                            <th className="py-3.5 px-4.5 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Email</th>
                            <th className="py-3.5 px-4.5 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Role</th>
                            <th className="py-3.5 px-4.5 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Status</th>
                            <th className="py-3.5 px-4.5 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8C4B8]/20 bg-white">
                          {teamMembers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-xs text-[#2D1B3D]/45">
                                No team members found. Start by inviting a teammate.
                              </td>
                            </tr>
                          ) : (
                            teamMembers.map((member) => (
                              <tr key={member.id} className="hover:bg-[#FAF8F5]/30 transition-colors">
                                <td className="py-3.5 px-4.5 text-xs font-semibold text-[#2D1B3D]">{member.name}</td>
                                <td className="py-3.5 px-4.5 text-xs text-[#2D1B3D]/75">{member.email}</td>
                                <td className="py-3.5 px-4.5">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    member.role === "Owner"
                                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                                      : member.role === "Admin"
                                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                                      : "bg-blue-50 text-blue-700 border border-blue-200"
                                  }`}>
                                    {member.role}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4.5">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                    member.status === "active"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                                  }`}>
                                    {member.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4.5 text-right">
                                  <button
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                                    title="Remove team member"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <form onSubmit={handlePreferencesSave} className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-bold font-display">System Preferences</h3>
                    <p className="text-xs text-[#2D1B3D]/50 mt-0.5">Customize UI display formatting options.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                        UI theme
                      </label>
                      <select
                        value={preferencesData.theme}
                        onChange={(e) => setPreferencesData({ ...preferencesData, theme: e.target.value })}
                        className="px-3 py-2.5 text-xs bg-white border border-[#E8C4B8]/30 rounded-xl focus:border-[#2D1B3D] outline-none cursor-pointer"
                      >
                        <option value="light">Light Theme</option>
                        <option value="dark">Dark Theme</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                        Language
                      </label>
                      <select
                        value={preferencesData.language}
                        onChange={(e) => setPreferencesData({ ...preferencesData, language: e.target.value })}
                        className="px-3 py-2.5 text-xs bg-white border border-[#E8C4B8]/30 rounded-xl focus:border-[#2D1B3D] outline-none cursor-pointer"
                      >
                        <option value="en">English (US)</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="hi">हिन्दी</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                        Timezone
                      </label>
                      <select
                        value={preferencesData.timezone}
                        onChange={(e) => setPreferencesData({ ...preferencesData, timezone: e.target.value })}
                        className="px-3 py-2.5 text-xs bg-white border border-[#E8C4B8]/30 rounded-xl focus:border-[#2D1B3D] outline-none cursor-pointer"
                      >
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                        <option value="America/New_York">Eastern Time (EST/EDT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                        <option value="Europe/London">London (GMT/BST)</option>
                        <option value="Asia/Kolkata">India Standard Time (IST)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                        Date Format
                      </label>
                      <select
                        value={preferencesData.dateFormat}
                        onChange={(e) => setPreferencesData({ ...preferencesData, dateFormat: e.target.value })}
                        className="px-3 py-2.5 text-xs bg-white border border-[#E8C4B8]/30 rounded-xl focus:border-[#2D1B3D] outline-none cursor-pointer"
                      >
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                        Time Format
                      </label>
                      <select
                        value={preferencesData.timeFormat}
                        onChange={(e) => setPreferencesData({ ...preferencesData, timeFormat: e.target.value })}
                        className="px-3 py-2.5 text-xs bg-white border border-[#E8C4B8]/30 rounded-xl focus:border-[#2D1B3D] outline-none cursor-pointer"
                      >
                        <option value="24h">24 Hour (00:00 - 23:59)</option>
                        <option value="12h">12 Hour (00:00 AM/PM - 12:00 AM/PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#E8C4B8]/20 flex justify-end">
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {saveLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Preferences
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Invite Team Member Overlay Modal */}
      <AnimatePresence>
        {inviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInviteModalOpen(false)}
              className="absolute inset-0 bg-[#2D1B3D]/30 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-[#E8C4B8]/40 shadow-2xl rounded-2xl w-full max-w-md p-6 z-10 relative overflow-hidden font-body text-[#2D1B3D]"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold font-display flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#C9A84C]" />
                  Invite Team Member
                </h3>
                <button
                  onClick={() => setInviteModalOpen(false)}
                  className="p-1.5 hover:bg-[#FAF8F5] rounded-xl text-[#2D1B3D]/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter teammate full name"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    className="px-3.5 py-2.5 text-xs border border-[#E8C4B8]/30 rounded-xl focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="px-3.5 py-2.5 text-xs border border-[#E8C4B8]/30 rounded-xl focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                    Member Role
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="px-3 py-2.5 text-xs bg-white border border-[#E8C4B8]/30 rounded-xl focus:border-[#2D1B3D] outline-none cursor-pointer"
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>

                <div className="mt-4 pt-4 border-t border-[#E8C4B8]/20 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold border border-[#E8C4B8]/30 rounded-xl hover:bg-[#FAF8F5] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {saveLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Send Invitation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST ALERTS */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-[#E8C4B8]/40"
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="text-xs font-semibold text-[#2D1B3D]">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-[#2D1B3D]/40 hover:text-[#2D1B3D] transition-colors ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
