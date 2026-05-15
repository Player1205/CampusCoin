import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight, Sparkles, User, Zap,
  Home, LogOut, Settings,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCoinStore, selectBalance } from '@/store/useCoinStore';
import toast from 'react-hot-toast';

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV = [
  { path: '/home',    label: 'Home',    icon: Home,           accent: '#A78BFA' },
  { path: '/swap',    label: 'Swap',    icon: ArrowLeftRight, accent: '#7C3AED' },
  { path: '/flex',    label: 'Flex',    icon: Sparkles,       accent: '#39FF14' },
  { path: '/profile', label: 'Profile', icon: User,           accent: '#A78BFA' },
];

export default function Sidebar() {
  const user     = useAuthStore((s) => s.user);
  const logout   = useAuthStore((s) => s.logout);
  const balance  = useCoinStore(selectBalance);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out.');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="desktop-sidebar">

      {/* ── Logo ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-surface-border/60">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-violet shrink-0">
          <Zap size={18} className="text-white" fill="white" strokeWidth={0} />
        </div>
        <div>
          <p className="font-display text-base font-800 text-text-main leading-none">CampusCoin</p>
          <p className="font-body text-[11px] text-text-dim mt-0.5 truncate max-w-[140px]">
            {user?.university}
          </p>
        </div>
      </div>

      {/* ── Coin balance pill ──────────────────────────────────────── */}
      <div className="mx-4 mt-4 p-3 rounded-2xl flex items-center gap-3"
           style={{
             background: 'rgba(57,255,20,0.06)',
             border: '1px solid rgba(57,255,20,0.18)',
           }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center animate-coin-pulse"
             style={{ background: 'rgba(57,255,20,0.12)' }}>
          <Zap size={15} className="text-neon" fill="currentColor" strokeWidth={0} />
        </div>
        <div className="min-w-0">
          <p className="font-body text-[10px] text-text-dim uppercase tracking-wider">Balance</p>
          <p className="font-mono text-lg font-700 text-neon leading-none"
             style={{ textShadow: '0 0 10px rgba(57,255,20,0.45)' }}>
            {balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ── Nav links ──────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto">
        <p className="font-body text-[10px] font-semibold text-text-dim uppercase tracking-widest
                      px-3 pb-2">
          Navigation
        </p>

        {NAV.map(({ path, label, icon: Icon, accent }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => [
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
              'font-body text-sm font-medium group',
              isActive
                ? 'text-text-main'
                : 'text-text-muted hover:text-text-main hover:bg-surface-card',
            ].join(' ')}
            style={({ isActive }) => isActive ? {
              background: `${accent}14`,
              border: `1px solid ${accent}28`,
            } : {
              border: '1px solid transparent',
            }}
          >
            {({ isActive }) => (
              <>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                                transition-all duration-200"
                     style={isActive
                       ? { background: `${accent}20` }
                       : { background: 'transparent' }}>
                  <Icon
                    size={16}
                    style={{
                      color: isActive ? accent : '#64748B',
                      filter: isActive ? `drop-shadow(0 0 4px ${accent}60)` : 'none',
                      transition: 'color 0.2s, filter 0.2s',
                    }}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                </div>
                <span style={{ color: isActive ? accent : undefined }}>{label}</span>

                {/* Active dot */}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full"
                       style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User footer ────────────────────────────────────────────── */}
      <div className="border-t border-surface-border/60 p-3 space-y-1">
        {/* User info row */}
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-8 h-8 rounded-xl overflow-hidden border border-surface-border shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/20">
                <span className="font-display text-xs font-700 text-primary-light">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-xs font-semibold text-text-main truncate">{user?.name}</p>
            <p className="font-body text-[10px] text-text-dim truncate">{user?.email}</p>
          </div>
        </div>

        {/* Settings + Logout */}
        <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-text-dim
                           hover:text-text-muted hover:bg-surface-card transition-all duration-150
                           font-body text-xs">
          <Settings size={14} /> Settings
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-red-400/70
                     hover:text-red-400 hover:bg-red-500/8 transition-all duration-150
                     font-body text-xs"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
