import { ITask, TaskDocument } from '../models/Task';
import { CreateTaskInput, UpdateTaskInput, ApplyToTaskInput, AssignDoerInput, SubmitTaskInput, CompleteTaskInput, TaskQueryInput } from '../validations/swap.schema';
import { PaginatedResult } from '../utils/service.helpers';
export declare const listTasks: (query: TaskQueryInput, university: string) => Promise<PaginatedResult<ITask>>;
export declare const getTaskById: (taskId: string) => Promise<TaskDocument>;
export declare const createTask: (input: CreateTaskInput, posterId: string, university: string) => Promise<TaskDocument>;
export declare const updateTask: (taskId: string, input: UpdateTaskInput, requesterId: string) => Promise<TaskDocument>;
export declare const cancelTask: (taskId: string, requesterId: string) => Promise<TaskDocument>;
export declare const applyToTask: (taskId: string, input: ApplyToTaskInput, applicantId: string) => Promise<TaskDocument>;
export declare const withdrawApplication: (taskId: string, applicantId: string) => Promise<TaskDocument>;
export declare const assignDoer: (taskId: string, input: AssignDoerInput, posterId: string) => Promise<TaskDocument>;
export declare const submitTask: (taskId: string, input: SubmitTaskInput, doerId: string) => Promise<TaskDocument>;
export declare const completeTask: (taskId: string, input: CompleteTaskInput, posterId: string) => Promise<TaskDocument>;
export declare const getMyTasks: (userId: string, role: "poster" | "doer", page: number, limit: number) => Promise<PaginatedResult<ITask>>;
//# sourceMappingURL=task.service.d.ts.map