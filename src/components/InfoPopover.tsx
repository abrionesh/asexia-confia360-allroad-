import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface InfoPopoverProps {
  title: string;
  meaning: string;
  impact: string;
  align?: 'left' | 'right' | 'center';
}

export const InfoPopover: React.FC<InfoPopoverProps> = ({
  title,
  meaning,
  impact,
  align = 'left',
}) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [horizontalShift, setHorizontalShift] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const clearPendingClose = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Clamp horizontal position within viewport on narrow/mobile screens
  useEffect(() => {
    if (!isOpen || !popoverRef.current) {
      setHorizontalShift(0);
      return;
    }
    const rect = popoverRef.current.getBoundingClientRect();
    const margin = 12;
    let shift = 0;
    if (rect.left < margin) {
      shift = margin - rect.left;
    } else if (rect.right > window.innerWidth - margin) {
      shift = window.innerWidth - margin - rect.right;
    }
    if (shift !== 0) {
      setHorizontalShift(shift);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => clearPendingClose();
  }, []);

  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
      clearPendingClose();
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
      clearPendingClose();
      closeTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(false);
      }, 130);
    }
  };

  const alignClasses =
    align === 'right'
      ? 'right-0'
      : align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'left-0';

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-flex items-center shrink-0"
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        aria-label={`Información sobre ${title}`}
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          isOpen
            ? 'text-emerald-500 bg-emerald-500/15'
            : isDark
            ? 'text-slate-400 hover:text-sky-400 hover:bg-[#002855]'
            : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
        }`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={title}
          style={
            horizontalShift !== 0
              ? { transform: `translateX(${horizontalShift}px)` }
              : undefined
          }
          className={`absolute bottom-full mb-2 z-50 w-64 sm:w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border p-3.5 shadow-2xl text-left backdrop-blur-xl ${alignClasses} ${
            isDark
              ? 'bg-[#001428]/95 border-[#0284C7]/45 text-slate-100 shadow-[0_14px_35px_rgba(0,8,24,0.85)]'
              : 'bg-white/98 border-slate-200 text-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.16)]'
          }`}
        >
          <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-slate-700/20">
            <span className={`text-xs font-extrabold leading-snug ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
              {title}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              aria-label="Cerrar ayuda"
              className={`p-0.5 rounded-md transition cursor-pointer shrink-0 ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-[11px] leading-relaxed">
            <div>
              <div className={`font-bold ${isDark ? 'text-sky-400' : 'text-blue-700'}`}>
                Qué significa
              </div>
              <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>{meaning}</p>
            </div>

            <div className={`pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="font-bold text-emerald-500">Cómo influye en tu ahorro</div>
              <p className={isDark ? 'text-slate-200' : 'text-slate-700'}>{impact}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
