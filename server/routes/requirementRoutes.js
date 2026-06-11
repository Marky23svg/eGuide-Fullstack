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
            console.log(`[REQUIREMENTS API] Serving from cache: Page ${page}, Limit ${limit}`);
            return res.json(cached);
        }

        const [requirements, total] = await Promise.all([
            Requirement.find()
                .sort({ date_posted: -1 })
                .skip(offset)
                .limit(limit)
                .select('_id title requirements procedure date_posted'),
            Requirement.countDocuments(),
        ]);

        console.log(`[REQUIREMENTS API] Fresh query: Page ${page}, Limit ${limit}: returned ${requirements.length}/${total} documents`);

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

// Debug: Compare database count vs returned data
router.get('/admin/debug/count', protect, adminOnly, async (req, res) => {
    try {
        const totalCount = await Requirement.countDocuments();
        const allDocs = await Requirement.find().select('_id title').lean();
        
        // Also test the regular API response
        const page = 1;
        const limit = 20;
        const [apiDocs, apiTotal] = await Promise.all([
            Requirement.find()
                .sort({ date_posted: -1 })
                .skip(0)
                .limit(limit)
                .select('title requirements procedure date_posted'),
            Requirement.countDocuments(),
        ]);
        
        res.json({
            totalCountInDb: totalCount,
            allDocuments: allDocs.map(d => ({ id: d._id, title: d.title })),
            apiResponse: {
                page,
                limit,
                totalCount: apiTotal,
                returnedCount: apiDocs.length,
                items: apiDocs.map(d => d.title),
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug: Look for documents with missing _id or required fields
router.get('/admin/debug/missing', protect, adminOnly, async (req, res) => {
    try {
        const allDocs = await Requirement.find().lean();
        
        const missingId = allDocs.filter(d => !d._id);
        const missingTitle = allDocs.filter(d => !d.title || d.title.trim() === '');
        const missingRequirements = allDocs.filter(d => !d.requirements || d.requirements.trim() === '');
        const missingProcedure = allDocs.filter(d => !d.procedure || d.procedure.trim() === '');
        
        // Count valid documents (have all required fields)
        const validDocs = allDocs.filter(d => 
            d._id && 
            d.title && d.title.trim() !== '' &&
            d.requirements && d.requirements.trim() !== '' &&
            d.procedure && d.procedure.trim() !== ''
        );
        
        res.json({
            total: allDocs.length,
            valid: validDocs.length,
            missingId: missingId.length,
            missingTitle: missingTitle.length,
            missingRequirements: missingRequirements.length,
            missingProcedure: missingProcedure.length,
            issues: {
                emptyRequirements: missingRequirements.map(d => ({ _id: d._id, title: d.title || '(no title)' })),
                emptyProcedure: missingProcedure.map(d => ({ _id: d._id, title: d.title || '(no title)' })),
                emptyTitle: missingTitle.map(d => ({ _id: d._id })),
            },
            validDocuments: validDocs.map(d => ({ _id: d._id, title: d.title })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug: Get ALL documents with complete data (no pagination)
router.get('/admin/debug/all', protect, adminOnly, async (req, res) => {
    try {
        const allDocs = await Requirement.find()
            .sort({ date_posted: -1 })
            .select('_id title requirements procedure date_posted')
            .lean();
        
        res.json({
            total: allDocs.length,
            documents: allDocs.map((doc, idx) => ({
                index: idx + 1,
                _id: doc._id,
                title: doc.title,
                hasRequirements: doc.requirements && doc.requirements.trim().length > 0,
                requirementsLength: doc.requirements ? doc.requirements.length : 0,
                hasProcedure: doc.procedure && doc.procedure.trim().length > 0,
                procedureLength: doc.procedure ? doc.procedure.length : 0,
                date_posted: doc.date_posted,
            })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug: Compare what database has vs what API endpoint returns
router.get('/admin/debug/comparison', protect, adminOnly, async (req, res) => {
    try {
        // Get ALL from database
        const dbDocs = await Requirement.find()
            .sort({ date_posted: -1 })
            .select('_id title requirements procedure date_posted')
            .lean();
        
        // Simulate what the API endpoint returns (page 1, limit 20)
        const apiDocs = await Requirement.find()
            .sort({ date_posted: -1 })
            .skip(0)
            .limit(20)
            .select('_id title requirements procedure date_posted')
            .lean();
        
        // Find which ones are missing
        const dbIds = new Set(dbDocs.map(d => d._id.toString()));
        const apiIds = new Set(apiDocs.map(d => d._id.toString()));
        
        const missing = dbDocs.filter(d => !apiIds.has(d._id.toString()));
        
        res.json({
            dbTotal: dbDocs.length,
            apiReturned: apiDocs.length,
            missingCount: missing.length,
            missingDocuments: missing.map(d => ({
                _id: d._id,
                title: d.title,
                hasRequirements: d.requirements && d.requirements.trim().length > 0,
                hasProcedure: d.procedure && d.procedure.trim().length > 0,
                date_posted: d.date_posted,
            })),
            allDbDocs: dbDocs.map(d => ({
                _id: d._id,
                title: d.title,
                inApi: apiIds.has(d._id.toString()),
            })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Remove documents with empty requirements or procedure
router.post('/admin/cleanup/remove-incomplete', protect, adminOnly, async (req, res) => {
    try {
        const incomplete = await Requirement.find({
            $or: [
                { requirements: { $eq: '' } },
                { requirements: null },
                { procedure: { $eq: '' } },
                { procedure: null },
            ]
        });
        
        const ids = incomplete.map(d => d._id);
        const result = await Requirement.deleteMany({
            $or: [
                { requirements: { $eq: '' } },
                { requirements: null },
                { procedure: { $eq: '' } },
                { procedure: null },
            ]
        });
        
        clearCachePrefix('requirements');
        invalidateChatbotCache();
        
        res.json({
            message: `Deleted ${result.deletedCount} incomplete documents`,
            deletedCount: result.deletedCount,
            removedIds: ids,
            incompleteDocuments: incomplete.map(d => ({ _id: d._id, title: d.title })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
