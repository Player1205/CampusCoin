// Profile feature types — extend as needed for Part 5 (profile editing API)

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  department?: string;
  skills?: string[];
  avatarUrl?: string;
}

export interface UserStats {
  tasksPosted:    number;
  tasksCompleted: number;
  tasksEarned:    number;  // total coins earned
  tasksSpent:     number;  // total coins spent
  rating?:        number;
}
