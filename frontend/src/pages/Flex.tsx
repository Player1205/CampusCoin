import { useState } from 'react';
import { Sparkles, X, Image, Send, ChevronDown } from 'lucide-react';
import FeedPost, { FeedPostSkeleton } from '@/features/flex/components/FeedPost';
import EmptyState from '@/components/ui/EmptyState';
import { usePostFeed, usePostActions, useCreatePost } from '@/features/flex/hooks/useFlex';
import { POST_TYPE_CONFIG } from '@/features/flex/types';
import type { PostType, CreatePostPayload } from '@/features/flex/types';
import { useAuthStore } from '@/store/useAuthStore';
import { useCoinStore, selectBalance } from '@/store/useCoinStore';

type SortVal = 'newest' | 'most_liked';

const FILTER_TABS: { value: PostType | 'all'; emoji: string; label: string }[] = [
  { value: 'all',         emoji: '✨', label: 'All' },
  { value: 'achievement', emoji: '🏆', label: 'Wins' },
  { value: 'skill_offer', emoji: '💡', label: 'Skills' },
  { value: 'shoutout',    emoji: '📣', label: 'Shoutouts' },
  { value: 'question',    emoji: '🤔', label: 'Questions' },
];

// ─── Inline composer (desktop: always visible at top of feed) ─────────────────

