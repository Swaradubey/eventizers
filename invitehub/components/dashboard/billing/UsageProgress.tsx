"use client";

import React from "react";
import { motion } from "framer-motion";

interface UsageProgressProps {
  label: string;
  used: number;
  limit: number;
  colorClass?: string;
  bgColorClass?: string;
}

export default function UsageProgress({
  label,
  used,
  limit,
  colorClass = "bg-[#2D1B3D]",
  bgColorClass = "bg-[#F0EBE8]"
}: UsageProgressProps) {
  const isUnlimited = limit === -1 || limit === null;
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const limitLabel = isUnlimited ? "Unlimited" : limit.toLocaleString();

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm font-medium">
        <span className="text-[#2D1B3D]/70">{label}</span>
        <span className="text-[#2D1B3D] font-bold">
          {used.toLocaleString()} <span className="text-[#2D1B3D]/40 font-normal">/ {limitLabel}</span>
        </span>
      </div>
      <div className={`w-full h-3 rounded-full overflow-hidden ${bgColorClass}`}>
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
