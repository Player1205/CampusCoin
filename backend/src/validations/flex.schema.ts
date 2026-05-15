import { z } from 'zod';

// ─── Shared ───────────────────────────────────────────────────────────────────

const POST_TYPES = [
  'achievement',
  'skill_offer',
  'shoutout',
  'question',
  'general',
] as const;

const MONGO_ID_REGEX = /^[a-f\d]{24}$/i;

// ─── Create Post ──────────────────────────────────────────────────────────────

export const createPostSchema = z.object({
  type: z.enum(POST_TYPES).default('general'),

  content: z
    .string({ required_error: 'Post content is required' })
    .min(3, 'Post must be at least 3 characters')
    .max(1000, 'Post cannot exceed 1000 characters')
    .trim(),

  imageUrl: z
    .string()
    .url('Image must be a valid URL')
    .max(2048, 'Image URL is too long')
    .optional()
    .or(z.literal('')),

  taggedUsers: z
    .array(
      z.string().regex(MONGO_ID_REGEX, 'Each tagged user must be a valid user ID')
    )
    .max(10, 'You can tag a maximum of 10 users')
    .default([]),
});

// ─── Update Post ──────────────────────────────────────────────────────────────

export const updatePostSchema = z.object({
  content: z
    .string()
    .min(3, 'Post must be at least 3 characters')
    .max(1000, 'Post cannot exceed 1000 characters')
    .trim()
    .optional(),

  imageUrl: z
    .string()
    .url('Image must be a valid URL')
    .max(2048, 'Image URL is too long')
    .optional()
    .or(z.literal('')),
});

// ─── Create Comment ───────────────────────────────────────────────────────────

export const createCommentSchema = z.object({
  content: z
    .string({ required_error: 'Comment content is required' })
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment cannot exceed 500 characters')
    .trim(),
});

// ─── Query / Filter Posts ─────────────────────────────────────────────────────

export const postQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive integer')
    .transform(Number)
    .refine((n) => n >= 1, 'Page must be at least 1')
    .default('1'),

  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a positive integer')
    .transform(Number)
    .refine((n) => n >= 1 && n <= 50, 'Limit must be between 1 and 50')
    .default('20'),

  type: z.enum(POST_TYPES).optional(),

  authorId: z
    .string()
    .regex(MONGO_ID_REGEX, 'Invalid author ID format')
    .optional(),

  sortBy: z.enum(['newest', 'oldest', 'most_liked']).default('newest'),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type PostQueryInput = z.infer<typeof postQuerySchema>;
