import { useState } from 'react';
import { X, Zap, Shield, AlertTriangle, ChevronDown, ChevronUp, Sparkles, Star, Flame, Clock } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  border: string;
  content: React.ReactNode;
}

// ─── Coin row component ───────────────────────────────────────────────────────

function CoinRow({
  icon, label, amount, positive, note,
}: {
  icon: React.ReactNode;
  label: string;
  amount: string;
  positive: boolean;
  note?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3"
         style={{ borderBottom: '1px solid var(--border-sub)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
           style={{ background: positive ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.10)' }}>
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-semibold" style={{ color: 'var(--text)' }}>{label}</p>
        {note && <p className="font-body text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{note}</p>}
      </div>
      <span
        className="font-mono text-sm font-800 shrink-0"
        style={{ color: positive ? 'var(--success, #16A34A)' : '#ef4444' }}
      >
        {positive ? '+' : ''}{amount}
      </span>
    </div>
  );
}

// ─── Accordion section ────────────────────────────────────────────────────────

function AccordionSection({ section, defaultOpen = false }: { section: Section; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
         style={{ border: `1px solid ${section.border}`, background: section.bg }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-150"
      >
        <span className="text-2xl leading-none">{section.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-display text-base font-700" style={{ color: section.color }}>{section.title}</p>
          <p className="font-body text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{section.subtitle}</p>
        </div>
        <div style={{ color: 'var(--text-dim)' }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 animate-fade-in">
          <div className="cc-divider mb-4" />
          {section.content}
        </div>
      )}
    </div>
  );
}

// ─── Quick stat pill ──────────────────────────────────────────────────────────

function StatPill({ emoji, value, label, color }: { emoji: string; value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl flex-1 text-center"
         style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <span className="text-xl">{emoji}</span>
      <span className="font-mono text-xl font-800" style={{ color }}>{value}</span>
      <span className="font-body text-[10px] leading-tight" style={{ color: 'var(--text-dim)' }}>{label}</span>
    </div>
  );
}

// ─── Loophole card ────────────────────────────────────────────────────────────

function LoopholeCard({ problem, fix }: { problem: string; fix: string }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <div className="px-4 py-3 flex items-start gap-2.5"
           style={{ background: 'rgba(239,68,68,0.07)' }}>
        <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
        <div>
          <p className="font-body text-xs font-semibold" style={{ color: '#ef4444' }}>The Problem</p>
          <p className="font-body text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{problem}</p>
        </div>
      </div>
      <div className="px-4 py-3 flex items-start gap-2.5"
           style={{ background: 'rgba(22,163,74,0.07)' }}>
        <Shield size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--success, #16A34A)' }} />
        <div>
          <p className="font-body text-xs font-semibold" style={{ color: 'var(--success, #16A34A)' }}>The Fix</p>
          <p className="font-body text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{fix}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Explainer ───────────────────────────────────────────────────────────

interface CoinsExplainerProps {
  onClose: () => void;
}

export default function CoinsExplainer({ onClose }: CoinsExplainerProps) {

  const sections: Section[] = [
    {
      id: 'earn',
      emoji: '📈',
      title: 'How You Earn Coins',
      subtitle: 'Do good things → get coins',
      color: 'var(--success, #16A34A)',
      bg: 'rgba(22,163,74,0.04)',
      border: 'rgba(22,163,74,0.2)',
      content: (
        <div className="space-y-1">
          <CoinRow icon="🎁" label="Join CampusCoin" amount="+100" positive note="One-time welcome bonus on signup" />
          <CoinRow icon="✅" label="Complete a task successfully" amount="+10" positive note="When the poster clicks Approve — the main way to earn" />
          <CoinRow icon="❤️" label="Someone likes your Flex post" amount="+1" positive note="Max +10 coins per day from likes (anti-farming cap)" />
          <CoinRow icon="📧" label="Verify your .edu email" amount="+50" positive note="One-time milestone — proves you're a real student" />
          <CoinRow icon="📸" label="Upload a profile picture" amount="+20" positive note="One-time milestone — builds trust with other students" />
          <CoinRow icon="🛠️" label="Add 3+ skills to your profile" amount="+10" positive note="One-time milestone — helps others find you" />
          <CoinRow icon="🔥" label="Daily login streak (Day 1)" amount="+1" positive note="Opens app every day — goes up to +5 on Day 5" />
          <CoinRow icon="🔥" label="Daily login streak (Day 5)" amount="+5" positive note="Cap — keeps rewarding you for staying active" />
          <CoinRow icon="👥" label="Referral bonus" amount="+50" positive note="When the friend YOU invited completes their first task (not just signs up)" />
        </div>
      ),
    },
    {
      id: 'spend',
      emoji: '📉',
      title: 'Where Coins Are Spent',
      subtitle: 'Coins keep the platform spam-free',
      color: '#f97316',
      bg: 'rgba(249,115,22,0.04)',
      border: 'rgba(249,115,22,0.2)',
      content: (
        <div className="space-y-4">
          <div className="space-y-1">
            <CoinRow icon="📋" label="Post a task" amount="−15" positive={false} note="Prevents spam — you can't flood the feed with junk tasks" />
            <CoinRow icon="🔥" label="Click 100% Interested on a task" amount="−2" positive={false} note="Prevents spamming every single task listing" />
            <CoinRow icon="⚡" label="Boost a task to the top of the feed" amount="−50" positive={false} note="Your task glows neon and stays pinned — useful for urgent work" />
            <CoinRow icon="⭐" label="Buy a 'Pro Helper' badge for your profile" amount="−500" positive={false} note="Permanent neon badge — shows you're a trusted high-achiever" />
            <CoinRow icon="💸" label="Tip someone on a Flex post" amount="Custom" positive={false} note="Optional — reward great study notes or helpful answers" />
          </div>

          <div className="rounded-xl p-4 space-y-2"
               style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <p className="font-display text-sm font-700" style={{ color: '#f97316' }}>
              💡 Why does it cost coins to post a task?
            </p>
            <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
              Without a cost, students could post 100 fake or low-effort tasks just to test the app. The 15-coin listing fee means every task on the feed is from someone who actually has skin in the game. It keeps the marketplace clean and serious.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'upi',
      emoji: '💳',
      title: 'Real Money vs. Coins',
      subtitle: 'Coins ≠ Rupees. They do different jobs.',
      color: '#a78bfa',
      bg: 'rgba(124,58,237,0.04)',
      border: 'rgba(124,58,237,0.2)',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-4 space-y-2"
                 style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
              <p className="font-display text-sm font-700" style={{ color: 'var(--success, #16A34A)' }}>
                💰 Real Rupees (UPI)
              </p>
              <ul className="space-y-1">
                {['Actual payment for work done', 'Negotiated in chat', 'Sent via PhonePe / GPay / BHIM etc.', 'Goes directly student → student'].map((t) => (
                  <li key={t} className="font-body text-xs flex items-start gap-1.5" style={{ color: 'var(--text-muted)' }}>
                    <span className="mt-0.5 shrink-0">→</span> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl p-4 space-y-2"
                 style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <p className="font-display text-sm font-700" style={{ color: '#f97316' }}>
                🪙 CampusCoins
              </p>
              <ul className="space-y-1">
                {['Right to use the platform', 'Earned by helping others', 'Spent to post & apply', 'Rewards good behaviour'].map((t) => (
                  <li key={t} className="font-body text-xs flex items-start gap-1.5" style={{ color: 'var(--text-muted)' }}>
                    <span className="mt-0.5 shrink-0">→</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
            Think of <strong style={{ color: 'var(--text)' }}>Rupees</strong> as the actual salary for a job, and <strong style={{ color: 'var(--text)' }}>CampusCoins</strong> as the membership card that lets you post jobs and apply for them. Both matter, but they do completely different things.
          </p>
        </div>
      ),
    },
    {
      id: 'math',
      emoji: '🧮',
      title: 'The Coin Math (Simple Version)',
      subtitle: 'How coins flow in and out',
      color: '#60a5fa',
      bg: 'rgba(96,165,250,0.04)',
      border: 'rgba(96,165,250,0.2)',
      content: (
        <div className="space-y-4">
          <div className="rounded-xl p-4 space-y-3"
               style={{ background: 'var(--card-alt)', border: '1px solid var(--border)' }}>
            <p className="font-display text-sm font-700" style={{ color: 'var(--text)' }}>
              A typical month for an active student:
            </p>
            <div className="space-y-2 font-body text-sm">
              {[
                { t: 'Start of month balance',       a: '100',  c: 'var(--text)'  },
                { t: 'Post 2 tasks',                 a: '−30',  c: '#ef4444'      },
                { t: 'Apply for 5 tasks',            a: '−10',  c: '#ef4444'      },
                { t: 'Complete 3 tasks for others',  a: '+30',  c: '#16A34A'      },
                { t: 'Get 40 likes on Flex posts',   a: '+10',  c: '#16A34A'      },
                { t: '20-day login streak',          a: '+55',  c: '#16A34A'      },
              ].map(({ t, a, c }) => (
                <div key={t} className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-muted)' }}>{t}</span>
                  <span className="font-mono font-700" style={{ color: c }}>{a}</span>
                </div>
              ))}
              <div className="cc-divider" />
              <div className="flex justify-between items-center">
                <span className="font-semibold" style={{ color: 'var(--text)' }}>End of month</span>
                <span className="font-mono font-800 text-base" style={{ color: 'var(--accent)' }}>155 coins</span>
              </div>
            </div>
          </div>
          <p className="font-body text-xs" style={{ color: 'var(--text-dim)' }}>
            Active helpers always accumulate more than they spend. The system is designed so that if you're genuinely helping your campus, you'll never run out.
          </p>
        </div>
      ),
    },
    {
      id: 'loopholes',
      emoji: '🛡️',
      title: 'Loopholes We\'ve Fixed',
      subtitle: 'Why you can\'t game the system',
      color: '#f43f5e',
      bg: 'rgba(244,63,94,0.04)',
      border: 'rgba(244,63,94,0.2)',
      content: (
        <div className="space-y-4">
          <LoopholeCard
            problem={"Two friends could post fake tasks and keep completing each other's work. Student A posts (−10 coins). Student B completes (+15 coins). Net gain: +5 coins. Loop this 100 times."}
            fix="Listing fee is −15 coins. Completion bonus is only +10 coins. If two people try this trick, they lose 5 coins per loop. Fake task farming now loses money instead of making it."
          />
          <LoopholeCard
            problem={"A group of friends could spam-like each other's Flex posts all day to farm coins without doing any real work."}
            fix="Like rewards are capped at +10 coins per day, per person. No matter how many likes you get, you stop earning from them after your first 10 for that day."
          />
          <LoopholeCard
            problem="A student could create 50 fake accounts just to trigger referral bonuses by having those fake accounts sign up with their referral code."
            fix="You only get your +50 referral bonus AFTER the person you referred completes their very first real task. Fake accounts that never do real work = zero reward for the inviter."
          />
          <LoopholeCard
            problem="Power users who complete dozens of tasks accumulate thousands of coins with nothing to spend them on, making coins feel worthless to them."
            fix="Vanity sinks: spend 500 coins on a permanent 'Pro Helper' neon badge, or tip coins to students who share great study notes. High earners always have something desirable to spend on."
          />
        </div>
      ),
    },
    {
      id: 'bankrupt',
      emoji: '😬',
      title: 'What If You Run Out of Coins?',
      subtitle: 'You\'re not stuck forever',
      color: '#fbbf24',
      bg: 'rgba(251,191,36,0.04)',
      border: 'rgba(251,191,36,0.2)',
      content: (
        <div className="space-y-4">
          <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
            If your balance hits 0 and you need to post a task, here's what you can do:
          </p>
          <div className="space-y-3">
            {[
              {
                n: '1', title: 'Open the app every day',
                body: 'The daily login streak gives you +1 to +5 coins a day. After 5 days you\'ll have enough to apply for tasks again (each application costs 2 coins). Small but guaranteed.',
                icon: <Clock size={16} />, color: '#fbbf24',
              },
              {
                n: '2', title: 'Help someone else first',
                body: 'Browse the Tasks feed — find something you can actually do. Completing even one task gives you +10 coins, which is enough to post your own task afterward.',
                icon: <Flame size={16} />, color: '#f97316',
              },
              {
                n: '3', title: 'Post something great on Flex',
                body: 'Share useful study notes, a helpful how-to, or a skill offer. If it gets 10 likes, you\'ve earned your daily maximum of +10 coins from the community.',
                icon: <Sparkles size={16} />, color: '#a78bfa',
              },
              {
                n: '4', title: 'Complete your profile milestones',
                body: 'Haven\'t verified your email (+50), uploaded a photo (+20), or added skills (+10) yet? Do those first — they\'re the fastest 80 free coins you\'ll ever get.',
                icon: <Star size={16} />, color: '#60a5fa',
              },
            ].map(({ title, body, icon, color }) => (
              <div key={title} className="flex items-start gap-3 p-4 rounded-xl"
                   style={{ background: 'var(--card-alt)', border: '1px solid var(--border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                     style={{ background: `${color}18`, color }}>
                  {icon}
                </div>
                <div>
                  <p className="font-display text-sm font-700" style={{ color: 'var(--text)' }}>{title}</p>
                  <p className="font-body text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-4"
               style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
            <p className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>
              <strong style={{ color: '#fbbf24' }}>Coming soon:</strong> If all else fails, you'll be able to top up with a small real-money purchase (₹50 for 100 coins). This is a safety net for students who genuinely need help but can't complete tasks right now.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'var(--overlay)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full sm:max-w-2xl flex flex-col animate-slide-up sm:animate-fade-up
                   rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          maxHeight: '92dvh',
          boxShadow: '0 -8px 40px var(--shadow-lg)',
        }}
      >

        {/* ── Sticky header ─────────────────────────────────────────── */}
        <div
          className="flex items-center gap-4 px-5 py-4 shrink-0"
          style={{
            borderBottom: '1px solid var(--border)',
            background: 'var(--card)',
          }}
        >
          {/* Coin icon */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 animate-coin-pulse"
            style={{
              background: 'var(--accent-sub)',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            }}
          >
            <Zap size={20} style={{ color: 'var(--accent)' }} fill="currentColor" strokeWidth={0} />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-800" style={{ color: 'var(--text)' }}>
              How CampusCoins Work
            </h2>
            <p className="font-body text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Everything you need to know, in plain English
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                       transition-all active:scale-90"
            style={{ background: 'var(--card-alt)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Quick stats ────────────────────────────────────────────── */}
        <div className="px-5 py-4 shrink-0"
             style={{ borderBottom: '1px solid var(--border)', background: 'var(--card-alt)' }}>
          <div className="flex gap-3">
            <StatPill emoji="🎁" value="100" label="Start free" color="var(--accent)" />
            <StatPill emoji="✅" value="+10" label="Per task done" color="#16A34A" />
            <StatPill emoji="📋" value="−15" label="Post a task" color="#ef4444" />
            <StatPill emoji="🔥" value="−2" label="Per apply" color="#f97316" />
          </div>
        </div>

        {/* ── The one-line summary ───────────────────────────────────── */}
        <div className="px-5 pt-4 pb-2 shrink-0">
          <div
            className="rounded-2xl px-4 py-3.5"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(57,255,20,0.05))',
              border: '1px solid rgba(124,58,237,0.2)',
            }}
          >
            <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
              <strong style={{ color: 'var(--primary-lt)' }}>TL;DR:</strong> Coins are your campus reputation score turned into currency. Help others → earn coins → spend them to get help yourself. The more you give, the more you can take.
            </p>
          </div>
        </div>

        {/* ── Scrollable sections ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3 mt-3">
          {sections.map((section, i) => (
            <AccordionSection
              key={section.id}
              section={section}
              defaultOpen={i === 0}
            />
          ))}

          {/* Footer note */}
          <div className="text-center pt-2">
            <p className="font-body text-xs" style={{ color: 'var(--text-dim)' }}>
              CampusCoins have no real-money value and cannot be cashed out.
            </p>
            <p className="font-body text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
              They exist purely to keep the platform healthy and reward good students.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
