import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, default: '' },
    date: { type: String, default: '' },
    description: { type: String, default: '' },
    fullDetails: { type: String, default: '' },
    requirements: [{ type: String }],
    image: { type: String, default: '' },
    actionButton: {
        label: { type: String, default: '' },
        url: { type: String, default: '' }
    },
    emailNotification: { type: Boolean, default: false },
    date_posted: { type: Date, default: Date.now }
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;