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
      .url('Avatar must be a valid URL')
      .max(2048, 'Avatar URL is too long')
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

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
