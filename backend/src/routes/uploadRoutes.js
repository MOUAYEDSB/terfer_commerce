const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// @desc    Upload single image
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the file path
    res.json({
        message: 'Image uploaded successfully',
        filePath: `/uploads/${req.file.filename}`,
        filename: req.file.filename
    });
});

// @desc    Upload shop banner
// @route   POST /api/upload/banner
// @access  Private (Seller only)
router.post('/banner', protect, upload.single('banner'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Check if user is seller
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Only sellers can upload banners' });
        }

        const filePath = `/uploads/${req.file.filename}`;

        // Update user's shopBanner
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.shopBanner = filePath;
        await user.save();

        res.json({
            message: 'Banner uploaded successfully',
            filePath: filePath,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Banner upload error:', error);
        res.status(500).json({ message: 'Error uploading banner' });
    }
});

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', protect, upload.array('images', 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    // Return array of file paths
    const filePaths = req.files.map(file => ({
        filePath: `/uploads/${file.filename}`,
        filename: file.filename
    }));

    res.json({
        message: 'Images uploaded successfully',
        files: filePaths
    });
});

module.exports = router;
