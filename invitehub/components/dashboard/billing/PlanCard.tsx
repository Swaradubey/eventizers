"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { Plan } from "../../../services/billingService";

interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
  onSelect: (planId: string) => void;
  updating: boolean;
}

export default function PlanCard({ plan, isCurrent, onSelect, updating }: PlanCardProps) {
  const isPro = plan.id === "pro";
  const isEnterprise = plan.id === "enterprise";

  // Determine pricing text
  let priceText = `$${plan.price}/mo`;
  if (isEnterprise) {
    priceText = "Custom";
  } else if (plan.price === 0) {
    priceText = "$0/mo";
  }

  // Action button configuration
  let buttonText = "Upgrade";
  if (isCurrent) {
    buttonText = "Current Plan";
  } else if (plan.id === "free") {
    buttonText = "Downgrade";
  } else if (isEnterprise) {
    buttonText = "Contact Sales";
  } else {
    buttonText = `Upgrade to ${plan.name}`;
  }

  const handleAction = () => {
    if (isCurrent || updating) return;
    onSelect(plan.id);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`rounded-2xl p-6 border flex flex-col justify-between h-full relative overflow-hidden transition-all duration-300 ${
        isPro
          ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 text-white border-none shadow-xl scale-[1.02] md:scale-[1.03]"
          : "bg-white border-[#E8C4B8]/30 text-[#2D1B3D] shadow-sm hover:shadow-md"
      }`}
    >
      {/* Current Plan Badge */}
      {isCurrent && (
        <div className="absolute top-4 right-4 z-10">
          <span
            className={`inline-flex px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full ${
              isPro
                ? "bg-white text-indigo-700"
                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
            }`}
          >
            Current Plan
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div>
        <h3
          className={`font-display text-2xl font-bold mb-2 ${isPro ? "text-white" : "text-[#2D1B3D]"}`}
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {plan.name}
        </h3>
        <p className={`text-xs mb-6 ${isPro ? "text-white/70" : "text-[#2D1B3D]/50"}`}>
          {isPro
            ? "Ideal for growing hosts needing messaging & analytics"
            : plan.id === "free"
            ? "Basic package for casual event management"
            : plan.id === "business"
            ? "Perfect for organizations & commercial events"
            : "Tailored options for large enterprises"}
        </p>

        {/* Plan Price */}
        <div className="mb-6 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tracking-tight">{priceText}</span>
          {!isEnterprise && (
            <span className={`text-xs ${isPro ? "text-white/60" : "text-[#2D1B3D]/40"}`}>
              /month
            </span>
          )}
        </div>

        {/* Features list */}
        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs">
              <span
                className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                  isPro ? "bg-white/20 text-white" : "bg-[#2D1B3D]/5 text-[#2D1B3D]/70"
                }`}
              >
                <Check className="w-3 h-3" />
              </span>
              <span className={isPro ? "text-white/90" : "text-[#2D1B3D]/70"}>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Plan CTA Button */}
      <div>
        <button
          onClick={handleAction}
          disabled={isCurrent || updating}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] focus:outline-none ${
            isCurrent
              ? isPro
                ? "bg-white/10 text-white cursor-not-allowed border border-white/20"
                : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              : isPro
              ? "bg-[#C9A84C] text-[#2D1B3D] hover:bg-[#b59541] hover:shadow-lg shadow-md"
              : "bg-[#2D1B3D] text-white hover:bg-[#3d2a52] hover:shadow-md shadow-sm"
          }`}
        >
          {updating && !isCurrent ? "Processing..." : buttonText}
        </button>
      </div>
    </motion.div>
  );
}
