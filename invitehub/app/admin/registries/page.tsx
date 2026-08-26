"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import adminService, { AdminRegistry } from "../../../services/adminService";
import {
  Edit2,
  Trash2,
  Gift,
  DollarSign,
  Users,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Menu,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminRegistriesPage() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  // State Management
  const [registries, setRegistries] = useState<AdminRegistry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats state
  const [stats, setStats] = useState({
    totalRegistries: 0,
    activeRegistries: 0,
    totalContributions: 0,
  });

  // Filters and search
  const [search, setSearch] = useState("");

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRegistry, setEditingRegistry] = useState<AdminRegistry | null>(null);
  const [viewingRegistry, setViewingRegistry] = useState<AdminRegistry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState("CASH");
  const [formGoalAmount, setFormGoalAmount] = useState<number | null>(null);
  const [formCurrentAmount, setFormCurrentAmount] = useState<number>(0);
  const [formExternalUrl, setFormExternalUrl] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Route protection
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/admin/login");
      } else if (user.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  // Fetch data
  const fetchData = async () => {
    if (!user || user.role !== "ADMIN") return;
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.getAdminRegistries();
      if (result && result.success) {
        const registriesData = result?.data?.registries;
        const registries = Array.isArray(registriesData) ? registriesData : [];
        setRegistries(registries);
        if (result?.data?.stats) {
          setStats(result.data.stats);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch registries from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      fetchData();
    }
  }, [user]);

  // Toast effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  // Open edit modal
  const handleEditClick = (reg: AdminRegistry) => {
    setEditingRegistry(reg);
    setFormTitle(reg.title);
    setFormDescription(reg.description || "");
    setFormType(reg.type);
    setFormGoalAmount(reg.goalAmount);
    setFormCurrentAmount(reg.currentAmount);
    setFormExternalUrl(reg.externalUrl || "");
    setFormIsActive(reg.isActive);
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle || !formType) {
      setFormError("Title and Type are required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingRegistry) {
        const payload = {
          title: formTitle,
          description: formDescription || undefined,
          type: formType as any,
          goalAmount: formGoalAmount !== null && formGoalAmount !== undefined ? Number(formGoalAmount) : undefined,
          currentAmount: Number(formCurrentAmount),
          externalUrl: formExternalUrl || undefined,
          isActive: formIsActive,
        };
        const res = await adminService.updateAdminRegistry(editingRegistry.id!, payload);
        if (res.success) {
          triggerToast("Registry updated successfully by Admin!");
          setIsEditModalOpen(false);
          fetchData();
        }
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.error || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await adminService.deleteAdminRegistry(deleteConfirmId);
      if (res && res.success) {
        triggerToast("Registry deleted successfully by Admin!");
        setRegistries((prev) => prev.filter((r) => r.id !== deleteConfirmId));
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Failed to delete the registry.", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Filtered registries list for search
  const filteredRegistries = registries.filter((r) => {
    const searchLower = search.toLowerCase();
    const matchesTitle = r.title.toLowerCase().includes(searchLower);
    const matchesType = r.type.toLowerCase().includes(searchLower);
    const matchesEventTitle = (r.eventTitle || "").toLowerCase().includes(searchLower);
    const matchesUserName = (r.eventCreator?.name || "").toLowerCase().includes(searchLower);
    const matchesUserEmail = (r.eventCreator?.email || "").toLowerCase().includes(searchLower);
    const statusText = r.isActive ? "active" : "inactive";
    const matchesStatus = statusText.includes(searchLower);

    return (
      matchesTitle ||
      matchesType ||
      matchesEventTitle ||
      matchesUserName ||
      matchesUserEmail ||
      matchesStatus
    );
  });

  // Calculate platform metrics
  const totalRaisedFunds = stats.totalContributions !== undefined ? stats.totalContributions : registries.reduce((sum, r) => sum + (r.currentAmount || 0), 0);
  const totalRegistriesCount = stats.totalRegistries !== undefined ? stats.totalRegistries : registries.length;
  const activeRegistriesCount = stats.activeRegistries !== undefined ? stats.activeRegistries : registries.filter((r) => r.isActive).length;

  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100 flex flex-col font-body text-slate-800 relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-8 pt-4 md:pt-6 pb-10 z-10">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-xl border border-blue-100 bg-white/90 hover:bg-blue-50/80 hover:text-blue-700 transition-colors shadow-xs focus:outline-none cursor-pointer"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Registries
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage cash registries and wishlists across the platform</p>
            </div>
          </div>
        </div>

        {/* Alerts / Toasts */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-blue-100 text-slate-800"
            >
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm border border-blue-100/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 cursor-default"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total Platform Contributions
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-0.5">
                  ${loading ? "..." : totalRaisedFunds.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm border border-blue-100/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 cursor-default"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
                <Gift className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total Registries
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-0.5">
                  {loading ? "..." : totalRegistriesCount}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm border border-blue-100/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 cursor-default"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Active Registries
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-0.5">
                  {loading ? "..." : activeRegistriesCount}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Table Area */}
        <div className="bg-white/80 backdrop-blur-sm border border-blue-100/80 rounded-2xl p-6 shadow-xs flex flex-col min-h-[500px]">
          <div className="mb-6 w-full max-w-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search registries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-blue-50/30 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 transition-all shadow-xs"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 py-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-blue-100/40 border border-blue-100/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
              <h4 className="text-lg font-bold text-slate-900">Error loading registries</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : filteredRegistries.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4 shadow-xs">
                <Gift className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">No Registries Found</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                No active wishlists or registries found under the search criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto admin-table-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-blue-100/80">
                    <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Event Title
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Event Creator
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Contributors
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100/60">
                  {filteredRegistries.map((reg) => (
                    <tr key={reg.id} className="hover:bg-blue-50/50 transition-colors duration-150 group">
                      <td className="py-4 px-4 text-sm font-semibold text-slate-900">
                        {reg.title}
                      </td>

                      <td className="py-4 px-4 text-xs font-bold text-blue-600">
                        {reg.type}
                      </td>

                      <td className="py-4 px-4 text-xs font-medium text-slate-600 max-w-[130px] truncate">
                        {reg.eventTitle || "General"}
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-700">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{reg.eventCreator?.name || "-"}</span>
                          <span className="text-[10px] text-slate-400">{reg.eventCreator?.email || "-"}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs">
                        <span className="font-bold text-slate-900">
                          ${reg.currentAmount.toFixed(2)}
                        </span>
                        {reg.goalAmount !== null ? (
                          <span className="text-slate-500">
                            {" "}/ ${reg.goalAmount.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold italic"> (No Limit)</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-600 font-semibold">
                        {reg.contributorCount}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${reg.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                        >
                          {reg.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setViewingRegistry(reg)}
                            title="View Details"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all focus:outline-none cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(reg)}
                            title="Edit Registry"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all focus:outline-none cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(reg.id || null)}
                            title="Delete Registry"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all focus:outline-none cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* VIEW REGISTRY DETAILS MODAL */}
      <AnimatePresence>
        {viewingRegistry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingRegistry(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  Registry Details
                </h3>
                <button
                  onClick={() => setViewingRegistry(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <div>
                  <span className="text-[10px] text-slate-400">Registry Title</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 normal-case">{viewingRegistry.title}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Registry Type</span>
                  <p className="text-xs font-bold text-blue-600 mt-0.5">{viewingRegistry.type}</p>
                </div>
                {viewingRegistry.description && (
                  <div>
                    <span className="text-[10px] text-slate-400">Description</span>
                    <p className="text-xs font-medium text-slate-700 mt-0.5 normal-case whitespace-pre-line leading-relaxed bg-blue-50/40 p-3 rounded-xl border border-blue-100">{viewingRegistry.description}</p>
                  </div>
                )}
                {viewingRegistry.externalUrl && (
                  <div>
                    <span className="text-[10px] text-slate-400">External Link</span>
                    <a
                      href={viewingRegistry.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 block mt-0.5 normal-case hover:underline truncate"
                    >
                      {viewingRegistry.externalUrl}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-slate-400">Event Title</span>
                  <p className="text-xs font-bold text-blue-600 mt-0.5 normal-case">{viewingRegistry.eventTitle}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Event Creator</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5 normal-case">
                    {viewingRegistry.eventCreator?.name || "-"} ({viewingRegistry.eventCreator?.email || "-"})
                  </p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400">Contributions Raised</span>
                    <p className="text-sm font-bold text-emerald-600 mt-0.5">${viewingRegistry.currentAmount.toFixed(2)}</p>
                  </div>
                  {viewingRegistry.goalAmount !== null && (
                    <div>
                      <span className="text-[10px] text-slate-400">Goal Limit</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">${viewingRegistry.goalAmount.toFixed(2)}</p>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Contributor Count</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{viewingRegistry.contributorCount} Contributors</p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setViewingRegistry(null)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl active:scale-95 transition-all shadow-xs focus:outline-none cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT REGISTRY DETAILS MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  Edit Registry (Admin)
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Registry Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-blue-50/30 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl text-xs text-slate-800 transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-blue-50/30 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl text-xs text-slate-800 transition-all shadow-xs resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Registry Type *
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full bg-blue-50/30 border border-blue-100 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs cursor-pointer hover:border-blue-200"
                    >
                      <option value="CASH">CASH</option>
                      <option value="WISHLIST">WISHLIST</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Goal Target ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={formGoalAmount !== null && formGoalAmount !== undefined ? formGoalAmount : ""}
                      onChange={(e) => setFormGoalAmount(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3.5 py-2 bg-blue-50/30 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl text-xs text-slate-800 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    External Wishlist Link
                  </label>
                  <input
                    type="url"
                    value={formExternalUrl}
                    onChange={(e) => setFormExternalUrl(e.target.value)}
                    placeholder="https://example.com/wishlist"
                    className="w-full px-3.5 py-2 bg-blue-50/30 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl text-xs text-slate-800 transition-all shadow-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-blue-200 focus:ring-blue-500 rounded cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Registry Active
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-2">
                Delete Registry
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete this registry? This action is permanent and cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
