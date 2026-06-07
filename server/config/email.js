import nodemailer from 'nodemailer';

// ── Brevo SMTP Relay ──────────────────────────────────────────────────────────
// Uses Brevo's SMTP relay — no domain ownership required.
// Free tier: 300 emails/day.
//
// Setup:
//   1. Sign up at https://app.brevo.com (free)
//   2. Go to Profile → SMTP & API → SMTP tab
//   3. Copy your SMTP login (your Brevo account email) and generate an SMTP password
//   4. Verify your sender email under Senders & IP → Senders (just click the link they send)
//
// Required env vars:
//   BREVO_SMTP_USER     → your Brevo account email (e.g. you@gmail.com)
//   BREVO_SMTP_PASS     → the SMTP password from Brevo dashboard (NOT your login password)
//   EMAIL_USER          → the verified sender email shown in the "from" field
//   EMAIL_FROM_NAME     → display name (default: eGuide ICCT)

const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // STARTTLS
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_PASS,
        },
    });
};

const FROM_EMAIL = process.env.EMAIL_USER || 'iccteguide@gmail.com';
const FROM_NAME  = process.env.EMAIL_FROM_NAME || 'eGuide ICCT';

// ── Startup verification ──────────────────────────────────────────────────────
export const verifyEmailTransporter = async () => {
    if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
        console.warn('⚠️  [Email] BREVO_SMTP_USER or BREVO_SMTP_PASS not set — emails disabled.');
        return false;
    }
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log(`✅ [Email] Brevo SMTP ready — sending as: ${FROM_NAME} <${FROM_EMAIL}>`);
        return true;
    } catch (err) {
        console.error(`❌ [Email] Brevo SMTP verification failed: ${err.message}`);
        return false;
    }
};

// ── Bulk sender ───────────────────────────────────────────────────────────────
export const sendBulkEmail = async (recipients, subject, htmlContent) => {
    if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
        console.warn('⚠️  [Email] Skipping — Brevo SMTP credentials not configured.');
        return { success: false, error: 'Brevo SMTP credentials not configured.' };
    }

    const transporter = createTransporter();
    const results = [];

    try {
        for (const recipient of recipients) {
            const result = await transporter.sendMail({
                from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
                to: recipient.email,
                subject,
                html: htmlContent,
            });

            console.log(`📧 [Email] Sent to ${recipient.email} — messageId: ${result.messageId}`);
            results.push({ email: recipient.email, success: true, messageId: result.messageId });

            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        return { success: true, results };
    } catch (error) {
        console.error(`❌ [Email] sendBulkEmail failed: ${error.message}`);
        return { success: false, error: error.message };
    }
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
