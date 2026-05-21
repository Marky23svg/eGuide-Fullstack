import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for Gmail SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD  // App password, not regular password
        }
    });
};

// Send email to multiple recipients
export const sendBulkEmail = async (recipients, subject, htmlContent) => {
    try {
        const transporter = createTransporter();
        
        // Gmail has limits, so we send individually or in batches
        const results = [];
        
        for (const recipient of recipients) {
            const mailOptions = {
                from: `"eGuide System" <${process.env.EMAIL_USER}>`,
                to: recipient.email,
                subject: subject,
                html: htmlContent
            };
            
            const result = await transporter.sendMail(mailOptions);
            results.push({ email: recipient.email, success: true, messageId: result.messageId });
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return { success: true, results };
    } catch (error) {
        console.error('Email sending error:', error);
        return { success: false, error: error.message };
    }
};

// Send announcement email to all students
export const sendAnnouncementEmail = async (students, announcement) => {
    const subject = `📢 New Announcement: ${announcement.title}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const announcementsUrl = `${frontendUrl}/announcements`;

    // Build optional action button block
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

            <!-- Header -->
            <div style="background-color: #1a56db; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px; letter-spacing: 2px;">eGuide</h1>
                <p style="color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 12px; letter-spacing: 1px;">ICCT COLLEGES</p>
            </div>

            <!-- Body -->
            <div style="padding: 28px 24px;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">NEW ANNOUNCEMENT</p>
                <h2 style="color: #111827; margin: 0 0 8px; font-size: 20px;">${announcement.title}</h2>
                <p style="color: #9ca3af; font-size: 12px; margin: 0 0 20px;">
                    Posted on: ${new Date(announcement.date_posted).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #1a56db; margin-bottom: 24px;">
                    <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">${announcement.content}</p>
                </div>

                <!-- View in app button -->
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

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                    This is an automated message from eGuide ICCT. Please do not reply to this email.
                </p>
            </div>
        </div>
    `;

    return await sendBulkEmail(students, subject, htmlContent);
};