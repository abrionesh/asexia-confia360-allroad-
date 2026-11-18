import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  compact = false,
  showDetails = false,
  className = '',
}) => {
  const { toggleTheme, isDark } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        title={
          isDark
            ? 'Cambiar a Modo Día (Aspecto Claro Corporativo)'
            : 'Cambiar a Modo Noche (Tonos Oscuros del Logo)'
        }
        className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center shadow-md active:scale-95 ${
          isDark
            ? 'bg-[#002855] border-[#0284c7]/40 text-amber-300 hover:bg-[#003875] hover:border-[#0284c7]/60 shadow-[0_0_15px_rgba(2,132,199,0.25)]'
            : 'bg-white border-slate-300 text-sky-600 hover:bg-slate-50 hover:border-sky-400 shadow-sm'
        } ${className}`}
        aria-label="Alternar concepto Día y Noche"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-300 transition-transform duration-500 rotate-0 hover:rotate-90" />
        ) : (
          <Moon className="w-4 h-4 text-[#002855] transition-transform duration-500 hover:-rotate-12" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`group relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 cursor-pointer shadow-md select-none active:scale-95 ${
        isDark
          ? 'bg-[#001E3D] hover:bg-[#002855] border-[#0284C7]/40 text-slate-100 shadow-[0_0_18px_rgba(2,132,199,0.2)]'
          : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-900 shadow-sm'
      } ${className}`}
      title={
        isDark
          ? 'Activar Modo Día (Aspecto Claro)'
          : 'Activar Modo Noche (Tonos Oscuros del Logo)'
      }
      aria-label="Alternar aspecto Día y Noche"
    >
      {/* Icon Capsule with Day/Night Graphic */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
          isDark
            ? 'bg-[#001428] text-amber-300 border border-[#0284C7]/50 shadow-[0_0_8px_rgba(2,132,199,0.4)]'
            : 'bg-amber-50 text-amber-600 border border-amber-300 shadow-sm'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-sky-300 fill-sky-300/30" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400/40" />
        )}
      </div>

      {/* Label Text */}
      <div className="flex flex-col text-left">
        <span className="font-extrabold text-[11px] leading-tight flex items-center gap-1">
          {isDark ? 'Modo Noche' : 'Modo Día'}
        </span>
        {showDetails && (
          <span
            className={`text-[9px] font-semibold leading-none ${
              isDark ? 'text-sky-300/80' : 'text-slate-500'
            }`}
          >
            {isDark ? 'Tonos del logo' : 'Aspecto claro'}
          </span>
        )}
      </div>

      {/* Status indicator dot */}
      <span
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          isDark
            ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
            : 'bg-sky-500 shadow-[0_0_8px_#0284c7]'
        }`}
      />
    </button>
  );
};
