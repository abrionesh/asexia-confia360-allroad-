import React, { useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Layers,
  Activity,
  Globe,
  Utensils,
  Stethoscope,
  Building2,
  ShoppingBag,
  Zap,
  Check,
  FileSignature,
  Star,
  Smartphone,
  Server,
  Maximize2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AsexiaLogo } from './AsexiaLogo';
import { QuickBookingDemoPanel, DemoSectorId } from './QuickBookingDemoPanel';

interface LayeredDashboardHeroShowcaseProps {
  onOpenBooking: (context?: string) => void;
  onOpenComparator: () => void;
  isDemoMode?: boolean;
  onToggleDemoMode?: () => void;
  demoInitialSector?: DemoSectorId;
}

type SectorKey = 'servicios' | 'clinicas' | 'hosteleria' | 'comercios';

export const LayeredDashboardHeroShowcase: React.FC<LayeredDashboardHeroShowcaseProps> = ({
  onOpenBooking,
  isDemoMode = false,
  onToggleDemoMode,
  demoInitialSector,
}) => {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(-4);
  const [rotateY, setRotateY] = useState<number>(6);
  const [glarePos, setGlarePos] = useState<{ x: number; y: number }>({ x: 65, y: 20 });
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [activeSector, setActiveSector] = useState<SectorKey>('servicios');
  const [tickerIndex, setTickerIndex] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);

  // Sector-specific dashboard data
  const sectorConfigs = {
    servicios: {
      name: 'Despachos y Servicios',
      short: 'Servicios',
      icon: Building2,
      badge: 'Firma Digital & Factura-e',
      kpi1: { label: 'Ahorro semanal en trámites', value: '18.5h', change: '+35%' },
      kpi2: { label: 'Firmas digitales cerradas', value: '94 / mes', change: '< 30 seg' },
      kpi3: { label: 'Facturación Electrónica', value: '100%', change: 'Conforme Ley' },
      chartPoints: [28, 42, 38, 65, 59, 78, 92],
      phoneMessageCustomer: 'Buenas tardes, ¿me podéis remitir el contrato para firmar?',
      phoneMessageBot: '¡Hola! Te lo enviamos firmado en 30s a tu móvil con plena validez jurídica.',
      phoneBadge: 'Firma Digital Activa',
      activity: [
        'Firma digital completada: Presupuesto mercantil #1042',
        'Justificante contable clasificado en buzón automático',
        'Recordatorio de propuesta enviado por WhatsApp (+35% cierre)',
      ],
    },
    clinicas: {
      name: 'Clínicas y Consultas de Salud',
      short: 'Clínicas',
      icon: Stethoscope,
      badge: 'Agenda Médica & Cero Bajas',
      kpi1: { label: 'Reducción de ausencias', value: '-85%', change: 'Con WhatsApp' },
      kpi2: { label: 'Citas gestionadas 24/7', value: '240 / mes', change: '+42%' },
      kpi3: { label: 'Consentimientos RGPD', value: 'Digitales', change: 'En tablet' },
      chartPoints: [35, 48, 52, 70, 68, 85, 96],
      phoneMessageCustomer: 'Hola, ¿tenéis hueco para cita de fisioterapia el jueves?',
      phoneMessageBot: '¡Hola! Cita reservada para el jueves 17:30h. Te confirmamos por WhatsApp.',
      phoneBadge: 'Agenda Médica 24/7',
      activity: [
        'Cita confirmada por WhatsApp para mañana 11:00h',
        'Consentimiento informado firmado en tablet por paciente',
        'Hueco cancelado reasignado a lista de espera en 4 min',
      ],
    },
    hosteleria: {
      name: 'Hostelería y Restauración',
      short: 'Hostelería',
      icon: Utensils,
      badge: 'Escandallos & Reservas 0 Comisiones',
      kpi1: { label: 'Reservas directas sin intermediarios', value: '+32%', change: 'Cero comisiones' },
      kpi2: { label: 'Mesas vacías por No-Show', value: '0%', change: 'Con fianza' },
      kpi3: { label: 'Control de escandallos', value: '64 platos', change: 'Margen +28%' },
      chartPoints: [40, 55, 62, 75, 82, 90, 98],
      phoneMessageCustomer: 'Hola, queremos reservar mesa para 6 personas este sábado.',
      phoneMessageBot: '¡Mesa 4 reservada! Te enviamos confirmación y enlace para alérgenos.',
      phoneBadge: 'Reservas Directas WhatsApp',
      activity: [
        'Reserva confirmada: Mesa 4 (6 personas) con fianza',
        'Escandallo actualizado: Coste de materia prima recalculado',
        'Carta digital QR consultada: 180 visitas hoy',
      ],
    },
    comercios: {
      name: 'Comercio Local y Retail',
      short: 'Comercio',
      icon: ShoppingBag,
      badge: 'Google Maps 5★ & Catálogo',
      kpi1: { label: 'Visibilidad en búsquedas locales', value: '+45%', change: 'Google Maps 5★' },
      kpi2: { label: 'Pedidos directos WhatsApp', value: '128 / mes', change: 'Sin intermediarios' },
      kpi3: { label: 'Clientes fidelizados', value: '540', change: '+38% recurrencia' },
      chartPoints: [30, 44, 58, 68, 74, 86, 94],
      phoneMessageCustomer: '¿Tenéis disponibilidad del modelo en talla 42 para recoger?',
      phoneMessageBot: '¡Hola! Sí, te lo apartamos en tienda. Puedes pagar por Bizum o al recoger.',
      phoneBadge: 'Catálogo Móvil & Maps',
      activity: [
        'Nueva reseña 5 estrellas recibida en Google Maps',
        'Pedido recibido por WhatsApp: Apartado para recogida',
        'Campaña de proximidad: 82 visitas al catálogo web',
      ],
    },
  };

  const current = sectorConfigs[activeSector];

  // Cycling real-time activity ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % current.activity.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [current.activity.length]);

  // Subtle continuous 3D floating wobble when not hovered
  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isAutoRotating || isHovered || reduced) return;
    let frame = 0;
    const interval = setInterval(() => {
      frame += 0.025;
      const nextY = 4 + Math.sin(frame) * 5.5;
      const nextX = -4 + Math.cos(frame * 0.8) * 3.5;
      setRotateY(nextY);
      setRotateX(nextX);
      setGlarePos({
        x: 50 + Math.sin(frame) * 20,
        y: 30 + Math.cos(frame * 0.8) * 15,
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoRotating, isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    setRotateX(-(y / (rect.height / 2)) * 13);
    setRotateY((x / (rect.width / 2)) * 15);
    setGlarePos({
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(-4);
    setRotateY(6);
    setGlarePos({ x: 65, y: 20 });
  };

  if (isDemoMode) {
    return (
      <div className="relative w-full max-w-2xl mx-auto py-2">
        <QuickBookingDemoPanel
          onCloseDemo={() => onToggleDemoMode && onToggleDemoMode()}
          onOpenRealBooking={(ctx) => onOpenBooking(ctx)}
          initialSector={demoInitialSector}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-2xl mx-auto perspective-1200 py-2 select-none"
    >
      {/* Visual Controls Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 mb-3 px-3.5 py-2 rounded-2xl backdrop-blur-xl border text-xs shadow-lg transition-colors ${
          isDark
            ? 'bg-[#001E3D]/90 border-[#0284C7]/25 text-white'
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-md'
        }`}
      >
        {/* Sector Tabs Switcher */}
        <div className="flex flex-wrap items-center gap-1">
          {(Object.keys(sectorConfigs) as SectorKey[]).map((secKey) => {
            const sec = sectorConfigs[secKey];
            const SecIcon = sec.icon;
            const isSelected = activeSector === secKey;
            return (
              <button
                key={secKey}
                onClick={() => setActiveSector(secKey)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-sm scale-[1.02]'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-[#002855]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <SecIcon className="w-3 h-3" />
                <span>{sec.short}</span>
              </button>
            );
          })}
        </div>

        {/* View mode toggle: Unified vs Exploded 3D Layers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExploded(!isExploded)}
            title="Separar capas en 3D para ver arquitectura interior"
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
              isExploded
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                : isDark
                ? 'bg-[#001428] text-slate-300 border-[#0284C7]/20 hover:text-white'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>{isExploded ? 'Vista Compacta' : 'Ver Capas 3D'}</span>
          </button>

          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            title={isAutoRotating ? 'Pausar movimiento' : 'Activar movimiento orgánico'}
            className={`p-1.5 rounded-xl border text-[10px] transition cursor-pointer ${
              isAutoRotating
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                : 'text-slate-400 border-slate-700'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-pulse' : ''}`} />
          </button>

          {onToggleDemoMode && (
            <button
              type="button"
              onClick={onToggleDemoMode}
              title="Probar flujo de reserva simplificado sin registro"
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 border border-emerald-500/30 flex items-center gap-1 transition cursor-pointer"
            >
              <Zap className="w-3 h-3" />
              <span>Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* 3D Scene Preserving 3D Space */}
      <div
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="relative will-change-transform pt-4 pb-2"
      >
        {/* Dynamic Atmospheric Backlight Glow */}
        <div
          className={`absolute -inset-4 rounded-3xl blur-3xl -z-20 transition-opacity duration-500 pointer-events-none ${
            isDark
              ? 'bg-gradient-to-tr from-blue-600/20 via-sky-500/15 to-emerald-500/20 opacity-80'
              : 'bg-gradient-to-tr from-blue-400/15 via-emerald-300/15 to-sky-400/10 opacity-70'
          }`}
        />

        {/* ========================================================
            CAPA POSTERIOR (Background Systems & Mobile App Layer)
            At translateZ(-25px) / translateZ(-65px in exploded mode)
           ======================================================== */}
        <div
          style={{
            transform: isExploded
              ? 'translateZ(-86px) scale(0.91) translateY(-18px)'
              : 'translateZ(-32px) scale(0.95) translateY(-6px)',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
          }}
          className="relative mb-[-44px] sm:mb-[-130px] z-0 pointer-events-auto"
        >
          {/* Depth Label visible in Exploded Mode */}
          {isExploded && (
            <div className="flex items-center justify-between mb-2 px-2 text-[10px] font-mono tracking-wider text-emerald-400 uppercase">
              <span className="flex items-center gap-1.5 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <Server className="w-3 h-3" />
                Capa Posterior: Apps Móviles & Conexión de Sistemas
              </span>
              <span className="hidden sm:inline text-slate-400">translateZ(-70px)</span>
            </div>
          )}

          {/* Grid of Background Ecosystem: Smartphone Mockup + Cloud System Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-4 items-center">
            {/* Left: Smartphone 3D Mockup running WhatsApp / Asexia App */}
            <div
              className={`sm:col-span-5 rounded-3xl border p-2.5 sm:p-3 shadow-2xl backdrop-blur-xl animate-float-fast transition-all duration-300 ${
                isDark
                  ? 'bg-[#001428]/95 border-[#0284C7]/30 text-white shadow-[0_15px_35px_rgba(0,10,30,0.8)]'
                  : 'bg-slate-900 text-white border-slate-700 shadow-xl'
              }`}
            >
              {/* Phone Speaker & Camera Island */}
              <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800/80 mb-2 text-[10px]">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="h-3 w-16 bg-slate-800 rounded-full mx-auto" />
                <span className="text-[9px] font-mono text-slate-400">9:41</span>
              </div>

              {/* Phone App Content */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold truncate">WhatsApp Negocio</div>
                    <div className="text-[9px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                      <span>{current.phoneBadge}</span>
                    </div>
                  </div>
                </div>

                {/* Animated Chat Bubbles */}
                <div className="space-y-1.5 text-[10px] pt-1">
                  <div className="bg-slate-800/90 p-2 rounded-2xl rounded-tl-sm text-slate-200 border border-slate-700/60 leading-tight">
                    {current.phoneMessageCustomer}
                  </div>
                  <div className="bg-emerald-600/90 text-white p-2 rounded-2xl rounded-tr-sm ml-auto max-w-[90%] border border-emerald-400/30 leading-tight shadow-sm">
                    {current.phoneMessageBot}
                    <div className="flex items-center justify-end gap-1 mt-0.5 text-[8px] text-emerald-200">
                      <span>14:02</span>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Floating Connected Cloud Modules */}
            <div className="sm:col-span-7 space-y-2 text-[11px] hidden sm:block">
              <div
                className={`p-2.5 rounded-2xl border backdrop-blur-xl transition flex items-center gap-2.5 ${
                  isDark
                    ? 'bg-[#001E3D]/90 border-[#0284C7]/25 text-slate-200'
                    : 'bg-white/95 border-slate-200 text-slate-800 shadow-md'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[11px] truncate">Presencia & Google Maps 5★</div>
                  <div className="text-[9px] text-slate-400 truncate">Sincronización en tiempo real</div>
                </div>
                <span className="text-[8px] font-bold uppercase text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                  OK
                </span>
              </div>

              <div
                className={`p-2.5 rounded-2xl border backdrop-blur-xl transition flex items-center gap-2.5 ${
                  isDark
                    ? 'bg-[#001E3D]/90 border-[#0284C7]/25 text-slate-200'
                    : 'bg-white/95 border-slate-200 text-slate-800 shadow-md'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <FileSignature className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[11px] truncate">Firma Digital & Factura-e</div>
                  <div className="text-[9px] text-slate-400 truncate">Validez legal en 30 segundos</div>
                </div>
                <span className="text-[8px] font-bold uppercase text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                  OK
                </span>
              </div>

              <div
                className={`p-2 rounded-xl border backdrop-blur-xl flex items-center justify-between text-[10px] ${
                  isDark
                    ? 'bg-[#002855]/70 border-[#0284C7]/20 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Flujo de datos automatizado</span>
                </span>
                <span className="font-mono text-emerald-400 text-[9px]">99.8% uptime</span>
              </div>
            </div>
          </div>

          {/* Animated Connecting Data Stream Beams */}
          <div className="relative h-6 w-full overflow-hidden opacity-75">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 24">
              <path
                d="M 50 2 C 100 22, 150 22, 200 12 C 250 2, 300 2, 350 22"
                fill="none"
                stroke="url(#gradient-flow)"
                strokeWidth="2"
                className="animate-flow-dash"
              />
              <defs>
                <linearGradient id="gradient-flow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0284C7" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#10B981" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* ========================================================
            CAPA SUPERIOR (Foreground: Modern SaaS Business Dashboard)
            At translateZ(35px) / translateZ(75px in exploded mode)
           ======================================================== */}
        <div
          style={{
            transform: isExploded
              ? 'translateZ(88px) translateY(12px)'
              : 'translateZ(42px)',
            transformStyle: 'preserve-3d',
            boxShadow: isDark
              ? `${-rotateY * 1.4}px ${22 + rotateX}px 55px rgba(0, 10, 30, 0.82)`
              : `${-rotateY * 1.1}px ${18 + rotateX}px 44px rgba(15, 23, 42, 0.16)`,
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
          }}
          className={`relative z-10 overflow-hidden rounded-3xl border p-3.5 sm:p-6 backdrop-blur-2xl animate-float-slow transition-colors duration-300 ${
            isDark
              ? 'bg-[#001E3D]/95 border-[#0284C7]/35 text-white'
              : 'bg-white/95 border-slate-200 text-slate-900'
          }`}
        >
          {/* Dynamic Pointer Specular Glass Sheen */}
          <div
            aria-hidden="true"
            style={{
              background: isDark
                ? `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(56, 189, 248, 0.16), rgba(16, 185, 129, 0.06) 45%, transparent 72%)`
                : `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(2, 132, 199, 0.1), rgba(16, 185, 129, 0.05) 45%, transparent 72%)`,
            }}
            className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-200"
          />
          {/* Depth Label visible in Exploded Mode */}
          {isExploded && (
            <div className="flex items-center justify-between mb-3 px-1 text-[10px] font-mono tracking-wider text-blue-400 uppercase">
              <span className="flex items-center gap-1.5 bg-blue-500/15 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                <Activity className="w-3 h-3" />
                Capa Superior: Dashboard de Control y Métricas en Tiempo Real
              </span>
              <span className="hidden sm:inline text-slate-400">translateZ(+75px)</span>
            </div>
          )}

          {/* Dashboard Window Header */}
          <div className="flex items-center justify-between pb-3 sm:pb-3.5 border-b border-slate-700/20 mb-3.5 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              {/* macOS Style Traffic Dots */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="h-4 w-px bg-slate-700/30 flex-shrink-0" />
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`font-black text-xs sm:text-sm tracking-tight flex items-center whitespace-nowrap ${
                    isDark ? 'text-white' : 'text-[#001E3D]'
                  }`}
                >
                  Asexia <span className="text-emerald-500 ml-0.5">OS</span>
                </span>
                <span className={`text-[10px] font-medium hidden sm:inline truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  · Panel de Control Central
                </span>
              </div>
            </div>

            {/* Live Status Pill with Radar Pulse */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="hidden xs:inline sm:inline">Sistema Activo 24/7</span>
                <span className="xs:hidden sm:hidden">Activo 24/7</span>
              </div>
            </div>
          </div>

          {/* 3 Live KPI Cards */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-3.5 sm:mb-4">
            <div
              className={`p-2 sm:p-3 rounded-2xl border transition-all ${
                isDark ? 'bg-[#001428]/80 border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className={`flex items-center justify-between text-[9px] sm:text-[10px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="truncate">{current.kpi1.label}</span>
                <TrendingUp className="w-3 h-3 text-emerald-500 flex-shrink-0" />
              </div>
              <div className="text-sm sm:text-xl font-black text-emerald-500 tracking-tight">
                {current.kpi1.value}
              </div>
              <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded-full inline-block mt-0.5">
                {current.kpi1.change}
              </span>
            </div>

            <div
              className={`p-2 sm:p-3 rounded-2xl border transition-all ${
                isDark ? 'bg-[#001428]/80 border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className={`flex items-center justify-between text-[9px] sm:text-[10px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="truncate">{current.kpi2.label}</span>
                <Clock className="w-3 h-3 text-blue-500 flex-shrink-0" />
              </div>
              <div className="text-sm sm:text-xl font-black text-blue-500 tracking-tight">
                {current.kpi2.value}
              </div>
              <span className="text-[9px] font-semibold text-blue-500 bg-blue-500/10 px-1.5 py-0.2 rounded-full inline-block mt-0.5">
                {current.kpi2.change}
              </span>
            </div>

            <div
              className={`p-2 sm:p-3 rounded-2xl border transition-all ${
                isDark ? 'bg-[#001428]/80 border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className={`flex items-center justify-between text-[9px] sm:text-[10px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="truncate">{current.kpi3.label}</span>
                <ShieldCheck className="w-3 h-3 text-teal-500 flex-shrink-0" />
              </div>
              <div className="text-sm sm:text-xl font-black text-teal-500 tracking-tight">
                {current.kpi3.value}
              </div>
              <span className="text-[9px] font-semibold text-teal-500 bg-teal-500/10 px-1.5 py-0.2 rounded-full inline-block mt-0.5">
                {current.kpi3.change}
              </span>
            </div>
          </div>

          {/* Interactive Live Wave Chart with Scanning Beam */}
          <div
            className={`relative p-3 rounded-2xl border mb-3 overflow-hidden ${
              isDark ? 'bg-[#001428]/90 border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
            }`}
          >
            {/* Scanline Motion */}
            <div className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scanline pointer-events-none" />

            <div className="flex items-center justify-between gap-2 text-[11px] mb-2">
              <div className="flex items-center gap-1.5 font-bold min-w-0">
                <Activity className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="truncate">Rendimiento ({current.short})</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md flex-shrink-0">
                +42% Eficiencia
              </span>
            </div>

            {/* SVG Interactive Line Graph */}
            <div className="relative h-20 sm:h-28 w-full">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1="0" y1="25" x2="300" y2="25" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'} strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="300" y2="50" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'} strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="300" y2="75" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'} strokeDasharray="3 3" />

                {/* Area Fill */}
                <polygon
                  points={`0,100 ${current.chartPoints
                    .map((pt, i) => `${(i / (current.chartPoints.length - 1)) * 300},${100 - pt}`)
                    .join(' ')} 300,100`}
                  fill="url(#chartGradient)"
                />

                {/* Main Curve Line */}
                <polyline
                  points={current.chartPoints
                    .map((pt, i) => `${(i / (current.chartPoints.length - 1)) * 300},${100 - pt}`)
                    .join(' ')}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {current.chartPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={(i / (current.chartPoints.length - 1)) * 300}
                    cy={100 - pt}
                    r={i === current.chartPoints.length - 1 ? 4.5 : 2.5}
                    fill={i === current.chartPoints.length - 1 ? '#10B981' : '#0284C7'}
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>

              {/* Pulsing Target Dot on the last point */}
              <div className="absolute right-0 top-[2px] transform translate-x-1/2 -translate-y-1/2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 absolute animate-ping opacity-75" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative block border border-white" />
              </div>
            </div>

            {/* Chart Timeline */}
            <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 font-mono">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
              <span className="text-emerald-400 font-bold">Hoy (En Vivo)</span>
            </div>
          </div>

          {/* Cycling Live Activity Notification Feed */}
          <div
            className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-colors ${
              isDark ? 'bg-[#002855]/60 border-[#0284C7]/20 text-slate-200' : 'bg-emerald-50/70 border-emerald-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="font-semibold truncate text-[11px]">
                {current.activity[tickerIndex]}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
              hace un instante
            </span>
          </div>

          {/* Bottom Fast Action Button */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className={`flex items-center gap-1.5 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>Conexión inmediata sin pausar tu actividad</span>
            </div>

            <button
              onClick={() => onOpenBooking(`Sector: ${current.name}`)}
              className="px-3.5 py-2 sm:py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <span>Pedir diagnóstico</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
