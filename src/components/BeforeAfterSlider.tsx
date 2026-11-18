import React, { useState, useRef } from 'react';
import {
  Sparkles,
  XCircle,
  CheckCircle,
  TrendingUp,
  Clock,
  Star,
  ArrowDown,
  MoveHorizontal
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

type MobileViewMode = 'both' | 'before' | 'after';

export const BeforeAfterSlider: React.FC = () => {
  const { isDark } = useTheme();
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mobileView, setMobileView] = useState<MobileViewMode>('both');
  const [beforeImgError, setBeforeImgError] = useState(false);
  const [afterImgError, setAfterImgError] = useState(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    handleMove(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging || e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const beforePoints = [
    'Web lenta, anticuada y no adaptada a teléfonos móviles',
    'Llamadas en horas punta que se pierden sin poder responder',
    'Horas perdidas anotando citas a mano en libretas o Excel',
    'Cero reseñas nuevas en Google y pérdida de visibilidad local',
  ];

  const afterPoints = [
    'Carta y web rápida 100% móvil con reservas automáticas',
    'Agente IA que responde y confirma en WhatsApp al instante',
    'Ahorro de más de 18 horas semanales en papeleo y teléfono',
    '+340% reseñas verificadas de 5 estrellas en Google Maps',
  ];

  return (
    <div className="w-full max-w-5xl mx-auto my-6 sm:my-8">
      {/* =====================================================================
          MOBILE VIEW (< 768px): 1. ANTES PRIMERO -> 2. DESPUÉS DESPUÉS
          Zero clipping, full-bleed responsive images, crystal clear legibility
         ===================================================================== */}
      <div className="md:hidden space-y-4">
        {/* Mobile Quick Filter Tabs */}
        <div
          className={`grid grid-cols-3 gap-1.5 p-1 rounded-2xl border text-[11px] font-bold ${
            isDark
              ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-300'
              : 'bg-white border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <button
            type="button"
            onClick={() => setMobileView('both')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer ${
              mobileView === 'both'
                ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-sm'
                : 'hover:opacity-80'
            }`}
          >
            Antes → Después
          </button>
          <button
            type="button"
            onClick={() => setMobileView('before')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer ${
              mobileView === 'before'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'hover:opacity-80'
            }`}
          >
            1. Antes
          </button>
          <button
            type="button"
            onClick={() => setMobileView('after')}
            className={`py-2 px-2 rounded-xl transition cursor-pointer ${
              mobileView === 'after'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'hover:opacity-80'
            }`}
          >
            2. Después
          </button>
        </div>

        {/* CARD 1: ANTES (ALWAYS FIRST) */}
        {(mobileView === 'both' || mobileView === 'before') && (
          <div className="relative rounded-3xl overflow-hidden border border-rose-500/40 bg-slate-950 text-white shadow-xl">
            {/* Image Header */}
            <div className="relative h-40 w-full bg-gradient-to-br from-slate-900 via-rose-950/50 to-slate-950 overflow-hidden">
              {!beforeImgError && (
                <img
                  src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=900&q=80"
                  alt="Negocio tradicional sin digitalizar"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setBeforeImgError(true)}
                  className="w-full h-full object-cover object-center filter brightness-[0.45] grayscale"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20" />
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/35 border border-rose-400/50 text-rose-100 font-extrabold text-[11px] backdrop-blur-md">
                  <XCircle className="w-3.5 h-3.5 text-rose-300" />
                  1. ANTES (SISTEMA MANUAL)
                </span>
              </div>
              <div className="absolute bottom-2.5 left-4 right-4">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-rose-500/25 text-rose-200 text-[10px] font-bold border border-rose-500/30">
                  Situación previa sin sistema digital
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 space-y-3.5 text-left">
              <h4 className="text-lg font-black text-slate-100 leading-snug">
                Llamadas sin contestar, tareas en papel y web obsoleta
              </h4>

              <div className="space-y-2 text-xs text-slate-300">
                {beforePoints.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-rose-200/90">
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2.5">
                <div className="bg-slate-900 border border-rose-500/30 px-3 py-2 rounded-xl text-center">
                  <div className="text-rose-400 font-black text-sm">-35%</div>
                  <div className="text-[10px] text-slate-400">Clientes perdidos</div>
                </div>
                <div className="bg-slate-900 border border-rose-500/30 px-3 py-2 rounded-xl text-center">
                  <div className="text-rose-400 font-black text-sm">3.4 ★</div>
                  <div className="text-[10px] text-slate-400">Pocas opiniones</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transition Connector in Both View */}
        {mobileView === 'both' && (
          <div className="flex items-center justify-center py-0.5">
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-extrabold ${
                isDark
                  ? 'bg-[#001E3D] border-emerald-500/40 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-700'
              }`}
            >
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
              <span>Transformación Digital con Asexia</span>
            </div>
          </div>
        )}

        {/* CARD 2: DESPUÉS (ALWAYS SECOND) */}
        {(mobileView === 'both' || mobileView === 'after') && (
          <div className="relative rounded-3xl overflow-hidden border border-emerald-500/50 bg-slate-950 text-white shadow-2xl">
            {/* Image Header */}
            <div className="relative h-40 w-full bg-gradient-to-br from-[#001E3D] via-sky-900/60 to-emerald-950 overflow-hidden">
              {!afterImgError && (
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80"
                  alt="Negocio moderno conectado con Asexia"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setAfterImgError(true)}
                  className="w-full h-full object-cover object-center filter brightness-[0.55] saturate-125"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/20" />
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/45 border border-sky-400/60 text-sky-100 font-extrabold text-[11px] backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  2. DESPUÉS CON ASEXIA
                </span>
              </div>
              <div className="absolute bottom-2.5 left-4 right-4">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-500/25 text-emerald-200 text-[10px] font-bold border border-emerald-400/40">
                  ✓ Negocio conectado · Caso Gastrobar (Madrid)
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 space-y-3.5 text-left">
              <h4 className="text-lg font-black text-white leading-snug">
                Crecimiento, reservas 24/7 y clientes fidelizados
              </h4>

              <div className="space-y-2 text-xs text-slate-200">
                {afterPoints.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-emerald-200 font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 grid grid-cols-3 gap-2">
                <div className="bg-slate-900 border border-blue-500/40 px-2 py-2 rounded-xl text-center">
                  <div className="text-emerald-400 font-black text-xs sm:text-sm flex items-center gap-0.5 justify-center">
                    <TrendingUp className="w-3 h-3" /> +45%
                  </div>
                  <div className="text-[10px] text-slate-300">Facturación</div>
                </div>
                <div className="bg-slate-900 border border-sky-500/40 px-2 py-2 rounded-xl text-center">
                  <div className="text-sky-300 font-black text-xs sm:text-sm flex items-center gap-0.5 justify-center">
                    <Clock className="w-3 h-3" /> -18h
                  </div>
                  <div className="text-[10px] text-slate-300">Por semana</div>
                </div>
                <div className="bg-slate-900 border border-amber-500/40 px-2 py-2 rounded-xl text-center">
                  <div className="text-amber-300 font-black text-xs sm:text-sm flex items-center gap-0.5 justify-center">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> 4.9
                  </div>
                  <div className="text-[10px] text-slate-300">Google</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          DESKTOP / TABLET INTERACTIVE SLIDER (>= 768px)
          Left = 1. ANTES | Right = 2. DESPUÉS CON ASEXIA
         ===================================================================== */}
      <div className="hidden md:block">
        {/* Quick Snap Controls */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setSliderPosition(92)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              sliderPosition >= 75
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                : isDark
                ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-300 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            1. Ver Antes (Manual)
          </button>
          <button
            type="button"
            onClick={() => setSliderPosition(50)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
              sliderPosition > 25 && sliderPosition < 75
                ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white border-transparent shadow-sm'
                : isDark
                ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-300 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <MoveHorizontal className="w-3.5 h-3.5" />
            <span>Comparar 50 / 50</span>
          </button>
          <button
            type="button"
            onClick={() => setSliderPosition(8)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              sliderPosition <= 25
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : isDark
                ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-300 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            2. Ver Después (Asexia)
          </button>
        </div>

        {/* Comparison Slider Container */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'pan-y' }}
          className="relative w-full h-[460px] rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl select-none cursor-ew-resize bg-slate-950 group"
        >
          {/* BASE RIGHT LAYER: 2. DESPUÉS CON ASEXIA */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#001833] via-slate-950 to-emerald-950/60">
            {!afterImgError && (
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
                alt="Restaurante moderno y digitalizado"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setAfterImgError(true)}
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.42] saturate-125"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-l from-slate-950/95 via-slate-950/75 to-slate-950/30" />

            <div className="relative z-10 w-full h-full p-6 lg:p-10 flex flex-col justify-between">
              <div className="flex items-center justify-end">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600/35 border border-blue-400/50 text-blue-200 font-extrabold text-xs shadow-lg backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  2. DESPUÉS CON ASEXIA
                </span>
              </div>

              <div className="max-w-[45%] lg:max-w-md ml-auto text-right space-y-3">
                <div className="inline-block px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 backdrop-blur-md">
                  ✓ Negocio conectado 24/7
                </div>

                <h4 className="text-2xl lg:text-3xl font-black text-white leading-tight">
                  Crecimiento, reservas 24/7 y clientes fidelizados
                </h4>

                <div className="space-y-2 text-xs text-slate-200">
                  {afterPoints.map((pt, idx) => (
                    <div key={idx} className="flex items-center justify-end gap-2 text-emerald-300 font-medium">
                      <span>{pt}</span>
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>

                {/* Metrics Chips */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <div className="bg-slate-900/90 border border-blue-500/40 px-3.5 py-1.5 rounded-xl text-center backdrop-blur-md">
                    <div className="text-emerald-400 font-black text-sm flex items-center gap-1 justify-center">
                      <TrendingUp className="w-3.5 h-3.5" /> +45%
                    </div>
                    <div className="text-[10px] text-slate-300">Facturación</div>
                  </div>
                  <div className="bg-slate-900/90 border border-sky-500/40 px-3.5 py-1.5 rounded-xl text-center backdrop-blur-md">
                    <div className="text-sky-300 font-black text-sm flex items-center gap-1 justify-center">
                      <Clock className="w-3.5 h-3.5" /> -18h/sem
                    </div>
                    <div className="text-[10px] text-slate-300">Tiempo libre</div>
                  </div>
                  <div className="bg-slate-900/90 border border-amber-500/40 px-3.5 py-1.5 rounded-xl text-center backdrop-blur-md">
                    <div className="text-amber-300 font-black text-sm flex items-center gap-1 justify-center">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> 4.9
                    </div>
                    <div className="text-[10px] text-slate-300">Google Rating</div>
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-300">
                Caso real: Restaurante & Gastrobar (Madrid)
              </div>
            </div>
          </div>

          {/* LEFT CLIPPABLE LAYER: 1. ANTES (SITUACIÓN INICIAL) */}
          <div
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            className="absolute inset-0 bg-slate-950 z-20 pointer-events-none"
          >
            <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-rose-950/35 to-slate-900">
              {!beforeImgError && (
                <img
                  src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80"
                  alt="Negocio tradicional sin digitalizar"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setBeforeImgError(true)}
                  className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.35] grayscale"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/30" />

              <div className="relative z-10 w-full h-full p-6 lg:p-10 flex flex-col justify-between">
                <div className="flex items-center">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/35 border border-rose-500/50 text-rose-200 font-extrabold text-xs shadow-lg backdrop-blur-md">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    1. ANTES (SISTEMA MANUAL)
                  </span>
                </div>

                <div className="max-w-[45%] lg:max-w-md text-left space-y-3">
                  <div className="inline-block px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 backdrop-blur-md">
                    Pérdida continua de clientes
                  </div>

                  <h4 className="text-2xl lg:text-3xl font-black text-slate-200 leading-tight">
                    Llamadas sin contestar, tareas en papel y web obsoleta
                  </h4>

                  <div className="space-y-2 text-xs text-slate-300">
                    {beforePoints.map((pt, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-rose-300">
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>

                  {/* Inefficient stats */}
                  <div className="pt-2 flex items-center gap-2">
                    <div className="bg-slate-950/90 border border-rose-500/30 px-3.5 py-1.5 rounded-xl text-center backdrop-blur-md">
                      <div className="text-rose-400 font-bold text-sm">-35%</div>
                      <div className="text-[10px] text-slate-400">Clientes perdidos</div>
                    </div>
                    <div className="bg-slate-950/90 border border-rose-500/30 px-3.5 py-1.5 rounded-xl text-center backdrop-blur-md">
                      <div className="text-rose-400 font-bold text-sm">3.4 ★</div>
                      <div className="text-[10px] text-slate-400">Pocas opiniones</div>
                    </div>
                  </div>
                </div>

                <div className="text-left text-[11px] text-slate-400">
                  Situación previa sin sistema digital
                </div>
              </div>
            </div>
          </div>

          {/* DRAG HANDLE BAR */}
          <div
            style={{ left: `${sliderPosition}%` }}
            className="absolute inset-y-0 -ml-3 w-6 flex items-center justify-center pointer-events-none z-30"
          >
            <div className="w-1 h-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)]" />
            <div className="absolute w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 border-2 border-white shadow-2xl flex items-center justify-center text-white text-xs font-bold transition group-hover:scale-110">
              ⇆
            </div>
          </div>
        </div>

        {/* Helper text underneath (with accurate direction labels!) */}
        <div className="flex items-center justify-between text-xs mt-3 px-2">
          <span className="text-rose-500 font-semibold">
            ← Arrastra a la izquierda para descubrir el DESPUÉS
          </span>
          <span
            className={`font-mono text-[11px] px-3 py-1 rounded-full border ${
              isDark
                ? 'text-slate-300 bg-[#001E3D] border-[#0284C7]/30'
                : 'text-slate-600 bg-slate-100 border-slate-200'
            }`}
          >
            Arrastra el separador para comparar
          </span>
          <span className="text-emerald-500 font-semibold">
            Arrastra a la derecha para ver el ANTES →
          </span>
        </div>
      </div>
    </div>
  );
};
