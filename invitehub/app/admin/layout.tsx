"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import SparkleEffect from "../../components/SparkleEffect";
import ForbiddenAccess from "../../components/ForbiddenAccess";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  const { user, loading: authLoading } = useAuth();

  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  const isStaffCoHost =
    user?.role === "STAFF_COHOST" || user?.role === "COHOST" || user?.role === "STAFF";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-100/80 flex text-slate-900">
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
        {!authLoading && isStaffCoHost ? (
          <ForbiddenAccess
            title="Administrator Area Restricted"
            message="Your account is assigned the Staff / Co-Host role. Platform administration, user role controls, and global settings require administrator privileges."
            redirectPath="/dashboard/check-in"
            redirectLabel="Return to Staff Portal"
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
