import { useState, useRef } from 'react';
import {
  Zap, Settings, GraduationCap, Briefcase, Star,
  ArrowLeftRight, Clock, Edit3, Check, X, LogOut,
  Camera, Plus, HelpCircle, ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useCoinStore, selectBalance, selectLockedBalance, selectRecentTransactions } from '@/store/useCoinStore';
import TaskCard, { TaskCardSkeleton } from '@/features/swap/components/TaskCard';
import { useMyTasks } from '@/features/swap/hooks/useSwap';
import type { CoinTransaction } from '@/store/useCoinStore';
import CoinsExplainer from '@/pages/CoinsExplainer';
import EmailVerificationModal from '@/features/profile/components/EmailVerificationModal';
import SendCoinsModal from '@/features/profile/components/SendCoinsModal';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Transaction row ──────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: CoinTransaction }) {
  const pos   = tx.direction === 'earned' || tx.direction === 'refunded';
  const color = pos ? 'var(--success, #16A34A)' : tx.direction === 'locked' ? 'var(--primary-lt)' : '#ef4444';
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
          {new Date(tx.timestamp).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>
      <span className="font-mono text-sm font-semibold shrink-0" style={{ color }}>
        {dir}{tx.amount}
      </span>
    </div>
  );
}

// ─── Skill editor ─────────────────────────────────────────────────────────────

