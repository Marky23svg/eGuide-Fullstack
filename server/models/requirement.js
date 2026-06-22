import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    requirements: {
        type: String,
        required: true
    },
    procedure: {
        type: String,
        required: true
    },
    date_posted: {
        type: Date,
        default: Date.now
    }
});

requirementSchema.index({ title: 'text', requirements: 'text', procedure: 'text', description: 'text' });
requirementSchema.index({ date_posted: -1 });

const Requirement = mongoose.model('Requirement', requirementSchema);
export default Requirement;