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
    },
    // Stores checkbox progress: { steps: [bool,...], reqs: [bool,...] }
    progress: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
});

// Prevent duplicate saves
savedRequirementSchema.index({ user_id: 1, requirement_id: 1 }, { unique: true });

const SavedRequirement = mongoose.model('SavedRequirement', savedRequirementSchema);
export default SavedRequirement;