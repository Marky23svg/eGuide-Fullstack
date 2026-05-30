import express from 'express';
import Requirement from '../models/requirement.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { getCachedValue, setCachedValue, clearCachePrefix } from '../utils/cache.js';
import { invalidateChatbotCache } from '../utils/chatbotRag.js';

const router = express.Router();

// ========== PUBLIC ROUTES (Everyone can view) ==========

// Get all requirements
router.get('/', async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
        const offset = (page - 1) * limit;
        const cacheKey = `requirements:page=${page}:limit=${limit}`;
        const cached = getCachedValue(cacheKey);

        if (cached) {
            return res.json(cached);
        }

        const [requirements, total] = await Promise.all([
            Requirement.find()
                .sort({ date_posted: -1 })
                .skip(offset)
                .limit(limit)
                .select('title requirements procedure date_posted'),
            Requirement.countDocuments(),
        ]);

        const response = {
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            count: requirements.length,
            data: requirements,
        };

        setCachedValue(cacheKey, response);
        res.json(response);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get single requirement by ID
router.get('/:id', async (req, res) => {
    try {
        const requirement = await Requirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        res.json({
            success: true,
            data: requirement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== ADMIN ONLY ROUTES ==========

// Create new requirement (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { title, requirements, procedure } = req.body;

        if (!title || !requirements || !procedure) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, requirements, and procedure'
            });
        }

        const requirement = await Requirement.create({ title, requirements, procedure });
        clearCachePrefix('requirements');
        invalidateChatbotCache();

        res.status(201).json({
            success: true,
            message: 'Requirement created successfully',
            data: requirement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update requirement (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { title, requirements, procedure } = req.body;

        const requirement = await Requirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        requirement.title = title || requirement.title;
        requirement.requirements = requirements || requirement.requirements;
        requirement.procedure = procedure || requirement.procedure;

        await requirement.save();
        clearCachePrefix('requirements');
        invalidateChatbotCache();

        res.json({
            success: true,
            message: 'Requirement updated successfully',
            data: requirement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete requirement (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const requirement = await Requirement.findById(req.params.id);

        if (!requirement) {
            return res.status(404).json({
                success: false,
                message: 'Requirement not found'
            });
        }

        await requirement.deleteOne();
        clearCachePrefix('requirements');
        invalidateChatbotCache();

        res.json({
            success: true,
            message: 'Requirement deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
