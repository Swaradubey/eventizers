import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Lightweight, resilient image proxy endpoint to bypass CORS and Mixed-Content restrictions
 * for template images, external artwork links, and uploads.
 * Ensures image URLs load smoothly in HTML5 Canvas, Fabric.js, and <img> elements.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl || typeof rawUrl !== "string") {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  const targetUrl = rawUrl.trim();
  const reqOrigin = req.nextUrl.origin;

  // Resolve relative URLs or localhost URLs dynamically
  let resolvedUrl = targetUrl;

  if (targetUrl.startsWith("/")) {
    resolvedUrl = `${reqOrigin}${targetUrl}`;
  } else if (targetUrl.startsWith("http://localhost:") || targetUrl.startsWith("http://127.0.0.1:")) {
    // If running in production (e.g. on Vercel), localhost is unreachable.
    // 1) If it's an asset or template path, route to current frontend origin
    if (targetUrl.includes("/assets/") || targetUrl.includes("/templates/")) {
      const pathOnly = targetUrl.replace(/^https?:\/\/[^/]+/, "");
      resolvedUrl = `${reqOrigin}${pathOnly}`;
    } else {
      // 2) If it's an upload path, route to public backend if configured
      const backendBase =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
        process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/api\/?$/, "") ||
        process.env.BACKEND_PUBLIC_URL?.replace(/\/api\/?$/, "") ||
        process.env.BACKEND_URL?.replace(/\/api\/?$/, "");
      if (backendBase && !backendBase.includes("localhost")) {
        const pathOnly = targetUrl.replace(/^https?:\/\/[^/]+/, "");
        resolvedUrl = `${backendBase}${pathOnly}`;
      }
    }
  } else if (targetUrl.includes("/assets/templates/") || targetUrl.includes("/templates/")) {
    // If an external backend hostname was prepended to frontend assets, resolve from frontend
    const pathMatch = targetUrl.match(/(\/(assets|templates)\/.*)$/);
    if (pathMatch) {
      resolvedUrl = `${reqOrigin}${pathMatch[1]}`;
    }
  }

  // Validate URL protocol
  try {
    const parsed = new URL(resolvedUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return new NextResponse("Invalid protocol: only HTTP and HTTPS allowed", { status: 400 });
    }
  } catch {
    return new NextResponse("Invalid URL provided", { status: 400 });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Cross-Origin-Resource-Policy": "cross-origin",
  };

  try {
    let upstreamRes = await fetch(resolvedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    // If HTTP failed and protocol was HTTP, try HTTPS upgrade
    if (!upstreamRes.ok && resolvedUrl.startsWith("http://") && !resolvedUrl.includes("localhost")) {
      const httpsUrl = resolvedUrl.replace(/^http:\/\//i, "https://");
      try {
        const retryRes = await fetch(httpsUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          },
        });
        if (retryRes.ok) {
          upstreamRes = retryRes;
        }
      } catch (_) {}
    }

    if (!upstreamRes.ok) {
      return new NextResponse(`Upstream returned ${upstreamRes.status}`, {
        status: upstreamRes.status,
        headers: corsHeaders,
      });
    }

    const contentType = upstreamRes.headers.get("content-type") || "image/png";
    const arrayBuffer = await upstreamRes.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: any) {
    console.warn("[proxy-image] Failed to fetch remote image:", resolvedUrl, err?.message);
    return new NextResponse(err?.message || "Failed to fetch image", {
      status: 502,
      headers: corsHeaders,
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
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}
