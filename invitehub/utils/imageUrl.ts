/**
 * Resolves the backend server origin from environment variables.
 * Strips any trailing path segments like `/api` so we get just the host origin
 * (e.g. `http://localhost:5000`).
 */
function getBackendOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.PUBLIC_BACKEND_URL ||
    process.env.PUBLIC_APP_URL ||
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
 * LAN IP or public domain), rewrite the hostname/origin so the image is reachable.
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
  if (!trimmed || trimmed === "undefined" || trimmed === "null") {
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

  // 4. Relative uploads path (with or without leading slash)
  if (cleaned.startsWith("/uploads/") || cleaned.startsWith("uploads/")) {
    const relativePath = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    const origin = getBackendOrigin();
    const fullUrl = `${origin}${relativePath}`;
    return normalizeOriginForClient(fullUrl);
  }

  // 5. Static public Next.js assets starting with /assets/ or assets/
  if (cleaned.startsWith("/assets/") || cleaned.startsWith("assets/")) {
    return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  }

  // 6. Raw image filename e.g. "template_178239.png" or "photo.jpg"
  if (/\.(png|jpe?g|webp|gif|svg|avif|heic)$/i.test(cleaned)) {
    const origin = getBackendOrigin();
    const fullUrl = `${origin}/uploads/${cleaned.replace(/^\/+/, "")}`;
    return normalizeOriginForClient(fullUrl);
  }

  // 7. Fallback: ensure leading slash
  if (!cleaned.startsWith("/")) {
    cleaned = "/" + cleaned;
  }

  return cleaned;
}

export default getImageUrl;
