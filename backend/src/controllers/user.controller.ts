import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';

/**
 * PATCH /api/v1/users/me
 * Allows the authenticated user to update their own profile fields:
 * bio, avatarUrl, skills, department, name
 */
export const updateMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;

    // Whitelist only safe fields — never let users set role/coinBalance/isVerified
    const ALLOWED: (keyof typeof req.body)[] = [
      'name', 'bio', 'avatarUrl', 'department', 'skills',
    ];

    const updates: Record<string, unknown> = {};
    ALLOWED.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Skills must be an array of strings, max 10
    if (updates.skills !== undefined) {
      if (!Array.isArray(updates.skills)) {
        res.status(422).json({ status: 'fail', message: 'Skills must be an array.' });
        return;
      }
      updates.skills = (updates.skills as unknown[])
        .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
        .slice(0, 10)
        .map((s) => s.trim().toLowerCase());
    }

    // Bio max length guard
    if (typeof updates.bio === 'string' && updates.bio.length > 300) {
      res.status(422).json({ status: 'fail', message: 'Bio cannot exceed 300 characters.' });
      return;
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
