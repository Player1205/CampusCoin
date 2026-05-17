import mongoose, { Types } from 'mongoose';
import Task, { ITask, TaskDocument } from '../models/Task';
import {
  CreateTaskInput,
  UpdateTaskInput,
  ApplyToTaskInput,
  AssignDoerInput,
  SubmitTaskInput,
  CompleteTaskInput,
  TaskQueryInput,
} from '../validations/swap.schema';
import {
  lockCoinsForTask,
  releaseCoinsToUser,
  transferCoins,
} from './coin.service';
import { PaginatedResult, buildSortStage, makeAppError } from '../utils/service.helpers';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Escapes special regex characters to prevent ReDoS and injection via $regex. */
const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const taskNotFound = () => makeAppError('Task not found.', 404);
const forbidden = (msg = 'You do not have permission to perform this action.') =>
  makeAppError(msg, 403);

const ensureTaskExists = async (taskId: string): Promise<TaskDocument> => {
  if (!Types.ObjectId.isValid(taskId)) throw makeAppError('Invalid task ID.', 400);
  const task = await Task.findById(taskId);
  if (!task) throw taskNotFound();
  return task;
};

// ─── Service: List Tasks ──────────────────────────────────────────────────────

export const listTasks = async (
  query: TaskQueryInput,
  university: string
): Promise<PaginatedResult<ITask>> => {
  const { page, limit, status, category, urgency, minReward, maxReward, search, sortBy } = query;

  const filter: Record<string, unknown> = { university };

  if (status) filter.status = status;
  else filter.status = 'open'; // default to open tasks

  if (category) filter.category = category;
  if (urgency) filter.urgency = urgency;

  if (minReward !== undefined || maxReward !== undefined) {
    filter.coinReward = {
      ...(minReward !== undefined && { $gte: minReward }),
      ...(maxReward !== undefined && { $lte: maxReward }),
    };
  }

  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { description: { $regex: safeSearch, $options: 'i' } },
      { tags: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    reward_high: { coinReward: -1 },
    reward_low: { coinReward: 1 },
  };

  const skip = (page - 1) * limit;
  const sort = buildSortStage(sortBy, sortMap);

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('poster', 'name avatarUrl university')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(filter),
  ]);

  return {
    data: tasks as unknown as ITask[],
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

// ─── Service: Get Single Task ─────────────────────────────────────────────────

export const getTaskById = async (taskId: string): Promise<TaskDocument> => {
  const task = await ensureTaskExists(taskId);

  // Increment view count (non-blocking)
  void Task.findByIdAndUpdate(taskId, { $inc: { viewCount: 1 } });

  await task.populate([
    { path: 'poster', select: 'name avatarUrl university department' },
    { path: 'doer', select: 'name avatarUrl university' },
    { path: 'applications.applicant', select: 'name avatarUrl skills' },
  ]);

  return task;
};

// ─── Service: Create Task ─────────────────────────────────────────────────────

export const createTask = async (
  input: CreateTaskInput,
  posterId: string,
  university: string
): Promise<TaskDocument> => {
  // Wrap escrow lock + task creation in a single transaction.
  // If Task.create fails, the coin deduction is rolled back automatically.
  const session = await mongoose.startSession();
  try {
    let task!: TaskDocument;
    await session.withTransaction(async () => {
      // Lock coins atomically within the session
      await lockCoinsForTask(posterId, input.coinReward, session);

      // Create the task within the same transaction
      // Note: Task.create inside a session requires the array syntax in Mongoose 8+
      const [created] = await Task.create(
        [
          {
            ...input,
            deadline: input.deadline ? new Date(input.deadline) : undefined,
            poster: posterId,
            university,
            status: 'open',
          },
        ],
        { session }
      );
      task = created;
    });
    return task;
  } finally {
    await session.endSession();
  }
};

// ─── Service: Update Task ─────────────────────────────────────────────────────

export const updateTask = async (
  taskId: string,
  input: UpdateTaskInput,
  requesterId: string
): Promise<TaskDocument> => {
  const task = await ensureTaskExists(taskId);

  if (task.poster.toString() !== requesterId) throw forbidden();
  if (task.status !== 'open') throw makeAppError('Only open tasks can be edited.', 400);

  Object.assign(task, input);
  if (input.deadline) task.deadline = new Date(input.deadline);

  await task.save();
  return task;
};

// ─── Service: Cancel Task ─────────────────────────────────────────────────────

export const cancelTask = async (taskId: string, requesterId: string): Promise<TaskDocument> => {
  const task = await ensureTaskExists(taskId);

  if (task.poster.toString() !== requesterId) throw forbidden();

  if (!['open', 'in_progress'].includes(task.status)) {
    throw makeAppError('This task cannot be cancelled in its current state.', 400);
  }

  // Wrap refund + status change in a transaction.
  // If task.save() fails, the coin refund is rolled back.
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await releaseCoinsToUser(requesterId, task.coinReward, session);
      task.status = 'cancelled';
      await task.save({ session });
    });
    return task;
  } finally {
    await session.endSession();
  }
};

