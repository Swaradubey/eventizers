import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side CORS image proxy.
 *
 * GET /api/proxy-image?url=<encoded_image_url>
 *
 * Fetches a remote (or internal) image server-side and re-serves it with
 * permissive CORS headers so HTML5 / Fabric.js / Konva canvases can draw it
 * without tainting the canvas. Handles redirects, timeouts, mixed content,
 * missing/incorrect MIME types (sniffed from magic bytes), SVG and WebP.
 */

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Cross-Origin-Resource-Policy": "cross-origin",
  "X-Content-Type-Options": "nosniff",
};

const SUCCESS_CACHE_HEADERS = {
  // Proxied immutable content: cached at client and CDN edge
  "Cache-Control": "public, max-age=31536000, immutable",
  "CDN-Cache-Control": "public, max-age=31536000, immutable",
};

const ERROR_CACHE_HEADERS = {
  // Errors must NEVER be cached as immutable!
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const ACCEPT_HEADER = "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8";

const FETCH_TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 5;

/** Returns a structured JSON error response with non-caching headers and permissive CORS */
const jsonErrorResponse = (message: string, status: number, extra: Record<string, any> = {}) =>
  NextResponse.json(
    {
      error: message,
      status,
      ...extra,
    },
    {
      status,
      headers: {
        ...CORS_HEADERS,
        ...ERROR_CACHE_HEADERS,
      },
    }
  );

/**
 * Resolves relative / localhost URLs against the current origin or the
 * configured backend so the proxy works both locally and on Vercel.
 */
const resolveTargetUrl = (targetUrl: string, reqOrigin: string): string => {
  const backendBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/api\/?$/, "") ||
    process.env.BACKEND_PUBLIC_URL?.replace(/\/api\/?$/, "") ||
    process.env.BACKEND_URL?.replace(/\/api\/?$/, "");

  if (targetUrl.startsWith("/")) {
    if (targetUrl.startsWith("/uploads/") && backendBase && !backendBase.includes("localhost")) {
      return `${backendBase}${targetUrl}`;
    }
    return `${reqOrigin}${targetUrl}`;
  }

  if (targetUrl.startsWith("http://localhost:") || targetUrl.startsWith("http://127.0.0.1:")) {
    // In production localhost is unreachable from the serverless runtime.
    if (targetUrl.includes("/assets/") || targetUrl.includes("/templates/")) {
      const pathOnly = targetUrl.replace(/^https?:\/\/[^/]+/, "");
      return `${reqOrigin}${pathOnly}`;
    }
    if (backendBase && !backendBase.includes("localhost")) {
      const pathOnly = targetUrl.replace(/^https?:\/\/[^/]+/, "");
      return `${backendBase}${pathOnly}`;
    }
    return targetUrl;
  }

  // External backend hostnames prepended to frontend asset paths
  if (targetUrl.includes("/assets/templates/") || targetUrl.includes("/templates/")) {
    const pathMatch = targetUrl.match(/(\/(assets|templates)\/.*)$/);
    if (pathMatch) {
      return `${reqOrigin}${pathMatch[1]}`;
    }
  }

  return targetUrl;
};

const isHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Detects the real image MIME type from magic bytes so a wrong or missing
 * upstream Content-Type header (application/octet-stream, text/plain, ...)
 * never breaks <img> / canvas decoding.
 */
