import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { getImageUrl } from "@/utils/imageUrl";

// =============================================================================
// EVITE-STYLE PREVIEW EMAIL (Nodemailer dispatch)
//  • Inline CID card snapshot  →  cid:invitation-preview-card
//  • Preview banner at the top → guests are NOT invited yet
//  • Event title / date / time / venue + "RSVP Now" CTA (brand palette)
// =============================================================================

export const PREVIEW_CARD_CID = "invitation-preview-card";

export interface PreviewCardImage {
  data: Buffer;
  filename: string;
  contentType: string;
}

export interface PreviewEmailInput {
  to: string;
  hostName?: string;
  eventTitle: string;
  eventSubtitle?: string;
  dateLabel?: string;
  timeLabel?: string;
  venue?: string;
  address?: string;
  accentColor?: string;
  buttonColor?: string;
  buttonRadius?: number;
  rsvpUrl?: string;
  cardImage?: PreviewCardImage | null;
}

export interface PreviewEmailResult {
  success: boolean;
  messageId?: string;
  transport: string;
  previewUrl?: string | null;
}

const DEFAULT_ACCENT = "#3e5622";
const DEFAULT_TEXT = "#2D1B3D";

export function escapeHtml(value?: string | null): string {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Converts a `data:image/png;base64,...` snapshot into an inline attachment. */
export function dataUrlToCardImage(dataUrl?: string | null): PreviewCardImage | null {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  const match = /^data:image\/(png|jpe?g|webp|gif);base64,([A-Za-z0-9+/=\s]+)$/.exec(
    dataUrl.trim()
  );
  if (!match) return null;
  try {
    const buffer = Buffer.from(match[2].replace(/\s+/g, ""), "base64");
    if (!buffer.length) return null;
    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    return {
      data: buffer,
      filename: `invitation-preview-card.${ext}`,
      contentType: `image/${match[1]}`,
    };
  } catch {
    return null;
  }
}

/** Downloads a hosted card snapshot so it can be embedded as a CID attachment. */
export async function fetchCardImage(url?: string | null): Promise<PreviewCardImage | null> {
  const resolved = getImageUrl(url);
  if (!resolved || resolved.startsWith("data:")) {
    return resolved ? dataUrlToCardImage(resolved) : null;
  }
  try {
    const response = await fetch(resolved, { cache: "no-store" });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.length) return null;
    const contentType = (response.headers.get("content-type") || "image/png").split(";")[0];
    const ext = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : contentType.includes("webp") ? "webp" : "png";
    return {
      data: buffer,
      filename: `invitation-preview-card.${ext}`,
      contentType,
    };
  } catch {
    return null;
  }
}

