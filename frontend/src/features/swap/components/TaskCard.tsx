import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Clock, Users, Eye, Flame, AlertCircle, TrendingDown, MessageCircle } from 'lucide-react';
import type { Task } from '../types';
import { CATEGORY_EMOJI, CATEGORY_LABELS, URGENCY_CONFIG } from '../types';
import { useAuthStore } from '@/store/useAuthStore';
import { expressInterest } from '@/features/chat/services/chat.api';
import { formatDistanceToNow } from '@/utils/time';
import toast from 'react-hot-toast';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function TaskCardSkeleton() {
  return (
    <div className="cc-card p-4 space-y-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-3.5 w-16 rounded-full" />
          <div className="skeleton h-4 w-4/5 rounded-lg" />
        </div>
        <div className="skeleton h-10 w-16 rounded-xl" />
      </div>
      <div className="skeleton h-3 w-full rounded-lg" />
      <div className="skeleton h-3 w-3/4 rounded-lg" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="skeleton w-6 h-6 rounded-full" />
          <div className="skeleton h-3 w-24 rounded-lg" />
        </div>
        <div className="skeleton h-8 w-32 rounded-xl" />
      </div>
    </div>
  );
}

const URGENCY_ICON: Record<string, React.ReactNode> = {
  high:   <Flame size={11} />,
  medium: <AlertCircle size={11} />,
  low:    <TrendingDown size={11} />,
};

// ─── TaskCard ─────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  onInterested?: (chatId: string) => void; // called when chat is created
}

export default function TaskCard({ task, compact = false, onInterested }: TaskCardProps) {
  const navigate    = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const [loading,   setLoading]   = useState(false);
  const [chatted,   setChatted]   = useState(false);

  const urgency   = URGENCY_CONFIG[task.urgency];
  const isOwnTask = currentUser?._id === task.poster._id;
  const deadlineStr = task.deadline ? formatDistanceToNow(new Date(task.deadline)) : null;
  const isExpiringSoon = task.deadline
    ? new Date(task.deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000 : false;

  const handleInterested = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading || chatted) return;
    setLoading(true);
    try {
      const chat = await expressInterest(task._id);
      setChatted(true);
      toast.success('Chat started! 🎉 Check your Chats tab.');
      onInterested?.(chat._id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to express interest.');
    } finally {
      setLoading(false);
    }
  };

  const urgencyColor =
    task.urgency === 'high' ? '#f87171' :
    task.urgency === 'medium' ? '#fbbf24' : '#34d399';

  return (
    <article
      className="cc-card cc-card-hover p-4 space-y-3 relative overflow-hidden cursor-pointer"
      onClick={() => navigate(`/tasks`)}
    >
      {/* Left urgency stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: urgencyColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 pl-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="cc-tag">
              {CATEGORY_EMOJI[task.category]} {CATEGORY_LABELS[task.category]}
            </span>
            <span className="flex items-center gap-1 font-body text-[11px] font-medium"
                  style={{ color: urgency.color }}>
              {URGENCY_ICON[task.urgency]} {urgency.label}
            </span>
          </div>
          <h3
            className="font-display text-[15px] font-700 line-clamp-2 leading-snug"
            style={{ color: 'var(--text)' }}
          >
            {task.title}
          </h3>
        </div>

        {/* Coin reward badge */}
        <div
          className="shrink-0 flex flex-col items-center px-3 py-2 rounded-xl"
          style={{
            background: 'var(--accent-sub)',
            border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
          }}
        >
          <Zap size={13} style={{ color: 'var(--accent)' }} fill="currentColor" strokeWidth={0} />
          <span className="font-mono text-base font-700 leading-tight mt-0.5"
                style={{ color: 'var(--accent)', textShadow: '0 0 8px var(--accent-glow)' }}>
            {task.coinReward.toLocaleString()}
          </span>
          <span className="font-body text-[9px] uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
            coins
          </span>
        </div>
      </div>

      {/* Description */}
      {!compact && (
        <p className="font-body text-sm leading-relaxed line-clamp-2 pl-3"
           style={{ color: 'var(--text-muted)' }}>
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-3">
          {task.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="cc-tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pl-3 pt-1"
           onClick={(e) => e.stopPropagation()}>
        {/* Poster + meta */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0"
               style={{ border: '1px solid var(--border)' }}>
            {task.poster.avatarUrl
              ? <img src={task.poster.avatarUrl} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-[8px] font-bold"
                     style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--primary-lt)' }}>
                  {task.poster.name.charAt(0)}
                </div>
            }
          </div>
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-dim)' }}>
            <span className="truncate max-w-[80px]">{task.poster.name}</span>
            {task.applications.length > 0 && (
              <><span style={{ color: 'var(--border)' }}>·</span>
              <Users size={11} /> {task.applications.length}</>
            )}
            {task.viewCount > 0 && (
              <><span style={{ color: 'var(--border)' }}>·</span>
              <Eye size={11} /> {task.viewCount}</>
            )}
            {deadlineStr && (
              <span className={`flex items-center gap-0.5 ${isExpiringSoon ? 'text-red-400' : ''}`}>
                · <Clock size={11} /> {deadlineStr}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        {!isOwnTask && task.status === 'open' && (
          <button
            onClick={handleInterested}
            disabled={loading || chatted}
            className={chatted ? 'btn-ghost text-xs px-3 py-1.5' : 'btn-interested'}
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : chatted ? (
              <><MessageCircle size={13} /> Chatting</>
            ) : (
              <>🔥 100% Interested</>
            )}
          </button>
        )}

        {isOwnTask && (
          <span className="cc-tag" style={{ color: 'var(--primary-lt)', borderColor: 'rgba(124,58,237,0.3)' }}>
            Your task
          </span>
        )}
      </div>
    </article>
  );
}
