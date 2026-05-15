import { useState, type FormEvent } from 'react';
import { X, Zap, AlertCircle } from 'lucide-react';
import type { CreateTaskPayload, TaskCategory, TaskUrgency } from '../types';
import { CATEGORY_LABELS, CATEGORY_EMOJI } from '../types';
import { useCoinStore, selectBalance } from '@/store/useCoinStore';

interface PostTaskModalProps {
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
  isLoading: boolean;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as TaskCategory[];

export default function PostTaskModal({ onClose, onSubmit, isLoading }: PostTaskModalProps) {
  const balance = useCoinStore(selectBalance);

  const [form, setForm] = useState<CreateTaskPayload>({
    title:       '',
    description: '',
    category:    'other',
    urgency:     'medium',
    coinReward:  50,
    deadline:    '',
    tags:        [],
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof CreateTaskPayload>(k: K, v: CreateTaskPayload[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !(form.tags ?? []).includes(t) && (form.tags ?? []).length < 5) {
      set('tags', [...(form.tags ?? []), t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) =>
    set('tags', (form.tags ?? []).filter((t) => t !== tag));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.coinReward > balance) {
      setError(`You only have ${balance} coins. Lower the reward.`);
      return;
    }
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post task.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-surface-card border border-surface-border
                      rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up
                      max-h-[92dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-surface-border">
          <div>
            <h2 className="font-display text-xl font-800 text-text-main">Post a Task</h2>
            <p className="font-body text-xs text-text-muted mt-0.5">
              Coins are locked in escrow until completion
            </p>
          </div>
          <button onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center
                             bg-surface-background border border-surface-border
                             hover:border-primary/40 transition-colors active:scale-95">
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                <p className="font-body text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="font-body text-xs font-semibold text-text-muted uppercase tracking-wider">
                Task Title *
              </label>
              <input className="cc-input" required minLength={5} maxLength={100}
                     placeholder="e.g. Help me debug my React app"
                     value={form.title} onChange={(e) => set('title', e.target.value)} />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="font-body text-xs font-semibold text-text-muted uppercase tracking-wider">
                Description *
              </label>
              <textarea className="cc-input min-h-[100px] resize-none" required
                        minLength={20} maxLength={2000}
                        placeholder="Describe what needs to be done, any requirements, expected output…"
                        value={form.description}
                        onChange={(e) => set('description', e.target.value)} />
            </div>

            {/* Category grid */}
            <div className="space-y-2">
              <label className="font-body text-xs font-semibold text-text-muted uppercase tracking-wider">
                Category *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat} type="button"
                          onClick={() => set('category', cat)}
                          className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border
                                      text-center transition-all duration-150 active:scale-95 ${
                            form.category === cat
                              ? 'border-primary bg-primary/10 text-primary-light'
                              : 'border-surface-border text-text-dim hover:border-surface-border/80'
                          }`}>
                    <span className="text-lg">{CATEGORY_EMOJI[cat]}</span>
                    <span className="font-body text-[10px] font-medium leading-tight">
                      {CATEGORY_LABELS[cat]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency + Reward row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-body text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Urgency
                </label>
                <select className="cc-input appearance-none"
                        value={form.urgency}
                        onChange={(e) => set('urgency', e.target.value as TaskUrgency)}>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-body text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Coin Reward *
                </label>
                <div className="relative">
                  <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neon" />
                  <input type="number" className="cc-input pl-8" required
                         min={5} max={5000} step={5}
                         value={form.coinReward}
                         onChange={(e) => set('coinReward', Number(e.target.value))} />
                </div>
                <p className="font-body text-[11px] text-text-dim">
                  Balance: <span className="text-neon">{balance}</span>
                </p>
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="font-body text-xs font-semibold text-text-muted uppercase tracking-wider">
                Deadline <span className="normal-case text-text-dim font-normal">(optional)</span>
              </label>
              <input type="datetime-local" className="cc-input"
                     min={new Date().toISOString().slice(0, 16)}
                     value={form.deadline ?? ''}
                     onChange={(e) => set('deadline', e.target.value || undefined)} />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="font-body text-xs font-semibold text-text-muted uppercase tracking-wider">
                Tags <span className="normal-case text-text-dim font-normal">(up to 5)</span>
              </label>
              <div className="flex gap-2">
                <input className="cc-input flex-1" placeholder="e.g. python, figma, urgent…"
                       value={tagInput}
                       onChange={(e) => setTagInput(e.target.value)}
                       onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                <button type="button" onClick={addTag} className="btn-ghost px-3 py-2 shrink-0">
                  Add
                </button>
              </div>
              {(form.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(form.tags ?? []).map((tag) => (
                    <span key={tag}
                          className="cc-tag cursor-pointer hover:border-red-500/40 hover:text-red-400
                                     transition-colors duration-150"
                          onClick={() => removeTag(tag)}>
                      {tag} ×
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="btn-neon w-full mt-2">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-surface-background/30
                                   border-t-surface-background rounded-full animate-spin" />
                  Posting…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap size={15} fill="currentColor" strokeWidth={0} />
                  Post Gig — lock {form.coinReward} coins
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
