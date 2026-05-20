import { z } from 'zod';
export declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["tutoring", "design", "coding", "writing", "errands", "notes", "photography", "other"]>;
    urgency: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
    coinReward: z.ZodNumber;
    deadline: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    description: string;
    title: string;
    category: "tutoring" | "design" | "coding" | "writing" | "errands" | "notes" | "photography" | "other";
    urgency: "low" | "medium" | "high";
    coinReward: number;
    tags: string[];
    deadline?: string | undefined;
}, {
    description: string;
    title: string;
    category: "tutoring" | "design" | "coding" | "writing" | "errands" | "notes" | "photography" | "other";
    coinReward: number;
    urgency?: "low" | "medium" | "high" | undefined;
    deadline?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const updateTaskSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["tutoring", "design", "coding", "writing", "errands", "notes", "photography", "other"]>>;
    urgency: z.ZodOptional<z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>>;
    deadline: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>>;
    tags: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    title?: string | undefined;
    category?: "tutoring" | "design" | "coding" | "writing" | "errands" | "notes" | "photography" | "other" | undefined;
    urgency?: "low" | "medium" | "high" | undefined;
    deadline?: string | undefined;
    tags?: string[] | undefined;
}, {
    description?: string | undefined;
    title?: string | undefined;
    category?: "tutoring" | "design" | "coding" | "writing" | "errands" | "notes" | "photography" | "other" | undefined;
    urgency?: "low" | "medium" | "high" | undefined;
    deadline?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const applyToTaskSchema: z.ZodObject<{
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
}, {
    message: string;
}>;
export declare const assignDoerSchema: z.ZodObject<{
    applicantId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    applicantId: string;
}, {
    applicantId: string;
}>;
export declare const submitTaskSchema: z.ZodObject<{
    submissionNote: z.ZodString;
}, "strip", z.ZodTypeAny, {
    submissionNote: string;
}, {
    submissionNote: string;
}>;
export declare const completeTaskSchema: z.ZodObject<{
    completionNote: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    completionNote?: string | undefined;
}, {
    completionNote?: string | undefined;
}>;
export declare const taskQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    limit: z.ZodDefault<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>;
    status: z.ZodOptional<z.ZodEnum<["open", "in_progress", "submitted", "completed", "cancelled", "disputed"]>>;
    category: z.ZodOptional<z.ZodEnum<["tutoring", "design", "coding", "writing", "errands", "notes", "photography", "other"]>>;
    urgency: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    minReward: z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>;
    maxReward: z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["newest", "oldest", "reward_high", "reward_low"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "newest" | "oldest" | "reward_high" | "reward_low";
    search?: string | undefined;
    status?: "open" | "in_progress" | "submitted" | "completed" | "cancelled" | "disputed" | undefined;
    category?: "tutoring" | "design" | "coding" | "writing" | "errands" | "notes" | "photography" | "other" | undefined;
    urgency?: "low" | "medium" | "high" | undefined;
    minReward?: number | undefined;
    maxReward?: number | undefined;
}, {
    limit?: string | undefined;
    search?: string | undefined;
    status?: "open" | "in_progress" | "submitted" | "completed" | "cancelled" | "disputed" | undefined;
    category?: "tutoring" | "design" | "coding" | "writing" | "errands" | "notes" | "photography" | "other" | undefined;
    urgency?: "low" | "medium" | "high" | undefined;
    page?: string | undefined;
    minReward?: string | undefined;
    maxReward?: string | undefined;
    sortBy?: "newest" | "oldest" | "reward_high" | "reward_low" | undefined;
}>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ApplyToTaskInput = z.infer<typeof applyToTaskSchema>;
export type AssignDoerInput = z.infer<typeof assignDoerSchema>;
export type SubmitTaskInput = z.infer<typeof submitTaskSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
//# sourceMappingURL=swap.schema.d.ts.map