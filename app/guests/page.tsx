import { redirect } from "next/navigation";

export default function GuestsRedirectPage() {
  redirect("/dashboard/guests");
}
