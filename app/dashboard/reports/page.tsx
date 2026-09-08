import { Suspense } from "react";
import { ReportsContent } from "./ReportsContent";

/**
 * Page-level server component.
 *
 * Wrapping ReportsContent (which calls useSearchParams()) inside <Suspense>
 * here — in a server component with NO "use client" directive — is what
 * Next.js requires to avoid the static-generation bail-out error:
 *   "useSearchParams() should be wrapped in a suspense boundary"
 *
 * The "use client" directive lives exclusively in ReportsContent.tsx.
 */
export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8faff] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-600">Loading reports...</p>
          </div>
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
