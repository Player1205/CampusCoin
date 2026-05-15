import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight, Sparkles, Zap,
  TrendingUp, Users, Star, ArrowRight,
  Clock, CheckCircle2, Circle,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCoinStore, selectBalance, selectLockedBalance } from '@/store/useCoinStore';
import TaskCard, { TaskCardSkeleton } from '@/features/swap/components/TaskCard';
import { fetchTasks } from '@/features/swap/services/swap.api';
import type { Task } from '@/features/swap/types';

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: React.ElementType; accent: string;
}) {
  return (
    <div className="cc-card p-4 flex items-center gap-4 hover:border-surface-border/80 transition-all">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
           style={{ background: `${accent}15` }}>
        <Icon size={20} style={{ color: accent }} />
      </div>
      <div>
        <p className="font-display text-2xl font-800 text-text-main">{value}</p>
        <p className="font-body text-xs text-text-muted mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Quick action card ────────────────────────────────────────────────────────

function ActionCard({ icon: Icon, label, sub, onClick, neon = false }: {
  icon: React.ElementType; label: string; sub: string;
  onClick: () => void; neon?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="cc-card p-5 flex flex-col items-start gap-3 w-full text-left
                 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200"
      style={neon ? { border: '1px solid rgba(57,255,20,0.25)' } : {}}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
           style={{ background: neon ? 'rgba(57,255,20,0.12)' : 'rgba(124,58,237,0.15)' }}>
        <Icon size={20} className={neon ? 'text-neon' : 'text-primary-light'} />
      </div>
      <div>
        <p className={`font-display text-base font-700 ${neon ? 'text-neon' : 'text-text-main'}`}>
          {label}
        </p>
        <p className="font-body text-xs text-text-muted mt-0.5">{sub}</p>
      </div>
      <ArrowRight size={14} className={neon ? 'text-neon' : 'text-text-dim'} />
    </button>
  );
}

// ─── Activity item ────────────────────────────────────────────────────────────

function ActivityItem({ icon: Icon, text, time, done = false }: {
  icon: React.ElementType; text: string; time: string; done?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-surface-border/40 last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
        done ? 'bg-neon/10' : 'bg-surface-background border border-surface-border'
      }`}>
        <Icon size={14} className={done ? 'text-neon' : 'text-text-dim'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm text-text-main leading-snug">{text}</p>
        <p className="font-body text-xs text-text-dim mt-0.5">{time}</p>
      </div>
      {done ? <CheckCircle2 size={14} className="text-neon shrink-0 mt-1" />
            : <Circle size={14} className="text-text-dim shrink-0 mt-1" />}
    </div>
  );
}

// ─── Home page ────────────────────────────────────────────────────────────────

export default function Home() {
  const user     = useAuthStore((s) => s.user);
  const balance  = useCoinStore(selectBalance);
  const locked   = useCoinStore(selectLockedBalance);
  const navigate = useNavigate();

  const [tasks, setTasks]       = useState<Task[]>([]);
  const [isLoading, setLoading] = useState(true);

  const firstName = user?.name.split(' ')[0] ?? 'there';
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    fetchTasks({ limit: 4, sortBy: 'newest', status: 'open' })
      .then((r) => setTasks(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full">
      <div className="content-wrap py-8">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="mb-8">
          <p className="font-body text-sm text-text-muted">{greeting},</p>
          <h1 className="font-display text-3xl lg:text-4xl font-800 text-text-main mt-1">
            {firstName} 👋
          </h1>
          <p className="font-body text-sm text-text-dim mt-1">{user?.university}</p>
        </div>

        {/* ── Desktop: two-column grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column (2/3 width) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero balance card */}
            <div className="cc-card p-6 relative overflow-hidden"
                 style={{ border: '1px solid rgba(57,255,20,0.2)' }}>
              <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20"
                   style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)' }} />
              <div className="pointer-events-none absolute -bottom-12 -left-12 w-40 h-40 rounded-full opacity-10"
                   style={{ background: 'radial-gradient(circle, #39FF14, transparent 70%)' }} />

              <div className="relative flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-coin-pulse"
                       style={{ background: 'rgba(57,255,20,0.12)', border: '1px solid rgba(57,255,20,0.25)' }}>
                    <Zap size={26} className="text-neon" fill="currentColor" strokeWidth={0} />
                  </div>
                  <div>
                    <p className="font-body text-sm text-text-muted">Available balance</p>
                    <p className="font-mono text-4xl font-700 text-neon leading-none"
                       style={{ textShadow: '0 0 20px rgba(57,255,20,0.5)' }}>
                      {balance.toLocaleString()}
                    </p>
                    {locked > 0 && (
                      <p className="font-body text-xs text-text-dim mt-1">
                        + {locked.toLocaleString()} locked in escrow
                      </p>
                    )}
                  </div>
                </div>
                <button className="btn-neon">Send Coins</button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Open Tasks"    value="24"  icon={TrendingUp} accent="#7C3AED" />
              <StatCard label="Active Users"  value="138" icon={Users}      accent="#39FF14" />
              <StatCard label="Avg Rating"    value="4.9" icon={Star}       accent="#fbbf24" />
            </div>

            {/* Quick actions */}
            <div>
              <h2 className="font-display text-sm font-700 text-text-dim uppercase tracking-widest mb-3">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <ActionCard
                  icon={ArrowLeftRight}
                  label="Browse Tasks"
                  sub="Find gigs, earn coins"
                  onClick={() => navigate('/swap')}
                />
                <ActionCard
                  icon={Sparkles}
                  label="Post to Flex"
                  sub="Share a win with campus"
                  onClick={() => navigate('/flex')}
                  neon
                />
              </div>
            </div>

            {/* Latest tasks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-sm font-700 text-text-dim uppercase tracking-widest">
                  Latest Tasks
                </h2>
                <button
                  onClick={() => navigate('/swap')}
                  className="flex items-center gap-1 font-body text-xs text-primary-light
                             hover:text-primary transition-colors"
                >
                  See all <ArrowRight size={12} />
                </button>
              </div>

              {/* Desktop: 2-col task grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => <TaskCardSkeleton key={i} />)
                  : tasks.length === 0
                  ? (
                    <div className="col-span-2 cc-card p-8 text-center space-y-3">
                      <p className="font-display text-lg font-700 text-text-muted">No tasks yet</p>
                      <button onClick={() => navigate('/swap')} className="btn-neon mx-auto">
                        Post First Task
                      </button>
                    </div>
                  )
                  : tasks.map((task) => (
                    <TaskCard key={task._id} task={task} compact />
                  ))
                }
              </div>
            </div>
          </div>

          {/* ── Right column (1/3 width) — desktop only ── */}
          <div className="hidden lg:flex flex-col gap-5">

            {/* Profile mini-card */}
            <div className="cc-card p-5 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/40
                              shadow-violet mx-auto">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/20">
                    <span className="font-display text-2xl font-700 text-primary-light">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-display text-base font-700 text-text-main">{user?.name}</p>
                <p className="font-body text-xs text-text-dim mt-0.5">{user?.department || user?.university}</p>
              </div>
              {user?.skills && user.skills.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5">
                  {user.skills.slice(0, 4).map((s) => (
                    <span key={s} className="cc-tag text-[10px]">{s}</span>
                  ))}
                </div>
              )}
              <button
                onClick={() => navigate('/profile')}
                className="btn-ghost w-full text-xs py-2"
              >
                View Profile
              </button>
            </div>

            {/* Recent activity */}
            <div className="cc-card p-5">
              <h3 className="font-display text-sm font-700 text-text-dim uppercase tracking-widest mb-3">
                Recent Activity
              </h3>
              <div className="space-y-0">
                <ActivityItem icon={CheckCircle2} text="Account created successfully" time="Just now" done />
                <ActivityItem icon={Zap}          text="100 starter coins credited"   time="Just now" done />
                <ActivityItem icon={ArrowLeftRight} text="Post your first task"       time="Pending" />
                <ActivityItem icon={Sparkles}     text="Make a Flex post"             time="Pending" />
              </div>
            </div>

            {/* Tips card */}
            <div className="cc-card p-5 space-y-3"
                 style={{ border: '1px solid rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.05)' }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Star size={12} className="text-primary-light" />
                </div>
                <h3 className="font-display text-sm font-700 text-primary-light">Pro Tip</h3>
              </div>
              <p className="font-body text-xs text-text-muted leading-relaxed">
                Post tasks with <span className="text-neon">neon-highlighted</span> rewards to attract
                more applicants. Coins locked in escrow are automatically released on completion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
