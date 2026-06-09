import api, { unwrap } from '@/lib/api';
import type {
  Task,
  PaginatedTasks,
  TaskFilters,
  CreateTaskPayload,
  ApplyToTaskPayload,
  SubmitTaskPayload,
  CompleteTaskPayload,
} from '../types';

// ─── Feed ─────────────────────────────────────────────────────────────────────

export const fetchTasks = async (filters: TaskFilters = {}): Promise<PaginatedTasks> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== '') params.set(key, String(val));
  });
  const res = await api.get(`/swap/tasks?${params.toString()}`);
  return unwrap<PaginatedTasks>(res);
};

export const fetchTaskById = async (id: string): Promise<Task> => {
  const res = await api.get(`/swap/tasks/${id}`);
  return unwrap<{ task: Task }>(res).task;
};

export const fetchMyTasks = async (
  role: 'poster' | 'doer',
  page = 1,
  limit = 20
): Promise<PaginatedTasks> => {
  const res = await api.get(`/swap/my-tasks?role=${role}&page=${page}&limit=${limit}`);
  return unwrap<PaginatedTasks>(res);
};

// ─── Task CRUD ────────────────────────────────────────────────────────────────

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  const res = await api.post('/swap/tasks', payload);
  return unwrap<{ task: Task }>(res).task;
};

export const updateTask = async (id: string, payload: Partial<CreateTaskPayload>): Promise<Task> => {
  const res = await api.patch(`/swap/tasks/${id}`, payload);
  return unwrap<{ task: Task }>(res).task;
};

export const cancelTask = async (id: string): Promise<Task> => {
  const res = await api.delete(`/swap/tasks/${id}`);
  return unwrap<{ task: Task }>(res).task;
};

// ─── Task Lifecycle ───────────────────────────────────────────────────────────

export const applyToTask = async (id: string, payload: ApplyToTaskPayload): Promise<Task> => {
  const res = await api.post(`/swap/tasks/${id}/apply`, payload);
  return unwrap<{ task: Task }>(res).task;
};

export const withdrawApplication = async (id: string): Promise<Task> => {
  const res = await api.delete(`/swap/tasks/${id}/apply`);
  return unwrap<{ task: Task }>(res).task;
};

export const assignDoer = async (id: string, applicantId: string): Promise<Task> => {
  const res = await api.post(`/swap/tasks/${id}/assign`, { applicantId });
  return unwrap<{ task: Task }>(res).task;
};

export const submitTask = async (id: string, payload: SubmitTaskPayload): Promise<Task> => {
  const res = await api.post(`/swap/tasks/${id}/submit`, payload);
  return unwrap<{ task: Task }>(res).task;
};

export const claimPayment = async (id: string): Promise<Task> => {
  const res = await api.post(`/swap/tasks/${id}/claim-payment`);
  return unwrap<{ task: Task }>(res).task;
};

export const completeTask = async (id: string, payload?: CompleteTaskPayload): Promise<Task> => {
  const res = await api.post(`/swap/tasks/${id}/complete`, payload ?? {});
  return unwrap<{ task: Task }>(res).task;
};
