import { useState } from 'react';
import {
  Zap, Settings, GraduationCap, Briefcase, Star,
  ArrowLeftRight, Clock, TrendingUp, Edit3, Check, X, LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useCoinStore, selectBalance, selectLockedBalance, selectRecentTransactions } from '@/store/useCoinStore';
import TaskCard, { TaskCardSkeleton } from '@/features/swap/components/TaskCard';
import { useTaskFeed } from '@/features/swap/hooks/useSwap';
import type { CoinTransaction } from '@/store/useCoinStore';
import toast from 'react-hot-toast';

// ─── Sub-components ───────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: CoinTransaction }) {
  const pos   = tx.direction === 'earned' || tx.direction === 'refunded';
  const color = pos ? '#39FF14' : tx.direction === 'locked' ? '#A78BFA' : '#f87171';
  const dir   = { earned: '+', spent: '−', locked: '🔒 ', refunded: '+' }[tx.direction];

  return (
    <div className="flex items-center gap-3 py-3 border-b border-surface-border/40 last:border-0">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
           style={{ background: `${color}15` }}>
        <Zap size={13} style={{ color }} fill="currentColor" strokeWidth={0} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm text-text-main truncate">{tx.label}</p>
        <p className="font-body text-[11px] text-text-dim">
          {new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <span className="font-mono text-sm font-semibold shrink-0" style={{ color }}>
        {dir}{tx.amount}
      </span>
    </div>
  );
}

