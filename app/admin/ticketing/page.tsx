"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import adminService, { AdminTicketTier } from "../../../services/adminService";
import {
  Edit2,
  Trash2,
  Ticket,
  DollarSign,
  Users,
  X,
  CheckCircle,
  AlertCircle,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminTicketingPage() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  // State Management
  const [tiers, setTiers] = useState<AdminTicketTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [search, setSearch] = useState("");

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<AdminTicketTier | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formCapacity, setFormCapacity] = useState<number>(0);
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
      const data = await adminService.getAdminTicketing();
      if (data && data.success) {
        setTiers(data.tiers || []);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch ticketing tiers from the server.");
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
  const handleEditClick = (tier: AdminTicketTier) => {
    setEditingTier(tier);
    setFormName(tier.name);
    setFormDescription(tier.description || "");
    setFormPrice(tier.price);
    setFormCapacity(tier.capacity);
    setFormIsActive(tier.isActive);
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName || formCapacity < 0 || formPrice < 0) {
      setFormError("Please fill out all required fields with non-negative values.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingTier) {
        const payload = {
          name: formName,
          description: formDescription || null,
          price: formPrice,
          capacity: formCapacity,
          isActive: formIsActive,
        };
        const res = await adminService.updateAdminTicketTier(editingTier.id!, payload);
        if (res.success) {
          triggerToast("Ticket tier updated successfully by Admin!");
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
      const res = await adminService.deleteAdminTicketTier(deleteConfirmId);
      if (res && res.success) {
        triggerToast(res.message || "Ticket tier deleted successfully by Admin!");
        fetchData();
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Failed to delete the ticket tier.", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Filtered tiers list for search
  const filteredTiers = tiers.filter((t) => {
    return (
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.eventTitle && t.eventTitle.toLowerCase().includes(search.toLowerCase()))
    );
  });

  // Calculate platform metrics
  const totalRevenue = tiers.reduce((sum, t) => sum + (t.revenueEarned || 0), 0);
  const totalTicketsSold = tiers.reduce((sum, t) => sum + (t.quantitySold || 0), 0);

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

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-8 pt-4 md:pt-6 pb-10 z-10">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-xl border border-[#E8C4B8]/40 bg-white hover:bg-[#F0EBE8] transition-colors shadow-sm focus:outline-none"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-[#2D1B3D]" />
            </button>
            <div>
              <h1
                className="text-4xl md:text-5xl font-semibold text-[#2D1B3D] font-display"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Ticketing
              </h1>
              <p className="text-sm text-[#2D1B3D]/60 mt-1">Manage ticket sales across the platform</p>
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
              className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-[#E8C4B8]/40"
            >
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                  Total Platform Revenue
                </p>
                <p className="text-3xl font-bold text-[#2D1B3D] mt-0.5">
                  ${loading ? "..." : totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#2D1B3D]/5 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-[#2D1B3D]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                  Total Tickets Sold
                </p>
                <p className="text-3xl font-bold text-[#2D1B3D] mt-0.5">
                  {loading ? "..." : totalTicketsSold}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
                <Ticket className="w-6 h-6 text-[#C9A84C]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                  Active Ticket Tiers
                </p>
                <p className="text-3xl font-bold text-[#2D1B3D] mt-0.5">
                  {loading ? "..." : tiers.length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Table Area */}
        <div className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm flex flex-col min-h-[500px]">
          <div className="mb-6 w-full max-w-xs">
            <div className="relative">
              <input
                type="text"
                placeholder="Search ticket tiers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 py-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-[#FAF8F5] border border-[#E8C4B8]/20 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <h4 className="text-lg font-semibold text-[#2D1B3D]">Error loading ticketing tiers</h4>
              <p className="text-xs text-[#2D1B3D]/60 mt-1 max-w-xs">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#2D1B3D] rounded-xl hover:bg-[#3d2a52]"
              >
                Retry
              </button>
            </div>
          ) : filteredTiers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#E8C4B8]/40 flex items-center justify-center mb-6 shadow-sm">
                <Ticket className="w-8 h-8 text-[#C9A84C]" />
              </div>
              <h3 className="text-xl font-bold font-display text-[#2D1B3D] mb-1">No Ticket Tiers Found</h3>
              <p className="text-xs text-[#2D1B3D]/50 max-w-sm">
                No active ticket tiers found under the search criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8C4B8]/30">
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Tier Name
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Event Title
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Event Creator
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Sold / Capacity
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Revenue Earned
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8C4B8]/20">
                  {filteredTiers.map((tier) => (
                    <tr key={tier.id} className="hover:bg-[#FAF8F5]/60 transition-colors duration-150 group">
                      <td className="py-4 px-4 text-sm font-semibold text-[#2D1B3D]">
                        {tier.name}
                      </td>

                      <td className="py-4 px-4 text-xs font-medium text-[#2D1B3D]/70 max-w-[130px] truncate">
                        {tier.eventTitle || "General"}
                      </td>

                      <td className="py-4 px-4 text-xs text-[#2D1B3D]/80">
                        <div className="flex flex-col">
                          <span className="font-semibold">{tier.eventCreator?.name || "-"}</span>
                          <span className="text-[10px] text-[#2D1B3D]/50">{tier.eventCreator?.email || "-"}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-sm font-semibold text-[#2D1B3D]">
                        ${tier.price.toFixed(2)}
                      </td>

                      <td className="py-4 px-4 text-xs text-[#2D1B3D]/70 font-semibold">
                        {tier.quantitySold ?? 0} / {tier.capacity}
                      </td>

                      <td className="py-4 px-4 text-sm font-bold text-emerald-600">
                        ${(tier.revenueEarned ?? 0).toFixed(2)}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            tier.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : tier.status === "SOLD_OUT"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-gray-50 text-gray-500 border-gray-200"
                          }`}
                        >
                          {tier.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(tier)}
                            title="Edit Tier"
                            className="p-2 text-[#2D1B3D]/65 hover:text-[#C9A84C] hover:bg-[#F0EBE8] rounded-lg transition-all focus:outline-none"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(tier.id || null)}
                            title="Delete Tier"
                            className="p-2 text-[#2D1B3D]/65 hover:text-red-600 hover:bg-[#F0EBE8] rounded-lg transition-all focus:outline-none"
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

      {/* EDIT TIER DETAILS MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 text-[#2D1B3D] font-body"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold font-display" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Edit Ticket Tier (Admin)
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 text-[#2D1B3D]/50 hover:text-[#2D1B3D] rounded-lg hover:bg-[#F0EBE8] transition-colors"
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
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/60 mb-1.5">
                    Tier Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/60 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/60 mb-1.5">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={0.01}
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/60 mb-1.5">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#2D1B3D] border-[#E8C4B8]/60 focus:ring-[#2D1B3D] rounded cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-xs font-semibold text-[#2D1B3D]/80 cursor-pointer">
                    Tier Sales Active
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 rounded-xl hover:bg-[#F0EBE8] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl transition-all shadow-md disabled:opacity-50"
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
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 text-[#2D1B3D] font-body"
            >
              <h3 className="text-lg font-semibold font-display mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Delete / Archive Ticket Tier
              </h3>
              <p className="text-sm text-[#2D1B3D]/70 mb-6">
                Are you sure you want to delete this ticket tier? If there are any sales, this tier will be archived instead of permanently deleted.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 rounded-xl hover:bg-[#F0EBE8] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md"
                >
                  Yes, Delete / Archive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
