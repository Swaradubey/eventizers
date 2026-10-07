/**
 * Public (unauthenticated) invitation lookup shared by the guest invite page
 * and the review-stage guest preview page.
 */
export function apiBase(): string {
  const raw = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_PUBLIC_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");
  return `${raw.replace(/\/api$/i, "")}/api`;
}

export async function fetchInvitation(id: string) {
  if (!id) return null;
  try {
    const res = await fetch(
      `${apiBase()}/invitations/public/${encodeURIComponent(id)}`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.success && data.invitation ? data : null;
  } catch {
    return null;
  }
}
