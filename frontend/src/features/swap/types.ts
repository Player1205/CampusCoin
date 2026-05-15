// ─── Enums ────────────────────────────────────────────────────────────────────

export type TaskCategory =
  | 'tutoring'
  | 'design'
  | 'coding'
  | 'writing'
  | 'errands'
  | 'notes'
  | 'photography'
  | 'other';

export type TaskUrgency = 'low' | 'medium' | 'high';

export type TaskStatus =
  | 'open'
  | 'in_progress'
  | 'submitted'
  | 'completed'
  | 'cancelled'
  | 'disputed';

// ─── Sub-documents ────────────────────────────────────────────────────────────

export interface TaskPoster {
  _id: string;
  name: string;
  avatarUrl?: string;
  university: string;
}

export interface TaskApplication {
  _id: string;
  applicant: {
    _id: string;
    name: string;
    avatarUrl?: string;
    skills: string[];
  };
  message: string;
  appliedAt: string;
  isWithdrawn: boolean;
}

// ─── Core Task ────────────────────────────────────────────────────────────────

export interface Task {
  _id: string;
  title: string;
  description: string;
  category: TaskCategory;
  urgency: TaskUrgency;
  coinReward: number;
  poster: TaskPoster;
  doer?: TaskPoster;
  status: TaskStatus;
  deadline?: string;
  tags: string[];
  applications: TaskApplication[];
  submissionNote?: string;
  completionNote?: string;
  university: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface CreateTaskPayload {
  title: string;
  description: string;
  category: TaskCategory;
  urgency?: TaskUrgency;
  coinReward: number;
  deadline?: string;
  tags?: string[];
}

export interface ApplyToTaskPayload {
  message: string;
}

export interface SubmitTaskPayload {
  submissionNote: string;
}

export interface CompleteTaskPayload {
  completionNote?: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  category?: TaskCategory;
  urgency?: TaskUrgency;
  minReward?: number;
  maxReward?: number;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'reward_high' | 'reward_low';
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedTasks {
  data: Task[];
  pagination: PaginationMeta;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  tutoring:    'Tutoring',
  design:      'Design',
  coding:      'Coding',
  writing:     'Writing',
  errands:     'Errands',
  notes:       'Notes',
  photography: 'Photography',
  other:       'Other',
};

export const CATEGORY_EMOJI: Record<TaskCategory, string> = {
  tutoring:    '📚',
  design:      '🎨',
  coding:      '💻',
  writing:     '✍️',
  errands:     '🏃',
  notes:       '📝',
  photography: '📷',
  other:       '⚡',
};

export const URGENCY_CONFIG: Record<TaskUrgency, { label: string; color: string; dot: string }> = {
  low:    { label: 'Low',    color: 'text-emerald-400', dot: 'bg-emerald-400' },
  medium: { label: 'Medium', color: 'text-amber-400',   dot: 'bg-amber-400' },
  high:   { label: 'High',   color: 'text-red-400',     dot: 'bg-red-400' },
};
