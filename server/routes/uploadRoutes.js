import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'eguide', resource_type: 'image' },
                (error, result) => error ? reject(error) : resolve(result)
            ).end(req.file.buffer);
        });

        res.json({ success: true, url: result.secure_url });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