function EditBioForm({ initial, onSave, onCancel }: {
  initial: string; onSave: (v: string) => void; onCancel: () => void;
}) {
  const [val, setVal] = useState(initial);
  return (
    <div className="space-y-2">
      <textarea autoFocus value={val} onChange={(e) => setVal(e.target.value)}
                maxLength={300} rows={3}
                className="cc-input resize-none w-full text-sm"
                placeholder="Tell your campus about yourself…" />
      <div className="flex gap-2">
        <button onClick={() => onSave(val)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
          <Check size={12} /> Save
        </button>
        <button onClick={onCancel} className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1">
          <X size={12} /> Cancel
        </button>
      </div>
    </div>
  );
}

type Tab = 'tasks' | 'activity';

// ─── Profile page ─────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate  = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const balance   = useCoinStore(selectBalance);
  const locked    = useCoinStore(selectLockedBalance);
  const txHistory = useCoinStore(selectRecentTransactions);

  const [tab,        setTab]        = useState<Tab>('tasks');
  const [taskRole,   setTaskRole]   = useState<'poster' | 'doer'>('poster');
  const [editingBio, setEditingBio] = useState(false);

  const { tasks: myTasks, isLoading: tasksLoading, pagination, loadNextPage, isLoadingMore } =
    useTaskFeed({ limit: 10 });

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out.');
    navigate('/login', { replace: true });
  };

  const handleSaveBio = (bio: string) => {
    updateUser({ bio });
    setEditingBio(false);
    toast.success('Bio updated!');
  };

  if (!user) return null;

  return (
    <div className="min-h-full">
      <div className="content-wrap py-8">

        {/* ── Page title ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-800 text-text-main">Profile</h1>
          <button onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body
                             font-medium text-red-400 border border-red-500/20 bg-red-500/5
                             hover:bg-red-500/10 transition-all active:scale-95">
            <LogOut size={14} /> Sign out
          </button>
        </div>

        {/* ── Desktop: two-column grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

          {/* ── Left column: identity ── */}
          <div className="lg:col-span-1 space-y-5">

            {/* Avatar card */}
            <div className="cc-card overflow-hidden">
              {/* Banner */}
              <div className="h-24 relative"
                   style={{ background: 'linear-gradient(135deg, #5B21B6 0%, #1E293B 70%, #0F172A 100%)' }}>
                <div className="absolute inset-0 opacity-20"
                     style={{
                       backgroundImage: 'linear-gradient(rgba(124,58,237,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.2) 1px, transparent 1px)',
                       backgroundSize: '20px 20px',
                     }} />
              </div>

              <div className="px-5 pb-5">
                {/* Avatar */}
                <div className="flex items-end justify-between -mt-9 mb-4">
                  <div className="relative">
                    <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl overflow-hidden
                                    border-2 border-surface-background shadow-violet">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/30">
                          <span className="font-display text-2xl font-800 text-primary-light">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {user.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neon
                                      border-2 border-surface-background flex items-center justify-center shadow-neon-sm">
                        <Star size={9} className="text-surface-background" fill="currentColor" strokeWidth={0} />
                      </div>
                    )}
                  </div>
                  <button className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5">
                    <Settings size={12} /> Edit
                  </button>
                </div>

                {/* Identity */}
                <h2 className="font-display text-xl font-800 text-text-main">{user.name}</h2>
                <div className="flex flex-col gap-1 mt-1.5">
                  <span className="flex items-center gap-1.5 font-body text-xs text-text-muted">
                    <GraduationCap size={12} /> {user.university}
                  </span>
                  {user.department && (
                    <span className="flex items-center gap-1.5 font-body text-xs text-text-dim">
                      <Briefcase size={11} /> {user.department}
                    </span>
                  )}
                </div>

                {/* Bio */}
                <div className="mt-3">
                  {editingBio ? (
                    <EditBioForm initial={user.bio ?? ''} onSave={handleSaveBio} onCancel={() => setEditingBio(false)} />
                  ) : (
                    <div className="group cursor-pointer flex items-start gap-1.5"
                         onClick={() => setEditingBio(true)}>
                      <p className="font-body text-sm text-text-muted leading-relaxed flex-1">
                        {user.bio || <span className="text-text-dim italic">Add a bio…</span>}
                      </p>
                      <Edit3 size={12} className="text-text-dim opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                    </div>
                  )}
                </div>

                {/* Skills */}
                {user.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {user.skills.map((s) => <span key={s} className="cc-tag">{s}</span>)}
                  </div>
                )}
              </div>
            </div>

            {/* Coin balance card */}
            <div className="cc-card p-5 space-y-4"
                 style={{ border: '1px solid rgba(57,255,20,0.2)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-coin-pulse"
                     style={{ background: 'rgba(57,255,20,0.1)' }}>
                  <Zap size={18} className="text-neon" fill="currentColor" strokeWidth={0} />
                </div>
                <div>
                  <p className="font-body text-xs text-text-muted">Available</p>
                  <p className="font-mono text-2xl font-700 text-neon"
                     style={{ textShadow: '0 0 12px rgba(57,255,20,0.5)' }}>
                    {balance.toLocaleString()}
                  </p>
                </div>
              </div>

              {locked > 0 && (
                <div className="flex items-center justify-between py-2.5 px-3 rounded-xl
                                bg-primary/8 border border-primary/15">
                  <span className="font-body text-xs text-text-muted">In escrow 🔒</span>
                  <span className="font-mono text-sm text-primary-light">{locked.toLocaleString()}</span>
                </div>
              )}

              <button className="btn-neon w-full text-sm">Send Coins</button>
            </div>

            {/* Stats */}
            <div className="cc-card p-5 space-y-3">
              <h3 className="font-display text-xs font-700 text-text-dim uppercase tracking-widest">Stats</h3>
              {[
                { label: 'Total Balance',  value: (balance + locked).toLocaleString(), color: '#39FF14' },
                { label: 'Role',           value: user.role === 'admin' ? 'Admin ⚙️' : 'Student 🎓', color: '#7C3AED' },
                { label: 'Verified',       value: user.isVerified ? 'Yes ✓' : 'Pending',              color: '#A78BFA' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-1">
                  <span className="font-body text-xs text-text-muted">{label}</span>
                  <span className="font-body text-xs font-semibold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column: tabs ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Tab bar */}
            <div className="flex gap-1 p-1 bg-surface-card rounded-2xl border border-surface-border w-fit">
              {([
                { id: 'tasks',    label: 'My Tasks',  icon: ArrowLeftRight },
                { id: 'activity', label: 'Activity',  icon: Clock },
              ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-body
                              font-semibold transition-all duration-200 ${
                    tab === id
                      ? 'bg-surface-background text-text-main shadow-sm'
                      : 'text-text-dim hover:text-text-muted'
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* Tasks tab */}
            {tab === 'tasks' && (
              <div className="space-y-4 animate-fade-in">
                {/* Role toggle */}
                <div className="flex gap-1 p-1 bg-surface-card rounded-xl border border-surface-border w-fit">
                  {(['poster', 'doer'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setTaskRole(r)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-body font-semibold
                                  transition-all capitalize ${
                        taskRole === r
                          ? 'bg-surface-background text-text-main'
                          : 'text-text-dim hover:text-text-muted'
                      }`}
                    >
                      As {r}
                    </button>
                  ))}
                </div>

                {tasksLoading ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => <TaskCardSkeleton key={i} />)}
                  </div>
                ) : myTasks.length === 0 ? (
                  <div className="cc-card p-10 text-center space-y-3">
                    <TrendingUp size={32} className="text-text-dim mx-auto" strokeWidth={1.5} />
                    <p className="font-display text-base font-700 text-text-muted">
                      {taskRole === 'poster' ? "No tasks posted yet" : "No tasks taken yet"}
                    </p>
                    <p className="font-body text-sm text-text-dim max-w-xs mx-auto">
                      {taskRole === 'poster'
                        ? 'Post a task to get help from your campus.'
                        : 'Browse the Swap marketplace to find tasks.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {myTasks.map((task) => (
                      <TaskCard key={task._id} task={task} compact />
                    ))}
                    {pagination?.hasNextPage && (
                      <div className="col-span-full">
                        <button onClick={loadNextPage} disabled={isLoadingMore} className="w-full btn-ghost">
                          {isLoadingMore ? 'Loading…' : 'Load more'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Activity tab */}
            {tab === 'activity' && (
              <div className="animate-fade-in">
                {txHistory.length === 0 ? (
                  <div className="cc-card p-10 text-center space-y-2">
                    <Clock size={32} className="text-text-dim mx-auto" strokeWidth={1.5} />
                    <p className="font-body text-sm text-text-muted">No transactions yet.</p>
                    <p className="font-body text-xs text-text-dim">
                      Post or complete a task to see your coin activity here.
                    </p>
                  </div>
                ) : (
                  <div className="cc-card px-5 divide-y divide-surface-border/50">
                    {txHistory.map((tx) => <TxRow key={tx.id} tx={tx} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
