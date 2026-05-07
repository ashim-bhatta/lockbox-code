import { Resend } from "resend";

let resendClient: Resend | null = null;

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getResend(): Resend {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("Missing RESEND_API_KEY environment variable.");
    }
    resendClient = new Resend(key);
  }
  return resendClient;
}

/**
 * Send the unlock email to the client after a successful payment.
 */
export async function sendUnlockEmail(params: {
  clientEmail: string;
  title: string;
  downloadUrl: string;
  freelancerEmail: string;
}) {
  const resend = getResend();
  const safeTitle = escapeHtml(params.title);
  const safeFreelancerEmail = escapeHtml(params.freelancerEmail);
  const safeDownloadUrl = escapeHtml(params.downloadUrl);

  await resend.emails.send({
    from: "Paywall.zip <noreply@paywallzip.com>",
    to: params.clientEmail,
    subject: `Your download is ready: ${safeTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 0;">
        <h2 style="color: #111;">Payment confirmed ✅</h2>
        <p style="color: #555; line-height: 1.6;">
          Your payment to <strong>${safeFreelancerEmail}</strong> has been processed.
          Click the button below to access your files.
        </p>
        <a href="${safeDownloadUrl}" 
           style="display:inline-block; background:#3b82f6; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; margin:24px 0;">
          Open Lockbox
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 32px;">
          If the button doesn't work, copy this link: ${safeDownloadUrl}
        </p>
      </div>
    `,
  });
}

/**
 * Notify the freelancer that they got paid.
 */
export async function sendPaymentNotification(params: {
  freelancerEmail: string;
  title: string;
  amountCents: number;
  tipCents: number;
}) {
  const resend = getResend();
  const safeTitle = escapeHtml(params.title);
  const total = ((params.amountCents + params.tipCents) / 100).toFixed(2);
  const tip = (params.tipCents / 100).toFixed(2);

  await resend.emails.send({
    from: "Paywall.zip <noreply@paywallzip.com>",
    to: params.freelancerEmail,
    subject: `💰 You got paid $${total} for "${safeTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 0;">
        <h2 style="color: #111;">You just got paid! 🎉</h2>
        <p style="color: #555; line-height: 1.6;">
          Your lockbox <strong>"${safeTitle}"</strong> has been unlocked.
        </p>
        <table style="width:100%; border-collapse: collapse; margin: 24px 0;">
          <tr><td style="padding:8px 0; color:#555;">Invoice</td><td style="padding:8px 0; text-align:right; font-weight:600;">$${(params.amountCents / 100).toFixed(2)}</td></tr>
          ${params.tipCents > 0 ? `<tr><td style="padding:8px 0; color:#555;">Tip ☕</td><td style="padding:8px 0; text-align:right; font-weight:600; color:#10b981;">+$${tip}</td></tr>` : ""}
          <tr style="border-top:1px solid #eee;"><td style="padding:12px 0; color:#111; font-weight:700;">Total</td><td style="padding:12px 0; text-align:right; font-weight:700; font-size:18px;">$${total}</td></tr>
        </table>
        <p style="color: #999; font-size: 13px;">Funds will arrive in your connected bank account within 2-7 business days via Stripe.</p>
      </div>
    `,
  });
}

export async function sendRestoreCodeEmail(params: { clientEmail: string; title: string; code: string }) {
  const resend = getResend();
  const safeTitle = escapeHtml(params.title);
  const safeCode = escapeHtml(params.code);

  await resend.emails.send({
    from: "Paywall.zip <noreply@paywallzip.com>",
    to: params.clientEmail,
    subject: `Restore access code for: ${safeTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 0;">
        <h2 style="color: #111;">Restore Access</h2>
        <p style="color: #555; line-height: 1.6;">
          Use the code below to restore access to <strong>${safeTitle}</strong>.
        </p>
        <div style="margin: 24px 0; padding: 18px; border-radius: 12px; background: #0b1220; color: #e5e7eb; text-align: center;">
          <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.7;">One-time code</div>
          <div style="font-size: 32px; letter-spacing: 0.18em; font-weight: 800; margin-top: 8px;">${safeCode}</div>
        </div>
        <p style="color: #777; line-height: 1.6; font-size: 13px;">
          This code expires in 10 minutes. If you didn&apos;t request this, you can ignore this email.
        </p>
      </div>
    `,
  });
}
