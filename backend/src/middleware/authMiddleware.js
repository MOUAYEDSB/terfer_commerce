const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const parseCookieToken = (cookieHeader, cookieName = 'auth_token') => {
    if (!cookieHeader) return null;
    const parts = cookieHeader.split(';').map((chunk) => chunk.trim());
    const tokenPart = parts.find((chunk) => chunk.startsWith(`${cookieName}=`));
    if (!tokenPart) return null;
    return decodeURIComponent(tokenPart.slice(cookieName.length + 1));
};

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
    let token;

    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            const headerToken = req.headers.authorization.split(' ')[1];
            if (headerToken && headerToken !== 'null' && headerToken !== 'undefined') {
                token = headerToken;
            }
        }

        if (!token) {
            token = parseCookieToken(req.headers.cookie, 'auth_token');
        }

        if (!token) {
            res.status(401);
            throw new Error('Not authorized, no token');
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            res.status(401);
            throw new Error('User not found');
        }

        if (!req.user.isActive) {
            res.status(401);
            throw new Error('User account is deactivated');
        }

        next();
    } catch (error) {
        console.error(error);
        if (error.message === 'User not found' || error.message === 'User account is deactivated') {
            throw error;
        }
        res.status(401);
        throw new Error('Not authorized, token failed');
    }
});

// Seller middleware
const seller = (req, res, next) => {
    if (!req.user) {
        res.status(403);
        throw new Error('Not authorized as seller');
    }

    if (req.user.role === 'admin') {
        next();
        return;
    }

    if (req.user.role === 'seller') {
        if (!req.user.isVerifiedSeller) {
            res.status(403);
            throw new Error('Seller account pending admin approval');
        }

        next();
        return;
    }

    res.status(403);
    throw new Error('Not authorized as seller');
};

// Admin middleware
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as admin');
    }
};

module.exports = { protect, seller, admin };
