import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import requirementRoutes from './routes/requirementRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import saveRoutes from './routes/saveRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:4173'] }));
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

// ========== ROUTES ==========

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'eGuide System API is running!', status: 'online' });
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

// Upload routes
app.use('/api/upload', uploadRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});