import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  id?: string;
  variant?: 'icon' | 'compact' | 'pill' | 'expanded';
  className?: string;
  onThemeChange?: (newTheme: 'dark' | 'light') => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  id = 'global-theme-toggle',
  variant = 'compact',
  className = '',
  onThemeChange
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const handleToggle = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    toggleTheme();
    if (onThemeChange) {
      onThemeChange(nextTheme);
    }
  };

  const titleText = isDark
    ? 'Switch to High-Contrast Light Theme'
    : 'Switch to Dark Theme';

  if (variant === 'icon') {
    return (
      <button
        id={id}
        onClick={handleToggle}
        title={titleText}
        aria-label={titleText}
        className={`p-2 rounded-md transition-all duration-150 flex items-center justify-center ${
          isDark
            ? 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200'
        } ${className}`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 hover:rotate-12 transition-transform" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
        )}
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-lg border text-xs font-medium ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
            : 'bg-neutral-100 border-neutral-300 text-neutral-600'
        } ${className}`}
      >
        <button
          id={`${id}-dark`}
          onClick={() => {
            if (!isDark) {
              toggleTheme();
              onThemeChange?.('dark');
            }
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
            isDark
              ? 'bg-neutral-800 text-white font-semibold shadow-xs'
              : 'hover:text-neutral-900'
          }`}
          title="Dark Theme"
        >
          <Moon className="w-3.5 h-3.5 text-neutral-300" />
          <span>Dark</span>
        </button>
        <button
          id={`${id}-light`}
          onClick={() => {
            if (isDark) {
              toggleTheme();
              onThemeChange?.('light');
            }
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
            !isDark
              ? 'bg-white text-neutral-950 font-bold shadow-xs border border-neutral-300'
              : 'hover:text-neutral-200'
          }`}
          title="High-Contrast Light Theme"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>
      </div>
    );
  }

  if (variant === 'expanded') {
    return (
      <button
        id={id}
        onClick={handleToggle}
        title={titleText}
        aria-label={titleText}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
          isDark
            ? 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
            : 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950 shadow-xs'
        } ${className}`}
      >
        <div className="flex items-center gap-2">
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
          <span>Theme: {isDark ? 'Dark Mode' : 'High-Contrast Light'}</span>
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
            isDark
              ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
              : 'bg-neutral-200 text-neutral-900 border border-neutral-300'
          }`}
        >
          {isDark ? 'Dark' : 'Light HC'}
        </span>
      </button>
    );
  }

  // Default 'compact' button
  return (
    <button
      id={id}
      onClick={handleToggle}
      title={titleText}
      aria-label={titleText}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all ${
        isDark
          ? 'bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-200 border-neutral-700'
          : 'bg-white hover:bg-neutral-100 text-neutral-900 border-neutral-300 shadow-xs'
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Dark Mode</span>
        </>
      )}
    </button>
  );
};
