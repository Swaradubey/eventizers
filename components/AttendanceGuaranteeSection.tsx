"use client";

import React, { useEffect, useState, useRef } from "react";
import { ShieldCheck, Clock, ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import securityService from "../services/securityService";
import { AttendanceGuaranteeSettings } from "../types/securityTypes";

interface AttendanceGuaranteeSectionProps {
  onToast?: (message: string, type?: "success" | "error") => void;
}

export default function AttendanceGuaranteeSection({
  onToast,
}: AttendanceGuaranteeSectionProps) {
  const [settings, setSettings] = useState<AttendanceGuaranteeSettings>({
    isEnabled: true,
    guaranteeAmount: 25,
    reviewWindowDays: 7,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [amountInput, setAmountInput] = useState<string>("25");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const reviewOptions = [
    { label: "3 days", value: 3 },
    { label: "5 days", value: 5 },
    { label: "7 days (default)", value: 7 },
    { label: "14 days", value: 14 },
    { label: "30 days", value: 30 },
  ];

  // Fetch settings on mount
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await securityService.getAttendanceGuarantee();
        if (res?.success && res.data && isMounted) {
          setSettings({
            isEnabled: Boolean(res.data.isEnabled),
            guaranteeAmount: Number(res.data.guaranteeAmount) || 25,
            reviewWindowDays: Number(res.data.reviewWindowDays) || 7,
          });
          setAmountInput(String(res.data.guaranteeAmount ?? 25));
        }
      } catch (err: any) {
        console.error("Failed to load attendance guarantee settings:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Save settings helper
  const handleSave = async (updates: Partial<AttendanceGuaranteeSettings>) => {
    const previous = { ...settings };
    const updated = { ...settings, ...updates };
    setSettings(updated);
    setSaving(true);

    try {
      const res = await securityService.updateAttendanceGuarantee(updates);
      if (res?.success && res.data) {
        setSettings({
          isEnabled: Boolean(res.data.isEnabled),
          guaranteeAmount: Number(res.data.guaranteeAmount) || updated.guaranteeAmount,
          reviewWindowDays: Number(res.data.reviewWindowDays) || updated.reviewWindowDays,
        });
        if (onToast) {
          onToast(res.message || "Attendance guarantee settings updated successfully.", "success");
        }
      } else {
        throw new Error(res?.message || "Failed to update attendance guarantee settings");
      }
    } catch (err: any) {
      console.error("Error updating attendance guarantee settings:", err);
      setSettings(previous);
      setAmountInput(String(previous.guaranteeAmount));
      if (onToast) {
        onToast(err.response?.data?.error || err.message || "Failed to save attendance guarantee settings.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = () => {
    handleSave({ isEnabled: !settings.isEnabled });
  };

  const handleAmountBlur = () => {
    const parsed = parseFloat(amountInput);
    const validAmount = isNaN(parsed) || parsed < 0 ? 25 : Math.round(parsed * 100) / 100;
    setAmountInput(String(validAmount));
    if (validAmount !== settings.guaranteeAmount) {
      handleSave({ guaranteeAmount: validAmount });
    }
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleSelectWindow = (days: number) => {
    setIsDropdownOpen(false);
    if (days !== settings.reviewWindowDays) {
      handleSave({ reviewWindowDays: days });
    }
  };

  const selectedOptionLabel =
    reviewOptions.find((opt) => opt.value === settings.reviewWindowDays)?.label ||
    `${settings.reviewWindowDays} days`;

  const steps = [
    {
      num: 1,
      title: "RSVP Deadline",
      description: "Guests confirm attendance",
    },
    {
      num: 2,
      title: "Confirmation",
      description: "GPS verifies arrival",
    },
    {
      num: 3,
      title: `Review (${settings.reviewWindowDays}d)`,
      description: "Host reviews no-shows",
    },
    {
      num: 4,
      title: "Charge or Waive",
      description: "Decide each case fairly",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/95 backdrop-blur-sm border border-blue-100/60 rounded-2xl md:rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200 mt-8 font-body text-slate-800"
    >
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50/80 border border-indigo-100/60 flex items-center justify-center text-[#5B5FEF] shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#5B5FEF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-display">
                Attendance guarantee
              </h3>
              {saving && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Reduce no-shows with a fair review and charge flow
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={settings.isEnabled}
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
            settings.isEnabled ? "bg-[#5B5FEF]" : "bg-slate-300"
          } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <span className="sr-only">Toggle Attendance Guarantee</span>
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              settings.isEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Main Body - Dimmed when disabled */}
      <div
        className={`transition-all duration-300 ${
          !settings.isEnabled ? "opacity-40 pointer-events-none select-none" : "opacity-100"
        }`}
      >
        {/* Form Controls (2-Column Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-7">
          {/* Guarantee Amount */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <span className="font-semibold text-slate-800 text-sm">$</span>
              <span>Guarantee Amount</span>
            </label>
            <div className="relative flex items-center bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <span className="text-slate-500 font-medium text-sm select-none mr-1.5">$</span>
              <input
                type="number"
                min="0"
                step="1"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                onBlur={handleAmountBlur}
                onKeyDown={handleAmountKeyDown}
                disabled={!settings.isEnabled || loading}
                className="w-full bg-transparent text-slate-800 font-medium text-sm outline-none placeholder:text-slate-400"
                placeholder="25"
              />
            </div>
          </div>

          {/* Host Review Window */}
          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <Clock className="w-4 h-4 text-slate-700" />
              <span>Host Review Window</span>
            </label>
            <button
              type="button"
              onClick={() => settings.isEnabled && setIsDropdownOpen(!isDropdownOpen)}
              disabled={!settings.isEnabled || loading}
              className="w-full flex items-center justify-between bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 shadow-sm text-left font-medium text-sm text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <span>{selectedOptionLabel}</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg py-1 text-sm overflow-hidden"
                >
                  {reviewOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectWindow(opt.value)}
                      className={`w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between ${
                        opt.value === settings.reviewWindowDays
                          ? "bg-indigo-50/80 text-indigo-700 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {opt.value === settings.reviewWindowDays && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 4-Step Process Flow (Horizontal Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-9 pt-2">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col items-start">
              {/* Solid Blue Circle Number Badge */}
              <div className="w-8 h-8 rounded-full bg-[#3B82F6] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {step.num}
              </div>
              <h4 className="font-bold text-slate-900 text-sm mt-3 font-display">
                {step.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 pt-5 border-t border-slate-100/80">
        <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
          Guests may modify their RSVP anytime before the deadline. Hosts may review no-shows for up to 7 days after the event.
        </p>
      </div>
    </motion.div>
  );
}
