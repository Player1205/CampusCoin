import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center
                  transition-all duration-200 active:scale-90 ${className}`}
      style={{
        background: isDark ? 'rgba(57,255,20,0.08)' : 'rgba(22,163,74,0.1)',
        border: `1px solid ${isDark ? 'rgba(57,255,20,0.25)' : 'rgba(22,163,74,0.25)'}`,
      }}
    >
      {isDark
        ? <Sun  size={16} style={{ color: '#39FF14' }} />
        : <Moon size={16} style={{ color: '#16A34A' }} />
      }
    </button>
  );
}
