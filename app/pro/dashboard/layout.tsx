import type { Metadata } from "next";
import OrganizerShell from "@/components/pro/OrganizerShell";

export const metadata: Metadata = {
  title: "Organizer dashboard | Eventizers Pro",
  description: "Run every event, channel and campaign from one place.",
};

export default function ProDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OrganizerShell>{children}</OrganizerShell>;
}
