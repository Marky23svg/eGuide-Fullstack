import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { config } from '../config/config.js';
import { enqueueEmail } from '../utils/emailQueue.js';

const router = express.Router();

const validatePassword = (password) => {
    if (!password || password.length < 8) {
        return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter.';
    }
    if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter.';
    }
    if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one number.';
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        return 'Password must contain at least one special character.';
    }
    return null;
};

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const signToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

// OTP cooldown: 60 seconds between resend attempts (saves email quota)
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

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

// Step 1: validate + return signed signup session token + queue OTP email
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

        const otp = generateCode();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Stateless token containing registration details and OTP, expires in 10 minutes
        const signupToken = jwt.sign(
            { name, email, password: hashedPassword, otp },
            config.jwtSecret,
            { expiresIn: '10m' }
        );

        enqueueEmail(
            [{ email }],
            'Email Verification - eGuide System',
            otpEmailHtml(otp, 'Verify Your Email', 'Use this code to complete your registration. It expires in <strong>10 minutes</strong>.')
        );

        res.json({ success: true, signupToken, message: 'OTP sent to your email.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Step 2: verify OTP and activate account (finally create in DB)
router.post('/signup/verify-otp', async (req, res) => {
    try {
        const { email, otp, signupToken } = req.body;

        if (!signupToken) {
            return res.status(400).json({ success: false, message: 'Registration session is missing.' });
        }

        let decoded;
        try {
            decoded = jwt.verify(signupToken, config.jwtSecret);
        } catch (err) {
            return res.status(400).json({ success: false, message: 'Invalid or expired registration session.' });
        }

        if (decoded.email.toLowerCase() !== email.toLowerCase() || decoded.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP or email.' });
        }

        // Final check to prevent race conditions or duplicate signups
        const existingUser = await User.findOne({ email, pendingSignup: { $ne: true } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }

        // Clean up any stale legacy pending records if they exist
        await User.findOneAndDelete({ email, pendingSignup: true });

        const user = await User.create({
            name: decoded.name,
            email: decoded.email,
            password: decoded.password, // already hashed
            role: 'student',
        });

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

// ── Admin Signup (secret, gated by authorized email) ──────────────────────────
// Only req.body.authorizedEmail === config.adminOtpEmail may trigger an OTP send.
// The OTP itself is always sent to config.adminOtpEmail (never to an attacker-supplied
// address), so even a leaked link + leaked email string still requires physical access
// to that one inbox. Every failure path returns the same generic message so a tester
// probing the form can't tell which check failed.

const ADMIN_GENERIC_ERROR = 'Unable to process this request. Please check your details and try again.';
const ADMIN_OTP_MAX_ATTEMPTS = 5;

// Step 1: validate + queue OTP to the one authorized inbox (never to user input)
router.post('/admin-signup/send-otp', async (req, res) => {
    try {
        const { name, email, password, confirmPassword, authorizedEmail } = req.body;

        if (!name || !email || !password || !confirmPassword || !authorizedEmail) {
            return res.status(400).json({ success: false, message: ADMIN_GENERIC_ERROR });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: ADMIN_GENERIC_ERROR });
        }

        const pwError = validatePassword(password);
        if (pwError) return res.status(400).json({ success: false, message: pwError });

        // Gate check — generic message either way, no hint about which field was wrong
        if (!config.adminOtpEmail || authorizedEmail.toLowerCase().trim() !== config.adminOtpEmail) {
            return res.status(400).json({ success: false, message: ADMIN_GENERIC_ERROR });
        }

        const existingUser = await User.findOne({ email, pendingSignup: { $ne: true } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: ADMIN_GENERIC_ERROR });
        }

        const otp = generateCode();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Stateless token holds registration details + OTP + attempt counter.
        // Expires in 10 minutes, same as the student flow.
        const signupToken = jwt.sign(
            { name, email, password: hashedPassword, otp, attempts: 0, purpose: 'admin-signup' },
            config.jwtSecret,
            { expiresIn: '10m' }
        );

        // The OTP is ALWAYS mailed to the one authorized inbox — never to req.body.email.
        enqueueEmail(
            [{ email: config.adminOtpEmail }],
            'Admin Registration Code - eGuide System',
            otpEmailHtml(
                otp,
                'New Admin Registration Request',
                `A new admin account is being created for <strong>${email}</strong>. If this was you or someone you authorized, give them this code. It expires in <strong>10 minutes</strong>. If you did not expect this, ignore this email.`
            )
        );

        res.json({ success: true, signupToken, message: 'If the details are correct, a code has been sent to the authorized inbox.' });
    } catch (error) {
        res.status(500).json({ success: false, message: ADMIN_GENERIC_ERROR });
    }
});

// Step 2: verify OTP and create the admin account
router.post('/admin-signup/verify-otp', async (req, res) => {
    try {
        const { email, otp, signupToken } = req.body;

        if (!signupToken || !otp) {
            return res.status(400).json({ success: false, message: ADMIN_GENERIC_ERROR });
        }

        let decoded;
        try {
            decoded = jwt.verify(signupToken, config.jwtSecret);
        } catch (err) {
            return res.status(400).json({ success: false, message: 'This code has expired. Please start again.' });
        }

        if (decoded.purpose !== 'admin-signup') {
            return res.status(400).json({ success: false, message: ADMIN_GENERIC_ERROR });
        }

        if ((decoded.attempts || 0) >= ADMIN_OTP_MAX_ATTEMPTS) {
            return res.status(400).json({ success: false, message: 'Too many attempts. Please start again.' });
        }

        if (decoded.email.toLowerCase() !== String(email || '').toLowerCase() || decoded.otp !== otp) {
            // Re-issue the token with attempts incremented so the limit is enforced
            // even though the token itself is stateless. Strip exp/iat first —
            // jwt.sign refuses to set expiresIn when the payload already carries
            // an exp claim from the previous verify().
            const { exp, iat, ...rest } = decoded;
            const retryToken = jwt.sign(
                { ...rest, attempts: (decoded.attempts || 0) + 1 },
                config.jwtSecret,
                { expiresIn: '10m' }
            );
            return res.status(400).json({ success: false, message: ADMIN_GENERIC_ERROR, signupToken: retryToken });
        }

        // Final check to prevent race conditions or duplicate signups
        const existingUser = await User.findOne({ email: decoded.email, pendingSignup: { $ne: true } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: ADMIN_GENERIC_ERROR });
        }

        const user = await User.create({
            name: decoded.name,
            email: decoded.email,
            password: decoded.password, // already hashed
            role: 'admin',
        });

        const token = signToken(user);

        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: ADMIN_GENERIC_ERROR });
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

// Step 1: generate + queue reset code (with cooldown to prevent abuse)

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (user) {
            // 1. Define recipientEmail clearly BEFORE using it
            let recipientEmail = (user.role === 'admin' && config.adminOtpEmail) ? config.adminOtpEmail : email;

            // 2. Cooldown check
            if (user.resetCodeExpires) {
                const lastSent = new Date(user.resetCodeExpires.getTime() - 10 * 60 * 1000);
                const elapsed = Date.now() - lastSent.getTime();
                
                if (elapsed < OTP_RESEND_COOLDOWN_MS) {
                    const waitSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
                    return res.json({ 
                        success: true, 
                        message: `If an account exists, a reset code has been sent. Please wait ${waitSec}s to resend.`,
                        wait: waitSec 
                    });
                }
            }

            // 3. Generate and save
            const resetCode = generateCode();
            user.resetCode = resetCode;
            user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();

            // 4. Use the defined recipientEmail
            enqueueEmail(
                [{ email: recipientEmail }],
                'Password Reset Code - eGuide System',
                otpEmailHtml(resetCode, 'Password Reset Code', 'Use the code below to reset your password. It expires in <strong>10 minutes</strong>.')
            );
        }
        
        // Always send generic success
        res.json({ success: true, message: 'Reset code sent to your email.' });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ success: false, message: 'An unexpected error occurred. Please try again.' });
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
