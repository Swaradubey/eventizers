"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface RsvpOptionsState {
  deadlineEnabled: boolean;
  deadlineDate?: string;
  deadlineTime?: string;
  allowAfterDeadline: boolean;
  allowMaybe: boolean;
  privateGuestList: boolean;
  allowGuestsToBringAnyone: boolean;
  maxAdditionalGuests: number;
}

/**
 * Parses saved date & time into separate YYYY-MM-DD and HH:mm formats.
 */
export function parseDeadline(
  savedDate?: string | Date | null,
  savedTime?: string | null
): { date: string; time: string } {
  if (!savedDate) {
    return { date: "", time: savedTime || "" };
  }

  if (savedDate instanceof Date) {
    if (isNaN(savedDate.getTime())) return { date: "", time: savedTime || "" };
    const dateStr = `${savedDate.getFullYear()}-${String(savedDate.getMonth() + 1).padStart(2, "0")}-${String(savedDate.getDate()).padStart(2, "0")}`;
    const timeStr =
      savedTime ||
      `${String(savedDate.getHours()).padStart(2, "0")}:${String(savedDate.getMinutes()).padStart(2, "0")}`;
    return { date: dateStr, time: timeStr };
  }

  const str = String(savedDate).trim();
  if (!str) return { date: "", time: savedTime || "" };

  if (str.includes("T")) {
    const [dPart, tPart] = str.split("T");
    const dateStr = dPart;
    let timeStr = savedTime || "";
    if (!timeStr && tPart) {
      const cleanTime = tPart.split(".")[0].replace("Z", "");
      const timeComponents = cleanTime.split(":");
      if (timeComponents.length >= 2) {
        timeStr = `${timeComponents[0].padStart(2, "0")}:${timeComponents[1].padStart(2, "0")}`;
      }
    }
    return { date: dateStr, time: timeStr };
  }

  if (str.includes(" ")) {
    const [dPart, tPart] = str.split(" ");
    const dateStr = dPart;
    let timeStr = savedTime || "";
    if (!timeStr && tPart) {
      const timeComponents = tPart.split(":");
      if (timeComponents.length >= 2) {
        timeStr = `${timeComponents[0].padStart(2, "0")}:${timeComponents[1].padStart(2, "0")}`;
      }
    }
    return { date: dateStr, time: timeStr };
  }

  return { date: str, time: savedTime || "" };
}

/**
 * Combines date string (YYYY-MM-DD) and time string (HH:mm) into an ISO UTC timestamp.
 */
export function combineDateTimeToIso(dateStr?: string, timeStr?: string): string | null {
  if (!dateStr) return null;
  const time = timeStr && timeStr.trim() ? timeStr.trim() : "23:59";
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (!year || !month || !day) return null;

  const d = new Date(year, month - 1, day, hour || 0, minute || 0, 0, 0);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

/**
 * Formats a 24h time string (HH:mm) into a user-friendly 12h format (hh:mm A/PM).
 */
export function formatTime12(timeStr?: string): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

interface RsvpOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: RsvpOptionsState;
  onSave: (options: RsvpOptionsState) => Promise<void> | void;
  defaultTime?: string;
}

