"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../invitehub/context/AuthContext";
import { useSidebar } from "../../../invitehub/context/SidebarContext";
import Navbar from "../../../invitehub/components/Navbar";
import guestService from "../../../services/guestService";
import eventService, { Event } from "../../../services/eventService";
import { Guest } from "../../../types/guestTypes";
import {
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Users,
  Search,
  Upload,
  Globe,
  Mail,
  X,
  CheckCircle,
  AlertCircle,
  Menu,
  ChevronDown,
  Phone,
  Filter,
  User,
  Sparkles,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GuestsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { setIsOpen } = useSidebar();
  const router = useRouter();

  // State Management
  const [guests, setGuests] = useState<Guest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [search, setSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isImportedMonthOnly, setIsImportedMonthOnly] = useState(false);

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [viewingGuest, setViewingGuest] = useState<Guest | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isImportCSVModalOpen, setIsImportCSVModalOpen] = useState(false);
  const [isGoogleImportModalOpen, setIsGoogleImportModalOpen] = useState(false);
  const [isEmailImportModalOpen, setIsEmailImportModalOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isImportedModalOpen, setIsImportedModalOpen] = useState(false);

  // CSV Import States
  const [csvTextToImport, setCsvTextToImport] = useState("");
  const [csvTargetEventId, setCsvTargetEventId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableSectionRef = useRef<HTMLDivElement>(null);

  // Guest Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEventId, setFormEventId] = useState("");
  const [formStatus, setFormStatus] = useState<Guest["status"]>("invited");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Contact lists for Google/Email import (initialized empty)
  const googleContacts: Array<{ name: string; email: string; phone?: string }> = [];
  const emailContacts: Array<{ name: string; email: string; phone?: string }> = [];

  const [selectedImportContacts, setSelectedImportContacts] = useState<number[]>([]);
  const [contactImportEventId, setContactImportEventId] = useState("");

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch data
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [guestsData, eventsData] = await Promise.all([
        guestService.getGuests(search || undefined, selectedEventId || undefined),
        eventService.getEvents(),
      ]);

      if (guestsData && guestsData.success) {
        setGuests(guestsData.guests || []);
      }
      if (eventsData && eventsData.success) {
        setEvents(eventsData.events || []);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch data from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, search, selectedEventId]);

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

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Open creation modal
  const handleAddClick = () => {
    setEditingGuest(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormStatus("invited");
    setFormEventId(events[0]?.id || "");
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  // Open edit modal
  const handleEditClick = (guest: Guest) => {
    setEditingGuest(guest);
    setFormName(guest.name);
    setFormEmail(guest.email);
    setFormPhone(guest.phone || "");
    setFormStatus(guest.status);
    setFormEventId(guest.eventId);
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  // Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate guest name
    if (!formName || !formName.trim()) {
      setFormError("Guest name is required.");
      return;
    }

    // Validate email address
    if (!formEmail || !formEmail.trim()) {
      setFormError("Email address is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }

    // Validate event selection
    if (!formEventId) {
      setFormError("Please select a valid event.");
      return;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(formEventId)) {
      setFormError("Invalid event selected. Please select a valid event.");
      return;
    }

    // Validate status selection
    const validStatuses = ["invited", "confirmed", "declined", "pending"];
    if (!formStatus || !validStatuses.includes(formStatus)) {
      setFormError("Please select a valid status.");
      return;
    }

    // Handle optional phone number properly (null when blank)
    const cleanPhone = (formPhone && formPhone.trim() !== "") ? formPhone.trim() : null;

    setSubmitting(true);
    try {
      if (editingGuest) {
        const payload = {
          eventId: formEventId,
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: cleanPhone,
          status: formStatus,
        };
        const res = await guestService.updateGuest(editingGuest.id!, payload);
        if (res.success) {
          triggerToast("Guest updated successfully!");
          setIsAddEditModalOpen(false);
          // Clear form fields
          setFormName("");
          setFormEmail("");
          setFormPhone("");
          setFormStatus("invited");
          setFormEventId(events[0]?.id || "");
          fetchData();
        }
      } else {
        const payload = {
          eventId: formEventId,
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: cleanPhone,
          status: formStatus,
        };
        const res = await guestService.createGuest(payload);
        if (res.success) {
          triggerToast("Guest created successfully!");
          setIsAddEditModalOpen(false);
          // Clear form fields
          setFormName("");
          setFormEmail("");
          setFormPhone("");
          setFormStatus("invited");
          setFormEventId(events[0]?.id || "");
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
      const res = await guestService.deleteGuest(deleteConfirmId);
      if (res && res.success) {
        triggerToast("Guest deleted successfully!");
        setGuests((prev) => prev.filter((g) => g.id !== deleteConfirmId));
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Failed to delete the guest.", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // CSV File Trigger
  const triggerCSVUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle CSV selection
  const handleCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      setCsvTextToImport(text);
      setCsvTargetEventId(events[0]?.id || "");
      setIsImportCSVModalOpen(true);
    };
    reader.readAsText(file);
    e.target.value = ""; // clear for next select
  };

  // Submit CSV Import
  const handleCSVImportSubmit = async () => {
    if (!csvTargetEventId) {
      triggerToast("Please select an event for the import.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await guestService.importGuests(csvTargetEventId, csvTextToImport);
      if (res.success) {
        triggerToast(res.message || "Guests imported successfully!");
        setIsImportCSVModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.error || "Failed to import CSV.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Contact List Import Submit
  const handleContactImportSubmit = async (contacts: Array<{ name: string; email: string; phone?: string }>) => {
    if (!contactImportEventId) {
      triggerToast("Please select an event.", "error");
      return;
    }
    if (selectedImportContacts.length === 0) {
      triggerToast("Please select at least one contact to import.", "error");
      return;
    }

    setSubmitting(true);
    try {
      // Build a CSV representation of selected contacts to reuse backend import CSV endpoint
      const headers = "name,email,phone,status";
      const rows = selectedImportContacts.map((idx) => {
        const contact = contacts[idx];
        return `"${contact.name}","${contact.email}","${contact.phone || ""}","invited"`;
      });
      const csvContent = [headers, ...rows].join("\n");

      const res = await guestService.importGuests(contactImportEventId, csvContent);
      if (res.success) {
        triggerToast(`Successfully imported ${selectedImportContacts.length} contacts!`);
        setIsGoogleImportModalOpen(false);
        setIsEmailImportModalOpen(false);
        setSelectedImportContacts([]);
        fetchData();
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Failed to import contacts.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered guests calculation
  const filteredGuests = guests.filter((guest) => {
    const matchesEvent = selectedEventId ? guest.eventId === selectedEventId : true;
    const searchLower = search.toLowerCase().trim();
    const matchesSearch = searchLower
      ? guest.name.toLowerCase().includes(searchLower) ||
        guest.email.toLowerCase().includes(searchLower) ||
        (guest.phone && guest.phone.toLowerCase().includes(searchLower)) ||
        (guest.eventTitle && guest.eventTitle.toLowerCase().includes(searchLower)) ||
        guest.status.toLowerCase().includes(searchLower)
      : true;
    const matchesMonth = isImportedMonthOnly
      ? guest.createdAt
        ? new Date(guest.createdAt).getMonth() === new Date().getMonth() &&
          new Date(guest.createdAt).getFullYear() === new Date().getFullYear()
        : false
      : true;
    return matchesEvent && matchesSearch && matchesMonth;
  });

  // KPI Summary Card Actions
  const handleTotalGuestsClick = () => {
    setSelectedEventId("");
    setSearch("");
    setIsImportedMonthOnly(false);
    triggerToast("Filters reset - showing all guests", "success");
    tableSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTotalEventsClick = () => {
    setIsEventsModalOpen(true);
  };

  const handleImportedThisMonthClick = () => {
    const nextState = !isImportedMonthOnly;
    setIsImportedMonthOnly(nextState);
    if (nextState) {
      triggerToast("Filtered to guests imported this month", "success");
      setIsImportedModalOpen(true);
    } else {
      triggerToast("Showing all guests", "success");
    }
    tableSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Export CSV handler
  const handleExportCSV = () => {
    if (filteredGuests.length === 0) {
      triggerToast("No guests available to export.", "error");
      return;
    }

    const headers = ["Name", "Email", "Contact Number", "Event Name", "Status"];

    const escapeCSV = (val: string | null | undefined): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).trim();
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = filteredGuests.map((g) => {
      const eventName = g.eventTitle || events.find((e) => e.id === g.eventId)?.title || "General";
      const phoneStr = g.phone ? g.phone.trim() : "";
      return [
        escapeCSV(g.name),
        escapeCSV(g.email),
        escapeCSV(phoneStr),
        escapeCSV(eventName),
        escapeCSV(g.status),
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.map(escapeCSV).join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    let eventSlug = "all_events";
    if (selectedEventId) {
      const selEvent = events.find((e) => e.id === selectedEventId);
      if (selEvent && selEvent.title) {
        eventSlug = selEvent.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "");
      }
    }

    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = `guests_${eventSlug || "all_events"}_${dateStr}.csv`;

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    triggerToast(`Exported ${filteredGuests.length} guest(s) to CSV!`, "success");
  };

  // Stats Card values
  const totalGuestsCount = guests.length;
  const totalEventsCount = events.length;

  const importedThisMonthCount = guests.filter((g) => {
    if (!g.createdAt) return false;
    const date = new Date(g.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2D1B3D]/30 border-t-[#2D1B3D] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-body text-[#2D1B3D] relative overflow-hidden">
      <Navbar />

      {/* Hidden file input for CSV */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCSVChange}
        accept=".csv"
        className="hidden"
      />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 z-10">
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
                Guests
              </h1>
              <p className="text-sm text-[#2D1B3D]/60 mt-1">Manage event guest lists and invitations</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddClick}
              disabled={events.length === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#FAF8F5] bg-[#2D1B3D] hover:bg-[#3d2a52] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-95 transition-all shadow-md focus:outline-none"
            >
              <Plus className="w-4 h-4" />
              Add Guest
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/40 hover:bg-[#F0EBE8] rounded-xl transition-all shadow-sm active:scale-95 focus:outline-none"
            >
              <LogOut className="w-3.5 h-3.5 text-[#C9A84C]" />
              Sign Out
            </button>
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
              {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
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

        {/* Warning if no events */}
        {events.length === 0 && !loading && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 text-sm flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <div>
              You must create at least one event in the{" "}
              <span className="font-semibold cursor-pointer underline" onClick={() => router.push("/dashboard")}>
                Events dashboard
              </span>{" "}
              before you can add, import or manage guests.
            </div>
          </div>
        )}

        {/* Top Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Card 1: Total Guests */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0 }}
            onClick={handleTotalGuestsClick}
            role="button"
            tabIndex={0}
            aria-label="View all guests"
            style={{
              background: "linear-gradient(135deg, #8B1E5A 0%, #A83279 50%, #C4458F 100%)",
              boxShadow: "0 12px 32px rgba(139,30,90,0.25)",
              transition: "all 0.25s ease",
            }}
            className="kpi-card-pink rounded-2xl p-5 cursor-pointer hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 relative overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  Total Guests
                </p>
                <p className="text-3xl font-bold text-white mt-0.5">
                  {loading ? "..." : totalGuestsCount}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Events count */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            onClick={handleTotalEventsClick}
            role="button"
            tabIndex={0}
            aria-label="View event breakdown modal"
            style={{
              background: "linear-gradient(135deg, #8B1E5A 0%, #A83279 50%, #C4458F 100%)",
              boxShadow: "0 12px 32px rgba(139,30,90,0.25)",
              transition: "all 0.25s ease",
            }}
            className="kpi-card-pink rounded-2xl p-5 cursor-pointer hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 relative overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  Total Events
                </p>
                <p className="text-3xl font-bold text-white mt-0.5">
                  {loading ? "..." : totalEventsCount}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Imported this month */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onClick={handleImportedThisMonthClick}
            role="button"
            tabIndex={0}
            aria-label="Filter guests imported this month"
            style={{
              background: "linear-gradient(135deg, #8B1E5A 0%, #A83279 50%, #C4458F 100%)",
              boxShadow: isImportedMonthOnly
                ? "0 0 0 3px rgba(255,255,255,0.8), 0 16px 36px rgba(139,30,90,0.4)"
                : "0 12px 32px rgba(139,30,90,0.25)",
              transition: "all 0.25s ease",
            }}
            className={`kpi-card-pink rounded-2xl p-5 cursor-pointer hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 relative overflow-hidden ${
              isImportedMonthOnly ? "ring-2 ring-white" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  Imported This Month
                </p>
                <p className="text-3xl font-bold text-white mt-0.5">
                  {loading ? "..." : importedThisMonthCount}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Panels Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: Import Options */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Import Options
              </h3>
              <p className="text-xs text-[#2D1B3D]/50 mb-6">Import guests directly into any of your events.</p>

              <div className="space-y-3">
                <button
                  onClick={triggerCSVUpload}
                  disabled={events.length === 0}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#E8C4B8]/40 hover:bg-[#FAF8F5] disabled:opacity-50 disabled:hover:bg-white transition-all text-sm font-semibold text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <Upload className="w-4 h-4 text-[#C9A84C]" />
                    Upload CSV File
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] rounded">
                    CSV
                  </span>
                </button>

                <button
                  onClick={() => {
                    setContactImportEventId(events[0]?.id || "");
                    setSelectedImportContacts([]);
                    setIsGoogleImportModalOpen(true);
                  }}
                  disabled={events.length === 0}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#E8C4B8]/40 hover:bg-[#FAF8F5] disabled:opacity-50 disabled:hover:bg-white transition-all text-sm font-semibold text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-sky-600" />
                    Google Contacts
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-sky-50 text-sky-600 rounded">
                    Connect
                  </span>
                </button>

                <button
                  onClick={() => {
                    setContactImportEventId(events[0]?.id || "");
                    setSelectedImportContacts([]);
                    setIsEmailImportModalOpen(true);
                  }}
                  disabled={events.length === 0}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#E8C4B8]/40 hover:bg-[#FAF8F5] disabled:opacity-50 disabled:hover:bg-white transition-all text-sm font-semibold text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    Email Contacts List
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded">
                    List
                  </span>
                </button>
              </div>

              {events.length > 0 && (
                <div className="mt-6 pt-5 border-t border-[#E8C4B8]/20 bg-[#FAF8F5]/50 p-3.5 rounded-xl border">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D1B3D]/50 mb-2">
                    CSV Format Instructions
                  </p>
                  <p className="text-xs text-[#2D1B3D]/70 leading-relaxed mb-2">
                    Ensure your file has a header row like this:
                  </p>
                  <code className="block bg-white p-2 rounded border border-[#E8C4B8]/40 font-mono text-[10px] text-[#2D1B3D] overflow-x-auto whitespace-nowrap">
                    name,email,phone,status
                  </code>
                  <p className="text-[10px] text-[#2D1B3D]/40 mt-2">
                    Status values: invited, confirmed, declined, pending. Default is invited.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Search and Guests Table */}
          <div className="col-span-12 lg:col-span-8" ref={tableSectionRef}>
            <div className="bg-white/80 border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm flex flex-col min-h-[500px]">
              {/* Active Filter Banner */}
              {(isImportedMonthOnly || selectedEventId || search) && (
                <div className="mb-5 p-3.5 rounded-xl bg-[#8B1E5A]/5 border border-[#8B1E5A]/20 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#8B1E5A] font-semibold">
                    <Filter className="w-3.5 h-3.5 text-[#8B1E5A]" />
                    <span>Active Filters:</span>
                    {isImportedMonthOnly && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#8B1E5A] text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        Imported This Month ({importedThisMonthCount})
                        <button
                          onClick={() => setIsImportedMonthOnly(false)}
                          className="hover:opacity-75 focus:outline-none ml-0.5"
                          title="Clear month filter"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedEventId && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#2D1B3D] text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        Event: {events.find((e) => e.id === selectedEventId)?.title || "Selected"}
                        <button
                          onClick={() => setSelectedEventId("")}
                          className="hover:opacity-75 focus:outline-none ml-0.5"
                          title="Clear event filter"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {search && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#8B1E5A]/30 text-[#8B1E5A] text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        Search: "{search}"
                        <button
                          onClick={() => setSearch("")}
                          className="hover:opacity-75 focus:outline-none ml-0.5"
                          title="Clear search filter"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setIsImportedMonthOnly(false);
                      setSelectedEventId("");
                      setSearch("");
                      triggerToast("All filters cleared", "success");
                    }}
                    className="text-[11px] font-bold text-[#8B1E5A] hover:underline"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6 w-full">
                {/* Search field */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-4 h-4 text-[#2D1B3D]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search guests..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                  />
                </div>

                {/* Event Filter dropdown & Export CSV */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-[#2D1B3D]/55 flex-shrink-0" />
                    <span className="text-xs font-semibold text-[#2D1B3D]/60 whitespace-nowrap">Filter Event:</span>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="appearance-none bg-[#FAF8F5] border border-[#E8C4B8]/40 px-4 py-2.5 pr-8 rounded-xl text-xs font-semibold text-[#2D1B3D] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2D1B3D]"
                    >
                      <option value="">All Events</option>
                      {events.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#2D1B3D]/40 absolute right-2.5 pointer-events-none" />
                  </div>

                  <button
                    onClick={handleExportCSV}
                    disabled={filteredGuests.length === 0}
                    title={filteredGuests.length === 0 ? "No guests available to export" : "Export visible guests to CSV"}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/40 hover:bg-[#FAF8F5] hover:border-[#2D1B3D]/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm active:scale-95 focus:outline-none whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C9A84C]" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Table / Lists */}
              {loading ? (
                // Skeletons
                <div className="space-y-4 py-6">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 bg-[#FAF8F5] border border-[#E8C4B8]/20 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                  <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                  <h4 className="text-lg font-semibold text-[#2D1B3D]">Error loading guests</h4>
                  <p className="text-xs text-[#2D1B3D]/60 mt-1 max-w-xs">{error}</p>
                  <button
                    onClick={fetchData}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#2D1B3D] rounded-xl hover:bg-[#3d2a52]"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredGuests.length === 0 ? (
                // Empty state
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                  <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#E8C4B8]/40 flex items-center justify-center mb-6 shadow-sm">
                    <Users className="w-8 h-8 text-[#C9A84C]" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-[#2D1B3D] mb-1">
                    {search || selectedEventId ? "No guests found" : "No guests added yet"}
                  </h3>
                  <p className="text-xs text-[#2D1B3D]/50 max-w-sm">
                    {search || selectedEventId
                      ? "Try clearing your search filters or check another event."
                      : "No guests added yet. Click 'Add Guest' or import a CSV file to add guests."}
                  </p>
                </div>
              ) : (
                // Data table
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E8C4B8]/30">
                        <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                          Contact Details
                        </th>
                        <th className="py-4 px-4 text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                          Event
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
                      {filteredGuests.map((g) => (
                        <tr
                          key={g.id}
                          className="hover:bg-[#FAF8F5]/60 transition-colors duration-150 group"
                        >
                          {/* Name */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E8C4B8]/40 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-[#2D1B3D]">
                                {g.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold text-[#2D1B3D]">
                                {g.name}
                              </span>
                            </div>
                          </td>

                          {/* Contact details */}
                          <td className="py-4 px-4 text-xs">
                            <p className="text-[#2D1B3D] font-medium">{g.email}</p>
                            {g.phone && (
                              <p className="text-[#2D1B3D]/55 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-[#C9A84C]" />
                                {g.phone}
                              </p>
                            )}
                          </td>

                          {/* Event */}
                          <td className="py-4 px-4 text-xs font-medium text-[#2D1B3D]/70 max-w-[130px] truncate">
                            {g.eventTitle || "General"}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                g.status === "confirmed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : g.status === "declined"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : g.status === "pending"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {g.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setViewingGuest(g)}
                                title="View Details"
                                className="p-2 text-[#2D1B3D]/65 hover:text-[#2D1B3D] hover:bg-[#F0EBE8] rounded-lg transition-all focus:outline-none"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditClick(g)}
                                title="Edit Guest"
                                className="p-2 text-[#2D1B3D]/65 hover:text-[#C9A84C] hover:bg-[#F0EBE8] rounded-lg transition-all focus:outline-none"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(g.id || null)}
                                title="Delete Guest"
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
          </div>
        </div>
      </main>

      {/* ───── ADD / EDIT GUEST MODAL ───── */}
      <AnimatePresence>
        {isAddEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddEditModalOpen(false)}
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
                  {editingGuest ? "Edit Guest Details" : "Add New Guest"}
                </h3>
                <button
                  onClick={() => setIsAddEditModalOpen(false)}
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

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                {/* Name */}
                <div>
                  <label className="block font-bold text-[#2D1B3D]/60 uppercase tracking-wider mb-1.5">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter guest name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-bold text-[#2D1B3D]/60 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter guest email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-bold text-[#2D1B3D]/60 uppercase tracking-wider mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                  />
                </div>

                {/* Associated Event */}
                <div className="relative">
                  <label className="block font-bold text-[#2D1B3D]/60 uppercase tracking-wider mb-1.5">
                    Select Event *
                  </label>
                  <select
                    value={formEventId}
                    onChange={(e) => setFormEventId(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#2D1B3D]/40 absolute right-3 bottom-3 pointer-events-none" />
                </div>

                {/* Status */}
                <div className="relative">
                  <label className="block font-bold text-[#2D1B3D]/60 uppercase tracking-wider mb-1.5">
                    Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as Guest["status"])}
                    className="w-full appearance-none px-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <option value="invited">Invited</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="declined">Declined</option>
                    <option value="pending">Pending</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#2D1B3D]/40 absolute right-3 bottom-3 pointer-events-none" />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[#E8C4B8]/20">
                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 rounded-xl hover:bg-[#F0EBE8] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] disabled:opacity-60 rounded-xl active:scale-95 transition-all shadow-md"
                  >
                    {submitting ? "Saving..." : editingGuest ? "Save Changes" : "Create Guest"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───── VIEW DETAILS MODAL ───── */}
      <AnimatePresence>
        {viewingGuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingGuest(null)}
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 text-[#2D1B3D] font-body"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A84C]">
                    Guest Profile Details
                  </span>
                  <h3 className="text-2xl font-semibold font-display mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {viewingGuest.name}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingGuest(null)}
                  className="p-1 text-[#2D1B3D]/50 hover:text-[#2D1B3D] rounded-lg hover:bg-[#F0EBE8] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mt-6 text-sm text-[#2D1B3D]/95">
                <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E8C4B8]/20">
                  <User className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Name
                    </p>
                    <p className="font-semibold text-xs">{viewingGuest.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E8C4B8]/20">
                  <Mail className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-[#2D1B3D]/50 uppercase tracking-wider">
                      Email
                    </p>
                    <p className="font-semibold text-xs">{viewingGuest.email}</p>
                  </div>
                </div>

                {viewingGuest.phone && (
                  <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E8C4B8]/20">
                    <Phone className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-[#2D1B3D]/50 uppercase tracking-wider">
                        Phone
                      </p>
                      <p className="font-semibold text-xs">{viewingGuest.phone}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E8C4B8]/20">
                    <Calendar className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-[#2D1B3D]/50 uppercase tracking-wider">
                        Event
                      </p>
                      <p className="font-semibold text-xs truncate max-w-[120px]">{viewingGuest.eventTitle || "General"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E8C4B8]/20">
                    <Sparkles className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-[#2D1B3D]/50 uppercase tracking-wider">
                        RSVP Status
                      </p>
                      <p className="font-bold text-xs uppercase text-[#2D1B3D]">{viewingGuest.status}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-[#E8C4B8]/25">
                <button
                  onClick={() => setViewingGuest(null)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl active:scale-95 transition-all shadow-sm focus:outline-none"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───── CSV TARGET EVENT PICKER MODAL ───── */}
      <AnimatePresence>
        {isImportCSVModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImportCSVModalOpen(false)}
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 text-[#2D1B3D] font-body"
            >
              <h3 className="text-lg font-semibold font-display mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Import Guests From CSV
              </h3>
              <p className="text-xs text-[#2D1B3D]/60 mb-5">
                Select which event you want to associate the imported guests with:
              </p>

              <div className="space-y-4">
                <div className="relative text-xs">
                  <label className="block font-bold text-[#2D1B3D]/60 uppercase tracking-wider mb-1.5">
                    Target Event
                  </label>
                  <select
                    value={csvTargetEventId}
                    onChange={(e) => setCsvTargetEventId(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] outline-none rounded-xl font-semibold cursor-pointer"
                  >
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#2D1B3D]/40 absolute right-3 bottom-3 pointer-events-none" />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E8C4B8]/20">
                  <button
                    onClick={() => setIsImportCSVModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 rounded-xl hover:bg-[#F0EBE8] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCSVImportSubmit}
                    disabled={submitting || !csvTargetEventId}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] disabled:opacity-50 rounded-xl active:scale-95 transition-all shadow-md"
                  >
                    {submitting ? "Importing..." : "Start Import"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───── GOOGLE CONTACTS IMPORT MODAL ───── */}
      <AnimatePresence>
        {isGoogleImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoogleImportModalOpen(false)}
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 text-[#2D1B3D] font-body"
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-semibold font-display" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Import from Google Contacts
                </h3>
                <button
                  onClick={() => setIsGoogleImportModalOpen(false)}
                  className="p-1 text-[#2D1B3D]/50 hover:text-[#2D1B3D] rounded-lg hover:bg-[#F0EBE8] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-[#2D1B3D]/60 mb-5">
                Select Google contacts to import and choose a target event.
              </p>

              <div className="space-y-4 text-xs">
                {/* Event picker */}
                <div className="relative">
                  <label className="block font-bold text-[#2D1B3D]/60 uppercase tracking-wider mb-1.5">
                    Target Event
                  </label>
                  <select
                    value={contactImportEventId}
                    onChange={(e) => setContactImportEventId(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 outline-none rounded-xl font-semibold cursor-pointer"
                  >
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#2D1B3D]/40 absolute right-3 bottom-3 pointer-events-none" />
                </div>

                {/* Contacts List */}
                <div>
                  <label className="block font-bold text-[#2D1B3D]/60 uppercase tracking-wider mb-2">
                    Google Contacts ({selectedImportContacts.length} selected)
                  </label>
                  {googleContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-[#E8C4B8]/40 rounded-xl bg-[#FAF8F5]/30">
                      <Users className="w-8 h-8 text-[#2D1B3D]/30 mb-2" />
                      <p className="text-xs font-semibold text-[#2D1B3D]">No contacts found</p>
                      <p className="text-[11px] text-[#2D1B3D]/50 mt-0.5">
                        No Google contacts are available to import.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto border border-[#E8C4B8]/40 rounded-xl divide-y divide-[#E8C4B8]/20 bg-[#FAF8F5]/30">
                      {googleContacts.map((contact, idx) => {
                        const isChecked = selectedImportContacts.includes(idx);
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedImportContacts((prev) =>
                                isChecked ? prev.filter((i) => i !== idx) : [...prev, idx]
                              );
                            }}
                            className="flex items-center gap-3 p-3 hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="rounded text-[#2D1B3D] focus:ring-[#2D1B3D] h-4 w-4 border-[#E8C4B8]/70"
                            />
                            <div>
                              <p className="font-semibold text-[#2D1B3D]">{contact.name}</p>
                              <p className="text-[10px] text-[#2D1B3D]/50">
                                {contact.email}{contact.phone ? ` • ${contact.phone}` : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[#E8C4B8]/20">
                  <button
                    onClick={() => setIsGoogleImportModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 rounded-xl hover:bg-[#F0EBE8] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleContactImportSubmit(googleContacts)}
                    disabled={submitting || selectedImportContacts.length === 0 || !contactImportEventId}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] disabled:opacity-50 rounded-xl active:scale-95 transition-all shadow-md"
                  >
                    {submitting ? "Importing..." : `Import Selected (${selectedImportContacts.length})`}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───── EMAIL CONTACTS IMPORT MODAL ───── */}
      <AnimatePresence>
        {isEmailImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEmailImportModalOpen(false)}
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 text-[#2D1B3D] font-body"
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-semibold font-display" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Import from Email Contact List
                </h3>
                <button
                  onClick={() => setIsEmailImportModalOpen(false)}
                  className="p-1 text-[#2D1B3D]/50 hover:text-[#2D1B3D] rounded-lg hover:bg-[#F0EBE8] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-[#2D1B3D]/60 mb-5">
                Select email contacts to import and choose a target event.
              </p>

              <div className="space-y-4 text-xs">
                {/* Event picker */}
                <div className="relative">
                  <label className="block font-bold text-[#2D1B3D]/60 uppercase tracking-wider mb-1.5">
                    Target Event
                  </label>
                  <select
                    value={contactImportEventId}
                    onChange={(e) => setContactImportEventId(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 outline-none rounded-xl font-semibold cursor-pointer"
                  >
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#2D1B3D]/40 absolute right-3 bottom-3 pointer-events-none" />
                </div>

                {/* Contacts List */}
                <div>
                  <label className="block font-bold text-[#2D1B3D]/60 uppercase tracking-wider mb-2">
                    Contacts ({selectedImportContacts.length} selected)
                  </label>
                  {emailContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-[#E8C4B8]/40 rounded-xl bg-[#FAF8F5]/30">
                      <Users className="w-8 h-8 text-[#2D1B3D]/30 mb-2" />
                      <p className="text-xs font-semibold text-[#2D1B3D]">No contacts found</p>
                      <p className="text-[11px] text-[#2D1B3D]/50 mt-0.5">
                        No email contacts are available to import.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto border border-[#E8C4B8]/40 rounded-xl divide-y divide-[#E8C4B8]/20 bg-[#FAF8F5]/30">
                      {emailContacts.map((contact, idx) => {
                        const isChecked = selectedImportContacts.includes(idx);
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedImportContacts((prev) =>
                                isChecked ? prev.filter((i) => i !== idx) : [...prev, idx]
                              );
                            }}
                            className="flex items-center gap-3 p-3 hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="rounded text-[#2D1B3D] focus:ring-[#2D1B3D] h-4 w-4 border-[#E8C4B8]/70"
                            />
                            <div>
                              <p className="font-semibold text-[#2D1B3D]">{contact.name}</p>
                              <p className="text-[10px] text-[#2D1B3D]/50">
                                {contact.email}{contact.phone ? ` • ${contact.phone}` : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[#E8C4B8]/20">
                  <button
                    onClick={() => setIsEmailImportModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 rounded-xl hover:bg-[#F0EBE8] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleContactImportSubmit(emailContacts)}
                    disabled={submitting || selectedImportContacts.length === 0 || !contactImportEventId}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] disabled:opacity-50 rounded-xl active:scale-95 transition-all shadow-md"
                  >
                    {submitting ? "Importing..." : `Import Selected (${selectedImportContacts.length})`}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───── DELETE CONFIRMATION MODAL ───── */}
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
                Delete Guest
              </h3>
              <p className="text-sm text-[#2D1B3D]/70 mb-6">
                Are you sure you want to delete this guest? This action cannot be undone and the guest will be permanently removed from this event list.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 rounded-xl hover:bg-[#F0EBE8] transition-all focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md focus:outline-none"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───── TOTAL EVENTS DETAIL MODAL ───── */}
      <AnimatePresence>
        {isEventsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEventsModalOpen(false)}
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 text-[#2D1B3D] font-body"
            >
              <div className="flex justify-between items-center pb-4 border-b border-[#E8C4B8]/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#8B1E5A]/10 flex items-center justify-center text-[#8B1E5A]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold font-display" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Event Details & Guests
                    </h3>
                    <p className="text-xs text-[#2D1B3D]/60">Total {events.length} event(s) registered in workspace</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEventsModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#2D1B3D]/40 hover:text-[#2D1B3D] hover:bg-[#FAF8F5] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {events.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#2D1B3D]/60">
                    No events found. Create an event in the dashboard first.
                  </div>
                ) : (
                  events.map((event) => {
                    const guestCountForEvent = guests.filter((g) => g.eventId === event.id).length;
                    const rawDate = event.eventDate || (event as any).date;
                    const eventDate = rawDate
                      ? new Date(rawDate).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Date TBD";
                    const isSelected = selectedEventId === event.id;

                    return (
                      <div
                        key={event.id}
                        className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-[#8B1E5A]/5 border-[#8B1E5A]/40 ring-1 ring-[#8B1E5A]/30"
                            : "bg-[#FAF8F5]/60 border-[#E8C4B8]/30 hover:bg-[#FAF8F5]"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#2D1B3D] truncate">{event.title}</h4>
                            {isSelected && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#8B1E5A] text-white rounded-full">
                                Filter Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-[#2D1B3D]/60 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#C9A84C]" />
                              {eventDate}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-[#8B1E5A]">
                              <Users className="w-3 h-3" />
                              {guestCountForEvent} {guestCountForEvent === 1 ? "Guest" : "Guests"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedEventId(event.id || "");
                            setIsEventsModalOpen(false);
                            triggerToast(`Filtered table by event: ${event.title}`, "success");
                            tableSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 whitespace-nowrap ${
                            isSelected
                              ? "bg-[#8B1E5A] text-white hover:bg-[#73174a]"
                              : "bg-white border border-[#E8C4B8]/40 text-[#2D1B3D] hover:bg-[#2D1B3D] hover:text-white"
                          }`}
                        >
                          <Filter className="w-3 h-3" />
                          <span>{isSelected ? "Filtered" : "Filter List"}</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-4 border-t border-[#E8C4B8]/20 flex justify-between items-center">
                <button
                  onClick={() => {
                    setSelectedEventId("");
                    setIsEventsModalOpen(false);
                    triggerToast("Showing guests from all events", "success");
                  }}
                  className="text-xs font-semibold text-[#8B1E5A] hover:underline"
                >
                  Show All Events Guests
                </button>
                <button
                  onClick={() => {
                    setIsEventsModalOpen(false);
                    router.push("/dashboard");
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl transition-all shadow-sm"
                >
                  Manage Events Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───── IMPORTED THIS MONTH DETAIL MODAL ───── */}
      <AnimatePresence>
        {isImportedModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImportedModalOpen(false)}
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 text-[#2D1B3D] font-body"
            >
              <div className="flex justify-between items-center pb-4 border-b border-[#E8C4B8]/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold font-display" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Imported This Month
                    </h3>
                    <p className="text-xs text-[#2D1B3D]/60">
                      {importedThisMonthCount} guest(s) added during {new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsImportedModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#2D1B3D]/40 hover:text-[#2D1B3D] hover:bg-[#FAF8F5] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {importedThisMonthCount === 0 ? (
                  <div className="text-center py-8 text-xs text-[#2D1B3D]/60">
                    No guests imported or created during this current calendar month.
                  </div>
                ) : (
                  guests
                    .filter((g) => {
                      if (!g.createdAt) return false;
                      const date = new Date(g.createdAt);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    })
                    .map((g) => (
                      <div
                        key={g.id}
                        className="p-3.5 rounded-xl border border-[#E8C4B8]/30 bg-[#FAF8F5]/60 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#2D1B3D] truncate">{g.name}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                g.status === "confirmed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : g.status === "declined"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {g.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#2D1B3D]/60 truncate mt-0.5">{g.email}</p>
                        </div>
                        <div className="text-right text-[10px] text-[#2D1B3D]/50 flex-shrink-0">
                          {g.createdAt
                            ? new Date(g.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })
                            : ""}
                        </div>
                      </div>
                    ))
                )}
              </div>

              <div className="pt-4 border-t border-[#E8C4B8]/20 flex justify-between items-center">
                <button
                  onClick={() => {
                    setIsImportedMonthOnly(false);
                    setIsImportedModalOpen(false);
                    triggerToast("Cleared monthly filter", "success");
                  }}
                  className="text-xs font-semibold text-[#2D1B3D]/60 hover:text-[#2D1B3D]"
                >
                  Clear Month Filter
                </button>
                <button
                  onClick={() => {
                    setIsImportedMonthOnly(true);
                    setIsImportedModalOpen(false);
                    triggerToast("Filtered table view to this month's imports", "success");
                    tableSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#8B1E5A] hover:bg-[#73174a] rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Apply Filter to Table
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
