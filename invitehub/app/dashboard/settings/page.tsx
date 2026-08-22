"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../../../components/Navbar";
import { useSidebar } from "../../../context/SidebarContext";
import { useTheme } from "../../../context/ThemeContext";
import userSettingsService from "../../../services/userSettingsService";
import { getImageUrl } from "../../../utils/imageUrl";
import {
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
  Camera,
  Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();
  const { setTheme } = useTheme();

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
        router.push("/login");
      }
    }
  }, [user, authLoading, router]);

  // Load all settings data on mount
  useEffect(() => {
    if (user) {
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
        userSettingsService.getProfile(),
        userSettingsService.getNotifications(),
        userSettingsService.getSecurity(),
        userSettingsService.getTeamMembers(),
        userSettingsService.getPreferences()
      ]);

      if (profileRes.success) setProfileData(profileRes.data);
      if (notifRes.success) setNotificationData(notifRes.data);
      if (secRes.success) setSecurityData(secRes.data);
      if (teamRes.success) setTeamMembers(teamRes.data);
      if (prefRes.success) setPreferencesData(prefRes.data);

    } catch (err: any) {
      console.error("Error loading user settings:", err);
      setError(err.response?.data?.error || "Failed to load user settings database.");
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
      const res = await userSettingsService.updateProfile(profileData);
      if (res.success) {
        showToast(res.message || "Profile updated successfully!");
        const profileRes = await userSettingsService.getProfile();
        if (profileRes.success) setProfileData(profileRes.data);
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
      const res = await userSettingsService.updateNotifications(updated);
      if (res.success) {
        showToast("Notification settings auto-saved.");
        const notifRes = await userSettingsService.getNotifications();
        if (notifRes.success) setNotificationData(notifRes.data);
      }
    } catch (err: any) {
      showToast("Failed to save notification settings.", "error");
      setNotificationData(notificationData);
    }
  };

  // Security Toggle Auto-Save
  const handleSecurityToggle = async (key: keyof AdminSecuritySettingsData) => {
    const updated = { ...securityData, [key]: !securityData[key] };
    setSecurityData(updated);
    try {
      const res = await userSettingsService.updateSecurity(updated);
      if (res.success) {
        showToast("Security settings auto-saved.");
        const secRes = await userSettingsService.getSecurity();
        if (secRes.success) setSecurityData(secRes.data);
      }
    } catch (err: any) {
      showToast("Failed to save security settings.", "error");
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
      const res = await userSettingsService.changePassword({
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
      const res = await userSettingsService.inviteTeamMember(inviteForm);
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
      const res = await userSettingsService.removeTeamMember(id);
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
      const res = await userSettingsService.updatePreferences(preferencesData);
      if (res.success) {
        showToast("Preferences saved successfully!");
        setTheme(preferencesData.theme as any);
        const prefRes = await userSettingsService.getPreferences();
        if (prefRes.success) setPreferencesData(prefRes.data);
      }
    } catch (err: any) {
      showToast("Failed to save preferences.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Privacy & Security", icon: Shield },
    { id: "team", label: "Team", icon: Users },
    { id: "preferences", label: "Preferences", icon: Globe }
  ];

  // Helper initial letter for Avatar
  const initialLetter = (profileData.fullName || user?.name || "U")[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col relative">
      {/* Background Soft Glow Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />

      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 z-10">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            {/* Hamburger Button for Mobile Sidebar */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-sm transition-colors focus:outline-none"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Vibrant Gradient Settings Icon */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20 text-white flex-shrink-0">
              <Settings className="w-6 h-6" />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Settings
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage your account and platform preferences
              </p>
            </div>
          </div>
        </div>

        {pageLoading ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50/70 border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto my-12 shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-900">Database Connection Issue</h3>
            <p className="text-sm text-red-700 mt-2 leading-relaxed">{error}</p>
            <button
              onClick={loadSettings}
              className="mt-5 px-5 py-2.5 text-xs font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-sm"
            >
              Retry Loading Settings
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Vertical Navigation Menu */}
            <aside className="w-full lg:w-64 bg-white border border-slate-200/70 rounded-2xl p-2.5 shadow-sm flex flex-col gap-1.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all relative text-left ${
                      isActive
                        ? "text-indigo-600 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100/80 shadow-xs"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </aside>

            {/* Right Tab Content Panel */}
            <section className="flex-1 w-full bg-white border border-slate-200/70 rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm min-h-[520px]">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <form onSubmit={handleProfileSave} className="flex flex-col gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Profile information</h3>
                  </div>

                  {/* Avatar Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100">
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {profileData.profileImage ? (
                        <img
                          src={getImageUrl(profileData.profileImage)}
                          alt="Profile Preview"
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            (e.target as any).src = "";
                            showToast("Unable to load profile image URL", "error");
                          }}
                        />
                      ) : (
                        <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-tr from-blue-600 to-cyan-400 text-white text-2xl font-bold select-none">
                          {initialLetter}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <label htmlFor="profileImageInput" className="text-xs font-semibold text-slate-700">
                          Profile Image URL
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            document.getElementById("profileImageInput")?.focus();
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                        >
                          Change Photo
                        </button>
                      </div>
                      <input
                        id="profileImageInput"
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        value={profileData.profileImage}
                        onChange={(e) => setProfileData({ ...profileData, profileImage: e.target.value })}
                        className="w-full max-w-md px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter full name"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Enter email address"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Organization / Company
                      </label>
                      <input
                        type="text"
                        placeholder="Enter organization name"
                        value={profileData.organization}
                        onChange={(e) => setProfileData({ ...profileData, organization: e.target.value })}
                        className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {saveLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="flex flex-col gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Settings</h3>
                    <p className="text-sm text-slate-500 mt-1">Manage alert preferences and system update frequencies.</p>
                  </div>

                  <div className="divide-y divide-slate-100 flex flex-col">
                    {[
                      { key: "rsvpResponses", title: "RSVP Responses", desc: "Get notified immediately as guests confirm their attendance." },
                      { key: "eventReminders", title: "Event Reminders", desc: "Receive automated system notification updates before events begin." },
                      { key: "securityAlerts", title: "Security Alerts", desc: "Get alerted immediately on new login activities or account security changes." },
                      { key: "weeklySummary", title: "Weekly Summary Report", desc: "Weekly digest summarizing invitation metrics, RSVPs, and check-ins." },
                      { key: "productUpdates", title: "Product Updates", desc: "Stay informed about feature releases, roadmap updates, and news." }
                    ].map((item) => {
                      const value = notificationData[item.key as keyof AdminNotificationSettingsData];
                      return (
                        <div key={item.key} className="py-4.5 flex justify-between items-center gap-4">
                          <div className="flex-1 flex flex-col gap-0.5">
                            <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                          </div>
                          {/* Modern Gradient Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleNotificationToggle(item.key as keyof AdminNotificationSettingsData)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-all outline-none ${
                              value ? "bg-gradient-to-r from-blue-600 to-cyan-500 shadow-sm shadow-blue-500/20" : "bg-slate-200"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-all duration-200 ${
                                value ? "translate-x-5" : "translate-x-0"
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
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Privacy Settings</h3>
                      <p className="text-sm text-slate-500 mt-1">Control public visibility and account data sharing.</p>
                    </div>

                    <div className="divide-y divide-slate-100 flex flex-col">
                      {[
                        { key: "twoFactorAuth", title: "Two-factor Authentication (2FA)", desc: "Enforce verification code check on every login." },
                        { key: "publicProfile", title: "Public Directory Profile", desc: "Allow external visitors to discover your event profile." },
                        { key: "dataSharing", title: "Anonymous Data Sharing", desc: "Share anonymous usage analytics to improve service reliability." }
                      ].map((item) => {
                        const value = securityData[item.key as keyof AdminSecuritySettingsData];
                        return (
                          <div key={item.key} className="py-4.5 flex justify-between items-center gap-4">
                            <div className="flex-1 flex flex-col gap-0.5">
                              <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSecurityToggle(item.key as keyof AdminSecuritySettingsData)}
                              className={`w-11 h-6 flex items-center rounded-full p-1 transition-all outline-none ${
                                value ? "bg-gradient-to-r from-blue-600 to-cyan-500 shadow-sm shadow-blue-500/20" : "bg-slate-200"
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-all duration-200 ${
                                  value ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Password Change Form */}
                  <form onSubmit={handlePasswordSave} className="flex flex-col gap-6 border-t border-slate-100 pt-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-600" />
                        Change Password
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">Keep your account secure with a strong password.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 max-w-md">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-slate-700">
                          Current Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-slate-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-slate-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex justify-start">
                      <button
                        type="submit"
                        disabled={saveLoading}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {saveLoading && <Loader2 className="w-4 h-4 animate-spin" />}
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
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Team Management</h3>
                      <p className="text-sm text-slate-500 mt-1">Manage team members, roles, and collaboration permissions.</p>
                    </div>
                    <button
                      onClick={() => setInviteModalOpen(true)}
                      className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/25 hover:shadow-lg transition-all focus:outline-none"
                    >
                      <Plus className="w-4 h-4" />
                      Invite Member
                    </button>
                  </div>

                  {/* Team Members List */}
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs mt-2">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-slate-200/80 bg-slate-50/80">
                            <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {teamMembers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                                No team members found. Start by inviting a teammate.
                              </td>
                            </tr>
                          ) : (
                            teamMembers.map((member) => (
                              <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3.5 px-5 text-sm font-medium text-slate-900">{member.name}</td>
                                <td className="py-3.5 px-5 text-sm text-slate-600">{member.email}</td>
                                <td className="py-3.5 px-5">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    member.role === "Owner"
                                      ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                                      : member.role === "Admin"
                                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                                      : "bg-slate-100 text-slate-700 border border-slate-200/60"
                                  }`}>
                                    {member.role}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    member.status === "active"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                      : "bg-amber-50 text-amber-700 border border-amber-200/60"
                                  }`}>
                                    {member.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5 text-right">
                                  <button
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                                    title="Remove team member"
                                  >
                                    <Trash2 className="w-4 h-4" />
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
                <form onSubmit={handlePreferencesSave} className="flex flex-col gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">System Preferences</h3>
                    <p className="text-sm text-slate-500 mt-1">Customize UI display formatting and regional options.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700">
                        UI Theme
                      </label>
                      <select
                        value={preferencesData.theme}
                        onChange={(e) => setPreferencesData({ ...preferencesData, theme: e.target.value })}
                        className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-all text-slate-800"
                      >
                        <option value="light">Light Theme</option>
                        <option value="dark">Dark Theme</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Language
                      </label>
                      <select
                        value={preferencesData.language}
                        onChange={(e) => setPreferencesData({ ...preferencesData, language: e.target.value })}
                        className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-all text-slate-800"
                      >
                        <option value="en">English (US)</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="hi">हिन्दी</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Timezone
                      </label>
                      <select
                        value={preferencesData.timezone}
                        onChange={(e) => setPreferencesData({ ...preferencesData, timezone: e.target.value })}
                        className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-all text-slate-800"
                      >
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                        <option value="America/New_York">Eastern Time (EST/EDT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                        <option value="Europe/London">London (GMT/BST)</option>
                        <option value="Asia/Kolkata">India Standard Time (IST)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Date Format
                      </label>
                      <select
                        value={preferencesData.dateFormat}
                        onChange={(e) => setPreferencesData({ ...preferencesData, dateFormat: e.target.value })}
                        className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-all text-slate-800"
                      >
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Time Format
                      </label>
                      <select
                        value={preferencesData.timeFormat}
                        onChange={(e) => setPreferencesData({ ...preferencesData, timeFormat: e.target.value })}
                        className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-all text-slate-800"
                      >
                        <option value="24h">24 Hour (00:00 - 23:59)</option>
                        <option value="12h">12 Hour (00:00 AM/PM - 12:00 AM/PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {saveLoading && <Loader2 className="w-4 h-4 animate-spin" />}
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-md p-6 sm:p-7 z-10 relative overflow-hidden font-sans text-slate-900"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-indigo-600 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  Invite Team Member
                </h3>
                <button
                  onClick={() => setInviteModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter teammate full name"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Member Role
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-all text-slate-800"
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>

                <div className="mt-4 pt-5 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {saveLoading && <Loader2 className="w-4 h-4 animate-spin" />}
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
            className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-slate-200/80"
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-slate-800">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
