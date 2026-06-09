import { useState } from 'react';

import {
  MessageCircle, Send, Zap, ArrowLeft,
  IndianRupee, ChevronRight, X, Check, Handshake, CheckCircle2,
} from 'lucide-react';
import { useChatList, useChatRoom } from '@/features/chat/hooks/useChat';
import type { Chat, UPIMethodId } from '@/features/chat/types';
import { UPI_METHODS } from '@/features/chat/types';
import { submitTask as apiSubmitTask, completeTask as apiCompleteTask, assignDoer as apiAssignDoer, claimPayment as apiClaimPayment } from '@/features/swap/services/swap.api';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDistanceToNow } from '@/utils/time';
import toast from 'react-hot-toast';

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Av({ name, url, size = 'md' }: { name?: string; url?: string; size?: 'sm' | 'md' | 'lg' }) {
  const dim = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }[size];
  const safeName = name || '?';
  return (
    <div className={`${dim} rounded-xl overflow-hidden shrink-0`}
         style={{ border: '1px solid var(--border)' }}>
      {url
        ? <img src={url} alt={safeName} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center font-display font-700"
               style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--primary-lt)' }}>
            {safeName.charAt(0).toUpperCase()}
          </div>
      }
    </div>
  );
}

// ─── Payment modal ────────────────────────────────────────────────────────────

