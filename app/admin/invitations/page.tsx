"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../invitehub/context/AuthContext";
import { useSidebar } from "../../../invitehub/context/SidebarContext";
import Navbar from "../../../invitehub/components/Navbar";
import adminService, { AdminInvitation } from "../../../services/adminService";
import { getImageUrl } from "../../../utils/imageUrl";
import Pagination from "../../../invitehub/components/Pagination";
import {
  Edit2,
  Trash2,
  Eye,
  Mail,
  X,
  CheckCircle,
  AlertCircle,
  Menu,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function InvitationThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#E8C4B8]/40 flex items-center justify-center shrink-0 shadow-sm" title="No Preview Image">
        <Mail className="w-5 h-5 text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#E8C4B8]/40 shrink-0 bg-neutral-100 shadow-sm">
      <img
        src={getImageUrl(src)}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
}

export default function AdminInvitationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  // State Management
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [search, setSearch] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvitation, setEditingInvitation] = useState<AdminInvitation | null>(null);
  const [viewingInvitation, setViewingInvitation] = useState<AdminInvitation | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Lock background scroll when details modal is open
  useEffect(() => {
    if (viewingInvitation || isEditModalOpen || deleteConfirmId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [viewingInvitation, isEditModalOpen, deleteConfirmId]);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formStatus, setFormStatus] = useState("draft");
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
      const data = await adminService.getAdminInvitations();
      if (data && data.success) {
        setInvitations(data.invitations || []);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch invitations from the server.");
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
  const handleEditClick = (inv: AdminInvitation) => {
    setEditingInvitation(inv);
    setFormTitle(inv.title);
    setFormSubtitle(inv.subtitle || "");
    setFormStatus(inv.status);
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle) {
      setFormError("Title is required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingInvitation) {
        const payload = {
          title: formTitle,
          subtitle: formSubtitle || undefined,
          status: formStatus as any,
        };
        const res = await adminService.updateAdminInvitation(editingInvitation.id, payload);
        if (res.success) {
          triggerToast("Invitation updated successfully by Admin!");
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
      const res = await adminService.deleteAdminInvitation(deleteConfirmId);
      if (res && res.success) {
        triggerToast("Invitation deleted successfully by Admin!");
        setInvitations((prev) => prev.filter((i) => i.id !== deleteConfirmId));
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Failed to delete invitation.", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Filtered invitations list for search
  const filteredInvitations = invitations.filter((i) => {
    return (
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.subtitle && i.subtitle.toLowerCase().includes(search.toLowerCase())) ||
      (i.eventTitle && i.eventTitle.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const totalInvitationsCount = invitations.length;
  const totalFilteredCount = filteredInvitations.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / ITEMS_PER_PAGE));

  const paginatedInvitations = filteredInvitations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
                Invitations
              </h1>
              <p className="text-sm text-[#2D1B3D]/60 mt-1">Manage invitations across all events</p>
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
        <div className="grid grid-cols-1 gap-5 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#2D1B3D]/5 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-[#2D1B3D]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">
                  Total Invitations Across Platform
                </p>
                <p className="text-3xl font-bold text-[#2D1B3D] mt-0.5">
                  {loading ? "..." : totalInvitationsCount}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Table Area */}
        <div className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm flex flex-col min-h-[500px]">
          <div className="mb-6 w-full max-w-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-[#2D1B3D]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invitations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
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
              <h4 className="text-lg font-semibold text-[#2D1B3D]">Error loading invitations</h4>
              <p className="text-xs text-[#2D1B3D]/60 mt-1 max-w-xs">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#2D1B3D] rounded-xl hover:bg-[#3d2a52]"
              >
                Retry
              </button>
            </div>
          ) : filteredInvitations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#E8C4B8]/40 flex items-center justify-center mb-6 shadow-sm">
                <Mail className="w-8 h-8 text-[#C9A84C]" />
              </div>
              <h3 className="text-xl font-bold font-display text-[#2D1B3D] mb-1">No Invitations Found</h3>
              <p className="text-xs text-[#2D1B3D]/50 max-w-sm">
                No invitations found under the search criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8C4B8]/30">
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Invitation Title
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Subtitle
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Event Title
                    </th>
                    <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Event Creator
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
                  {paginatedInvitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#FAF8F5]/60 transition-colors duration-150 group">
                      <td className="py-4 px-4 text-sm font-semibold text-[#2D1B3D]">
                        <div className="flex items-center gap-3">
                          <InvitationThumbnail src={inv.imageUrl} alt={inv.title} />
                          <span className="font-semibold text-[#2D1B3D]">{inv.title}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs text-[#2D1B3D]/80 truncate max-w-[150px]">
                        {inv.subtitle || "-"}
                      </td>

                      <td className="py-4 px-4 text-xs font-medium text-[#2D1B3D]/70 max-w-[130px] truncate">
                        {inv.eventTitle || "General"}
                      </td>

                      <td className="py-4 px-4 text-xs text-[#2D1B3D]/80">
                        <div className="flex flex-col">
                          <span className="font-semibold">{inv.eventCreator?.name || "-"}</span>
                          <span className="text-[10px] text-[#2D1B3D]/50">{inv.eventCreator?.email || "-"}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            inv.status === "published"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setViewingInvitation(inv)}
                            title="View Details"
                            className="p-2 text-[#2D1B3D]/65 hover:text-[#2D1B3D] hover:bg-[#F0EBE8] rounded-lg transition-all focus:outline-none"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(inv)}
                            title="Edit Invitation"
                            className="p-2 text-[#2D1B3D]/65 hover:text-[#C9A84C] hover:bg-[#F0EBE8] rounded-lg transition-all focus:outline-none"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(inv.id || null)}
                            title="Delete Invitation"
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

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalFilteredCount}
            limit={ITEMS_PER_PAGE}
            onPageChange={(p) => setCurrentPage(p)}
            loading={loading}
            itemName="invitations"
            hideOnSinglePage={false}
          />
        </div>
      </main>

      {/* VIEW INVITATION DETAILS MODAL */}
      <AnimatePresence>
        {viewingInvitation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingInvitation(null)}
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 flex flex-col text-[#2D1B3D] font-body"
              style={{ maxHeight: "calc(100vh - 40px)" }}
            >
              {/* Scrollable Inner Content Wrapper */}
              <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 custom-scrollbar" style={{ padding: "24px" }}>
                {/* Header */}
                <div className="flex justify-between items-start">
                  <h3 className="text-lg sm:text-xl font-bold font-display" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Invitation Details
                  </h3>
                  <button
                    onClick={() => setViewingInvitation(null)}
                    className="p-1 text-[#2D1B3D]/50 hover:text-[#2D1B3D] rounded-lg hover:bg-[#F0EBE8] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Details Content & Image Header */}
                <div className="space-y-4 text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider">
                  {viewingInvitation.imageUrl && (
                    <div className="w-full h-36 sm:h-48 rounded-xl overflow-hidden border border-[#E8C4B8]/40 bg-neutral-100 shadow-sm relative">
                      <img
                        src={getImageUrl(viewingInvitation.imageUrl)}
                        alt={viewingInvitation.title}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-[#2D1B3D]/40">Title</span>
                    <p className="text-sm font-bold text-[#2D1B3D] mt-0.5 normal-case break-words">{viewingInvitation.title}</p>
                  </div>
                  {viewingInvitation.subtitle && (
                    <div>
                      <span className="text-[10px] text-[#2D1B3D]/40">Subtitle</span>
                      <p className="text-sm font-semibold text-[#2D1B3D] mt-0.5 normal-case break-words">{viewingInvitation.subtitle}</p>
                    </div>
                  )}
                  {viewingInvitation.mainText && (
                    <div>
                      <span className="text-[10px] text-[#2D1B3D]/40">Custom Message</span>
                      <p className="text-xs font-medium text-[#2D1B3D] mt-0.5 normal-case whitespace-pre-line leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#E8C4B8]/20 break-words">{viewingInvitation.mainText}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-[#2D1B3D]/40">Event Title</span>
                    <p className="text-xs font-bold text-[#C9A84C] mt-0.5 normal-case break-words">{viewingInvitation.eventTitle}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#2D1B3D]/40">Event Creator</span>
                    <p className="text-xs font-semibold text-[#2D1B3D] mt-0.5 normal-case break-words">
                      {viewingInvitation.eventCreator?.name || "-"} ({viewingInvitation.eventCreator?.email || "-"})
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#2D1B3D]/40">Status</span>
                    <p className="text-xs font-bold text-[#2D1B3D] mt-0.5">{viewingInvitation.status}</p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setViewingInvitation(null)}
                    className="w-full sm:w-auto px-5 py-2.5 sm:py-2 text-xs font-semibold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl active:scale-95 transition-all shadow-sm focus:outline-none"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT INVITATION DETAILS MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
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
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white w-full max-w-md max-h-[90vh] rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 flex flex-col text-[#2D1B3D] font-body"
              style={{ maxHeight: "calc(100vh - 40px)" }}
            >
              <div className="overflow-y-auto p-4 sm:p-6 custom-scrollbar" style={{ padding: "24px" }}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold font-display" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Edit Invitation (Admin)
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
                      Invitation Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/60 mb-1.5">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/60 mb-1.5">
                      Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E8C4B8]/40 px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#2D1B3D]"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
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
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white w-full max-w-md max-h-[90vh] rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 flex flex-col text-[#2D1B3D] font-body"
              style={{ maxHeight: "calc(100vh - 40px)" }}
            >
              <div className="overflow-y-auto p-4 sm:p-6 custom-scrollbar" style={{ padding: "24px" }}>
                <h3 className="text-lg font-semibold font-display mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Delete Invitation
                </h3>
                <p className="text-sm text-[#2D1B3D]/70 mb-6">
                  Are you sure you want to delete this invitation? This action is permanent and cannot be undone.
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
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
