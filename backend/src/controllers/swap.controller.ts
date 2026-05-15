import { Response, NextFunction } from 'express';
import * as taskService from '../services/task.service';
import { AuthenticatedRequest } from '../types';
import {
  CreateTaskInput,
  UpdateTaskInput,
  ApplyToTaskInput,
  AssignDoerInput,
  SubmitTaskInput,
  CompleteTaskInput,
  TaskQueryInput,
} from '../validations/swap.schema';

// ─── GET /api/v1/swap/tasks ───────────────────────────────────────────────────

export const listTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await taskService.listTasks(
      req.query as unknown as TaskQueryInput,
      req.user!.university
    );

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/swap/tasks/:id ───────────────────────────────────────────────

export const getTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await taskService.getTaskById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { task },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/swap/tasks ──────────────────────────────────────────────────

export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await taskService.createTask(
      req.body as CreateTaskInput,
      req.user!._id.toString(),
      req.user!.university
    );

    res.status(201).json({
      status: 'success',
      data: { task },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/v1/swap/tasks/:id ─────────────────────────────────────────────

export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.body as UpdateTaskInput,
      req.user!._id.toString()
    );

    res.status(200).json({
      status: 'success',
      data: { task },
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/v1/swap/tasks/:id ────────────────────────────────────────────

export const cancelTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await taskService.cancelTask(req.params.id, req.user!._id.toString());

    res.status(200).json({
      status: 'success',
      data: { task },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/swap/tasks/:id/apply ────────────────────────────────────────

export const applyToTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await taskService.applyToTask(
      req.params.id,
      req.body as ApplyToTaskInput,
      req.user!._id.toString()
    );

    res.status(200).json({
      status: 'success',
      data: { task },
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/v1/swap/tasks/:id/apply ─────────────────────────────────────

export const withdrawApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await taskService.withdrawApplication(req.params.id, req.user!._id.toString());

    res.status(200).json({
      status: 'success',
      data: { task },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/swap/tasks/:id/assign ──────────────────────────────────────

export const assignDoer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await taskService.assignDoer(
      req.params.id,
      req.body as AssignDoerInput,
      req.user!._id.toString()
    );

    res.status(200).json({
      status: 'success',
      data: { task },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/swap/tasks/:id/submit ──────────────────────────────────────

export const submitTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await taskService.submitTask(
      req.params.id,
      req.body as SubmitTaskInput,
      req.user!._id.toString()
    );

    res.status(200).json({
      status: 'success',
      data: { task },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/swap/tasks/:id/complete ────────────────────────────────────

export const completeTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await taskService.completeTask(
      req.params.id,
      req.body as CompleteTaskInput,
      req.user!._id.toString()
    );

    res.status(200).json({
      status: 'success',
      data: { task },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/swap/my-tasks ────────────────────────────────────────────────

export const getMyTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = (req.query.role as 'poster' | 'doer') ?? 'poster';
    const page = Math.max(1, parseInt(String(req.query.page ?? 1), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? 20), 10)));

    const result = await taskService.getMyTasks(req.user!._id.toString(), role, page, limit);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
