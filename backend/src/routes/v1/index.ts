import { Router } from 'express';
import authRoutes from './auth.routes';
import swapRoutes from './swap.routes';
import flexRoutes from './flex.routes';

const router = Router();

/**
 * CampusCoin API v1 — Route Registry
 *
 * Base: /api/v1
 * ├── /auth     → Authentication (register, login, logout, me)
 * ├── /swap     → Swap Marketplace (tasks, applications, lifecycle)
 * └── /flex     → Flex Community Feed (posts, likes, comments)
 */

router.use('/auth', authRoutes);
router.use('/swap', swapRoutes);
router.use('/flex', flexRoutes);

export default router;
