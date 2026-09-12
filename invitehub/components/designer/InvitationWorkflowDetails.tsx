"use client";

import React, { useState } from "react";
import {
  MapPin,
  Undo2,
  Redo2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  X,
  Check,
} from "lucide-react";
import { RsvpOptionsState } from "./RsvpOptionsModal";

export interface HostDetailsData {
  name: string;
  phone?: string;
  coHost?: string;
}

interface InvitationWorkflowDetailsProps {
  title: string;
  dateTime: string;
  location: string;
  hostNote: string;
  hostDetails: HostDetailsData;
  rsvpOptions: RsvpOptionsState;
  onUpdateField: (field: "title" | "dateTime" | "location" | "hostNote", value: string) => void;
  onUpdateHostDetails: (details: HostDetailsData) => void;
  onOpenRsvpOptions: () => void;
}

export default function InvitationWorkflowDetails({
  title,
  dateTime,
  location,
  hostNote,
  hostDetails,
  rsvpOptions,
  onUpdateField,
  onUpdateHostDetails,
  onOpenRsvpOptions,
}: InvitationWorkflowDetailsProps) {
  const [isEditingHost, setIsEditingHost] = useState(false);
  const [hostForm, setHostForm] = useState<HostDetailsData>({ ...hostDetails });

  const handleSaveHost = () => {
    onUpdateHostDetails(hostForm);
    setIsEditingHost(false);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-white p-4 sm:p-6 space-y-6 text-slate-800">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Edit Invitation details
        </h1>
      </div>

      {/* 3. Form Inputs */}
      <div className="space-y-4">
        {/* Event Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdateField("title", e.target.value)}
            placeholder="Event Title*"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 transition-colors"
          />
        </div>

        {/* Date & Time */}
        <div>
          <input
            type="text"
            value={dateTime}
            onChange={(e) => onUpdateField("dateTime", e.target.value)}
            placeholder="Date & Time*"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 transition-colors"
          />
        </div>

        {/* Location */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4 text-slate-700" />
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => onUpdateField("location", e.target.value)}
            placeholder="Location"
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 transition-colors"
          />
        </div>

        {/* Rich Text / Host Note Editor */}
        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-slate-800 transition-colors bg-white">
          {/* Toolbar */}
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between text-slate-600 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-1 rounded hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Undo"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Redo"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onUpdateField("hostNote", hostNote ? `**${hostNote}**` : "");
                }}
                className="p-1 rounded hover:bg-slate-200/60 font-bold text-slate-700 hover:text-slate-900 text-xs cursor-pointer"
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateField("hostNote", hostNote ? `*${hostNote}*` : "");
                }}
                className="p-1 rounded hover:bg-slate-200/60 italic text-slate-700 hover:text-slate-900 text-xs cursor-pointer"
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-slate-200/60 text-slate-700 hover:text-slate-900 cursor-pointer"
                title="Bulleted list"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-slate-200/60 text-slate-700 hover:text-slate-900 cursor-pointer"
                title="Numbered list"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-slate-200/60 text-slate-700 hover:text-slate-900 cursor-pointer"
                title="Link"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Subtitle / Host note text area */}
          <div className="p-3.5">
            <span className="block text-[11px] font-semibold text-slate-400 mb-1">
              Host note
            </span>
            <textarea
              rows={3}
              value={hostNote}
              onChange={(e) => onUpdateField("hostNote", e.target.value)}
              placeholder="Add specifics like parking info or a reminder that Jerry shouldn't wear flip flops."
              className="w-full text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Host Details Section */}
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
                    hostDetails.coHost ? `• Co-host: ${hostDetails.coHost}` : ""
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

        {/* Inline Host Details Editor Modal/Drawer */}
        {isEditingHost && (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 animate-in fade-in">
            <h3 className="text-xs font-bold text-slate-700">Edit Host Details</h3>
            <div className="grid grid-cols-1 gap-2">
              <input
                type="text"
                value={hostForm.name}
                onChange={(e) => setHostForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Host Name"
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
              />
              <input
                type="text"
                value={hostForm.phone || ""}
                onChange={(e) => setHostForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Host Phone Number"
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
              />
              <input
                type="text"
                value={hostForm.coHost || ""}
                onChange={(e) => setHostForm((p) => ({ ...p, coHost: e.target.value }))}
                placeholder="Co-Host Name(s)"
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
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

      {/* 5. RSVP Settings Card */}
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
    </div>
  );
}
