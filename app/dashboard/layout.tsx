"use client";

import React from "react";
import { SidebarProvider } from "../../context/SidebarContext";
import IndividualShell from "@/components/dashboard/IndividualShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <IndividualShell>{children}</IndividualShell>
    </SidebarProvider>
  );
}
