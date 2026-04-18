import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';  // ADD THIS
import authRoutes from './routes/authRoutes.js';
import requirementRoutes from './routes/requirementRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import saveRoutes from './routes/saveRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
// TEMPORARY - Check environment variables
app.get('/api/debug/env', (req, res) => {
    res.json({
        jwt_secret_exists: !!process.env.JWT_SECRET,
        jwt_secret_value: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'not set',
        jwt_secret_length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
        port: process.env.PORT,
        node_env: process.env.NODE_ENV || 'not set'
    });
});

// ========== ROUTES ==========

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'eGuide System API is running!',
        status: 'online',
        endpoints: {
            auth: {
                signup: 'POST /api/auth/signup',
                login: 'POST /api/auth/login'
            },
            requirements: {
                getAll: 'GET /api/requirements',
                getOne: 'GET /api/requirements/:id',
                create: 'POST /api/requirements (Admin only)',
                update: 'PUT /api/requirements/:id (Admin only)',
                delete: 'DELETE /api/requirements/:id (Admin only)'
            },
            announcements: '/api/announcements',
            saved: '/api/saved'
        }
    });
});

// TEMPORARY DEBUG ROUTE - Remove after testing
app.post('/api/debug/token', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.json({ error: 'No Authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.json({ error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ 
            success: true, 
            decoded,
            secretUsed: process.env.JWT_SECRET ? 'Yes' : 'No'
        });
    } catch (error) {
        res.json({ 
            success: false, 
            error: error.message,
            tokenPreview: token.substring(0, 50) + '...'
        });
    }
});

// Auth routes
app.use('/api/auth', authRoutes);

// Requirement routes
app.use('/api/requirements', requirementRoutes);

// Announcement routes
app.use('/api/announcements', announcementRoutes);

// User routes
app.use('/api/users', userRoutes);

// Saved Requirement routes
app.use('/api/saved', saveRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});