import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-surface-card border border-surface-border
                      flex items-center justify-center">
        <Compass size={36} className="text-primary-light" strokeWidth={1.5} />
      </div>

      <div className="space-y-2">
        <h1 className="font-display text-5xl font-800 text-primary-light">404</h1>
        <p className="font-display text-xl font-700 text-text-main">Page not found</p>
        <p className="font-body text-sm text-text-muted max-w-xs">
          This page doesn't exist on campus. Try heading back to the marketplace.
        </p>
      </div>

      <Link to="/swap" className="btn-primary">
        Go to Swap
      </Link>
    </div>
  );
}