const sniffImageContentType = (bytes: Uint8Array, declared: string | null): string | null => {
  const cleanDeclared = (declared || "").split(";")[0].trim().toLowerCase();
  if (cleanDeclared.startsWith("image/") && cleanDeclared !== "image/") {
    // Trust a specific declared image type (SVG included) unless bytes contradict it
    if (cleanDeclared !== "image/svg+xml" || bytes.length > 0) return cleanDeclared;
  }

  const has = (...seq: number[]) => seq.every((b, i) => bytes[i] === b);

  // PNG
  if (has(0x89, 0x50, 0x4e, 0x47)) return "image/png";
  // JPEG
  if (has(0xff, 0xd8, 0xff)) return "image/jpeg";
  // GIF
  if (has(0x47, 0x49, 0x46, 0x38)) return "image/gif";
  // BMP
  if (has(0x42, 0x4d)) return "image/bmp";
  // ICO
  if (has(0x00, 0x00, 0x01, 0x00)) return "image/x-icon";
  // WEBP: "RIFF" .... "WEBP"
  if (has(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50)
    return "image/webp";
  // AVIF / HEIC family: ....ftypavif / ftypheic
  if (bytes.length > 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const brand = String.fromCharCode(...Array.from(bytes.slice(8, 12)));
    if (brand.startsWith("avif") || brand.startsWith("avis")) return "image/avif";
    if (brand.startsWith("heic") || brand.startsWith("heix") || brand.startsWith("hevc")) return "image/heic";
  }

  // SVG / XML: scan the first 512 bytes of text
  const head = Buffer.from(bytes.subarray(0, Math.min(bytes.length, 512))).toString("utf8").trimStart();
  if (head.startsWith("<svg") || head.startsWith("<?xml") || head.toLowerCase().includes("<svg")) {
    return "image/svg+xml";
  }

  return null;
};

/**
 * Fetches a URL following up to MAX_REDIRECTS redirects manually so every
 * hop can be protocol-validated, with a hard overall deadline.
 */
const fetchImage = async (url: string, deadline: number): Promise<Response> => {
  let currentUrl = url;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw Object.assign(new Error("Image fetch timed out"), { isTimeout: true });

    const res = await fetch(currentUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: ACCEPT_HEADER,
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": new URL(currentUrl).origin + "/",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(remaining),
      cache: "no-store",
    });

    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      // Drain the body so sockets are released
      try { await res.arrayBuffer(); } catch { /* ignore */ }
      const nextUrl = new URL(location, currentUrl).toString();
      if (!isHttpUrl(nextUrl)) {
        throw Object.assign(new Error("Redirected to a non-HTTP protocol"), { isClientError: true });
      }
      currentUrl = nextUrl;
      continue;
    }

    return res;
  }

  throw Object.assign(new Error("Too many redirects"), { isClientError: true });
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  // 1. Validate incoming URL parameter
  if (!rawUrl || typeof rawUrl !== "string" || !rawUrl.trim()) {
    return jsonErrorResponse("Missing required 'url' query parameter", 400);
  }

  const resolvedUrl = resolveTargetUrl(rawUrl.trim(), req.nextUrl.origin);

  if (!isHttpUrl(resolvedUrl)) {
    return jsonErrorResponse("Invalid URL provided: only HTTP and HTTPS protocols are allowed", 400, {
      providedUrl: rawUrl,
    });
  }

  const deadline = Date.now() + FETCH_TIMEOUT_MS;

  try {
    let upstreamRes: Response | null = null;

    try {
      upstreamRes = await fetchImage(resolvedUrl, deadline);
    } catch (err: any) {
      if (err?.isTimeout || err?.name === "TimeoutError" || err?.name === "AbortError") {
        return jsonErrorResponse("Upstream image request timed out", 504, { url: resolvedUrl });
      }
      // Mixed-content / dead plain-http upstream: retry once over HTTPS
      if (resolvedUrl.startsWith("http://") && !resolvedUrl.includes("localhost") && !resolvedUrl.includes("127.0.0.1")) {
        upstreamRes = await fetchImage(resolvedUrl.replace(/^http:\/\//i, "https://"), deadline);
      } else {
        throw err;
      }
    }

    // 2. Upstream status check — return clean JSON error on non-200
    if (!upstreamRes || !upstreamRes.ok) {
      const status = upstreamRes && upstreamRes.status >= 400 && upstreamRes.status < 600 ? upstreamRes.status : 502;
      return jsonErrorResponse(
        `Upstream returned status ${upstreamRes ? upstreamRes.status : "no response"}`,
        status,
        { url: resolvedUrl, upstreamStatus: upstreamRes?.status || 502 }
      );
    }

    const declaredType = upstreamRes.headers.get("content-type");
    const buffer = new Uint8Array(await upstreamRes.arrayBuffer());

    if (buffer.byteLength === 0) {
      return jsonErrorResponse("Upstream returned an empty image body", 502, { url: resolvedUrl });
    }

    const contentType = sniffImageContentType(buffer, declaredType);
    if (!contentType) {
      return jsonErrorResponse(
        `Upstream did not return a valid supported image format (content-type: ${declaredType || "unknown"})`,
        415,
        { url: resolvedUrl }
      );
    }

    // 3. Success: pipe image buffer with CORS and long-term cache headers
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        ...SUCCESS_CACHE_HEADERS,
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (err: any) {
    if (err?.isTimeout || err?.name === "TimeoutError" || err?.name === "AbortError") {
      return jsonErrorResponse("Upstream image request timed out", 504, { url: resolvedUrl });
    }
    if (err?.isClientError) {
      return jsonErrorResponse(err.message || "Invalid image URL", 400, { url: resolvedUrl });
    }
    console.warn("[proxy-image] Failed to fetch remote image:", resolvedUrl, err?.message);
    return jsonErrorResponse(err?.message || "Failed to fetch image", 502, { url: resolvedUrl });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
