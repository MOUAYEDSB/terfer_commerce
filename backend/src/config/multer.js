const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Create unique filename: timestamp-randomstring-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - only allow images
// Some browsers/devices upload JPEGs with uncommon extensions (e.g. .jfif) or modern formats (e.g. .avif, .heic).
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = String(file.mimetype || '').toLowerCase();

    const allowedExts = new Set([
        '.jpeg', '.jpg', '.jfif',
        '.png', '.gif', '.webp',
        '.svg', '.avif', '.heic', '.heif'
    ]);

    const isImageMime = mime.startsWith('image/');
    const isAllowedExt = ext ? allowedExts.has(ext) : false;

    // Accept if extension is an allowed image extension (best effort),
    // or if MIME type indicates an image (some uploads may omit extensions).
    if (isAllowedExt || isImageMime) {
        return cb(null, true);
    }

    const detail = process.env.NODE_ENV === 'production'
        ? ''
        : ` (mime=${mime || 'unknown'}, ext=${ext || 'none'})`;
    cb(new Error(`Only image files are allowed!${detail}`));
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: fileFilter
});

module.exports = upload;
