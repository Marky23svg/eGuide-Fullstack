import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();

// Generate random 6-digit code
const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send reset code email
const sendResetCodeEmail = async (email, code) => {
    const { sendBulkEmail } = await import('../config/email.js');
    
    const subject = 'Password Reset Code - eGuide System';
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="background-color: #2563eb; padding: 10px; text-align: center; border-radius: 5px 5px 0 0;">
                <h2 style="color: white; margin: 0;">eGuide System</h2>
            </div>
            <div style="padding: 20px;">
                <h3 style="color: #333;">Password Reset Code</h3>
                <p style="color: #666;">Use the code below to reset your password. It expires in <strong>10 minutes</strong>.</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${code}</span>
                </div>
                <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            </div>
        </div>
    `;
    
    const result = await sendBulkEmail([{ email }], subject, htmlContent);
    if (!result.success) {
        throw new Error('Failed to send email: ' + result.error);
    }
};

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student'
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const otp = generateResetCode();
        user.loginOtp = otp;
        user.loginOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        const { sendBulkEmail } = await import('../config/email.js');
        await sendBulkEmail([{ email }], 'Login OTP - eGuide System', `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="background-color: #2563eb; padding: 10px; text-align: center; border-radius: 5px 5px 0 0;">
                    <h2 style="color: white; margin: 0;">eGuide System</h2>
                </div>
                <div style="padding: 20px;">
                    <h3 style="color: #333;">Login Verification Code</h3>
                    <p style="color: #666;">Use this code to complete your login. It expires in <strong>5 minutes</strong>.</p>
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otp}</span>
                    </div>
                </div>
            </div>
        `);

        res.json({ success: true, message: 'OTP sent to your email', requiresOtp: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Verify login OTP
router.post('/verify-login-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ 
            email, 
            loginOtp: otp,
            loginOtpExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        user.loginOtp = null;
        user.loginOtpExpires = null;
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== FORGOT PASSWORD ROUTES ==========

// Step 1: Request password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'No account found with this email' 
            });
        }
        
        const resetCode = generateResetCode();
        
        user.resetCode = resetCode;
        user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        
        await sendResetCodeEmail(email, resetCode);
        console.log('✅ Reset code email sent to:', email);
        
        res.json({ 
            success: true, 
            message: 'Reset code sent to your email' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Step 2: Verify reset code
router.post('/verify-reset-code', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        const user = await User.findOne({ 
            email, 
            resetCode: code,
            resetCodeExpires: { $gt: new Date() }
        });
        
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired reset code' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Code verified successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Step 3: Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        
        const user = await User.findOne({ 
            email, 
            resetCode: code,
            resetCodeExpires: { $gt: new Date() }
        });
        
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired reset code' 
            });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        user.password = hashedPassword;
        user.resetCode = null;
        user.resetCodeExpires = null;
        await user.save();
        
        res.json({ 
            success: true, 
            message: 'Password reset successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;