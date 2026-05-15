import { useLocation, Link } from 'react-router-dom';
import { ArrowLeftRight, Sparkles, User } from 'lucide-react';

// ─── Nav items ────────────────────────────────────────────────────────────────

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  accentColor: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    path: '/swap',
    label: 'Swap',
    icon: ArrowLeftRight,
    accentColor: '#7C3AED', // primary violet
  },
  {
    path: '/flex',
    label: 'Flex',
    icon: Sparkles,
    accentColor: '#39FF14', // neon green
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: User,
    accentColor: '#A78BFA', // soft purple
  },
];

// ─── BottomNav ────────────────────────────────────────────────────────────────

export default function BottomNav() {
  const { pathname } = useLocation();

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
      aria-label="Main navigation"
    >
      {/* Frosted glass backdrop */}
      <div
        className="absolute inset-0 border-t border-surface-border/60"
        style={{
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      />

      {/* Nav items */}
      <div
        className="relative flex items-center justify-around px-2"
        style={{ height: 'var(--bottomnav-h)' }}
      >
        {NAV_ITEMS.map(({ path, label, icon: Icon, accentColor }) => {
          const active = isActive(path);

          return (
            <Link
              key={path}
              to={path}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-1
                         flex-1 h-full group transition-transform duration-150 active:scale-90"
            >
              {/* Active indicator pip */}
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full animate-nav-pip"
                  style={{ background: accentColor }}
                />
              )}

              {/* Icon container */}
              <div
                className={[
                  'relative flex items-center justify-center w-10 h-10 rounded-2xl',
                  'transition-all duration-200',
                  active ? 'scale-105' : 'group-hover:scale-105',
                ].join(' ')}
                style={
                  active
                    ? {
                        background: `${accentColor}18`,
                        boxShadow: `0 0 12px ${accentColor}30`,
                      }
                    : {}
                }
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.2 : 1.8}
                  style={{
                    color: active ? accentColor : '#94A3B8',
                    filter: active ? `drop-shadow(0 0 4px ${accentColor}80)` : 'none',
                    transition: 'color 0.2s, filter 0.2s',
                  }}
                />

                {/* Neon dot for Flex — indicates new posts (static for now) */}
                {path === '/flex' && !active && (
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-surface-background"
                    style={{ background: '#39FF14', boxShadow: '0 0 6px rgba(57,255,20,0.7)' }}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className="text-[10px] font-body font-semibold tracking-wide transition-all duration-200"
                style={{ color: active ? accentColor : '#94A3B8' }}
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
