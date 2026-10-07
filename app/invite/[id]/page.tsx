import type { Metadata } from "next";
import InviteEnvelopeViewer from "@/components/invitation/InviteEnvelopeViewer";
import { getImageUrl } from "@/utils/imageUrl";
import { getTemplateImage } from "@/lib/templateImages";
import { fetchInvitation } from "@/lib/publicInvitation";

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

function pickGuest(searchParams: SearchParams): string {
  const raw = searchParams?.to ?? searchParams?.guest ?? searchParams?.name;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value || "").toString().trim().slice(0, 80);
}

function pickGuestMode(searchParams: SearchParams): boolean {
  const raw = searchParams?.mode;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value || "").toString().toLowerCase() === "guest";
}

function formatDate(raw?: string | null) {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(raw?: string | null) {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function resolveCardImage(invitation: any, event: any): string | null {
  const tpl = getTemplateImage(event?.selectedTemplateId);
  const raw = invitation?.imageUrl || event?.previewUrl || event?.coverImage || tpl;
  if (!raw || (typeof raw === "string" && (raw.includes("snapshot") || raw.startsWith("data:")))) {
    return tpl ? getImageUrl(tpl) : null;
  }
  return getImageUrl(raw);
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: SearchParams;
}): Promise<Metadata> {
  const data = await fetchInvitation(params?.id);
  if (!data) return { title: "You're Invited – InviteHub" };
  const title = data.invitation?.title || data.event?.title || "You're Invited";
  const description =
    data.invitation?.mainText || data.event?.description || "You have been invited to an event.";
  const guest = pickGuest(searchParams);
  return {
    title: `${title} – InviteHub`,
    description,
    openGraph: {
      title: guest ? `${title} for ${guest}` : title,
      description,
      images: resolveCardImage(data.invitation, data.event) ? [resolveCardImage(data.invitation, data.event)!] : [],
    },
  };
}

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: SearchParams;
}) {
  const invitationId = params?.id as string;
  const guestName = pickGuest(searchParams);
  const guestMode = pickGuestMode(searchParams);
  const data = await fetchInvitation(invitationId);

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-center px-6 font-sans">
        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#C9A84C]">
          InviteHub
        </span>
        <h1 className="mt-4 text-2xl font-bold text-[#2D1B3D]">Invitation Not Found</h1>
        <p className="mt-2 max-w-sm text-sm text-[#2D1B3D]/60">
          This invitation link may be invalid or has been removed.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#5B5FEF] shadow-md"
        >
          Visit InviteHub
        </a>
      </div>
    );
  }

  const invitation = data.invitation ?? {};
  const event = data.event ?? {};
  const title = invitation.title || event.title || "You're Invited";
  const subtitle = invitation.subtitle || event.eventType || "";
  const body = invitation.mainText || event.description || "";
  const accent = invitation.accentColor || "#C9A84C";
  const family =
    invitation.fontFamily && invitation.fontFamily !== "sans-serif"
      ? `'${invitation.fontFamily}', Georgia, serif`
      : "'Inter', system-ui, sans-serif";
  const dateLabel = formatDate(event.eventDate || invitation.eventDate);
  const timeLabel = formatTime(event.eventTime || invitation.eventTime);
  const venue = event.venue || invitation.eventVenue || "";
  const address = [event.address, event.city, event.state, event.country].filter(Boolean).join(", ");
  const cardImage = resolveCardImage(invitation, event);

  return (
    <>
      {/* No-JS: hide the animated viewer and reveal the static card below. */}
      <noscript>
        <style>{`.ih-animated-viewer{display:none!important}`}</style>
      </noscript>

      <div className="ih-animated-viewer">
        <InviteEnvelopeViewer
          invitationId={invitationId}
          initialData={data}
          guestName={guestName}
          guestMode={guestMode}
        />
      </div>

      <noscript>
        <div
          className="min-h-screen flex flex-col items-center justify-center px-4 py-12 font-sans"
          style={{ backgroundColor: invitation.backgroundColor || "#FAF8F5", color: invitation.textColor || "#1A1118" }}
        >
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-black/5">
            {cardImage && (
              <img
                src={cardImage}
                alt={title}
                className="w-full h-auto block"
                style={{ maxHeight: 420, objectFit: "cover" }}
              />
            )}
            <div className="p-7 sm:p-9 text-center">
              {guestName && (
                <p className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: accent }}>
                  Invitation for {guestName}
                </p>
              )}
              <h1 className="mt-3 leading-tight" style={{ fontFamily: family, fontSize: 34, fontWeight: 700 }}>
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1.5 text-sm font-semibold" style={{ color: accent }}>
                  {subtitle}
                </p>
              )}
              {body && <p className="mt-4 text-sm leading-relaxed text-gray-600">{body}</p>}

              <dl className="mt-6 space-y-3 text-left text-sm">
                {dateLabel && (
                  <div className="flex gap-3">
                    <dt className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Date
                    </dt>
                    <dd className="font-bold text-gray-900">{dateLabel}</dd>
                  </div>
                )}
                {timeLabel && (
                  <div className="flex gap-3">
                    <dt className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Time
                    </dt>
                    <dd className="font-bold text-gray-900">{timeLabel}</dd>
                  </div>
                )}
                {venue && (
                  <div className="flex gap-3">
                    <dt className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Venue
                    </dt>
                    <dd className="font-bold text-gray-900 break-words">
                      {venue}
                      {address && <span className="block font-normal text-gray-500">{address}</span>}
                    </dd>
                  </div>
                )}
              </dl>

              <a
                href={`/invitation/${invitation.id || invitationId}`}
                className="mt-7 inline-flex w-full items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg"
                style={{ backgroundColor: invitation.buttonColor || accent }}
              >
                {invitation.buttonText || "RSVP Now"}
              </a>
            </div>
          </div>

          <p className="mt-6 text-[11px] font-semibold opacity-55">
            Sent with <span style={{ color: accent }}>InviteHub</span>
          </p>
        </div>
      </noscript>
    </>
  );
}
