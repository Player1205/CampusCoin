import { useState, useRef, useCallback } from 'react';
import {
  Search, X, Zap, ListTodo,
  ArrowUpDown, LayoutGrid, List, Filter,
} from 'lucide-react';
import TaskCard, { TaskCardSkeleton } from '@/features/swap/components/TaskCard';
import PostTaskModal from '@/features/swap/components/PostTaskModal';
import EmptyState from '@/components/ui/EmptyState';
import { useTaskFeed, useTaskActions } from '@/features/swap/hooks/useSwap';
import type { Task, TaskCategory, TaskUrgency } from '@/features/swap/types';
import { CATEGORY_LABELS, CATEGORY_EMOJI } from '@/features/swap/types';

type SortValue = 'newest' | 'oldest' | 'reward_high' | 'reward_low';
type ViewMode  = 'list' | 'grid';

const URGENCY_TABS = [
  { value: '',       label: 'All',    dot: 'var(--text-dim)' },
  { value: 'high',   label: '🔴 High',   dot: '#f87171' },
  { value: 'medium', label: '🟡 Medium', dot: '#fbbf24' },
  { value: 'low',    label: '🟢 Low',    dot: '#34d399' },
];

// ─── Apply modal ──────────────────────────────────────────────────────────────

function ApplyModal({ task, onClose, onApply }: {
  task: Task; onClose: () => void; onApply: (msg: string) => Promise<void>;
}) {
  const [msg, setMsg]       = useState('');
  const [loading, setLoad]  = useState(false);

  const handle = async () => {
    if (msg.trim().length < 10) return;
    setLoad(true);
    try { await onApply(msg); onClose(); }
    finally { setLoad(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'var(--overlay)' }} onClick={onClose} />
      <div className="relative w-full lg:max-w-md rounded-t-3xl lg:rounded-3xl p-6 space-y-5 animate-slide-up lg:animate-fade-up"
           style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-700" style={{ color: 'var(--text)' }}>Apply to Task</h3>
          <button onClick={onClose} className="btn-ghost !px-2 !py-2"><X size={16} /></button>
        </div>
        <div className="rounded-xl p-3 space-y-1.5"
             style={{ background: 'var(--card-alt)', border: '1px solid var(--border)' }}>
          <p className="font-display text-sm font-700 line-clamp-2" style={{ color: 'var(--text)' }}>
            {task.title}
          </p>
          <div className="flex items-center gap-1.5">
            <Zap size={12} style={{ color: 'var(--accent)' }} fill="currentColor" strokeWidth={0} />
            <span className="font-mono text-sm font-700" style={{ color: 'var(--accent)' }}>
              {task.coinReward} coins
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="font-body text-xs font-semibold uppercase tracking-wider"
                 style={{ color: 'var(--text-muted)' }}>
            Your pitch <span className="normal-case font-normal" style={{ color: 'var(--text-dim)' }}>(min 10 chars)</span>
          </label>
          <textarea
            autoFocus
            className="cc-input min-h-[110px] resize-none"
            placeholder="Why are you the best person? What's your approach?"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            maxLength={500}
          />
          <p className="text-right font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>
            {msg.length}/500
          </p>
        </div>
        <button
          onClick={handle}
          disabled={msg.trim().length < 10 || loading}
          className="btn-neon w-full"
        >
          {loading
            ? <><span className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#0F172A' }} /> Sending…</>
            : <>Accept Task — Apply Now</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Desktop filter panel ─────────────────────────────────────────────────────

function FilterPanel({ category, urgency, sortBy, onCat, onUrg, onSort, onReset, total }: {
  category: TaskCategory | ''; urgency: TaskUrgency | ''; sortBy: SortValue;
  onCat: (c: TaskCategory | '') => void;
  onUrg: (u: TaskUrgency | '') => void;
  onSort: (s: SortValue) => void;
  onReset: () => void;
  total: number;
}) {
  const hasFilters = !!category || !!urgency;
  return (
    <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 gap-5">
      <div className="flex items-center justify-between">
        <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--text)' }}>{total}</span> open
        </p>
        {hasFilters && (
          <button onClick={onReset}
                  className="flex items-center gap-1 font-body text-xs transition-colors"
                  style={{ color: 'var(--primary-lt)' }}>
            <X size={11} /> Reset
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="cc-card p-4 space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <ArrowUpDown size={13} style={{ color: 'var(--text-dim)' }} />
          <h3 className="font-display text-xs font-700 uppercase tracking-widest"
              style={{ color: 'var(--text-dim)' }}>Sort</h3>
        </div>
        {[
          { v: 'newest',      l: 'Newest first' },
          { v: 'reward_high', l: 'Highest reward' },
          { v: 'reward_low',  l: 'Lowest reward' },
          { v: 'oldest',      l: 'Oldest first' },
        ].map(({ v, l }) => (
          <button key={v} onClick={() => onSort(v as SortValue)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl
                             font-body text-sm transition-all duration-150"
                  style={{
                    background: sortBy === v ? 'rgba(124,58,237,0.12)' : 'transparent',
                    border: `1px solid ${sortBy === v ? 'rgba(124,58,237,0.25)' : 'transparent'}`,
                    color: sortBy === v ? 'var(--primary-lt)' : 'var(--text-muted)',
                  }}>
            {l}
            {sortBy === v && <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary-lt)' }} />}
          </button>
        ))}
      </div>

      {/* Category */}
      <div className="cc-card p-4 space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={13} style={{ color: 'var(--text-dim)' }} />
          <h3 className="font-display text-xs font-700 uppercase tracking-widest"
              style={{ color: 'var(--text-dim)' }}>Category</h3>
        </div>
        {[{ k: '' as const, l: 'All Categories', e: '🔍' },
          ...(Object.keys(CATEGORY_LABELS) as TaskCategory[]).map((k) => ({ k, l: CATEGORY_LABELS[k], e: CATEGORY_EMOJI[k] }))
        ].map(({ k, l, e }) => (
          <button key={String(k)} onClick={() => onCat(k as TaskCategory | '')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl font-body text-sm transition-all"
                  style={{
                    background: category === k ? 'rgba(124,58,237,0.12)' : 'transparent',
                    border: `1px solid ${category === k ? 'rgba(124,58,237,0.25)' : 'transparent'}`,
                    color: category === k ? 'var(--primary-lt)' : 'var(--text-muted)',
                  }}>
            <span>{e}</span> {l}
          </button>
        ))}
      </div>
    </aside>
  );
}

// ─── Tasks page ───────────────────────────────────────────────────────────────

export default function Tasks() {
  const [search,        setSearch]        = useState('');
  const [category,      setCategory]      = useState<TaskCategory | ''>('');
  const [urgency,       setUrgency]       = useState<TaskUrgency | ''>('');
  const [sortBy,        setSortBy]        = useState<SortValue>('reward_high'); // high reward first
  const [viewMode,      setViewMode]      = useState<ViewMode>('list');
  const [showPostModal, setShowPostModal] = useState(false);
  const [applyTarget,   setApplyTarget]   = useState<Task | null>(null);
  const searchTimeout                     = useRef<ReturnType<typeof setTimeout>>();

  const { tasks, pagination, isLoading, isLoadingMore, error, applyFilters, loadNextPage } =
    useTaskFeed({ sortBy: 'reward_high', status: 'open' });

  const { pending, apply, postTask } = useTaskActions(() => applyFilters({}));

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => applyFilters({ search: val || undefined }), 380);
  }, [applyFilters]);

  const handleCat  = (c: TaskCategory | '') => { setCategory(c); applyFilters({ category: c || undefined }); };
  const handleUrg  = (u: TaskUrgency | '') => { setUrgency(u); applyFilters({ urgency: u || undefined }); };
  const handleSort = (s: SortValue)        => { setSortBy(s); applyFilters({ sortBy: s }); };
  const handleReset = () => {
    setCategory(''); setUrgency(''); setSortBy('reward_high');
    applyFilters({ category: undefined, urgency: undefined, sortBy: 'reward_high' });
  };

  return (
    <div className="min-h-full">
      <div className="content-wrap py-6 lg:py-8">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-800" style={{ color: 'var(--text)' }}>
              Tasks
            </h1>
            <p className="font-body text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Browse and accept tasks from your campus
            </p>
          </div>
          <button onClick={() => setShowPostModal(true)} className="btn-neon">
            <Zap size={15} fill="currentColor" strokeWidth={0} /> Post a Task
          </button>
        </div>

        {/* ── Search bar — prominent ──────────────────────────────── */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-dim)' }} />
          <input
            className="cc-input pl-12 h-12 text-base"
            placeholder="Search tasks by skill, keyword, or tag…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => handleSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 active:scale-90"
                    style={{ color: 'var(--text-dim)' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── Urgency tabs (mobile + desktop) ─────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none mb-5 pb-1">
          {URGENCY_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleUrg(value as TaskUrgency | '')}
              className="shrink-0 px-4 py-1.5 rounded-xl font-body text-sm font-medium
                         transition-all duration-150 active:scale-95"
              style={{
                background: urgency === value ? 'var(--primary)' : 'var(--card)',
                border: `1px solid ${urgency === value ? 'var(--primary)' : 'var(--border)'}`,
                color: urgency === value ? '#fff' : 'var(--text-muted)',
                boxShadow: urgency === value ? '0 0 12px rgba(124,58,237,0.35)' : 'none',
              }}
            >
              {label}
            </button>
          ))}

          {/* Desktop view mode */}
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl ml-auto"
               style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {(['list', 'grid'] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className="p-2 rounded-lg transition-all"
                style={{
                  background: viewMode === m ? 'var(--bg)' : 'transparent',
                  color: viewMode === m ? 'var(--text)' : 'var(--text-dim)',
                }}
              >
                {m === 'list' ? <List size={15} /> : <LayoutGrid size={15} />}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content: filter sidebar + feed ──────────────────────── */}
        <div className="flex gap-7">
          <FilterPanel
            category={category} urgency={urgency} sortBy={sortBy}
            onCat={handleCat} onUrg={handleUrg} onSort={handleSort}
            onReset={handleReset} total={pagination?.total ?? 0}
          />

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 xl:grid-cols-2 gap-3' : 'space-y-3'} animate-stagger`}>
                {Array.from({ length: 6 }).map((_, i) => <TaskCardSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="cc-card p-8 text-center">
                <p className="font-body text-sm" style={{ color: '#f87171' }}>{error}</p>
                <button onClick={() => applyFilters({})} className="btn-ghost mt-4 text-sm">Retry</button>
              </div>
            ) : tasks.length === 0 ? (
              <EmptyState
                icon={ListTodo}
                title="No tasks found"
                description={search ? `No results for "${search}". Try different keywords.` : 'Be the first to post a task at your university.'}
                action={<button onClick={() => setShowPostModal(true)} className="btn-neon">Post First Task</button>}
              />
            ) : (
              <>
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 xl:grid-cols-2 gap-3' : 'space-y-3'} animate-stagger`}>
                  {tasks.map((task) => (
                    <TaskCard key={task._id} task={task} onApply={setApplyTarget} />
                  ))}
                </div>
                {pagination?.hasNextPage && (
                  <button
                    onClick={loadNextPage}
                    disabled={isLoadingMore}
                    className="w-full btn-ghost mt-5"
                  >
                    {isLoadingMore
                      ? <><span className="w-4 h-4 border-2 rounded-full animate-spin"
                                style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary-lt)' }} /> Loading…</>
                      : `Load more (${pagination.total - tasks.length} remaining)`
                    }
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showPostModal && (
        <PostTaskModal
          onClose={() => setShowPostModal(false)}
          onSubmit={postTask}
          isLoading={!!pending.create}
        />
      )}
      {applyTarget && (
        <ApplyModal
          task={applyTarget}
          onClose={() => setApplyTarget(null)}
          onApply={(msg) => apply(applyTarget._id, msg).then(() => setApplyTarget(null))}
        />
      )}
    </div>
  );
}
