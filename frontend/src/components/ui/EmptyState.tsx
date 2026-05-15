import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center
                  py-16 px-8 space-y-4 animate-fade-in ${className}`}
    >
      {/* Icon ring */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-surface-card border border-surface-border
                        flex items-center justify-center">
          <Icon size={28} className="text-text-dim" strokeWidth={1.5} />
        </div>
        {/* Subtle corner accent */}
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary/30
                        border border-primary/50" />
      </div>

      <div className="space-y-1.5 max-w-[240px]">
        <p className="font-display text-base font-700 text-text-main">{title}</p>
        {description && (
          <p className="font-body text-sm text-text-muted leading-relaxed">{description}</p>
        )}
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
