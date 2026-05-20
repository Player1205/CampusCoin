import { z } from 'zod';
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodUnion<[z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>, z.ZodLiteral<"">]>;
    coverUrl: z.ZodUnion<[z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>, z.ZodLiteral<"">]>;
    department: z.ZodOptional<z.ZodString>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strict", z.ZodTypeAny, {
    name?: string | undefined;
    avatarUrl?: string | undefined;
    coverUrl?: string | undefined;
    department?: string | undefined;
    bio?: string | undefined;
    skills?: string[] | undefined;
}, {
    name?: string | undefined;
    avatarUrl?: string | undefined;
    coverUrl?: string | undefined;
    department?: string | undefined;
    bio?: string | undefined;
    skills?: string[] | undefined;
}>;
export declare const verifyEmailSchema: z.ZodObject<{
    otp: z.ZodString;
}, "strict", z.ZodTypeAny, {
    otp: string;
}, {
    otp: string;
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
//# sourceMappingURL=user.schema.d.ts.map