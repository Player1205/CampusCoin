import rateLimit from 'express-rate-limit';

/**
 * Strict rate limiter for authentication routes (login, register)
 * Max 5 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
});

/**
 * Strict rate limiter for OTP generation routes
 * Max 3 requests per hour per IP.
 */
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many OTP requests from this IP, please try again after an hour.',
  },
});
