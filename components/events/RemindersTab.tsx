"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  Loader2,
  Save,
  Shield,
  Users,
  Clock,
} from "lucide-react";
import eventService, { EventReminder } from "../../services/eventService";

interface RemindersTabProps {
  eventId: string;
  initialReminders?: EventReminder[] | null;
  onRemindersChange?: (reminders: EventReminder[]) => void;
  onSaveSuccess?: (reminders: EventReminder[]) => void;
  showToast?: (text: string, type?: "success" | "error") => void;
}

const DAYS_BEFORE_OPTIONS = [
  { value: 1, label: "1 day before" },
  { value: 2, label: "2 days before" },
  { value: 3, label: "3 days before" },
  { value: 7, label: "7 days before" },
  { value: 14, label: "14 days before" },
  { value: 30, label: "30 days before" },
];

const SEND_VIA_OPTIONS: Array<"Email" | "SMS" | "WhatsApp"> = [
  "Email",
  "SMS",
  "WhatsApp",
];

const TARGET_AUDIENCE_OPTIONS: Array<{
  value: "ALL" | "RSVP_PENDING" | "GUARANTEED";
  label: string;
}> = [
  { value: "ALL", label: "All Guests" },
  { value: "RSVP_PENDING", label: "RSVP Pending" },
  { value: "GUARANTEED", label: "Reservation Guarantee" },
];

const DEFAULT_REMINDERS_TEMPLATE: EventReminder[] = [
  {
    enabled: true,
    daysBefore: 14,
    sendVia: "Email",
    message: "Don't forget to RSVP for our event!",
    targetAudience: "RSVP_PENDING",
  },
  {
    enabled: true,
    daysBefore: 7,
    sendVia: "Email",
    message: "Only one week left! We hope to see you there.",
    targetAudience: "ALL",
  },
];

const generateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `reminder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

type AudienceFilter = "ALL_REMINDERS" | "ALL" | "RSVP_PENDING" | "GUARANTEED";

export default function RemindersTab({
  eventId,
  initialReminders,
  onRemindersChange,
  onSaveSuccess,
  showToast,
}: RemindersTabProps) {
  const [reminders, setReminders] = useState<EventReminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>("ALL_REMINDERS");

  useEffect(() => {
    if (initialReminders && initialReminders.length > 0) {
      setReminders(initialReminders);
      setIsInitialized(true);
    } else if (eventId) {
      const fetchReminders = async () => {
        try {
          setLoading(true);
          const res = await eventService.getReminders(eventId);
          if (res && res.success && Array.isArray(res.reminders)) {
            const list = res.reminders.length > 0 ? res.reminders : DEFAULT_REMINDERS_TEMPLATE;
            setReminders(list);
            if (onRemindersChange) onRemindersChange(list);
          } else {
            setReminders(DEFAULT_REMINDERS_TEMPLATE);
            if (onRemindersChange) onRemindersChange(DEFAULT_REMINDERS_TEMPLATE);
          }
        } catch (err: any) {
          console.error("Failed to load reminders:", err);
          setReminders(DEFAULT_REMINDERS_TEMPLATE);
          if (onRemindersChange) onRemindersChange(DEFAULT_REMINDERS_TEMPLATE);
        } finally {
          setLoading(false);
          setIsInitialized(true);
        }
      };
      fetchReminders();
    }
  }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isInitialized && initialReminders && initialReminders.length > 0) {
      setReminders(initialReminders);
    }
  }, [initialReminders]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateRemindersState = (updated: EventReminder[]) => {
    setReminders(updated);
    if (onRemindersChange) onRemindersChange(updated);
  };

  const handleAddReminder = (audience: "ALL" | "RSVP_PENDING" | "GUARANTEED" = "ALL") => {
    const newReminder: EventReminder = {
      id: generateId(),
      enabled: true,
      daysBefore: 3,
      sendVia: "Email",
      message:
        audience === "GUARANTEED"
          ? "Your reservation is confirmed. We look forward to seeing you!"
          : audience === "RSVP_PENDING"
          ? "Please confirm your RSVP - spots are filling up!"
          : "Reminder: Our event is coming up soon!",
      targetAudience: audience,
    };
    updateRemindersState([...reminders, newReminder]);
  };

  const handleToggleEnabled = (index: number) => {
    updateRemindersState(reminders.map((item, idx) => (idx === index ? { ...item, enabled: !item.enabled } : item)));
  };

  const handleChangeDaysBefore = (index: number, days: number) => {
    updateRemindersState(reminders.map((item, idx) => (idx === index ? { ...item, daysBefore: days } : item)));
  };

  const handleChangeSendVia = (index: number, sendVia: "Email" | "SMS" | "WhatsApp") => {
    updateRemindersState(reminders.map((item, idx) => (idx === index ? { ...item, sendVia } : item)));
  };

  const handleChangeTargetAudience = (index: number, targetAudience: "ALL" | "RSVP_PENDING" | "GUARANTEED") => {
    updateRemindersState(reminders.map((item, idx) => (idx === index ? { ...item, targetAudience } : item)));
  };

  const handleChangeMessage = (index: number, message: string) => {
    updateRemindersState(reminders.map((item, idx) => (idx === index ? { ...item, message } : item)));
  };

  const handleDeleteReminder = (index: number) => {
    updateRemindersState(reminders.filter((_, idx) => idx !== index));
  };

  const handleSaveReminders = async () => {
    if (!eventId) return;
    try {
      setSaving(true);
      const res = await eventService.updateReminders(eventId, reminders);
      if (res && res.success) {
        const saved = res.reminders || reminders;
        setReminders(saved);
        if (onRemindersChange) onRemindersChange(saved);
        if (showToast) showToast("Reminders updated successfully!");
        if (onSaveSuccess) onSaveSuccess(saved);
      } else {
        throw new Error(res?.message || "Failed to update reminders");
      }
    } catch (err: any) {
      console.error("Error saving reminders:", err);
      if (showToast) {
        showToast(err.response?.data?.error || err.message || "Failed to update reminders.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredReminders =
    audienceFilter === "ALL_REMINDERS"
      ? reminders.map((r, i) => ({ reminder: r, originalIndex: i }))
      : reminders
          .map((r, i) => ({ reminder: r, originalIndex: i }))
          .filter(({ reminder }) => (reminder.targetAudience || "ALL") === audienceFilter);

  const countByAudience = (aud: string) =>
    reminders.filter((r) => (r.targetAudience || "ALL") === aud).length;

  const AUDIENCE_CONFIG: Record<string, { label: string; badgeClass: string; cardClass: string; icon: React.ReactNode }> = {
    ALL: {
      label: "All Guests",
      badgeClass: "bg-slate-100 text-slate-600 border border-slate-200",
      cardClass: "border-slate-100 bg-white",
      icon: <Users className="w-3 h-3" />,
    },
    RSVP_PENDING: {
      label: "RSVP Pending",
      badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
      cardClass: "border-amber-200 bg-amber-50/30",
      icon: <Clock className="w-3 h-3" />,
    },
    GUARANTEED: {
      label: "Reservation Guarantee",
      badgeClass: "bg-indigo-50 text-indigo-700 border border-indigo-200",
      cardClass: "border-indigo-200 bg-indigo-50/40",
      icon: <Shield className="w-3 h-3" />,
    },
  };

  if (loading && !isInitialized) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center min-h-[320px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading event reminders...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-[#5b5fef]" strokeWidth={2} />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Event Reminders</h2>
          <span className="ml-1 text-xs font-semibold bg-slate-100 text-slate-500 rounded-full px-2.5 py-0.5">
            {reminders.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() =>
            handleAddReminder(audienceFilter === "ALL_REMINDERS" ? "ALL" : (audienceFilter as "ALL" | "RSVP_PENDING" | "GUARANTEED"))
          }
          className="bg-purple-50 text-purple-600 hover:bg-purple-100 font-medium px-4 py-2 rounded-xl text-sm transition flex items-center gap-1.5 cursor-pointer shadow-none active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Audience Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: "ALL_REMINDERS" as AudienceFilter, label: "All Reminders", count: reminders.length, cls: "text-slate-700 bg-slate-100 border-slate-200" },
          { id: "ALL" as AudienceFilter, label: "All Guests", count: countByAudience("ALL"), cls: "text-slate-600 bg-white border-slate-200" },
          { id: "RSVP_PENDING" as AudienceFilter, label: "RSVP Pending", count: countByAudience("RSVP_PENDING"), cls: "text-amber-700 bg-amber-50 border-amber-200" },
          { id: "GUARANTEED" as AudienceFilter, label: "Reservation Guarantee", count: countByAudience("GUARANTEED"), cls: "text-indigo-700 bg-indigo-50 border-indigo-200" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setAudienceFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${tab.cls} ${
              audienceFilter === tab.id ? "ring-2 ring-offset-1 ring-indigo-300" : "opacity-70 hover:opacity-100"
            }`}
          >
            <span>{tab.label}</span>
            <span className="font-bold opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Reminder List */}
      {filteredReminders.length === 0 ? (
        <div className="py-12 px-4 text-center">
          <p className="text-sm text-slate-500 mb-4">No reminders in this category. Click &apos;+ Add Reminder&apos; to create one.</p>
          <button
            type="button"
            onClick={() =>
              handleAddReminder(audienceFilter === "ALL_REMINDERS" ? "ALL" : (audienceFilter as "ALL" | "RSVP_PENDING" | "GUARANTEED"))
            }
            className="bg-purple-50 text-purple-600 hover:bg-purple-100 font-medium px-4 py-2 rounded-xl text-sm transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Reminder</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredReminders.map(({ reminder, originalIndex }) => {
            const aud = reminder.targetAudience || "ALL";
            const cfg = AUDIENCE_CONFIG[aud] || AUDIENCE_CONFIG.ALL;
            return (
              <div
                key={reminder.id || `reminder-${originalIndex}`}
                className={`rounded-2xl border p-4 sm:p-5 transition-all ${!reminder.enabled ? "opacity-50" : ""} ${cfg.cardClass}`}
              >
                <div className="flex items-start gap-3">
                  {/* Enable Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(originalIndex)}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer mt-0.5 flex-shrink-0 ${
                      reminder.enabled ? "bg-[#0066fe] text-white" : "border-2 border-slate-300 bg-white hover:border-slate-400"
                    }`}
                    aria-label={reminder.enabled ? "Disable reminder" : "Enable reminder"}
                  >
                    {reminder.enabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Badge + Delete */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${cfg.badgeClass}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteReminder(originalIndex)}
                        className="text-red-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                      </button>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-start gap-6 sm:gap-8">
                      {/* Days Before */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Days Before Event</label>
                        <div className="relative inline-flex items-center min-w-[140px]">
                          <select
                            value={reminder.daysBefore}
                            onChange={(e) => handleChangeDaysBefore(originalIndex, Number(e.target.value))}
                            className="w-full appearance-none bg-transparent pr-7 py-0.5 text-sm text-slate-800 focus:outline-none cursor-pointer"
                          >
                            {DAYS_BEFORE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-0 pointer-events-none" />
                        </div>
                      </div>

                      {/* Send Via */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Send Via</label>
                        <div className="relative inline-flex items-center min-w-[110px]">
                          <select
                            value={reminder.sendVia}
                            onChange={(e) => handleChangeSendVia(originalIndex, e.target.value as "Email" | "SMS" | "WhatsApp")}
                            className="w-full appearance-none bg-transparent pr-7 py-0.5 text-sm text-slate-800 focus:outline-none cursor-pointer"
                          >
                            {SEND_VIA_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-0 pointer-events-none" />
                        </div>
                      </div>

                      {/* Target Audience */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
                        <div className="relative inline-flex items-center min-w-[160px]">
                          <select
                            value={reminder.targetAudience || "ALL"}
                            onChange={(e) => handleChangeTargetAudience(originalIndex, e.target.value as "ALL" | "RSVP_PENDING" | "GUARANTEED")}
                            className="w-full appearance-none bg-transparent pr-7 py-0.5 text-sm text-slate-800 focus:outline-none cursor-pointer"
                          >
                            {TARGET_AUDIENCE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-0 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                      <input
                        type="text"
                        value={reminder.message}
                        onChange={(e) => handleChangeMessage(originalIndex, e.target.value)}
                        placeholder="Enter reminder message..."
                        className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 py-1.5 px-0 border-0 border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Reminders dispatch to their target audience based on event date minus days before. Guarantee reminders sync with Attendance Commitment settings.
        </p>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleSaveReminders}
            disabled={saving}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Saving...</span></>
            ) : (
              <><Save className="w-3.5 h-3.5" /><span>Save Reminders</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

