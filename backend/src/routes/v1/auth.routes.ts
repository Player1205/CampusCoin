import { Router } from 'express';
import * as authController from '../../controllers/auth.controller';
import { protect } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../../validations/auth.schema';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new student account
 * @access  Public
 */
router.post('/register', authLimiter, validate(registerSchema), authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & receive JWT cookie
 * @access  Public
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Clear the JWT cookie
 * @access  Public (no token needed to log out)
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get the currently authenticated user's profile
 * @access  Protected
 */
router.get('/me', protect, authController.getMe);

export default router;
