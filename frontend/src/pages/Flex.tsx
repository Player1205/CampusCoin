import { useState, useRef } from 'react';
import { Sparkles, X, Image as ImageIcon, Send, ChevronDown } from 'lucide-react';
import FeedPost, { FeedPostSkeleton } from '@/features/flex/components/FeedPost';
import EmptyState from '@/components/ui/EmptyState';
import { usePostFeed, usePostActions, useCreatePost } from '@/features/flex/hooks/useFlex';
import { POST_TYPE_CONFIG } from '@/features/flex/types';
import type { PostType, CreatePostPayload } from '@/features/flex/types';
import { useAuthStore } from '@/store/useAuthStore';
import { useCoinStore, selectBalance } from '@/store/useCoinStore';
import toast from 'react-hot-toast';

type SortVal = 'newest' | 'most_liked';

const FILTER_TABS: { value: PostType | 'all'; emoji: string; label: string }[] = [
  { value: 'all',         emoji: '✨', label: 'All'       },
  { value: 'achievement', emoji: '🏆', label: 'Wins'      },
  { value: 'skill_offer', emoji: '💡', label: 'Skills'    },
  { value: 'shoutout',    emoji: '📣', label: 'Shoutouts' },
  { value: 'question',    emoji: '🤔', label: 'Questions' },
];

// ─── Image picker util ────────────────────────────────────────────────────────

function useImagePicker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image.'); return; }
    if (file.size > 10 * 1024 * 1024)   { toast.error('Image must be under 10 MB.'); return; }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const clear = () => { setPreview(null); setFileName(null); };

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleChange}
    />
  );

  return { input, preview, fileName, pick, clear };
}

// ─── Inline post composer ─────────────────────────────────────────────────────

