"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

function EditorRedirectContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (authLoading) return;

    const templateId = searchParams?.get("template") || searchParams?.get("templateId") || "botanical-sketch-art";
    const isGuest = searchParams?.get("guest") === "true" || !user;

    try {
      localStorage.setItem("pending_template_id", templateId);
      sessionStorage.setItem("pending_template_id", templateId);
      
      const guestDraft = {
        type: "template",
        templateId,
        templateName: templateId.replace(/-/g, " "),
      };
      localStorage.setItem("guestEventDraft", JSON.stringify(guestDraft));
      sessionStorage.setItem("guestEventDraft", JSON.stringify(guestDraft));
    } catch (e) {
      console.warn("Storage write error in /editor:", e);
    }

    const tier = searchParams?.get("tier") || "premium";

    // Route to Canvas Editor
    const targetUrl = isGuest
      ? `/canvas?guest=true&templateId=${encodeURIComponent(templateId)}&tier=${encodeURIComponent(tier)}`
      : `/dashboard/invitations?studio=true&templateId=${encodeURIComponent(templateId)}&tier=${encodeURIComponent(tier)}`;

    router.replace(targetUrl);
  }, [user, authLoading, router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 font-sans">
          Loading Canvas Editor...
        </p>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] dark:bg-neutral-950">
          <div className="w-8 h-8 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        </div>
      }
    >
      <EditorRedirectContent />
    </Suspense>
  );
}
