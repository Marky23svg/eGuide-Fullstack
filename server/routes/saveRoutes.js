import express from 'express';
import SavedRequirement from '../models/savedrequirement.js';
import Requirement from '../models/requirement.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ========== STUDENT ONLY ROUTES ==========

// Save a requirement (Add to student's saved list)
router.post('/:requirementId', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const { requirementId } = req.params;
        
        // Check if requirement exists
        const requirement = await Requirement.findById(requirementId);
        if (!requirement) {
            return res.status(404).json({ 
                success: false, 
                message: 'Requirement not found' 
            });
        }
        
        // Check if already saved
        const existing = await SavedRequirement.findOne({ 
            user_id: userId, 
            requirement_id: requirementId 
        });
        
        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: 'Requirement already saved' 
            });
        }
        
        // Save the requirement
        const saved = await SavedRequirement.create({
            user_id: userId,
            requirement_id: requirementId
        });
        
        res.status(201).json({
            success: true,
            message: 'Requirement saved successfully',
            data: saved
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Get all saved requirements for the logged-in student
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const savedRequirements = await SavedRequirement.find({ user_id: userId })
            .populate('requirement_id') // This gets the full requirement details
            .sort({ date_saved: -1 });
        
        res.json({
            success: true,
            count: savedRequirements.length,
            data: savedRequirements
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Remove a saved requirement (Unsave)
router.delete('/:requirementId', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const { requirementId } = req.params;
        
        const saved = await SavedRequirement.findOneAndDelete({
            user_id: userId,
            requirement_id: requirementId
        });
        
        if (!saved) {
            return res.status(404).json({ 
                success: false, 
                message: 'Saved requirement not found' 
            });
        }
        
        res.json({
            success: true,
            message: 'Requirement removed from saved list'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Check if a requirement is saved by the student
router.get('/check/:requirementId', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const { requirementId } = req.params;
        
        const saved = await SavedRequirement.findOne({
            user_id: userId,
            requirement_id: requirementId
        });
        
        res.json({
            success: true,
            isSaved: !!saved
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

export default router;