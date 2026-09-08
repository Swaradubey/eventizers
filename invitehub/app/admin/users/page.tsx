"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import adminService, { AdminManagedUser } from "../../../services/adminService";
import Pagination from "../../../components/Pagination";
import {
  UserCog,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Menu,
  Shield,
  Users,
  Eye,
  Mail,
  Phone,
  Calendar,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ROLES = [
  { value: "USER", label: "User", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "ADMIN", label: "Admin", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "GUEST", label: "Guest", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "STAFF_COHOST", label: "Staff/Cohost", color: "bg-amber-50 text-amber-700 border-amber-200" },
];

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  const [users, setUsers] = useState<AdminManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roleCounts, setRoleCounts] = useState({
    users: 0,
    admins: 0,
    guests: 0,
    staff: 0,
  });

  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const USERS_PER_PAGE = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminManagedUser | null>(null);
  const [viewingUser, setViewingUser] = useState<AdminManagedUser | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("USER");
  const [sendInviteEmail, setSendInviteEmail] = useState(false);
  const [formEventId, setFormEventId] = useState("");
  const [eventsList, setEventsList] = useState<{ id: string; title: string }[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/admin/login");
      } else if (user.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  const fetchEventsList = async () => {
    try {
      const res = await adminService.getAdminEvents(1, 100);
      if (res && res.success && res.events) {
        setEventsList(res.events.map((e: any) => ({ id: e.id, title: e.title })));
      }
    } catch (err) {
      console.warn("Could not fetch events for dropdown:", err);
    }
  };

  const fetchUsers = async (pageToFetch: number = currentPage) => {
    if (!user || user.role !== "ADMIN") return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAdminUsers({
        page: pageToFetch,
        limit: USERS_PER_PAGE,
        search,
        role: selectedRole === "STAFF_COHOST" ? "COHOST" : selectedRole,
      });

      if (data && data.success) {
        setUsers(data.users || []);

        if (data.counts) {
          setRoleCounts(data.counts);
        } else {
          const list = data.users || [];
          setRoleCounts({
            users: list.filter((u) => u.role === "USER").length,
            admins: list.filter((u) => u.role === "ADMIN").length,
            guests: list.filter((u) => u.role === "GUEST").length,
            staff: list.filter((u) => u.role === "COHOST" || u.role === "STAFF_COHOST").length,
          });
        }

        if (data.pagination) {
          setTotalUsers(data.pagination.total);
          setTotalPages(Math.max(1, data.pagination.totalPages));
        } else {
          setTotalUsers((data.users || []).length);
          setTotalPages(1);
        }
      } else {
        setUsers([]);
        setError((data as any)?.error || "Could not retrieve user accounts.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch users from the server. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedRole]);

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      fetchUsers(currentPage);
    }
  }, [user, currentPage, search, selectedRole]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const handleAddClick = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormPassword("");
    setSendInviteEmail(false);
    setFormRole("USER");
    setFormEventId("");
    setFormError(null);
    setIsModalOpen(true);
    fetchEventsList();
  };

  const handleEditClick = (u: AdminManagedUser) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormPhone(u.phoneNumber || "");
    setFormPassword("");
    setSendInviteEmail(false);
    setFormRole(u.role === "COHOST" ? "STAFF_COHOST" : u.role);
    setFormEventId("");
    setFormError(null);
    setIsModalOpen(true);
    fetchEventsList();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Full Name and Email are required.");
      return;
    }

    if (!editingUser && !sendInviteEmail && !formPassword) {
      setFormError("Password is required for new users unless 'Send invite via email' is enabled.");
      return;
    }

    if (!sendInviteEmail && formPassword && formPassword.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        const payload: any = {
          name: formName.trim(),
          email: formEmail.trim(),
          phoneNumber: formPhone.trim() || undefined,
          role: formRole === "STAFF_COHOST" ? "COHOST" : formRole,
          eventId: (formRole === "GUEST" || formRole === "STAFF_COHOST") && formEventId ? formEventId : undefined,
        };
        if (formPassword) payload.password = formPassword;
        const res = await adminService.updateAdminManagedUser(editingUser.id, payload);
        if (res.success) {
          triggerToast("User updated successfully!");
          setIsModalOpen(false);
          fetchUsers(currentPage);
        }
      } else {
        const res = await adminService.createAdminManagedUser({
          name: formName.trim(),
          email: formEmail.trim(),
          phoneNumber: formPhone.trim() || undefined,
          password: formPassword || undefined,
          role: formRole === "STAFF_COHOST" ? "COHOST" : formRole,
          eventId: (formRole === "GUEST" || formRole === "STAFF_COHOST") && formEventId ? formEventId : undefined,
          sendInviteEmail,
        });
        if (res.success) {
          triggerToast(res.message || "User created successfully!");
          setIsModalOpen(false);
          fetchUsers(1);
        }
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.error || "An error occurred. Please verify your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId === null) return;
    try {
      const res = await adminService.deleteAdminManagedUser(deleteConfirmId);
      if (res && res.success) {
        triggerToast("User deleted successfully!");
        fetchUsers(currentPage);
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.error || "Failed to delete user.", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "COHOST" || role === "STAFF_COHOST") {
      return ROLES[3];
    }
    const found = ROLES.find((r) => r.value === role);
    return found || ROLES[0];
  };

  const getCountForRole = (roleVal: string) => {
    if (roleVal === "USER") return roleCounts.users;
    if (roleVal === "ADMIN") return roleCounts.admins;
    if (roleVal === "GUEST") return roleCounts.guests;
    if (roleVal === "STAFF_COHOST" || roleVal === "COHOST") return roleCounts.staff;
    return 0;
  };

  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-100/80 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-100/80 flex flex-col font-body text-slate-800 relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-6 sm:px-8 pt-4 md:pt-6 pb-10 z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-xl border border-blue-100 bg-white/90 hover:bg-blue-50 transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Users & Roles
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage platform accounts, security permissions, and role assignments</p>
            </div>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-blue-100/80"
            >
              {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span className="text-xs font-semibold text-slate-800">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-slate-700 transition-colors ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metric Counters (USERS, ADMINS, GUESTS, STAFF/COHOSTS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {ROLES.map((r) => (
            <motion.div
              key={r.value}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300/80 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    r.value === "ADMIN"
                      ? "bg-gradient-to-tr from-purple-500 to-purple-600 shadow-purple-500/25"
                      : r.value === "GUEST"
                      ? "bg-gradient-to-tr from-emerald-500 to-emerald-600 shadow-emerald-500/25"
                      : r.value === "STAFF_COHOST"
                      ? "bg-gradient-to-tr from-amber-500 to-amber-600 shadow-amber-500/25"
                      : "bg-gradient-to-tr from-blue-500 to-blue-600 shadow-blue-500/25"
                  } text-white shadow-md`}
                >
                  {r.value === "ADMIN" ? (
                    <Shield className="w-5 h-5" />
                  ) : r.value === "GUEST" ? (
                    <UserCog className="w-5 h-5" />
                  ) : (
                    <Users className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{r.label}s</p>
                  <p className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                    {loading ? "..." : getCountForRole(r.value)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search and Table Container */}
        <div className="bg-white/90 border border-blue-100 rounded-2xl p-6 shadow-sm flex flex-col min-h-[500px] backdrop-blur-md">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6 w-full">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs text-slate-800 placeholder:text-slate-400 transition-all"
              />
            </div>
            <div className="relative flex items-center gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="appearance-none bg-slate-50 border border-blue-100 px-4 py-2.5 pr-8 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All Roles</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 py-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-blue-50/50 border border-blue-100/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-amber-600 shadow-sm">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Unable to load users</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">{error}</p>
              <button
                onClick={() => fetchUsers(currentPage)}
                className="mt-4 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-blue-600 shadow-sm">
                <UserCog className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Users Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-5">
                {search || selectedRole
                  ? "No accounts match your current filter parameters. Try clearing your search filters."
                  : "No user accounts exist in the platform yet. Click below to add the first user."}
              </p>
              <button
                onClick={handleAddClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-blue-100 bg-blue-50/50">
                    <th className="py-3.5 px-4 text-xs font-bold text-blue-900/70 uppercase tracking-wider rounded-l-xl">
                      User
                    </th>
                    <th className="py-3.5 px-4 text-xs font-bold text-blue-900/70 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="py-3.5 px-4 text-xs font-bold text-blue-900/70 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="py-3.5 px-4 text-xs font-bold text-blue-900/70 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="py-3.5 px-4 text-xs font-bold text-blue-900/70 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="py-3.5 px-4 text-xs font-bold text-blue-900/70 uppercase tracking-wider text-right rounded-r-xl">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {users.map((u) => {
                    const roleBadge = getRoleBadge(u.role);
                    return (
                      <tr key={u.id} className="hover:bg-blue-50/40 transition-colors duration-150 group">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-700 shadow-2xs">
                              {u.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-slate-900">{u.name}</span>
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${roleBadge.color}`}
                          >
                            {roleBadge.label}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs text-slate-600 font-medium">
                            {u.phoneNumber || "—"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {u.plan || "FREE"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs text-slate-500 font-medium">
                            {new Date(u.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                            <button
                              onClick={() => setViewingUser(u)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditClick(u)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Edit User"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(u.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && users.length > 0 && totalPages > 1 && (
            <div className="mt-auto pt-6 border-t border-blue-50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalUsers}
                limit={USERS_PER_PAGE}
                itemName="users"
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </main>

      {/* VIEW USER DETAILS MODAL */}
      <AnimatePresence>
        {viewingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingUser(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">
                    {viewingUser.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{viewingUser.name}</h3>
                    <p className="text-xs text-slate-500">{viewingUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingUser(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-blue-50">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Role</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {getRoleBadge(viewingUser.role).label}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Plan</span>
                    <p className="text-xs font-bold text-blue-700 mt-0.5 uppercase">{viewingUser.plan || "FREE"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Phone Number</span>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                      {viewingUser.phoneNumber || "None configured"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Events Hosted</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {viewingUser._count?.events || 0}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Account Created</span>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {new Date(viewingUser.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-blue-100">
                <button
                  onClick={() => setViewingUser(null)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-md shadow-blue-500/20"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* "+ ADD USER" & EDIT USER MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-blue-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {editingUser ? "Edit User Account" : "Create New User"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingUser
                      ? "Update profile details and role permissions"
                      : "Create an account and assign dashboard access permissions"}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs text-slate-800 placeholder:text-slate-400 transition-all"
                    placeholder="e.g. John Doe"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs text-slate-800 placeholder:text-slate-400 transition-all"
                    placeholder="user@example.com"
                  />
                </div>

                {/* Phone Number (Optional) */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Phone Number <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs text-slate-800 placeholder:text-slate-400 transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {/* Role Selector Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Role Assignment *
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full bg-slate-50 border border-blue-100 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="ADMIN">ADMIN — Full platform administrator privileges</option>
                    <option value="GUEST">GUEST — Dedicated guest portal (invitation, RSVP, QR ticket, registry, gallery)</option>
                    <option value="STAFF_COHOST">STAFF_COHOST — Event co-host & check-in staff privileges</option>
                    <option value="USER">USER — Event host & general organizer account</option>
                  </select>
                </div>

                {/* Optional Event Assignment for GUEST role */}
                {formRole === "GUEST" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5"
                  >
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      Assign to Event <span className="text-emerald-600 font-normal lowercase">(optional)</span>
                    </label>
                    <select
                      value={formEventId}
                      onChange={(e) => setFormEventId(e.target.value)}
                      className="w-full bg-white border border-emerald-200 px-3 py-2 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    >
                      <option value="">None (Can be assigned later)</option>
                      {eventsList.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-emerald-700 mt-1.5">
                      Assigning an event immediately links this guest to the event's invitation and RSVP registry.
                    </p>
                  </motion.div>
                )}

                {/* Event Assignment for STAFF_COHOST role */}
                {formRole === "STAFF_COHOST" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3.5"
                  >
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-900 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      Assign to Event <span className="text-amber-700 font-normal lowercase">(optional)</span>
                    </label>
                    <select
                      value={formEventId}
                      onChange={(e) => setFormEventId(e.target.value)}
                      className="w-full bg-white border border-amber-200 px-3 py-2 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    >
                      <option value="">None (Can be assigned later)</option>
                      {eventsList.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-amber-700 mt-1.5">
                      Assigning an event grants this staff/co-host check-in and attendee management privileges for this event.
                    </p>
                  </motion.div>
                )}

                {/* Password / Send Invite Email Toggle */}
                {!editingUser ? (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-blue-100">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Send invite & setup link via email</p>
                          <p className="text-[10px] text-slate-500">User will receive an email link to set up their password</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        id="inviteToggle"
                        checked={sendInviteEmail}
                        onChange={(e) => setSendInviteEmail(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    {!sendInviteEmail ? (
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Account Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs text-slate-800 transition-colors"
                          placeholder="Min 6 characters"
                        />
                      </div>
                    ) : (
                      <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>A secure temporary activation link will be sent to the user upon submission.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      New Password <span className="text-slate-400 font-normal lowercase">(leave blank to keep current)</span>
                    </label>
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs text-slate-800 transition-colors"
                      placeholder="••••••"
                    />
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-blue-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Processing..." : editingUser ? "Update User" : "Create User"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Delete User</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete this user? This action is permanent and cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md cursor-pointer"
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
