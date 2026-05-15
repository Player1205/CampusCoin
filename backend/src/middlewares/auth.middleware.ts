import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthenticatedRequest, JwtPayload } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set.');
  return secret;
};

const extractToken = (req: AuthenticatedRequest): string | null => {
  // Priority 1: HTTP-only cookie (browser clients)
  if (req.cookies?.token) return req.cookies.token as string;

  // Priority 2: Authorization header (API / mobile clients)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.split(' ')[1];

  return null;
};

// ─── protect ─────────────────────────────────────────────────────────────────

/**
 * Verifies the JWT from the HTTP-only cookie (or Bearer header fallback).
 * Attaches the hydrated user document to req.user.
 */
export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        status: 'fail',
        message: 'You must be logged in to access this resource.',
      });
      return;
    }

    // Verify and decode
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;

    // Hydrate user — ensure they still exist and are active
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      res.status(401).json({
        status: 'fail',
        message: 'The user associated with this session no longer exists.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    const isExpired = err instanceof Error && err.name === 'TokenExpiredError';
    res.status(401).json({
      status: 'fail',
      message: isExpired
        ? 'Your session has expired. Please log in again.'
        : 'Invalid authentication token.',
    });
  }
};

// ─── restrictTo ───────────────────────────────────────────────────────────────

/**
 * Role-based access guard.
 * Usage: router.delete('/tasks/:id', protect, restrictTo('admin'), handler)
 */
export const restrictTo =
  (...roles: string[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action.',
      });
      return;
    }
    next();
  };
