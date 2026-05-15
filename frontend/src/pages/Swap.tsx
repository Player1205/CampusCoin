import { useState, useRef, useCallback } from 'react';
import {
  Search, SlidersHorizontal, X, Zap,
  ArrowLeftRight, ChevronDown, LayoutGrid, List,
} from 'lucide-react';
import TaskCard, { TaskCardSkeleton } from '@/features/swap/components/TaskCard';
import PostTaskModal from '@/features/swap/components/PostTaskModal';
import EmptyState from '@/components/ui/EmptyState';
import { useTaskFeed, useTaskActions } from '@/features/swap/hooks/useSwap';
import type { Task, TaskCategory, TaskUrgency } from '@/features/swap/types';
import { CATEGORY_LABELS, CATEGORY_EMOJI } from '@/features/swap/types';

type SortValue = 'newest' | 'oldest' | 'reward_high' | 'reward_low';
type ViewMode  = 'list' | 'grid';

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: 'newest',      label: 'Newest first' },
  { value: 'oldest',      label: 'Oldest first' },
  { value: 'reward_high', label: 'Highest reward' },
  { value: 'reward_low',  label: 'Lowest reward' },
];

const URGENCY_OPTIONS: { value: TaskUrgency; label: string; color: string }[] = [
  { value: 'high',   label: 'High',   color: '#f87171' },
  { value: 'medium', label: 'Medium', color: '#fbbf24' },
  { value: 'low',    label: 'Low',    color: '#34d399' },
];

// ─── Apply modal ──────────────────────────────────────────────────────────────

