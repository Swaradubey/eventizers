"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "../../../context/SidebarContext";
import Sidebar from "../../../components/Sidebar";

function AdminDashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex text-[#2D1B3D]">
      {/* Responsive Left Sidebar */}
      <Sidebar />

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

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminDashboardLayoutContent>{children}</AdminDashboardLayoutContent>
    </SidebarProvider>
  );
}
