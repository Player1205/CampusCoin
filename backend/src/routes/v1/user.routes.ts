import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { updateProfileSchema } from '../../validations/user.schema';
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
  .patch(validate(updateProfileSchema), updateMe);

export default router;
