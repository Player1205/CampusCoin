import { useState, useEffect, useCallback, useRef } from 'react';
import * as flexApi from '../services/flex.api';
import type { Post, PostFilters, PaginatedPosts, CreatePostPayload } from '../types';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

// ─── usePostFeed ──────────────────────────────────────────────────────────────

export function usePostFeed(initialFilters: PostFilters = {}) {
  const [posts, setPosts]           = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginatedPosts['pagination'] | null>(null);
  const [filters, setFilters]       = useState<PostFilters>({ page: 1, limit: 20, ...initialFilters });
  const [isLoading, setIsLoading]   = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const abortRef                    = useRef<AbortController | null>(null);

  const load = useCallback(async (f: PostFilters, append = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    append ? setIsLoadingMore(true) : setIsLoading(true);
    setError(null);
    try {
      const result = await flexApi.fetchPosts(f);
      setPosts((prev) => append ? [...prev, ...result.data] : result.data);
      setPagination(result.pagination);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') setError(err.message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void load(filters);
    return () => abortRef.current?.abort();
  }, [filters, load]);

  const applyFilters = useCallback((next: Partial<PostFilters>) => {
    setFilters((prev) => ({ ...prev, ...next, page: 1 }));
  }, []);

  const loadNextPage = useCallback(() => {
    if (!pagination?.hasNextPage || isLoadingMore) return;
    const next = { ...filters, page: (filters.page ?? 1) + 1 };
    setFilters(next);
    void load(next, true);
  }, [filters, pagination, isLoadingMore, load]);

  /** Optimistically prepend a new post to the feed */
  const prependPost = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  /** Optimistically update a post in place */
  const updatePost = useCallback((postId: string, updater: (p: Post) => Post) => {
    setPosts((prev) => prev.map((p) => p._id === postId ? updater(p) : p));
  }, []);

  /** Remove a post from local state */
  const removePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  }, []);

  return {
    posts, pagination, filters,
    isLoading, isLoadingMore, error,
    applyFilters, loadNextPage, prependPost, updatePost, removePost,
  };
}

// ─── usePostActions ───────────────────────────────────────────────────────────

export function usePostActions(
  updatePost: (id: string, fn: (p: Post) => Post) => void,
  removePost?: (id: string) => void,
) {
  const currentUser = useAuthStore((s) => s.user);

  const toggleLike = useCallback(async (postId: string) => {
    if (!currentUser) return;
    const userId = currentUser._id;

    let prevPost: Post | undefined;

    // Optimistic update
    updatePost(postId, (p) => {
      prevPost = p;
      const hasLiked = p.likes.includes(userId);
      return {
        ...p,
        likes: hasLiked
          ? p.likes.filter((id) => id !== userId)
          : [...p.likes, userId],
      };
    });

    try {
      await flexApi.toggleLike(postId);
    } catch {
      // Revert to exact previous state
      if (prevPost) {
        updatePost(postId, () => prevPost!);
      }
      toast.error('Could not update like.');
    }
  }, [currentUser, updatePost]);

  const addComment = useCallback(async (postId: string, content: string) => {
    try {
      const updated = await flexApi.addComment(postId, content);
      updatePost(postId, () => updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add comment.');
      throw err;
    }
  }, [updatePost]);

  const deletePost = useCallback(async (postId: string) => {
    try {
      await flexApi.deletePost(postId);
      removePost?.(postId);
      toast.success('Post deleted.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete post.');
    }
  }, [removePost]);

  return { toggleLike, addComment, deletePost };
}

// ─── useCreatePost ────────────────────────────────────────────────────────────

export function useCreatePost(onSuccess?: (post: Post) => void) {
  const [isLoading, setIsLoading] = useState(false);

  const submit = useCallback(async (payload: CreatePostPayload) => {
    setIsLoading(true);
    try {
      const post = await flexApi.createPost(payload);
      toast.success('Posted to Flex! 🎉');
      onSuccess?.(post);
      return post;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess]);

  return { submit, isLoading };
}
