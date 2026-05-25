import api, { unwrap } from '@/lib/api';
import type { Post, PaginatedPosts, PostFilters, CreatePostPayload } from '../types';

export const fetchPosts = async (filters: PostFilters = {}): Promise<PaginatedPosts> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)); });
  const res = await api.get(`/flex/posts?${params.toString()}`);
  return unwrap<PaginatedPosts>(res);
};

export const fetchPostById = async (id: string): Promise<Post> => {
  const res = await api.get(`/flex/posts/${id}`);
  return unwrap<{ post: Post }>(res).post;
};

export const createPost = async (payload: CreatePostPayload): Promise<Post> => {
  const res = await api.post('/flex/posts', payload);
  return unwrap<{ post: Post }>(res).post;
};

export const updatePost = async (id: string, payload: Partial<CreatePostPayload>): Promise<Post> => {
  const res = await api.patch(`/flex/posts/${id}`, payload);
  return unwrap<{ post: Post }>(res).post;
};

export const deletePost = async (id: string): Promise<void> => {
  await api.delete(`/flex/posts/${id}`);
};

export const toggleLike = async (id: string): Promise<{ liked: boolean; likesCount: number; coinAwarded?: boolean }> => {
  const res = await api.post(`/flex/posts/${id}/like`);
  return unwrap<{ liked: boolean; likesCount: number; coinAwarded?: boolean }>(res);
};

export const addComment = async (id: string, content: string): Promise<Post> => {
  const res = await api.post(`/flex/posts/${id}/comments`, { content });
  return unwrap<{ post: Post }>(res).post;
};

export const deleteComment = async (postId: string, commentId: string): Promise<Post> => {
  const res = await api.delete(`/flex/posts/${postId}/comments/${commentId}`);
  return unwrap<{ post: Post }>(res).post;
};

export const toggleCommentLike = async (postId: string, commentId: string) => {
  const res = await api.post(`/flex/posts/${postId}/comments/${commentId}/like`);
  return unwrap<{ liked: boolean; likesCount: number }>(res);
};
