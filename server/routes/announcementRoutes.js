import express from 'express';
import mongoose from 'mongoose';
import Announcement from '../models/announcement.js';
import User from '../models/user.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { enqueueAnnouncementEmail } from '../utils/emailQueue.js';
import { getCachedValue, setCachedValue, clearCachePrefix } from '../utils/cache.js';
import { invalidateChatbotCache } from '../utils/chatbotRag.js';

const router = express.Router();

// Sanitize action buttons before they ever reach Mongoose.
// The admin form always sends documentId as '' for URL-type buttons, which
// Mongoose's ObjectId caster rejects. We strip it here at the plain-object
// level so it never hits the schema caster, regardless of Mongoose version
// or setter timing. This also lets a single announcement freely mix
// multiple URL buttons and multiple document buttons.
function sanitizeActionButtons(buttons) {
    if (!Array.isArray(buttons)) return [];
    return buttons
        .filter(b => b && typeof b.label === 'string' && b.label.trim())
        .map(b => {
            const hasValidDocId = b.documentId && mongoose.Types.ObjectId.isValid(b.documentId);
            return {
                label: b.label,
                url: hasValidDocId ? '' : (b.url || ''),
                documentId: hasValidDocId ? b.documentId : null,
                documentTitle: hasValidDocId ? (b.documentTitle || '') : '',
            };
        });
}

// Get all announcements (Public)
router.get('/', async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
        const offset = (page - 1) * limit;
        const cacheKey = `announcements:page=${page}:limit=${limit}`;
        const cached = getCachedValue(cacheKey);
        if (cached) return res.json(cached);

        const [announcements, total] = await Promise.all([
            Announcement.find().sort({ date_posted: -1 }).skip(offset).limit(limit),
            Announcement.countDocuments(),
        ]);

        const response = { success: true, page, limit, total, totalPages: Math.ceil(total / limit), count: announcements.length, data: announcements };
        setCachedValue(cacheKey, response);
        res.json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single announcement (Public)
router.get('/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
        res.json({ success: true, data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create announcement (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { title, content, category, date, description, fullDetails, requirements, image, actionButton, actionButtons, emailNotification } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Please provide title and content' });
        }

        const announcement = await Announcement.create({
            title, content, category, date, description, fullDetails, requirements, image,
            actionButton: actionButton || { label: '', url: '' },
            actionButtons: sanitizeActionButtons(actionButtons),
            emailNotification,
        });

        clearCachePrefix('announcements');
        invalidateChatbotCache();

        if (emailNotification) {
            const students = await User.find({ role: 'student' }).select('email').lean();
            if (students.length > 0) {
                enqueueAnnouncementEmail(students, announcement);
                console.log(`📧 [EmailQueue] Queued for ${students.length} student(s)`);
            }
        }

        res.status(201).json({
            success: true,
            message: emailNotification ? 'Announcement created. Emails queued.' : 'Announcement created.',
            data: announcement,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update announcement (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { title, content, category, date, description, fullDetails, requirements, image, actionButton, actionButtons, emailNotification } = req.body;

        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });

        if (title !== undefined) announcement.title = title;
        if (content !== undefined) announcement.content = content;
        if (category !== undefined) announcement.category = category;
        if (date !== undefined) announcement.date = date;
        if (description !== undefined) announcement.description = description;
        if (fullDetails !== undefined) announcement.fullDetails = fullDetails;
        if (requirements !== undefined) announcement.requirements = requirements;
        if (image !== undefined) announcement.image = image;
        if (actionButton !== undefined) announcement.actionButton = actionButton;
        if (actionButtons !== undefined) announcement.actionButtons = sanitizeActionButtons(actionButtons);
        if (emailNotification !== undefined) announcement.emailNotification = emailNotification;

        await announcement.save();
        clearCachePrefix('announcements');
        invalidateChatbotCache();

        res.json({ success: true, message: 'Announcement updated successfully', data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete announcement (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
        await announcement.deleteOne();
        clearCachePrefix('announcements');
        invalidateChatbotCache();
        res.json({ success: true, message: 'Announcement deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;