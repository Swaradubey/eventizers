import { NextRequest, NextResponse } from "next/server";
import { dataUrlToCardImage, fetchCardImage, sendPreviewEmail } from "@/lib/previewEmail";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function backendApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_PUBLIC_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:5000/api"
  )
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");
}

function formatDate(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function appBase(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (configured) return configured.replace(/\/+$/, "");
  return request.nextUrl.origin;
}

/**
 * POST /api/events/:id/send-preview-email
 *
 * Emails the signed-in host an Evite-style PREVIEW of their own invitation.
 * The rendered card snapshot is embedded as an inline CID attachment
 * (`cid:invitation-preview-card`) and the message carries a preview banner —
 * no guest ever receives an invitation from this endpoint.
 *
 * Body: { recipientEmail, invitationId?, cardSnapshot?, eventTitle?, ... }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Missing event id." },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization") || "";
    if (!/^bearer\s+\S+/i.test(authHeader)) {
      return NextResponse.json(
        { success: false, error: "You need to sign in to send a preview email." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const recipientEmail = String(body?.recipientEmail || "").trim().toLowerCase();
    if (!EMAIL_RE.test(recipientEmail)) {
      return NextResponse.json(
        { success: false, error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const backendBase = backendApiBase();
    let invitationId = body?.invitationId ? String(body.invitationId).trim() : "";

    if (!invitationId) {
      const lookup = await fetch(
        `${backendBase}/events/${encodeURIComponent(eventId)}/invitation`,
        {
          headers: { Authorization: authHeader, Accept: "application/json" },
          cache: "no-store",
        }
      );
      const data = await lookup.json().catch(() => null);
      invitationId = data?.invitation?.id || "";
      if (!lookup.ok || !invitationId) {
        return NextResponse.json(
          {
            success: false,
            error: "Save your invitation before sending yourself a preview.",
          },
          { status: 404 }
        );
      }
    }

    // ── Canonical event + invitation details (public read, no guest data) ──
    let invitation: any = null;
    let event: any = null;
    try {
      const details = await fetch(
        `${backendBase}/invitations/public/${encodeURIComponent(invitationId)}`,
        { headers: { Accept: "application/json" }, cache: "no-store" }
      );
      const data = await details.json().catch(() => null);
      if (details.ok && data?.success) {
        invitation = data.invitation || null;
        event = data.event || null;
      }
    } catch {
      // fall through to client-provided details
    }

    const eventTitle =
      String(body?.eventTitle || invitation?.title || event?.title || "You're Invited").trim();

    // ── Card snapshot → inline CID attachment ───────────────────────────────
    let cardImage = dataUrlToCardImage(body?.cardSnapshot);
    if (!cardImage) {
      cardImage = await fetchCardImage(
        invitation?.imageUrl || event?.previewUrl || event?.coverImage || null
      );
    }

    const venue = String(body?.venue || event?.venue || invitation?.eventVenue || "").trim();
    const address = [
      event?.address,
      event?.city,
      event?.state,
      event?.country,
    ]
      .filter(Boolean)
      .join(", ");

    const previewInput = {
      to: recipientEmail,
      hostName: String(body?.hostName || event?.hostName || "").trim(),
      eventTitle,
      eventSubtitle:
        String(body?.eventSubtitle || invitation?.subtitle || event?.eventType || "").trim() ||
        undefined,
      dateLabel: formatDate(body?.eventDate || event?.eventDate || invitation?.eventDate),
      timeLabel: formatTime(body?.eventTime || event?.eventTime || invitation?.eventTime),
      venue: venue || undefined,
      address: address || undefined,
      accentColor: invitation?.accentColor || undefined,
      buttonColor: invitation?.buttonColor || undefined,
      buttonRadius:
        typeof invitation?.buttonRadius === "number" ? invitation.buttonRadius : undefined,
      rsvpUrl: `${appBase(request)}/invitation/${encodeURIComponent(
        invitation?.id || invitationId
      )}?mode=guest`,
      cardImage,
    };

    let result;
    try {
      result = await sendPreviewEmail(previewInput);
    } catch (error: any) {
      console.error("[send-preview-email] Dispatch failed:", error?.message);
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not send the preview email. Check the SMTP configuration (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) and try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      recipientEmail,
      recipientCount: 1,
      messageId: result.messageId || null,
      transport: result.transport,
      hasCardSnapshot: Boolean(cardImage),
      message: `Preview email sent to ${recipientEmail}`,
    });
  } catch (error: any) {
    console.error("[send-preview-email] Error:", error?.message);
    return NextResponse.json(
      {
        success: false,
        error: "Could not reach the invitation service. Please try again.",
      },
      { status: 502 }
    );
  }
}