function Composer({ onSubmit, isLoading }: {
  onSubmit: (p: CreatePostPayload) => Promise<any>; isLoading: boolean;
}) {
  const user                   = useAuthStore((s) => s.user);
  const [content, setContent]  = useState('');
  const [type,    setType]     = useState<PostType>('general');
  const [expanded, setExpanded] = useState(false);
  const { input: imgInput, preview, fileName, pick: pickImage, clear: clearImage } = useImagePicker();

  const POST_TYPES = Object.entries(POST_TYPE_CONFIG) as [PostType, typeof POST_TYPE_CONFIG[PostType]][];
  const canPost    = content.trim().length >= 3 && !isLoading;
  const charLeft   = 1000 - content.length;

  const handleSubmit = async () => {
    if (!canPost) return;
    await onSubmit({
      type,
      content: content.trim(),
      imageUrl: preview ?? undefined,
    });
    setContent('');
    setType('general');
    clearImage();
    setExpanded(false);
  };

  return (
    <div className="cc-card p-4 space-y-3">
      {imgInput}

      {/* Author + textarea */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 mt-0.5"
             style={{ border: '1px solid var(--border)' }}>
          {user?.avatarUrl
            ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"
                   style={{ background: 'rgba(124,58,237,0.2)' }}>
                <span className="font-display text-xs font-700" style={{ color: 'var(--primary-lt)' }}>
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
          }
        </div>
        <textarea
          onFocus={() => setExpanded(true)}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            type === 'achievement' ? "Share your win! 🏆" :
            type === 'skill_offer' ? "What skill are you offering? 💡" :
            type === 'shoutout'    ? "Give a shoutout 📣" :
            type === 'question'    ? "Ask your campus 🤔" :
                                     "What's on your mind? ✨"
          }
          rows={expanded ? 4 : 2}
          maxLength={1000}
          className="cc-input flex-1 resize-none text-sm"
          style={{ minHeight: expanded ? '100px' : '60px', transition: 'min-height 0.2s' }}
        />
      </div>

      {/* Expanded controls */}
      {expanded && (
        <div className="space-y-3 animate-fade-in pl-12">
          {/* Type selector */}
          <div className="flex flex-wrap gap-1.5">
            {POST_TYPES.map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => setType(key)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-body text-xs
                           font-medium border transition-all active:scale-95"
                style={{
                  background: type === key ? 'rgba(124,58,237,0.15)' : 'transparent',
                  borderColor: type === key ? 'rgba(124,58,237,0.35)' : 'var(--border)',
                  color: type === key ? 'var(--primary-lt)' : 'var(--text-dim)',
                }}
              >
                {cfg.emoji} {cfg.label}
              </button>
            ))}
          </div>

          {/* Image preview */}
          {preview && (
            <div className="relative inline-block animate-fade-in">
              <img
                src={preview}
                alt="preview"
                className="max-h-40 rounded-xl object-cover"
                style={{ border: '1px solid var(--border)' }}
              />
              <button
                onClick={clearImage}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center
                           justify-center transition-all active:scale-90"
                style={{ background: 'rgba(0,0,0,0.6)' }}
              >
                <X size={12} className="text-white" />
              </button>
              {fileName && (
                <p className="font-body text-[10px] mt-1" style={{ color: 'var(--text-dim)' }}>
                  {fileName}
                </p>
              )}
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Image upload button */}
              <button
                type="button"
                onClick={pickImage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-body text-xs
                           font-medium border transition-all active:scale-95"
                style={{
                  background: preview ? 'var(--accent-sub)' : 'transparent',
                  borderColor: preview
                    ? 'color-mix(in srgb, var(--accent) 30%, transparent)'
                    : 'var(--border)',
                  color: preview ? 'var(--accent)' : 'var(--text-dim)',
                }}
              >
                <ImageIcon size={13} />
                {preview ? 'Change image' : 'Add image'}
              </button>
              <span className="font-mono text-xs"
                    style={{ color: charLeft < 100 ? '#fbbf24' : 'var(--text-dim)' }}>
                {charLeft}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setExpanded(false); setContent(''); clearImage(); }}
                className="btn-ghost text-xs px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canPost}
                className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
              >
                {isLoading
                  ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Send size={13} /> Post</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Right panel ──────────────────────────────────────────────────────────────

function RightPanel({ total, sortBy, onSort }: {
  total: number; sortBy: SortVal; onSort: (s: SortVal) => void;
}) {
  const balance = useCoinStore(selectBalance);
  const user    = useAuthStore((s) => s.user);

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 gap-5">
      {/* Sort + count */}
      <div className="cc-card p-4 space-y-4">
        <div>
          <p className="font-display text-xs font-700 uppercase tracking-widest mb-2"
             style={{ color: 'var(--text-dim)' }}>Sort Feed</p>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            {(['newest', 'most_liked'] as SortVal[]).map((s) => (
              <button
                key={s}
                onClick={() => onSort(s)}
                className="flex-1 py-1.5 rounded-lg text-xs font-body font-semibold transition-all"
                style={{
                  background: sortBy === s ? 'var(--card)' : 'transparent',
                  color: sortBy === s ? 'var(--text)' : 'var(--text-dim)',
                  boxShadow: sortBy === s ? '0 1px 4px var(--shadow)' : 'none',
                }}
              >
                {s === 'newest' ? '🕐 Newest' : '🔥 Top'}
              </button>
            ))}
          </div>
        </div>
        <div className="cc-divider" />
        <div className="flex justify-between">
          <span className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>Total posts</span>
          <span className="font-display text-sm font-700" style={{ color: 'var(--text)' }}>{total}</span>
        </div>
      </div>

      {/* Coin */}
      <div className="cc-card p-4 space-y-2"
           style={{ border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' }}>
        <p className="font-display text-xs font-700 uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
          Your Balance
        </p>
        <div className="flex items-center gap-2">
          <Sparkles size={14} style={{ color: 'var(--accent)' }} />
          <span className="font-mono text-2xl font-700"
                style={{ color: 'var(--accent)', textShadow: '0 0 10px var(--accent-glow)' }}>
            {balance.toLocaleString()}
          </span>
        </div>
        <p className="font-body text-xs" style={{ color: 'var(--text-dim)' }}>{user?.university}</p>
      </div>

      {/* Post types */}
      <div className="cc-card p-4 space-y-3">
        <p className="font-display text-xs font-700 uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
          Post Types
        </p>
        {Object.entries(POST_TYPE_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-base">{cfg.emoji}</span>
            <div>
              <p className="font-body text-xs font-semibold" style={{ color: cfg.color as string }}>
                {cfg.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─── Flex page ────────────────────────────────────────────────────────────────

export default function Flex() {
  const [activeType,    setActiveType]    = useState<PostType | 'all'>('all');
  const [sortBy,        setSortBy]        = useState<SortVal>('newest');
  const [showMobileComposer, setShowMobileComposer] = useState(false);

  const {
    posts, pagination, isLoading, isLoadingMore, error,
    applyFilters, loadNextPage, prependPost, updatePost, removePost,
  } = usePostFeed({ sortBy: 'newest' });

  const { toggleLike, addComment, deletePost } = usePostActions(updatePost, removePost);

  const { submit: submitPost, isLoading: isPosting } = useCreatePost((post) => {
    prependPost(post);
    setShowMobileComposer(false);
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
      <div className="content-wrap py-6 lg:py-8">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-800" style={{ color: 'var(--text)' }}>
              Flex
            </h1>
            <p className="font-body text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Share wins, offer skills, connect with campus
            </p>
          </div>
          <button onClick={() => setShowMobileComposer(true)} className="lg:hidden btn-primary">
            <Sparkles size={14} /> Post
          </button>
        </div>

        {/* ── Filter tabs ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 mb-6">
          {FILTER_TABS.map(({ value, emoji, label }) => (
            <button
              key={value}
              onClick={() => handleTabChange(value)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-body
                         text-sm font-medium border transition-all active:scale-95"
              style={{
                background: activeType === value ? 'var(--primary)' : 'var(--card)',
                borderColor: activeType === value ? 'var(--primary)' : 'var(--border)',
                color: activeType === value ? '#fff' : 'var(--text-muted)',
                boxShadow: activeType === value ? '0 0 12px rgba(124,58,237,0.35)' : 'none',
              }}
            >
              {emoji} {label}
            </button>
          ))}

          {/* Mobile sort */}
          <div className="relative ml-auto lg:hidden shrink-0">
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as SortVal)}
              className="cc-input h-9 pr-7 text-xs appearance-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="most_liked">Most Liked</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                         style={{ color: 'var(--text-dim)' }} />
          </div>
        </div>

        {/* ── Two-col: feed + right panel ──────────────────────────── */}
        <div className="flex gap-7">

          {/* Feed */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Desktop inline composer */}
            <div className="hidden lg:block">
              <Composer onSubmit={submitPost} isLoading={isPosting} />
            </div>

            {isLoading ? (
              <div className="space-y-4 animate-stagger">
                {Array.from({ length: 4 }).map((_, i) => <FeedPostSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="cc-card p-8 text-center">
                <p className="font-body text-sm" style={{ color: '#f87171' }}>{error}</p>
                <button onClick={() => applyFilters({})} className="btn-ghost mt-4 text-sm">Retry</button>
              </div>
            ) : posts.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="Nothing posted yet"
                description={
                  activeType !== 'all'
                    ? `No ${POST_TYPE_CONFIG[activeType as PostType]?.label} posts yet.`
                    : 'Share a win, offer a skill, or just say something.'
                }
                action={
                  <button onClick={() => setShowMobileComposer(true)} className="btn-primary">
                    Write a Post
                  </button>
                }
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
              <button
                onClick={loadNextPage}
                disabled={isLoadingMore}
                className="w-full btn-ghost flex items-center justify-center gap-2"
              >
                {isLoadingMore
                  ? <><span className="w-4 h-4 border-2 rounded-full animate-spin"
                            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary-lt)' }} />
                    Loading…</>
                  : `Load more (${pagination.total - posts.length} remaining)`
                }
              </button>
            )}
          </div>

          <RightPanel total={pagination?.total ?? 0} sortBy={sortBy} onSort={handleSort} />
        </div>
      </div>

      {/* Mobile composer modal */}
      {showMobileComposer && (
        <div
          className="fixed inset-0 z-50 flex items-end lg:hidden"
          onClick={(e) => e.target === e.currentTarget && setShowMobileComposer(false)}
        >
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'var(--overlay)' }}
            onClick={() => setShowMobileComposer(false)}
          />
          <div
            className="relative w-full rounded-t-3xl p-5 space-y-4 animate-slide-up
                       max-h-[92dvh] overflow-y-auto"
            style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-700" style={{ color: 'var(--text)' }}>New Post</h2>
              <button onClick={() => setShowMobileComposer(false)} className="btn-ghost !px-2 !py-2">
                <X size={16} />
              </button>
            </div>
            <Composer onSubmit={submitPost} isLoading={isPosting} />
          </div>
        </div>
      )}
    </div>
  );
}
