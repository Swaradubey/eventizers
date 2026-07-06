"use client";

import React, { useState } from "react";
import { X, Shield, Sparkles, Check, Info } from "lucide-react";
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
      setSelectedPlan(user.plan.toLowerCase());
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      description: "Basic hosting features for small casual meetups",
      features: ["Up to 25 guests", "10 events limit", "100 messages limit"],
    },
    {
      id: "starter",
      name: "Starter",
      price: "$9",
      description: "Perfect for active hosts with growing guest list needs",
      features: ["Up to 100 guests", "20 events limit", "1,000 messages limit"],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$19",
      description: "Advanced customizations and SMS/WhatsApp capabilities",
      features: ["Up to 250 guests", "Unlimited events", "5,000 messages limit"],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$49",
      description: "Unlimited platform scale, priority help, and custom APIs",
      features: ["Unlimited guests", "Unlimited events", "Unlimited messages"],
    },
  ];

  const handleSave = () => {
    if (selectedPlan) {
      onSave(user.id, selectedPlan);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
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
        className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 p-6 sm:p-8 text-[#2D1B3D] font-body"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Plan Manager
            </span>
            <h3
              className="text-2xl font-semibold font-display mt-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Update Subscription Plan
            </h3>
            <p className="text-xs text-[#2D1B3D]/50 mt-1">
              Changing plan for <strong>{user.name}</strong> ({user.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#2D1B3D]/50 hover:text-[#2D1B3D] rounded-xl hover:bg-[#F0EBE8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Cards Selector */}
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {plans.map((p) => {
            const isCurrent = user.plan.toLowerCase() === p.id;
            const isSelected = selectedPlan === p.id;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`flex justify-between items-center p-4 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? "border-[#2D1B3D] bg-[#FAF8F5] shadow-sm"
                    : "border-[#E8C4B8]/20 bg-white hover:border-[#E8C4B8]/60 hover:bg-[#FAF8F5]/30"
                }`}
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#2D1B3D]">
                      {p.name}
                    </span>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/25">
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
                  <div className={`w-4 h-4 rounded-full border mt-2 flex items-center justify-center ${
                    isSelected ? "border-[#2D1B3D] bg-[#2D1B3D]" : "border-[#E8C4B8]/40"
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Warning Information */}
        <div className="mt-6 p-3.5 bg-amber-50 border border-amber-200/50 rounded-xl flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-amber-800 leading-relaxed">
            Changing the plan will immediately reset this user's monthly limits and update their start date to today. Existing events, guest lists, and logs are preserved.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 hover:bg-[#F0EBE8] rounded-xl transition-all focus:outline-none"
            disabled={updating}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center justify-center min-w-[120px] px-5 py-2.5 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl active:scale-95 transition-all shadow-md focus:outline-none disabled:opacity-55 disabled:pointer-events-none"
            disabled={updating || selectedPlan === user.plan.toLowerCase()}
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
