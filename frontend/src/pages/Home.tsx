import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, RefreshCw, Heart, MessageCircle, ListTodo } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCoinStore, selectBalance } from '@/store/useCoinStore';
import { fetchTasks } from '@/features/swap/services/swap.api';
import { fetchPosts } from '@/features/flex/services/flex.api';
import { usePostActions } from '@/features/flex/hooks/useFlex';
import type { Task } from '@/features/swap/types';
import type { Post } from '@/features/flex/types';
import { CATEGORY_EMOJI, CATEGORY_LABELS, type TaskCategory } from '@/features/swap/types';
import { POST_TYPE_CONFIG } from '@/features/flex/types';
import { formatDistanceToNow } from '@/utils/time';

// ─── Task groups ──────────────────────────────────────────────────────────────

const GROUPS: { key: TaskCategory | 'all'; label: string; emoji: string }[] = [
  { key: 'all',         label: 'All',         emoji: '⚡' },
  { key: 'tutoring',    label: 'Tutoring',     emoji: '📚' },
  { key: 'coding',      label: 'Coding',       emoji: '💻' },
  { key: 'design',      label: 'Design',       emoji: '🎨' },
  { key: 'writing',     label: 'Writing',      emoji: '✍️' },
  { key: 'errands',     label: 'Errands',      emoji: '🏃' },
  { key: 'notes',       label: 'Notes',        emoji: '📝' },
  { key: 'photography', label: 'Photography',  emoji: '📷' },
  { key: 'other',       label: 'Other',        emoji: '🔮' },
];

// ─── Compact task chip ────────────────────────────────────────────────────────

function TaskChip({ task, onClick }: { task: Task; onClick: () => void }) {
  const urgencyColor =
    task.urgency === 'high' ? '#f87171' : task.urgency === 'medium' ? '#fbbf24' : '#34d399';

  return (
    <button
      onClick={onClick}
      className="shrink-0 cc-card cc-card-hover p-4 text-left w-64 transition-all duration-200 active:scale-[0.98]"
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="cc-tag text-[10px]">
          {CATEGORY_EMOJI[task.category]} {CATEGORY_LABELS[task.category]}
        </span>
        <span className="w-2 h-2 rounded-full shrink-0"
              style={{ background: urgencyColor, boxShadow: `0 0 5px ${urgencyColor}` }} />
      </div>
      <p className="font-display text-sm font-700 line-clamp-2 mb-3"
         style={{ color: 'var(--text)', lineHeight: 1.3 }}>
        {task.title}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Zap size={12} style={{ color: 'var(--accent)' }} fill="currentColor" strokeWidth={0} />
          <span className="font-mono text-sm font-700"
                style={{ color: 'var(--accent)', textShadow: '0 0 6px var(--accent-glow)' }}>
            {task.coinReward}
          </span>
        </div>
        <div className="w-5 h-5 rounded-full overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {task.poster.avatarUrl
            ? <img src={task.poster.avatarUrl} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-[8px] font-bold"
                   style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--primary-lt)' }}>
                {task.poster.name.charAt(0)}
              </div>
          }
        </div>
      </div>
    </button>
  );
}

// ─── Feed card ────────────────────────────────────────────────────────────────

