"use client";

import React, { useState } from "react";
import { X, Sparkles, Check, Info } from "lucide-react";
import { AdminBillingUser } from "../../../services/adminService";
import { motion } from "framer-motion";

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminBillingUser | null;
  onSave: (userId: number, plan: string) => Promise<void>;
  updating: boolean;
}

export default function ChangePlanModal({ isOpen, onClose, user, onSave, updating }: ChangePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  React.useEffect(() => {
    if (user) {
      const p = (user.plan || "free").toLowerCase();
      if (p === "enterprise" || p === "host") {
        setSelectedPlan("business");
      } else {
        setSelectedPlan(p);
      }
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const userPlanNormalized = (() => {
    const p = (user.plan || "free").toLowerCase();
    if (p === "enterprise" || p === "host") return "business";
    return p;
  })();

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      description: "Basic hosting features for small casual meetups",
      features: [
        "Up to 3 events/year",
        "25 guests per event",
        "Basic invitation templates",
        "Email invitations",
        "RSVP tracking",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$19",
      description: "Advanced customizations and SMS/WhatsApp capabilities",
      features: [
        "Up to 250 guests",
        "SMS & WhatsApp invites",
        "QR Check-in",
        "Reminders & analytics",
      ],
    },
    {
      id: "business",
      name: "Business",
      price: "$49",
      description: "Unlimited platform scale, priority help, and custom APIs",
      features: [
        "Unlimited guests",
        "Ticketing & payments",
        "Attendance guarantee",
        "Security Center",
        "Priority support",
      ],
    },
  ];

  const handleSave = () => {
    if (selectedPlan) {
      onSave(user.id, selectedPlan);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <style dangerouslySetInnerHTML={{ __html: `
        .modal-blue-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .modal-blue-scrollbar::-webkit-scrollbar-track {
          background: #f0f9ff;
          border-radius: 3px;
        }
        .modal-blue-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #2563eb, #38bdf8);
          border-radius: 3px;
        }
        .modal-blue-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #1d4ed8, #0284c7);
        }
      `}} />

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
        className="relative bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto modal-blue-scrollbar rounded-2xl shadow-2xl border border-slate-200/80 z-10 p-6 sm:p-8 text-[#2D1B3D] font-body my-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Plan Manager
            </span>
            <h3
              className="text-2xl font-semibold font-display mt-1 text-[#2D1B3D]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Update Subscription Plan
            </h3>
            <p className="text-xs text-[#2D1B3D]/60 mt-1">
              Changing plan for <strong className="font-semibold text-slate-800">{user.name}</strong> ({user.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#2D1B3D]/50 hover:text-[#2D1B3D] rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Cards Selector */}
        <div className="space-y-3">
          {plans.map((p) => {
            const isCurrent = userPlanNormalized === p.id;
            const isSelected = selectedPlan === p.id;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`flex justify-between items-center p-4 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? "border-blue-600 ring-2 ring-blue-600/30 bg-blue-50/50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/20"
                }`}
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#2D1B3D]">
                      {p.name}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wide">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#2D1B3D]/60 mt-1">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                    {p.features.map((f, idx) => (
                      <span key={idx} className="inline-flex items-center text-[9px] text-[#2D1B3D]/50">
                        <Check className="w-2.5 h-2.5 text-emerald-600 mr-1 flex-shrink-0" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span className="text-lg font-bold text-[#2D1B3D]">
                    {p.price}
                  </span>
                  <span className="text-[9px] text-[#2D1B3D]/40">
                    / month
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border mt-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Info Banner */}
        <div className="mt-6 p-3.5 bg-blue-50/80 border border-blue-200 text-blue-900 rounded-xl flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-blue-900 leading-relaxed font-normal">
            Changing the plan will immediately reset this user's monthly limits and update their start date to today. Existing events, guest lists, and logs are preserved.
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 hover:bg-[#F0EBE8] rounded-xl transition-all focus:outline-none flex items-center justify-center"
            disabled={updating}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto flex items-center justify-center min-w-[120px] px-5 py-2.5 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl active:scale-95 transition-all shadow-md focus:outline-none disabled:opacity-55 disabled:pointer-events-none"
            disabled={updating || selectedPlan === userPlanNormalized}
          >
            {updating ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
