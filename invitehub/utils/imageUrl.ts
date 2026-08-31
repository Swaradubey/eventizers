
/**
 * Resolves the backend server origin from environment variables.
 * Strips any trailing path segments like `/api` so we get just the host origin
 * (e.g. `http://localhost:5000`).
 */
function getBackendOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  try {
    const parsed = new URL(raw);
    // Return just protocol + host (strips /api or any other path)
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    // Fallback: strip trailing path-like segments manually
    return raw.replace(/\/api\/?$/i, "").replace(/\/+$/, "");
  }
}

/**
 * If the stored image URL points at a localhost/127.0.0.1 backend but the
 * browser is running on a different host (e.g. mobile device accessing via
 * LAN IP), rewrite the origin so the image is reachable.
 */
function normalizeOriginForClient(fullUrl: string): string {
  if (typeof window === "undefined") return fullUrl;

  try {
    const imgUrl = new URL(fullUrl);
    const isLocalBackend =
      imgUrl.hostname === "localhost" || imgUrl.hostname === "127.0.0.1";
    const browserIsLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // If the image URL is localhost but the browser is NOT on localhost
    // (e.g. user is on a mobile device via LAN IP), rewrite to use
    // the same hostname the browser is on so the request actually reaches
    // the backend server.
    if (isLocalBackend && !browserIsLocal) {
      imgUrl.hostname = window.location.hostname;
      return imgUrl.toString();
    }
  } catch {
    // If URL parsing fails, return as-is
  }
  return fullUrl;
}

export function getImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return "";
  }

  // 1. Data URLs or local Blob preview URLs
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // 2. Full HTTPS / HTTP URLs (e.g. Cloudinary, S3, Supabase, external or full backend URLs)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return normalizeOriginForClient(trimmed);
  }

  // 3. Remove accidental route prefixes like /dashboard/ or dashboard/
  let cleaned = trimmed.replace(/^(\/)?dashboard\//i, "/");

  // 4. Ensure leading slash for relative paths
  if (!cleaned.startsWith("/")) {
    cleaned = "/" + cleaned;
  }

  // 5. Prepend backend origin for uploads served by backend server
  if (cleaned.startsWith("/uploads/")) {
    const origin = getBackendOrigin();
    const fullUrl = `${origin}${cleaned}`;
    return normalizeOriginForClient(fullUrl);
  }

  // 6. Static public Next.js assets starting with /assets/
  if (cleaned.startsWith("/assets/")) {
    return cleaned;
  }

  return cleaned;
}

export default getImageUrl;

