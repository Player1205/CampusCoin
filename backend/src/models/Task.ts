import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type TaskCategory =
  | 'tutoring'
  | 'design'
  | 'coding'
  | 'writing'
  | 'errands'
  | 'notes'
  | 'photography'
  | 'other';

export type TaskStatus =
  | 'open'        // Listed, accepting applications
  | 'in_progress' // Assigned to a doer
  | 'submitted'   // Doer has submitted work, awaiting poster approval
  | 'completed'   // Poster approved; coins transferred
  | 'cancelled'   // Poster cancelled before assignment
  | 'disputed';   // Raised by either party post-submission

export type TaskUrgency = 'low' | 'medium' | 'high';

// ─── Application Sub-document ─────────────────────────────────────────────────

export interface IApplication {
  _id: Types.ObjectId;
  applicant: Types.ObjectId;
  message: string;
  appliedAt: Date;
  isWithdrawn: boolean;
}

const applicationSchema = new Schema<IApplication>(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Application message is required'],
      maxlength: [500, 'Application message cannot exceed 500 characters'],
      trim: true,
    },
    appliedAt: {
      type: Date,
      default: () => new Date(),
    },
    isWithdrawn: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// ─── Task Interface ───────────────────────────────────────────────────────────

export interface ITask {
  title: string;
  description: string;
  category: TaskCategory;
  urgency: TaskUrgency;
  coinReward: number;            // Amount locked in escrow on posting
  poster: Types.ObjectId;        // User who created the task
  doer?: Types.ObjectId;         // User assigned to complete the task
  status: TaskStatus;
  deadline?: Date;
  tags: string[];
  applications: IApplication[];  // Users who have applied
  submissionNote?: string;       // Message from doer on submission
  completionNote?: string;       // Feedback from poster on completion
  university: string;            // Scoped to poster's university
  paymentClaimed: boolean;       // Poster claims fiat payment sent
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskDocument = Document & ITask;
type TaskModel = Model<ITask>;

// ─── Schema ───────────────────────────────────────────────────────────────────

const taskSchema = new Schema<ITask, TaskModel>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: ['tutoring', 'design', 'coding', 'writing', 'errands', 'notes', 'photography', 'other'],
      required: [true, 'Task category is required'],
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    coinReward: {
      type: Number,
      required: [true, 'Coin reward is required'],
      min: [5, 'Minimum reward is 5 CampusCoins'],
      max: [5000, 'Maximum reward is 5000 CampusCoins'],
    },
    poster: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'submitted', 'completed', 'cancelled', 'disputed'],
      default: 'open',
    },
    deadline: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 5,
        message: 'A task can have a maximum of 5 tags',
      },
    },
    applications: {
      type: [applicationSchema],
      default: [],
    },
    submissionNote: {
      type: String,
      trim: true,
      maxlength: [1000, 'Submission note cannot exceed 1000 characters'],
    },
    completionNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Completion note cannot exceed 500 characters'],
    },
    university: {
      type: String,
      required: true,
      index: true,
    },
    paymentClaimed: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

taskSchema.index({ status: 1, university: 1 });
taskSchema.index({ poster: 1 });
taskSchema.index({ doer: 1 });
taskSchema.index({ category: 1, university: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ coinReward: 1 });
taskSchema.index({ tags: 1 });

// ─── Export ───────────────────────────────────────────────────────────────────

const Task = mongoose.model<ITask, TaskModel>('Task', taskSchema);
export default Task;
