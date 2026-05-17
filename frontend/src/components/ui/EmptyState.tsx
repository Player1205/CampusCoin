import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-8 space-y-4 animate-fade-in ${className}`}>
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
             style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <Icon size={28} style={{ color: 'var(--text-dim)' }} strokeWidth={1.5} />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
             style={{ background: 'rgba(124,58,237,0.4)', border: '1px solid rgba(124,58,237,0.6)' }} />
      </div>
      <div className="space-y-1.5 max-w-[240px]">
        <p className="font-display text-base font-700" style={{ color: 'var(--text)' }}>{title}</p>
        {description && (
          <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
