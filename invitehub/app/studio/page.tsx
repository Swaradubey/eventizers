"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function StudioRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set("studio", "true");
    router.replace(`/dashboard/invitations?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-400 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading Invitation Studio Canvas...</p>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
          <div className="w-10 h-10 border-4 border-indigo-400 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      }
    >
      <StudioRedirectContent />
    </Suspense>
  );
}
