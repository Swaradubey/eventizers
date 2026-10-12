"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CreateEventModal from "@/components/invitation/CreateEventModal";

function CreateEventPageContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || searchParams.get("templateId") || "grad";
  const photoUrl = searchParams.get("photo") || searchParams.get("photoUrl") || undefined;
  const initialMode = (searchParams.get("mode") as any) || "video";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <CreateEventModal
        isOpen={true}
        initialTemplateId={templateId}
        initialPhotoUrl={photoUrl}
        initialMode={initialMode}
      />
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          Loading AI Video Studio...
        </div>
      }
    >
      <CreateEventPageContent />
    </Suspense>
  );
}
