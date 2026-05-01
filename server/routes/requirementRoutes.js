import express from 'express';
import Requirement from '../models/requirement.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ========== PUBLIC ROUTES (Everyone can view) ==========

// Get all requirements
router.get('/', async (req, res) => {
    try {
        const requirements = await Requirement.find().sort({ date_posted: -1 });
        
        res.json({
            success: true,
            count: requirements.length,
            data: requirements
        });
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
        
        // Validate required fields
        if (!title || !requirements || !procedure) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide title, requirements, and procedure' 
            });
        }
        
        const requirement = await Requirement.create({
            title,
            requirements,
            procedure
        });
        
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