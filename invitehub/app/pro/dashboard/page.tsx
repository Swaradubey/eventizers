import type { Metadata } from "next";
import ProDashboard from "@/components/pro/ProDashboard";

export const metadata: Metadata = {
  title: "Organizer dashboard | Eventizers Pro",
  description: "Run every event, channel and campaign from one place.",
};

export default function ProDashboardPage() {
  return <ProDashboard />;
}
