import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Calendar,
  Clock,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  RotateCcw,
  Utensils,
  Stethoscope,
  Building2,
  ShoppingBag,
  Layers,
  Check,
  Sparkles,
  User,
  Home
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type DemoSectorId = 'restauracion' | 'clinicas' | 'servicios' | 'comercios' | 'inmobiliarias';

interface QuickBookingDemoPanelProps {
  onCloseDemo: () => void;
  onOpenRealBooking: (context?: string) => void;
  initialSector?: DemoSectorId;
}

type DemoStep = 'select' | 'processing' | 'confirmed';

export const QuickBookingDemoPanel: React.FC<QuickBookingDemoPanelProps> = ({
  onCloseDemo,
  onOpenRealBooking,
  initialSector,
}) => {
  const { isDark } = useTheme();
  const [step, setStep] = useState<DemoStep>('select');
  const [selectedSector, setSelectedSector] = useState<DemoSectorId>(initialSector || 'restauracion');
  const [selectedSlot, setSelectedSlot] = useState<string>('Hoy · 17:30');
  const [elapsedSeconds, setElapsedSeconds] = useState<string>('0.0');
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (initialSector) {
      setSelectedSector(initialSector);
      setStep('select');
      startTimeRef.current = Date.now();
    }
  }, [initialSector]);

  const demoSectors: Record<
    DemoSectorId,
    {
      label: string;
      business: string;
      service: string;
      icon: React.ComponentType<{ className?: string }>;
      whatsappPreview: (slot: string) => string;
      calendarTag: string;
    }
  > = {
    restauracion: {
      label: 'Restauración',
      business: 'Mesón Los Olivos (Demo)',
      service: 'Reserva Mesa 4 personas · Con fianza anti no-show',
      icon: Utensils,
      whatsappPreview: (slot) =>
        `¡Hola Laura! Tu mesa para 4 en Mesón Los Olivos queda confirmada (${slot}). Consulta alérgenos o cambia hora en 1 toque.`,
      calendarTag: 'Mesa 4 bloqueada automáticamente',
    },
    clinicas: {
      label: 'Clínicas',
      business: 'Clínica Salud Norte (Demo)',
      service: 'Cita Fisioterapia · Recordatorio + RGPD digital',
      icon: Stethoscope,
      whatsappPreview: (slot) =>
        `¡Hola Laura! Cita de Fisioterapia confirmada en Clínica Salud Norte (${slot}). Te enviaremos aviso 24h antes.`,
      calendarTag: 'Especialista asignado sin llamadas',
    },
    servicios: {
      label: 'Servicios',
      business: 'Asesoría & Despacho Ruiz (Demo)',
      service: 'Reunión orientación + Firma digital de mandato',
      icon: Building2,
      whatsappPreview: (slot) =>
        `¡Hola Laura! Reunión confirmada con Asesoría Ruiz (${slot}). Aquí tienes tu acceso y firma digital en 30s.`,
      calendarTag: 'Sala y expediente listos al instante',
    },
    comercios: {
      label: 'Comercios',
      business: 'Moda Local Proximidad (Demo)',
      service: 'Apartado de producto en tienda y recogida exprés',
      icon: ShoppingBag,
      whatsappPreview: (slot) =>
        `¡Hola Laura! Artículo apartado en Moda Local para recoger (${slot}). Pago cómodo en tienda o por Bizum.`,
      calendarTag: 'Stock reservado en mostrador',
    },
    inmobiliarias: {
      label: 'Inmobiliarias',
      business: 'Inmobiliaria Getafe Sur (Demo)',
      service: 'Visita cualificada + Firma digital de reserva',
      icon: Home,
      whatsappPreview: (slot) =>
        `¡Hola Laura! Visita confirmada con filtro previo (${slot}). Te enviamos plano y ubicación exacta en 1 toque.`,
      calendarTag: 'Visita cualificada en agenda',
    },
  };

  const quickSlots = [
    'Hoy · 17:30',
    'Hoy · 19:00',
    'Mañana · 10:30',
    'Mañana · 12:00',
  ];

  const currentSector = demoSectors[selectedSector];

  const handleConfirmDemo = () => {
    const duration = Math.max(0.8, (Date.now() - startTimeRef.current) / 1000).toFixed(1);
    setElapsedSeconds(duration);
    setStep('processing');
    setTimeout(() => {
      setStep('confirmed');
    }, 450);
  };

  const handleResetDemo = () => {
    startTimeRef.current = Date.now();
    setStep('select');
  };

  return (
    <div
      className={`relative rounded-3xl border p-5 sm:p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-in fade-in zoom-in-95 ${
        isDark
          ? 'bg-[#001E3D]/95 border-emerald-500/40 text-white shadow-[0_20px_50px_rgba(0,10,30,0.85)]'
          : 'bg-white/95 border-emerald-300 text-slate-900 shadow-2xl'
      }`}
    >
      {/* Top Demo Banner Header */}
      <div className="flex items-center justify-between gap-2 pb-3.5 mb-4 border-b border-slate-700/20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500">
                Modo Demo · Sin registro real
              </span>
            </div>
            <h3
              className={`text-sm sm:text-base font-black truncate ${
                isDark ? 'text-white' : 'text-[#001E3D]'
              }`}
            >
              Simulador de Reserva Rápida
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onCloseDemo}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
            isDark
              ? 'bg-[#001428] border-[#0284C7]/30 text-slate-300 hover:text-white hover:bg-[#002855]'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span>Dashboard 3D</span>
        </button>
      </div>

      {/* STEP 1: 2-TAP INSTANT SELECTION */}
      {step === 'select' && (
        <div className="space-y-4">
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Prueba en <strong>2 toques</strong> cómo reservan tus clientes sin rellenar formularios largos ni esperar confirmaciones manuales.
          </p>

          {/* 1. Sector selector */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              1. Elige un negocio de ejemplo
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(demoSectors) as DemoSectorId[]).map((key) => {
                const item = demoSectors[key];
                const Icon = item.icon;
                const active = selectedSector === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedSector(key)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                      active
                        ? 'bg-gradient-to-br from-blue-600 to-emerald-500 border-transparent text-white shadow-md scale-[1.02]'
                        : isDark
                        ? 'bg-[#001428]/80 border-[#0284C7]/25 text-slate-300 hover:border-emerald-500/40 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-emerald-500'}`} />
                    <span className="text-xs font-bold leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Quick Time Slot Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                2. Toca una hora libre
              </span>
              <span className="text-[10px] font-semibold text-emerald-500">
                Disponibilidad en vivo
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickSlots.map((slot) => {
                const active = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      active
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-500 shadow-sm'
                        : isDark
                        ? 'bg-[#001428]/70 border-[#0284C7]/20 text-slate-300 hover:border-[#0284C7]/50'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 opacity-75" />
                    <span>{slot}h</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pre-filled Dummy Profile Strip (Zero typing!) */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
              isDark
                ? 'bg-[#001428]/80 border-[#0284C7]/20 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[11px] truncate">
                  {currentSector.business}
                </div>
                <div className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Cliente simulado: Laura Gómez · {currentSector.service}
                </div>
              </div>
            </div>
            <span
              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              Auto-relleno
            </span>
          </div>

          {/* Confirm Instant Demo Action */}
          <button
            type="button"
            onClick={handleConfirmDemo}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>Confirmar reserva de prueba al instante</span>
          </button>
        </div>
      )}

      {/* STEP 2: PROCESSING MICRO-STATE */}
      {step === 'processing' && (
        <div className="py-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
              Procesando cita y notificación WhatsApp...
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Sin intervención manual ni llamadas de confirmación
            </p>
          </div>
          <div className="max-w-xs mx-auto h-1.5 rounded-full bg-slate-700/30 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 w-4/5 animate-pulse rounded-full" />
          </div>
        </div>
      )}

      {/* STEP 3: INSTANT CONFIRMED DEMO VIEW */}
      {step === 'confirmed' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          {/* Speed Success Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-emerald-50 border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
              <div>
                <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-emerald-950'}`}>
                  ¡Reserva simulada confirmada!
                </div>
                <div className={`text-[11px] ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  {currentSector.calendarTag} · {selectedSlot}h
                </div>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white text-[11px] font-black whitespace-nowrap shadow-sm">
              ⚡ En {elapsedSeconds}s
            </span>
          </div>

          {/* Automated System Outputs Preview */}
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {/* Simulated Calendar Entry */}
            <div
              className={`p-3 rounded-2xl border space-y-1.5 ${
                isDark ? 'bg-[#001428]/80 border-[#0284C7]/25' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Agenda Sincronizada</span>
              </div>
              <div className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentSector.business}
              </div>
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Horario: <strong>{selectedSlot}h</strong>
                <br />
                Recordatorio automático: <strong>Activado</strong>
              </div>
            </div>

            {/* Simulated WhatsApp Confirmation */}
            <div
              className={`p-3 rounded-2xl border space-y-1.5 ${
                isDark ? 'bg-[#001428]/80 border-emerald-500/25' : 'bg-slate-50 border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Enviado al Cliente</span>
              </div>
              <div className="bg-emerald-600 text-white p-2 rounded-xl rounded-tr-sm text-[10px] leading-snug shadow-sm">
                {currentSector.whatsappPreview(selectedSlot)}
                <div className="flex items-center justify-end gap-0.5 mt-1 text-[8px] text-emerald-100">
                  <span>Ahora</span>
                  <Check className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Demo Notice */}
          <div
            className={`text-center text-[11px] py-1.5 px-3 rounded-xl ${
              isDark ? 'bg-[#001428]/60 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Simulación interactiva completada: <strong>no se ha enviado ningún formulario real</strong>.
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleResetDemo}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isDark
                  ? 'bg-[#001428] border-[#0284C7]/30 text-slate-200 hover:bg-[#002855]'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Repetir prueba</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenRealBooking(`Tras probar Modo Demo (${currentSector.label})`)}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <span>Quiero esto para mi negocio (Diagnóstico real)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