function PaymentModal({ chat, onClose, onSend }: {
  chat: Chat; onClose: () => void;
  onSend: (method: UPIMethodId, amount: number) => void;
}) {
  const [method,    setMethod]    = useState<UPIMethodId | null>(null);
  const [amount,    setAmount]    = useState(chat.agreedPrice ?? chat.task.coinReward);
  const [step,      setStep]      = useState<'select' | 'confirm'>('select');

  const selectedMethod = UPI_METHODS.find((m) => m.id === method);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'var(--overlay)' }} onClick={onClose} />

      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-5 animate-slide-up sm:animate-fade-up"
           style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>

        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-700" style={{ color: 'var(--text)' }}>
            {step === 'select' ? 'Pay via UPI' : 'Confirm Payment'}
          </h2>
          <button onClick={onClose} className="btn-ghost !px-2 !py-2"><X size={16} /></button>
        </div>

        {step === 'select' && (
          <>
            {/* Amount input */}
            <div className="rounded-2xl p-4 space-y-2"
                 style={{ background: 'var(--card-alt)', border: '1px solid var(--border)' }}>
              <p className="font-body text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Amount (₹)
              </p>
              <div className="flex items-center gap-2">
                <IndianRupee size={20} style={{ color: 'var(--accent)' }} />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="cc-input text-2xl font-mono font-700 !py-1 !border-0 !bg-transparent !shadow-none"
                  style={{ color: 'var(--accent)' }}
                  min={1}
                />
              </div>
              {chat.agreedPrice && (
                <p className="font-body text-xs" style={{ color: 'var(--text-dim)' }}>
                  Agreed: ₹{chat.agreedPrice}
                </p>
              )}
            </div>

            {/* UPI methods */}
            <div className="space-y-2">
              <p className="font-body text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Choose UPI App
              </p>
              <div className="grid grid-cols-2 gap-2">
                {UPI_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150 active:scale-95 text-left"
                    style={{
                      background: method === m.id ? `${m.color}15` : 'var(--card-alt)',
                      border: `1px solid ${method === m.id ? m.color : 'var(--border)'}`,
                    }}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <span className="font-body text-sm font-semibold" style={{ color: method === m.id ? m.color : 'var(--text)' }}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => method && setStep('confirm')}
              disabled={!method || amount < 1}
              className="btn-primary w-full"
            >
              Continue
            </button>
          </>
        )}

        {step === 'confirm' && selectedMethod && (
          <>
            <div className="rounded-2xl p-5 text-center space-y-3"
                 style={{ background: `${selectedMethod.color}10`, border: `1px solid ${selectedMethod.color}30` }}>
              <span className="text-4xl">{selectedMethod.emoji}</span>
              <p className="font-display text-2xl font-800" style={{ color: selectedMethod.color }}>
                ₹{amount}
              </p>
              <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
                via {selectedMethod.label}
              </p>
            </div>

            <div className="rounded-xl p-4 space-y-2"
                 style={{ background: 'var(--card-alt)', border: '1px solid var(--border)' }}>
              <p className="font-body text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Payment Info
              </p>
              <p className="font-body text-sm" style={{ color: 'var(--text)' }}>
                To: <strong>{chat.poster.name}</strong>
              </p>
              <p className="font-body text-sm" style={{ color: 'var(--text)' }}>
                For: <strong>{chat.task.title}</strong>
              </p>
              <div className="cc-divider my-2" />
              <p className="font-body text-xs" style={{ color: 'var(--text-dim)' }}>
                This will open {selectedMethod.label} on your device. Complete the payment there.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('select')} className="btn-ghost flex-1">Back</button>
              <button
                onClick={() => { onSend(method!, amount); onClose(); }}
                className="btn-neon flex-1 flex items-center gap-2"
              >
                <Check size={15} /> Open {selectedMethod.label}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Chat room ────────────────────────────────────────────────────────────────

function ChatRoom({ chatId, onBack }: { chatId: string; onBack: () => void }) {
  const currentUser = useAuthStore((s) => s.user);
  const { chat, isLoading, isSending, sendMessage, setAgreedPrice } = useChatRoom(chatId);
  const [input,       setInput]       = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [priceInput,  setPriceInput]  = useState('');
  const [showPriceBar, setShowPriceBar] = useState(false);
  const [lifecycleLoading, setLifecycleLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary-lt)' }} />
      </div>
    );
  }

  if (!chat) return <div className="flex-1 flex items-center justify-center"><p style={{ color: 'var(--text-muted)' }}>Chat not found.</p></div>;

  const isMe = (sender: any) => {
    const id = typeof sender === 'string' ? sender : sender?._id;
    return id === currentUser?._id;
  };
  const otherUser = chat.poster._id === currentUser?._id ? chat.doer : chat.poster;
  const amIPoster = chat.poster._id === currentUser?._id;

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input.trim());
    setInput('');
  };

  const handlePayment = async (method: UPIMethodId, amount: number) => {
    // Poster claims they have sent payment
    try {
      await apiClaimPayment(chat.task._id);
      toast.success('Payment claim registered! Opening UPI app...');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to register payment.');
      return;
    }

    // Deep link to UPI app
    // We send payment to the Doer
    const payeeName = amIPoster ? chat.doer.name : chat.poster.name;
    const upiLinks: Record<string, string> = {
      phonepe:   `phonepe://pay?pa=upi@ybl&pn=${payeeName}&am=${amount}&cu=INR`,
      gpay:      `tez://upi/pay?pa=upi@oksbi&pn=${payeeName}&am=${amount}&cu=INR`,
      bhim:      `upi://pay?pa=upi@upi&pn=${payeeName}&am=${amount}&cu=INR`,
      paytm:     `paytmmp://upi/pay?pa=paytm@paytm&pn=${payeeName}&am=${amount}&cu=INR`,
      mobikwik:  `mobikwik://upi?pa=upi@okaxis&pn=${payeeName}&am=${amount}`,
      amazonpay: `amazonpay://upi?pa=upi@apl&pn=${payeeName}&am=${amount}`,
    };
    window.location.href = upiLinks[method] ?? `upi://pay?pa=upi@upi&am=${amount}&cu=INR`;
  };

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: '100dvh' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0"
           style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
        <button onClick={onBack} className="p-1.5 rounded-lg active:scale-90 transition-all"
                style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={18} />
        </button>
        <Av name={otherUser.name} url={otherUser.avatarUrl} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-700 truncate" style={{ color: 'var(--text)' }}>
            {otherUser.name}
          </p>
          <p className="font-body text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {chat.task.title} · {chat.task.coinReward} coins
          </p>
        </div>

        {/* Agreed price badge */}
        {chat.agreedPrice && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
               style={{ background: 'var(--accent-sub)', border: '1px solid rgba(22,163,74,0.3)' }}>
            <Handshake size={12} style={{ color: 'var(--accent)' }} />
            <span className="font-mono text-xs font-700" style={{ color: 'var(--accent)' }}>
              {chat.agreedPrice}
            </span>
          </div>
        )}

      </div>

      {/* Task summary banner */}
      <div className="px-4 py-2.5 shrink-0"
           style={{ background: 'var(--card-alt)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>Task:</span>
          <span className="font-body text-xs font-semibold truncate max-w-[200px]" style={{ color: 'var(--text)' }}>
            {chat.task.title}
          </span>
          <div className="flex items-center gap-1">
            <Zap size={11} style={{ color: 'var(--accent)' }} fill="currentColor" strokeWidth={0} />
            <span className="font-mono text-xs font-700" style={{ color: 'var(--accent)' }}>
              {chat.task.coinReward}
            </span>
          </div>

          {/* Negotiate price */}
          {amIPoster && (
            <button
              onClick={() => setShowPriceBar((v) => !v)}
              className="ml-auto font-body text-[11px] px-2.5 py-1 rounded-lg transition-all active:scale-95"
              style={{
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.25)',
                color: 'var(--primary-lt)',
              }}
            >
              💬 Negotiate
            </button>
          )}
        </div>

        {/* Negotiate price bar */}
        {showPriceBar && (
          <div className="flex items-center gap-2 mt-2 animate-fade-in">
            <input
              type="number"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder="Propose price in ₹"
              className="cc-input !py-1.5 text-sm flex-1"
              min={1}
            />
            <button
              onClick={async () => {
                if (priceInput && Number(priceInput) > 0) {
                  await setAgreedPrice(Number(priceInput));
                  setPriceInput('');
                  setShowPriceBar(false);
                }
              }}
              className="btn-primary text-xs px-3 py-1.5"
            >
              Set
            </button>
          </div>
        )}

        {/* Task lifecycle actions */}
        <div className="flex items-center gap-2 mt-2">
          {/* Poster: Assign Task */}
          {amIPoster && chat.task.status === 'open' && (
            <button
              disabled={lifecycleLoading}
              onClick={async () => {
                setLifecycleLoading(true);
                try {
                  await apiAssignDoer(chat.task._id, chat.doer._id);
                  toast.success('Task assigned to this user! 🚀');
                  window.location.reload();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Failed to assign.');
                } finally {
                  setLifecycleLoading(false);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all active:scale-95"
              style={{
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.3)',
                color: 'var(--primary-lt)',
              }}
            >
              {lifecycleLoading
                ? <span className="w-3.5 h-3.5 border-2 border-purple-300/30 border-t-purple-400 rounded-full animate-spin" />
                : <><CheckCircle2 size={13} /> Assign Task</>
              }
            </button>
          )}

          {/* Doer: Mark work as done */}
          {!amIPoster && ['in_progress', 'submitted'].includes(chat.task.status) && (
            <button
              disabled={lifecycleLoading}
              onClick={async () => {
                setLifecycleLoading(true);
                try {
                  await apiSubmitTask(chat.task._id, { submissionNote: 'Work completed.' });
                  toast.success('Work submitted for review! ✅');
                  // Refresh the chat to update task status
                  window.location.reload();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Failed to submit.');
                } finally {
                  setLifecycleLoading(false);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all active:scale-95"
              style={{
                background: 'rgba(22,163,74,0.12)',
                border: '1px solid rgba(22,163,74,0.3)',
                color: 'var(--success, #16A34A)',
              }}
            >
              {lifecycleLoading
                ? <span className="w-3.5 h-3.5 border-2 border-green-300/30 border-t-green-400 rounded-full animate-spin" />
                : <><CheckCircle2 size={13} /> Mark Done</>
              }
            </button>
          )}

          {/* Poster: Approve & Pay */}
          {amIPoster && chat.task.status === 'submitted' && !chat.task.paymentClaimed && (
            <button
              disabled={lifecycleLoading}
              onClick={async () => {
                if (chat.agreedPrice) {
                  setShowPayment(true);
                } else {
                  // If they didn't negotiate, default to the coin reward for fiat mapping
                  // but ideally, they should use the UPI modal always.
                  setShowPayment(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all active:scale-95"
              style={{
                background: 'rgba(22,163,74,0.12)',
                border: '1px solid rgba(22,163,74,0.3)',
                color: 'var(--success, #16A34A)',
              }}
            >
              {lifecycleLoading
                ? <span className="w-3.5 h-3.5 border-2 border-green-300/30 border-t-green-400 rounded-full animate-spin" />
                : <><Check size={13} /> {chat.agreedPrice ? 'Approve and Pay' : 'Approve Task'}</>
              }
            </button>
          )}

          {/* Poster: Payment Claimed Wait State */}
          {amIPoster && chat.task.status === 'submitted' && chat.task.paymentClaimed && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-medium"
                  style={{ background: 'rgba(124,58,237,0.08)', color: 'var(--primary-lt)' }}>
              ⏳ Waiting for Doer to confirm receipt
            </span>
          )}

          {/* Doer sees "Submitted, awaiting poster" or "Poster claims payment" */}
          {!amIPoster && chat.task.status === 'submitted' && (
            <>
              {!chat.task.paymentClaimed ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-medium"
                      style={{ background: 'rgba(124,58,237,0.08)', color: 'var(--primary-lt)' }}>
                  ⏳ Awaiting poster payment
                </span>
              ) : (
                <button
                  disabled={lifecycleLoading}
                  onClick={async () => {
                    setLifecycleLoading(true);
                    try {
                      await apiCompleteTask(chat.task._id, {});
                      toast.success('Receipt confirmed! Escrow released 🎉');
                      window.location.reload();
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Failed to confirm receipt.');
                    } finally {
                      setLifecycleLoading(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-bold transition-all active:scale-95 animate-pulse-soft"
                  style={{
                    background: 'var(--success)',
                    color: 'white',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
                  }}
                >
                  {lifecycleLoading
                    ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><IndianRupee size={13} /> Confirm Payment Received</>
                  }
                </button>
              )}
            </>
          )}

          {/* Completed badge */}
          {chat.task.status === 'completed' && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-semibold"
                  style={{ background: 'rgba(22,163,74,0.12)', color: 'var(--success, #16A34A)' }}>
              <CheckCircle2 size={13} /> Task Completed ✓
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {chat.messages.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle size={32} className="mx-auto mb-2" style={{ color: 'var(--text-dim)' }} strokeWidth={1.5} />
            <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>No messages yet.</p>
          </div>
        )}

        {chat.messages.map((msg) => {
          const mine = isMe(msg.sender);
          const isPayment = msg.type === 'payment_sent' || msg.type === 'payment_request';

          return (
            <div key={msg._id} className={`flex items-end gap-2 animate-chat-in ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
              {!mine && <Av name={msg.sender.name} url={msg.sender.avatarUrl} size="sm" />}

              <div className={`flex flex-col gap-0.5 ${mine ? 'items-end' : 'items-start'}`}>
                {isPayment ? (
                  <div
                    className="px-4 py-3 rounded-2xl space-y-1"
                    style={{
                      background: mine ? 'rgba(22,163,74,0.15)' : 'rgba(22,163,74,0.08)',
                      border: '1px solid rgba(22,163,74,0.3)',
                      maxWidth: '75%',
                    }}
                  >
                    <p className="font-body text-sm font-semibold" style={{ color: 'var(--success)' }}>
                      {msg.content}
                    </p>
                  </div>
                ) : (
                  <div className={mine ? 'chat-bubble-me' : 'chat-bubble-them'}>
                    {msg.content}
                  </div>
                )}
                <span className="font-body text-[10px] px-1" style={{ color: 'var(--text-dim)' }}>
                  {formatDistanceToNow(new Date(msg.createdAt))}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 shrink-0"
           style={{ borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
            placeholder="Type a message…"
            className="cc-input flex-1 !py-2.5"
            maxLength={2000}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="btn-primary !px-3 !py-2.5"
          >
            {isSending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send size={16} />
            }
          </button>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          chat={chat}
          onClose={() => setShowPayment(false)}
          onSend={handlePayment}
        />
      )}
    </div>
  );
}

// ─── Chat list item ───────────────────────────────────────────────────────────

function ChatListItem({ chat, currentUserId, onClick }: {
  chat: Chat; currentUserId: string; onClick: () => void;
}) {
  const other = chat.poster._id === currentUserId ? chat.doer : chat.poster;
  const lastMsg = chat.messages[chat.messages.length - 1];
  const unread  = 0; // future: track read state

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-150 active:scale-[0.99] text-left"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--card-alt)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--card)'; }}
    >
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-xl overflow-hidden"
             style={{ border: '1px solid var(--border)' }}>
          {other.avatarUrl
            ? <img src={other.avatarUrl} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center font-display font-700 text-sm"
                   style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--primary-lt)' }}>
                {other.name.charAt(0)}
              </div>
          }
        </div>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold
                           flex items-center justify-center text-white bg-primary">
            {unread}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-display text-sm font-700 truncate" style={{ color: 'var(--text)' }}>
            {other.name}
          </p>
          {lastMsg && (
            <span className="font-body text-[10px] shrink-0" style={{ color: 'var(--text-dim)' }}>
              {formatDistanceToNow(new Date(lastMsg.createdAt))}
            </span>
          )}
        </div>
        <p className="font-body text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {chat.task.title}
        </p>
        {lastMsg && (
          <p className="font-body text-xs truncate mt-0.5" style={{ color: 'var(--text-dim)' }}>
            {lastMsg.content}
          </p>
        )}
      </div>

      <ChevronRight size={15} className="shrink-0" style={{ color: 'var(--text-dim)' }} />
    </button>
  );
}

// ─── Chat page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const currentUser = useAuthStore((s) => s.user);
  const { chats, isLoading } = useChatList();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  if (!currentUser) return null;

  // Desktop: two-pane; Mobile: stack
  if (activeChatId) {
    return (
      <div className="min-h-full flex">
        {/* Desktop: left pane */}
        <div className="hidden lg:flex flex-col w-80 shrink-0"
             style={{ borderRight: '1px solid var(--border)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h1 className="font-display text-xl font-800" style={{ color: 'var(--text)' }}>Chats</h1>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chats.map((c) => (
              <ChatListItem
                key={c._id}
                chat={c}
                currentUserId={currentUser._id}
                onClick={() => setActiveChatId(c._id)}
              />
            ))}
          </div>
        </div>

        {/* Chat room */}
        <div className="flex-1 flex flex-col" style={{ minHeight: '100dvh' }}>
          <ChatRoom chatId={activeChatId} onBack={() => setActiveChatId(null)} />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-full">
      <div className="content-wrap py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl lg:text-3xl font-800" style={{ color: 'var(--text)' }}>
            Chats
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Conversations with students about tasks
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-stagger">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="cc-card p-12 text-center space-y-4">
            <MessageCircle size={40} className="mx-auto" style={{ color: 'var(--text-dim)' }} strokeWidth={1.5} />
            <div>
              <p className="font-display text-lg font-700" style={{ color: 'var(--text)' }}>
                No chats yet
              </p>
              <p className="font-body text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Find a task you like and click "100% Interested" to start a chat.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 animate-stagger">
            {chats.map((c) => (
              <ChatListItem
                key={c._id}
                chat={c}
                currentUserId={currentUser._id}
                onClick={() => setActiveChatId(c._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
