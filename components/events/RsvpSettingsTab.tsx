"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Calendar as CalendarIcon,
  ChevronDown,
  Check,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  Loader2,
  HelpCircle,
} from "lucide-react";
import eventService, {
  RsvpSettingsData,
  CustomQuestion,
} from "@/services/eventService";

interface RsvpSettingsTabProps {
  eventId: string;
  initialSettings?: RsvpSettingsData | null;
  onSaveSuccess?: (updatedSettings: RsvpSettingsData) => void;
  showToast?: (text: string, type?: "success" | "error") => void;
}

export default function RsvpSettingsTab({
  eventId,
  initialSettings,
  onSaveSuccess,
  showToast,
}: RsvpSettingsTabProps) {
  // RSVP State matching the backend schema
  const [settings, setSettings] = useState<RsvpSettingsData>({
    rsvpDeadline: null,
    allowPlusOnes: true,
    maxPlusOnes: 1,
    allowMaybeResponse: false,
    requirePhoneNumber: false,
    collectDietaryRestrictions: false,
    collectMealPreference: false,
    collectSongRequests: false,
    customQuestions: [],
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deadlineDisplay, setDeadlineDisplay] = useState("");

  // Question Modal state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("text");

  const dateInputRef = useRef<HTMLInputElement>(null);

  // Helper to format ISO YYYY-MM-DD to DD-MM-YYYY
  const formatIsoToDisplay = (isoStr: string | null): string => {
    if (!isoStr) return "";
    // Clean string (e.g. if time component exists)
    const cleaned = isoStr.split("T")[0];
    const parts = cleaned.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      if (year.length === 4) {
        return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
      }
    }
    return isoStr;
  };

  // Helper to format DD-MM-YYYY to ISO YYYY-MM-DD for native input
  const formatDisplayToIso = (displayStr: string): string => {
    if (!displayStr) return "";
    const parts = displayStr.split("-");
    if (parts.length === 3 && parts[2].length === 4) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return displayStr;
  };

  // Pre-fill on mount or when initialSettings changes
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
      setDeadlineDisplay(formatIsoToDisplay(initialSettings.rsvpDeadline));
    } else if (eventId) {
      // Fetch directly from backend
      const fetchSettings = async () => {
        setLoading(true);
        try {
          const res = await eventService.getRsvpSettings(eventId);
          if (res && res.success && res.rsvpSettings) {
            setSettings(res.rsvpSettings);
            setDeadlineDisplay(formatIsoToDisplay(res.rsvpSettings.rsvpDeadline));
          }
        } catch (err) {
          console.error("Failed to load RSVP settings:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchSettings();
    }
  }, [eventId, initialSettings]);

  // Date change handler
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value; // YYYY-MM-DD
    setSettings((prev) => ({ ...prev, rsvpDeadline: isoVal || null }));
    setDeadlineDisplay(formatIsoToDisplay(isoVal));
  };

  // Manual display text edit or paste (supports typing dd-mm-yyyy)
  const handleDisplayDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDeadlineDisplay(val);
    const iso = formatDisplayToIso(val);
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      setSettings((prev) => ({ ...prev, rsvpDeadline: iso }));
    } else if (!val.trim()) {
      setSettings((prev) => ({ ...prev, rsvpDeadline: null }));
    }
  };

  // Checkbox toggle helper
  const toggleSetting = (key: keyof RsvpSettingsData) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Max plus ones dropdown change
  const handleMaxPlusOnesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10) || 1;
    setSettings((prev) => ({ ...prev, maxPlusOnes: val }));
  };

  // Save changes to backend
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await eventService.updateRsvpSettings(eventId, settings);
      if (res && res.success) {
        if (showToast) {
          showToast("RSVP settings saved successfully!", "success");
        }
        if (onSaveSuccess) {
          onSaveSuccess(res.rsvpSettings || settings);
        }
      } else {
        throw new Error(res?.message || "Failed to save settings");
      }
    } catch (err: any) {
      console.error("Save RSVP settings error:", err);
      if (showToast) {
        showToast(
          err.response?.data?.error || err.message || "Failed to save RSVP settings",
          "error"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // Custom question helpers
  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQuestionText("");
    setQuestionType("text");
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: CustomQuestion) => {
    setEditingQuestionId(q.id);
    setQuestionText(q.question);
    setQuestionType(q.type || "text");
    setIsQuestionModalOpen(true);
  };

  const handleDeleteQuestion = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((q) => q.id !== id),
    }));
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    if (editingQuestionId) {
      // Edit existing
      setSettings((prev) => ({
        ...prev,
        customQuestions: prev.customQuestions.map((q) =>
          q.id === editingQuestionId
            ? { ...q, question: questionText.trim(), type: questionType }
            : q
        ),
      }));
    } else {
      // Add new
      const newQuestion: CustomQuestion = {
        id: `cq-${Date.now()}`,
        question: questionText.trim(),
        type: questionType,
      };
      setSettings((prev) => ({
        ...prev,
        customQuestions: [...prev.customQuestions, newQuestion],
      }));
    }

    setIsQuestionModalOpen(false);
    setQuestionText("");
    setEditingQuestionId(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading RSVP settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* SECTION A: "RSVP settings" Card                                           */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-6 transition-all">
        {/* Card Header */}
        <div className="flex items-center gap-2.5">
          <Users className="w-6 h-6 text-[#6366f1] stroke-[2.2]" />
          <h2 className="text-xl font-bold text-[#1e1b4b] tracking-tight">RSVP settings</h2>
        </div>

        {/* RSVP Deadline Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            RSVP Deadline
          </label>
          <div className="relative w-full max-w-full">
            {/* Display / Typed Input */}
            <input
              type="text"
              placeholder="dd-mm-yyyy"
              value={deadlineDisplay}
              onChange={handleDisplayDateChange}
              onClick={() => {
                if (dateInputRef.current) {
                  try {
                    (dateInputRef.current as any).showPicker();
                  } catch {
                    dateInputRef.current.focus();
                  }
                }
              }}
              className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            />
            {/* Hidden Native Date Input overlaid for calendar picking */}
            <input
              ref={dateInputRef}
              type="date"
              value={settings.rsvpDeadline ? settings.rsvpDeadline.split("T")[0] : ""}
              onChange={handleDateChange}
              tabIndex={-1}
              className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
            />
            {/* Calendar Icon on right */}
            <button
              type="button"
              onClick={() => {
                if (dateInputRef.current) {
                  try {
                    (dateInputRef.current as any).showPicker();
                  } catch {
                    dateInputRef.current.focus();
                  }
                }
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 transition-colors p-1"
              aria-label="Open calendar picker"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7 pt-1">
          {/* Left Column Item 1: Allow Plus Ones */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={settings.allowPlusOnes}
              onClick={() => toggleSetting("allowPlusOnes")}
              className={`w-5 h-5 mt-0.5 rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all cursor-pointer select-none ${
                settings.allowPlusOnes
                  ? "bg-[#0066ff] text-white shadow-xs"
                  : "border-2 border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              {settings.allowPlusOnes && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            <div
              className="cursor-pointer select-none"
              onClick={() => toggleSetting("allowPlusOnes")}
            >
              <p className="text-sm font-bold text-slate-900 leading-tight">Allow Plus Ones</p>
              <p className="text-xs text-slate-500 mt-1">Guests can bring additional guests</p>
            </div>
          </div>

          {/* Right Column Item 1: Max Plus Ones Per Guest (Rendered when Allow Plus Ones is enabled) */}
          <div>
            {settings.allowPlusOnes ? (
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-900 leading-tight">
                  Max Plus Ones Per Guest
                </label>
                <div className="relative inline-block w-full max-w-[240px]">
                  <select
                    value={settings.maxPlusOnes}
                    onChange={handleMaxPlusOnesChange}
                    className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-sm font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-9 transition-all cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[48px]" />
            )}
          </div>

          {/* Left Column Item 2: Allow "Maybe" Response */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={settings.allowMaybeResponse}
              onClick={() => toggleSetting("allowMaybeResponse")}
              className={`w-5 h-5 mt-0.5 rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all cursor-pointer select-none ${
                settings.allowMaybeResponse
                  ? "bg-[#0066ff] text-white shadow-xs"
                  : "border-2 border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              {settings.allowMaybeResponse && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            <div
              className="cursor-pointer select-none"
              onClick={() => toggleSetting("allowMaybeResponse")}
            >
              <p className="text-sm font-bold text-slate-900 leading-tight">
                Allow &quot;Maybe&quot; Response
              </p>
              <p className="text-xs text-slate-500 mt-1">Guests can respond with uncertainty</p>
            </div>
          </div>

          {/* Right Column Item 2: Require Phone Number */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={settings.requirePhoneNumber}
              onClick={() => toggleSetting("requirePhoneNumber")}
              className={`w-5 h-5 mt-0.5 rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all cursor-pointer select-none ${
                settings.requirePhoneNumber
                  ? "bg-[#0066ff] text-white shadow-xs"
                  : "border-2 border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              {settings.requirePhoneNumber && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            <div
              className="cursor-pointer select-none"
              onClick={() => toggleSetting("requirePhoneNumber")}
            >
              <p className="text-sm font-bold text-slate-900 leading-tight">Require Phone Number</p>
              <p className="text-xs text-slate-500 mt-1">Phone number is mandatory</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION B: "Collect additional information" Card                          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-6 transition-all">
        <h3 className="text-lg font-bold text-[#1e1b4b] tracking-tight">
          Collect additional information
        </h3>

        <div className="space-y-5">
          {/* Item 1: Dietary Restrictions */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={settings.collectDietaryRestrictions}
              onClick={() => toggleSetting("collectDietaryRestrictions")}
              className={`w-5 h-5 mt-0.5 rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all cursor-pointer select-none ${
                settings.collectDietaryRestrictions
                  ? "bg-[#0066ff] text-white shadow-xs"
                  : "border-2 border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              {settings.collectDietaryRestrictions && (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              )}
            </button>
            <div
              className="cursor-pointer select-none"
              onClick={() => toggleSetting("collectDietaryRestrictions")}
            >
              <p className="text-sm font-bold text-slate-900 leading-tight">Dietary Restrictions</p>
              <p className="text-xs text-slate-500 mt-1">
                Ask guests about food allergies or dietary needs
              </p>
            </div>
          </div>

          {/* Item 2: Meal Preference */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={settings.collectMealPreference}
              onClick={() => toggleSetting("collectMealPreference")}
              className={`w-5 h-5 mt-0.5 rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all cursor-pointer select-none ${
                settings.collectMealPreference
                  ? "bg-[#0066ff] text-white shadow-xs"
                  : "border-2 border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              {settings.collectMealPreference && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            <div
              className="cursor-pointer select-none"
              onClick={() => toggleSetting("collectMealPreference")}
            >
              <p className="text-sm font-bold text-slate-900 leading-tight">Meal Preference</p>
              <p className="text-xs text-slate-500 mt-1">Let guests choose their meal option</p>
            </div>
          </div>

          {/* Item 3: Song Requests */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={settings.collectSongRequests}
              onClick={() => toggleSetting("collectSongRequests")}
              className={`w-5 h-5 mt-0.5 rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all cursor-pointer select-none ${
                settings.collectSongRequests
                  ? "bg-[#0066ff] text-white shadow-xs"
                  : "border-2 border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              {settings.collectSongRequests && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            <div
              className="cursor-pointer select-none"
              onClick={() => toggleSetting("collectSongRequests")}
            >
              <p className="text-sm font-bold text-slate-900 leading-tight">Song Requests</p>
              <p className="text-xs text-slate-500 mt-1">
                Let guests suggest songs for the playlist
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION C: "Custom questions" Card                                        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-6 transition-all">
        {/* Card Header Row */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1e1b4b] tracking-tight">Custom questions</h3>
          <button
            type="button"
            onClick={handleOpenAddQuestion}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#f0efff] hover:bg-[#e6e4ff] text-[#6366f1] font-semibold text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>

        {/* Questions Body */}
        {settings.customQuestions.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400 font-normal">
            No custom questions added yet
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {settings.customQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/70 rounded-2xl transition-all"
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">
                      {q.type === "select"
                        ? "Choice"
                        : q.type === "boolean"
                        ? "Yes / No"
                        : "Text response"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{q.question}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditQuestion(q)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title="Edit question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4f46e5] via-[#3b82f6] to-[#06b6d4] text-white text-sm font-semibold shadow-md shadow-blue-500/25 hover:opacity-95 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Save className="w-4 h-4 text-white" />
          )}
          <span>{saving ? "Saving RSVP Settings..." : "Save RSVP Settings"}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT QUESTION MODAL                                                 */}
      {/* ========================================================================= */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingQuestionId ? "Edit Custom Question" : "Add Custom Question"}
              </h3>
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Question Text
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Do you need shuttle transportation from the hotel?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Answer Type
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="text">Short Text Response</option>
                  <option value="boolean">Yes / No Toggle</option>
                  <option value="select">Choice / Options</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all"
                >
                  {editingQuestionId ? "Update Question" : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
