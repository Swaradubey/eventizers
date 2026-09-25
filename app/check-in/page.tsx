import { redirect } from "next/navigation";

export default function CheckInRedirectPage() {
  redirect("/dashboard/check-in");
}