function InlineComposer({ onSubmit, isLoading }: {
  onSubmit: (p: CreatePostPayload) => Promise<void>; isLoading: boolean;
}) {
  const user = useAuthStore((s) => s.user);
  const [content, setContent]           = useState('');
  const [type,    setType]              = useState<PostType>('general');
  const [imageUrl, setImageUrl]         = useState('');
  const [expanded, setExpanded]         = useState(false);
  const [showImageInput, setShowImage]  = useState(false);

  const POST_TYPES = Object.entries(POST_TYPE_CONFIG) as [PostType, typeof POST_TYPE_CONFIG[PostType]][];

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await onSubmit({ type, content: content.trim(), imageUrl: imageUrl || undefined });
    setContent(''); setImageUrl(''); setExpanded(false); setShowImage(false);
  };

  return (
    <div className="cc-card p-4 space-y-3">
      {/* Author + input row */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl overflow-hidden border border-surface-border shrink-0 mt-0.5">
          {user?.avatarUrl
            ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center bg-primary/20">
                <span className="font-display text-xs font-700 text-primary-light">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
          }
        </div>
        <textarea
          onFocus={() => setExpanded(true)}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share a win, offer a skill, or just say something…"
          rows={expanded ? 4 : 2}
          maxLength={1000}
          className="cc-input flex-1 resize-none text-sm transition-all duration-200"
          style={{ minHeight: expanded ? '100px' : '60px' }}
        />
      </div>

      {expanded && (
        <div className="space-y-3 animate-fade-in">
          {/* Type pills */}
          <div className="flex flex-wrap gap-1.5">
            {POST_TYPES.map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => setType(key)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs
                            font-body font-medium border transition-all active:scale-95 ${
                  type === key
                    ? 'border-primary bg-primary/15 text-primary-light'
                    : 'border-surface-border text-text-dim hover:border-surface-border/80'
                }`}
              >
                {cfg.emoji} {cfg.label}
              </button>
            ))}
          </div>

          {/* Actions row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowImage((v) => !v)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border
                            font-body transition-all active:scale-95 ${
                  showImageInput
                    ? 'border-primary/40 text-primary-light bg-primary/10'
                    : 'border-surface-border text-text-dim hover:text-text-muted'
                }`}
              >
                <Image size={12} /> Image
              </button>
              <span className="font-mono text-xs text-text-dim">{1000 - content.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setExpanded(false)} className="btn-ghost text-xs px-3 py-1.5">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isLoading}
                className="btn-primary text-xs px-4 py-1.5"
              >
                {isLoading
                  ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Send size={13} /> Post</>
                }
              </button>
            </div>
          </div>

          {showImageInput && (
            <div className="animate-fade-in">
              <input
                className="cc-input text-sm"
                placeholder="Image URL (https://…)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                type="url"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Right sidebar ────────────────────────────────────────────────────────────

function RightPanel({ total, sortBy, onSort }: {
  total: number; sortBy: SortVal; onSort: (s: SortVal) => void;
}) {
  const balance = useCoinStore(selectBalance);
  const user    = useAuthStore((s) => s.user);

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 space-y-5">

      {/* Sort + stats */}
      <div className="cc-card p-4 space-y-4">
        <div>
          <p className="font-display text-xs font-700 text-text-dim uppercase tracking-widest mb-2">Sort</p>
          <div className="flex gap-1 p-1 bg-surface-background rounded-xl border border-surface-border">
            {(['newest', 'most_liked'] as SortVal[]).map((s) => (
              <button
                key={s}
                onClick={() => onSort(s)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-body font-semibold
                            transition-all ${
                  sortBy === s
                    ? 'bg-surface-card text-text-main shadow-sm'
                    : 'text-text-dim hover:text-text-muted'
                }`}
              >
                {s === 'newest' ? 'Newest' : 'Top'}
              </button>
            ))}
          </div>
        </div>
        <div className="cc-divider" />
        <div className="flex items-center justify-between">
          <p className="font-body text-xs text-text-muted">Total posts</p>
          <p className="font-display text-base font-700 text-text-main">{total}</p>
        </div>
      </div>

      {/* Your coin balance */}
      <div className="cc-card p-4 space-y-2"
           style={{ border: '1px solid rgba(57,255,20,0.18)' }}>
        <p className="font-display text-xs font-700 text-text-dim uppercase tracking-widest">
          Your Balance
        </p>
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-neon" />
          <span className="font-mono text-2xl font-700 text-neon"
                style={{ textShadow: '0 0 10px rgba(57,255,20,0.5)' }}>
            {balance.toLocaleString()}
          </span>
        </div>
        <p className="font-body text-xs text-text-dim">
          {user?.university}
        </p>
      </div>

      {/* Post types legend */}
      <div className="cc-card p-4 space-y-3">
        <p className="font-display text-xs font-700 text-text-dim uppercase tracking-widest">
          Post Types
        </p>
        <div className="space-y-2">
          {Object.entries(POST_TYPE_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-base">{cfg.emoji}</span>
              <div>
                <p className={`font-body text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── Flex page ────────────────────────────────────────────────────────────────

export default function Flex() {
  const [activeType,   setActiveType]   = useState<PostType | 'all'>('all');
  const [sortBy,       setSortBy]       = useState<SortVal>('newest');
  const [showComposer, setShowComposer] = useState(false); // mobile only

  const {
    posts, pagination, isLoading, isLoadingMore, error,
    applyFilters, loadNextPage, prependPost, updatePost, removePost,
  } = usePostFeed({ sortBy: 'newest' });

  const { toggleLike, addComment, deletePost } = usePostActions(updatePost, removePost);

  const { submit: submitPost, isLoading: isPosting } = useCreatePost((post) => {
    prependPost(post);
    setShowComposer(false);
  });

  const handleTabChange = (type: PostType | 'all') => {
    setActiveType(type);
    applyFilters({ type: type === 'all' ? undefined : type });
  };

  const handleSort = (s: SortVal) => {
    setSortBy(s);
    applyFilters({ sortBy: s });
  };

  return (
    <div className="min-h-full">
      <div className="content-wrap py-8">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-800 text-text-main">Flex</h1>
            <p className="font-body text-sm text-text-muted mt-1">
              Share wins, offer skills, connect with campus
            </p>
          </div>
          {/* Mobile: show post button */}
          <button onClick={() => setShowComposer(true)} className="lg:hidden btn-primary">
            <Sparkles size={15} /> Post
          </button>
        </div>

        {/* ── Filter tabs ──────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto scrollbar-none pb-1">
          {FILTER_TABS.map(({ value, emoji, label }) => (
            <button
              key={value}
              onClick={() => handleTabChange(value)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm
                          font-body font-medium border transition-all active:scale-95 ${
                activeType === value
                  ? 'border-primary bg-primary/15 text-primary-light'
                  : 'border-surface-border text-text-muted hover:border-surface-border/80'
              }`}
            >
              {emoji} {label}
            </button>
          ))}

          {/* Mobile: sort */}
          <div className="relative ml-auto lg:hidden shrink-0">
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as SortVal)}
              className="cc-input h-9 pr-7 text-xs appearance-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="most_liked">Most Liked</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
          </div>
        </div>

        {/* ── Two-col: feed + right panel ──────────────────────────── */}
        <div className="flex gap-7">

          {/* Feed column */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Desktop: inline composer */}
            <div className="hidden lg:block">
              <InlineComposer onSubmit={submitPost} isLoading={isPosting} />
            </div>

            {isLoading ? (
              <div className="space-y-4 animate-stagger">
                {Array.from({ length: 5 }).map((_, i) => <FeedPostSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="cc-card p-8 text-center space-y-3">
                <p className="font-body text-sm text-red-400">{error}</p>
                <button onClick={() => applyFilters({})} className="btn-ghost text-sm">Retry</button>
              </div>
            ) : posts.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="Nothing posted yet"
                description="Share a win, offer a skill, or just say something."
                action={<button onClick={() => setShowComposer(true)} className="btn-primary">Write a Post</button>}
              />
            ) : (
              <div className="space-y-4 animate-stagger">
                {posts.map((post) => (
                  <FeedPost
                    key={post._id}
                    post={post}
                    onLike={toggleLike}
                    onComment={addComment}
                    onDelete={deletePost}
                  />
                ))}
              </div>
            )}

            {pagination?.hasNextPage && (
              <button onClick={loadNextPage} disabled={isLoadingMore} className="w-full btn-ghost">
                {isLoadingMore
                  ? <><span className="w-4 h-4 border-2 border-surface-border border-t-primary-light rounded-full animate-spin" /> Loading…</>
                  : `Load more (${pagination.total - posts.length} remaining)`
                }
              </button>
            )}
          </div>

          {/* Right panel (desktop) */}
          <RightPanel total={pagination?.total ?? 0} sortBy={sortBy} onSort={handleSort} />
        </div>
      </div>

      {/* Mobile composer modal */}
      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden"
             onClick={(e) => e.target === e.currentTarget && setShowComposer(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowComposer(false)} />
          <div className="relative w-full bg-surface-card border-t border-surface-border
                          rounded-t-3xl p-5 space-y-4 animate-slide-up max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-700 text-text-main">New Post</h2>
              <button onClick={() => setShowComposer(false)} className="btn-ghost !px-2 !py-2">
                <X size={16} />
              </button>
            </div>
            <InlineComposer onSubmit={submitPost} isLoading={isPosting} />
          </div>
        </div>
      )}
    </div>
  );
}
