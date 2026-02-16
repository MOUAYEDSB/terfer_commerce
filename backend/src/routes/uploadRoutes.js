const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { protect } = require('../middleware/authMiddleware');

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
