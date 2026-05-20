import { useState, useRef, useEffect } from 'react';
import { X, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useCoinStore } from '@/store/useCoinStore';

export default function EmailVerificationModal({ onClose }: { onClose: () => void }) {
  const { user, fetchMe } = useAuthStore();
  const optimisticCredit = useCoinStore((s) => s.optimisticCredit);
  
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'verify' && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [step]);

  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      await api.post('/users/me/send-verification-otp');
      toast.success('OTP sent to your email!');
      setStep('verify');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;

    setIsLoading(true);
    try {
      const res = await api.post('/users/me/verify-email', { otp: code });
      const data = res.data?.data;
      
      // Update local state to sync coins
      await fetchMe();

      if (data?.coinsAwarded) {
        optimisticCredit(data.coinsAwarded, 'Milestone: Verified Email');
        toast.success(`🎉 +${data.coinsAwarded} coins! Email verified successfully!`);
      } else {
        toast.success('Email verified successfully!');
      }

      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Handle pasting multiple digits
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) newOtp[index + i] = pasted[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(index + pasted.length, 5);
      inputsRef.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'Enter' && otp.join('').length === 6) {
      handleVerify();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'var(--overlay)' }} onClick={onClose} />
      
      <div className="relative w-full max-w-md rounded-3xl p-6 space-y-6 animate-fade-up"
           style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
               style={{ background: 'var(--primary-sub)', color: 'var(--primary-lt)' }}>
            {step === 'send' ? <Mail size={24} /> : <ShieldCheck size={24} />}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-display font-800 text-white mb-2">
            {step === 'send' ? 'Verify your Email' : 'Enter OTP'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {step === 'send' 
              ? `We will send a 6-digit code to ${user?.email}. Verifying your email proves you're a real student and grants you a one-time +50 coin bonus!`
              : `Enter the 6-digit code sent to ${user?.email}`
            }
          </p>
        </div>

        {step === 'send' ? (
          <button 
            onClick={handleSendOtp} 
            disabled={isLoading}
            className="btn-neon w-full flex justify-center items-center gap-2"
          >
            {isLoading ? 'Sending...' : 'Send OTP'} <ArrowRight size={16} />
          </button>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl"
                  style={{ 
                    background: 'var(--input-bg)', 
                    border: `1px solid ${digit ? 'var(--primary)' : 'var(--border)'}`,
                    color: 'var(--text)',
                    boxShadow: digit ? '0 0 10px rgba(124,58,237,0.2)' : 'none'
                  }}
                />
              ))}
            </div>
            
            <button 
              onClick={handleVerify} 
              disabled={isLoading || otp.join('').length !== 6}
              className="btn-neon w-full flex justify-center items-center"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
            
            <p className="text-center text-xs" style={{ color: 'var(--text-dim)' }}>
              Didn't receive it? <button onClick={handleSendOtp} className="text-[var(--primary-lt)] hover:underline">Resend OTP</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
