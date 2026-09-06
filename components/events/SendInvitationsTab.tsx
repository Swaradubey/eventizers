"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Mail,
  CheckCircle,
  Loader2,
  X,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Check,
} from "lucide-react";
import eventService, {
  Event,
  SendInvitationsOptions,
} from "@/services/eventService";
import guestService from "@/services/guestService";
import { useAuth } from "@/context/AuthContext";

type DeliveryMethod = "email" | "sms" | "whatsapp" | "all";

interface SendInvitationsTabProps {
  eventId: string;
  event?: Event | null;
  showToast: (text: string, type?: "success" | "error") => void;
}

export default function SendInvitationsTab({
  eventId,
  event,
  showToast,
}: SendInvitationsTabProps) {
  const { user } = useAuth();

  // Delivery Method state (email active by default)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("email");

  // Invitation Features Checkboxes state (all checked by default)
  const [options, setOptions] = useState<SendInvitationsOptions>({
    personalizedGreeting: true,
    calendarLink: true,
    mapLink: true,
    qrCode: true,
  });

  // Dynamic guest count and list
  const [guestCount, setGuestCount] = useState<number>(() => {
    return event?.totalGuests !== undefined && event.totalGuests > 0
      ? event.totalGuests
      : 50;
  });
  const [loadingGuests, setLoadingGuests] = useState(false);

  // Sending states
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  // Test Email Modal state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSuccessNotice, setTestSuccessNotice] = useState<string | null>(null);
  const [testPreviewUrl, setTestPreviewUrl] = useState<string | null>(null);

  // Fetch real guest count for the current event
  useEffect(() => {
    if (!eventId) return;

    let isMounted = true;
    const fetchGuestList = async () => {
      try {
        setLoadingGuests(true);
        const res = await guestService.getGuests(1, 1000, undefined, eventId);
        if (isMounted && res && res.success) {
          const count =
            res.pagination?.total !== undefined
              ? res.pagination.total
              : (res.guests?.length || 0);
          setGuestCount(count > 0 ? count : (event?.totalGuests || 0));
        }
      } catch (err) {
        console.warn("Could not fetch guests for event:", err);
        if (isMounted && event?.totalGuests !== undefined) {
          setGuestCount(event.totalGuests);
        }
      } finally {
        if (isMounted) setLoadingGuests(false);
      }
    };

    fetchGuestList();
    return () => {
      isMounted = false;
    };
  }, [eventId, event?.totalGuests]);

  // Sync test email when user loads or modal opens
  const handleOpenTestModal = () => {
    setTestEmail(user?.email || "");
    setTestSuccessNotice(null);
    setTestPreviewUrl(null);
    setIsTestModalOpen(true);
  };

  // Toggle individual option checkbox
  const toggleOption = (key: keyof SendInvitationsOptions) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle Send Test Invitation
  const handleSendTestInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    try {
      setSendingTest(true);
      const res = await eventService.sendInvitations(eventId, {
        deliveryMethod: "email",
        options,
        testEmail: testEmail.trim(),
      });

      if (res && res.success) {
        setTestSuccessNotice(res.message || "Test invitation dispatched successfully!");
        if (res.previewUrl) {
          setTestPreviewUrl(res.previewUrl);
        }
        showToast(res.message || "Test invitation sent successfully!", "success");
      } else {
        showToast(res?.error || "Failed to send test invitation.", "error");
      }
    } catch (err: any) {
      console.error("Error sending test invite:", err);
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send test invitation.";
      showToast(errorMsg, "error");
    } finally {
      setSendingTest(false);
    }
  };

  // Handle Send All Invitations
  const handleSendAllInvitations = async () => {
    // If SMS or WhatsApp UI simulated
    if (deliveryMethod === "sms" || deliveryMethod === "whatsapp") {
      showToast(
        `${deliveryMethod.toUpperCase()} invitation dispatch simulated successfully! (UI Mock)`,
        "success"
      );
      return;
    }

    if (guestCount === 0) {
      showToast(
        "No guests found for this event. Please add guests in the guest list first.",
        "error"
      );
      return;
    }

    try {
      setSendingAll(true);
      const res = await eventService.sendInvitations(eventId, {
        deliveryMethod: deliveryMethod === "all" ? "email" : "email",
        options,
      });

      if (res && res.success) {
        showToast(
          res.message ||
            `Invitations sent successfully to ${res.recipientCount || guestCount} guest(s)!`,
          "success"
        );
      } else {
        showToast(res?.error || "Failed to send invitations.", "error");
      }
    } catch (err: any) {
      console.error("Error sending invitations:", err);
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send invitations.";
      showToast(errorMsg, "error");
    } finally {
      setSendingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* CARD 1: "Send invitations"                                */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-9">
        {/* Header: Paper airplane / Send icon followed by bold title */}
        <div className="flex items-center gap-3 pb-6">
          <Send className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 flex-shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Send invitations
          </h2>
        </div>

        {/* Delivery Method Selector */}
        <div className="pt-1">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-3">
            Delivery Method
          </label>

          {/* Horizontal list of 4 selectable method cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            {/* 1. Email (Mail icon) */}
            <button
              type="button"
              onClick={() => setDeliveryMethod("email")}
              className={`rounded-2xl py-5 px-4 text-center transition-all cursor-pointer focus:outline-none ${
                deliveryMethod === "email"
                  ? "border-2 border-indigo-500 bg-[#f8f9ff] text-indigo-950 shadow-xs ring-2 ring-indigo-500/10"
                  : "border border-slate-200/80 hover:border-slate-300 bg-white text-slate-800 hover:bg-slate-50/60"
              }`}
            >
              <Mail
                className={`w-6 h-6 mx-auto mb-2.5 ${
                  deliveryMethod === "email" ? "text-indigo-600" : "text-slate-800"
                }`}
              />
              <span className="block text-sm font-semibold tracking-tight">
                Email
              </span>
            </button>

            {/* 2. SMS (Paper plane icon) */}
            <button
              type="button"
              onClick={() => setDeliveryMethod("sms")}
              className={`rounded-2xl py-5 px-4 text-center transition-all cursor-pointer focus:outline-none ${
                deliveryMethod === "sms"
                  ? "border-2 border-indigo-500 bg-[#f8f9ff] text-indigo-950 shadow-xs ring-2 ring-indigo-500/10"
                  : "border border-slate-200/80 hover:border-slate-300 bg-white text-slate-800 hover:bg-slate-50/60"
              }`}
            >
              <Send
                className={`w-5 h-5 mx-auto mb-2.5 ${
                  deliveryMethod === "sms" ? "text-indigo-600" : "text-slate-800"
                }`}
              />
              <span className="block text-sm font-semibold tracking-tight">
                SMS
              </span>
            </button>

            {/* 3. WhatsApp (Paper plane icon) */}
            <button
              type="button"
              onClick={() => setDeliveryMethod("whatsapp")}
              className={`rounded-2xl py-5 px-4 text-center transition-all cursor-pointer focus:outline-none ${
                deliveryMethod === "whatsapp"
                  ? "border-2 border-indigo-500 bg-[#f8f9ff] text-indigo-950 shadow-xs ring-2 ring-indigo-500/10"
                  : "border border-slate-200/80 hover:border-slate-300 bg-white text-slate-800 hover:bg-slate-50/60"
              }`}
            >
              <Send
                className={`w-5 h-5 mx-auto mb-2.5 ${
                  deliveryMethod === "whatsapp" ? "text-indigo-600" : "text-slate-800"
                }`}
              />
              <span className="block text-sm font-semibold tracking-tight">
                WhatsApp
              </span>
            </button>

            {/* 4. All Methods (Check-circle icon) */}
            <button
              type="button"
              onClick={() => setDeliveryMethod("all")}
              className={`rounded-2xl py-5 px-4 text-center transition-all cursor-pointer focus:outline-none ${
                deliveryMethod === "all"
                  ? "border-2 border-indigo-500 bg-[#f8f9ff] text-indigo-950 shadow-xs ring-2 ring-indigo-500/10"
                  : "border border-slate-200/80 hover:border-slate-300 bg-white text-slate-800 hover:bg-slate-50/60"
              }`}
            >
              <CheckCircle
                className={`w-5 h-5 mx-auto mb-2.5 ${
                  deliveryMethod === "all" ? "text-indigo-600" : "text-slate-800"
                }`}
              />
              <span className="block text-sm font-semibold tracking-tight">
                All Methods
              </span>
            </button>
          </div>
        </div>

        {/* Invitation Feature Checkboxes (2-column grid matching screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-7 mt-9 pt-3">
          {/* Left Item 1: Personalized Greeting */}
          <div
            onClick={() => toggleOption("personalizedGreeting")}
            className="flex items-start gap-3.5 cursor-pointer select-none group"
          >
            <div className="pt-0.5">
              <input
                type="checkbox"
                id="personalizedGreeting"
                checked={options.personalizedGreeting}
                onChange={() => {}}
                className="w-5 h-5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label
                htmlFor="personalizedGreeting"
                className="text-sm sm:text-base font-semibold text-slate-900 leading-none cursor-pointer group-hover:text-blue-600 transition-colors"
              >
                Personalized Greeting
              </label>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-normal">
                Include guest name in invitation
              </p>
            </div>
          </div>

          {/* Right Item 1: Calendar Link */}
          <div
            onClick={() => toggleOption("calendarLink")}
            className="flex items-start gap-3.5 cursor-pointer select-none group"
          >
            <div className="pt-0.5">
              <input
                type="checkbox"
                id="calendarLink"
                checked={options.calendarLink}
                onChange={() => {}}
                className="w-5 h-5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label
                htmlFor="calendarLink"
                className="text-sm sm:text-base font-semibold text-slate-900 leading-none cursor-pointer group-hover:text-blue-600 transition-colors"
              >
                Calendar Link
              </label>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-normal">
                Add to calendar option
              </p>
            </div>
          </div>

          {/* Left Item 2: Map Link */}
          <div
            onClick={() => toggleOption("mapLink")}
            className="flex items-start gap-3.5 cursor-pointer select-none group"
          >
            <div className="pt-0.5">
              <input
                type="checkbox"
                id="mapLink"
                checked={options.mapLink}
                onChange={() => {}}
                className="w-5 h-5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label
                htmlFor="mapLink"
                className="text-sm sm:text-base font-semibold text-slate-900 leading-none cursor-pointer group-hover:text-blue-600 transition-colors"
              >
                Map Link
              </label>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-normal">
                Include directions to venue
              </p>
            </div>
          </div>

          {/* Right Item 2: QR Code */}
          <div
            onClick={() => toggleOption("qrCode")}
            className="flex items-start gap-3.5 cursor-pointer select-none group"
          >
            <div className="pt-0.5">
              <input
                type="checkbox"
                id="qrCode"
                checked={options.qrCode}
                onChange={() => {}}
                className="w-5 h-5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label
                htmlFor="qrCode"
                className="text-sm sm:text-base font-semibold text-slate-900 leading-none cursor-pointer group-hover:text-blue-600 transition-colors"
              >
                QR Code
              </label>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-normal">
                Add scannable RSVP code
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CARD 2: "Ready to send?"                                  */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-9">
        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Ready to send?
        </h3>

        {/* Subtitle with dynamic guestCount */}
        <p className="text-sm sm:text-base text-slate-500 font-normal mt-2">
          You have{" "}
          <span className="font-bold text-slate-900">
            {loadingGuests ? "..." : guestCount}
          </span>{" "}
          guests who will receive invitations.
        </p>

        {/* Action Buttons Row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Left button: Send Test Invitation */}
          <button
            type="button"
            onClick={handleOpenTestModal}
            className="text-sm sm:text-base font-semibold text-slate-800 hover:text-slate-950 px-2 py-2.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Send Test Invitation
          </button>

          {/* Right button: Send All Invitations */}
          <button
            type="button"
            onClick={handleSendAllInvitations}
            disabled={sendingAll}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#5352ed] via-[#3772ff] to-[#00b4d8] text-white text-sm sm:text-base font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sendingAll ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
            <span>{sendingAll ? "Sending Invitations..." : "Send All Invitations"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TEST INVITATION MODAL                                     */}
      {/* ========================================================= */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 p-6 sm:p-7 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Send Test Invitation
                  </h4>
                  <p className="text-xs text-slate-500">
                    Preview your email invitation before sending to all guests
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSendTestInvitation} className="pt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  We will send a sample invitation with all selected options enabled.
                </p>
              </div>

              {/* Success notice inside modal if sent */}
              {testSuccessNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{testSuccessNotice}</span>
                  </div>
                  {testPreviewUrl && (
                    <div className="pt-1">
                      <a
                        href={testPreviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <span>View Sent Email on Ethereal Preview</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {sendingTest ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                  <span>{sendingTest ? "Sending Test..." : "Send Test"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
