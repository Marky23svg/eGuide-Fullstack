import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
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

const Requirement = mongoose.model('Requirement', requirementSchema);
export default Requirement;