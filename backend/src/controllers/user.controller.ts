import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';
import { UpdateProfileInput } from '../validations/user.schema';

/**
 * PATCH /api/v1/users/me
 * Allows the authenticated user to update their own profile fields.
 * Input is validated and sanitized by Zod (updateProfileSchema) before reaching here.
 * The schema uses .strict() to reject any unknown fields (e.g. role, coinBalance).
 */
export const updateMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const updates = req.body as UpdateProfileInput;

    // Normalize skills to lowercase if provided
    if (updates.skills) {
      updates.skills = updates.skills.map((s) => s.trim().toLowerCase());
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ status: 'fail', message: 'User not found.' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { user: user.toSafeObject() },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/users/me
 * Return the currently authenticated user's profile.
 */
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ status: 'fail', message: 'User not found.' });
      return;
    }
    res.status(200).json({
      status: 'success',
      data: { user: user.toSafeObject() },
    });
  } catch (err) {
    next(err);
  }
};
