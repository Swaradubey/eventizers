import InvitePage, { generateMetadata } from "@/app/invite/[id]/page";

export const dynamic = "force-dynamic";
export { generateMetadata };

/**
 * Review-stage preview entry point. Same interactive envelope viewer as
 * /invite/:id — the dropdown always opens it with ?mode=guest so the host sees
 * exactly what a guest receives.
 */
export default InvitePage;
