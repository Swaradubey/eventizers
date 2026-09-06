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
} from "lucide-react";
import eventService, { EventReminder } from "@/services/eventService";

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

const DEFAULT_REMINDERS_TEMPLATE: EventReminder[] = [
  {
    enabled: true,
    daysBefore: 14,
    sendVia: "Email",
    message: "Don't forget to RSVP for our event!",
  },
  {
    enabled: true,
    daysBefore: 7,
    sendVia: "Email",
    message: "Only one week left! We hope to see you there.",
  },
];

const generateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `reminder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

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

  // Fetch reminders on mount if not passed as props
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
            const list =
              res.reminders.length > 0
                ? res.reminders
                : DEFAULT_REMINDERS_TEMPLATE;
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
  }, [eventId]);

  // Sync state changes to parent if callback is provided
  const updateRemindersState = (updated: EventReminder[]) => {
    setReminders(updated);
    if (onRemindersChange) {
      onRemindersChange(updated);
    }
  };

  // Add new reminder item with default values
  const handleAddReminder = () => {
    const newReminder: EventReminder = {
      id: generateId(),
      enabled: true,
      daysBefore: 3,
      sendVia: "Email",
      message: "Reminder: Our event is coming up soon!",
    };
    const updated = [...reminders, newReminder];
    updateRemindersState(updated);
  };

  // Toggle enabled checkbox
  const handleToggleEnabled = (index: number) => {
    const updated = reminders.map((item, idx) =>
      idx === index ? { ...item, enabled: !item.enabled } : item
    );
    updateRemindersState(updated);
  };

  // Change daysBefore
  const handleChangeDaysBefore = (index: number, days: number) => {
    const updated = reminders.map((item, idx) =>
      idx === index ? { ...item, daysBefore: days } : item
    );
    updateRemindersState(updated);
  };

  // Change sendVia
  const handleChangeSendVia = (
    index: number,
    sendVia: "Email" | "SMS" | "WhatsApp"
  ) => {
    const updated = reminders.map((item, idx) =>
      idx === index ? { ...item, sendVia } : item
    );
    updateRemindersState(updated);
  };

  // Change message
  const handleChangeMessage = (index: number, message: string) => {
    const updated = reminders.map((item, idx) =>
      idx === index ? { ...item, message } : item
    );
    updateRemindersState(updated);
  };

  // Delete reminder item
  const handleDeleteReminder = (index: number) => {
    const updated = reminders.filter((_, idx) => idx !== index);
    updateRemindersState(updated);
  };

  // Save changes explicitly to backend
  const handleSaveReminders = async () => {
    if (!eventId) return;
    try {
      setSaving(true);
      const res = await eventService.updateReminders(eventId, reminders);
      if (res && res.success) {
        if (showToast) showToast("Reminders updated successfully!");
        if (onSaveSuccess) onSaveSuccess(res.reminders || reminders);
      } else {
        throw new Error(res?.message || "Failed to update reminders");
      }
    } catch (err: any) {
      console.error("Error saving reminders:", err);
      if (showToast) {
        showToast(
          err.response?.data?.error ||
            err.message ||
            "Failed to update reminders.",
          "error"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading && !isInitialized) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center min-h-[320px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-500">
          Loading event reminders...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
      {/* 1. Header Layout */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-8">
        {/* Left Side: Bell icon followed by bold title */}
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-[#5b5fef]" strokeWidth={2} />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Event reminders
          </h2>
        </div>

        {/* Right Side: + Add Reminder button */}
        <button
          type="button"
          onClick={handleAddReminder}
          className="bg-purple-50 text-purple-600 hover:bg-purple-100 font-medium px-4 py-2 rounded-xl text-sm transition flex items-center gap-1.5 cursor-pointer shadow-none active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* 2. Dynamic Reminder List UI */}
      {reminders.length === 0 ? (
        /* Empty State */
        <div className="py-12 px-4 text-center">
          <p className="text-sm text-slate-500 mb-4">
            No reminders configured. Click &apos;+ Add Reminder&apos; to create one.
          </p>
          <button
            type="button"
            onClick={handleAddReminder}
            className="bg-purple-50 text-purple-600 hover:bg-purple-100 font-medium px-4 py-2 rounded-xl text-sm transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Reminder</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {reminders.map((reminder, index) => (
            <div
              key={reminder.id || `reminder-${index}`}
              className="flex items-start gap-3.5 pt-6 first:pt-0 border-t border-slate-100/80 first:border-0"
            >
              {/* Checkbox: Blue primary checkbox on the left */}
              <button
                type="button"
                onClick={() => handleToggleEnabled(index)}
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer mt-0.5 flex-shrink-0 ${
                  reminder.enabled
                    ? "bg-[#0066fe] text-white"
                    : "border-2 border-slate-300 bg-white hover:border-slate-400"
                }`}
                aria-label={
                  reminder.enabled ? "Disable reminder" : "Enable reminder"
                }
              >
                {reminder.enabled && (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                )}
              </button>

              {/* Main Content */}
              <div className="flex-1 min-w-0 space-y-3.5">
                {/* Top Row Controls */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-wrap items-start gap-8 sm:gap-14">
                    {/* Days Before Event Field */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-900 mb-1">
                        Days Before Event
                      </label>
                      <div className="relative inline-flex items-center min-w-[130px] sm:min-w-[160px]">
                        <select
                          value={reminder.daysBefore}
                          onChange={(e) =>
                            handleChangeDaysBefore(
                              index,
                              Number(e.target.value)
                            )
                          }
                          className="w-full appearance-none bg-transparent pr-7 py-0.5 text-sm text-slate-800 font-normal focus:outline-none cursor-pointer"
                        >
                          {DAYS_BEFORE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-700 absolute right-0 pointer-events-none" />
                      </div>
                    </div>

                    {/* Send Via Field */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-900 mb-1">
                        Send Via
                      </label>
                      <div className="relative inline-flex items-center min-w-[100px] sm:min-w-[130px]">
                        <select
                          value={reminder.sendVia}
                          onChange={(e) =>
                            handleChangeSendVia(
                              index,
                              e.target.value as
                                | "Email"
                                | "SMS"
                                | "WhatsApp"
                            )
                          }
                          className="w-full appearance-none bg-transparent pr-7 py-0.5 text-sm text-slate-800 font-normal focus:outline-none cursor-pointer"
                        >
                          {SEND_VIA_OPTIONS.map((method) => (
                            <option key={method} value={method}>
                              {method}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-700 absolute right-0 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Delete Icon (Far right) */}
                  <button
                    type="button"
                    onClick={() => handleDeleteReminder(index)}
                    className="text-red-500 hover:text-red-700 p-1 transition-colors cursor-pointer flex-shrink-0"
                    title="Delete reminder"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                  </button>
                </div>

                {/* Bottom Row: Message Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">
                    Message
                  </label>
                  <input
                    type="text"
                    value={reminder.message}
                    onChange={(e) => handleChangeMessage(index, e.target.value)}
                    placeholder="Enter reminder message..."
                    className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 py-1.5 px-0 border-0 border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Reminders Footer */}
      <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Reminders will be automatically dispatched to guests via their chosen channel before the event.
        </p>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleSaveReminders}
            disabled={saving}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Reminders</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
