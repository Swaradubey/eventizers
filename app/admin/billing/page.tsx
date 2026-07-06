"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../../../components/Navbar";
import adminService, {
  AdminBillingUser,
  AdminBillingStats
} from "../../../services/adminService";
import BillingDetailsModal from "../../../components/admin/billing/BillingDetailsModal";
import ChangePlanModal from "../../../components/admin/billing/ChangePlanModal";
import {
  RotateCcw,
  AlertCircle,
  CheckCircle,
  X,
  Search,
  Filter,
  Users,
  TrendingUp,
  CreditCard,
  Calendar,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  MoreVertical,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "../../../context/SidebarContext";

export default function AdminBillingPage() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  // Data states
  const [users, setUsers] = useState<AdminBillingUser[]>([]);
  const [stats, setStats] = useState<AdminBillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [billingFilter, setBillingFilter] = useState("ALL");
  const [subFilter, setSubFilter] = useState("ALL");

  // Modal states
  const [selectedUser, setSelectedUser] = useState<AdminBillingUser | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);

  // Action states
  const [updating, setUpdating] = useState(false);
  const [activeActionsUserId, setActiveActionsUserId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Authentication check
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/admin/login");
      } else if (user.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  // Load billing database from API (with single auto-retry)
  const fetchBillingData = async () => {
    setLoading(true);
    setError(null);
    try {
      try {
        const [usersData, statsData] = await Promise.all([
          adminService.getAdminBillingUsers(),
          adminService.getAdminBillingStats()
        ]);

        if (usersData && usersData.success) {
          setUsers(usersData.users);
        }
        if (statsData && statsData.success) {
          setStats(statsData.stats);
        }
        setLoading(false);
        return;
      } catch (firstErr) {
        console.warn("First load attempt failed, retrying once...", firstErr);
      }

      // Retry once
      const [usersData, statsData] = await Promise.all([
        adminService.getAdminBillingUsers(),
        adminService.getAdminBillingStats()
      ]);

      if (usersData && usersData.success) {
        setUsers(usersData.users);
      }
      if (statsData && statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err: any) {
      console.error("Error loading admin billing data after retry:", err);
      setError(
        err.response?.data?.error ||
          "Unable to load admin billing data. Please verify database connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      fetchBillingData();
    }
  }, [user]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  // Change user subscription plan
  const handleUpdatePlan = async (userId: number, planId: string) => {
    setUpdating(true);
    try {
      const res = await adminService.updateAdminBillingPlan(userId, planId);
      if (res && res.success) {
        triggerToast(`Plan successfully updated to ${planId.toUpperCase()}!`);
        setChangePlanOpen(false);
        fetchBillingData();
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.error || "Failed to update plan.", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Reset user usage metrics
  const handleResetUsage = async (userId: number, type: "events" | "guests" | "messages" | "all") => {
    setUpdating(true);
    setActiveActionsUserId(null);
    try {
      const res = await adminService.resetAdminUserUsage(userId, type);
      if (res && res.success) {
        triggerToast(`Successfully reset ${type} usage!`);
        fetchBillingData();
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.error || "Failed to reset usage.", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Suspend/Activate subscription status
  const handleToggleSubscription = async (userId: number, currentStatus: string) => {
    setUpdating(true);
    setActiveActionsUserId(null);
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await adminService.updateAdminUserSubscriptionStatus(userId, newStatus);
      if (res && res.success) {
        triggerToast(`Subscription successfully ${newStatus === "ACTIVE" ? "activated" : "suspended"}!`);
        fetchBillingData();
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.error || "Failed to toggle status.", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Update billing status
  const handleToggleBillingStatus = async (userId: number, currentStatus: string) => {
    setUpdating(true);
    setActiveActionsUserId(null);
    const newStatus = currentStatus === "PAID" ? "UNPAID" : "PAID";
    try {
      const res = await adminService.updateAdminUserBillingStatus(userId, newStatus);
      if (res && res.success) {
        triggerToast(`Billing status successfully updated to ${newStatus}!`);
        fetchBillingData();
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.error || "Failed to update billing status.", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Delete user from database and refresh dashboard
  const handleDeleteUser = async (userId: number): Promise<boolean> => {
    try {
      const res = await adminService.deleteAdminUser(userId);
      if (res && res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        triggerToast("User deleted successfully.", "success");
        setDetailsOpen(false);
        setSelectedUser(null);
        fetchBillingData();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      const errMsg = err.response?.data?.error || "Failed to delete user.";
      triggerToast(errMsg, "error");
      throw err;
    }
  };

  // Format Helpers
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    });
  };

  const formatLastUpdated = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getLimitText = (used: number, limit: number) => {
    if (limit === -1) return `${used} / ∞`;
    return `${used} / ${limit}`;
  };

  // Filter & Search logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan =
      planFilter === "ALL" || u.plan.toUpperCase() === planFilter;

    const matchesBilling =
      billingFilter === "ALL" || u.billingStatus.toUpperCase() === billingFilter;

    const matchesSub =
      subFilter === "ALL" || u.subscriptionStatus.toUpperCase() === subFilter;

    return matchesSearch && matchesPlan && matchesBilling && matchesSub;
  });

  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2D1B3D]/30 border-t-[#2D1B3D] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-body text-[#2D1B3D] relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 z-10">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-4xl md:text-5xl font-semibold text-[#2D1B3D] font-display"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Billing
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/25">
                Admin
              </span>
            </div>
            <p className="text-sm text-[#2D1B3D]/60 mt-1">
              Manage user subscriptions, plans and usage
            </p>
          </div>
          <button
            onClick={fetchBillingData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#2D1B3D] bg-white border border-[#E8C4B8]/40 hover:bg-[#F0EBE8] rounded-xl transition-all shadow-sm focus:outline-none disabled:opacity-55 self-end sm:self-auto"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {loading || !stats ? (
            // Stats Skeletons
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-4 shadow-sm animate-pulse"
              >
                <div className="h-3 w-16 bg-[#E8C4B8]/20 rounded mb-2" />
                <div className="h-6 w-10 bg-[#E8C4B8]/30 rounded" />
              </div>
            ))
          ) : (
            <>
              {/* Total Subscribers */}
              <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-default">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                  Total Subscribers
                </p>
                <p className="text-xl font-bold text-[#2D1B3D] mt-1 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#C9A84C]" />
                  {stats.totalSubscribers}
                </p>
              </div>

              {/* Free Users */}
              <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-default">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                  Free Users
                </p>
                <p className="text-xl font-bold text-[#2D1B3D] mt-1">
                  {stats.freeUsers}
                </p>
              </div>

              {/* Paid Users */}
              <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-default">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                  Paid Users
                </p>
                <p className="text-xl font-bold text-[#2D1B3D] mt-1 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  {stats.paidUsers}
                </p>
              </div>

              {/* Monthly Revenue */}
              <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-default">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                  Monthly Revenue
                </p>
                <p className="text-xl font-bold text-[#2D1B3D] mt-1 flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-[#C9A84C]" />
                  ${stats.monthlyRevenue}
                </p>
              </div>

              {/* Active Subscriptions */}
              <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-default">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                  Active Subs
                </p>
                <p className="text-xl font-bold text-emerald-700 mt-1">
                  {stats.activeSubscriptions}
                </p>
              </div>

              {/* Expired Plans */}
              <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-default">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                  Expired Plans
                </p>
                <p className="text-xl font-bold text-rose-700 mt-1">
                  {stats.expiredPlans}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-4 sm:p-5 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2D1B3D]/45">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs text-[#2D1B3D] bg-[#FAF8F5] border border-[#E8C4B8]/30 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] rounded-xl transition-all shadow-sm"
            />
          </div>

          {/* Filters Select Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Plan */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#2D1B3D]/50" />
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-2 text-xs text-[#2D1B3D] bg-[#FAF8F5] border border-[#E8C4B8]/30 focus:border-[#2D1B3D] rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <option value="ALL">All Plans</option>
                <option value="FREE">Free</option>
                <option value="STARTER">Starter</option>
                <option value="PRO">Pro</option>
                <option value="BUSINESS">Business</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>

            {/* Filter by Subscription Status */}
            <select
              value={subFilter}
              onChange={(e) => setSubFilter(e.target.value)}
              className="px-3 py-2 text-xs text-[#2D1B3D] bg-[#FAF8F5] border border-[#E8C4B8]/30 focus:border-[#2D1B3D] rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <option value="ALL">All Subscription Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="EXPIRED">Expired</option>
            </select>

            {/* Filter by Billing Status */}
            <select
              value={billingFilter}
              onChange={(e) => setBillingFilter(e.target.value)}
              className="px-3 py-2 text-xs text-[#2D1B3D] bg-[#FAF8F5] border border-[#E8C4B8]/30 focus:border-[#2D1B3D] rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <option value="ALL">All Billing Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Users Billing Access Table */}
        <div className="bg-white/70 border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm backdrop-blur-sm flex-1 flex flex-col min-h-[300px]">
          {loading ? (
            <div className="flex-1 overflow-x-auto animate-pulse">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#E8C4B8]/30">
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">User Name</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Role</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Current Plan</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Events Created</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Guests Used</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Messages Used</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Billing Status</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Subscription Status</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Plan Start Date</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Plan Expiry Date</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Last Updated</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8C4B8]/20">
                  {[...Array(5)].map((_, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-20 bg-[#E8C4B8]/20 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-36 bg-[#E8C4B8]/20 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-12 bg-[#E8C4B8]/20 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-16 bg-[#E8C4B8]/20 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-14 bg-[#E8C4B8]/20 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-14 bg-[#E8C4B8]/20 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-14 bg-[#E8C4B8]/20 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-4 w-12 bg-[#E8C4B8]/20 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-4 w-12 bg-[#E8C4B8]/20 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-16 bg-[#E8C4B8]/20 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-16 bg-[#E8C4B8]/20 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3 w-10 bg-[#E8C4B8]/20 rounded" /></td>
                      <td className="py-3.5 px-3 text-right"><div className="h-6 w-20 bg-[#E8C4B8]/20 rounded-lg ml-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-[#C9A84C]" />
              </div>
              <h3 className="text-base font-bold text-[#2D1B3D]">No Billing Records Available</h3>
              <p className="text-xs text-[#2D1B3D]/55 max-w-xs mt-1">
                {error || "We're having trouble retrieving the billing registry right now. Please try refreshing the data."}
              </p>
              <button
                onClick={fetchBillingData}
                className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-[#2D1B3D] rounded-xl hover:bg-[#3d2a52] transition-all"
              >
                Try Again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#E8C4B8]/30 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-[#C9A84C]" />
              </div>
              <h3 className="text-base font-bold text-[#2D1B3D]">No Billing Records Found</h3>
              <p className="text-xs text-[#2D1B3D]/55 max-w-xs mt-1">
                We couldn't find any users matching your query or filter criteria.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#E8C4B8]/30">
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">User Name</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Role</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Current Plan</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Events Created</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Guests Used</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Messages Used</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Billing Status</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Subscription Status</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Plan Start Date</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Plan Expiry Date</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">Last Updated</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8C4B8]/20">
                  {filteredUsers.map((u) => {
                    const isDropdownActive = activeActionsUserId === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-[#FAF8F5]/60 transition-colors duration-150 group">
                        <td className="py-3.5 px-3 text-xs font-semibold text-[#2D1B3D]">{u.name}</td>
                        <td className="py-3.5 px-3 text-xs text-[#2D1B3D]/80">{u.email}</td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === "ADMIN" 
                              ? "bg-rose-50 text-rose-700 border border-rose-200" 
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.plan.toLowerCase() === "free"
                              ? "bg-[#2D1B3D]/5 text-[#2D1B3D] border border-[#2D1B3D]/10"
                              : u.plan.toLowerCase() === "starter"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : u.plan.toLowerCase() === "pro"
                              ? "bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/25"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-[#2D1B3D]/80">{getLimitText(u.usage.eventsCreated, u.usage.eventsLimit)}</td>
                        <td className="py-3.5 px-3 text-xs text-[#2D1B3D]/80">{getLimitText(u.usage.guestsUsed, u.usage.guestsLimit)}</td>
                        <td className="py-3.5 px-3 text-xs text-[#2D1B3D]/80">{getLimitText(u.usage.messagesUsed, u.usage.messagesLimit)}</td>
                        <td className="py-3.5 px-3">
                          <button
                            onClick={() => handleToggleBillingStatus(u.id, u.billingStatus)}
                            title="Click to toggle status"
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all hover:scale-95 border ${
                              u.billingStatus === "PAID" || u.billingStatus === "ACTIVE" || u.billingStatus === "Active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : u.billingStatus === "PENDING"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {u.billingStatus}
                          </button>
                        </td>
                        <td className="py-3.5 px-3">
                          <button
                            onClick={() => handleToggleSubscription(u.id, u.subscriptionStatus)}
                            title="Click to suspend/activate"
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all hover:scale-95 border ${
                              u.subscriptionStatus === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {u.subscriptionStatus}
                          </button>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-[#2D1B3D]/70">{formatDate(u.planStartDate)}</td>
                        <td className="py-3.5 px-3 text-xs text-[#2D1B3D]/70">{formatDate(u.planExpiryDate)}</td>
                        <td className="py-3.5 px-3 text-[11px] text-[#2D1B3D]/50">{formatLastUpdated(u.usage.updatedAt)}</td>
                        <td className="py-3.5 px-3 text-right relative">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setDetailsOpen(true);
                              }}
                              className="px-2 py-1 text-[10px] font-bold bg-[#FAF8F5] border border-[#E8C4B8]/40 hover:bg-[#F0EBE8] rounded-lg transition-colors shadow-sm focus:outline-none"
                            >
                              View
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setChangePlanOpen(true);
                              }}
                              className="px-2 py-1 text-[10px] font-bold bg-[#FAF8F5] border border-[#E8C4B8]/40 hover:bg-[#F0EBE8] rounded-lg transition-colors shadow-sm focus:outline-none"
                            >
                              Plan
                            </button>
                            
                            {/* Dropdown triggers for usage resetting & suspend operations */}
                            <div className="relative inline-block text-left">
                              <button
                                onClick={() => setActiveActionsUserId(isDropdownActive ? null : u.id)}
                                className="p-1 text-[#2D1B3D]/50 hover:text-[#2D1B3D] hover:bg-[#FAF8F5] rounded-lg border border-[#E8C4B8]/10 transition-colors focus:outline-none"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>

                              {/* Dropdown Menu */}
                              <AnimatePresence>
                                {isDropdownActive && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-20"
                                      onClick={() => setActiveActionsUserId(null)}
                                    />
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                      className="absolute right-0 mt-1 w-44 rounded-xl shadow-xl bg-white border border-[#E8C4B8]/30 z-30 overflow-hidden font-body text-[#2D1B3D]"
                                    >
                                      <div className="py-1">
                                        <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#2D1B3D]/40">
                                          Reset Usage Metrics
                                        </div>
                                        <button
                                          onClick={() => handleResetUsage(u.id, "events")}
                                          className="w-full text-left px-4 py-1.5 text-xs hover:bg-[#FAF8F5] transition-colors"
                                        >
                                          Reset Events Usage
                                        </button>
                                        <button
                                          onClick={() => handleResetUsage(u.id, "guests")}
                                          className="w-full text-left px-4 py-1.5 text-xs hover:bg-[#FAF8F5] transition-colors"
                                        >
                                          Reset Guests Usage
                                        </button>
                                        <button
                                          onClick={() => handleResetUsage(u.id, "messages")}
                                          className="w-full text-left px-4 py-1.5 text-xs hover:bg-[#FAF8F5] transition-colors"
                                        >
                                          Reset Messages Usage
                                        </button>
                                        <button
                                          onClick={() => handleResetUsage(u.id, "all")}
                                          className="w-full text-left px-4 py-1.5 text-xs hover:bg-[#FAF8F5] transition-colors text-rose-700 font-semibold"
                                        >
                                          Reset All Usage
                                        </button>
                                        <div className="border-t border-[#E8C4B8]/20 my-1" />
                                        <button
                                          onClick={() => handleToggleSubscription(u.id, u.subscriptionStatus)}
                                          className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5"
                                        >
                                          {u.subscriptionStatus === "ACTIVE" ? (
                                            <>
                                              <Pause className="w-3 h-3 text-red-600" />
                                              Suspend Plan
                                            </>
                                          ) : (
                                            <>
                                              <Play className="w-3 h-3 text-emerald-600" />
                                              Activate Plan
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {detailsOpen && (
          <BillingDetailsModal
            isOpen={detailsOpen}
            onClose={() => {
              setDetailsOpen(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {changePlanOpen && (
          <ChangePlanModal
            isOpen={changePlanOpen}
            onClose={() => {
              setChangePlanOpen(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            onSave={handleUpdatePlan}
            updating={updating}
          />
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
