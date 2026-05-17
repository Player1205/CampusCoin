import { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCoinStore, selectBalance, selectIsAnimating } from '@/store/useCoinStore';
import ThemeToggle from '@/components/ui/ThemeToggle';

const PAGE_TITLES: Record<string, string> = {
  '/home':    'Home',
  '/tasks':   'Tasks',
  '/flex':    'Flex',
  '/chats':   'Chats',
  '/profile': 'Profile',
};

function CoinBalance() {
  const balance     = useCoinStore(selectBalance);
  const isAnimating = useCoinStore(selectIsAnimating);
  const prevRef     = useRef(balance);
  if (balance !== prevRef.current) prevRef.current = balance;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300"
         style={{
           background:   isAnimating ? 'var(--accent-sub)' : 'var(--card)',
           borderColor:  isAnimating ? 'var(--accent)'     : 'var(--border)',
           boxShadow:    isAnimating ? '0 0 10px var(--accent-glow)' : 'none',
         }}>
      <div className="w-5 h-5 rounded-full flex items-center justify-center"
           style={{ background: 'var(--accent-sub)' }}>
        <Zap size={11} style={{ color: 'var(--accent)' }} fill="currentColor" strokeWidth={0} />
      </div>
      <span className="font-mono text-sm font-700 tabular-nums"
            style={{ color: 'var(--accent)', textShadow: isAnimating ? '0 0 8px var(--accent-glow)' : 'none' }}>
        {balance.toLocaleString()}
      </span>
    </div>
  );
}

export default function TopBar() {
  const user     = useAuthStore((s) => s.user);
  const location = useLocation();
  const title    = PAGE_TITLES[location.pathname] ?? 'CampusCoin';

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 lg:hidden"
      style={{ height: 'var(--topbar-h)' }}
    >
      <div className="absolute inset-0 border-b glass" style={{ borderColor: 'var(--border)' }} />

      <div className="relative flex items-center gap-2.5">
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
               style={{ background: 'var(--primary)', boxShadow: '0 0 10px rgba(124,58,237,0.45)' }}>
            <span className="font-display text-xs font-800 text-white leading-none">CC</span>
          </div>
          <span className="font-display text-base font-700" style={{ color: 'var(--text)' }}>{title}</span>
        </Link>
      </div>

      <div className="relative flex items-center gap-2">
        <CoinBalance />
        <ThemeToggle />
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors active:scale-90"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                aria-label="Notifications">
          <Bell size={15} style={{ color: 'var(--text-muted)' }} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--accent)', boxShadow: '0 0 4px var(--accent-glow)' }} />
        </button>
        {user && (
          <Link to="/profile" className="w-9 h-9 rounded-xl overflow-hidden transition-all active:scale-90"
                style={{ border: '1px solid var(--border)' }}>
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"
                     style={{ background: 'rgba(124,58,237,0.2)' }}>
                  <span className="font-display text-sm font-700" style={{ color: 'var(--primary-lt)' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
            }
          </Link>
        )}
      </div>
    </header>
  );
}
