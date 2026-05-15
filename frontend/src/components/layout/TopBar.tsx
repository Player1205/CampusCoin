import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCoinStore, selectBalance, selectIsAnimating } from '@/store/useCoinStore';

// ─── Coin display component ───────────────────────────────────────────────────

function CoinBalance() {
  const balance = useCoinStore(selectBalance);
  const isAnimating = useCoinStore(selectIsAnimating);
  const prevRef = useRef(balance);
  const direction = balance > prevRef.current ? 'up' : 'down';

  useEffect(() => {
    prevRef.current = balance;
  }, [balance]);

  return (
    <div
      className={[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300',
        isAnimating
          ? 'border-neon shadow-neon-sm bg-neon/5'
          : 'border-surface-border bg-surface-card',
      ].join(' ')}
      aria-label={`CampusCoin balance: ${balance}`}
    >
      {/* Neon coin icon */}
      <div
        className={[
          'w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300',
          isAnimating ? 'shadow-neon-sm' : '',
        ].join(' ')}
        style={{ background: isAnimating ? '#39FF14' : 'rgba(57,255,20,0.15)' }}
      >
        <Zap
          size={11}
          className={isAnimating ? 'text-surface-background' : 'text-neon'}
          fill="currentColor"
          strokeWidth={0}
        />
      </div>

      {/* Balance number */}
      <span
        className={[
          'font-mono text-sm font-semibold tabular-nums transition-all duration-300',
          isAnimating
            ? direction === 'up'
              ? 'text-neon text-neon-glow'
              : 'text-red-400'
            : 'text-neon',
        ].join(' ')}
      >
        {balance.toLocaleString()}
      </span>
    </div>
  );
}

// ─── Page title map ───────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  '/swap':    'Swap',
  '/flex':    'Flex',
  '/profile': 'Profile',
  '/':        'Home',
};

function usePageTitle() {
  const { pathname } = useLocation();
  const matched = Object.entries(PAGE_TITLES).find(([path]) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  );
  return matched?.[1] ?? 'CampusCoin';
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

export default function TopBar() {
  const user = useAuthStore((s) => s.user);
  const title = usePageTitle();

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4"
      style={{ height: 'var(--topbar-h)' }}
    >
      {/* Frosted glass backdrop */}
      <div
        className="absolute inset-0 border-b border-surface-border/60"
        style={{
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />

      {/* Left: Logo or page title */}
      <div className="relative flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          {/* CC logo mark */}
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-violet">
            <span className="font-display text-xs font-800 text-white leading-none">CC</span>
          </div>
          <span className="font-display text-base font-700 text-text-main tracking-tight hidden xs:block">
            {title}
          </span>
        </Link>
      </div>

      {/* Right: Balance + Notifications */}
      <div className="relative flex items-center gap-2">
        <CoinBalance />

        {/* Notification bell */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center
                     bg-surface-card border border-surface-border
                     hover:border-primary-light transition-colors duration-200
                     active:scale-95"
          aria-label="Notifications"
        >
          <Bell size={16} className="text-text-muted" />
          {/* Unread dot (always visible for now — wire up to notification store later) */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-neon shadow-neon-sm" />
        </button>

        {/* Avatar */}
        {user && (
          <Link
            to="/profile"
            className="w-9 h-9 rounded-xl overflow-hidden border border-surface-border
                       hover:border-primary-light transition-colors duration-200 active:scale-95"
            aria-label="Go to profile"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/20">
                <span className="font-display text-sm font-700 text-primary-light">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
