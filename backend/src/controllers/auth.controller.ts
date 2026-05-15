import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { RegisterInput, LoginInput } from '../validations/auth.schema';
import { AuthenticatedRequest } from '../types';

// ─── Helper: Attach JWT Cookie & Respond ─────────────────────────────────────

const sendTokenResponse = (
  res: Response,
  statusCode: number,
  token: string,
  user: object
): void => {
  res
    .status(statusCode)
    .cookie('token', token, authService.cookieOptions)
    .json({
      status: 'success',
      data: { user, token },
    });
};

// ─── POST /api/v1/auth/register ───────────────────────────────────────────────

export const register = async (
  req: Request<Record<string, never>, unknown, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user, token } = await authService.registerUser(req.body);

    sendTokenResponse(res, 201, token, user);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/auth/login ──────────────────────────────────────────────────

export const login = async (
  req: Request<Record<string, never>, unknown, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user, token } = await authService.loginUser(req.body);

    sendTokenResponse(res, 200, token, user);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/auth/logout ─────────────────────────────────────────────────

export const logout = (_req: Request, res: Response): void => {
  res
    .status(200)
    .clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .json({
      status: 'success',
      data: { message: 'Logged out successfully.' },
    });
};

// ─── GET /api/v1/auth/me ──────────────────────────────────────────────────────

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'fail', message: 'Not authenticated.' });
      return;
    }

    // Re-fetch to ensure we have the freshest data (coins, skills, etc.)
    const user = await authService.getCurrentUser(req.user._id.toString());

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};
