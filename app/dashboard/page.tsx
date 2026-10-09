import type { Metadata } from "next";
import IndividualOverview from "@/components/dashboard/IndividualOverview";

export const metadata: Metadata = {
  title: "Dashboard | Eventizers",
  description: "Manage your events, invitations, ticket sales, and guest check-ins.",
};

export default function DashboardPage() {
  return <IndividualOverview />;
}
