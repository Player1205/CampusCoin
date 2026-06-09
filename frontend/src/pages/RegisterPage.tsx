import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Building2, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    department: '',
  });
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await register(form);
      toast.success(`Welcome to CampusCoin! You received 100 starter coins 🎉`);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    }
  };

  const fields: { key: keyof typeof form; label: string; type: string; placeholder: string; icon: React.ElementType; required: boolean }[] = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Ada Lovelace', icon: User, required: true },
    { key: 'email', label: 'University Email', type: 'email', placeholder: 'you@cuchd.in', icon: Mail, required: true },
    { key: 'university', label: 'University', type: 'text', placeholder: 'MIT, Stanford, IIT…', icon: Building2, required: true },
    { key: 'department', label: 'Department (optional)', type: 'text', placeholder: 'Computer Science', icon: Building2, required: false },
    { key: 'password', label: 'Password', type: 'password', placeholder: '8+ chars, 1 uppercase, 1 number', icon: Lock, required: true },
    { key: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••', icon: Lock, required: true },
  ];

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, #39FF14, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-sm space-y-8 animate-fade-up">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-violet">
            <Zap size={28} className="text-white" fill="white" strokeWidth={0} />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-800 text-text-main">Join CampusCoin</h1>
            <p className="font-body text-sm text-text-muted mt-1">
              Start with <span className="text-neon font-semibold">100 free coins</span> 🎉
            </p>
          </div>
        </div>

        <div className="cc-card p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="font-body text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, type, placeholder, icon: Icon, required }) => (
              <div key={key} className="space-y-1.5">
                <label className="font-body text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {label}
                </label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
                  <input
                    type={type}
                    value={form[key]}
                    onChange={set(key)}
                    placeholder={placeholder}
                    required={required}
                    className="cc-input pl-10"
                  />
                </div>
              </div>
            ))}

            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center font-body text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-light hover:text-primary transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