// ─── Service: Apply to Task ───────────────────────────────────────────────────

export const applyToTask = async (
  taskId: string,
  input: ApplyToTaskInput,
  applicantId: string
): Promise<TaskDocument> => {
  const task = await ensureTaskExists(taskId);

  if (task.status !== 'open') throw makeAppError('This task is no longer accepting applications.', 400);
  if (task.poster.toString() === applicantId) throw makeAppError('You cannot apply to your own task.', 400);

  const alreadyApplied = task.applications.some(
    (a) => a.applicant.toString() === applicantId && !a.isWithdrawn
  );
  if (alreadyApplied) throw makeAppError('You have already applied to this task.', 409);

  task.applications.push({
    _id: new Types.ObjectId(),
    applicant: new Types.ObjectId(applicantId),
    message: input.message,
    appliedAt: new Date(),
    isWithdrawn: false,
  });

  await task.save();
  return task;
};

// ─── Service: Withdraw Application ───────────────────────────────────────────

export const withdrawApplication = async (
  taskId: string,
  applicantId: string
): Promise<TaskDocument> => {
  const task = await ensureTaskExists(taskId);

  const app = task.applications.find(
    (a) => a.applicant.toString() === applicantId && !a.isWithdrawn
  );

  if (!app) throw makeAppError('Application not found or already withdrawn.', 404);
  if (task.status !== 'open') throw makeAppError('Cannot withdraw from a task that is no longer open.', 400);

  app.isWithdrawn = true;
  await task.save();
  return task;
};

// ─── Service: Assign Doer ─────────────────────────────────────────────────────

export const assignDoer = async (
  taskId: string,
  input: AssignDoerInput,
  posterId: string
): Promise<TaskDocument> => {
  const task = await ensureTaskExists(taskId);

  if (task.poster.toString() !== posterId) throw forbidden();
  if (task.status !== 'open') throw makeAppError('You can only assign a doer to an open task.', 400);

  const validApplicant = task.applications.find(
    (a) => a.applicant.toString() === input.applicantId && !a.isWithdrawn
  );

  if (!validApplicant) throw makeAppError('The selected user has not applied to this task.', 400);

  task.doer = new Types.ObjectId(input.applicantId);
  task.status = 'in_progress';
  await task.save();
  return task;
};

// ─── Service: Submit Task ─────────────────────────────────────────────────────

export const submitTask = async (
  taskId: string,
  input: SubmitTaskInput,
  doerId: string
): Promise<TaskDocument> => {
  const task = await ensureTaskExists(taskId);

  if (!task.doer || task.doer.toString() !== doerId) throw forbidden('Only the assigned doer can submit this task.');
  if (task.status !== 'in_progress') throw makeAppError('Task is not currently in progress.', 400);

  task.status = 'submitted';
  task.submissionNote = input.submissionNote;
  await task.save();
  return task;
};

// ─── Service: Complete Task ───────────────────────────────────────────────────

export const completeTask = async (
  taskId: string,
  input: CompleteTaskInput,
  posterId: string
): Promise<TaskDocument> => {
  const task = await ensureTaskExists(taskId);

  if (task.poster.toString() !== posterId) throw forbidden();
  if (task.status !== 'submitted') throw makeAppError('You can only approve a submitted task.', 400);
  if (!task.doer) throw makeAppError('No doer assigned to this task.', 400);

  // Transfer coins from escrow → doer (escrow already deducted at task creation)
  await transferCoins(posterId, task.doer.toString(), task.coinReward);

  task.status = 'completed';
  if (input.completionNote) task.completionNote = input.completionNote;
  await task.save();
  return task;
};

// ─── Service: Get My Tasks ────────────────────────────────────────────────────

export const getMyTasks = async (
  userId: string,
  role: 'poster' | 'doer',
  page: number,
  limit: number
): Promise<PaginatedResult<ITask>> => {
  const filter = role === 'poster' ? { poster: userId } : { doer: userId };
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('poster', 'name avatarUrl')
      .populate('doer', 'name avatarUrl')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(filter),
  ]);

  return {
    data: tasks as unknown as ITask[],
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};
