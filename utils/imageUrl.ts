
export function getImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return "";
  }

  // 1. Data URLs (legacy or preview)
  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  // 2. Full HTTPS / HTTP URLs (e.g. Cloudinary, S3, external or full backend URLs)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // 3. Remove accidental route prefixes like /dashboard/ or dashboard/
  let cleaned = trimmed.replace(/^(\/)?dashboard\//i, "/");

  // 4. Ensure leading slash for relative paths
  if (!cleaned.startsWith("/")) {
    cleaned = "/" + cleaned;
  }

  // 5. Prepend backend URL for uploads served by backend server
  if (cleaned.startsWith("/uploads/")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const baseUrl = apiUrl.replace(/\/+$/, "");
    return `${baseUrl}${cleaned}`;
  }

  // 6. Static public Next.js assets starting with /assets/
  if (cleaned.startsWith("/assets/")) {
    return cleaned;
  }

  return cleaned;
}

export default getImageUrl;
