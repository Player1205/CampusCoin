import { useState, FormEvent } from 'react';
import { Zap, X, AlertCircle } from 'lucide-react';
import { useCoinStore, selectBalance } from '@/store/useCoinStore';
import toast from 'react-hot-toast';

interface SendCoinsModalProps {
  onClose: () => void;
}

export default function SendCoinsModal({ onClose }: SendCoinsModalProps) {
  const [receiverId, setReceiverId] = useState(''); // In a real app, this would be a user search. For now, we take an ID.
  const [amount, setAmount] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const balance = useCoinStore(selectBalance);
  const { sendCoins } = useCoinStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!receiverId.trim()) {
      setError('Please enter a recipient ID.');
      return;
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    
    if (amount > balance) {
      setError('Insufficient balance.');
      return;
    }

    setLoading(true);
    try {
      await sendCoins(receiverId.trim(), amount);
      toast.success(`Successfully sent ${amount} coins!`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send coins.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'var(--overlay)' }} onClick={onClose} />
      <div className="relative w-full lg:max-w-md rounded-t-3xl lg:rounded-3xl p-6 space-y-5 animate-slide-up lg:animate-fade-up"
           style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-700" style={{ color: 'var(--text)' }}>Send Coins</h3>
          <button onClick={onClose} className="btn-ghost !px-2 !py-2"><X size={16} /></button>
        </div>
        
        <div className="rounded-xl p-4 flex items-center justify-between"
             style={{ background: 'var(--accent-sub)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}>
          <span className="font-body text-sm font-medium" style={{ color: 'var(--accent)' }}>Available Balance</span>
          <div className="flex items-center gap-1.5">
            <Zap size={14} style={{ color: 'var(--accent)' }} fill="currentColor" strokeWidth={0} />
            <span className="font-mono text-lg font-700" style={{ color: 'var(--accent)' }}>{balance.toLocaleString()}</span>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="font-body text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-body text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Recipient ID
            </label>
            <input
              type="text"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              placeholder="Enter User ID..."
              className="cc-input"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-body text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
              placeholder="0"
              min="1"
              max={balance}
              className="cc-input font-mono"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-neon w-full mt-2">
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              'Send Coins'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
