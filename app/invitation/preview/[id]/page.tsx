import InvitePage, { generateMetadata } from "@/app/invite/[id]/page";
import GuestPreviewShell from "@/components/invitation/GuestPreviewShell";
import { fetchInvitation } from "@/lib/publicInvitation";

export const dynamic = "force-dynamic";
export { generateMetadata };

type SearchParams = { [key: string]: string | string[] | undefined };

function pickParam(searchParams: SearchParams, ...keys: string[]): string {
  for (const key of keys) {
    const raw = searchParams?.[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    const trimmed = (value || "").toString().trim();
    if (trimmed) return trimmed.slice(0, 80);
  }
  return "";
}

/**
 * Review-stage guest preview entry point.
 * Renders the interactive envelope viewer inside the Evite-style preview shell
 * (Desktop / Mobile viewport toggle bar) so the host sees exactly what a guest
 * receives — envelope opening animation, event details, RSVP controls.
 */
export default async function InvitationPreviewPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: SearchParams;
}) {
  const invitationId = params?.id as string;
  const guestName = pickParam(searchParams, "to", "guest", "name");
  const rawMode = searchParams?.mode;
  const modeValue = (Array.isArray(rawMode) ? rawMode[0] : rawMode || "").toString().toLowerCase();
  const guestMode = modeValue === "guest" ? true : modeValue === "host" ? false : true;

  const data = await fetchInvitation(invitationId);

  if (!data) {
    return <InvitePage params={params} searchParams={searchParams} />;
  }

  return (
    <GuestPreviewShell
      invitationId={invitationId}
      initialData={data}
      guestName={guestName}
      guestMode={guestMode}
    />
  );
}
