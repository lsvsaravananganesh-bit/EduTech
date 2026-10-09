import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex items-center gap-2 p-1.5 rounded-xl transition-all duration-200 border ${
        isDark
          ? 'bg-slate-900 border-lavender-700/60 text-lavender-200 hover:border-pinkpurple-400 hover:text-pinkpurple-300 shadow-glow-lavender/30'
          : 'bg-white border-lavender-200 text-slate-700 hover:border-seagreen-400 hover:text-seagreen-700 shadow-2xs hover:bg-lavender-50/50'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon for Dark Mode (click to switch to Light) */}
        <Sun
          className={`w-4 h-4 text-amber-400 transition-all duration-300 transform absolute ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
          }`}
        />
        {/* Moon Icon for Light Mode (click to switch to Dark) */}
        <Moon
          className={`w-4 h-4 text-lavender-600 transition-all duration-300 transform absolute ${
            !isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-semibold pr-1.5">
          {isDark ? 'Dark Theme' : 'Light Theme'}
        </span>
      )}
    </button>
  );
};
