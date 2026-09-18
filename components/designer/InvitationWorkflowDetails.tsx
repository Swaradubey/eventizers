"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  MapPin,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Camera,
  ImageIcon,
  Bed,
  DollarSign,
  ClipboardList,
  UtensilsCrossed,
  Check,
  X,
  Search,
} from "lucide-react";
import { RsvpOptionsState } from "./RsvpOptionsModal";

export interface HostDetailsData {
  name: string;
  phone?: string;
  coHost?: string;
}

export interface AdditionalSectionsState {
  sharedAlbum: boolean;
  hostPhotoGallery: boolean;
  whereToStay: boolean;
  shareCosts: boolean;
  eventSignUps: boolean;
  mealOptions: boolean;
}

interface InvitationWorkflowDetailsProps {
  title: string;
  eventDate: string;
  eventTime: string;
  location: string;
  hostNote: string;
  hostDetails: HostDetailsData;
  rsvpOptions: RsvpOptionsState;
  additionalSections?: AdditionalSectionsState;
  onUpdateField: (
    field:
      | "title"
      | "eventDate"
      | "eventTime"
      | "location"
      | "hostNote",
    value: string
  ) => void;
  onUpdateHostDetails: (details: HostDetailsData) => void;
  onOpenRsvpOptions: () => void;
  onUpdateAdditionalSections?: (sections: AdditionalSectionsState) => void;
}

const ADDITIONAL_SECTIONS_CONFIG: Array<{
  key: keyof AdditionalSectionsState;
  label: string;
  icon: React.ReactNode;
  premium?: boolean;
}> = [
  { key: "sharedAlbum", label: "Shared album", icon: <Camera className="w-5 h-5" /> },
  { key: "hostPhotoGallery", label: "Host photo gallery", icon: <ImageIcon className="w-5 h-5" />, premium: true },
  { key: "whereToStay", label: "Where to stay", icon: <Bed className="w-5 h-5" />, premium: true },
  { key: "shareCosts", label: "Share costs", icon: <DollarSign className="w-5 h-5" /> },
  { key: "eventSignUps", label: "Event sign-ups", icon: <ClipboardList className="w-5 h-5" /> },
  { key: "mealOptions", label: "Get meal options", icon: <UtensilsCrossed className="w-5 h-5" /> },
];

