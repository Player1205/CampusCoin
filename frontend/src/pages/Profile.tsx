import { useState, useRef } from 'react';
import {
  Zap, Settings, GraduationCap, Briefcase, Star,
  ArrowLeftRight, Clock, Edit3, Check, X, LogOut,
  Camera, Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useCoinStore, selectBalance, selectLockedBalance, selectRecentTransactions } from '@/store/useCoinStore';
import TaskCard, { TaskCardSkeleton } from '@/features/swap/components/TaskCard';
import { useTaskFeed } from '@/features/swap/hooks/useSwap';
import type { CoinTransaction } from '@/store/useCoinStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Transaction row ──────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: CoinTransaction }) {
  const pos   = tx.direction === 'earned' || tx.direction === 'refunded';
  const color = pos ? 'var(--accent)' : tx.direction === 'locked' ? 'var(--primary-lt)' : '#f87171';
  const dir   = { earned: '+', spent: '−', locked: '🔒 ', refunded: '+' }[tx.direction];

  return (
    <div className="flex items-center gap-3 py-3"
         style={{ borderBottom: '1px solid var(--border-sub)' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
           style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
        <Zap size={13} style={{ color }} fill="currentColor" strokeWidth={0} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm truncate" style={{ color: 'var(--text)' }}>{tx.label}</p>
        <p className="font-body text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <span className="font-mono text-sm font-semibold shrink-0" style={{ color }}>
        {dir}{tx.amount}
      </span>
    </div>
  );
}

// ─── Skill tag editor ─────────────────────────────────────────────────────────

function SkillEditor({ skills, onSave }: {
  skills: string[]; onSave: (s: string[]) => void;
}) {
  const [input, setInput]   = useState('');
  const [list, setList]     = useState<string[]>(skills);
  const [saving, setSaving] = useState(false);

  const add = () => {
    const t = input.trim().toLowerCase();
    if (t && !list.includes(t) && list.length < 10) {
      setList((p) => [...p, t]);
      setInput('');
    }
  };

  const remove = (s: string) => setList((p) => p.filter((x) => x !== s));

  const save = async () => {
    setSaving(true);
    try { await onSave(list); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {list.map((s) => (
          <span key={s}
                className="cc-tag cursor-pointer hover:border-red-500/40 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => remove(s)}>
            {s} ×
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="cc-input flex-1 text-sm"
          placeholder="Add a skill…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button type="button" onClick={add} className="btn-ghost text-xs px-3">Add</button>
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1"
      >
        {saving
          ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><Check size={12} /> Save Skills</>
        }
      </button>
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
  const [bioVal,     setBioVal]     = useState(user?.bio ?? '');
  const [savingBio,  setSavingBio]  = useState(false);
  const [editSkills, setEditSkills] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { tasks: myTasks, isLoading: tasksLoading, pagination, loadNextPage, isLoadingMore } =
    useTaskFeed({ limit: 10 });

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out.');
    navigate('/login', { replace: true });
  };

  // ── Save bio to API ───────────────────────────────────────────────────────
  const saveBio = async () => {
    setSavingBio(true);
    try {
      const res = await api.patch('/users/me', { bio: bioVal });

      const updated = res.data?.data?.user ?? res.data;
      updateUser({ bio: bioVal, ...updated });
      toast.success('Bio updated!');
      setEditingBio(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save bio.');
    } finally {
      setSavingBio(false);
    }
  };

  // ── Save skills to API ────────────────────────────────────────────────────
  const saveSkills = async (skills: string[]) => {
    try {
      await api.patch('/users/me', { skills });
      updateUser({ skills });
      toast.success('Skills updated!');
      setEditSkills(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save skills.');
    }
  };

  // ── Avatar upload ─────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024)    { toast.error('Image must be under 5MB.'); return; }

    setAvatarUploading(true);
    try {
      // Convert to base64 data URL for preview + store as URL
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        // Optimistic UI update
        updateUser({ avatarUrl: dataUrl });
        try {
          // Send to backend
          await api.patch('/users/me', { avatarUrl: dataUrl });
          toast.success('Avatar updated!');
        } catch {
          // For now, keep local preview even if API not yet wired
          toast.success('Avatar updated locally!');
        } finally {
          setAvatarUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setAvatarUploading(false);
      toast.error('Failed to upload avatar.');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-full">
      <div className="content-wrap py-6 lg:py-8">

        {/* ── Page title ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl lg:text-3xl font-800" style={{ color: 'var(--text)' }}>
            Profile
          </h1>
          <button onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-body text-sm font-medium
                             transition-all active:scale-95"
                  style={{ color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.05)' }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>

        {/* ── Two-col grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

          {/* ── Left column ── */}
          <div className="lg:col-span-1 space-y-5">

            {/* Avatar + identity */}
            <div className="cc-card overflow-hidden">
              {/* Banner */}
              <div className="h-20 relative"
                   style={{ background: 'linear-gradient(135deg, var(--primary-dk) 0%, var(--card-alt) 100%)' }}>
                <div className="absolute inset-0 opacity-20"
                     style={{
                       backgroundImage: 'linear-gradient(var(--bg-grid) 1px,transparent 1px),linear-gradient(90deg,var(--bg-grid) 1px,transparent 1px)',
                       backgroundSize: '18px 18px',
                     }} />
              </div>

              <div className="px-5 pb-5">
                <div className="flex items-end justify-between -mt-8 mb-4">
                  {/* Clickable avatar */}
                  <div className="relative group">
                    <div
                      className="w-16 h-16 rounded-2xl overflow-hidden cursor-pointer"
                      style={{ border: '2px solid var(--bg)', boxShadow: '0 0 14px rgba(124,58,237,0.4)' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                             style={{ background: 'rgba(124,58,237,0.25)' }}>
                          <span className="font-display text-2xl font-700" style={{ color: 'var(--primary-lt)' }}>
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0
                                      group-hover:opacity-100 transition-opacity"
                           style={{ background: 'rgba(0,0,0,0.5)' }}>
                        {avatarUploading
                          ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <Camera size={16} className="text-white" />
                        }
                      </div>
                    </div>
                    {user.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                           style={{ background: 'var(--accent)', border: '2px solid var(--bg)' }}>
                        <Star size={9} className="text-white" fill="currentColor" strokeWidth={0} />
                      </div>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />

                  <button className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5">
                    <Settings size={12} /> Settings
                  </button>
                </div>

                {/* Name */}
                <h2 className="font-display text-xl font-800" style={{ color: 'var(--text)' }}>{user.name}</h2>
                <div className="flex flex-col gap-1 mt-1.5">
                  <span className="flex items-center gap-1.5 font-body text-xs" style={{ color: 'var(--text-muted)' }}>
                    <GraduationCap size={12} /> {user.university}
                  </span>
                  {user.department && (
                    <span className="flex items-center gap-1.5 font-body text-xs" style={{ color: 'var(--text-dim)' }}>
                      <Briefcase size={11} /> {user.department}
                    </span>
                  )}
                </div>

                {/* Bio — inline edit */}
                <div className="mt-3">
                  {editingBio ? (
                    <div className="space-y-2">
                      <textarea
                        autoFocus
                        value={bioVal}
                        onChange={(e) => setBioVal(e.target.value)}
                        maxLength={300}
                        rows={3}
                        className="cc-input resize-none w-full text-sm"
                        placeholder="Tell your campus about yourself…"
                      />
                      <div className="flex gap-2">
                        <button onClick={saveBio} disabled={savingBio}
                                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                          {savingBio
                            ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <><Check size={12} /> Save</>
                          }
                        </button>
                        <button onClick={() => { setEditingBio(false); setBioVal(user.bio ?? ''); }}
                                className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1">
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="group cursor-pointer flex items-start gap-1.5"
                      onClick={() => { setEditingBio(true); setBioVal(user.bio ?? ''); }}
                    >
                      <p className="font-body text-sm leading-relaxed flex-1"
                         style={{ color: user.bio ? 'var(--text-muted)' : 'var(--text-dim)' }}>
                        {user.bio || <em>Click to add a bio…</em>}
                      </p>
                      <Edit3 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
                             style={{ color: 'var(--text-dim)' }} />
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-body text-xs font-semibold uppercase tracking-wider"
                       style={{ color: 'var(--text-dim)' }}>Skills</p>
                    <button
                      onClick={() => setEditSkills((v) => !v)}
                      className="font-body text-xs transition-colors flex items-center gap-1"
                      style={{ color: 'var(--primary-lt)' }}
                    >
                      {editSkills ? <X size={11} /> : <Plus size={11} />}
                      {editSkills ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {editSkills ? (
                    <SkillEditor skills={user.skills} onSave={saveSkills} />
                  ) : (
                    user.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {user.skills.map((s) => <span key={s} className="cc-tag">{s}</span>)}
                      </div>
                    ) : (
                      <p className="font-body text-xs" style={{ color: 'var(--text-dim)' }}>
                        No skills added yet.
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Coin balance */}
            <div className="cc-card p-5 space-y-4"
                 style={{ border: '1px solid color-mix(in srgb, var(--accent) 22%, transparent)' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center animate-coin-pulse"
                     style={{ background: 'var(--accent-sub)' }}>
                  <Zap size={20} style={{ color: 'var(--accent)' }} fill="currentColor" strokeWidth={0} />
                </div>
                <div>
                  <p className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>Available</p>
                  <p className="font-mono text-2xl font-700"
                     style={{ color: 'var(--accent)', textShadow: '0 0 12px var(--accent-glow)' }}>
                    {balance.toLocaleString()}
                  </p>
                </div>
              </div>
              {locked > 0 && (
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                     style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                  <span className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>In escrow 🔒</span>
                  <span className="font-mono text-sm" style={{ color: 'var(--primary-lt)' }}>{locked.toLocaleString()}</span>
                </div>
              )}
              <button className="btn-neon w-full">Send Coins</button>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Tab bar */}
            <div className="flex gap-1 p-1 rounded-2xl w-fit"
                 style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {([
                { id: 'tasks' as Tab,    label: 'My Tasks',  icon: ArrowLeftRight },
                { id: 'activity' as Tab, label: 'Activity',  icon: Clock },
              ]).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-body text-sm
                             font-semibold transition-all"
                  style={{
                    background: tab === id ? 'var(--bg)' : 'transparent',
                    color: tab === id ? 'var(--text)' : 'var(--text-dim)',
                    boxShadow: tab === id ? '0 1px 4px var(--shadow)' : 'none',
                  }}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {tab === 'tasks' && (
              <div className="space-y-4 animate-fade-in">
                {/* Role toggle */}
                <div className="flex gap-1 p-1 rounded-xl w-fit"
                     style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  {(['poster', 'doer'] as const).map((r) => (
                    <button key={r} onClick={() => setTaskRole(r)}
                            className="px-4 py-1.5 rounded-lg font-body text-xs font-semibold capitalize transition-all"
                            style={{
                              background: taskRole === r ? 'var(--bg)' : 'transparent',
                              color: taskRole === r ? 'var(--text)' : 'var(--text-dim)',
                            }}>
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
                    <p className="font-display text-base font-700" style={{ color: 'var(--text-muted)' }}>
                      {taskRole === 'poster' ? 'No tasks posted yet' : 'No tasks taken yet'}
                    </p>
                    <p className="font-body text-sm" style={{ color: 'var(--text-dim)' }}>
                      {taskRole === 'poster' ? 'Head to Tasks to post your first gig.' : 'Browse Tasks to find work.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {myTasks.map((task) => <TaskCard key={task._id} task={task} compact />)}
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

            {tab === 'activity' && (
              <div className="animate-fade-in">
                {txHistory.length === 0 ? (
                  <div className="cc-card p-10 text-center space-y-2">
                    <Clock size={32} className="mx-auto" style={{ color: 'var(--text-dim)' }} strokeWidth={1.5} />
                    <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
                      No transactions yet.
                    </p>
                    <p className="font-body text-xs" style={{ color: 'var(--text-dim)' }}>
                      Post or complete a task to see coin activity.
                    </p>
                  </div>
                ) : (
                  <div className="cc-card px-5">
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
