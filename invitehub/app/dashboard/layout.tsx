"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import SparkleEffect from "../../components/SparkleEffect";
import ForbiddenAccess from "../../components/ForbiddenAccess";
import { Loader2 } from "lucide-react";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const isStaffCoHost =
    user?.role === "STAFF_COHOST" || user?.role === "COHOST" || user?.role === "STAFF";

  // Allowed operational routes for Staff / Co-Host
  const staffAllowedPrefixes = [
    "/dashboard/check-in",
    "/dashboard/gps-checkin",
    "/dashboard/guests",
    "/dashboard/messages",
    "/dashboard/reports",
  ];

  const isStaffAllowedRoute = staffAllowedPrefixes.some(
    (prefix) =>
      pathname === prefix ||
      pathname?.startsWith(prefix + "/") ||
      pathname?.startsWith(prefix + "?")
  );

  // Clean redirect from root /dashboard to /dashboard/check-in for Staff
  useEffect(() => {
    if (!authLoading && isStaffCoHost) {
      if (pathname === "/dashboard" || pathname === "/dashboard/") {
        router.replace("/dashboard/check-in");
      }
    }
  }, [authLoading, isStaffCoHost, pathname, router]);

  const isStaffRootRedirecting =
    !authLoading && isStaffCoHost && (pathname === "/dashboard" || pathname === "/dashboard/");

  const isAccessForbiddenForStaff =
    !authLoading && isStaffCoHost && !isStaffAllowedRoute && !isStaffRootRedirecting;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-sky-50/40 to-indigo-50/60 flex text-slate-800">
      {/* Responsive Left Sidebar */}
      <Sidebar />

      {/* Sparkle effect on login */}
      <SparkleEffect />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${
          isCollapsed ? "md:pl-[72px]" : "md:pl-[260px]"
        }`}
      >
        {isStaffRootRedirecting ? (
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs font-medium text-slate-500">Redirecting to Check-In Portal...</p>
            </div>
          </div>
        ) : isAccessForbiddenForStaff ? (
          <ForbiddenAccess
            title="Access Restricted"
            message="Staff / Co-Host accounts are restricted to operational event check-in, guest management, attendee messaging, and attendance reports."
            redirectPath="/dashboard/check-in"
            redirectLabel="Return to Check-In Portal"
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
