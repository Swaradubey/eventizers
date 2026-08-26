"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import adminService, {
  AdminBillingUser,
  AdminBillingStats
} from "@/services/adminService";
import BillingDetailsModal from "@/components/admin/billing/BillingDetailsModal";
import ChangePlanModal from "@/components/admin/billing/ChangePlanModal";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";
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
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "../../../context/SidebarContext";
import axios from "axios";

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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [billingFilter, setBillingFilter] = useState("ALL");
  const [subFilter, setSubFilter] = useState("ALL");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Sorting states
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal states
  const [selectedUser, setSelectedUser] = useState<AdminBillingUser | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);

  // Action states
  const [updating, setUpdating] = useState(false);
  const [activeActionsUserId, setActiveActionsUserId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Request cancellation controller ref
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Load billing database from API
  const fetchBillingData = async (
    currentPage: number = page,
    currentSearch: string = debouncedSearch,
    currentPlan: string = planFilter,
    currentBilling: string = billingFilter,
    currentSub: string = subFilter,
    currentSortBy: string = sortBy,
    currentSortOrder: string = sortOrder
  ) => {
    // Cancel the previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const [usersData, statsData] = await Promise.all([
        adminService.getAdminBillingUsers(
          {
            page: currentPage,
            limit,
            search: currentSearch,
            currentPlan,
            billingStatus: currentBilling,
            subscriptionStatus: currentSub,
            sortBy: currentSortBy,
            sortOrder: currentSortOrder
          },
          controller.signal
        ),
        adminService.getAdminBillingStats()
      ]);

      if (usersData && usersData.success) {
        setUsers(usersData.users || []);
        if (usersData.pagination) {
          setTotalUsers(usersData.pagination.total);
          setTotalPages(usersData.pagination.totalPages);
          setHasNextPage(usersData.pagination.hasNextPage);
          setHasPreviousPage(usersData.pagination.hasPreviousPage);
        } else {
          const fetchedCount = (usersData.users || []).length;
          setTotalUsers(fetchedCount);
          const calculatedTotalPages = Math.ceil(fetchedCount / limit) || 1;
          setTotalPages(calculatedTotalPages);
          setHasNextPage(currentPage < calculatedTotalPages);
          setHasPreviousPage(currentPage > 1);
        }
      }
      if (statsData && statsData.success) {
        setStats(statsData.stats);
      }
      setLoading(false);
    } catch (err: any) {
      // If the request was cancelled, ignore the error
      if (axios.isCancel(err)) {
        return;
      }
      console.error("Error loading admin billing data:", err);
      setError(
        err.response?.data?.error ||
        "Unable to load admin billing data. Please verify database connection."
      );
      setLoading(false);
    }
  };

  // Cleanup request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch data when filters or sorting change (resets to page 1)
  useEffect(() => {
    if (user && user.role === "ADMIN") {
      setPage(1);
      fetchBillingData(
        1,
        debouncedSearch,
        planFilter,
        billingFilter,
        subFilter,
        sortBy,
        sortOrder
      );
    }
  }, [debouncedSearch, planFilter, billingFilter, subFilter, sortBy, sortOrder, user]);

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

  // Page selection change helper
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    fetchBillingData(
      newPage,
      debouncedSearch,
      planFilter,
      billingFilter,
      subFilter,
      sortBy,
      sortOrder
    );
    // Smooth scroll position
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Column header sorting click helper
  const handleSort = (field: string) => {
    const isAsc = sortBy === field && sortOrder === "asc";
    const newOrder = isAsc ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newOrder);
  };

  // Ellipsis page number list generator
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      if (page <= 2) {
        end = 3;
      }
      if (page >= totalPages - 1) {
        start = totalPages - 2;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  // Server-side paginated and filtered users list
  const filteredUsers = users;

  const isServerPaginated = totalUsers > users.length;
  const startIndex = isServerPaginated ? 0 : (page - 1) * limit;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);

  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100 flex flex-col font-body text-slate-800 relative">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-full w-full mx-auto px-8 pt-4 md:pt-6 pb-10 z-10">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Billing
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Admin
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Manage user subscriptions, plans and usage
            </p>
          </div>
          <button
            onClick={() => fetchBillingData()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white/90 border border-blue-100 hover:bg-blue-50/80 hover:text-blue-700 hover:border-blue-200 rounded-xl transition-all shadow-xs focus:outline-none disabled:opacity-55 self-end sm:self-auto cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {loading || !stats ? (
            // Stats Skeletons
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white/80 border border-blue-100/80 rounded-2xl p-4 shadow-xs backdrop-blur-sm animate-pulse"
              >
                <div className="h-3 w-16 bg-blue-100/60 rounded mb-2" />
                <div className="h-6 w-10 bg-blue-200/50 rounded" />
              </div>
            ))
          ) : (
            <>
              {/* Total Subscribers */}
              <div className="bg-white/80 backdrop-blur-sm border border-blue-100/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-blue-200 transition-all cursor-default">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total Subscribers
                </p>
                <p className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  {stats.totalSubscribers}
                </p>
              </div>

              {/* Free Users */}
              <div className="bg-white/80 backdrop-blur-sm border border-blue-100/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-blue-200 transition-all cursor-default">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Free Users
                </p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {stats.freeUsers}
                </p>
              </div>

              {/* Paid Users */}
              <div className="bg-white/80 backdrop-blur-sm border border-blue-100/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-blue-200 transition-all cursor-default">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Paid Users
                </p>
                <p className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  {stats.paidUsers}
                </p>
              </div>

              {/* Monthly Revenue */}
              <div className="bg-white/80 backdrop-blur-sm border border-blue-100/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-blue-200 transition-all cursor-default">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Monthly Revenue
                </p>
                <p className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  ${stats.monthlyRevenue}
                </p>
              </div>

              {/* Active Subscriptions */}
              <div className="bg-white/80 backdrop-blur-sm border border-blue-100/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-blue-200 transition-all cursor-default">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Active Subs
                </p>
                <p className="text-xl font-bold text-emerald-600 mt-1">
                  {stats.activeSubscriptions}
                </p>
              </div>

              {/* Expired Plans */}
              <div className="bg-white/80 backdrop-blur-sm border border-blue-100/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-blue-200 transition-all cursor-default">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Expired Plans
                </p>
                <p className="text-xl font-bold text-rose-600 mt-1">
                  {stats.expiredPlans}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white/80 backdrop-blur-sm border border-blue-100/80 rounded-2xl p-4 sm:p-5 shadow-xs mb-6 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 bg-blue-50/30 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all shadow-xs"
            />
          </div>

          {/* Filters Select Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Plan */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-2 text-xs text-slate-700 bg-blue-50/30 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all shadow-xs cursor-pointer hover:border-blue-200"
              >
                <option value="ALL">All Plans</option>
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
                <option value="BUSINESS">Business</option>
              </select>
            </div>

            {/* Filter by Subscription Status */}
            <select
              value={subFilter}
              onChange={(e) => setSubFilter(e.target.value)}
              className="px-3 py-2 text-xs text-slate-700 bg-blue-50/30 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all shadow-xs cursor-pointer hover:border-blue-200"
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
              className="px-3 py-2 text-xs text-slate-700 bg-blue-50/30 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl transition-all shadow-xs cursor-pointer hover:border-blue-200"
            >
              <option value="ALL">All Billing Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Users Billing Access Table */}
        <div className="bg-white/80 backdrop-blur-sm border border-blue-100/80 rounded-2xl p-6 shadow-xs flex-1 flex flex-col min-h-[300px]">
          {loading ? (
            <div className="flex-1 overflow-x-auto admin-table-scrollbar animate-pulse">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-blue-100/80">
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">User Name</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Plan</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Events Created</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Guests Used</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Messages Used</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Billing Status</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subscription Status</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan Start Date</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan Expiry Date</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Updated</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100/60">
                  {[...Array(5)].map((_, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-20 bg-blue-100/40 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-36 bg-blue-100/40 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-12 bg-blue-100/40 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-16 bg-blue-100/40 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-14 bg-blue-100/40 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-14 bg-blue-100/40 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-14 bg-blue-100/40 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-4 w-12 bg-blue-100/40 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-4 w-12 bg-blue-100/40 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-16 bg-blue-100/40 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3.5 w-16 bg-blue-100/40 rounded" /></td>
                      <td className="py-3.5 px-3"><div className="h-3 w-10 bg-blue-100/40 rounded" /></td>
                      <td className="py-3.5 px-3 text-right"><div className="h-6 w-20 bg-blue-100/40 rounded-lg ml-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Billing Records Available</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                {error || "We're having trouble retrieving the billing registry right now. Please try refreshing the data."}
              </p>
              <button
                onClick={() => fetchBillingData()}
                className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Billing Records Found</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                We couldn't find any users matching your query or filter criteria.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto admin-table-scrollbar relative">
              {loading && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                  <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              )}
              <table className={`w-full text-left border-collapse whitespace-nowrap transition-opacity duration-150 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                <thead>
                  <tr className="border-b border-blue-100/80">
                    <th
                      onClick={() => handleSort("name")}
                      className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        User Name
                        {sortBy === "name" && (
                          sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("email")}
                      className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Email
                        {sortBy === "email" && (
                          sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("role")}
                      className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Role
                        {sortBy === "role" && (
                          sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("plan")}
                      className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Current Plan
                        {sortBy === "plan" && (
                          sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Events Created</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Guests Used</th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Messages Used</th>
                    <th
                      onClick={() => handleSort("billingStatus")}
                      className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Billing Status
                        {sortBy === "billingStatus" && (
                          sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("subscriptionStatus")}
                      className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Subscription Status
                        {sortBy === "subscriptionStatus" && (
                          sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("planStartDate")}
                      className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Plan Start Date
                        {sortBy === "planStartDate" && (
                          sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("planExpiryDate")}
                      className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Plan Expiry Date
                        {sortBy === "planExpiryDate" && (
                          sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("created_at")}
                      className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Last Updated
                        {sortBy === "created_at" && (
                          sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100/60">
                  {paginatedUsers.map((u) => {
                    const isDropdownActive = activeActionsUserId === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-blue-50/50 transition-colors duration-150 group">
                        <td className="py-3.5 px-3 text-xs font-semibold text-slate-900">{u.name}</td>
                        <td className="py-3.5 px-3 text-xs text-slate-600">{u.email}</td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === "ADMIN"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.plan.toLowerCase() === "free"
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : u.plan.toLowerCase() === "starter"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : u.plan.toLowerCase() === "pro"
                                  ? "bg-sky-100 text-sky-700 border border-sky-200"
                                  : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            }`}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-600">{getLimitText(u.usage.eventsCreated, u.usage.eventsLimit)}</td>
                        <td className="py-3.5 px-3 text-xs text-slate-600">{getLimitText(u.usage.guestsUsed, u.usage.guestsLimit)}</td>
                        <td className="py-3.5 px-3 text-xs text-slate-600">{getLimitText(u.usage.messagesUsed, u.usage.messagesLimit)}</td>
                        <td className="py-3.5 px-3">
                          <button
                            onClick={() => handleToggleBillingStatus(u.id, u.billingStatus)}
                            title="Click to toggle status"
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all hover:scale-95 border ${u.billingStatus === "PAID" || u.billingStatus === "ACTIVE" || u.billingStatus === "Active"
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
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all hover:scale-95 border ${u.subscriptionStatus === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                              }`}
                          >
                            {u.subscriptionStatus}
                          </button>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-500">{formatDate(u.planStartDate)}</td>
                        <td className="py-3.5 px-3 text-xs text-slate-500">{formatDate(u.planExpiryDate)}</td>
                        <td className="py-3.5 px-3 text-[11px] text-slate-400">{formatLastUpdated(u.usage.updatedAt)}</td>
                        <td className="py-3.5 px-3 text-right relative">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setDetailsOpen(true);
                              }}
                              className="px-2.5 py-1 text-[10px] font-bold text-blue-700 bg-blue-50/60 border border-blue-200/80 hover:bg-blue-100 rounded-lg transition-colors shadow-xs focus:outline-none cursor-pointer"
                            >
                              View
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setChangePlanOpen(true);
                              }}
                              className="px-2.5 py-1 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 rounded-lg transition-colors shadow-xs focus:outline-none cursor-pointer"
                            >
                              Plan
                            </button>

                            {/* Dropdown triggers for usage resetting & suspend operations */}
                            <div className="relative inline-block text-left">
                              <button
                                onClick={() => setActiveActionsUserId(isDropdownActive ? null : u.id)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-blue-50 rounded-lg border border-slate-200/60 transition-colors focus:outline-none cursor-pointer"
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
                                      className="absolute right-0 mt-1 w-44 rounded-xl shadow-xl bg-white border border-blue-100 z-30 overflow-hidden font-body text-slate-700"
                                    >
                                      <div className="py-1">
                                        <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                          Reset Usage Metrics
                                        </div>
                                        <button
                                          onClick={() => handleResetUsage(u.id, "events")}
                                          className="w-full text-left px-4 py-1.5 text-xs hover:bg-blue-50 transition-colors"
                                        >
                                          Reset Events Usage
                                        </button>
                                        <button
                                          onClick={() => handleResetUsage(u.id, "guests")}
                                          className="w-full text-left px-4 py-1.5 text-xs hover:bg-blue-50 transition-colors"
                                        >
                                          Reset Guests Usage
                                        </button>
                                        <button
                                          onClick={() => handleResetUsage(u.id, "messages")}
                                          className="w-full text-left px-4 py-1.5 text-xs hover:bg-blue-50 transition-colors"
                                        >
                                          Reset Messages Usage
                                        </button>
                                        <button
                                          onClick={() => handleResetUsage(u.id, "all")}
                                          className="w-full text-left px-4 py-1.5 text-xs hover:bg-blue-50 transition-colors text-rose-600 font-semibold"
                                        >
                                          Reset All Usage
                                        </button>
                                        <div className="border-t border-blue-50 my-1" />
                                        <button
                                          onClick={() => handleToggleSubscription(u.id, u.subscriptionStatus)}
                                          className="w-full text-left px-4 py-2 text-xs hover:bg-blue-50 transition-colors flex items-center gap-1.5"
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

          {/* Pagination Controls */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalUsers}
            limit={limit}
            onPageChange={handlePageChange}
            loading={loading}
            itemName="Users"
          />
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
            className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-blue-100"
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="text-xs font-semibold text-slate-800">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-700 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
