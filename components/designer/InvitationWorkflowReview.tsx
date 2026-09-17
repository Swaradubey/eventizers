"use client";

import React, { useState } from "react";
import {
  MapPin,
  Sparkles,
  ImageIcon,
  RotateCcw,
  RotateCw,
  List,
  ListOrdered,
  Link2,
} from "lucide-react";
import { StudioDesignState } from "./InvitationStudio";
import { RsvpOptionsState, formatTime12 } from "./RsvpOptionsModal";
import { WishlistData, CharityData, PersonalFundData } from "./InvitationWorkflowGifting";
import { HostDetailsData } from "./InvitationWorkflowDetails";

interface InvitationWorkflowReviewProps {
  designState: StudioDesignState;
  rsvpOptions: RsvpOptionsState;
  hostDetails: HostDetailsData;
  wishlists: WishlistData[];
  charities: CharityData[];
  personalFunds: PersonalFundData[];
  selectedGuestCount: number;
  totalGuestCount: number;
  onJumpToStep: (stepIndex: number) => void;
  onDesignStateChange?: (updater: (prev: StudioDesignState) => StudioDesignState) => void;
  onHostDetailsChange?: (updater: (prev: HostDetailsData) => HostDetailsData) => void;
}

const MORE_DETAILS_PILLS = [
  { label: "Share costs", premium: false },
  { label: "Host photo gallery", premium: true },
  { label: "Guest of Honor", premium: false },
  { label: "Event sign-ups", premium: false },
  { label: "Poll", premium: false },
  { label: "Links", premium: false },
  { label: "Wishlist", premium: false },
  { label: "Charity", premium: false },
  { label: "Crowdfunding", premium: false },
  { label: "Where to stay", premium: true },
];

export default function InvitationWorkflowReview({
  designState,
  rsvpOptions,
  hostDetails,
  wishlists,
  charities,
  personalFunds,
  selectedGuestCount,
  totalGuestCount,
  onJumpToStep,
  onDesignStateChange,
  onHostDetailsChange,
}: InvitationWorkflowReviewProps) {
  const { eventDetails } = designState;

  const [titleTouched, setTitleTouched] = useState(false);
  const [dateTimeTouched, setDateTimeTouched] = useState(false);

  const showTitleError = titleTouched && !eventDetails.title?.trim();
  const showDateTimeError = dateTimeTouched && !eventDetails.date;

  const updateEventField = (field: keyof StudioDesignState["eventDetails"], value: string) => {
    if (!onDesignStateChange) return;
    onDesignStateChange((prev) => ({
      ...prev,
      eventDetails: { ...prev.eventDetails, [field]: value },
    }));
  };

  const updateHostField = (field: keyof HostDetailsData, value: string) => {
    if (!onHostDetailsChange) return;
    onHostDetailsChange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-6 sm:p-8 space-y-6 text-slate-800">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Review your Invitation</h1>
        <p className="text-sm text-slate-600 mt-1 mb-6">
          Need to make an update? Edit the details below or click &quot;Edit&quot; on the sections to the left.
        </p>
      </div>

      {/* Core Event Fields */}
      <div className="space-y-4">
        {/* Event Title */}
        <div>
          <input
            type="text"
            placeholder="Event Title*"
            value={eventDetails.title}
            onChange={(e) => updateEventField("title", e.target.value)}
            onBlur={() => setTitleTouched(true)}
            className={`rounded-lg border px-3 py-2.5 w-full text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition ${
              showTitleError ? "border-red-400" : "border-slate-300"
            }`}
          />
          {showTitleError && (
            <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
              <span>&#9888;&#65039;</span> Event title is required
            </p>
          )}
        </div>

        {/* Date & Time */}
        <div>
          <input
            type="datetime-local"
            value={eventDetails.date ? `${eventDetails.date}${eventDetails.time ? `T${eventDetails.time}` : ""}` : ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                const [datePart, timePart] = val.split("T");
                updateEventField("date", datePart);
                if (timePart) updateEventField("time", timePart);
              } else {
                updateEventField("date", "");
                updateEventField("time", "");
              }
            }}
            onBlur={() => setDateTimeTouched(true)}
            placeholder="Date & Time*"
            className={`rounded-lg border px-3 py-2.5 w-full text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition ${
              showDateTimeError ? "border-red-400" : "border-slate-300"
            }`}
          />
          {showDateTimeError && (
            <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
              <span>&#9888;&#65039;</span> Add date and time
            </p>
          )}
        </div>

        {/* Location */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Location"
            value={eventDetails.venue}
            onChange={(e) => updateEventField("venue", e.target.value)}
            className="rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 w-full text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
        </div>

        {/* Host Note Editor */}
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <div className="flex items-center gap-1">
              <button type="button" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition" title="Undo">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition" title="Redo">
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-0.5">
              <button type="button" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 font-bold text-sm transition" title="Bold">B</button>
              <button type="button" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 italic text-sm transition" title="Italic">I</button>
              <button type="button" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition" title="Bullet List">
                <List className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition" title="Numbered List">
                <ListOrdered className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition" title="Link">
                <Link2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-3">
            <label className="block text-xs font-medium text-slate-500 mb-1">Host note</label>
            <textarea
              placeholder="Add specifics like parking info or a reminder that Jerry shouldn't wear flip flops."
              value={eventDetails.description || ""}
              onChange={(e) => updateEventField("description", e.target.value)}
              rows={3}
              className="w-full text-sm text-slate-700 placeholder:text-slate-400 border-0 p-0 focus:ring-0 outline-none resize-none bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="space-y-5">
        {/* Host Details */}
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-4 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Host details</h3>
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <div>
              <p className="font-bold text-sm text-slate-800">{hostDetails.name || "SWARA KUMARI"}</p>
              <p className="text-xs text-slate-500 mt-0.5">Add a phone number and/or co-host</p>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer transition"
            >
              Edit
            </button>
          </div>
        </div>

        {/* RSVP Options */}
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-4 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">RSVP options</h3>
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <div>
              <p className="font-bold text-sm text-slate-800">Manage guest settings</p>
              <p className="text-xs text-slate-500 mt-0.5">Add RSVP deadline, adjust plus ones &amp; more</p>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer transition"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Gifting */}
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-4 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Gifting</h3>
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-500" />
              <p className="font-bold text-sm text-slate-800">Gift guides</p>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="text-sm font-medium text-emerald-800 hover:text-emerald-900 cursor-pointer transition"
            >
              Remove
            </button>
          </div>
        </div>

        {/* Invitation Sections */}
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs p-4 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Invitation sections</h3>
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-500" />
              <div>
                <p className="font-bold text-sm text-slate-800">Shared album</p>
                <p className="text-xs text-slate-500 mt-0.5">Photos will appear on your Invitation.</p>
              </div>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-emerald-800 hover:text-emerald-900 cursor-pointer transition"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Want to include more details? */}
      <div>
        <h3 className="font-semibold text-slate-800 text-base mb-3">Want to include more details?</h3>
        <div className="flex flex-wrap gap-2">
          {MORE_DETAILS_PILLS.map((pill) => (
            <button
              key={pill.label}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <span>+</span>
              <span>{pill.label}</span>
              {pill.premium && <span className="text-xs">&#x1F451;</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
