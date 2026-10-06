import { NextRequest, NextResponse } from "next/server";

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

/**
 * POST /api/events/:id/send-preview-email
 *
 * Emails the signed-in host a preview of their own invitation. Proxies to the
 * authenticated backend endpoints so the browser only ever talks to Next.js
 * and the bearer token stays server-side.
 *
 * Body: { recipientEmail: string, invitationId?: string }
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

    const sendResponse = await fetch(
      `${backendBase}/invitations/${encodeURIComponent(invitationId)}/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
          Accept: "application/json",
        },
        body: JSON.stringify({ recipients: [recipientEmail] }),
        cache: "no-store",
      }
    );

    const data = await sendResponse.json().catch(() => null);
    if (!sendResponse.ok || data?.success === false) {
      const message =
        data?.error || data?.message || "Could not send the preview email.";
      return NextResponse.json(
        { success: false, error: message },
        { status: sendResponse.status >= 400 ? sendResponse.status : 502 }
      );
    }

    return NextResponse.json({
      success: true,
      recipientEmail,
      recipientCount: data?.recipientCount ?? 1,
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
