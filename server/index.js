import './config/config.js'; // ← validates all required env vars at startup, exits if any missing

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { config } from './config/config.js';
import { verifyEmailTransporter } from './config/email.js';
import authRoutes from './routes/authRoutes.js';
import requirementRoutes from './routes/requirementRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import saveRoutes from './routes/saveRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();

// ✅ Trust proxy for Render (MUST BE FIRST)
app.set('trust proxy', 1);
console.log('✅ Trust proxy setting is ENABLED for Render');

// Rate limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts, please try again later.' }
});

const publicReadLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please slow down.' }
});

// Body parsers (MUST be before routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:4173',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:4173',
        'https://eguide-fullstack-gluh.onrender.com',
        'https://e-guide-fullstack-cjdmrk.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());

// ── MongoDB Connection with pooling ──────────────────────────────────────────
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUri, {
            maxPoolSize: 10,              // max concurrent connections
            serverSelectionTimeoutMS: 5000, // fail fast if Atlas is unreachable
            socketTimeoutMS: 45000,       // drop idle sockets after 45s
        });
        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();

// ── Routes ───────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
    res.json({ message: 'eGuide System API is running!', status: 'online' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/requirements', publicReadLimiter, requirementRoutes);
app.use('/api/announcements', publicReadLimiter, announcementRoutes);
app.use('/api/chatbot', publicReadLimiter, chatbotRoutes);
app.use('/api/users', publicReadLimiter, userRoutes);
app.use('/api/saved', saveRoutes);
app.use('/api/upload', uploadRoutes);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    // Verify SMTP connection at startup — logs success or failure immediately
    verifyEmailTransporter();
});

// ── Global error handler (must be last) ──────────────────────────────────────
// Catches any unhandled errors thrown inside route handlers
app.use((err, req, res, next) => {
    console.error('❌ Unhandled server error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error.',
    });
});