export default function InvitationWorkflowDetails({
  title,
  eventDate,
  eventTime,
  location,
  hostNote,
  hostDetails,
  rsvpOptions,
  additionalSections,
  onUpdateField,
  onUpdateHostDetails,
  onOpenRsvpOptions,
  onUpdateAdditionalSections,
}: InvitationWorkflowDetailsProps) {
  const [isEditingHost, setIsEditingHost] = useState(false);
  const [hostForm, setHostForm] = useState<HostDetailsData>({ ...hostDetails });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState(location || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSaveHost = () => {
    onUpdateHostDetails(hostForm);
    setIsEditingHost(false);
  };

  const toggleSection = (key: keyof AdditionalSectionsState) => {
    if (!onUpdateAdditionalSections || !additionalSections) return;
    onUpdateAdditionalSections({
      ...additionalSections,
      [key]: !additionalSections[key],
    });
  };

  const applyFormatting = useCallback(
    (command: string, value?: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = hostNote.substring(start, end);

      let newText = hostNote;
      if (command === "bold") {
        newText =
          hostNote.substring(0, start) +
          `**${selected || "bold text"}**` +
          hostNote.substring(end);
      } else if (command === "italic") {
        newText =
          hostNote.substring(0, start) +
          `*${selected || "italic text"}*` +
          hostNote.substring(end);
      } else if (command === "insertUnorderedList") {
        newText =
          hostNote.substring(0, start) +
          `\n• ${selected || "list item"}` +
          hostNote.substring(end);
      } else if (command === "insertOrderedList") {
        newText =
          hostNote.substring(0, start) +
          `\n1. ${selected || "list item"}` +
          hostNote.substring(end);
      } else if (command === "createLink") {
        const url = value || "https://";
        newText =
          hostNote.substring(0, start) +
          `[${selected || "link text"}](${url})` +
          hostNote.substring(end);
      }

      onUpdateField("hostNote", newText);
    },
    [hostNote, onUpdateField]
  );

  const handleLocationSelect = (address: string) => {
    onUpdateField("location", address);
    setIsLocationModalOpen(false);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-white p-4 sm:p-6 space-y-6 text-slate-800">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Edit Invitation details
        </h1>
      </div>

      {/* Form Inputs */}
      <div className="space-y-4">
        {/* Event Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            Event Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdateField("title", e.target.value)}
            placeholder="e.g. Birthday Bash, Wedding Reception"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 transition-colors"
          />
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            Date & Time
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => onUpdateField("eventDate", e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 transition-colors"
              />
            </div>
            <div>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => onUpdateField("eventTime", e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            Location
          </label>
          <button
            type="button"
            onClick={() => {
              setLocationSearch(location || "");
              setIsLocationModalOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-left hover:border-slate-800 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 transition-colors cursor-pointer bg-white"
          >
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className={location ? "text-slate-900" : "text-slate-400"}>
              {location || "Add a location or address"}
            </span>
          </button>
        </div>

        {/* Rich Text / Host Note Editor */}
        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800/10 transition-colors bg-white">
          {/* Toolbar */}
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1 text-slate-600 bg-slate-50/50">
            <button
              type="button"
              onClick={() => applyFormatting("bold")}
              className="p-1.5 rounded-md hover:bg-slate-200/60 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting("italic")}
              className="p-1.5 rounded-md hover:bg-slate-200/60 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button
              type="button"
              onClick={() => applyFormatting("insertUnorderedList")}
              className="p-1.5 rounded-md hover:bg-slate-200/60 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Bulleted list"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting("insertOrderedList")}
              className="p-1.5 rounded-md hover:bg-slate-200/60 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Numbered list"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button
              type="button"
              onClick={() => applyFormatting("createLink", "https://")}
              className="p-1.5 rounded-md hover:bg-slate-200/60 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Insert link"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Host note text area */}
          <div className="p-3.5">
            <span className="block text-[11px] font-semibold text-slate-400 mb-1">
              Host note
            </span>
            <textarea
              ref={textareaRef}
              rows={4}
              value={hostNote}
              onChange={(e) => onUpdateField("hostNote", e.target.value)}
              placeholder="Add specifics like parking info or a reminder that Jerry shouldn't wear flip flops."
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Host Details Section */}
      <div className="space-y-2">
        <h2 className="text-base font-bold text-slate-900">Host details</h2>
        <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              {hostDetails.name || "SWARA KUMARI"}
            </p>
            <p className="text-xs text-slate-500">
              {hostDetails.phone || hostDetails.coHost
                ? `${hostDetails.phone ? `Phone: ${hostDetails.phone}` : ""} ${
                    hostDetails.coHost ? `\u2022 Co-host: ${hostDetails.coHost}` : ""
                  }`
                : "Add a phone number and/or co-host"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setHostForm({ ...hostDetails });
              setIsEditingHost(true);
            }}
            className="text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
          >
            Edit
          </button>
        </div>

        {/* Inline Host Details Editor */}
        {isEditingHost && (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <h3 className="text-xs font-bold text-slate-700">Edit Host Details</h3>
            <div className="grid grid-cols-1 gap-2">
              <input
                type="text"
                value={hostForm.name}
                onChange={(e) => setHostForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Host Name"
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-800"
              />
              <input
                type="text"
                value={hostForm.phone || ""}
                onChange={(e) => setHostForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Host Phone Number"
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-800"
              />
              <input
                type="text"
                value={hostForm.coHost || ""}
                onChange={(e) => setHostForm((p) => ({ ...p, coHost: e.target.value }))}
                placeholder="Co-Host Name(s)"
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-800"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingHost(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200/60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveHost}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-black shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RSVP Settings Card */}
      <div className="border border-slate-200 rounded-xl p-4 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">RSVP settings</h3>
          <button
            type="button"
            onClick={onOpenRsvpOptions}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            Manage settings
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Manage guest settings, privacy, plus ones and more.
        </p>
      </div>

      {/* Add more sections */}
      {additionalSections && onUpdateAdditionalSections && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">Add more sections</h2>
          <div className="grid grid-cols-2 gap-3">
            {ADDITIONAL_SECTIONS_CONFIG.map((section) => {
              const isActive = additionalSections[section.key];
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 transition-all cursor-pointer ${
                    isActive
                      ? "border-emerald-500 bg-emerald-50/80 shadow-sm"
                      : "border-dashed border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  {section.premium && !isActive && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                      ★
                    </div>
                  )}
                  <div className={`transition-colors ${isActive ? "text-emerald-600" : "text-slate-500"}`}>
                    {section.icon}
                  </div>
                  <span className={`text-xs font-semibold text-center leading-tight ${
                    isActive ? "text-emerald-800" : "text-slate-700"
                  }`}>
                    {section.label}
                  </span>
                  {isActive && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection(section.key);
                      }}
                      className="mt-1 px-3 py-1 rounded-lg text-[10px] font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shadow-xs"
                    >
                      Remove
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Location Picker Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Select Location</h3>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Search for a venue or enter address"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800/10 transition-colors"
                />
              </div>

              {/* Quick Location Presets */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quick options
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Home", "Restaurant", "Park", "Office", "Online / Virtual"].map(
                    (preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setLocationSearch(preset)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleLocationSelect(locationSearch)}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-black shadow-xs transition-colors"
              >
                Set Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
