"use client";

import React from "react";
import UsageProgress from "./UsageProgress";

interface UsageCardProps {
  eventsCreated: number;
  eventsLimit: number;
  guestsUsed: number;
  guestsLimit: number;
  messagesUsed: number;
  messagesLimit: number;
}

export default function UsageCard({
  eventsCreated,
  eventsLimit,
  guestsUsed,
  guestsLimit,
  messagesUsed,
  messagesLimit
}: UsageCardProps) {
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
          used={eventsCreated}
          limit={eventsLimit}
          colorClass="bg-gradient-to-r from-amber-500 to-[#C9A84C]"
        />

        {/* Guests This Month */}
        <UsageProgress
          label="Guests This Month"
          used={guestsUsed}
          limit={guestsLimit}
          colorClass="bg-gradient-to-r from-[#7A9E7E] to-emerald-600"
        />

        {/* Messages Sent */}
        <UsageProgress
          label="Messages Sent"
          used={messagesUsed}
          limit={messagesLimit}
          colorClass="bg-gradient-to-r from-[#9070c0] to-indigo-600"
        />
      </div>
    </div>
  );
}
