import { z } from 'zod';
export declare const createPostSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<["achievement", "skill_offer", "shoutout", "question", "general"]>>;
    content: z.ZodString;
    imageUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    taggedUsers: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "achievement" | "skill_offer" | "shoutout" | "question" | "general";
    content: string;
    taggedUsers: string[];
    imageUrl?: string | undefined;
}, {
    content: string;
    type?: "achievement" | "skill_offer" | "shoutout" | "question" | "general" | undefined;
    imageUrl?: string | undefined;
    taggedUsers?: string[] | undefined;
}>;
export declare const updatePostSchema: z.ZodObject<{
    content: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    content?: string | undefined;
    imageUrl?: string | undefined;
}, {
    content?: string | undefined;
    imageUrl?: string | undefined;
}>;
export declare const createCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export declare const postQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    limit: z.ZodDefault<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    type: z.ZodOptional<z.ZodEnum<["achievement", "skill_offer", "shoutout", "question", "general"]>>;
    authorId: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["newest", "oldest", "most_liked"]>>;
    cursor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "newest" | "oldest" | "most_liked";
    type?: "achievement" | "skill_offer" | "shoutout" | "question" | "general" | undefined;
    cursor?: string | undefined;
    authorId?: string | undefined;
}, {
    type?: "achievement" | "skill_offer" | "shoutout" | "question" | "general" | undefined;
    limit?: string | undefined;
    cursor?: string | undefined;
    page?: string | undefined;
    sortBy?: "newest" | "oldest" | "most_liked" | undefined;
    authorId?: string | undefined;
}>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type PostQueryInput = z.infer<typeof postQuerySchema>;
//# sourceMappingURL=flex.schema.d.ts.map