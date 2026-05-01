import express from 'express';
import Announcement from '../models/announcement.js';
import User from '../models/user.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { sendAnnouncementEmail } from '../config/email.js';

const router = express.Router();

// Get all announcements (Public)
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ date_posted: -1 });
        res.json({
            success: true,
            count: announcements.length,
            data: announcements
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single announcement (Public)
router.get('/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        res.json({ success: true, data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create announcement (Admin only) - WITH EMAIL NOTIFICATION
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide title and content' 
            });
        }
        
        const announcement = await Announcement.create({ title, content });
        const students = await User.find({ role: 'student' }).select('email name');
        
        // Send emails in background - don't await so response is immediate
        if (students.length > 0) {
            sendAnnouncementEmail(students, announcement)
                .then(result => console.log(result.success ? `✅ Emails sent to ${students.length} students` : `❌ Email error: ${result.error}`))
                .catch(err => console.error('❌ Email send error:', err.message))
        } else {
            console.log('📭 No students found to send emails to')
        }
        
        res.status(201).json({
            success: true,
            message: 'Announcement created successfully' + (students.length > 0 ? '. Emails will be sent!' : '. No students to notify.'),
            data: announcement
        });
    } catch (error) {
        console.error('❌ Error in announcement creation:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update announcement (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { title, content } = req.body;
        
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        
        announcement.title = title || announcement.title;
        announcement.content = content || announcement.content;
        await announcement.save();
        
        res.json({
            success: true,
            message: 'Announcement updated successfully',
            data: announcement
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete announcement (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        
        await announcement.deleteOne();
        
        res.json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;