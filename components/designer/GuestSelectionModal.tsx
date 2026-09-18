"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Search,
  Users,
  Check,
  CheckSquare,
  Square,
  Filter,
  UserPlus,
  Loader2,
  Tag,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import guestService from "@/services/guestService";

export interface GuestSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEventId?: string | null;
  currentGuests: any[];
  initiallySelectedGuestIds: string[];
  onApply: (selectedGuests: any[], selectedIds: string[]) => void;
}

const DEFAULT_GROUPS = ["Family", "Friends", "VIP", "Colleagues"];

export default function GuestSelectionModal({
  isOpen,
  onClose,
  currentEventId,
  currentGuests,
  initiallySelectedGuestIds,
  onApply,
}: GuestSelectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [allPoolGuests, setAllPoolGuests] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<string[]>(DEFAULT_GROUPS);
  const [groupCounts, setGroupCounts] = useState<Record<string, number>>({});

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("all");

  // Selection state (set of IDs)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initiallySelectedGuestIds)
  );

  // Inline "Add New Guest" form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormName, setAddFormName] = useState("");
  const [addFormEmail, setAddFormEmail] = useState("");
  const [addFormPhone, setAddFormPhone] = useState("");
  const [addFormGroups, setAddFormGroups] = useState<string[]>([]);
  const [addFormSubmitting, setAddFormSubmitting] = useState(false);
  const [addFormError, setAddFormError] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Sync initiallySelectedGuestIds when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(initiallySelectedGuestIds));
      setSearchQuery("");
      setActiveGroup("all");
      resetAddForm();
    }
  }, [isOpen, initiallySelectedGuestIds]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load account-wide guests & guest groups when opened
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    Promise.all([
      guestService.getGuests(1, 500).catch((err) => {
        console.warn("[GuestSelectionModal] Could not fetch account guests:", err);
        return { success: false, guests: [] };
      }),
      guestService.getGuestGroups().catch((err) => {
        console.warn("[GuestSelectionModal] Could not fetch guest groups:", err);
        return { success: false, groups: [], counts: {} };
      }),
    ])
      .then(([guestRes, groupRes]) => {
        if (!isMounted) return;

        // 1. Collect all guests (combining current event guests + user's previous guests)
        const combinedMap = new Map<string, any>();

        // First add current event guests
        (currentGuests || []).forEach((g) => {
          if (g && (g.id || g.email)) {
            const key = (g.email ? g.email.trim().toLowerCase() : "") || g.id;
            combinedMap.set(key, { ...g, isCurrentEventGuest: true });
          }
        });

        // Next merge account guests
        if (guestRes && Array.isArray(guestRes.guests)) {
          guestRes.guests.forEach((g: any) => {
            if (!g) return;
            const key = (g.email ? g.email.trim().toLowerCase() : "") || g.id;
            if (combinedMap.has(key)) {
              // Merge details, keep isCurrentEventGuest
              const existing = combinedMap.get(key);
              combinedMap.set(key, {
                ...g,
                ...existing,
                groups: Array.from(new Set([...(existing.groups || []), ...(g.groups || [])])),
              });
            } else {
              combinedMap.set(key, {
                ...g,
                isCurrentEventGuest: g.eventId === currentEventId,
              });
            }
          });
        }

        const pool = Array.from(combinedMap.values());
        setAllPoolGuests(pool);

        // 2. Collect and normalize all available groups
        const groupsFromGuests = new Set<string>();
        pool.forEach((g) => {
          if (Array.isArray(g.groups)) {
            g.groups.forEach((grp: string) => {
              if (grp && typeof grp === "string" && grp.trim()) {
                groupsFromGuests.add(grp.trim());
              }
            });
          }
        });

        const groupsFromApi = Array.isArray(groupRes?.groups) ? groupRes.groups : [];
        const mergedGroups = Array.from(
          new Set([...DEFAULT_GROUPS, ...groupsFromApi, ...Array.from(groupsFromGuests)])
        );
        setAvailableGroups(mergedGroups);

        // 3. Compute real counts for each group based on pool
        const counts: Record<string, number> = {};
        mergedGroups.forEach((grp) => {
          counts[grp] = pool.filter((g) => {
            if (!Array.isArray(g.groups)) return false;
            return g.groups.some(
              (item: string) => item && item.toLowerCase() === grp.toLowerCase()
            );
          }).length;
        });
        setGroupCounts(counts);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentEventId, currentGuests]);

  // Helper to check if a guest belongs to a group
  const guestMatchesGroup = (guest: any, groupName: string) => {
    if (groupName === "all") return true;
    if (!guest.groups || !Array.isArray(guest.groups)) return false;
    return guest.groups.some(
      (grp: string) => grp && grp.toLowerCase() === groupName.toLowerCase()
    );
  };

  // Filtered pool list based on active group tab & search query
  const filteredGuests = useMemo(() => {
    return allPoolGuests.filter((guest) => {
      // 1. Group filter
      if (activeGroup !== "all" && !guestMatchesGroup(guest, activeGroup)) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = guest.name?.toLowerCase().includes(query);
        const emailMatch = guest.email?.toLowerCase().includes(query);
        const phoneMatch = guest.phone?.toLowerCase().includes(query);
        const groupMatch = Array.isArray(guest.groups) && guest.groups.some((grp: string) =>
          grp.toLowerCase().includes(query)
        );
        const eventMatch = guest.eventTitle?.toLowerCase().includes(query);
        return Boolean(nameMatch || emailMatch || phoneMatch || groupMatch || eventMatch);
      }

      return true;
    });
  }, [allPoolGuests, activeGroup, searchQuery]);

  // Group selection helpers
  const getGuestsInGroup = (groupName: string) => {
    return allPoolGuests.filter((g) => guestMatchesGroup(g, groupName));
  };

  const isGroupFullySelected = (groupName: string) => {
    const members = getGuestsInGroup(groupName);
    if (members.length === 0) return false;
    return members.every((m) => selectedIds.has(m.id));
  };

  const isGroupPartiallySelected = (groupName: string) => {
    const members = getGuestsInGroup(groupName);
    if (members.length === 0) return false;
    const selectedCount = members.filter((m) => selectedIds.has(m.id)).length;
    return selectedCount > 0 && selectedCount < members.length;
  };

  // Toggle individual guest
  const toggleGuest = (guestId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(guestId)) {
        next.delete(guestId);
      } else {
        next.add(guestId);
      }
      return next;
    });
  };

  // Select all members in active group
  const selectAllInActiveGroup = () => {
    const members = activeGroup === "all" ? filteredGuests : getGuestsInGroup(activeGroup);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      members.forEach((m) => {
        if (m.id) next.add(m.id);
      });
      return next;
    });
  };

  // Clear all members in active group
  const clearActiveGroup = () => {
    const members = activeGroup === "all" ? filteredGuests : getGuestsInGroup(activeGroup);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      members.forEach((m) => {
        if (m.id) next.delete(m.id);
      });
      return next;
    });
  };

  // Quick toggle whole group at once
  const toggleEntireGroup = (groupName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const members = getGuestsInGroup(groupName);
    if (members.length === 0) return;

    const allChecked = isGroupFullySelected(groupName);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      members.forEach((m) => {
        if (!m.id) return;
        if (allChecked) {
          next.delete(m.id);
        } else {
          next.add(m.id);
        }
      });
      return next;
    });
  };

  // Select all visible
  const selectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredGuests.forEach((g) => {
        if (g.id) next.add(g.id);
      });
      return next;
    });
  };

  // Deselect all visible
  const deselectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredGuests.forEach((g) => {
        if (g.id) next.delete(g.id);
      });
      return next;
    });
  };

  // Reset the inline add-guest form
  const resetAddForm = () => {
    setShowAddForm(false);
    setAddFormName("");
    setAddFormEmail("");
    setAddFormPhone("");
    setAddFormGroups([]);
    setAddFormError(null);
    setAddFormSubmitting(false);
  };

  // Toggle a group checkbox in the add form
  const toggleAddFormGroup = (group: string) => {
    setAddFormGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  // Recalculate group counts from the current pool
  const recalcGroupCounts = (pool: any[]) => {
    const counts: Record<string, number> = {};
    availableGroups.forEach((grp) => {
      counts[grp] = pool.filter((g) => {
        if (!Array.isArray(g.groups)) return false;
        return g.groups.some(
          (item: string) => item && item.toLowerCase() === grp.toLowerCase()
        );
      }).length;
    });
    setGroupCounts(counts);
  };

  // Handle inline add-guest submission
  const handleAddGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);

    const name = addFormName.trim();
    const email = addFormEmail.trim().toLowerCase();
    const phone = addFormPhone.trim();

    if (!name) {
      setAddFormError("Guest name is required.");
      return;
    }
    if (!email) {
      setAddFormError("Email address is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAddFormError("Please enter a valid email address.");
      return;
    }

    // Check for duplicate email in current pool
    const duplicate = allPoolGuests.some(
      (g) => g.email && g.email.trim().toLowerCase() === email
    );
    if (duplicate) {
      setAddFormError("A guest with this email already exists in your contacts.");
      return;
    }

    setAddFormSubmitting(true);
    try {
      const payload = {
        eventId: currentEventId || "",
        name,
        email,
        phone: phone || null,
        status: "invited" as const,
        groups: addFormGroups,
      };

      const res = await guestService.createGuest(payload);

      if (res && res.success && res.guest) {
        const newGuest = {
          ...res.guest,
          isCurrentEventGuest: res.guest.eventId === currentEventId,
        };

        // Append to pool and select it
        const updatedPool = [...allPoolGuests, newGuest];
        setAllPoolGuests(updatedPool);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (newGuest.id) next.add(newGuest.id);
          return next;
        });

        // Update group counts
        recalcGroupCounts(updatedPool);

        // If the new guest has groups that aren't in availableGroups yet, add them
        if (Array.isArray(newGuest.groups)) {
          const newGroups = newGuest.groups.filter(
            (g: string) => g && !availableGroups.includes(g)
          );
          if (newGroups.length > 0) {
            setAvailableGroups((prev) => [...prev, ...newGroups]);
          }
        }

        resetAddForm();
        setToast({ message: `"${name}" added to contacts and selected!`, type: "success" });
      } else {
        setAddFormError(res?.message || "Failed to create guest. Please try again.");
      }
    } catch (err: any) {
      console.error("[GuestSelectionModal] Error creating guest:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create guest. Please try again.";
      setAddFormError(msg);
    } finally {
      setAddFormSubmitting(false);
    }
  };

  // Handle Apply
  const handleApply = () => {
    const selectedList = allPoolGuests.filter((g) => selectedIds.has(g.id));
    onApply(selectedList, Array.from(selectedIds));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 text-slate-800"
        >
          {/* 1. MODAL HEADER */}
          <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span>Select Guests & Filter by Groups</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Quickly select entire guest groups or search individual contacts from your account
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. GROUP FILTER & QUICK CONTROLS BAR */}
          <div className="px-6 pt-4 pb-3 bg-slate-50 border-b border-slate-200 flex-shrink-0 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>Filter by Group:</span>
              </div>

              {/* Group Quick Toggles */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllInActiveGroup}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {activeGroup === "all" ? "Select All Filtered" : `Select All in ${activeGroup}`}
                </button>
                <button
                  type="button"
                  onClick={clearActiveGroup}
                  className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {activeGroup === "all" ? "Clear Filtered" : `Clear ${activeGroup}`}
                </button>
              </div>
            </div>

            {/* Group Pills Horizontal Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {/* "All Contacts" Pill */}
              <button
                type="button"
                onClick={() => setActiveGroup("all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  activeGroup === "all"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50"
                }`}
              >
                <span>All Contacts</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeGroup === "all"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {allPoolGuests.length}
                </span>
              </button>

              {/* Specific Group Pills with Quick Checkbox */}
              {availableGroups.map((group) => {
                const count = groupCounts[group] || 0;
                const isSelectedTab = activeGroup.toLowerCase() === group.toLowerCase();
                const fullySelected = isGroupFullySelected(group);
                const partiallySelected = isGroupPartiallySelected(group);

                return (
                  <div
                    key={group}
                    onClick={() => setActiveGroup(group)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                      isSelectedTab
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50"
                    }`}
                  >
                    {/* Quick Group Checkbox */}
                    <span
                      onClick={(e) => toggleEntireGroup(group, e)}
                      title={fullySelected ? `Deselect all ${group}` : `Select all ${group}`}
                      className="cursor-pointer flex items-center"
                    >
                      {fullySelected ? (
                        <CheckSquare className={`w-3.5 h-3.5 ${isSelectedTab ? "text-white" : "text-indigo-600"}`} />
                      ) : partiallySelected ? (
                        <div className={`w-3.5 h-3.5 border-2 rounded flex items-center justify-center ${isSelectedTab ? "border-white bg-white/30" : "border-indigo-600 bg-indigo-50"}`}>
                          <div className={`w-1.5 h-1.5 rounded-xs ${isSelectedTab ? "bg-white" : "bg-indigo-600"}`} />
                        </div>
                      ) : (
                        <Square className={`w-3.5 h-3.5 ${isSelectedTab ? "text-white/70" : "text-slate-400"}`} />
                      )}
                    </span>

                    <span>{group}</span>

                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelectedTab
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. SEARCH & SELECTION TOOLBAR */}
          <div className="px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0 bg-white">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, group tag, or past event..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Select / Count summary */}
            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
              <span className="font-semibold text-slate-500 text-[11px]">
                Showing {filteredGuests.length} contact{filteredGuests.length !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={selectAllVisible}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={deselectAllVisible}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  Deselect All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm((prev) => !prev)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add New Guest</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3.5 INLINE ADD NEW GUEST FORM */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-b border-slate-200 bg-emerald-50/40 flex-shrink-0"
              >
                <form onSubmit={handleAddGuestSubmit} className="px-6 py-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">Add New Guest</h4>
                    </div>
                    <button
                      type="button"
                      onClick={resetAddForm}
                      className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {addFormError && (
                    <div className="p-2.5 rounded-lg border border-red-200 bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>{addFormError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={addFormName}
                        onChange={(e) => setAddFormName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={addFormEmail}
                        onChange={(e) => setAddFormEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">
                        Phone <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={addFormPhone}
                        onChange={(e) => setAddFormPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Group Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600">
                      Assign to Groups
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {availableGroups.map((group) => {
                        const isChecked = addFormGroups.includes(group);
                        return (
                          <button
                            key={group}
                            type="button"
                            onClick={() => toggleAddFormGroup(group)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                              isChecked
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Square className="w-3 h-3 text-slate-400" />
                            )}
                            <span>{group}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={resetAddForm}
                      className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addFormSubmitting}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-xl active:scale-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      {addFormSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add & Select</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4. GUEST LIST CONTAINER */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-slate-100 space-y-2">
            {loading ? (
              <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-500">Loading contacts and groups...</p>
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">No guests found</p>
                <p className="text-xs text-slate-500 max-w-sm">
                  {searchQuery
                    ? `No contacts match "${searchQuery}". Try a different name or group.`
                    : "No contacts available in this group."}
                </p>
              </div>
            ) : (
              filteredGuests.map((guest) => {
                const isSelected = selectedIds.has(guest.id);
                const guestGroups: string[] = Array.isArray(guest.groups) ? guest.groups : [];

                return (
                  <div
                    key={guest.id || guest.email}
                    onClick={() => toggleGuest(guest.id)}
                    className={`pt-2 pb-2 px-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-50/70 border border-indigo-200/80 shadow-2xs"
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    {/* Left: Checkbox + Avatar + Guest Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleGuest(guest.id)}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Guest Initials Avatar */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {(guest.name || guest.email || "G").charAt(0).toUpperCase()}
                      </div>

                      {/* Name + Email + Phone */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {guest.name || guest.email?.split("@")[0] || "Guest"}
                          </span>

                          {/* Event indicator if from another event */}
                          {guest.eventTitle && !guest.isCurrentEventGuest && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[150px]">
                              From: {guest.eventTitle}
                            </span>
                          )}

                          {/* Status Badge */}
                          {guest.status && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                guest.status === "confirmed" || guest.status === "attending"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : guest.status === "declined"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {guest.status}
                            </span>
                          )}
                        </div>

                        {/* Contact details */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 truncate">
                          {guest.email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{guest.email}</span>
                            </span>
                          )}
                          {guest.phone && (
                            <span className="flex items-center gap-1 flex-shrink-0">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{guest.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Group Tags */}
                    {guestGroups.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap justify-end flex-shrink-0 max-w-[200px]">
                        {guestGroups.map((grp) => (
                          <span
                            key={grp}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            <span>{grp}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* 5. MODAL FOOTER */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200">
                <Check className="w-3.5 h-3.5" />
                <span>{selectedIds.size} selected</span>
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                ready for invitation recipient list
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Apply & Add Guests ({selectedIds.size})</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-slate-200"
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span className="text-xs font-semibold text-slate-800">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-700 ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