function ApplyModal({ task, onClose, onApply }: {
  task: Task; onClose: () => void; onApply: (msg: string) => Promise<void>;
}) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (message.trim().length < 10) return;
    setLoading(true);
    try { await onApply(message); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-card border border-surface-border
                      rounded-3xl p-6 space-y-5 animate-fade-up shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-700 text-text-main">Apply to Task</h3>
          <button onClick={onClose} className="btn-ghost !px-2 !py-2"><X size={16} /></button>
        </div>
        <div className="cc-card p-3 space-y-1">
          <p className="font-display text-sm font-700 text-text-main line-clamp-2">{task.title}</p>
          <div className="flex items-center gap-1.5">
            <Zap size={12} className="text-neon" fill="currentColor" strokeWidth={0} />
            <span className="font-mono text-sm text-neon font-semibold">{task.coinReward} coins</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="font-body text-xs font-semibold text-text-muted uppercase tracking-wider">
            Your pitch <span className="normal-case text-text-dim font-normal">(min 10 chars)</span>
          </label>
          <textarea
            autoFocus
            className="cc-input min-h-[120px] resize-none"
            placeholder="Why are you the right person? What's your approach?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
          />
          <p className="text-right font-mono text-[11px] text-text-dim">{message.length}/500</p>
        </div>
        <button
          onClick={handle}
          disabled={message.trim().length < 10 || loading}
          className="btn-neon w-full"
        >
          {loading
            ? <><span className="w-4 h-4 border-2 border-surface-background/30 border-t-surface-background rounded-full animate-spin" /> Sending…</>
            : <>Accept Task — Apply Now</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Desktop filter sidebar ───────────────────────────────────────────────────

function FilterPanel({
  category, urgency, sortBy,
  onCategory, onUrgency, onSort, onReset,
  taskCount,
}: {
  category: TaskCategory | '';
  urgency: TaskUrgency | '';
  sortBy: SortValue;
  onCategory: (c: TaskCategory | '') => void;
  onUrgency: (u: TaskUrgency | '') => void;
  onSort: (s: SortValue) => void;
  onReset: () => void;
  taskCount: number;
}) {
  const hasFilters = !!category || !!urgency;

  return (
    <aside className="hidden lg:flex flex-col w-60 xl:w-72 shrink-0 space-y-5">

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-text-muted">
          <span className="font-semibold text-text-main">{taskCount}</span> task{taskCount !== 1 ? 's' : ''}
        </p>
        {hasFilters && (
          <button onClick={onReset} className="font-body text-xs text-primary-light hover:text-primary
                                               transition-colors flex items-center gap-1">
            <X size={11} /> Clear
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="cc-card p-4 space-y-3">
        <h3 className="font-display text-xs font-700 text-text-dim uppercase tracking-widest">Sort</h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => onSort(o.value)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm
                          font-body transition-all duration-150 ${
                sortBy === o.value
                  ? 'bg-primary/15 text-primary-light border border-primary/25'
                  : 'text-text-muted hover:text-text-main hover:bg-surface-background'
              }`}
            >
              {o.label}
              {sortBy === o.value && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary-light" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="cc-card p-4 space-y-3">
        <h3 className="font-display text-xs font-700 text-text-dim uppercase tracking-widest">Category</h3>
        <div className="space-y-1">
          <button
            onClick={() => onCategory('')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-body
                        transition-all duration-150 ${
              !category
                ? 'bg-primary/15 text-primary-light border border-primary/25'
                : 'text-text-muted hover:text-text-main hover:bg-surface-background'
            }`}
          >
            <span>🔍</span> All Categories
          </button>
          {(Object.keys(CATEGORY_LABELS) as TaskCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => onCategory(cat)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-body
                          transition-all duration-150 ${
                category === cat
                  ? 'bg-primary/15 text-primary-light border border-primary/25'
                  : 'text-text-muted hover:text-text-main hover:bg-surface-background'
              }`}
            >
              <span>{CATEGORY_EMOJI[cat]}</span> {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Urgency */}
      <div className="cc-card p-4 space-y-3">
        <h3 className="font-display text-xs font-700 text-text-dim uppercase tracking-widest">Urgency</h3>
        <div className="space-y-1">
          {[{ value: '' as const, label: 'Any', color: '#64748B' }, ...URGENCY_OPTIONS].map((u) => (
            <button
              key={u.value}
              onClick={() => onUrgency(u.value as TaskUrgency | '')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-body
                          transition-all duration-150 ${
                urgency === u.value
                  ? 'bg-primary/15 text-primary-light border border-primary/25'
                  : 'text-text-muted hover:text-text-main hover:bg-surface-background'
              }`}
            >
              <span className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: u.color, boxShadow: `0 0 5px ${u.color}60` }} />
              {u.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── Swap page ────────────────────────────────────────────────────────────────

export default function Swap() {
  const [search,        setSearch]        = useState('');
  const [category,      setCategory]      = useState<TaskCategory | ''>('');
  const [urgency,       setUrgency]       = useState<TaskUrgency | ''>('');
  const [sortBy,        setSortBy]        = useState<SortValue>('newest');
  const [viewMode,      setViewMode]      = useState<ViewMode>('list');
  const [showPostModal, setShowPostModal] = useState(false);
  const [applyTarget,   setApplyTarget]   = useState<Task | null>(null);
  const searchTimeout                     = useRef<ReturnType<typeof setTimeout>>();

  const { tasks, pagination, isLoading, isLoadingMore, error, applyFilters, loadNextPage } =
    useTaskFeed({ sortBy: 'newest', status: 'open' });

  const { pending, apply, postTask } = useTaskActions(() => applyFilters({}));

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => applyFilters({ search: val || undefined }), 400);
  }, [applyFilters]);

  const handleCategory = (c: TaskCategory | '') => {
    setCategory(c);
    applyFilters({ category: c || undefined });
  };
  const handleUrgency = (u: TaskUrgency | '') => {
    setUrgency(u);
    applyFilters({ urgency: u || undefined });
  };
  const handleSort = (s: SortValue) => {
    setSortBy(s);
    applyFilters({ sortBy: s });
  };
  const handleReset = () => {
    setCategory(''); setUrgency(''); setSortBy('newest');
    applyFilters({ category: undefined, urgency: undefined, sortBy: 'newest' });
  };

  return (
    <div className="min-h-full">
      <div className="content-wrap py-8">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-800 text-text-main">Swap</h1>
            <p className="font-body text-sm text-text-muted mt-1">
              Hire or offer campus skills for CampusCoins
            </p>
          </div>
          <button onClick={() => setShowPostModal(true)} className="btn-neon">
            <Zap size={15} fill="currentColor" strokeWidth={0} /> Post Gig
          </button>
        </div>

        {/* ── Search + view toggle ─────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xl">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              className="cc-input pl-11 h-11"
              placeholder="Search tasks, tags, skills…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {search && (
              <button onClick={() => handleSearchChange('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-muted">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Mobile: sort dropdown */}
          <div className="relative lg:hidden">
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as SortValue)}
              className="cc-input h-11 pr-8 appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
          </div>

          {/* Mobile: filter button */}
          <button className="lg:hidden flex items-center gap-1.5 cc-input h-11 px-3 w-auto">
            <SlidersHorizontal size={15} className="text-text-muted" />
          </button>

          {/* Desktop: view mode toggle */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-surface-card rounded-xl border border-surface-border">
            {(['list', 'grid'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === mode
                    ? 'bg-surface-background text-text-main'
                    : 'text-text-dim hover:text-text-muted'
                }`}
              >
                {mode === 'list' ? <List size={15} /> : <LayoutGrid size={15} />}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main: filters sidebar + feed ────────────────────────── */}
        <div className="flex gap-7">

          {/* Desktop filter sidebar */}
          <FilterPanel
            category={category} urgency={urgency} sortBy={sortBy}
            onCategory={handleCategory} onUrgency={handleUrgency}
            onSort={handleSort} onReset={handleReset}
            taskCount={pagination?.total ?? 0}
          />

          {/* Task feed */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 xl:grid-cols-2 gap-3 animate-stagger'
                : 'space-y-3 animate-stagger'}>
                {Array.from({ length: 6 }).map((_, i) => <TaskCardSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="cc-card p-8 text-center space-y-3">
                <p className="font-body text-sm text-red-400">{error}</p>
                <button onClick={() => applyFilters({})} className="btn-ghost text-sm">Retry</button>
              </div>
            ) : tasks.length === 0 ? (
              <EmptyState
                icon={ArrowLeftRight}
                title="No tasks found"
                description={search || category || urgency ? 'Try adjusting your filters.' : 'Be the first to post a task.'}
                action={<button onClick={() => setShowPostModal(true)} className="btn-neon">Post First Task</button>}
              />
            ) : (
              <>
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 xl:grid-cols-2 gap-3 animate-stagger'
                  : 'space-y-3 animate-stagger'}>
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
                      ? <><span className="w-4 h-4 border-2 border-surface-border border-t-primary-light rounded-full animate-spin" /> Loading…</>
                      : `Load more (${pagination.total - tasks.length} remaining)`
                    }
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
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
