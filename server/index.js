import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import requirementRoutes from './routes/requirementRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import saveRoutes from './routes/saveRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiters
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,                  // max 200 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,                   // max 20 auth attempts per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts, please try again later.' }
});

const publicReadLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 minute
    max: 60,                   // max 60 reads per IP per minute (covers chatbot fetches)
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please slow down.' }
});

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:4173'] }));
app.use(express.json({ limit: '10kb' })); // Prevent oversized payloads
app.use(globalLimiter);                   // Apply global rate limit to all routes

// MongoDB Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Atlas Connected Successfully!`);
        console.log(`📊 Host: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ Connection Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();

// ========== ROUTES ==========

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'eGuide System API is running!', status: 'online' });
});

// Auth routes (stricter limit)
app.use('/api/auth', authLimiter, authRoutes);

// Requirement routes (public read limiter)
app.use('/api/requirements', publicReadLimiter, requirementRoutes);

// Announcement routes (public read limiter)
app.use('/api/announcements', publicReadLimiter, announcementRoutes);

// User routes
app.use('/api/users', userRoutes);

// Saved Requirement routes
app.use('/api/saved', saveRoutes);

// Upload routes
app.use('/api/upload', uploadRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});