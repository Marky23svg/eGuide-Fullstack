import mongoose from 'mongoose';

const actionButtonSchema = new mongoose.Schema({
    label: { type: String, default: '' },
    url: { type: String, default: '' },
    // If this button links to a document instead of a URL:
    // Setter coerces '' (sent by URL-type buttons from the admin form) to null
    // so Mongoose doesn't try to cast an empty string to ObjectId and throw a
    // validation error. Without this, URL-type buttons fail to save.
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Requirement',
        default: null,
        set: (v) => (v ? v : null),
    },
    documentTitle: { type: String, default: '' },
}, { _id: false });

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, default: '' },
    date: { type: String, default: '' },
    description: { type: String, default: '' },
    fullDetails: { type: String, default: '' },
    requirements: [{ type: String }],
    image: { type: String, default: '' },
    // Multiple action buttons (replaces old single actionButton)
    actionButtons: [actionButtonSchema],
    // Legacy single button kept for backwards compat
    actionButton: {
        label: { type: String, default: '' },
        url: { type: String, default: '' }
    },
    emailNotification: { type: Boolean, default: false },
    date_posted: { type: Date, default: Date.now }
});

announcementSchema.index({ title: 'text', content: 'text', description: 'text', fullDetails: 'text', category: 'text', requirements: 'text' });
announcementSchema.index({ date_posted: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;