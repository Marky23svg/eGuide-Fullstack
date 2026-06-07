import * as Brevo from '@getbrevo/brevo';

// ── Brevo (formerly Sendinblue) ───────────────────────────────────────────────
// Free tier: 300 emails/day — no domain ownership required.
// Sign up at https://app.brevo.com → Profile → SMTP & API → API Keys
// Set BREVO_API_KEY in your Render environment variables.
//
// FROM address: use any email you verify in Brevo dashboard
// (just click the verification link they send you — no DNS needed).

let apiInstance = null;

const getClient = () => {
    if (!apiInstance) {
        if (!process.env.BREVO_API_KEY) {
            throw new Error('BREVO_API_KEY is not set. Add it to your Render environment variables.');
        }
        const defaultClient = Brevo.ApiClient.instance;
        defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
        apiInstance = new Brevo.TransactionalEmailsApi();
    }
    return apiInstance;
};

const FROM_EMAIL = process.env.EMAIL_USER || 'iccteguide@gmail.com';
const FROM_NAME  = process.env.EMAIL_FROM_NAME || 'eGuide ICCT';

// ── Startup verification ──────────────────────────────────────────────────────
export const verifyEmailTransporter = async () => {
    if (!process.env.BREVO_API_KEY) {
        console.warn('⚠️  [Email] BREVO_API_KEY not set — emails disabled.');
        return false;
    }
    console.log(`✅ [Email] Brevo configured. Sending from: ${FROM_NAME} <${FROM_EMAIL}>`);
    return true;
};

// ── Bulk sender ───────────────────────────────────────────────────────────────
export const sendBulkEmail = async (recipients, subject, htmlContent) => {
    if (!process.env.BREVO_API_KEY) {
        console.warn('⚠️  [Email] Skipping — BREVO_API_KEY not configured.');
        return { success: false, error: 'BREVO_API_KEY not configured.' };
    }

    const client = getClient();
    const results = [];

    for (const recipient of recipients) {
        try {
            const sendSmtpEmail = new Brevo.SendSmtpEmail();
            sendSmtpEmail.subject = subject;
            sendSmtpEmail.htmlContent = htmlContent;
            sendSmtpEmail.sender = { name: FROM_NAME, email: FROM_EMAIL };
            sendSmtpEmail.to = [{ email: recipient.email }];

            const data = await client.sendTransacEmail(sendSmtpEmail);
            console.log(`📧 [Email] Sent to ${recipient.email} — messageId: ${data.messageId}`);
            results.push({ email: recipient.email, success: true, messageId: data.messageId });

            // Small delay to stay within rate limits
            await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (err) {
            const msg = err?.response?.body?.message || err.message;
            console.error(`❌ [Email] Failed to ${recipient.email}: ${msg}`);
            results.push({ email: recipient.email, success: false, error: msg });
        }
    }

    const anySuccess = results.some((r) => r.success);
    return { success: anySuccess, results };
};

// ── Announcement email template ───────────────────────────────────────────────
export const sendAnnouncementEmail = async (students, announcement) => {
    const subject = `📢 New Announcement: ${announcement.title}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const announcementsUrl = `${frontendUrl}/announcements`;

    const actionButtonHtml = announcement.actionButton?.label && announcement.actionButton?.url
        ? `<div style="text-align:center;margin:10px 0 20px;">
               <a href="${announcement.actionButton.url}" target="_blank"
                  style="display:inline-block;padding:12px 28px;background-color:#1a56db;color:white;
                         text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;">
                   ${announcement.actionButton.label}
               </a>
           </div>`
        : '';

    const htmlContent = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;">
            <div style="background-color:#1a56db;padding:20px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:22px;letter-spacing:2px;">eGuide</h1>
                <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:12px;letter-spacing:1px;">ICCT COLLEGES</p>
            </div>
            <div style="padding:28px 24px;">
                <p style="color:#6b7280;font-size:12px;margin:0 0 8px;">NEW ANNOUNCEMENT</p>
                <h2 style="color:#111827;margin:0 0 8px;font-size:20px;">${announcement.title}</h2>
                <p style="color:#9ca3af;font-size:12px;margin:0 0 20px;">
                    Posted on: ${new Date(announcement.date_posted).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div style="background-color:#f9fafb;padding:16px;border-radius:8px;border-left:4px solid #1a56db;margin-bottom:24px;">
                    <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${announcement.content}</p>
                </div>
                <div style="text-align:center;margin-bottom:16px;">
                    <a href="${announcementsUrl}" target="_blank"
                       style="display:inline-block;padding:12px 28px;background-color:#111827;color:white;
                              text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;">
                        View in eGuide App →
                    </a>
                </div>
                ${actionButtonHtml}
            </div>
            <div style="background-color:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#9ca3af;font-size:11px;margin:0;">
                    This is an automated message from eGuide ICCT. Please do not reply to this email.
                </p>
            </div>
        </div>
    `;

    return await sendBulkEmail(students, subject, htmlContent);
};
