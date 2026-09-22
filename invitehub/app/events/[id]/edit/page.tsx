import { redirect } from "next/navigation";

export default function EditEventRedirectPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { templateId?: string };
}) {
  const templateId = searchParams?.templateId;
  const tplQuery = templateId ? `&templateId=${encodeURIComponent(templateId)}` : "";
  redirect(`/dashboard/invitations?eventId=${params.id}&studio=true${tplQuery}`);
}