export default function RsvpOptionsModal({
  isOpen,
  onClose,
  options,
  onSave,
  defaultTime = "23:59",
}: RsvpOptionsModalProps) {
  const initOptions = (opts: RsvpOptionsState): RsvpOptionsState => {
    const parsed = parseDeadline(opts.deadlineDate, opts.deadlineTime);
    return {
      ...opts,
      deadlineDate: parsed.date,
      deadlineTime: parsed.time || (parsed.date && opts.deadlineEnabled ? (defaultTime || "23:59") : parsed.time || ""),
    };
  };

  const [localOptions, setLocalOptions] = useState<RsvpOptionsState>(() => initOptions(options));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalOptions(initOptions(options));
    }
  }, [isOpen, options, defaultTime]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof RsvpOptionsState) => {
    setLocalOptions((prev) => {
      const nextVal = !prev[key];
      const updates: Partial<RsvpOptionsState> = { [key]: nextVal };
      if (key === "deadlineEnabled" && nextVal && prev.deadlineDate && !prev.deadlineTime) {
        updates.deadlineTime = defaultTime || "23:59";
      }
      return {
        ...prev,
        ...updates,
      };
    });
  };

  const handleDateChange = (val: string) => {
    setLocalOptions((prev) => ({
      ...prev,
      deadlineDate: val,
      deadlineTime: prev.deadlineTime || (val ? (defaultTime || "23:59") : ""),
    }));
  };

  const handleTimeChange = (val: string) => {
    setLocalOptions((prev) => ({
      ...prev,
      deadlineTime: val,
    }));
  };

  const handleDone = async () => {
    try {
      setIsSaving(true);
      const finalOptions: RsvpOptionsState = {
        ...localOptions,
        deadlineTime:
          localOptions.deadlineEnabled && localOptions.deadlineDate && !localOptions.deadlineTime
            ? (defaultTime || "23:59")
            : localOptions.deadlineTime,
      };
      await onSave(finalOptions);
      onClose();
    } catch (err) {
      // Keep modal open and edits intact if request fails
      console.error("Failed to save RSVP options:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800 border border-slate-100 max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">RSVP options</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Options List */}
          <div className="px-6 py-2 overflow-y-auto space-y-6 divide-y divide-slate-100">
            {/* 1. RSVP deadline */}
            <div className="pt-2 flex items-start justify-between gap-4">
              <div className="space-y-1 pr-2 flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900">RSVP deadline</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Set a reply-by date and select if guests can still RSVP after the deadline.
                </p>
                {localOptions.deadlineEnabled && (
                  <div className="mt-3 pt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <input
                          type="date"
                          value={localOptions.deadlineDate || ""}
                          onChange={(e) => handleDateChange(e.target.value)}
                          aria-label="RSVP deadline date"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-800 transition-colors"
                        />
                      </div>
                      <div className="w-32 shrink-0">
                        <input
                          type="time"
                          value={localOptions.deadlineTime || ""}
                          onChange={(e) => handleTimeChange(e.target.value)}
                          aria-label="RSVP deadline time"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-800 transition-colors"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-0.5">
                      <input
                        type="checkbox"
                        checked={localOptions.allowAfterDeadline}
                        onChange={(e) =>
                          setLocalOptions((prev) => ({
                            ...prev,
                            allowAfterDeadline: e.target.checked,
                          }))
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Allow RSVPs after deadline has passed</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => handleToggle("deadlineEnabled")}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none items-center ${
                  localOptions.deadlineEnabled ? "bg-[#3e5622]" : "bg-slate-400"
                }`}
              >
                <span
                  className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    localOptions.deadlineEnabled ? "translate-x-6 text-[#3e5622]" : "translate-x-1 text-slate-400"
                  }`}
                >
                  {localOptions.deadlineEnabled ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                </span>
              </button>
            </div>

            {/* 2. Allow "Maybe" RSVPs */}
            <div className="pt-5 flex items-start justify-between gap-4">
              <div className="space-y-1 pr-2">
                <h3 className="text-sm font-semibold text-slate-900">Allow &quot;Maybe&quot; RSVPs</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  For the guests with commitment issues.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleToggle("allowMaybe")}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none items-center ${
                  localOptions.allowMaybe ? "bg-[#3e5622]" : "bg-slate-400"
                }`}
              >
                <span
                  className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    localOptions.allowMaybe ? "translate-x-6 text-[#3e5622]" : "translate-x-1 text-slate-400"
                  }`}
                >
                  {localOptions.allowMaybe ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                </span>
              </button>
            </div>

            {/* 3. Private guest list */}
            <div className="pt-5 flex items-start justify-between gap-4">
              <div className="space-y-1 pr-2">
                <h3 className="text-sm font-semibold text-slate-900">Private guest list</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Only the host can see the guest list.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleToggle("privateGuestList")}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none items-center ${
                  localOptions.privateGuestList ? "bg-[#3e5622]" : "bg-slate-400"
                }`}
              >
                <span
                  className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    localOptions.privateGuestList ? "translate-x-6 text-[#3e5622]" : "translate-x-1 text-slate-400"
                  }`}
                >
                  {localOptions.privateGuestList ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                </span>
              </button>
            </div>

            {/* 4. Allow guests to bring anyone */}
            <div className="pt-5 flex items-start justify-between gap-4">
              <div className="space-y-1 pr-2">
                <h3 className="text-sm font-semibold text-slate-900">Allow guests to bring anyone</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Let anyone invited include additional guests when they RSVP.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleToggle("allowGuestsToBringAnyone")}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none items-center ${
                  localOptions.allowGuestsToBringAnyone ? "bg-[#3e5622]" : "bg-slate-400"
                }`}
              >
                <span
                  className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    localOptions.allowGuestsToBringAnyone ? "translate-x-6 text-[#3e5622]" : "translate-x-1 text-slate-400"
                  }`}
                >
                  {localOptions.allowGuestsToBringAnyone ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                </span>
              </button>
            </div>

            {/* 5. Max number of additional guests per RSVP */}
            <div className="pt-5 flex items-center justify-between gap-4 pb-2">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-slate-900">
                  Max number of additional guests per RSVP
                </h3>
              </div>

              <div className="relative">
                <select
                  value={localOptions.maxAdditionalGuests}
                  onChange={(e) =>
                    setLocalOptions((prev) => ({
                      ...prev,
                      maxAdditionalGuests: parseInt(e.target.value, 10),
                    }))
                  }
                  className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2 pr-8 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      +{num}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-5 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleDone}
              className="px-8 py-2.5 rounded-full bg-[#3e5622] hover:bg-[#32481b] text-white text-sm font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? "Saving..." : "Done"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
