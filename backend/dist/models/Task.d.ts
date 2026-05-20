import { Document, Model, Types } from 'mongoose';
export type TaskCategory = 'tutoring' | 'design' | 'coding' | 'writing' | 'errands' | 'notes' | 'photography' | 'other';
export type TaskStatus = 'open' | 'in_progress' | 'submitted' | 'completed' | 'cancelled' | 'disputed';
export type TaskUrgency = 'low' | 'medium' | 'high';
export interface IApplication {
    _id: Types.ObjectId;
    applicant: Types.ObjectId;
    message: string;
    appliedAt: Date;
    isWithdrawn: boolean;
}
export interface ITask {
    title: string;
    description: string;
    category: TaskCategory;
    urgency: TaskUrgency;
    coinReward: number;
    poster: Types.ObjectId;
    doer?: Types.ObjectId;
    status: TaskStatus;
    deadline?: Date;
    tags: string[];
    applications: IApplication[];
    submissionNote?: string;
    completionNote?: string;
    university: string;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export type TaskDocument = Document & ITask;
type TaskModel = Model<ITask>;
declare const Task: TaskModel;
export default Task;
//# sourceMappingURL=Task.d.ts.map