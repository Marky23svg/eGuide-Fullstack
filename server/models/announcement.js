import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    date_posted: {
        type: Date,
        default: Date.now
    }
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;