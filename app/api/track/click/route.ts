import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guestId = searchParams.get("guestId");
  const eventId = searchParams.get("eventId");
  const target = searchParams.get("target");

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
  let redirectUrl = appUrl;

  if (target) {
    try {
      redirectUrl = decodeURIComponent(target);
    } catch {
      redirectUrl = target;
    }
  } else if (eventId) {
    redirectUrl = `${appUrl}/invitation/${eventId}`;
  }

  // Call backend click tracking endpoint if guestId is provided
  if (guestId) {
    try {
      const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const baseUrl = rawApiUrl.replace(/\/+$/, "");
      const backendTarget = `${baseUrl}/track/click?guestId=${encodeURIComponent(guestId)}${
        eventId ? `&eventId=${encodeURIComponent(eventId)}` : ""
      }`;

      await fetch(backendTarget, {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
        redirect: "manual",
      }).catch((err) => {
        console.warn("[Next.js Click Track API] Forwarding to backend failed:", err.message);
      });
    } catch (error) {
      console.error("[Next.js Click Track API] Error updating click tracking status:", error);
    }
  }

  return NextResponse.redirect(new URL(redirectUrl, req.url));
}
