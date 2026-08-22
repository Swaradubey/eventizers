"use client";

import React from "react";
import { Check, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Plan } from "../../../services/billingService";

interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
  onSelect: (planId: string) => void;
  updating: boolean;
}

export default function PlanCard({ plan, isCurrent, onSelect, updating }: PlanCardProps) {
  const planId = plan.id.toLowerCase().trim();
  const isPro = planId === "pro";
  const isEnterprise = planId === "enterprise";
  const isFree = planId === "free";

  // Price display
  const priceDisplay = isEnterprise ? "Custom" : plan.price === 0 ? "$0" : `$${plan.price}`;
  const showPerMonth = !isEnterprise;

  // Button text
  let buttonText = "Upgrade";
  if (isCurrent) buttonText = "✓ Current Plan";
  else if (isFree) buttonText = "Downgrade";
  else if (isEnterprise) buttonText = "Contact Sales";
  else buttonText = "Upgrade";

  const handleAction = () => {
    if (isCurrent || updating) return;
    onSelect(plan.id);
  };

  if (isPro) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white rounded-2xl p-6 shadow-lg flex flex-col justify-between h-full relative overflow-hidden"
      >
        {/* Subtle glow overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_white,_transparent)]" />

        <div className="relative z-10">
          <h3 className="font-semibold text-white text-base mb-1">{plan.name}</h3>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-bold text-white">{priceDisplay}</span>
            {showPerMonth && (
              <span className="text-white/70 text-sm font-normal">/mo</span>
            )}
          </div>

          <ul className="space-y-2.5 my-5">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-white/90">
                <Check className="w-4 h-4 text-white/90 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <button
            onClick={handleAction}
            disabled={isCurrent || updating}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all duration-200"
          >
            {isCurrent ? (
              <span>✓ Current Plan</span>
            ) : updating ? (
              <span>Processing...</span>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Upgrade</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    );
  }

  if (isEnterprise) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between h-full"
      >
        <div>
          <h3 className="font-semibold text-slate-900 text-base mb-1">{plan.name}</h3>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-bold text-slate-900">{priceDisplay}</span>
          </div>

          <ul className="space-y-2.5 my-5">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleAction}
          disabled={isCurrent || updating}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-2.5 rounded-xl shadow-sm text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {updating && !isCurrent ? "Processing..." : "Contact Sales"}
        </button>
      </motion.div>
    );
  }

  // Free & Business
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80 flex flex-col justify-between h-full"
    >
      <div>
        <h3 className="font-semibold text-slate-900 text-base mb-1">{plan.name}</h3>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-bold text-slate-900">{priceDisplay}</span>
          {showPerMonth && (
            <span className="text-slate-400 text-sm font-normal">/mo</span>
          )}
        </div>

        <ul className="space-y-2.5 my-5">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleAction}
        disabled={isCurrent || updating}
        className={`w-full font-medium py-2.5 rounded-xl shadow-sm text-sm flex items-center justify-center gap-1.5 transition-all duration-200 ${
          isCurrent
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90"
        }`}
      >
        {isCurrent ? (
          <span>✓ Current Plan</span>
        ) : updating ? (
          <span>Processing...</span>
        ) : (
          <>
            <Zap className="w-3.5 h-3.5" />
            <span>Upgrade</span>
          </>
        )}
      </button>
    </motion.div>
  );
}
