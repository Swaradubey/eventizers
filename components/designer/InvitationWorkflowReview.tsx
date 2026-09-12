"use client";

import React from "react";
import {
  Calendar,
  MapPin,
  Send,
  Share2,
  Users,
  CheckCircle2,
  Gift,
  HeartHandshake,
  ShieldCheck,
  Edit3,
} from "lucide-react";
import { StudioDesignState } from "./InvitationStudio";
import { RsvpOptionsState } from "./RsvpOptionsModal";
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
  onSendInvitations: () => void;
  onShareWhatsApp: () => void;
  onJumpToStep: (stepIndex: number) => void;
}

export default function InvitationWorkflowReview({
  designState,
  rsvpOptions,
  hostDetails,
  wishlists,
  charities,
  personalFunds,
  selectedGuestCount,
  totalGuestCount,
  onSendInvitations,
  onShareWhatsApp,
  onJumpToStep,
}: InvitationWorkflowReviewProps) {
  const { eventDetails } = designState;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-6 sm:p-8 space-y-6 text-slate-800">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Review &amp; Send</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Double check your invitation details before sharing with guests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onShareWhatsApp}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={onSendInvitations}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#3e5622] hover:bg-[#32481b] rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Invitations ({selectedGuestCount})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Event Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Event Details
            </h2>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div>
              <span className="block text-[11px] font-semibold text-slate-400">Title</span>
              <span className="text-sm font-bold text-slate-900">
                {eventDetails.title || "Untitled Celebration"}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Calendar className="w-4 h-4 text-[#3e5622]" />
              <span className="font-semibold text-slate-800">
                {eventDetails.date || "Date TBD"} at {eventDetails.time || "Time TBD"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#3e5622]" />
              <span className="font-semibold text-slate-800">
                {eventDetails.venue || eventDetails.address || "Location TBD"}
              </span>
            </div>
            {eventDetails.description && (
              <div className="pt-2 border-t border-slate-100">
                <span className="block text-[11px] font-semibold text-slate-400 mb-0.5">
                  Host Note:
                </span>
                <p className="italic text-slate-700">{eventDetails.description}</p>
              </div>
            )}
            <div className="pt-1">
              <span className="block text-[11px] font-semibold text-slate-400">Host:</span>
              <span className="font-bold text-slate-800">{hostDetails.name || "Swara Kumari"}</span>
              {hostDetails.coHost && (
                <span className="text-slate-500"> (Co-host: {hostDetails.coHost})</span>
              )}
            </div>
          </div>
        </div>

        {/* 2. RSVP & Guest Settings Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              RSVP &amp; Privacy
            </h2>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">RSVP Deadline</span>
              <span className="font-bold text-slate-800">
                {rsvpOptions.deadlineEnabled
                  ? rsvpOptions.deadlineDate || "Enabled"
                  : "None set"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Allow &quot;Maybe&quot; response</span>
              <span className="font-bold text-slate-800">
                {rsvpOptions.allowMaybe ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Guest List Visibility</span>
              <span className="font-bold text-slate-800">
                {rsvpOptions.privateGuestList ? "Private (Host only)" : "Public"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Plus-Ones Allowed</span>
              <span className="font-bold text-slate-800">
                {rsvpOptions.allowGuestsToBringAnyone ? `Yes (up to +${rsvpOptions.maxAdditionalGuests})` : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Guests Selected for Email</span>
              <span className="font-bold text-emerald-700">
                {selectedGuestCount} of {totalGuestCount} guests
              </span>
            </div>
          </div>
        </div>

        {/* 3. Gifting & Causes Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Gifting, Registry &amp; Charities
            </h2>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                <Gift className="w-3.5 h-3.5 text-amber-500" />
                <span>Wishlists ({wishlists.length})</span>
              </div>
              {wishlists.length > 0 ? (
                <p className="text-slate-600 truncate">
                  {wishlists.map((w) => w.platform).join(", ")}
                </p>
              ) : (
                <p className="text-slate-400">None attached</p>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                <HeartHandshake className="w-3.5 h-3.5 text-red-500" />
                <span>Charity Causes ({charities.length})</span>
              </div>
              {charities.length > 0 ? (
                <p className="text-slate-600 truncate">
                  {charities.map((c) => c.name).join(", ")}
                </p>
              ) : (
                <p className="text-slate-400">None attached</p>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Personal Causes ({personalFunds.length})</span>
              </div>
              {personalFunds.length > 0 ? (
                <p className="text-slate-600 truncate">
                  {personalFunds.map((f) => f.title).join(", ")}
                </p>
              ) : (
                <p className="text-slate-400">None attached</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
