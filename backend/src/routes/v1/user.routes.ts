import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { getMe, updateMe } from '../../controllers/user.controller';

const router = Router();

// All user routes require authentication
router.use(protect);

/**
 * GET  /api/v1/users/me  — get my profile
 * PATCH /api/v1/users/me — update bio, avatar, skills, department
 */
router.get('/',  getMe);
router.route('/me')
  .get(getMe)
  .patch(updateMe);

export default router;
