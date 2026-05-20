"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const passwordRule = zod_1.z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password cannot exceed 72 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');
const emailRule = zod_1.z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim();
exports.registerSchema = zod_1.z
    .object({
    name: zod_1.z
        .string({ required_error: 'Name is required' })
        .min(2, 'Name must be at least 2 characters')
        .max(60, 'Name cannot exceed 60 characters')
        .trim(),
    email: emailRule,
    password: passwordRule,
    confirmPassword: zod_1.z.string({ required_error: 'Please confirm your password' }),
    university: zod_1.z
        .string({ required_error: 'University name is required' })
        .min(2, 'University name must be at least 2 characters')
        .max(100, 'University name is too long')
        .trim(),
    department: zod_1.z.string().max(100).trim().optional(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.loginSchema = zod_1.z.object({
    email: emailRule,
    password: zod_1.z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});
exports.changePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string({ required_error: 'Current password is required' }),
    newPassword: passwordRule,
    confirmNewPassword: zod_1.z.string({ required_error: 'Please confirm your new password' }),
})
    .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
})
    .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
});
//# sourceMappingURL=auth.schema.js.map