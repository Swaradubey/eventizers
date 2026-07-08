"use client";

import React, { useState } from "react";
import { X, Calendar, User, Mail, Shield, CheckCircle, CreditCard, RotateCcw, AlertTriangle, Trash2 } from "lucide-react";
import { AdminBillingUser } from "../../../services/adminService";
import { motion, AnimatePresence } from "framer-motion";

interface BillingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminBillingUser | null;
  onDeleteUser: (userId: number) => Promise<boolean>;
}

export default function BillingDetailsModal({ isOpen, onClose, user, onDeleteUser }: BillingDetailsModalProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteUserConfirm = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const success = await onDeleteUser(user.id);
      if (success) {
        setShowConfirmDelete(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !user) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getLimitText = (used: number, limit: number) => {
    if (limit === -1) return `${used} / Unlimited`;
    return `${used} / ${limit}`;
  };

  const getPercent = (used: number, limit: number) => {
    if (limit === -1) return 0;
    if (limit === 0) return 100;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return "bg-rose-500";
    if (percent >= 75) return "bg-amber-500";
    return "bg-[#C9A84C]";
  };

  // Mock invoice history matching design aesthetic
  const mockInvoices = [
    {
      id: "inv_1",
      invoiceNumber: `INV-2026-${1000 + user.id}`,
      date: new Date(new Date(user.planStartDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: user.plan.toLowerCase() === "pro" ? 19.00 : user.plan.toLowerCase() === "business" || user.plan.toLowerCase() === "enterprise" ? 49.00 : user.plan.toLowerCase() === "starter" ? 9.00 : 0.00,
      status: "PAID",
    },
    {
      id: "inv_2",
      invoiceNumber: `INV-2026-${1200 + user.id}`,
      date: user.planStartDate,
      amount: user.plan.toLowerCase() === "pro" ? 19.00 : user.plan.toLowerCase() === "business" || user.plan.toLowerCase() === "enterprise" ? 49.00 : user.plan.toLowerCase() === "starter" ? 9.00 : 0.00,
      status: "PAID",
    },
  ].filter(inv => inv.amount > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E8C4B8]/30 z-10 p-6 sm:p-8 text-[#2D1B3D] font-body"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              Billing Profile
            </span>
            <h3
              className="text-2xl sm:text-3xl font-semibold font-display mt-1 break-words"
              style={{ fontFamily: "'Playfair Display', serif", overflowWrap: "break-word", wordBreak: "break-word" }}
            >
              {user.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#2D1B3D]/50 hover:text-[#2D1B3D] rounded-xl hover:bg-[#F0EBE8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Column 1: Info Card */}
          <div className="space-y-4">
            <div className="bg-[#FAF8F5] border border-[#E8C4B8]/20 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider mb-2">
                User Details
              </h4>
              <div className="flex items-center gap-3 min-w-0 w-full">
                <Mail className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-[#2D1B3D]/50 uppercase">Email Address</p>
                  <p className="text-xs font-semibold break-all" style={{ overflowWrap: "break-word", wordBreak: "break-word" }}>{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-[#2D1B3D]/50 uppercase">Current Subscription</p>
                  <p className="text-xs font-semibold uppercase">{user.plan}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-[#2D1B3D]/50 uppercase">Status</p>
                  <div className="flex flex-wrap gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      user.subscriptionStatus === "ACTIVE" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {user.subscriptionStatus}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      user.billingStatus === "PAID" || user.billingStatus === "ACTIVE" || user.billingStatus === "Active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : user.billingStatus === "PENDING"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      Billing: {user.billingStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing dates */}
            <div className="bg-[#FAF8F5] border border-[#E8C4B8]/20 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider mb-2">
                Billing Cycle
              </h4>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#C9A84C]" />
                <div>
                  <p className="text-[10px] text-[#2D1B3D]/50 uppercase">Cycle Started</p>
                  <p className="text-xs font-semibold">{formatDate(user.planStartDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#C9A84C]" />
                <div>
                  <p className="text-[10px] text-[#2D1B3D]/50 uppercase">Renewal Date</p>
                  <p className="text-xs font-semibold">{formatDate(user.planExpiryDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Usage Stats */}
          <div className="bg-[#FAF8F5] border border-[#E8C4B8]/20 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider mb-4">
                Usage Statistics
              </h4>

              <div className="space-y-4">
                {/* Events Created */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Events Created</span>
                    <span>{getLimitText(user.usage.eventsCreated, user.usage.eventsLimit)}</span>
                  </div>
                  {user.usage.eventsLimit === -1 ? (
                    <div className="h-2 w-full bg-[#E8C4B8]/10 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-[#C9A84C]" style={{ opacity: 0.3 }} />
                    </div>
                  ) : (
                    <div className="h-2 w-full bg-[#E8C4B8]/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(getPercent(user.usage.eventsCreated, user.usage.eventsLimit))} rounded-full transition-all`}
                        style={{ width: `${getPercent(user.usage.eventsCreated, user.usage.eventsLimit)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Guests Used */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Guests Checked In / Invited</span>
                    <span>{getLimitText(user.usage.guestsUsed, user.usage.guestsLimit)}</span>
                  </div>
                  {user.usage.guestsLimit === -1 ? (
                    <div className="h-2 w-full bg-[#E8C4B8]/10 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-[#C9A84C]" style={{ opacity: 0.3 }} />
                    </div>
                  ) : (
                    <div className="h-2 w-full bg-[#E8C4B8]/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(getPercent(user.usage.guestsUsed, user.usage.guestsLimit))} rounded-full transition-all`}
                        style={{ width: `${getPercent(user.usage.guestsUsed, user.usage.guestsLimit)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Messages Used */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Messages Sent</span>
                    <span>{getLimitText(user.usage.messagesUsed, user.usage.messagesLimit)}</span>
                  </div>
                  {user.usage.messagesLimit === -1 ? (
                    <div className="h-2 w-full bg-[#E8C4B8]/10 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-[#C9A84C]" style={{ opacity: 0.3 }} />
                    </div>
                  ) : (
                    <div className="h-2 w-full bg-[#E8C4B8]/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(getPercent(user.usage.messagesUsed, user.usage.messagesLimit))} rounded-full transition-all`}
                        style={{ width: `${getPercent(user.usage.messagesUsed, user.usage.messagesLimit)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-[#2D1B3D]/40 text-right mt-4">
              Last updated: {new Date(user.usage.updatedAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        {/* Invoice / Billing History */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
            Billing History
          </h4>
          {mockInvoices.length === 0 ? (
            <div className="border border-dashed border-[#E8C4B8]/40 rounded-2xl p-6 text-center text-xs text-[#2D1B3D]/50 bg-[#FAF8F5]/30">
              No invoice history available for Free plan.
            </div>
          ) : (
            <div className="border border-[#E8C4B8]/25 rounded-2xl overflow-x-auto bg-white shadow-sm">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E8C4B8]/20 text-[#2D1B3D]/50 font-bold">
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8C4B8]/10">
                  {mockInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-[#FAF8F5]/30">
                      <td className="py-2.5 px-4 font-semibold">{invoice.invoiceNumber}</td>
                      <td className="py-2.5 px-4">{new Date(invoice.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}</td>
                      <td className="py-2.5 px-4 font-medium">${invoice.amount.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150">
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
          <button
            disabled={deleting}
            onClick={() => setShowConfirmDelete(true)}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl active:scale-95 transition-all shadow-sm focus:outline-none flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Delete User
          </button>
          <button
            disabled={deleting}
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-[#FAF8F5] bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl active:scale-95 transition-all shadow-md focus:outline-none flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close Profile
          </button>
        </div>
      </motion.div>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {showConfirmDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={deleting ? undefined : () => setShowConfirmDelete(false)}
              className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 text-[#2D1B3D] font-body"
            >
              <h3 className="text-lg font-semibold font-display mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Delete User
              </h3>
              <div className="text-xs text-[#2D1B3D]/70 mb-6 space-y-2">
                <p>Are you sure you want to permanently delete this user?</p>
                <p>This action will also remove:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Billing information</li>
                  <li>Subscription data</li>
                  <li>Usage statistics</li>
                  <li>Billing history (if applicable)</li>
                </ul>
                <p className="font-semibold text-red-600 mt-2">This action cannot be undone.</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  disabled={deleting}
                  onClick={() => setShowConfirmDelete(false)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 rounded-xl hover:bg-[#F0EBE8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  disabled={deleting}
                  onClick={handleDeleteUserConfirm}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Permanently"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
