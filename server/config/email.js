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
    
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="background-color: #4CAF50; padding: 10px; text-align: center; border-radius: 5px 5px 0 0;">
                <h2 style="color: white; margin: 0;">eGuide System</h2>
            </div>
            <div style="padding: 20px;">
                <h3 style="color: #333;">📢 ${announcement.title}</h3>
                <p style="color: #666; font-size: 14px;">Posted on: ${new Date(announcement.date_posted).toLocaleString()}</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p style="margin: 0; color: #333;">${announcement.content}</p>
                </div>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    This is an automated message from eGuide System. Please do not reply to this email.
                </p>
            </div>
        </div>
    `;
    
    return await sendBulkEmail(students, subject, htmlContent);
};