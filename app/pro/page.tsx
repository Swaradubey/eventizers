import type { Metadata } from "next";
import ProLanding from "@/components/pro/ProLanding";

export const metadata: Metadata = {
  title: "Eventizers Pro | Promote, track and sell out every event",
  description:
    "Post to every channel from one place, see which post sold each ticket, manage leads and conversations, and let AI fix slow sales. Plans from $29 a month.",
  openGraph: {
    title: "Eventizers Pro | Promote, track and sell out every event",
    description: "The AI platform for event experiences. One photo, one unforgettable invite.",
    type: "website",
  },
};

export default function ProPage() {
  return <ProLanding />;
}
