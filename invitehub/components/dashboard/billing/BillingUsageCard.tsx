"use client";

import React from "react";
import { BillingUsage } from "../../../types/billing.types";
import { AlertCircle, RotateCcw, TrendingUp } from "lucide-react";

interface BillingUsageCardProps {
  usage: BillingUsage | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

interface UsageMetricProps {
  label: string;
  used: number;
  limit: number | null;
  gradientClass: string;
}

function UsageMetric({ label, used, limit, gradientClass }: UsageMetricProps) {
  const isUnlimited = limit === null || limit === 0 || limit === -1;
  const percentage = isUnlimited ? 8 : Math.min(100, Math.round((used / limit!) * 100));
  const displayValue = isUnlimited ? `${used} / Unlimited` : `${used} / ${limit}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-bold text-slate-900">{displayValue}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${gradientClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function BillingUsageCard({
  usage,
  loading,
  error,
  onRetry,
}: BillingUsageCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80 mb-8 animate-pulse">
        <div className="h-5 w-36 bg-slate-200 rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-3 w-16 bg-slate-200 rounded" />
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80 mb-8 flex flex-col items-center justify-center text-center min-h-[120px]">
        <AlertCircle className="w-7 h-7 text-rose-500 mb-2" />
        <p className="text-xs font-semibold text-slate-700">{error}</p>
        <button
          onClick={onRetry}
          className="mt-3 flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          Retry
        </button>
      </div>
    );
  }

  if (!usage) return null;

  const eventsLimit =
    usage.eventsLimit === 0 || usage.eventsLimit === -1 || usage.eventsLimit === null
      ? null
      : usage.eventsLimit;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80 mb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-indigo-600" />
        <h3 className="text-base font-bold text-slate-900">Current usage</h3>
      </div>

      {/* 3-column metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <UsageMetric
          label="Events created"
          used={usage.eventsCreated ?? 0}
          limit={eventsLimit}
          gradientClass="bg-gradient-to-r from-blue-600 to-cyan-400"
        />
        <UsageMetric
          label="Guests this month"
          used={usage.guestsUsed ?? 0}
          limit={usage.guestsLimit ?? 250}
          gradientClass="bg-gradient-to-r from-blue-600 to-cyan-400"
        />
        <UsageMetric
          label="Messages sent"
          used={
            usage.messagesSent !== undefined
              ? usage.messagesSent
              : usage.messagesUsed ?? 0
          }
          limit={usage.messagesLimit ?? 5000}
          gradientClass="bg-gradient-to-r from-blue-600 to-indigo-500"
        />
      </div>
    </div>
  );
}
