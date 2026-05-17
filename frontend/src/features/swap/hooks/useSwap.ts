import { useState, useEffect, useCallback, useRef } from 'react';
import * as swapApi from '../services/swap.api';
import type { Task, PaginatedTasks, TaskFilters } from '../types';
import { useCoinStore } from '@/store/useCoinStore';
import toast from 'react-hot-toast';

// ─── useTaskFeed ──────────────────────────────────────────────────────────────

export function useTaskFeed(initialFilters: TaskFilters = {}) {
  const [tasks, setTasks]           = useState<Task[]>([]);
  const [pagination, setPagination] = useState<PaginatedTasks['pagination'] | null>(null);
  const [filters, setFilters]       = useState<TaskFilters>({ page: 1, limit: 20, ...initialFilters });
  const [isLoading, setIsLoading]   = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const abortRef                    = useRef<AbortController | null>(null);

  const load = useCallback(async (newFilters: TaskFilters, append = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    append ? setIsLoadingMore(true) : setIsLoading(true);
    setError(null);

    try {
      const result = await swapApi.fetchTasks(newFilters);
      setTasks((prev) => append ? [...prev, ...result.data] : result.data);
      setPagination(result.pagination);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void load(filters);
    return () => abortRef.current?.abort();
  }, [filters, load]);

  const applyFilters = useCallback((next: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...next, page: 1 }));
  }, []);

  const loadNextPage = useCallback(() => {
    if (!pagination?.hasNextPage || isLoadingMore) return;
    const next = { ...filters, page: (filters.page ?? 1) + 1 };
    setFilters(next);
    void load(next, true);
  }, [filters, pagination, isLoadingMore, load]);

  const refresh = useCallback(() => {
    void load({ ...filters, page: 1 });
  }, [filters, load]);

  return {
    tasks, pagination, filters,
    isLoading, isLoadingMore, error,
    applyFilters, loadNextPage, refresh,
  };
}

// ─── useTaskActions ───────────────────────────────────────────────────────────

export function useTaskActions(onSuccess?: (task: Task) => void) {
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const { optimisticDeduct, optimisticCredit, recordLock, recordUnlock, rollbackTransaction } = useCoinStore();

  const run = useCallback(async (
    key: string,
    fn: () => Promise<Task>,
    successMsg: string,
  ) => {
    setPending((p) => ({ ...p, [key]: true }));
    try {
      const task = await fn();
      toast.success(successMsg);
      onSuccess?.(task);
      return task;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
      throw err;
    } finally {
      setPending((p) => ({ ...p, [key]: false }));
    }
  }, [onSuccess]);

  const apply = (taskId: string, message: string) =>
    run(`apply-${taskId}`, () => swapApi.applyToTask(taskId, { message }), 'Application sent!');

  const withdraw = (taskId: string) =>
    run(`withdraw-${taskId}`, () => swapApi.withdrawApplication(taskId), 'Application withdrawn.');

  const cancel = (taskId: string, coinReward: number) =>
    run(`cancel-${taskId}`, async () => {
      const task = await swapApi.cancelTask(taskId);
      recordUnlock(coinReward, 'Task cancelled — coins refunded');
      optimisticCredit(coinReward, 'Task cancellation refund');
      return task;
    }, 'Task cancelled. Coins refunded.');

  const assign = (taskId: string, applicantId: string) =>
    run(`assign-${taskId}`, () => swapApi.assignDoer(taskId, applicantId), 'Doer assigned!');

  const submit = (taskId: string, note: string) =>
    run(`submit-${taskId}`, () => swapApi.submitTask(taskId, { submissionNote: note }), 'Work submitted for review!');

  const complete = (taskId: string, coinReward: number, note?: string) =>
    run(`complete-${taskId}`, async () => {
      const task = await swapApi.completeTask(taskId, { completionNote: note });
      toast.success(`🎉 ${coinReward} coins sent to doer!`);
      return task;
    }, 'Task completed!');

  const postTask = async (payload: Parameters<typeof swapApi.createTask>[0]) => {
    setPending((p) => ({ ...p, create: true }));
    let txDeductId: string | undefined;
    let txLockId: string | undefined;
    try {
      txDeductId = optimisticDeduct(payload.coinReward, `Task posted: ${payload.title}`);
      txLockId = recordLock(payload.coinReward, `Escrow: ${payload.title}`);
      const task = await swapApi.createTask(payload);
      toast.success('Task posted! Coins locked in escrow.');
      onSuccess?.(task);
      return task;
    } catch (err) {
      // Cleanly rollback the optimistic deduction without creating ledger entries
      if (txDeductId) rollbackTransaction(txDeductId);
      if (txLockId) rollbackTransaction(txLockId);
      toast.error(err instanceof Error ? err.message : 'Failed to post task.');
      throw err;
    } finally {
      setPending((p) => ({ ...p, create: false }));
    }
  };

  return { pending, apply, withdraw, cancel, assign, submit, complete, postTask };
}
