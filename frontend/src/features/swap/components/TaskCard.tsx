import { useNavigate } from 'react-router-dom';
import {
  Zap, Clock, Users, Eye, ArrowRight,
  Flame, AlertCircle, TrendingDown,
} from 'lucide-react';
import type { Task } from '../types';
import {
  CATEGORY_EMOJI, CATEGORY_LABELS,
  URGENCY_CONFIG,
} from '../types';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDistanceToNow } from '@/utils/time';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function TaskCardSkeleton() {
  return (
    <div className="cc-card p-4 space-y-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-3.5 w-16 rounded-full" />
          <div className="skeleton h-4 w-4/5 rounded-lg" />
        </div>
        <div className="skeleton h-9 w-16 rounded-xl" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3 w-full rounded-lg" />
        <div className="skeleton h-3 w-3/4 rounded-lg" />
      </div>
      <div className="flex items-center gap-2">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="skeleton w-6 h-6 rounded-full" />
          <div className="skeleton h-3 w-24 rounded-lg" />
        </div>
        <div className="skeleton h-8 w-24 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Urgency icon ─────────────────────────────────────────────────────────────

const URGENCY_ICON = {
  high:   <Flame   size={11} />,
  medium: <AlertCircle size={11} />,
  low:    <TrendingDown size={11} />,
};

// ─── TaskCard ─────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  onApply?: (task: Task) => void;
  compact?: boolean;
}

export default function TaskCard({ task, onApply, compact = false }: TaskCardProps) {
  const navigate  = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const urgency   = URGENCY_CONFIG[task.urgency];
  const isOwnTask = currentUser?._id === task.poster._id;

  const hasApplied = task.applications.some(
    (a) => a.applicant._id === currentUser?._id && !a.isWithdrawn
  );

  const deadlineStr = task.deadline
    ? formatDistanceToNow(new Date(task.deadline))
    : null;

  const isExpiringSoon = task.deadline
    ? new Date(task.deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000
    : false;

  return (
    <article
      className="cc-card group relative overflow-hidden p-4 space-y-3.5
                 hover:border-primary/40 transition-all duration-200 cursor-pointer
                 active:scale-[0.99]"
      onClick={() => navigate(`/swap/${task._id}`)}
      aria-label={`Task: ${task.title}`}
    >
      {/* ── Urgency stripe ─────────────────────────────────────────────── */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl transition-all duration-200
                   group-hover:w-1"
        style={{
          background:
            task.urgency === 'high'   ? '#f87171' :
            task.urgency === 'medium' ? '#fbbf24' :
                                        '#34d399',
        }}
      />

      {/* ── Header row ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="space-y-1.5 min-w-0">
          {/* Category badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 cc-tag">
              <span className="text-[13px] leading-none">{CATEGORY_EMOJI[task.category]}</span>
              <span>{CATEGORY_LABELS[task.category]}</span>
            </span>
            {/* Urgency pip */}
            <span className={`inline-flex items-center gap-1 text-[11px] font-body font-medium ${urgency.color}`}>
              {URGENCY_ICON[task.urgency]}
              {urgency.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display text-base font-700 text-text-main leading-snug
                         line-clamp-2 group-hover:text-primary-light transition-colors duration-150">
            {task.title}
          </h3>
        </div>

        {/* Coin reward */}
        <div
          className="shrink-0 flex flex-col items-center justify-center px-3 py-2
                     rounded-xl border transition-all duration-200"
          style={{
            background: 'rgba(57,255,20,0.06)',
            borderColor: 'rgba(57,255,20,0.2)',
          }}
        >
          <Zap size={13} className="text-neon" fill="currentColor" strokeWidth={0} />
          <span className="font-mono text-base font-700 text-neon leading-tight mt-0.5"
                style={{ textShadow: '0 0 8px rgba(57,255,20,0.5)' }}>
            {task.coinReward.toLocaleString()}
          </span>
          <span className="font-body text-[9px] text-text-dim uppercase tracking-wide">coins</span>
        </div>
      </div>

      {/* ── Description ────────────────────────────────────────────────── */}
      {!compact && (
        <p className="font-body text-sm text-text-muted leading-relaxed line-clamp-2 pl-2">
          {task.description}
        </p>
      )}

      {/* ── Tags ───────────────────────────────────────────────────────── */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-2">
          {task.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="cc-tag">{tag}</span>
          ))}
          {task.tags.length > 4 && (
            <span className="cc-tag text-text-dim">+{task.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* ── Footer row ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pl-2 pt-1"
           onClick={(e) => e.stopPropagation()}>

        {/* Left: poster + meta */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar */}
          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0
                          border border-surface-border">
            {task.poster.avatarUrl ? (
              <img src={task.poster.avatarUrl} alt={task.poster.name}
                   className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/20">
                <span className="font-display text-[10px] font-700 text-primary-light">
                  {task.poster.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 min-w-0 text-text-dim">
            <span className="font-body text-xs truncate max-w-[90px]">{task.poster.name}</span>

            {/* Divider */}
            <span className="text-surface-border">·</span>

            {/* Meta pills */}
            <div className="flex items-center gap-2">
              {task.applications.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <Users size={11} /> {task.applications.length}
                </span>
              )}
              {task.viewCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <Eye size={11} /> {task.viewCount}
                </span>
              )}
              {deadlineStr && (
                <span className={`inline-flex items-center gap-1 text-[11px] ${
                  isExpiringSoon ? 'text-red-400' : ''
                }`}>
                  <Clock size={11} /> {deadlineStr}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: CTA */}
        {!isOwnTask && task.status === 'open' && (
          <button
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                        text-xs font-body font-semibold transition-all duration-200
                        active:scale-95 ${
              hasApplied
                ? 'bg-surface-elevated border border-surface-border text-text-muted'
                : 'btn-neon'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (!hasApplied) onApply?.(task);
            }}
            disabled={hasApplied}
            aria-label={hasApplied ? 'Already applied' : 'Apply to task'}
          >
            {hasApplied ? (
              'Applied ✓'
            ) : (
              <>Accept Task <ArrowRight size={12} /></>
            )}
          </button>
        )}

        {isOwnTask && (
          <span className="shrink-0 cc-tag text-primary-light border-primary/30">Your task</span>
        )}
      </div>
    </article>
  );
}
