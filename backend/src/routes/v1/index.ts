import { Router } from 'express';
import authRoutes from './auth.routes';
import swapRoutes from './swap.routes';
import flexRoutes from './flex.routes';
import userRoutes from './user.routes';
import chatRoutes from './chat.routes';

const router = Router();

router.use('/auth',  authRoutes);
router.use('/users', userRoutes);
router.use('/swap',  swapRoutes);
router.use('/flex',  flexRoutes);
router.use('/chats', chatRoutes);

export default router;
