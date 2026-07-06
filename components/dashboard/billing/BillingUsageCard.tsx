"use client";

import React from "react";
import { BillingUsage } from "../../../types/billing.types";
import UsageProgress from "./UsageProgress";
import { AlertCircle, RotateCcw } from "lucide-react";

interface BillingUsageCardProps {
  usage: BillingUsage | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function BillingUsageCard({
  usage,
  loading,
  error,
  onRetry
}: BillingUsageCardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 md:p-8 shadow-sm animate-pulse">
        <div className="mb-6 space-y-2">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[220px]">
        <AlertCircle className="w-8 h-8 text-rose-500 mb-2 animate-bounce" />
        <p className="text-sm font-semibold text-[#2D1B3D]">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] rounded-xl shadow-md transition-all active:scale-95 focus:outline-none"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  if (!usage) return null;

  return (
    <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#2D1B3D]">Current Usage</h3>
        <p className="text-xs text-[#2D1B3D]/50 mt-1">
          Your active usage stats for this billing cycle.
        </p>
      </div>

      <div className="space-y-6">
        {/* Events Created */}
        <UsageProgress
          label="Events Created"
          used={usage.eventsCreated}
          limit={usage.eventsLimit}
          colorClass="bg-gradient-to-r from-amber-500 to-[#C9A84C]"
        />

        {/* Guests This Month */}
        <UsageProgress
          label="Guests This Month"
          used={usage.guestsUsed}
          limit={usage.guestsLimit}
          colorClass="bg-gradient-to-r from-[#7A9E7E] to-emerald-600"
        />

        {/* Messages Sent */}
        <UsageProgress
          label="Messages Sent"
          used={usage.messagesSent !== undefined ? usage.messagesSent : (usage.messagesUsed || 0)}
          limit={usage.messagesLimit}
          colorClass="bg-gradient-to-r from-[#9070c0] to-indigo-600"
        />
      </div>
    </div>
  );
}
