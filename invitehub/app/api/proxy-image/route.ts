import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Lightweight image proxy endpoint to bypass CORS restrictions for external template images.
 * Ensures external image URLs load smoothly in HTML5 Canvas, Fabric.js, and <img> elements.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl || typeof rawUrl !== "string") {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  const targetUrl = rawUrl.trim();

  // Validate URL protocol
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return new NextResponse("Invalid protocol: only HTTP and HTTPS allowed", { status: 400 });
    }
  } catch {
    return new NextResponse("Invalid URL provided", { status: 400 });
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    if (!upstreamRes.ok) {
      return new NextResponse(`Upstream returned ${upstreamRes.status}`, {
        status: upstreamRes.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const contentType = upstreamRes.headers.get("content-type") || "image/png";
    const arrayBuffer = await upstreamRes.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: any) {
    console.warn("[proxy-image] Failed to fetch remote image:", targetUrl, err?.message);
    return new NextResponse(err?.message || "Failed to fetch image", {
      status: 502,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
