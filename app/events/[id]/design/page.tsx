"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EventDesignRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id;

  useEffect(() => {
    if (eventId) {
      router.replace(`/dashboard/invitations?eventId=${eventId}`);
    } else {
      router.replace("/dashboard/invitations");
    }
  }, [eventId, router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-600">Loading Invitation Designer...</p>
      </div>
    </div>
  );
}
