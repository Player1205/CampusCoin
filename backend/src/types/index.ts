import { Request } from 'express';
import { UserDocument } from '../models/User';

// ─── Authenticated Request ────────────────────────────────────────────────────

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

// ─── JSend Response Shapes ────────────────────────────────────────────────────

export interface JSendSuccess<T = unknown> {
  status: 'success';
  data: T;
}

export interface JSendFail {
  status: 'fail';
  message: string;
  errors?: Record<string, string>;
}

export interface JSendError {
  status: 'error';
  message: string;
}

export type JSendResponse<T = unknown> = JSendSuccess<T> | JSendFail | JSendError;

// ─── JWT Payload ──────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}
