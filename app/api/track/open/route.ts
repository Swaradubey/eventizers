import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guestId = searchParams.get("guestId");
  const eventId = searchParams.get("eventId");

  // Call backend tracking endpoint if guestId is provided
  if (guestId) {
    try {
      const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const baseUrl = rawApiUrl.replace(/\/+$/, "");
      const targetUrl = `${baseUrl}/track/open?guestId=${encodeURIComponent(guestId)}${
        eventId ? `&eventId=${encodeURIComponent(eventId)}` : ""
      }`;

      await fetch(targetUrl, {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
      }).catch((err) => {
        console.warn("[Next.js Track API] Forwarding to backend failed:", err.message);
      });
    } catch (error) {
      console.error("[Next.js Track API] Error updating open tracking status:", error);
    }
  }

  // Return a 1x1 transparent GIF buffer
  const transparentPixelBuffer = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );

  return new NextResponse(transparentPixelBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": transparentPixelBuffer.length.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