function FeedCard({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  const currentUser = useAuthStore((s) => s.user);
  const hasLiked    = currentUser ? post.likes.includes(currentUser._id) : false;
  const cfg         = POST_TYPE_CONFIG[post.type];

  return (
    <article className="cc-card p-5 space-y-3.5 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0"
             style={{ border: '1px solid var(--border)' }}>
          {post.author.avatarUrl
            ? <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center font-display font-700 text-sm"
                   style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--primary-lt)' }}>
                {post.author.name.charAt(0).toUpperCase()}
              </div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-sm font-700" style={{ color: 'var(--text)' }}>
              {post.author.name}
            </span>
            {post.author.department && (
              <span className="font-body text-xs" style={{ color: 'var(--text-dim)' }}>
                · {post.author.department}
              </span>
            )}
          </div>
          <p className="font-body text-[11px]" style={{ color: 'var(--text-dim)' }}>
            {formatDistanceToNow(new Date(post.createdAt))}
          </p>
        </div>
        <span className="cc-tag text-[10px] shrink-0">{cfg.emoji} {cfg.label}</span>
      </div>

      <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
        {post.content}
      </p>

      {post.imageUrl && (
        <div className="rounded-xl overflow-hidden max-h-64" style={{ border: '1px solid var(--border)' }}>
          <img src={post.imageUrl} alt="post" className="w-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-1 pt-1" style={{ borderTop: '1px solid var(--border-sub)' }}>
        <button
          onClick={() => onLike(post._id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body
                     font-medium transition-all active:scale-95"
          style={{
            color: hasLiked ? '#f87171' : 'var(--text-dim)',
            background: hasLiked ? 'rgba(248,113,113,0.08)' : 'transparent',
          }}
        >
          <Heart size={14} fill={hasLiked ? 'currentColor' : 'none'} />
          {post.likes.length > 0 ? post.likes.length : 'Like'}
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body
                     font-medium transition-all active:scale-95"
          style={{ color: 'var(--text-dim)' }}
        >
          <MessageCircle size={14} />
          {post.comments.length > 0 ? post.comments.length : 'Comment'}
        </button>
      </div>
    </article>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const user     = useAuthStore((s) => s.user);
  const balance  = useCoinStore(selectBalance);
  const navigate = useNavigate();

  const [activeGroup,  setActiveGroup]  = useState<TaskCategory | 'all'>('all');
  const [tasks,        setTasks]        = useState<Task[]>([]);
  const [posts,        setPosts]        = useState<Post[]>([]);
  const [localPosts,   setLocalPosts]   = useState<Post[]>([]);
  const [postPage,     setPostPage]     = useState(1);
  const [hasMore,      setHasMore]      = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [groupCounts,  setGroupCounts]  = useState<Record<string, number>>({});

  const updatePost = (id: string, fn: (p: Post) => Post) =>
    setLocalPosts((prev) => prev.map((p) => p._id === id ? fn(p) : p));
  const { toggleLike } = usePostActions(updatePost);

  const firstName = user?.name.split(' ')[0] ?? 'there';
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

  useEffect(() => {
    setTasksLoading(true);
    fetchTasks({ limit: 10, sortBy: 'reward_high', status: 'open', category: activeGroup === 'all' ? undefined : activeGroup })
      .then((r) => setTasks(r.data))
      .catch(() => {})
      .finally(() => setTasksLoading(false));
  }, [activeGroup]);

  useEffect(() => {
    const cats: TaskCategory[] = ['tutoring','coding','design','writing','errands','notes','photography','other'];
    Promise.all(cats.map((c) =>
      fetchTasks({ limit: 1, status: 'open', category: c }).then((r) => ({ c, total: r.pagination.total }))
    )).then((res) => {
      const counts: Record<string, number> = {};
      res.forEach(({ c, total }) => { counts[c] = total; });
      setGroupCounts(counts);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setPostsLoading(true);
    fetchPosts({ page: 1, limit: 6, sortBy: 'newest' })
      .then((r) => { setPosts(r.data); setLocalPosts(r.data); setHasMore(r.pagination.hasNextPage); })
      .catch(() => {})
      .finally(() => setPostsLoading(false));
  }, []);

  useEffect(() => { setLocalPosts(posts); }, [posts]);

  const loadMorePosts = async () => {
    setLoadingMore(true);
    try {
      const r = await fetchPosts({ page: postPage + 1, limit: 6, sortBy: 'newest' });
      setPostPage((p) => p + 1);
      setLocalPosts((prev) => [...prev, ...r.data]);
      setHasMore(r.pagination.hasNextPage);
    } catch { } finally { setLoadingMore(false); }
  };

  return (
    <div className="min-h-full">
      <div className="content-wrap py-6 lg:py-8 space-y-8">

        {/* ── Greeting + balance ─────────────────────────────────── */}
        <div className="cc-card p-5 lg:p-6 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-15"
               style={{ background: 'radial-gradient(circle, var(--primary), transparent 70%)' }} />
          <div className="pointer-events-none absolute -bottom-12 -left-12 w-40 h-40 rounded-full opacity-10"
               style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }} />

          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-body text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Good {greeting}, 👋
              </p>
              <h1 className="font-display text-2xl lg:text-3xl font-800 mt-0.5">{firstName}</h1>
              <p className="font-body text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
                {user?.university}
              </p>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl animate-coin-pulse"
                 style={{
                   background: 'var(--accent-sub)',
                   border: '1px solid color-mix(in srgb, var(--accent) 28%, transparent)',
                 }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: 'color-mix(in srgb, var(--accent) 18%, transparent)' }}>
                <Zap size={20} style={{ color: 'var(--accent)' }} fill="currentColor" strokeWidth={0} />
              </div>
              <div>
                <p className="font-body text-[10px] uppercase tracking-wider font-semibold"
                   style={{ color: 'var(--text-dim)' }}>Balance</p>
                <p className="font-mono text-2xl font-700 leading-none"
                   style={{ color: 'var(--accent)', textShadow: '0 0 12px var(--accent-glow)' }}>
                  {balance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Task groups ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xs font-700 uppercase tracking-widest"
                style={{ color: 'var(--text-dim)' }}>Browse by Group</h2>
            <button onClick={() => navigate('/tasks')}
                    className="flex items-center gap-1 font-body text-xs transition-colors"
                    style={{ color: 'var(--primary-lt)' }}>
              All tasks <ArrowRight size={12} />
            </button>
          </div>

          {/* Group pills */}
          <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-2">
            {GROUPS.map((g) => {
              const active = activeGroup === g.key;
              const count  = g.key === 'all' ? undefined : groupCounts[g.key];
              return (
                <button
                  key={g.key}
                  onClick={() => setActiveGroup(g.key as TaskCategory | 'all')}
                  className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl
                             font-body text-sm font-semibold transition-all duration-200 active:scale-95"
                  style={{
                    background: active ? 'var(--primary)' : 'var(--card)',
                    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                    color: active ? '#fff' : 'var(--text-muted)',
                    boxShadow: active ? '0 0 14px rgba(124,58,237,0.35)' : 'none',
                  }}
                >
                  <span className="text-base leading-none">{g.emoji}</span>
                  <span>{g.label}</span>
                  {count !== undefined && count > 0 && (
                    <span className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center
                                     text-[10px] font-bold px-1"
                          style={{ background: active ? 'rgba(255,255,255,0.25)' : 'var(--primary)', color: '#fff' }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Task chips */}
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 mt-4">
            {tasksLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shrink-0 w-64 h-32 skeleton" />
              ))
            ) : tasks.length === 0 ? (
              <div className="cc-card p-8 flex flex-col items-center gap-3 w-full text-center">
                <ListTodo size={28} style={{ color: 'var(--text-dim)' }} strokeWidth={1.5} />
                <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
                  No tasks in this group yet.
                </p>
                <button onClick={() => navigate('/tasks')} className="btn-neon text-xs px-4 py-1.5">
                  Post First Task
                </button>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskChip key={task._id} task={task} onClick={() => navigate('/tasks')} />
              ))
            )}
          </div>
        </section>

        {/* ── Campus Feed ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xs font-700 uppercase tracking-widest"
                style={{ color: 'var(--text-dim)' }}>Campus Feed</h2>
            <button onClick={() => navigate('/flex')}
                    className="flex items-center gap-1 font-body text-xs transition-colors"
                    style={{ color: 'var(--primary-lt)' }}>
              See all <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex gap-7">
            <div className="flex-1 min-w-0 space-y-4">
              {postsLoading ? (
                <div className="space-y-4 animate-stagger">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="cc-card p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="skeleton w-10 h-10 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="skeleton h-3 w-32 rounded" />
                          <div className="skeleton h-2.5 w-20 rounded" />
                        </div>
                      </div>
                      <div className="skeleton h-3 w-full rounded" />
                      <div className="skeleton h-3 w-4/5 rounded" />
                    </div>
                  ))}
                </div>
              ) : localPosts.length === 0 ? (
                <div className="cc-card p-10 text-center space-y-3">
                  <p className="font-display text-base font-700" style={{ color: 'var(--text-muted)' }}>
                    No posts yet
                  </p>
                  <button onClick={() => navigate('/flex')} className="btn-primary mx-auto">
                    Write a Post
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-stagger">
                  {localPosts.map((post) => (
                    <FeedCard key={post._id} post={post} onLike={toggleLike} />
                  ))}
                </div>
              )}

              {hasMore && (
                <button onClick={loadMorePosts} disabled={loadingMore}
                        className="w-full btn-ghost flex items-center justify-center gap-2">
                  {loadingMore
                    ? <><span className="w-4 h-4 border-2 rounded-full animate-spin"
                              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary-lt)' }} /> Loading…</>
                    : <><RefreshCw size={14} /> Load more posts</>
                  }
                </button>
              )}
            </div>

            {/* Desktop right sidebar */}
            <aside className="hidden lg:flex flex-col gap-5 w-64 xl:w-72 shrink-0">
              <div className="cc-card p-4 space-y-3">
                <h3 className="font-display text-xs font-700 uppercase tracking-widest"
                    style={{ color: 'var(--text-dim)' }}>Quick Actions</h3>
                {[
                  { emoji: '📋', label: 'Browse Tasks', sub: 'Earn coins by helping', to: '/tasks', accent: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.2)', textColor: 'var(--primary-lt)' },
                  { emoji: '✨', label: 'Post to Flex',  sub: 'Share a win',           to: '/flex',  accent: 'var(--accent-sub)',       border: 'color-mix(in srgb, var(--accent) 25%, transparent)', textColor: 'var(--accent)' },
                  { emoji: '💬', label: 'My Chats',     sub: 'Negotiate & pay',       to: '/chats', accent: 'rgba(249,115,22,0.1)',    border: 'rgba(249,115,22,0.25)', textColor: '#F97316' },
                ].map(({ emoji, label, sub, to, accent, border, textColor }) => (
                  <button key={to} onClick={() => navigate(to)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
                          style={{ background: accent, border: `1px solid ${border}` }}>
                    <span className="text-xl">{emoji}</span>
                    <div>
                      <p className="font-body text-sm font-semibold" style={{ color: textColor }}>{label}</p>
                      <p className="font-body text-xs" style={{ color: 'var(--text-dim)' }}>{sub}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="cc-card p-4 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto"
                     style={{ border: '2px solid rgba(124,58,237,0.35)' }}>
                  {user?.avatarUrl
                    ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center font-display text-xl font-700"
                           style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--primary-lt)' }}>
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                  }
                </div>
                <div>
                  <p className="font-display text-sm font-700" style={{ color: 'var(--text)' }}>{user?.name}</p>
                  <p className="font-body text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                    {user?.department || user?.university}
                  </p>
                </div>
                <button onClick={() => navigate('/profile')} className="btn-ghost w-full text-xs py-2">
                  View Profile
                </button>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
