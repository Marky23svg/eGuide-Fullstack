import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { config } from '../config/config.js';
import { enqueueEmail } from '../utils/emailQueue.js';

const router = express.Router();

const MIN_PASSWORD_LENGTH = 8;

// ── Helpers ───────────────────────────────────────────────────────────────────

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const validatePassword = (password) => {
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
        return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    return null;
};

const signToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

const otpEmailHtml = (code, title, bodyText) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px;">
        <div style="background-color:#2563eb;padding:10px;text-align:center;border-radius:5px 5px 0 0;">
            <h2 style="color:white;margin:0;">eGuide System</h2>
        </div>
        <div style="padding:20px;">
            <h3 style="color:#333;">${title}</h3>
            <p style="color:#666;">${bodyText}</p>
            <div style="background-color:#f3f4f6;padding:20px;border-radius:5px;text-align:center;margin:20px 0;">
                <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2563eb;">${code}</span>
            </div>
            <p style="color:#999;font-size:12px;">If you didn't request this, please ignore this email.</p>
        </div>
    </div>
`;

// ── Signup ────────────────────────────────────────────────────────────────────

// Step 1: validate + create pending user + queue OTP email
router.post('/signup/send-otp', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
        }

        const pwError = validatePassword(password);
        if (pwError) return res.status(400).json({ success: false, message: pwError });

        const existingUser = await User.findOne({ email, pendingSignup: { $ne: true } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }

        // Clean up any stale pending record for this email
        await User.findOneAndDelete({ email, pendingSignup: true });

        const otp = generateCode();
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'student',
            pendingSignup: true,
            loginOtp: otp,
            loginOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
        });

        // Non-blocking — respond immediately, email sends in background
        enqueueEmail(
            [{ email }],
            'Email Verification - eGuide System',
            otpEmailHtml(otp, 'Verify Your Email', 'Use this code to complete your registration. It expires in <strong>10 minutes</strong>.')
        );

        res.json({ success: true, message: 'OTP sent to your email.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Step 2: verify OTP and activate account
router.post('/signup/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({
            email,
            pendingSignup: true,
            loginOtp: otp,
            loginOtpExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        user.pendingSignup = false;
        user.loginOtp = null;
        user.loginOtpExpires = null;
        await user.save();

        const token = signToken(user);

        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Legacy direct signup (admin creation via Postman only)
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const pwError = validatePassword(password);
        if (pwError) return res.status(400).json({ success: false, message: pwError });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role: role || 'student' });
        const token = signToken(user);

        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Login ─────────────────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, pendingSignup: { $ne: true } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const token = signToken(user);

        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Forgot Password ───────────────────────────────────────────────────────────

// Step 1: generate + queue reset code email
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email, pendingSignup: { $ne: true } });
        if (!user) {
            // Return success anyway to avoid email enumeration
            return res.json({ success: true, message: 'If an account exists, a reset code has been sent.' });
        }

        const resetCode = generateCode();
        user.resetCode = resetCode;
        user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        // Non-blocking — respond immediately
        enqueueEmail(
            [{ email }],
            'Password Reset Code - eGuide System',
            otpEmailHtml(resetCode, 'Password Reset Code', 'Use the code below to reset your password. It expires in <strong>10 minutes</strong>.')
        );

        res.json({ success: true, message: 'Reset code sent to your email.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Step 2: verify reset code
router.post('/verify-reset-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({
            email,
            resetCode: code,
            resetCodeExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset code.' });
        }

        res.json({ success: true, message: 'Code verified successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Step 3: reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const pwError = validatePassword(newPassword);
        if (pwError) return res.status(400).json({ success: false, message: pwError });

        const user = await User.findOne({
            email,
            resetCode: code,
            resetCodeExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset code.' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetCode = null;
        user.resetCodeExpires = null;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
