import { useLocation, Link } from 'react-router-dom';
import { Home, ListTodo, Sparkles, User } from 'lucide-react';

const NAV = [
  { path: '/home',    label: 'Home',    icon: Home,      accent: '#A78BFA' },
  { path: '/tasks',   label: 'Tasks',   icon: ListTodo,  accent: '#7C3AED' },
  { path: '/flex',    label: 'Flex',    icon: Sparkles,  accent: '#39FF14' },
  { path: '/profile', label: 'Profile', icon: User,      accent: '#A78BFA' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const isActive = (p: string) => pathname === p || pathname.startsWith(p + '/');

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden"
         style={{ paddingBottom: 'var(--safe-bottom)' }}>
      <div className="absolute inset-0 border-t glass" style={{ borderColor: 'var(--border)' }} />

      <div className="relative flex items-center justify-around px-2"
           style={{ height: 'var(--bottomnav-h)' }}>
        {NAV.map(({ path, label, icon: Icon, accent }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full
                         transition-transform duration-150 active:scale-90"
            >
              {/* Active top pip */}
              {active && (
                <span
                  className="absolute top-0 h-0.5 w-8 rounded-full"
                  style={{
                    background: accent,
                    boxShadow: `0 0 6px ${accent}`,
                    animation: 'nav-pip 0.2s ease-out forwards',
                  }}
                />
              )}

              {/* Icon ring */}
              <div
                className="flex items-center justify-center w-10 h-10 rounded-2xl
                           transition-all duration-200"
                style={active ? {
                  background: `${accent}18`,
                  boxShadow: `0 0 10px ${accent}25`,
                } : {}}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.2 : 1.8}
                  style={{
                    color: active ? accent : 'var(--text-dim)',
                    filter: active ? `drop-shadow(0 0 4px ${accent}80)` : 'none',
                    transition: 'color 0.2s, filter 0.2s',
                  }}
                />
              </div>

              <span
                className="text-[10px] font-body font-semibold tracking-wide"
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
