import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const FloatingThemeDock: React.FC = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <div className="fixed bottom-6 left-6 z-40 hidden md:block">
      <div
        className={`flex items-center gap-2 p-1.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 ${
          isDark
            ? 'bg-[#001E3D]/90 border-[#0284C7]/40 shadow-[0_4px_24px_rgba(0,24,51,0.6)]'
            : 'bg-white/95 border-slate-300/80 shadow-[0_4px_20px_rgba(0,0,0,0.12)]'
        }`}
      >
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer select-none active:scale-95 ${
            isDark
              ? 'bg-gradient-to-r from-[#002855] to-[#003B7A] text-white border border-[#0284C7]/50 shadow-md'
              : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
          }`}
          title="Alternar entre Aspecto Claro (Día) y Tonos Oscuros del Logo (Noche)"
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-sky-300 fill-sky-300/30" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400/40" />
          )}
          <span className="text-[11px] tracking-tight">
            {isDark ? 'Modo Noche (Logo)' : 'Modo Día (Claro)'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDark ? 'bg-emerald-400 shadow-[0_0_6px_#10B981]' : 'bg-amber-400 shadow-[0_0_6px_#F59E0B]'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
