import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';
import { UpdateProfileInput, VerifyEmailInput } from '../validations/user.schema';
import { sendVerificationEmail } from '../services/email.service';

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

    // ─── Milestone rewards (one-time coin bonuses) ────────────────────────
    let coinsAwarded = 0;

    // +10 coins for adding 3+ skills (one-time)
    if (
      user.skills.length >= 3 &&
      !user.milestoneRewards?.skills
    ) {
      await User.findByIdAndUpdate(userId, {
        $inc: { coinBalance: 10 },
        $set: { 'milestoneRewards.skills': true },
      });
      user.coinBalance += 10;
      coinsAwarded += 10;
    }

    // +20 coins for uploading a profile picture (one-time)
    if (
      updates.avatarUrl &&
      updates.avatarUrl !== '' &&
      !user.milestoneRewards?.avatar
    ) {
      await User.findByIdAndUpdate(userId, {
        $inc: { coinBalance: 20 },
        $set: { 'milestoneRewards.avatar': true },
      });
      user.coinBalance += 20;
      coinsAwarded += 20;
    }

    res.status(200).json({
      status: 'success',
      data: { user: user.toSafeObject(), coinsAwarded },
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

/**
 * POST /api/v1/users/me/send-verification-otp
 * Generates a 6-digit OTP and sends it to the user's email.
 */
export const sendVerificationOtp = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ status: 'fail', message: 'User not found.' });
      return;
    }
    if (user.isVerified) {
      res.status(400).json({ status: 'fail', message: 'Email is already verified.' });
      return;
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationOtp = otp;
    user.emailVerificationOtpExpires = expires;
    await user.save();

    await sendVerificationEmail(user.email, otp);

    res.status(200).json({
      status: 'success',
      data: { message: 'Verification email sent. Please check your inbox.' },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/users/me/verify-email
 * Validates the OTP and marks the user as verified. Awards +50 coins.
 */
export const verifyEmail = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { otp } = req.body as VerifyEmailInput;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ status: 'fail', message: 'User not found.' });
      return;
    }
    if (user.isVerified) {
      res.status(400).json({ status: 'fail', message: 'Email is already verified.' });
      return;
    }

    if (
      !user.emailVerificationOtp ||
      !user.emailVerificationOtpExpires ||
      user.emailVerificationOtp !== otp ||
      user.emailVerificationOtpExpires.getTime() < Date.now()
    ) {
      res.status(400).json({ status: 'fail', message: 'Invalid or expired OTP.' });
      return;
    }

    // Verify and award 50 coins
    user.isVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpires = undefined;
    user.coinBalance += 50;
    
    await user.save();

    res.status(200).json({
      status: 'success',
      data: { user: user.toSafeObject(), coinsAwarded: 50 },
    });
  } catch (err) {
    next(err);
  }
};
