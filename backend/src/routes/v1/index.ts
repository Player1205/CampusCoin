import { Router } from 'express';
import authRoutes from './auth.routes';
import swapRoutes from './swap.routes';
import flexRoutes from './flex.routes';
import userRoutes from './user.routes';

const router = Router();

/**
 * CampusCoin API v1 — Route Registry
 *
 * Base: /api/v1
 * ├── /auth     → Authentication
 * ├── /users    → User profile updates (bio, avatar, skills)
 * ├── /swap     → Task marketplace
 * └── /flex     → Community feed
 */
router.use('/auth',  authRoutes);
router.use('/users', userRoutes);
router.use('/swap',  swapRoutes);
router.use('/flex',  flexRoutes);

export default router;
