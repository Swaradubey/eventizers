"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role === "GUEST") {
        router.replace("/dashboard/guest");
      } else if (
        user.role === "STAFF_COHOST" ||
        user.role === "COHOST" ||
        user.role === "STAFF"
      ) {
        router.replace("/dashboard/check-in");
      } else {
        router.replace("/dashboard/ai-assistant");
      }
    }
  }, [user, authLoading, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
