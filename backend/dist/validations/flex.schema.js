"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postQuerySchema = exports.createCommentSchema = exports.updatePostSchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
const POST_TYPES = [
    'achievement',
    'skill_offer',
    'shoutout',
    'question',
    'general',
];
const MONGO_ID_REGEX = /^[a-f\d]{24}$/i;
exports.createPostSchema = zod_1.z.object({
    type: zod_1.z.enum(POST_TYPES).default('general'),
    content: zod_1.z
        .string({ required_error: 'Post content is required' })
        .min(3, 'Post must be at least 3 characters')
        .max(1000, 'Post cannot exceed 1000 characters')
        .trim(),
    imageUrl: zod_1.z
        .string()
        .url('Image must be a valid URL')
        .max(2048, 'Image URL is too long')
        .optional()
        .or(zod_1.z.literal('')),
    taggedUsers: zod_1.z
        .array(zod_1.z.string().regex(MONGO_ID_REGEX, 'Each tagged user must be a valid user ID'))
        .max(10, 'You can tag a maximum of 10 users')
        .default([]),
});
exports.updatePostSchema = zod_1.z.object({
    content: zod_1.z
        .string()
        .min(3, 'Post must be at least 3 characters')
        .max(1000, 'Post cannot exceed 1000 characters')
        .trim()
        .optional(),
    imageUrl: zod_1.z
        .string()
        .url('Image must be a valid URL')
        .max(2048, 'Image URL is too long')
        .optional()
        .or(zod_1.z.literal('')),
});
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z
        .string({ required_error: 'Comment content is required' })
        .min(1, 'Comment cannot be empty')
        .max(500, 'Comment cannot exceed 500 characters')
        .trim(),
});
exports.postQuerySchema = zod_1.z.object({
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
    type: zod_1.z.enum(POST_TYPES).optional(),
    authorId: zod_1.z
        .string()
        .regex(MONGO_ID_REGEX, 'Invalid author ID format')
        .optional(),
    sortBy: zod_1.z.enum(['newest', 'oldest', 'most_liked']).default('newest'),
});
//# sourceMappingURL=flex.schema.js.map