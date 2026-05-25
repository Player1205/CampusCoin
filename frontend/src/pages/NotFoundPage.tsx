import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
           style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <Compass size={36} style={{ color: 'var(--primary-lt)' }} strokeWidth={1.5} />
      </div>

      <div className="space-y-2">
        <h1 className="font-display text-5xl font-800" style={{ color: 'var(--primary-lt)' }}>404</h1>
        <p className="font-display text-xl font-700" style={{ color: 'var(--text)' }}>Page not found</p>
        <p className="font-body text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>
          This page doesn't exist on campus. Try heading back to the marketplace.
        </p>
      </div>

      <Link to="/home" className="btn-primary">
        Go Home
      </Link>
    </div>
  );
}
