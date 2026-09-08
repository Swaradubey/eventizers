"use client";

import React, { useEffect } from "react";
import AttendanceCommitmentDashboard from "../../../components/AttendanceCommitmentDashboard";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AttendanceCommitmentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Auth protection: redirect to /login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faff]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#5b45f4] animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading Attendance Commitment...</p>
        </div>
      </div>
    );
  }

  return (
    <AttendanceCommitmentDashboard
      showNavbar={true}
      showBottomNav={false}
    />
  );
}
