import jwt from 'jsonwebtoken';
import User, { IUser, UserDocument } from '../models/User';
import { RegisterInput, LoginInput } from '../validations/auth.schema';
import { JwtPayload } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const JWT_SECRET = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set.');
  return secret;
};

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// ─── Token Helpers ────────────────────────────────────────────────────────────

export const signToken = (userId: string, role: string): string => {
  const payload: JwtPayload = { userId, role };
  return jwt.sign(payload, JWT_SECRET(), { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET()) as JwtPayload;
};

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: COOKIE_MAX_AGE_MS,
  path: '/',
};

// ─── Service: Register ────────────────────────────────────────────────────────

export interface RegisterResult {
  user: Omit<IUser, 'password'>;
  token: string;
}

export const registerUser = async (input: RegisterInput): Promise<RegisterResult> => {
  const { name, email, password, university, department } = input;

  // 1. Duplicate email check
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('An account with this email already exists.');
    (err as Error & { statusCode: number }).statusCode = 409;
    throw err;
  }

  // 2. Create user (password hashing is handled by the pre-save hook in the model)
  const user: UserDocument = await User.create({
    name,
    email,
    password,
    university,
    department: department ?? '',
    role: 'student',
  });

  // 3. Sign JWT
  const token = signToken(user._id.toString(), user.role);

  return {
    user: user.toSafeObject(),
    token,
  };
};

// ─── Service: Login ───────────────────────────────────────────────────────────

export interface LoginResult {
  user: Omit<IUser, 'password'>;
  token: string;
}

export const loginUser = async (input: LoginInput): Promise<LoginResult> => {
  const { email, password } = input;

  // 1. Find user — explicitly select the password field back (it's select:false in schema)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const err = new Error('Invalid email or password.');
    (err as Error & { statusCode: number }).statusCode = 401;
    throw err;
  }

  // 2. Check if account is active
  if (!user.isActive) {
    const err = new Error('Your account has been suspended. Please contact support.');
    (err as Error & { statusCode: number }).statusCode = 403;
    throw err;
  }

  // 3. Validate password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    (err as Error & { statusCode: number }).statusCode = 401;
    throw err;
  }

  // 4. Update lastLogin timestamp (non-blocking)
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // 5. Sign JWT
  const token = signToken(user._id.toString(), user.role);

  return {
    user: user.toSafeObject(),
    token,
  };
};

// ─── Service: Get Current User ────────────────────────────────────────────────

export const getCurrentUser = async (userId: string): Promise<Omit<IUser, 'password'>> => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    const err = new Error('User not found.');
    (err as Error & { statusCode: number }).statusCode = 404;
    throw err;
  }

  return user.toSafeObject();
};
