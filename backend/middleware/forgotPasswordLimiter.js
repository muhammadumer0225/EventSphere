const { rateLimit } = require("express-rate-limit");

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 5,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many password reset requests. Please try again after 15 minutes."
    }
});

module.exports = forgotPasswordLimiter;