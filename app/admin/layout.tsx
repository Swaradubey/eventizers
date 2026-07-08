"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, useSidebar } from "../../invitehub/context/SidebarContext";
import Sidebar from "../../invitehub/components/Sidebar";
import SparkleEffect from "../../invitehub/components/SparkleEffect";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex text-[#2D1B3D]">
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
        {children}
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
