import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      {/* Background accent blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, #39FF14, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-sm space-y-8 animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-violet">
            <Zap size={28} className="text-white" fill="white" strokeWidth={0} />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-800 text-text-main">Welcome back</h1>
            <p className="font-body text-sm text-text-muted mt-1">Sign in to your CampusCoin account</p>
          </div>
        </div>

        {/* Form card */}
        <div className="cc-card p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="font-body text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-body text-xs font-semibold text-text-muted uppercase tracking-wider">
                University Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  required
                  className="cc-input pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-body text-xs font-semibold text-text-muted uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="cc-input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center font-body text-sm text-text-muted">
          No account?{' '}
          <Link to="/register" className="text-primary-light hover:text-primary transition-colors font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
