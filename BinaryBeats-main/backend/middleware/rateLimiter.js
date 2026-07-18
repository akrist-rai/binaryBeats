    // middleware/rateLimiter.js
    const rateLimit = require('express-rate-limit');

    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 min
        max: 10,                   // 10 attempts per window
        message: { error: 'Too many attempts, try again later' },
        standardHeaders: true,
        legacyHeaders: false,
    });

    const generalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
    });

    module.exports = { authLimiter, generalLimiter };