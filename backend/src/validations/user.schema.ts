import { z } from 'zod';

// ─── Update Profile ───────────────────────────────────────────────────────────

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name cannot exceed 60 characters')
      .trim()
      .optional(),

    bio: z
      .string()
      .max(300, 'Bio cannot exceed 300 characters')
      .trim()
      .optional(),

    avatarUrl: z
      .string()
      .max(1_400_000, 'Avatar image is too large. Please use an image under 1 MB.')
      .refine(
        (val) => val === '' || val.startsWith('data:image/') || /^https?:\/\//.test(val),
        'Avatar must be a valid URL or image upload'
      )
      .optional()
      .or(z.literal('')),

    coverUrl: z
      .string()
      .max(1_400_000, 'Cover image is too large. Please use an image under 1 MB.')
      .refine(
        (val) => val === '' || val.startsWith('data:image/') || /^https?:\/\//.test(val),
        'Cover must be a valid URL or image upload'
      )
      .optional()
      .or(z.literal('')),

    department: z
      .string()
      .max(100, 'Department cannot exceed 100 characters')
      .trim()
      .optional(),

    skills: z
      .array(
        z.string().min(1, 'Skill cannot be empty').max(30, 'Skill name too long').trim()
      )
      .max(10, 'Maximum 10 skills allowed')
      .optional(),
  })
  .strict(); // Reject unknown fields at the Zod layer

export const verifyEmailSchema = z
  .object({
    otp: z
      .string()
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d+$/, 'OTP must contain only numbers')
      .trim(),
  })
  .strict();

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
