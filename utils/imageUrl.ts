
export function getImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return "";
  }

  // 1. Block javascript: protocol injections (XSS guard).
  //    Use a lowercase, whitespace-stripped check to catch obfuscated variants.
  const lowerProtocol = trimmed.replace(/\s/g, "").toLowerCase();
  if (lowerProtocol.startsWith("javascript:") || lowerProtocol.startsWith("vbscript:")) {
    console.warn("[getImageUrl] Blocked potentially unsafe URL protocol:", trimmed);
    return "";
  }

  // 2. Data URLs — only allow image/* MIME types to prevent XSS via data: URIs.
  if (trimmed.startsWith("data:")) {
    const mimeMatch = trimmed.match(/^data:([^;,]+)/);
    const mimeType = mimeMatch ? mimeMatch[1].toLowerCase() : "";
    if (mimeType.startsWith("image/")) {
      return trimmed;
    }
    console.warn("[getImageUrl] Blocked non-image data URI with MIME type:", mimeType);
    return "";
  }

  // 3. Full external URLs — pass through http/https as-is.
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // 4. Remove accidental route prefixes like /dashboard/ or dashboard/
  let cleaned = trimmed.replace(/^(\/)?dashboard\//i, "/");

  // 5. Ensure leading slash for relative asset paths
  if (!cleaned.startsWith("/")) {
    cleaned = "/" + cleaned;
  }

  // 6. Prepend backend URL for uploads served by backend server
  if (cleaned.startsWith("/uploads/")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const baseUrl = apiUrl.replace(/\/+$/, "");
    return `${baseUrl}${cleaned}`;
  }

  // 7. Static public Next.js assets starting with /assets/
  if (cleaned.startsWith("/assets/")) {
    return cleaned;
  }

  return cleaned;
}

export default getImageUrl;
