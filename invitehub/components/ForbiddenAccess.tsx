"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface ForbiddenAccessProps {
  title?: string;
  message?: string;
  redirectPath?: string;
  redirectLabel?: string;
}

export default function ForbiddenAccess({
  title = "Access Restricted",
  message = "Staff / Co-Host accounts are restricted to operational event check-in, guest management, attendee messaging, and attendance reports.",
  redirectPath = "/dashboard/check-in",
  redirectLabel = "Go to Check-In Portal",
}: ForbiddenAccessProps) {
  return (
    <div className="flex-1 min-h-[80vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white rounded-2xl border border-red-100 shadow-xl shadow-red-500/5 p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200/60 text-red-700 text-xs font-semibold mb-3">
          <span>Error 403</span>
          <span className="w-1 h-1 rounded-full bg-red-400" />
          <span>Insufficient Permissions</span>
        </div>

        <h1 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
          {title}
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {message}
        </p>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left mb-6">
          <p className="text-xs font-semibold text-slate-700 mb-2">Allowed Operational Features:</p>
          <ul className="text-xs text-slate-600 space-y-1.5">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>QR & Manual Guest Check-in</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Attendee List & Status Tracking</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Guest Broadcasts & Communications</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Event Attendance & Check-in Reports</span>
            </li>
          </ul>
        </div>

        <Link
          href={redirectPath}
          className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
        >
          <ArrowLeft className="w-4 h-4" />
          {redirectLabel}
        </Link>
      </motion.div>
    </div>
  );
}
