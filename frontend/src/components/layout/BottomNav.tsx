import { useLocation, Link } from 'react-router-dom';
import { Home, ListTodo, Sparkles, MessageCircle, User } from 'lucide-react';
import { useChatList } from '@/features/chat/hooks/useChat';
import { useAuthStore } from '@/store/useAuthStore';

const NAV = [
  { path: '/home',    label: 'Home',    icon: Home,          accent: '#A78BFA' },
  { path: '/tasks',   label: 'Tasks',   icon: ListTodo,      accent: '#7C3AED' },
  { path: '/flex',    label: 'Flex',    icon: Sparkles,      accent: 'var(--accent)' },
  { path: '/chats',   label: 'Chats',   icon: MessageCircle, accent: '#F97316' },
  { path: '/profile', label: 'Profile', icon: User,          accent: '#A78BFA' },
];

export default function BottomNav() {
  const { pathname }   = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { chats }      = useChatList();
  const unreadCount    = chats.length; // simplification — show total count

  const isActive = (p: string) => pathname === p || pathname.startsWith(p + '/');

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden"
         style={{ paddingBottom: 'var(--safe-bottom)' }}>
      <div className="absolute inset-0 border-t glass" style={{ borderColor: 'var(--border)' }} />

      <div className="relative flex items-center justify-around px-1"
           style={{ height: 'var(--bottomnav-h)' }}>
        {NAV.map(({ path, label, icon: Icon, accent }) => {
          const active  = isActive(path);
          const showBadge = path === '/chats' && unreadCount > 0 && !active;

          return (
            <Link
              key={path}
              to={path}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full
                         transition-transform duration-150 active:scale-90"
            >
              {active && (
                <span
                  className="absolute top-0 h-0.5 w-7 rounded-full"
                  style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
                />
              )}

              <div
                className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
                style={active ? { background: `color-mix(in srgb, ${accent} 15%, transparent)` } : {}}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.2 : 1.8}
                  style={{
                    color: active ? accent : 'var(--text-dim)',
                    filter: active ? `drop-shadow(0 0 4px ${accent}80)` : 'none',
                    transition: 'color 0.2s, filter 0.2s',
                  }}
                />
                {showBadge && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full
                               flex items-center justify-center text-[9px] font-bold text-white px-1"
                    style={{ background: '#F97316' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>

              <span
                className="text-[9px] font-body font-semibold tracking-wide"
                style={{ color: active ? accent : 'var(--text-dim)' }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
