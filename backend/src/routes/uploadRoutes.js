const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadDisk = require('../config/multer');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

const useCloudinary = isCloudinaryConfigured();

const uploadMemory = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: uploadDisk.fileFilter
});

const upload = useCloudinary ? uploadMemory : uploadDisk;

const uploadToCloudinary = async (file, folder = '') => {
    const base64 = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
        folder: folder || process.env.CLOUDINARY_FOLDER || 'terfer',
        resource_type: 'image'
    });

    return {
        url: result.secure_url,
        publicId: result.public_id
    };
};

// @desc    Upload single image
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const respond = async () => {
        if (useCloudinary) {
            const uploaded = await uploadToCloudinary(req.file, process.env.CLOUDINARY_FOLDER);
            return res.json({
                message: 'Image uploaded successfully',
                filePath: uploaded.url,
                filename: uploaded.publicId
            });
        }

        // Local fallback
        return res.json({
            message: 'Image uploaded successfully',
            filePath: `/uploads/${req.file.filename}`,
            filename: req.file.filename
        });
    };

    respond().catch((error) => {
        console.error('Image upload error:', error);
        res.status(500).json({ message: 'Error uploading image' });
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

        let filePath = `/uploads/${req.file.filename}`;
        if (useCloudinary) {
            const uploaded = await uploadToCloudinary(req.file, process.env.CLOUDINARY_FOLDER);
            filePath = uploaded.url;
        }

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
            filename: useCloudinary ? filePath : req.file.filename
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

    const respond = async () => {
        if (useCloudinary) {
            const uploaded = await Promise.all(
                req.files.map(file => uploadToCloudinary(file, process.env.CLOUDINARY_FOLDER))
            );
            return res.json({
                message: 'Images uploaded successfully',
                files: uploaded.map(item => ({
                    filePath: item.url,
                    filename: item.publicId
                }))
            });
        }

        // Local fallback
        const filePaths = req.files.map(file => ({
            filePath: `/uploads/${file.filename}`,
            filename: file.filename
        }));

        return res.json({
            message: 'Images uploaded successfully',
            files: filePaths
        });
    };

    respond().catch((error) => {
        console.error('Multiple upload error:', error);
        res.status(500).json({ message: 'Error uploading images' });
    });
});

module.exports = router;
