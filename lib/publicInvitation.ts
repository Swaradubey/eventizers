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
  const baseUrl = apiBase();

  // 1. Try public event route (/api/public/events/:id)
  try {
    const res = await fetch(
      `${baseUrl}/public/events/${encodeURIComponent(id)}`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.success && data.event) {
        return {
          success: true,
          event: data.event,
          invitation: data.invitation || {
            title: data.event.title,
            mainText: data.event.description,
            imageUrl: data.event.coverImage || data.event.previewUrl,
          },
          rsvpSettings: data.rsvpSettings || null,
          designSettings: data.designSettings || null,
          templateData: data.event.templateData || null,
        };
      }
    }
  } catch (err) {
    // Continue to legacy fallback
  }

  // 2. Fallback to /api/invitations/public/:id
  try {
    const res = await fetch(
      `${baseUrl}/invitations/public/${encodeURIComponent(id)}`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.success && (data.invitation || data.event) ? data : null;
  } catch {
    return null;
  }
}