// ── SMTP credentials ────────────────────────────────────────────────────────
// Prefer real environment variables. During local development the SMTP secrets
// live in `backend/.env`, so they are read (never written) as a fallback.
function readDotEnv(file: string): Record<string, string> {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    const out: Record<string, string> = {};
    for (const line of raw.split(/\r?\n/)) {
      const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
      if (!match) continue;
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      out[match[1]] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function resolveEnv(key: string): string {
  const direct = (process.env[key] || "").trim();
  if (direct) return direct;
  if (process.env.NODE_ENV === "production") return "";
  for (const file of ["backend/.env", ".env.local", ".env"]) {
    const value = (readDotEnv(file)[key] || "").trim();
    if (value) return value;
  }
  return "";
}

// ── HTML body ───────────────────────────────────────────────────────────────
export function buildPreviewEmailHtml(input: PreviewEmailInput): string {
  const accent = input.accentColor || DEFAULT_ACCENT;
  const buttonColor = input.buttonColor || accent;
  const radius = typeof input.buttonRadius === "number" ? input.buttonRadius : 14;
  const title = escapeHtml(input.eventTitle || "You're Invited");
  const subtitle = escapeHtml(input.eventSubtitle || "");
  const hostName = escapeHtml(input.hostName || "");
  const rsvpUrl = escapeHtml(input.rsvpUrl || "#");
  const recipient = escapeHtml(input.to);

  const detailRow = (label: string, value?: string) =>
    value
      ? `<tr>
            <td style="padding:0 0 14px 0;font:700 10px/1.4 Arial,Helvetica,sans-serif;letter-spacing:1.6px;text-transform:uppercase;color:#8b8b93;">${label}</td>
            <td style="padding:0 0 14px 18px;font:600 15px/1.5 Arial,Helvetica,sans-serif;color:${DEFAULT_TEXT};">${value}</td>
          </tr>`
      : "";

  const details = [
    detailRow("Date", escapeHtml(input.dateLabel || "")),
    detailRow("Time", escapeHtml(input.timeLabel || "")),
    detailRow("Venue", escapeHtml(input.venue || "")),
    detailRow("Address", escapeHtml(input.address || "")),
  ]
    .filter(Boolean)
    .join("");

  const cardMarkup = input.cardImage
    ? `<img
        src="cid:${PREVIEW_CARD_CID}"
        alt="${title} invitation card"
        width="520"
        style="display:block;width:100%;max-width:520px;height:auto;border:0;border-radius:16px;box-shadow:0 18px 40px rgba(45,27,61,0.18);margin:0 auto;"
      />`
    : `<div style="max-width:520px;margin:0 auto;border-radius:16px;overflow:hidden;background:linear-gradient(135deg, ${accent}, ${buttonColor});padding:56px 24px;text-align:center;color:#fff;font:700 30px/1.25 Georgia,serif;">${title}</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Preview: ${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f1;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">

  <!-- ── PREVIEW BANNER ── -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${DEFAULT_ACCENT};">
    <tr>
      <td align="center" style="padding:12px 16px;font:700 12px/1.5 Arial,Helvetica,sans-serif;color:#ffffff;letter-spacing:0.2px;">
        This is a preview sent to ${recipient} &ndash; your guests have not been invited yet
      </td>
    </tr>
  </table>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f1;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 16px 44px rgba(45,27,61,0.12);">
          <tr>
            <td style="padding:26px 28px 6px 28px;text-align:center;">
              <span style="display:inline-block;font:700 10px/1 Arial,Helvetica,sans-serif;letter-spacing:3px;text-transform:uppercase;color:${accent};background:${accent}14;border:1px solid ${accent}33;border-radius:999px;padding:8px 16px;">
                InviteHub Preview
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 28px 8px 28px;text-align:center;">
              <h1 style="margin:0;font:700 32px/1.2 Georgia,'Times New Roman',serif;color:${DEFAULT_TEXT};">${title}</h1>
              ${
                subtitle
                  ? `<p style="margin:10px 0 0 0;font:600 13px/1.5 Arial,Helvetica,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:${accent};">${subtitle}</p>`
                  : ""
              }
              ${
                hostName
                  ? `<p style="margin:8px 0 0 0;font:400 14px/1.5 Arial,Helvetica,sans-serif;color:#6b6b73;">Hosted by ${hostName}</p>`
                  : ""
              }
            </td>
          </tr>

          <tr>
            <td style="padding:20px 28px 4px 28px;">${cardMarkup}</td>
          </tr>

          ${
            details
              ? `<tr>
            <td style="padding:22px 32px 4px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${details}</table>
            </td>
          </tr>`
              : ""
          }

          <tr>
            <td align="center" style="padding:14px 28px 34px 28px;">
              <a href="${rsvpUrl}" target="_blank"
                style="display:inline-block;background-color:${buttonColor};color:#ffffff;text-decoration:none;font:700 15px/1 Arial,Helvetica,sans-serif;letter-spacing:0.4px;padding:17px 40px;border-radius:${radius}px;box-shadow:0 10px 24px ${buttonColor}40;">
                RSVP Now
              </a>
              <p style="margin:16px 0 0 0;font:400 11px/1.6 Arial,Helvetica,sans-serif;color:#9a9aa2;">
                This is a preview &mdash; no guest has received an invitation.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:18px 0 0 0;font:400 11px/1.6 Arial,Helvetica,sans-serif;color:#9a9aa2;">
          Sent with <strong style="color:${accent};">InviteHub</strong>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Dispatch ────────────────────────────────────────────────────────────────
async function createMailTransport(): Promise<{
  transport: nodemailer.Transporter;
  name: string;
}> {
  const smtpHost = resolveEnv("SMTP_HOST") || "smtp.gmail.com";
  const smtpPort = parseInt(resolveEnv("SMTP_PORT") || "587", 10);
  const smtpUser = resolveEnv("SMTP_USER");
  const smtpPass = resolveEnv("SMTP_PASS");
  const smtpSecure = resolveEnv("SMTP_SECURE");

  if (smtpUser && smtpPass) {
    return {
      name: "smtp",
      transport: nodemailer.createTransport({
        host: smtpHost,
        port: Number.isNaN(smtpPort) ? 587 : smtpPort,
        secure: smtpSecure ? smtpSecure === "true" : smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      }),
    };
  }

  if (process.env.NODE_ENV !== "production") {
    try {
      const testAccount = await nodemailer.createTestAccount();
      return {
        name: "ethereal",
        transport: nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass },
        }),
      };
    } catch {
      return { name: "json", transport: nodemailer.createTransport({ jsonTransport: true }) };
    }
  }

  throw new Error(
    "Missing email credentials. Configure SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS."
  );
}

export async function sendPreviewEmail(
  input: PreviewEmailInput
): Promise<PreviewEmailResult> {
  const html = buildPreviewEmailHtml(input);
  const { transport, name } = await createMailTransport();

  const attachments =
    input.cardImage && input.cardImage.data?.length
      ? [
          {
            filename: input.cardImage.filename || "invitation-preview-card.png",
            content: input.cardImage.data,
            cid: PREVIEW_CARD_CID,
            contentType: input.cardImage.contentType || "image/png",
          },
        ]
      : [];

  const from =
    resolveEnv("EMAIL_FROM") ||
    (resolveEnv("SMTP_USER") ? `InviteHub <${resolveEnv("SMTP_USER")}>` : "InviteHub <no-reply@invitehub.app>");

  const info = await transport.sendMail({
    from,
    to: input.to,
    subject: `Preview: ${input.eventTitle || "Your invitation"}`,
    html,
    text: `This is a preview sent to ${input.to} – your guests have not been invited yet.\n\n${input.eventTitle}\n${input.dateLabel || ""} ${input.timeLabel || ""}\n${input.venue || ""}\n\nRSVP: ${input.rsvpUrl || ""}`,
    attachments,
  });

  return {
    success: true,
    messageId: typeof info.messageId === "string" ? info.messageId : undefined,
    transport: name,
    previewUrl: nodemailer.getTestMessageUrl(info) || null,
  };
}
