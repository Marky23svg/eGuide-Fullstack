import express from 'express';
import User from '../models/user.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude passwords
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all students only (Admin only)
router.get('/students', protect, adminOnly, async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all admins only (Admin only)
router.get('/admins', protect, adminOnly, async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.json({
            success: true,
            count: admins.length,
            data: admins
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;