const rateLimit = require('express-rate-limit');

// General API limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Login limiter - 5 attempts per 15 minutes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many login attempts, please try again after 15 minutes',
    skipSuccessfulRequests: true, // Don't count successful requests
    keyGenerator: (req, res) => {
        return req.body.email || req.ip; // Use email as key to prevent enumeration
    },
});

// Register limiter - 3 accounts per hour per IP
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many accounts created from this IP, please try again after an hour',
    skipSuccessfulRequests: false,
});

// Forgot password limiter - 3 attempts per hour
const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many password reset attempts, please try again after an hour',
    skipSuccessfulRequests: false,
});

module.exports = {
    apiLimiter,
    loginLimiter,
    registerLimiter,
    forgotPasswordLimiter
};