function SkillEditor({ skills, onSave }: {
  skills: string[];
  onSave: (s: string[]) => void;
}) {
  const [input, setInput] = useState('');
  const [list,  setList]  = useState<string[]>(skills);
  const [saving, setSaving] = useState(false);

  const add = () => {
    const t = input.trim().toLowerCase();
    if (t && !list.includes(t) && list.length < 10) {
      setList((p) => [...p, t]);
      setInput('');
    }
  };

  const save = async () => {
    setSaving(true);
    try { await onSave(list); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {list.map((s) => (
          <span
            key={s}
            className="cc-tag cursor-pointer transition-colors"
            onClick={() => setList((p) => p.filter((x) => x !== s))}
            style={{ color: 'var(--text-muted)' }}
          >
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
      <button onClick={save} disabled={saving} className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1">
        {saving
          ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><Check size={12} /> Save Skills</>
        }
      </button>
    </div>
  );
}

type Tab = 'tasks' | 'activity';

// ─── Profile ──────────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate  = useNavigate();
  const { user, logout, updateUser, fetchMe } = useAuthStore();
  const balance   = useCoinStore(selectBalance);
  const locked    = useCoinStore(selectLockedBalance);
  const txHistory = useCoinStore(selectRecentTransactions);

  const [tab,         setTab]         = useState<Tab>('tasks');
  const [taskRole,    setTaskRole]    = useState<'poster' | 'doer'>('poster');
  const [editingBio,  setEditingBio]  = useState(false);
  const [bioVal,      setBioVal]      = useState(user?.bio ?? '');
  const [savingBio,   setSavingBio]   = useState(false);
  const [editSkills,  setEditSkills]  = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showCoins,   setShowCoins]   = useState(false);       // ← CoinsExplainer toggle
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showSendCoinsModal, setShowSendCoinsModal] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const {
    tasks: myTasks,
    isLoading: tasksLoading,
    pagination,
    loadNextPage,
    isLoadingMore,
  } = useMyTasks(taskRole);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out.');
    navigate('/login', { replace: true });
  };

  const saveBio = async () => {
    setSavingBio(true);
    try {
      await api.patch('/users/me', { bio: bioVal });
      updateUser({ bio: bioVal });
      toast.success('Bio updated!');
      setEditingBio(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save bio.');
    } finally {
      setSavingBio(false);
    }
  };

  const saveSkills = async (skills: string[]) => {
    try {
      const res = await api.patch('/users/me', { skills });
      const data = res.data?.data;
      if (data?.user) {
        updateUser(data.user);
      } else {
        updateUser({ skills });
      }
      if (data?.coinsAwarded && data.coinsAwarded > 0) {
        useCoinStore.getState().optimisticCredit(data.coinsAwarded, 'Milestone: Added 3+ Skills');
        toast.success(`🎉 +${data.coinsAwarded} coins! Milestone reward unlocked!`);
      } else {
        toast.success('Skills updated!');
      }
      setEditSkills(false);
      // Refresh full user to sync coin balance
      await fetchMe();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save skills.');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }
    if (file.size > 1 * 1024 * 1024) {
      toast.error('Image must be under 1 MB. Please compress it or use a smaller photo.');
      // Reset the file input so the user can try again
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await api.patch('/users/me', { avatarUrl: dataUrl });
        const data = res.data?.data;
        if (data?.user) {
          updateUser(data.user);
        } else {
          updateUser({ avatarUrl: dataUrl });
        }
        if (data?.coinsAwarded && data.coinsAwarded > 0) {
          useCoinStore.getState().optimisticCredit(data.coinsAwarded, 'Milestone: Uploaded Profile Pic');
          toast.success(`🎉 +${data.coinsAwarded} coins! Profile picture milestone unlocked!`);
        } else {
          toast.success('Avatar updated!');
        }
        // Refresh full user to sync coin balance
        await fetchMe();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to upload avatar. Try a smaller image.');
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }
    if (file.size > 1 * 1024 * 1024) {
      toast.error('Image must be under 1 MB. Please compress it or use a smaller photo.');
      if (coverInputRef.current) coverInputRef.current.value = '';
      return;
    }

    setCoverUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await api.patch('/users/me', { coverUrl: dataUrl });
        const data = res.data?.data;
        if (data?.user) {
          updateUser(data.user);
        } else {
          updateUser({ coverUrl: dataUrl });
        }
        toast.success('Cover image updated!');
        await fetchMe();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to upload cover image. Try a smaller image.');
      } finally {
        setCoverUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!user) return null;

  return (
    <>
      <div className="min-h-full">
        <div className="content-wrap py-6 lg:py-8">

          {/* ── Page header ────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
            <h1 className="font-display text-2xl lg:text-3xl font-800" style={{ color: 'var(--text)' }}>
              Profile
            </h1>

            {/* Right side: Coins? + Sign out */}
            <div className="flex items-center gap-2">
              {/* ── Coins? button ── */}
              <button
                onClick={() => setShowCoins(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-body text-sm
                           font-semibold transition-all duration-200 active:scale-95 animate-coin-pulse"
                style={{
                  background: 'var(--accent-sub)',
                  border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                  color: 'var(--accent)',
                }}
              >
                <Zap size={15} style={{ color: 'var(--accent)' }} fill="currentColor" strokeWidth={0} />
                Coins?
                <HelpCircle size={13} style={{ color: 'var(--accent)', opacity: 0.7 }} />
              </button>

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-body text-sm
                           font-medium transition-all active:scale-95"
                style={{
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.2)',
                  background: 'rgba(239,68,68,0.05)',
                }}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>

          {/* ── Two-col grid ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

            {/* ── Left column: identity ─────────────────────────────── */}
            <div className="lg:col-span-1 space-y-5">

              {/* Avatar + name card */}
              <div className="cc-card overflow-hidden">
                {/* Banner */}
                <div className="h-28 relative group overflow-hidden cursor-pointer"
                     onClick={() => coverInputRef.current?.click()}
                     style={{ background: 'linear-gradient(135deg, var(--primary-dk) 0%, var(--card-alt) 100%)' }}>
                  {user.coverUrl ? (
                    <img src={user.coverUrl} alt="Cover" className="w-full h-full object-cover animate-fade-in" />
                  ) : (
                    <div className="absolute inset-0 opacity-20"
                         style={{
                           backgroundImage: 'linear-gradient(var(--bg-grid) 1px,transparent 1px),linear-gradient(90deg,var(--bg-grid) 1px,transparent 1px)',
                           backgroundSize: '18px 18px',
                         }} />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                       style={{ background: 'rgba(0,0,0,0.5)' }}>
                    {coverUploading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
                        <Camera size={14} />
                        Change Cover
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5">
                  {/* Avatar row */}
                  <div className="flex items-end justify-between -mt-8 mb-4">
                    <div className="relative group">
                      <div
                        className="w-[72px] h-[72px] rounded-2xl overflow-hidden cursor-pointer"
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

                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />

                    <button onClick={() => { setEditingBio(true); setBioVal(user.bio ?? ''); }} className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5">
                      <Settings size={12} /> Edit
                    </button>
                  </div>

                  {/* Name + university */}
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

                  {/* Email Verification Banner */}
                  {!user.isVerified && (
                    <div className="mt-3 p-3 rounded-xl flex items-start gap-2 border"
                         style={{ background: 'rgba(124,58,237,0.05)', borderColor: 'rgba(124,58,237,0.2)' }}>
                      <ShieldAlert size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--primary-lt)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-xs font-700" style={{ color: 'var(--text)' }}>
                          Verify email for +50 coins!
                        </p>
                        <p className="font-body text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          Prove you're a student at {user.university}.
                        </p>
                        <button 
                          onClick={() => setShowVerifyModal(true)}
                          className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg w-full transition-all active:scale-95"
                          style={{ background: 'var(--primary-lt)', color: 'white' }}
                        >
                          Verify Now
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bio */}
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
                          <button
                            onClick={() => { setEditingBio(false); setBioVal(user.bio ?? ''); }}
                            className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1"
                          >
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
                      <p className="font-body text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
                        Skills
                      </p>
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
                    ) : user.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {user.skills.map((s) => <span key={s} className="cc-tag">{s}</span>)}
                      </div>
                    ) : (
                      <p className="font-body text-xs" style={{ color: 'var(--text-dim)' }}>No skills added yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Coin balance card */}
              <div
                className="cc-card p-5 space-y-4 cursor-pointer transition-all"
                style={{ border: '1px solid color-mix(in srgb, var(--accent) 22%, transparent)' }}
                onClick={() => setShowCoins(true)}
                title="Learn how coins work"
              >
                <div className="flex items-center justify-between">
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
                  {/* Subtle hint */}
                  <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg"
                       style={{ background: 'var(--accent-sub)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' }}>
                    <HelpCircle size={12} style={{ color: 'var(--accent)' }} />
                    <span className="font-body text-[11px] font-semibold" style={{ color: 'var(--accent)' }}>How?</span>
                  </div>
                </div>

                {locked > 0 && (
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                       style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
                    <span className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>In escrow 🔒</span>
                    <span className="font-mono text-sm" style={{ color: 'var(--primary-lt)' }}>{locked.toLocaleString()}</span>
                  </div>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); setShowSendCoinsModal(true); }}
                  className="btn-neon w-full"
                >
                  Send Coins
                </button>
              </div>
            </div>

            {/* ── Right column: tabs ─────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Tab bar */}
              <div className="flex gap-1 p-1 rounded-2xl w-fit"
                   style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                {([
                  { id: 'tasks' as Tab,    label: 'My Tasks',  icon: ArrowLeftRight },
                  { id: 'activity' as Tab, label: 'Activity',  icon: Clock },
                ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-body text-sm
                               font-semibold transition-all"
                    style={{
                      background: tab === id ? 'var(--bg)' : 'transparent',
                      color:      tab === id ? 'var(--text)' : 'var(--text-dim)',
                      boxShadow:  tab === id ? '0 1px 4px var(--shadow)' : 'none',
                    }}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>

              {/* Tasks tab */}
              {tab === 'tasks' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex gap-1 p-1 rounded-xl w-fit"
                       style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    {(['poster', 'doer'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setTaskRole(r)}
                        className="px-4 py-1.5 rounded-lg font-body text-xs font-semibold capitalize transition-all"
                        style={{
                          background: taskRole === r ? 'var(--bg)' : 'transparent',
                          color:      taskRole === r ? 'var(--text)' : 'var(--text-dim)',
                        }}
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
                      <p className="font-display text-base font-700" style={{ color: 'var(--text-muted)' }}>
                        {taskRole === 'poster' ? 'No tasks posted yet' : 'No tasks taken yet'}
                      </p>
                      <p className="font-body text-sm" style={{ color: 'var(--text-dim)' }}>
                        {taskRole === 'poster'
                          ? 'Head to Tasks to post your first gig.'
                          : 'Browse Tasks to find work.'}
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

              {/* Activity tab */}
              {tab === 'activity' && (
                <div className="animate-fade-in">
                  {txHistory.length === 0 ? (
                    <div className="cc-card p-10 text-center space-y-2">
                      <Clock size={32} className="mx-auto" style={{ color: 'var(--text-dim)' }} strokeWidth={1.5} />
                      <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
                        No transactions yet.
                      </p>
                      <p className="font-body text-xs" style={{ color: 'var(--text-dim)' }}>
                        Post or complete a task to see your coin activity.
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

      {/* ── Coins explainer overlay ─────────────────────────────────── */}
      {showCoins && <CoinsExplainer onClose={() => setShowCoins(false)} />}
      {showVerifyModal && <EmailVerificationModal onClose={() => setShowVerifyModal(false)} />}
      {showSendCoinsModal && <SendCoinsModal onClose={() => setShowSendCoinsModal(false)} />}
    </>
  );
}
