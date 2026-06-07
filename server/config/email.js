import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// ── SMTP port configuration ───────────────────────────────────────────────────
// Render FREE tier blocks outbound SMTP (ports 465 & 587) at the network level.
// Emails will silently fail on free instances — upgrade to a paid Render instance
// to enable outbound SMTP.
//
// Port behaviour:
//   465 → SSL (secure: true)   — recommended for Gmail with App Password
//   587 → STARTTLS (secure: false, requireTLS: true)
//
// Set EMAIL_SMTP_PORT=465 or EMAIL_SMTP_PORT=587 in your environment.
// Defaults to 465 if not set.
const SMTP_PORT = parseInt(process.env.EMAIL_SMTP_PORT, 10) || 465;
const SMTP_SECURE = SMTP_PORT === 465; // true for 465 (SSL), false for 587 (STARTTLS)

const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: SMTP_PORT,
        secure: SMTP_SECURE,         // true = SSL on 465, false = STARTTLS on 587
        requireTLS: !SMTP_SECURE,    // force STARTTLS upgrade on port 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
        tls: {
            // Reject connections that fail certificate validation
            rejectUnauthorized: true,
        },
    });
};

export const sendBulkEmail = async (recipients, subject, htmlContent) => {
    const transporter = createTransporter();
    const results = [];

    try {
        for (const recipient of recipients) {
            const mailOptions = {
                from: `"eGuide System" <${process.env.EMAIL_USER}>`,
                to: recipient.email,
                subject,
                html: htmlContent,
            };

            const result = await transporter.sendMail(mailOptions);
            results.push({
                email: recipient.email,
                success: true,
                messageId: result.messageId,
            });

            // Small delay between emails to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        return { success: true, results };
    } catch (error) {
        console.error('❌ Email send failed:', error.message);
        return { success: false, error: error.message };
    }
};

export const sendAnnouncementEmail = async (students, announcement) => {
    const subject = `📢 New Announcement: ${announcement.title}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const announcementsUrl = `${frontendUrl}/announcements`;

    const actionButtonHtml = announcement.actionButton?.label && announcement.actionButton?.url
        ? `
        <div style="text-align: center; margin: 10px 0 20px;">
            <a href="${announcement.actionButton.url}"
               target="_blank"
               style="display: inline-block; padding: 12px 28px; background-color: #1a56db; color: white;
                      text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold;">
                ${announcement.actionButton.label}
            </a>
        </div>`
        : '';

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">

            <div style="background-color: #1a56db; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px; letter-spacing: 2px;">eGuide</h1>
                <p style="color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 12px; letter-spacing: 1px;">ICCT COLLEGES</p>
            </div>

            <div style="padding: 28px 24px;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">NEW ANNOUNCEMENT</p>
                <h2 style="color: #111827; margin: 0 0 8px; font-size: 20px;">${announcement.title}</h2>
                <p style="color: #9ca3af; font-size: 12px; margin: 0 0 20px;">
                    Posted on: ${new Date(announcement.date_posted).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #1a56db; margin-bottom: 24px;">
                    <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">${announcement.content}</p>
                </div>

                <div style="text-align: center; margin-bottom: 16px;">
                    <a href="${announcementsUrl}"
                       target="_blank"
                       style="display: inline-block; padding: 12px 28px; background-color: #111827; color: white;
                              text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold;">
                        View in eGuide App →
                    </a>
                </div>

                ${actionButtonHtml}
            </div>

            <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                    This is an automated message from eGuide ICCT. Please do not reply to this email.
                </p>
            </div>
        </div>
    `;

    return await sendBulkEmail(students, subject, htmlContent);
};
