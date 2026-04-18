import mongoose from 'mongoose';

const savedRequirementSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requirement_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Requirement',
        required: true
    },
    date_saved: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate saves (same user cannot save same requirement twice)
savedRequirementSchema.index({ user_id: 1, requirement_id: 1 }, { unique: true });

const SavedRequirement = mongoose.model('SavedRequirement', savedRequirementSchema);
export default SavedRequirement;