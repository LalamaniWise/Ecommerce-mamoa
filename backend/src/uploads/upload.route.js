const express = require('express');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Images are saved to backend/uploads and served at /uploads/<file>.
// For production, swap this for Cloudinary or S3 (local disk is wiped on most hosts).
const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', '..', 'uploads'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype);
        cb(ok ? null : new Error('Only JPG, PNG, WEBP or GIF images are allowed'), ok);
    },
});

router.post('/image', verifyToken, (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) return res.status(400).send({ message: err.message });
        if (!req.file) return res.status(400).send({ message: 'No image uploaded' });
        const base = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
        res.status(201).send({ url: `${base}/uploads/${req.file.filename}` });
    });
});

module.exports = router;
