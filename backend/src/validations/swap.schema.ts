import { z } from 'zod';

// ─── Shared ───────────────────────────────────────────────────────────────────

const TASK_CATEGORIES = [
  'tutoring',
  'design',
  'coding',
  'writing',
  'errands',
  'notes',
  'photography',
  'other',
] as const;

const TASK_URGENCIES = ['low', 'medium', 'high'] as const;

const TASK_STATUSES = [
  'open',
  'in_progress',
  'submitted',
  'completed',
  'cancelled',
  'disputed',
] as const;

// ─── Create Task ──────────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),

  description: z
    .string({ required_error: 'Description is required' })
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim(),

  category: z.enum(TASK_CATEGORIES, {
    required_error: 'Category is required',
    invalid_type_error: `Category must be one of: ${TASK_CATEGORIES.join(', ')}`,
  }),

  urgency: z.enum(TASK_URGENCIES).default('medium'),

  coinReward: z
    .number({ required_error: 'Coin reward is required' })
    .int('Coin reward must be a whole number')
    .min(5, 'Minimum reward is 5 CampusCoins')
    .max(5000, 'Maximum reward is 5000 CampusCoins'),

  deadline: z
    .string()
    .datetime({ message: 'Deadline must be a valid ISO 8601 date string' })
    .refine((d) => new Date(d) > new Date(), { message: 'Deadline must be in the future' })
    .optional(),

  tags: z
    .array(z.string().min(1).max(30).trim())
    .max(5, 'Maximum 5 tags allowed')
    .default([]),
});

// ─── Update Task ──────────────────────────────────────────────────────────────

export const updateTaskSchema = createTaskSchema
  .omit({ coinReward: true }) // Cannot change reward after posting
  .partial();                  // All fields optional for PATCH

// ─── Apply to Task ────────────────────────────────────────────────────────────

export const applyToTaskSchema = z.object({
  message: z
    .string({ required_error: 'Application message is required' })
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message cannot exceed 500 characters')
    .trim(),
});

// ─── Assign Doer ─────────────────────────────────────────────────────────────

export const assignDoerSchema = z.object({
  applicantId: z
    .string({ required_error: 'Applicant ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid user ID format'),
});

// ─── Submit Task ──────────────────────────────────────────────────────────────

export const submitTaskSchema = z.object({
  submissionNote: z
    .string({ required_error: 'Submission note is required' })
    .min(10, 'Submission note must be at least 10 characters')
    .max(1000, 'Submission note cannot exceed 1000 characters')
    .trim(),
});

// ─── Complete Task (poster approval) ─────────────────────────────────────────

export const completeTaskSchema = z.object({
  completionNote: z
    .string()
    .max(500, 'Completion note cannot exceed 500 characters')
    .trim()
    .optional(),
});

// ─── Query / Filter Tasks ─────────────────────────────────────────────────────

export const taskQuerySchema = z.object({
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

  status: z.enum(TASK_STATUSES).optional(),
  category: z.enum(TASK_CATEGORIES).optional(),
  urgency: z.enum(TASK_URGENCIES).optional(),

  minReward: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),

  maxReward: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),

  search: z.string().max(100).trim().optional(),
  sortBy: z.enum(['newest', 'oldest', 'reward_high', 'reward_low']).default('newest'),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ApplyToTaskInput = z.infer<typeof applyToTaskSchema>;
export type AssignDoerInput = z.infer<typeof assignDoerSchema>;
export type SubmitTaskInput = z.infer<typeof submitTaskSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
