"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(60, 'Name cannot exceed 60 characters')
        .trim()
        .optional(),
    bio: zod_1.z
        .string()
        .max(300, 'Bio cannot exceed 300 characters')
        .trim()
        .optional(),
    avatarUrl: zod_1.z
        .string()
        .max(1400000, 'Avatar image is too large. Please use an image under 1 MB.')
        .refine((val) => val === '' || val.startsWith('data:image/') || /^https?:\/\//.test(val), 'Avatar must be a valid URL or image upload')
        .optional()
        .or(zod_1.z.literal('')),
    coverUrl: zod_1.z
        .string()
        .max(1400000, 'Cover image is too large. Please use an image under 1 MB.')
        .refine((val) => val === '' || val.startsWith('data:image/') || /^https?:\/\//.test(val), 'Cover must be a valid URL or image upload')
        .optional()
        .or(zod_1.z.literal('')),
    department: zod_1.z
        .string()
        .max(100, 'Department cannot exceed 100 characters')
        .trim()
        .optional(),
    skills: zod_1.z
        .array(zod_1.z.string().min(1, 'Skill cannot be empty').max(30, 'Skill name too long').trim())
        .max(10, 'Maximum 10 skills allowed')
        .optional(),
})
    .strict();
exports.verifyEmailSchema = zod_1.z
    .object({
    otp: zod_1.z
        .string()
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d+$/, 'OTP must contain only numbers')
        .trim(),
})
    .strict();
//# sourceMappingURL=user.schema.js.map