import { z } from 'zod';

// ─── Shared Field Rules ────────────────────────────────────────────────────────

const passwordRule = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password cannot exceed 72 characters') // bcrypt hard limit
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const emailRule = z
  .string({ required_error: 'Email is required' })
  .email('Please provide a valid email address')
  .toLowerCase()
  .trim();

// ─── Register Schema ──────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name cannot exceed 60 characters')
      .trim(),

    email: emailRule,

    password: passwordRule,

    confirmPassword: z.string({ required_error: 'Please confirm your password' }),

    university: z
      .string({ required_error: 'University name is required' })
      .min(2, 'University name must be at least 2 characters')
      .max(100, 'University name is too long')
      .trim(),

    department: z.string().max(100).trim().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Login Schema ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailRule,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

// ─── Change Password Schema ───────────────────────────────────────────────────

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ required_error: 'Current password is required' }),
    newPassword: passwordRule,
    confirmNewPassword: z.string({ required_error: 'Please confirm your new password' }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  });

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
