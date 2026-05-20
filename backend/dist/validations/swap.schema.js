"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskQuerySchema = exports.completeTaskSchema = exports.submitTaskSchema = exports.assignDoerSchema = exports.applyToTaskSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
const TASK_CATEGORIES = [
    'tutoring',
    'design',
    'coding',
    'writing',
    'errands',
    'notes',
    'photography',
    'other',
];
const TASK_URGENCIES = ['low', 'medium', 'high'];
const TASK_STATUSES = [
    'open',
    'in_progress',
    'submitted',
    'completed',
    'cancelled',
    'disputed',
];
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z
        .string({ required_error: 'Title is required' })
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title cannot exceed 100 characters')
        .trim(),
    description: zod_1.z
        .string({ required_error: 'Description is required' })
        .min(20, 'Description must be at least 20 characters')
        .max(2000, 'Description cannot exceed 2000 characters')
        .trim(),
    category: zod_1.z.enum(TASK_CATEGORIES, {
        required_error: 'Category is required',
        invalid_type_error: `Category must be one of: ${TASK_CATEGORIES.join(', ')}`,
    }),
    urgency: zod_1.z.enum(TASK_URGENCIES).default('medium'),
    coinReward: zod_1.z
        .number({ required_error: 'Coin reward is required' })
        .int('Coin reward must be a whole number')
        .min(5, 'Minimum reward is 5 CampusCoins')
        .max(5000, 'Maximum reward is 5000 CampusCoins'),
    deadline: zod_1.z
        .string()
        .datetime({ message: 'Deadline must be a valid ISO 8601 date string' })
        .refine((d) => new Date(d) > new Date(), { message: 'Deadline must be in the future' })
        .optional(),
    tags: zod_1.z
        .array(zod_1.z.string().min(1).max(30).trim())
        .max(5, 'Maximum 5 tags allowed')
        .default([]),
});
exports.updateTaskSchema = exports.createTaskSchema
    .omit({ coinReward: true })
    .partial();
exports.applyToTaskSchema = zod_1.z.object({
    message: zod_1.z
        .string({ required_error: 'Application message is required' })
        .min(10, 'Message must be at least 10 characters')
        .max(500, 'Message cannot exceed 500 characters')
        .trim(),
});
exports.assignDoerSchema = zod_1.z.object({
    applicantId: zod_1.z
        .string({ required_error: 'Applicant ID is required' })
        .regex(/^[a-f\d]{24}$/i, 'Invalid user ID format'),
});
exports.submitTaskSchema = zod_1.z.object({
    submissionNote: zod_1.z
        .string({ required_error: 'Submission note is required' })
        .min(10, 'Submission note must be at least 10 characters')
        .max(1000, 'Submission note cannot exceed 1000 characters')
        .trim(),
});
exports.completeTaskSchema = zod_1.z.object({
    completionNote: zod_1.z
        .string()
        .max(500, 'Completion note cannot exceed 500 characters')
        .trim()
        .optional(),
});
exports.taskQuerySchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .regex(/^\d+$/, 'Page must be a positive integer')
        .transform(Number)
        .refine((n) => n >= 1, 'Page must be at least 1')
        .default('1'),
    limit: zod_1.z
        .string()
        .regex(/^\d+$/, 'Limit must be a positive integer')
        .transform(Number)
        .refine((n) => n >= 1 && n <= 50, 'Limit must be between 1 and 50')
        .default('20'),
    status: zod_1.z.enum(TASK_STATUSES).optional(),
    category: zod_1.z.enum(TASK_CATEGORIES).optional(),
    urgency: zod_1.z.enum(TASK_URGENCIES).optional(),
    minReward: zod_1.z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .optional(),
    maxReward: zod_1.z
        .string()
        .regex(/^\d+$/)
        .transform(Number)
        .optional(),
    search: zod_1.z.string().max(100).trim().optional(),
    sortBy: zod_1.z.enum(['newest', 'oldest', 'reward_high', 'reward_low']).default('newest'),
});
//# sourceMappingURL=swap.schema.js.map