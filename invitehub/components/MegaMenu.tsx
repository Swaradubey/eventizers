"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Ticket, QrCode, Gift, ShieldCheck, BarChart3 } from "lucide-react";

export const featureItems = [
  {
    title: "Invitations & RSVP",
    description: "Beautiful invites with Smart RSVP",
    icon: Mail,
    href: "/features/invitations-rsvp",
  },
  {
    title: "Ticketing",
    description: "Sell tickets and manage tiers",
    icon: Ticket,
    href: "/features/ticketing",
  },
  {
    title: "Check-In",
    description: "QR + GPS guest check-in",
    icon: QrCode,
    href: "/features/check-in",
  },
  {
    title: "Registries",
    description: "Gift, cash and donation funds",
    icon: Gift,
    href: "/features/registries",
  },
  {
    title: "Security Center",
    description: "Fraud & attendance protection",
    icon: ShieldCheck,
    href: "/features/security-center",
  },
  {
    title: "Analytics",
    description: "Track RSVPs and performance",
    icon: BarChart3,
    href: "/features/analytics",
  },
];

interface MegaMenuProps {
  onClose: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export default function MegaMenu({ onClose, onKeyDown }: MegaMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[720px] bg-white border border-[#E5E7EB]/60 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] z-50 p-6 font-body"
      onKeyDown={onKeyDown}
      role="menu"
      aria-label="Features Submenu"
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {featureItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              onClick={onClose}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-[#F8FAFF] hover:-translate-y-0.5 cursor-pointer transition-all duration-200 ease-in-out group"
              role="menuitem"
              tabIndex={0}
            >
              {/* Icon Container */}
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#EEF2FF] flex items-center justify-center transition-colors group-hover:bg-[#E0E7FF]">
                <IconComponent className="w-5 h-5 text-[#6366F1]" />
              </div>
              {/* Text */}
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm text-[#111827] group-hover:text-[#6366F1] transition-colors">
                  {item.title}
                </span>
                <span className="text-xs text-[#6B7280] leading-relaxed">
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
