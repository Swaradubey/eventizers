"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import guestService from "../../../services/guestService";
import eventService, { Event } from "../../../services/eventService";
import { Guest } from "../../../types/guestTypes";
import Pagination from "../../../components/Pagination";
import {
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
  UserPlus,
  ArrowLeft,
  Check,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GuestsPage() {
  const { user, loading: authLoading } = useAuth();
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
  const [selectedGroup, setSelectedGroup] = useState("");
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [groupCounts, setGroupCounts] = useState<Record<string, number>>({});
  const [isImportedMonthOnly, setIsImportedMonthOnly] = useState(false);

  // Group member assignment states
  const [allGuestsList, setAllGuestsList] = useState<Guest[]>([]);
  const [loadingAllGuests, setLoadingAllGuests] = useState(false);
  const [activeGroupForAssignment, setActiveGroupForAssignment] = useState<string | null>(null);
  const [assignSearchQuery, setAssignSearchQuery] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isSavingMembers, setIsSavingMembers] = useState(false);

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isManageGroupsModalOpen, setIsManageGroupsModalOpen] = useState(false);
  const [newGroupManageInput, setNewGroupManageInput] = useState("");
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
  const [formGroups, setFormGroups] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Contact lists for Google/Email import (initialized empty)
  const googleContacts: Array<{ name: string; email: string; phone?: string }> = [];
  const emailContacts: Array<{ name: string; email: string; phone?: string }> = [];

  const [selectedImportContacts, setSelectedImportContacts] = useState<number[]>([]);
  const [contactImportEventId, setContactImportEventId] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalGuests, setTotalGuests] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const GUESTS_PER_PAGE = 7;

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch events
  const fetchEvents = async () => {
    if (!user) return;
    try {
      const eventsData = await eventService.getEvents();
      if (eventsData && eventsData.success) {
        setEvents(eventsData.events || []);
      }
    } catch (err: any) {
      console.error("Dashboard Guests Page: Failed to fetch events:", err);
    }
  };

  // Fetch available groups
  const fetchGroups = async () => {
    if (!user) return;
    try {
      const res = await guestService.getGuestGroups();
      if (res && res.success && Array.isArray(res.groups)) {
        setAvailableGroups(res.groups);
        if (res.counts) {
          setGroupCounts(res.counts);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch groups:", err);
    }
  };

  // Fetch all guests for group assignment modal
  const fetchAllGuestsForGroupModal = async () => {
    if (!user) return;
    try {
      setLoadingAllGuests(true);
      const res = await guestService.getGuests(1, 1000);
      if (res && res.success && Array.isArray(res.guests)) {
        setAllGuestsList(res.guests);
      }
    } catch (err) {
      console.error("Failed to fetch all guests for group management:", err);
    } finally {
      setLoadingAllGuests(false);
    }
  };

  const handleOpenManageGroups = () => {
    setActiveGroupForAssignment(null);
    setNewGroupManageInput("");
    setAssignSearchQuery("");
    setIsManageGroupsModalOpen(true);
    fetchGroups();
    fetchAllGuestsForGroupModal();
  };

  // Fetch paginated guests
  const fetchGuests = async (pageToFetch: number = currentPage) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const guestsData = await guestService.getGuests(
        pageToFetch,
        GUESTS_PER_PAGE,
        search,
        selectedEventId,
        selectedGroup
      );
      if (guestsData && guestsData.success) {
        setGuests(guestsData.guests || []);
        if (guestsData.pagination) {
          const total =
            guestsData.pagination.total ||
            guestsData.pagination.totalCount ||
            (guestsData.guests || []).length;
          setTotalGuests(total);
          setTotalPages(Math.max(1, Math.ceil(total / GUESTS_PER_PAGE)));
        } else {
          const count = (guestsData.guests || []).length;
          setTotalGuests(count);
          setTotalPages(Math.max(1, Math.ceil(count / GUESTS_PER_PAGE)));
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch data from the server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    await Promise.all([fetchEvents(), fetchGroups(), fetchGuests(currentPage)]);
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchGroups();
    }
  }, [user]);

  // Reset page when search, selectedEventId, or selectedGroup changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedEventId, selectedGroup]);

  // Fetch guests whenever page, search, selectedEventId, or selectedGroup changes
  useEffect(() => {
    if (user) {
      fetchGuests(currentPage);
    }
  }, [user, currentPage, search, selectedEventId, selectedGroup]);

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

  // Group Management Handlers
  const handleCreateCustomGroup = async () => {
    const name = newGroupManageInput.trim();
    if (!name) return;
    try {
      await guestService.createGuestGroup(name);
      setNewGroupManageInput("");
      setAvailableGroups((prev) => (prev.includes(name) ? prev : [...prev, name]));
      setGroupCounts((prev) => ({ ...prev, [name]: prev[name] || 0 }));
      triggerToast(`Group "${name}" created!`, "success");
      await fetchGroups();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.error || "Failed to create group", "error");
    }
  };

  const handleDeleteCustomGroup = async (groupName: string) => {
    try {
      await guestService.deleteGuestGroup(groupName);
      triggerToast(`Group "${groupName}" deleted!`, "success");
      if (selectedGroup === groupName) {
        setSelectedGroup("");
      }
      if (activeGroupForAssignment === groupName) {
        setActiveGroupForAssignment(null);
      }
      setAvailableGroups((prev) => prev.filter((g) => g !== groupName));
      setGroupCounts((prev) => {
        const copy = { ...prev };
        delete copy[groupName];
        return copy;
      });
      setAllGuestsList((prev) =>
        prev.map((g) => ({
          ...g,
          groups: (g.groups || []).filter((grp) => grp.toLowerCase() !== groupName.toLowerCase()),
        }))
      );
      setGuests((prev) =>
        prev.map((g) => ({
          ...g,
          groups: (g.groups || []).filter((grp) => grp.toLowerCase() !== groupName.toLowerCase()),
        }))
      );
      await fetchGroups();
      fetchGuests(currentPage);
    } catch (err: any) {
      console.error(err);
      triggerToast("Failed to delete group", "error");
    }
  };

  // Group Member Assignment Handlers
  const handleStartAssigning = (groupName: string) => {
    setActiveGroupForAssignment(groupName);
    setAssignSearchQuery("");
    const initialSelected = allGuestsList
      .filter((g) => (g.groups || []).some((grp) => grp.toLowerCase() === groupName.toLowerCase()))
      .map((g) => g.id!)
      .filter(Boolean);
    setSelectedMemberIds(initialSelected);
  };

  const toggleContactSelection = (guestId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(guestId) ? prev.filter((id) => id !== guestId) : [...prev, guestId]
    );
  };

  const handleSelectAllFiltered = (filteredList: Guest[]) => {
    const idsToAdd = filteredList.map((g) => g.id!).filter(Boolean);
    setSelectedMemberIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const handleDeselectAllFiltered = (filteredList: Guest[]) => {
    const idsToRemove = new Set(filteredList.map((g) => g.id!));
    setSelectedMemberIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
  };

  const handleSaveGroupMembers = async () => {
    if (!activeGroupForAssignment) return;
    const targetGroup = activeGroupForAssignment;
    try {
      setIsSavingMembers(true);
      const res = await guestService.updateGroupMembers(
        targetGroup,
        selectedMemberIds
      );

      const count = res.count ?? selectedMemberIds.length;

      setGroupCounts((prev) => ({
        ...prev,
        [targetGroup]: count,
      }));

      setAllGuestsList((prev) =>
        prev.map((g) => {
          if (!g.id) return g;
          const isSelected = selectedMemberIds.includes(g.id);
          const currentGroups = (g.groups || []).filter(
            (grp) => grp.toLowerCase() !== targetGroup.toLowerCase()
          );
          return {
            ...g,
            groups: isSelected ? [...currentGroups, targetGroup] : currentGroups,
          };
        })
      );

      setGuests((prev) =>
        prev.map((g) => {
          if (!g.id) return g;
          const isSelected = selectedMemberIds.includes(g.id);
          const currentGroups = (g.groups || []).filter(
            (grp) => grp.toLowerCase() !== targetGroup.toLowerCase()
          );
          return {
            ...g,
            groups: isSelected ? [...currentGroups, targetGroup] : currentGroups,
          };
        })
      );

      triggerToast(`Assigned ${count} guest${count === 1 ? "" : "s"} to "${targetGroup}"!`, "success");
      setActiveGroupForAssignment(null);
      await fetchGroups();
    } catch (err: any) {
      console.error("Failed to update group members:", err);
      triggerToast(err.response?.data?.error || "Failed to update group members", "error");
    } finally {
      setIsSavingMembers(false);
    }
  };

  // Modal tag selector helpers
  const toggleFormGroup = (grp: string) => {
    setFormGroups((prev) =>
      prev.includes(grp) ? prev.filter((g) => g !== grp) : [...prev, grp]
    );
  };

  const handleAddInlineTag = async () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    try {
      await guestService.createGuestGroup(trimmed);
      if (!availableGroups.includes(trimmed)) {
        setAvailableGroups((prev) => [...prev, trimmed]);
      }
      if (!formGroups.includes(trimmed)) {
        setFormGroups((prev) => [...prev, trimmed]);
      }
      setNewTagInput("");
      fetchGroups();
    } catch (err) {
      if (!availableGroups.includes(trimmed)) {
        setAvailableGroups((prev) => [...prev, trimmed]);
      }
      if (!formGroups.includes(trimmed)) {
        setFormGroups((prev) => [...prev, trimmed]);
      }
      setNewTagInput("");
    }
  };

  // Open creation modal
  const handleAddClick = () => {
    setEditingGuest(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormStatus("invited");
    setFormEventId(events[0]?.id || "");
    setFormGroups([]);
    setNewTagInput("");
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
    setFormGroups(guest.groups && guest.groups.length > 0 ? guest.groups : []);
    setNewTagInput("");
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
          groups: formGroups,
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
          setFormGroups([]);
          setNewTagInput("");
          fetchData();
        }
      } else {
        const payload = {
          eventId: formEventId,
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: cleanPhone,
          status: formStatus,
          groups: formGroups,
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
          setFormGroups([]);
          setNewTagInput("");
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
        fetchGuests(currentPage);
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
    const matchesMonth = isImportedMonthOnly
      ? guest.createdAt
        ? new Date(guest.createdAt).getMonth() === new Date().getMonth() &&
          new Date(guest.createdAt).getFullYear() === new Date().getFullYear()
        : false
      : true;
    return matchesMonth;
  });

  const effectiveTotalGuests = isImportedMonthOnly ? filteredGuests.length : totalGuests;
  const calculatedTotalPages = Math.max(1, Math.ceil(effectiveTotalGuests / GUESTS_PER_PAGE));
  const paginatedGuests = (isImportedMonthOnly || guests.length > GUESTS_PER_PAGE)
    ? filteredGuests.slice((currentPage - 1) * GUESTS_PER_PAGE, currentPage * GUESTS_PER_PAGE)
    : filteredGuests;

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

    const headers = ["Name", "Email", "Contact Number", "Group / Tags", "Event Name", "Status"];

    const escapeCSV = (val: string | null | undefined): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).trim();
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = filteredGuests.map((g) => {
      const eventName = g.eventTitle || events.find((e) => e.id === g.eventId)?.title || "General";
      const phoneStr = g.phone ? g.phone.trim() : "";
      const groupStr = g.groups && g.groups.length > 0 ? g.groups.join("; ") : "";
      return [
        escapeCSV(g.name),
        escapeCSV(g.email),
        escapeCSV(phoneStr),
        escapeCSV(groupStr),
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-sky-50/40 to-indigo-50/60 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-sky-50/40 to-indigo-50/60 flex flex-col font-body text-slate-800 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <Navbar />

      {/* Hidden file input for CSV */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCSVChange}
        accept=".csv"
        className="hidden"
      />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-8 pt-4 md:pt-6 pb-10 z-10">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 transition-colors shadow-sm focus:outline-none"
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

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenManageGroups}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-blue-200/80 hover:bg-blue-50/70 hover:border-blue-300 rounded-xl active:scale-95 transition-all shadow-xs focus:outline-none"
            >
              <Users className="w-4 h-4 text-blue-600" />
              Manage Groups
            </button>
            <button
              onClick={handleAddClick}
              disabled={events.length === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-95 transition-all shadow-md shadow-blue-500/20 focus:outline-none"
            >
              <Plus className="w-4 h-4" />
              Add Guest
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
              className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-blue-100"
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

        {/* Warning if no events */}
        {events.length === 0 && !loading && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-900 text-sm flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <div>
              You must create at least one event in the{" "}
              <span className="font-semibold cursor-pointer underline text-blue-600" onClick={() => router.push("/dashboard")}>
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
            className="bg-white/90 backdrop-blur-sm border border-blue-200/60 shadow-sm hover:shadow-md hover:border-blue-300 rounded-2xl p-5 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 relative overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total Guests
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-0.5">
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
            className="bg-white/90 backdrop-blur-sm border border-blue-200/60 shadow-sm hover:shadow-md hover:border-blue-300 rounded-2xl p-5 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 relative overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50 text-indigo-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total Events
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-0.5">
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
            className={`bg-white/90 backdrop-blur-sm border ${
              isImportedMonthOnly
                ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                : "border-blue-200/60 shadow-sm hover:border-blue-300"
            } rounded-2xl p-5 cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 relative overflow-hidden`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-sky-50 text-sky-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Imported This Month
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-0.5">
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
            <div className="bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-1 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Import Options
              </h3>
              <p className="text-xs text-slate-500 mb-6">Import guests directly into any of your events.</p>

              <div className="space-y-3">
                <button
                  onClick={triggerCSVUpload}
                  disabled={events.length === 0}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-blue-100 hover:border-blue-300 bg-white hover:bg-blue-50/60 disabled:opacity-50 disabled:hover:bg-white transition-all text-sm font-semibold text-left text-slate-800 shadow-xs"
                >
                  <span className="flex items-center gap-2.5">
                    <Upload className="w-4 h-4 text-blue-600" />
                    Upload CSV File
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
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
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-blue-100 hover:border-blue-300 bg-white hover:bg-blue-50/60 disabled:opacity-50 disabled:hover:bg-white transition-all text-sm font-semibold text-left text-slate-800 shadow-xs"
                >
                  <span className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-sky-600" />
                    Google Contacts
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-sky-50 text-sky-600 rounded-md border border-sky-100">
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
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-blue-100 hover:border-blue-300 bg-white hover:bg-blue-50/60 disabled:opacity-50 disabled:hover:bg-white transition-all text-sm font-semibold text-left text-slate-800 shadow-xs"
                >
                  <span className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    Email Contacts List
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100">
                    List
                  </span>
                </button>
              </div>

              {events.length > 0 && (
                <div className="mt-6 pt-4 border-t border-blue-100 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    CSV Format Instructions
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    Ensure your file has a header row like this:
                  </p>
                  <code className="block bg-white p-2 rounded-lg border border-blue-200/60 font-mono text-[10px] text-blue-950 overflow-x-auto whitespace-nowrap">
                    name,email,phone,status
                  </code>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Status values: invited, confirmed, declined, pending. Default is invited.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Search and Guests Table */}
          <div className="col-span-12 lg:col-span-8" ref={tableSectionRef}>
            <div className="bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6 shadow-sm flex flex-col min-h-[500px]">
              {/* Active Filter Banner */}
              {(isImportedMonthOnly || selectedEventId || selectedGroup || search) && (
                <div className="mb-5 p-3.5 rounded-xl bg-blue-50 border border-blue-200/70 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-blue-900 font-semibold">
                    <Filter className="w-3.5 h-3.5 text-blue-600" />
                    <span>Active Filters:</span>
                    {isImportedMonthOnly && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
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
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
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
                    {selectedGroup && (
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        Group: {selectedGroup}
                        <button
                          onClick={() => setSelectedGroup("")}
                          className="hover:opacity-75 focus:outline-none ml-0.5"
                          title="Clear group filter"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {search && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white border border-blue-200 text-blue-800 text-[10px] font-bold flex items-center gap-1 shadow-xs">
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
                      setSelectedGroup("");
                      setSearch("");
                      triggerToast("All filters cleared", "success");
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
              {/* Search & Filters */}
              <div className="flex flex-col lg:flex-row flex-wrap xl:flex-nowrap gap-3 justify-between items-stretch lg:items-center mb-6 w-full">
                {/* Search field */}
                <div className="relative flex-1 min-w-[200px] max-w-full lg:max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search guests or groups..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-blue-50/40 border border-blue-200/60 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs transition-colors text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* Event & Group Filter dropdowns & Export CSV */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start sm:justify-end">
                  {/* Filter Event */}
                  <div className="relative flex-1 sm:flex-initial min-w-[130px] sm:w-44">
                    <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      title="Filter by Event"
                      className="w-full appearance-none bg-blue-50/40 border border-blue-200/60 pl-8 pr-7 py-2.5 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 truncate"
                    >
                      <option value="">All Events</option>
                      {events.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Filter by Group */}
                  <div className="relative flex-1 sm:flex-initial min-w-[130px] sm:w-40">
                    <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      title="Filter by Group"
                      className="w-full appearance-none bg-blue-50/40 border border-blue-200/60 pl-8 pr-7 py-2.5 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 truncate"
                    >
                      <option value="">All Groups</option>
                      {availableGroups.map((grp) => (
                        <option key={grp} value={grp}>
                          {grp}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <button
                    onClick={handleExportCSV}
                    disabled={filteredGuests.length === 0}
                    title={filteredGuests.length === 0 ? "No guests available to export" : "Export visible guests to CSV"}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-blue-200/60 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs active:scale-95 focus:outline-none whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
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
                      className="h-14 bg-blue-50/40 border border-blue-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                  <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                  <h4 className="text-lg font-semibold text-slate-900">Error loading guests</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">{error}</p>
                  <button
                    onClick={fetchData}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredGuests.length === 0 ? (
                // Empty state
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-6 shadow-sm">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {search || selectedEventId ? "No guests found" : "No guests added yet"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    {search || selectedEventId
                      ? "Try clearing your search filters or check another event."
                      : "No guests added yet. Click 'Add Guest' or import a CSV file to add guests."}
                  </p>
                </div>
              ) : (
                // Data table
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-blue-100">
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Contact Details
                        </th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Group / Tags
                        </th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Event
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
                      {paginatedGuests.map((g) => (
                        <tr
                          key={g.id}
                          className="hover:bg-blue-50/40 transition-colors duration-150 group"
                        >
                          {/* Name */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-blue-700">
                                {g.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold text-slate-900">
                                {g.name}
                              </span>
                            </div>
                          </td>

                          {/* Contact details */}
                          <td className="py-4 px-4 text-xs">
                            <p className="text-slate-800 font-medium">{g.email}</p>
                            {g.phone && (
                              <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-blue-500" />
                                {g.phone}
                              </p>
                            )}
                          </td>

                          {/* Group / Tags */}
                          <td className="py-4 px-4 text-xs">
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {g.groups && g.groups.length > 0 ? (
                                g.groups.map((grp, idx) => {
                                  const lower = grp.toLowerCase();
                                  const badgeColor =
                                    lower === "vip"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : lower === "family"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : lower === "friends"
                                      ? "bg-sky-50 text-sky-700 border-sky-200"
                                      : lower === "colleagues"
                                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                      : "bg-purple-50 text-purple-700 border-purple-200";
                                  return (
                                    <span
                                      key={idx}
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColor}`}
                                    >
                                      {grp}
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-slate-400 text-[11px] italic">No group</span>
                              )}
                            </div>
                          </td>

                          {/* Event */}
                          <td className="py-4 px-4 text-xs font-medium text-slate-600 max-w-[130px] truncate">
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
                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all focus:outline-none"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditClick(g)}
                                title="Edit Guest"
                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all focus:outline-none"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(g.id || null)}
                                title="Delete Guest"
                                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all focus:outline-none"
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
                totalPages={totalPages || calculatedTotalPages}
                totalItems={effectiveTotalGuests}
                limit={GUESTS_PER_PAGE}
                onPageChange={(p) => setCurrentPage(p)}
                loading={loading}
                itemName="guests"
                hideOnSinglePage={false}
              />
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold font-display text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {editingGuest ? "Edit Guest Details" : "Add New Guest"}
                </h3>
                <button
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
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
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter guest name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-blue-50/30 border border-blue-200/70 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs transition-colors text-slate-900"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter guest email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-blue-50/30 border border-blue-200/70 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs transition-colors text-slate-900"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-blue-50/30 border border-blue-200/70 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs transition-colors text-slate-900"
                  />
                </div>

                {/* Associated Event */}
                <div className="relative">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Select Event *
                  </label>
                  <select
                    value={formEventId}
                    onChange={(e) => setFormEventId(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-blue-50/30 border border-blue-200/70 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs font-semibold cursor-pointer text-slate-900"
                  >
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 bottom-3 pointer-events-none" />
                </div>

                {/* Status */}
                <div className="relative">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as Guest["status"])}
                    className="w-full appearance-none px-4 py-2.5 bg-blue-50/30 border border-blue-200/70 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs font-semibold cursor-pointer text-slate-900"
                  >
                    <option value="invited">Invited</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="declined">Declined</option>
                    <option value="pending">Pending</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 bottom-3 pointer-events-none" />
                </div>

                {/* Group / Category Multi-select Tag Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-slate-600 uppercase tracking-wider">
                      Group / Category
                    </label>
                    <span className="text-[10px] text-slate-400">Select one or more</span>
                  </div>

                  {/* Available Group Tags */}
                  {availableGroups.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1 mb-2">
                      No groups created yet. Type a group tag below to add one.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {availableGroups.map((grp) => {
                        const isSelected = formGroups.includes(grp);
                        return (
                          <button
                            key={grp}
                            type="button"
                            onClick={() => toggleFormGroup(grp)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                : "bg-blue-50/50 text-slate-700 border-blue-200 hover:bg-blue-100/60"
                            }`}
                          >
                            {isSelected && <CheckCircle className="w-3 h-3" />}
                            {grp}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Custom Tag inline */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add custom group tag..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInlineTag();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-blue-50/30 border border-blue-200/70 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddInlineTag}
                      disabled={!newTagInput.trim()}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50 rounded-xl font-semibold flex items-center gap-1 transition-colors text-xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Tag
                    </button>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-blue-100">
                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-all shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl active:scale-95 transition-all shadow-md shadow-blue-500/20"
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Guest Profile Details
                  </span>
                  <h3 className="text-2xl font-semibold font-display mt-0.5 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {viewingGuest.name}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingGuest(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mt-6 text-sm text-slate-800">
                <div className="flex items-center gap-3 p-3 bg-blue-50/40 rounded-xl border border-blue-100">
                  <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Name
                    </p>
                    <p className="font-semibold text-xs text-slate-900">{viewingGuest.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50/40 rounded-xl border border-blue-100">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Email
                    </p>
                    <p className="font-semibold text-xs text-slate-900">{viewingGuest.email}</p>
                  </div>
                </div>

                {viewingGuest.phone && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50/40 rounded-xl border border-blue-100">
                    <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Phone
                      </p>
                      <p className="font-semibold text-xs text-slate-900">{viewingGuest.phone}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50/40 rounded-xl border border-blue-100">
                    <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Event
                      </p>
                      <p className="font-semibold text-xs truncate max-w-[120px] text-slate-900">{viewingGuest.eventTitle || "General"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50/40 rounded-xl border border-blue-100">
                    <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        RSVP Status
                      </p>
                      <p className="font-bold text-xs uppercase text-blue-700">{viewingGuest.status}</p>
                    </div>
                  </div>
                </div>

                {/* Assigned Groups */}
                <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Assigned Groups / Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingGuest.groups && viewingGuest.groups.length > 0 ? (
                      viewingGuest.groups.map((grp, idx) => {
                        const lower = grp.toLowerCase();
                        const badgeColor =
                          lower === "vip"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : lower === "family"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : lower === "friends"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : lower === "colleagues"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-purple-50 text-purple-700 border-purple-200";
                        return (
                          <span
                            key={idx}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}
                          >
                            {grp}
                          </span>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic">No groups assigned</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-blue-100">
                <button
                  onClick={() => setViewingGuest(null)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl active:scale-95 transition-all shadow-sm focus:outline-none"
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              <h3 className="text-lg font-semibold font-display mb-1 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Import Guests From CSV
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Select which event you want to associate the imported guests with:
              </p>

              <div className="space-y-4">
                <div className="relative text-xs">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Target Event
                  </label>
                  <select
                    value={csvTargetEventId}
                    onChange={(e) => setCsvTargetEventId(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-blue-50/30 border border-blue-200/70 focus:bg-white focus:border-blue-500 outline-none rounded-xl font-semibold cursor-pointer text-slate-900"
                  >
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 bottom-3 pointer-events-none" />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-blue-100">
                  <button
                    onClick={() => setIsImportCSVModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-all shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCSVImportSubmit}
                    disabled={submitting || !csvTargetEventId}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl active:scale-95 transition-all shadow-md shadow-blue-500/20"
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-semibold font-display text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Import from Google Contacts
                </h3>
                <button
                  onClick={() => setIsGoogleImportModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-5">
                Select Google contacts to import and choose a target event.
              </p>

              <div className="space-y-4 text-xs">
                {/* Event picker */}
                <div className="relative">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Target Event
                  </label>
                  <select
                    value={contactImportEventId}
                    onChange={(e) => setContactImportEventId(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-blue-50/30 border border-blue-200/70 focus:bg-white outline-none rounded-xl font-semibold cursor-pointer text-slate-900"
                  >
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 bottom-3 pointer-events-none" />
                </div>

                {/* Contacts List */}
                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Google Contacts ({selectedImportContacts.length} selected)
                  </label>
                  {googleContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-blue-100 rounded-xl bg-blue-50/30">
                      <Users className="w-8 h-8 text-blue-300 mb-2" />
                      <p className="text-xs font-semibold text-slate-800">No contacts found</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        No Google contacts are available to import.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto border border-blue-100 rounded-xl divide-y divide-blue-100 bg-blue-50/20">
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
                            className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-blue-200"
                            />
                            <div>
                              <p className="font-semibold text-slate-900">{contact.name}</p>
                              <p className="text-[10px] text-slate-500">
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
                <div className="flex justify-end gap-3 pt-4 border-t border-blue-100">
                  <button
                    onClick={() => setIsGoogleImportModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-all shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleContactImportSubmit(googleContacts)}
                    disabled={submitting || selectedImportContacts.length === 0 || !contactImportEventId}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl active:scale-95 transition-all shadow-md shadow-blue-500/20"
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-semibold font-display text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Import from Email Contact List
                </h3>
                <button
                  onClick={() => setIsEmailImportModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-5">
                Select email contacts to import and choose a target event.
              </p>

              <div className="space-y-4 text-xs">
                {/* Event picker */}
                <div className="relative">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Target Event
                  </label>
                  <select
                    value={contactImportEventId}
                    onChange={(e) => setContactImportEventId(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-blue-50/30 border border-blue-200/70 focus:bg-white outline-none rounded-xl font-semibold cursor-pointer text-slate-900"
                  >
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 bottom-3 pointer-events-none" />
                </div>

                {/* Contacts List */}
                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Contacts ({selectedImportContacts.length} selected)
                  </label>
                  {emailContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-blue-100 rounded-xl bg-blue-50/30">
                      <Users className="w-8 h-8 text-blue-300 mb-2" />
                      <p className="text-xs font-semibold text-slate-800">No contacts found</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        No email contacts are available to import.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto border border-blue-100 rounded-xl divide-y divide-blue-100 bg-blue-50/20">
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
                            className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-blue-200"
                            />
                            <div>
                              <p className="font-semibold text-slate-900">{contact.name}</p>
                              <p className="text-[10px] text-slate-500">
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
                <div className="flex justify-end gap-3 pt-4 border-t border-blue-100">
                  <button
                    onClick={() => setIsEmailImportModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-all shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleContactImportSubmit(emailContacts)}
                    disabled={submitting || selectedImportContacts.length === 0 || !contactImportEventId}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl active:scale-95 transition-all shadow-md shadow-blue-500/20"
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              <h3 className="text-lg font-semibold font-display mb-2 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Delete Guest
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete this guest? This action cannot be undone and the guest will be permanently removed from this event list.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-all focus:outline-none shadow-xs"
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              <div className="flex justify-between items-center pb-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold font-display text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Event Details & Guests
                    </h3>
                    <p className="text-xs text-slate-500">Total {events.length} event(s) registered in workspace</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEventsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-blue-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {events.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
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
                            ? "bg-blue-50/80 border-blue-400 ring-1 ring-blue-400/30"
                            : "bg-blue-50/30 border-blue-100 hover:bg-blue-50/60"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{event.title}</h4>
                            {isSelected && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-600 text-white rounded-full">
                                Filter Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-blue-500" />
                              {eventDate}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-indigo-600">
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
                              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                              : "bg-white border border-blue-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600"
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

              <div className="pt-4 border-t border-blue-100 flex justify-between items-center">
                <button
                  onClick={() => {
                    setSelectedEventId("");
                    setIsEventsModalOpen(false);
                    triggerToast("Showing guests from all events", "success");
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Show All Events Guests
                </button>
                <button
                  onClick={() => {
                    setIsEventsModalOpen(false);
                    router.push("/dashboard");
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20"
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              <div className="flex justify-between items-center pb-4 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold font-display text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Imported This Month
                    </h3>
                    <p className="text-xs text-slate-500">
                      {importedThisMonthCount} guest(s) added during {new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsImportedModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-blue-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {importedThisMonthCount === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
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
                        className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/30 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">{g.name}</span>
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
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{g.email}</p>
                        </div>
                        <div className="text-right text-[10px] text-slate-400 flex-shrink-0">
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

              <div className="pt-4 border-t border-blue-100 flex justify-between items-center">
                <button
                  onClick={() => {
                    setIsImportedMonthOnly(false);
                    setIsImportedModalOpen(false);
                    triggerToast("Cleared monthly filter", "success");
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
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
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Apply Filter to Table
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───── MANAGE GROUPS MODAL ───── */}
      <AnimatePresence>
        {isManageGroupsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsManageGroupsModalOpen(false);
                setActiveGroupForAssignment(null);
              }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-10 p-6 text-slate-800 font-body"
            >
              {!activeGroupForAssignment ? (
                /* ─── VIEW 1: ACTIVE GROUPS LIST & CREATION ─── */
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3
                          className="text-xl font-semibold font-display text-slate-900"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          Manage Guest Groups
                        </h3>
                        <p className="text-xs text-slate-500">
                          Create, organize, or remove custom guest categories
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsManageGroupsModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Add new custom group field */}
                  <div className="mb-5 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Create New Group
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. VIP Sponsors, Bridal Party..."
                        value={newGroupManageInput}
                        onChange={(e) => setNewGroupManageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCreateCustomGroup();
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-white border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs text-slate-900 placeholder:text-slate-400 shadow-xs"
                      />
                      <button
                        onClick={handleCreateCustomGroup}
                        disabled={!newGroupManageInput.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Group list with guest count */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Active Groups ({availableGroups.length})
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Click group or &apos;Assign Guests&apos; to manage members
                      </span>
                    </div>

                    {availableGroups.length === 0 ? (
                      <div className="py-8 px-4 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 mx-auto flex items-center justify-center mb-2.5">
                          <Users className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto">
                          No groups created yet. Type a group name above to add one.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                        {availableGroups.map((grp) => {
                          const count =
                            groupCounts[grp] !== undefined
                              ? groupCounts[grp]
                              : allGuestsList.filter((g) =>
                                  (g.groups || []).some(
                                    (item) => item.toLowerCase() === grp.toLowerCase()
                                  )
                                ).length;

                          return (
                            <div
                              key={grp}
                              className="group flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-blue-50/60 border border-transparent hover:border-blue-100 transition-all"
                            >
                              <div
                                onClick={() => handleStartAssigning(grp)}
                                className="flex items-center gap-2.5 flex-1 cursor-pointer"
                              >
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                                  {grp}
                                </span>
                                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/70">
                                  {count} {count === 1 ? "guest" : "guests"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleStartAssigning(grp)}
                                  title="Add or remove guests from this group"
                                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                                >
                                  <UserPlus className="w-3.5 h-3.5" />
                                  Assign Guests
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomGroup(grp)}
                                  title="Delete this group"
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-5 mt-4 border-t border-blue-100">
                    <button
                      onClick={() => setIsManageGroupsModalOpen(false)}
                      className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
                    >
                      Done
                    </button>
                  </div>
                </>
              ) : (
                /* ─── VIEW 2: ASSIGN GUESTS TO GROUP ─── */
                <>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveGroupForAssignment(null)}
                        className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Back to Groups list"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            className="text-lg font-semibold font-display text-slate-900"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            Assign Guests: {activeGroupForAssignment}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500">
                          Select or unselect contacts to update group membership
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsManageGroupsModalOpen(false);
                        setActiveGroupForAssignment(null);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search contacts */}
                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search guests by name or email..."
                      value={assignSearchQuery}
                      onChange={(e) => setAssignSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none rounded-xl text-xs text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Filter & Action bar */}
                  {(() => {
                    const filteredGuests = allGuestsList.filter((g) => {
                      const q = assignSearchQuery.toLowerCase().trim();
                      if (!q) return true;
                      return (
                        g.name.toLowerCase().includes(q) ||
                        g.email.toLowerCase().includes(q)
                      );
                    });

                    return (
                      <>
                        <div className="flex items-center justify-between mb-2 text-xs">
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/70">
                            {selectedMemberIds.length} of {allGuestsList.length} guests in group
                          </span>
                          <div className="flex items-center gap-2 text-[11px]">
                            <button
                              type="button"
                              onClick={() => handleSelectAllFiltered(filteredGuests)}
                              className="text-blue-600 hover:underline font-semibold"
                            >
                              Select All
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => handleDeselectAllFiltered(filteredGuests)}
                              className="text-slate-500 hover:text-slate-800 font-semibold"
                            >
                              Deselect All
                            </button>
                          </div>
                        </div>

                        {/* Contacts list */}
                        <div className="max-h-64 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100 border border-slate-100 rounded-xl p-1 bg-slate-50/40">
                          {loadingAllGuests ? (
                            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              Loading guests...
                            </div>
                          ) : filteredGuests.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400 italic">
                              {assignSearchQuery
                                ? "No guests found matching your search."
                                : "No guests created yet in any events."}
                            </div>
                          ) : (
                            filteredGuests.map((guest) => {
                              const isChecked = guest.id ? selectedMemberIds.includes(guest.id) : false;
                              return (
                                <div
                                  key={guest.id}
                                  onClick={() => guest.id && toggleContactSelection(guest.id)}
                                  className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                                    isChecked
                                      ? "bg-blue-50/80 hover:bg-blue-50"
                                      : "hover:bg-slate-100/70"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => guest.id && toggleContactSelection(guest.id)}
                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 pointer-events-none"
                                  />
                                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                                    {(guest.name || "G")[0].toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-slate-800 truncate">
                                      {guest.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate">
                                      {guest.email}
                                    </p>
                                  </div>
                                  {guest.groups && guest.groups.length > 0 && (
                                    <div className="hidden sm:flex items-center gap-1 shrink-0">
                                      {guest.groups.slice(0, 2).map((tg) => (
                                        <span
                                          key={tg}
                                          className="text-[9px] font-medium text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded"
                                        >
                                          {tg}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </>
                    );
                  })()}

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => setActiveGroupForAssignment(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      Back to Groups
                    </button>
                    <button
                      onClick={handleSaveGroupMembers}
                      disabled={isSavingMembers}
                      className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all shadow-sm"
                    >
                      {isSavingMembers ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Save Group Members
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
