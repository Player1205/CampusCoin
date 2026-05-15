export type PostType = 'achievement' | 'skill_offer' | 'shoutout' | 'question' | 'general';

export interface PostAuthor {
  _id: string;
  name: string;
  avatarUrl?: string;
  university: string;
  department?: string;
}

export interface PostComment {
  _id: string;
  author: PostAuthor;
  content: string;
  likes: string[];
  createdAt: string;
}

export interface Post {
  _id: string;
  author: PostAuthor;
  type: PostType;
  content: string;
  imageUrl?: string;
  likes: string[];
  comments: PostComment[];
  taggedUsers: PostAuthor[];
  university: string;
  isPinned: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostPayload {
  type?: PostType;
  content: string;
  imageUrl?: string;
  taggedUsers?: string[];
}

export interface PostFilters {
  page?: number;
  limit?: number;
  type?: PostType;
  authorId?: string;
  sortBy?: 'newest' | 'oldest' | 'most_liked';
}

export interface PaginatedPosts {
  data: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const POST_TYPE_CONFIG: Record<PostType, { label: string; emoji: string; color: string }> = {
  achievement: { label: 'Achievement', emoji: '🏆', color: 'text-amber-400' },
  skill_offer: { label: 'Skill Offer',  emoji: '💡', color: 'text-primary-light' },
  shoutout:    { label: 'Shoutout',     emoji: '📣', color: 'text-neon' },
  question:    { label: 'Question',     emoji: '🤔', color: 'text-sky-400' },
  general:     { label: 'General',      emoji: '💬', color: 'text-text-muted' },
};
