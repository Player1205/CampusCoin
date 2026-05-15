/**
 * Returns a human-readable relative time string.
 * e.g. "2 minutes ago", "3 days ago", "just now"
 */
export function formatDistanceToNow(date: Date): string {
  const now  = Date.now();
  const diff = now - date.getTime(); // ms

  if (diff < 0)        return 'soon';
  if (diff < 60_000)   return 'just now';
  if (diff < 3_600_000) {
    const m = Math.floor(diff / 60_000);
    return `${m}m ago`;
  }
  if (diff < 86_400_000) {
    const h = Math.floor(diff / 3_600_000);
    return `${h}h ago`;
  }
  if (diff < 604_800_000) {
    const d = Math.floor(diff / 86_400_000);
    return `${d}d ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Returns a deadline label: "in 2h", "tomorrow", "in 3d", or "overdue"
 */
export function formatDeadline(date: Date): { label: string; isOverdue: boolean; isUrgent: boolean } {
  const diff = date.getTime() - Date.now();

  if (diff < 0)              return { label: 'Overdue', isOverdue: true, isUrgent: false };
  if (diff < 3_600_000)     return { label: `in ${Math.floor(diff / 60_000)}m`, isOverdue: false, isUrgent: true };
  if (diff < 86_400_000)    return { label: `in ${Math.floor(diff / 3_600_000)}h`, isOverdue: false, isUrgent: true };
  if (diff < 172_800_000)   return { label: 'tomorrow', isOverdue: false, isUrgent: false };
  return { label: `in ${Math.floor(diff / 86_400_000)}d`, isOverdue: false, isUrgent: false };
}

/** Format a number as a compact coin value: 1200 → "1.2k" */
export function formatCoins(n: number): string {
  if (n >= 1_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}
