import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ListTodo, Sparkles, User, Zap, LogOut, Settings, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCoinStore, selectBalance } from '@/store/useCoinStore';
import ThemeToggle from '@/components/ui/ThemeToggle';
import toast from 'react-hot-toast';

const NAV = [
  { path: '/home',    label: 'Home',    icon: Home,          accent: '#A78BFA' },
  { path: '/tasks',   label: 'Tasks',   icon: ListTodo,      accent: '#7C3AED' },
  { path: '/flex',    label: 'Flex',    icon: Sparkles,      accent: 'var(--accent)' },
  { path: '/chats',   label: 'Chats',   icon: MessageCircle, accent: '#F97316' },
  { path: '/profile', label: 'Profile', icon: User,          accent: '#A78BFA' },
];

export default function Sidebar() {
  const user      = useAuthStore((s) => s.user);
  const logout    = useAuthStore((s) => s.logout);
  const balance   = useCoinStore(selectBalance);
  const navigate  = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out.');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="desktop-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5"
           style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
             style={{ background: 'var(--primary)', boxShadow: '0 0 14px rgba(124,58,237,0.45)' }}>
          <Zap size={18} className="text-white" fill="white" strokeWidth={0} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-base font-800 leading-none" style={{ color: 'var(--text)' }}>
            CampusCoin
          </p>
          <p className="font-body text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-dim)' }}>
            {user?.university}
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Coin balance */}
      <div className="mx-4 mt-4 p-3.5 rounded-2xl flex items-center gap-3 animate-coin-pulse"
           style={{
             background: 'var(--accent-sub)',
             border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
           }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
             style={{ background: 'color-mix(in srgb, var(--accent) 18%, transparent)' }}>
          <Zap size={15} style={{ color: 'var(--accent)' }} fill="currentColor" strokeWidth={0} />
        </div>
        <div className="min-w-0">
          <p className="font-body text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-dim)' }}>
            Balance
          </p>
          <p className="font-mono text-xl font-700 leading-none"
             style={{ color: 'var(--accent)', textShadow: '0 0 10px var(--accent-glow)' }}>
            {balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-5 space-y-0.5 overflow-y-auto">
        <p className="font-body text-[10px] font-600 uppercase tracking-widest px-3 pb-2 mb-1"
           style={{ color: 'var(--text-dim)' }}>
          Menu
        </p>
        {NAV.map(({ path, label, icon: Icon, accent }) => {
          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                 font-body text-sm font-medium ${!isActive ? 'hover:bg-[var(--card-alt)]' : ''}`
              }
              style={({ isActive }) => isActive ? {
                background: `color-mix(in srgb, ${accent} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${accent} 22%, transparent)`,
                color: accent,
              } : {
                border: '1px solid transparent',
                color: 'var(--text-muted)',
              }}
            >
              {({ isActive }) => (
                <>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 relative">
                    <Icon
                      size={16}
                      strokeWidth={isActive ? 2.2 : 1.8}
                      style={{
                        color: isActive ? accent : 'var(--text-dim)',
                        filter: isActive ? `drop-shadow(0 0 4px ${accent}70)` : 'none',
                      }}
                    />

                  </div>
                  <span>{label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full"
                         style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-0.5" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0"
               style={{ border: '1px solid var(--border)' }}>
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"
                     style={{ background: 'rgba(124,58,237,0.2)' }}>
                  <span className="font-display text-xs font-700" style={{ color: 'var(--primary-lt)' }}>
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{user?.name}</p>
            <p className="font-body text-[10px] truncate" style={{ color: 'var(--text-dim)' }}>{user?.email}</p>
          </div>
        </div>
        {[
          { icon: Settings, label: 'Settings', color: 'var(--text-dim)', onClick: () => navigate('/profile') },
          { icon: LogOut,   label: 'Sign out',  color: 'var(--danger)',   onClick: handleLogout },
        ].map(({ icon: Icon, label, color, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl font-body text-xs
                       transition-all duration-150"
            style={{ color }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = label === 'Sign out' ? 'var(--danger-sub)' : 'var(--card-alt)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>
    </aside>
  );
}
