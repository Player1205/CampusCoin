import { useState, useRef, type FormEvent } from 'react';
import { Heart, MessageCircle, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import type { Post } from '../types';
import { POST_TYPE_CONFIG } from '../types';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDistanceToNow } from '@/utils/time';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function FeedPostSkeleton() {
  return (
    <div className="cc-card p-4 space-y-3.5">
      <div className="flex items-start gap-3">
        <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-32 rounded-lg" />
          <div className="skeleton h-3 w-20 rounded-lg" />
        </div>
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3.5 w-full rounded-lg" />
        <div className="skeleton h-3.5 w-5/6 rounded-lg" />
        <div className="skeleton h-3.5 w-4/6 rounded-lg" />
      </div>
      <div className="flex gap-4 pt-1">
        <div className="skeleton h-7 w-16 rounded-lg" />
        <div className="skeleton h-7 w-20 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, url, size = 'md' }: { name: string; url?: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
  const font = size === 'sm' ? 'text-[11px]' : 'text-sm';
  return (
    <div className={`${dim} rounded-xl overflow-hidden shrink-0 border border-surface-border`}>
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-primary/20">
          <span className={`font-display font-700 ${font} text-primary-light`}>
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Comment row ──────────────────────────────────────────────────────────────

interface CommentProps {
  comment: Post['comments'][0];
  currentUserId?: string;
  postAuthorId: string;
}

function Comment({ comment, currentUserId, postAuthorId }: CommentProps) {
  const canDelete = currentUserId === comment.author._id || currentUserId === postAuthorId;

  return (
    <div className="flex items-start gap-2.5 group">
      <Avatar name={comment.author.name} url={comment.author.avatarUrl} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="bg-surface-background rounded-xl rounded-tl-sm px-3 py-2.5">
          <p className="font-body text-xs font-semibold text-text-muted mb-0.5">
            {comment.author.name}
          </p>
          <p className="font-body text-sm text-text-main leading-snug">{comment.content}</p>
        </div>
        <p className="font-body text-[10px] text-text-dim mt-1 ml-2">
          {formatDistanceToNow(new Date(comment.createdAt))}
        </p>
      </div>
      {canDelete && (
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5
                           text-text-dim hover:text-red-400 mt-1"
                aria-label="Delete comment">
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

// ─── FeedPost ─────────────────────────────────────────────────────────────────

interface FeedPostProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => Promise<void>;
  onDelete?: (postId: string) => void;
}

export default function FeedPost({ post, onLike, onComment, onDelete }: FeedPostProps) {
  const currentUser = useAuthStore((s) => s.user);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText]   = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const typeConfig   = POST_TYPE_CONFIG[post.type];
  const hasLiked     = currentUser ? post.likes.includes(currentUser._id) : false;
  const isAuthor     = currentUser?._id === post.author._id;
  const likesCount   = post.likes.length;
  const commentCount = post.comments.length;
  const timeAgo      = formatDistanceToNow(new Date(post.createdAt));

  const handleComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsCommenting(true);
    try {
      await onComment(post._id, commentText.trim());
      setCommentText('');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleLike = () => onLike(post._id);

  return (
    <article className="cc-card p-4 space-y-3.5 animate-fade-in">

      {/* ── Pinned banner ────────────────────────────────────────────── */}
      {post.isPinned && (
        <div className="flex items-center gap-1.5 -mb-1">
          <div className="h-px flex-1 bg-primary/20" />
          <span className="font-body text-[10px] text-primary-light font-semibold uppercase tracking-widest">
            📌 Pinned
          </span>
          <div className="h-px flex-1 bg-primary/20" />
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <Avatar name={post.author.name} url={post.author.avatarUrl} />

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-display text-sm font-700 text-text-main">
              {post.author.name}
            </span>
            {post.author.department && (
              <span className="font-body text-xs text-text-dim truncate">
                · {post.author.department}
              </span>
            )}
          </div>
          <p className="font-body text-[11px] text-text-dim mt-0.5">{timeAgo}</p>
        </div>

        {/* Type badge */}
        <span className={`inline-flex items-center gap-1 cc-tag ${typeConfig.color}
                          border-current/20 bg-current/5 shrink-0`}>
          <span className="text-[12px]">{typeConfig.emoji}</span>
          <span className="text-[10px]">{typeConfig.label}</span>
        </span>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <p className="font-body text-sm text-text-main leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {/* ── Image ────────────────────────────────────────────────────── */}
      {post.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-surface-border
                        max-h-72 bg-surface-background">
          <img src={post.imageUrl} alt="Post attachment"
               className="w-full h-full object-cover" />
        </div>
      )}

      {/* ── Tagged users ─────────────────────────────────────────────── */}
      {post.taggedUsers.length > 0 && (
        <p className="font-body text-xs text-primary-light">
          {post.taggedUsers.map((u) => `@${u.name}`).join(' ')}
        </p>
      )}

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 pt-0.5 border-t border-surface-border/50">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body
                      font-medium transition-all duration-200 active:scale-95 ${
            hasLiked
              ? 'text-red-400 bg-red-400/10'
              : 'text-text-dim hover:text-red-400 hover:bg-red-400/10'
          }`}
          aria-label={hasLiked ? 'Unlike' : 'Like'}
        >
          <Heart
            size={14}
            className="transition-transform duration-150 active:scale-125"
            fill={hasLiked ? 'currentColor' : 'none'}
          />
          <span>{likesCount > 0 ? likesCount : 'Like'}</span>
        </button>

        {/* Comment toggle */}
        <button
          onClick={() => {
            setShowComments((s) => !s);
            if (!showComments) setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body
                     font-medium text-text-dim hover:text-primary-light hover:bg-primary/10
                     transition-all duration-200 active:scale-95"
          aria-label="Toggle comments"
        >
          <MessageCircle size={14} />
          <span>{commentCount > 0 ? commentCount : 'Comment'}</span>
          {commentCount > 0 && (
            showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />
          )}
        </button>

        {/* Delete (author only) */}
        {isAuthor && onDelete && (
          <button
            onClick={() => onDelete(post._id)}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs
                       text-text-dim hover:text-red-400 hover:bg-red-400/10
                       transition-all duration-200 active:scale-95"
            aria-label="Delete post"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* ── Comments section ─────────────────────────────────────────── */}
      {showComments && (
        <div className="space-y-3 pt-1 border-t border-surface-border/50">
          {post.comments.length === 0 ? (
            <p className="font-body text-xs text-text-dim text-center py-3">
              No comments yet. Be the first!
            </p>
          ) : (
            <div className="space-y-3">
              {post.comments.map((c) => (
                <Comment
                  key={c._id}
                  comment={c}
                  currentUserId={currentUser?._id}
                  postAuthorId={post.author._id}
                />
              ))}
            </div>
          )}

          {/* Comment input */}
          <form onSubmit={handleComment} className="flex items-center gap-2">
            <Avatar
              name={currentUser?.name ?? '?'}
              url={currentUser?.avatarUrl}
              size="sm"
            />
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment…"
                className="cc-input pr-10 py-2 text-sm"
                maxLength={500}
                disabled={isCommenting}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isCommenting}
                className="absolute right-2.5 top-1/2 -translate-y-1/2
                           text-primary-light disabled:text-text-dim
                           transition-colors duration-150 active:scale-90"
                aria-label="Send comment"
              >
                {isCommenting ? (
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary-light
                                   rounded-full animate-spin block" />
                ) : (
                  <Send size={15} />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
