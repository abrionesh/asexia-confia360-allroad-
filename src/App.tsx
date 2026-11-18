import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Globe,
  TrendingUp,
  ShieldCheck,
  Check,
  Building2,
  Stethoscope,
  ShoppingBag,
  Utensils,
  Lightbulb,
  FileCheck,
  Scale,
  Zap,
  Mail,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  User,
  Sparkles,
  Play
} from 'lucide-react';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ThreeHeroCanvas } from './components/ThreeHeroCanvas';
import { LayeredDashboardHeroShowcase } from './components/LayeredDashboardHeroShowcase';
import { SectorSolutionsSection } from './components/SectorSolutionsSection';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { TestimonialsSection } from './components/TestimonialsSection';
import { BookingModal } from './components/BookingModal';
import { ProposalComparatorModal } from './components/ProposalComparatorModal';
import { AIAssistantWidget } from './components/AIAssistantWidget';
import { AdminPanelModal } from './components/AdminPanelModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AsexiaLogo } from './components/AsexiaLogo';
import { RoiCalculatorSection, RoiSubmissionContext } from './components/RoiCalculatorSection';
import { RoiConfig, cloneDefaultRoiConfig } from './types/roi';
import { DemoSectorId } from './components/QuickBookingDemoPanel';

function MainApp() {
  const { isDark } = useTheme();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPlanForBooking, setSelectedPlanForBooking] = useState('Diagnóstico gratuito');
  const [bookingSector, setBookingSector] = useState<string>('Restauración');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [comparatorServices, setComparatorServices] = useState<string>('');
  const [comparatorNotes, setComparatorNotes] = useState<string>('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoInitialSector, setDemoInitialSector] = useState<DemoSectorId | undefined>(undefined);
  const [roiConfig, setRoiConfig] = useState<RoiConfig>(() => cloneDefaultRoiConfig());
  const heroShowcaseRef = useRef<HTMLDivElement>(null);

  const handleToggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const next = !prev;
      if (next && heroShowcaseRef.current && window.innerWidth < 1024) {
        setTimeout(() => {
          heroShowcaseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 80);
      }
      return next;
    });
  };

  // Diagnostic Request Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSector, setFormSector] = useState('Restauración y Hostelería');
  const [formInterest, setFormInterest] = useState('Diagnóstico global de mi empresa (15-20 min)');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const handleDiagnosticFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;
    setIsFormLoading(true);

    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formName,
          phone: formPhone,
          email: `${formName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'contacto'}@empresa.es`,
          companyName: `Empresa de ${formName}`,
          sector: formSector,
          serviceInterest: formInterest,
          source: 'Formulario web directo',
        }),
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      setIsFormSubmitted(true);
    } catch (err) {
      console.error(err);
      setIsFormSubmitted(true);
    } finally {
      setIsFormLoading(false);
    }
  };

  // Quick keyboard shortcut (Ctrl+Shift+A) for internal administration access
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load persistent ROI configuration (Getafe defaults + Admin overrides)
  useEffect(() => {
    let active = true;
    fetch('/api/roi-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const loaded = data?.config ?? data;
        if (active && loaded && loaded.sectors && loaded.ctaSettings) {
          setRoiConfig(loaded);
        }
      })
      .catch(() => {
        // Fallback to local Getafe defaults already initialized
      });
    return () => {
      active = false;
    };
  }, []);

  const handleOpenBooking = (planName?: string, sector?: string, notes?: string) => {
    setSelectedPlanForBooking(planName || 'Diagnóstico gratuito');
    setBookingSector(sector || 'Restauración');
    setBookingNotes(notes || '');
    setIsBookingOpen(true);
  };

  const handleOpenComparator = (services?: string, notes?: string) => {
    setComparatorServices(services || '');
    setComparatorNotes(notes || '');
    setIsComparatorOpen(true);
  };

  const handleBookWithRoi = (ctx: RoiSubmissionContext) => {
    handleOpenBooking(
      `Diagnóstico ROI (${ctx.sectorName})`,
      ctx.bookingSectorValue,
      ctx.summaryText
    );
  };

  const handleTryDemoWithRoi = (ctx: RoiSubmissionContext) => {
    setDemoInitialSector(ctx.demoSectorValue);
    setIsDemoMode(true);
    setTimeout(() => {
      heroShowcaseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  };

  const handleCompareWithRoi = (ctx: RoiSubmissionContext) => {
    handleOpenComparator(
      `Pack Automatización ${ctx.sectorName} (ROI estimado ${ctx.results.roiPercent}%)`,
      ctx.summaryText
    );
  };

  // The 4 Commercial Lines
  const commercialSolutions = [
    {
      id: 'presencia-digital',
      number: '01',
      title: 'Presencia Digital',
      subtitle: 'Tu negocio visible, moderno y accesible en cualquier dispositivo',
      tagline: 'Evita perder clientes que buscan tus servicios en tu zona',
      icon: Globe,
      color: 'blue',
      badgeColor: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      whatSolves:
        'Evita que tu empresa sea invisible en internet o que una página web lenta, descuidada y no adaptada al móvil transmita desconfianza y dirija a tus clientes hacia la competencia.',
      included: [
        'Web profesional ultra rápida (puntuación óptima en Google PageSpeed)',
        '100% adaptable y pensada para la navegación en teléfonos móviles',
        'Ficha de Google Business y presencia destacada en Google Maps',
        'Sistema automático para conseguir reseñas positivas 5 estrellas',
        'Alojamiento de alta velocidad, certificado SSL y mantenimiento técnico continuo',
        'Dominio propio, cuentas de correo corporativo y copias de seguridad',
      ],
      aiRole:
        'Optimizamos la estructura técnica con herramientas inteligentes que aceleran el tiempo de carga y mejoran la visibilidad local.',
      targetAudience:
        'Comercios locales, despachos, consultas y empresas de servicios que quieren transmitir solvencia y captar a quienes buscan en su localidad.',
      cta: 'Consultar Presencia Digital',
    },
    {
      id: 'captacion',
      number: '02',
      title: 'Captación',
      subtitle: 'Convierte visitas y consultas en clientes reales sin perder oportunidades',
      tagline: 'Respuesta inmediata por WhatsApp y reservas automáticas 24/7',
      icon: MessageSquare,
      color: 'emerald',
      badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      whatSolves:
        'Elimina el problema de llamadas que no puedes atender en horas punta, mensajes fuera de horario que quedan sin responder y presupuestos que no se cierran por falta de seguimiento comercial.',
      included: [
        'Canal directo de WhatsApp web y móvil integrado en tu flujo de trabajo',
        'Sistema de reservas y citas online con confirmación instantánea 24/7',
        'Formularios ágiles y persuasivos de solicitud de presupuesto o consulta',
        'CRM visual y sencillo para gestionar clientes y estados comerciales',
        'Asistente de respuestas automáticas para consultas frecuentes y triaje inicial',
        'Recordatorios de cita automáticos para reducir ausencias y cancelaciones',
      ],
      aiRole:
        'Asistentes de IA configurados para atender dudas habituales al instante, filtrar clientes interesados y calendarizar citas sin intervención manual.',
      targetAudience:
        'Clínicas, centros de estética, talleres, restaurantes, academias y servicios con alto volumen de atención o citas programadas.',
      cta: 'Consultar Captación',
    },
    {
      id: 'cumplimiento',
      number: '03',
      title: 'Cumplimiento',
      subtitle: 'Orden administrativo, facturación adaptada y gestión de ayudas públicas',
      tagline: 'Cero sanciones y menos horas perdidas en papeleo repetitivo',
      icon: ShieldCheck,
      color: 'teal',
      badgeColor: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
      whatSolves:
        'Reduce el estrés por cambios normativos (como la facturación electrónica obligatoria), el tiempo perdido en tareas administrativas manuales y los riesgos legales en la gestión de datos.',
      included: [
        'Preparación y adaptación técnica para los requisitos de facturación electrónica',
        'Digitalización y clasificación de facturas, recibos y albaranes',
        'Control horario y registro de jornada laboral sencillo para tu equipo',
        'Tramitación y justificación completa de subvenciones como Kit Digital (hasta el 100% financiado)',
        'Cumplimiento de RGPD y protección de datos en la captación de contactos',
        'Integración con tus sistemas de gestión interna o asesoría',
      ],
      aiRole:
        'Lectura y clasificación automática de documentos y justificantes administrativos para eliminar el tecleo manual.',
      targetAudience:
        'Pymes, autónomos y despachos que quieren tener su administración blindada, al día y sin robar tiempo a su actividad principal.',
      cta: 'Consultar Cumplimiento',
    },
    {
      id: 'acelerador-campanas',
      number: '04',
      title: 'Acelerador de Campañas',
      subtitle: 'Publicidad segmentada y páginas de destino para generar clientes con previsibilidad',
      tagline: 'Inversión comercial controlada y medida en resultados reales',
      icon: TrendingUp,
      color: 'indigo',
      badgeColor: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
      whatSolves:
        'Termina con el dinero malgastado en publicidad sin retorno claro, campañas que no generan contactos o promociones que no llegan a los clientes adecuados.',
      included: [
        'Campañas hiperlocales en Google Ads para búsquedas directas de alta intención',
        'Campañas segmentadas en redes sociales dirigidas a tu público de proximidad',
        'Páginas de aterrizaje (landing pages) específicas diseñadas para convertir',
        'Campañas periódicas de reactivación y fidelización a tu base de contactos por WhatsApp',
        'Informes claros sin jerga: coste por contacto y clientes reales generados',
        'Ajustes continuos para optimizar el coste de adquisición',
      ],
      aiRole:
        'Optimización continua de textos, audiencias y llamadas a la acción mediante modelos de rendimiento basados en datos de conversión.',
      targetAudience:
        'Negocios con capacidad operativa que quieren acelerar ventas, promocionar nuevos servicios o expandir su base de clientes con regularidad.',
      cta: 'Consultar Acelerador de Campañas',
    },
  ];

  return (
    <div
      className={`min-h-screen overflow-x-hidden flex flex-col relative transition-colors duration-300 selection:bg-emerald-500 selection:text-white ${
        isDark ? 'bg-[#001428] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Offline Status Bar */}
      <OfflineIndicator />

      {/* Global Clean Navbar (Public navigation: Soluciones, Cómo trabajamos, Casos y demos, Contacto + Diagnóstico gratuito) */}
      <Navbar onOpenBooking={() => handleOpenBooking('Diagnóstico gratuito')} />

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {/* ===================== HERO SECTION ===================== */}
        <section className="relative lg:min-h-[85vh] flex items-center pt-5 pb-10 sm:pt-8 sm:pb-16 overflow-hidden">
          {/* Subtle Ambient Canvas Background (Calm and Non-Distracting) */}
          <ThreeHeroCanvas />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Required Hero Content */}
              <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
                {/* Antetítulo Requerido */}
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-semibold transition-colors ${
                    isDark
                      ? 'bg-[#001E3D] border-[#0284C7]/30 text-emerald-400'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Tecnología práctica para pymes y negocios locales</span>
                </div>

                {/* H1 Requerido */}
                <h1
                  className={`text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-[1.15] ${
                    isDark ? 'text-white' : 'text-[#001E3D]'
                  }`}
                >
                  Más clientes. Menos tareas.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-sky-500 to-emerald-400">
                    Un negocio mejor conectado.
                  </span>
                </h1>

                {/* Descripción Requerida */}
                <p
                  className={`text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Mejoramos tu presencia digital, conectamos la captación con el seguimiento comercial y
                  automatizamos tareas para que puedas dedicar más tiempo a tu negocio.
                </p>

                {/* CTAs Requeridos: Principal y Secundario */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <button
                    onClick={() => handleOpenBooking('Diagnóstico gratuito')}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Quiero mi diagnóstico gratuito</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsComparatorOpen(true)}
                    className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm border transition flex items-center justify-center gap-2 cursor-pointer ${
                      isDark
                        ? 'bg-[#001E3D] hover:bg-[#002855] text-slate-200 border-[#0284C7]/30'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
                    }`}
                  >
                    <Scale className="w-4 h-4 text-emerald-500" />
                    <span>Comparar una propuesta</span>
                  </button>
                </div>

                {/* Hero Demo Mode Button */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <button
                    type="button"
                    onClick={handleToggleDemoMode}
                    aria-pressed={isDemoMode}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                      isDemoMode
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/25'
                        : isDark
                        ? 'bg-[#001E3D]/90 hover:bg-[#002855] text-emerald-400 border-emerald-500/35 hover:border-emerald-400/60'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm'
                    }`}
                  >
                    <Play
                      className={`w-3.5 h-3.5 ${
                        isDemoMode ? 'fill-white text-white' : 'fill-emerald-500 text-emerald-500'
                      }`}
                    />
                    <span>
                      {isDemoMode
                        ? 'Modo Demo activo (Ver Dashboard 3D)'
                        : 'Probar Modo Demo: Reserva rápida'}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                        isDemoMode
                          ? 'bg-white/20 text-white'
                          : isDark
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-white text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      Sin registro
                    </span>
                  </button>
                </div>

                {/* Microcopy Requerido */}
                <p
                  className={`text-xs sm:text-sm max-w-lg mx-auto lg:mx-0 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Una conversación de 15–20 minutos para identificar prioridades y próximos pasos. Sin compromiso.
                </p>

                {/* Direct Phone Assistance */}
                <div
                  className={`pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  <span>¿Prefieres consultar por teléfono?</span>
                  <a
                    href="tel:609735753"
                    className="font-bold text-emerald-500 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>609 735 753</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Creative & Impactful Layered 3D Dashboard & Connected Systems Showcase */}
              <div ref={heroShowcaseRef} className="lg:col-span-6 relative">
                <LayeredDashboardHeroShowcase
                  onOpenBooking={(ctx) => handleOpenBooking(ctx || 'Diagnóstico general')}
                  onOpenComparator={() => handleOpenComparator()}
                  isDemoMode={isDemoMode}
                  onToggleDemoMode={handleToggleDemoMode}
                  demoInitialSector={demoInitialSector}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===================== PROBLEM & AGITATION (ANÁLISIS DE PRIORIDADES) ===================== */}
        <section
          className={`py-12 sm:py-16 border-t transition-colors duration-300 ${
            isDark ? 'bg-[#001833]/70 border-[#0284C7]/20' : 'bg-slate-100/70 border-slate-200'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Punto de partida
              </span>
              <h2
                className={`text-2xl sm:text-4xl font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-[#001E3D]'
                }`}
              >
                ¿Tu empresa tiene herramientas dispersas o un sistema que trabaja para ti?
              </h2>
              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                La mayoría de las pymes no necesitan más aplicaciones aisladas ni complicaciones técnicas:
                necesitan conectar lo que ya tienen y eliminar tareas manuales repetitivas.
              </p>
            </div>

            {/* Practical contrast cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div
                className={`p-6 rounded-3xl border transition ${
                  isDark
                    ? 'bg-[#001E3D] border-[#0284C7]/25 text-slate-200'
                    : 'bg-white border-slate-200 shadow-sm text-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold mb-4">
                  ✕
                </div>
                <h3 className="font-bold text-base mb-2">Lo que frena a tu negocio</h3>
                <ul className={`space-y-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <li>• Consultas de WhatsApp sin registrar ni seguimiento.</li>
                  <li>• Llamadas en horas punta que se quedan sin responder.</li>
                  <li>• Horas perdidas anotando citas y facturas a mano.</li>
                  <li>• Presupuestos enviados que se enfrían sin respuesta.</li>
                </ul>
              </div>

              <div
                className={`p-6 rounded-3xl border transition ${
                  isDark
                    ? 'bg-[#001E3D] border-emerald-500/40 text-slate-200 shadow-lg'
                    : 'bg-emerald-50/50 border-emerald-300 shadow-sm text-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold mb-4">
                  ✓
                </div>
                <h3 className="font-bold text-base mb-2">Lo que aporta Asexia</h3>
                <ul className={`space-y-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <li>• Web rápida y perfil en Google Maps que generan contactos.</li>
                  <li>• Respuestas inmediatas y reservas automáticas 24/7.</li>
                  <li>• Facturación y trámites administrativos en orden.</li>
                  <li>• Clientes potenciales que reciben seguimiento a tiempo.</li>
                </ul>
              </div>

              <div
                className={`p-6 rounded-3xl border transition flex flex-col justify-between ${
                  isDark
                    ? 'bg-[#001E3D] border-[#0284C7]/25 text-slate-200'
                    : 'bg-white border-slate-200 shadow-sm text-slate-800'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold mb-4">
                    💡
                  </div>
                  <h3 className="font-bold text-base mb-2">Tecnología al servicio real</h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    La inteligencia artificial y la automatización no son modas teóricas: son herramientas
                    prácticas que se encargan del trabajo mecánico para que tú y tu equipo os centréis en atender a los clientes.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/30 mt-4">
                  <button
                    onClick={() => handleOpenBooking('Diagnóstico inicial')}
                    className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Analizar mi situación actual</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== LAS 4 LÍNEAS COMERCIALES (SOLUCIONES) ===================== */}
        <section
          id="soluciones"
          className={`py-12 sm:py-20 border-t transition-colors duration-300 ${
            isDark ? 'bg-[#001428] border-[#0284C7]/20' : 'bg-white border-slate-200'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Líneas Comerciales
              </span>
              <h2
                className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-[#001E3D]'
                }`}
              >
                Cuatro soluciones claras para hacer crecer y ordenar tu negocio.
              </h2>
              <p
                className={`text-sm sm:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
              >
                La inteligencia artificial y la automatización trabajan en segundo plano al servicio de tus
                objetivos: más visibilidad, más consultas convertidas, cumplimiento sin papeleo y campañas eficaces.
              </p>
            </div>

            {/* 4 Commercial Line Cards */}
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              {commercialSolutions.map((sol) => {
                const IconComponent = sol.icon;
                return (
                  <div
                    key={sol.id}
                    className={`rounded-3xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-lg ${
                      isDark
                        ? 'bg-[#001E3D] border-[#0284C7]/25 hover:border-[#0284C7]/50 shadow-[0_10px_30px_rgba(0,10,30,0.5)]'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-5">
                      {/* Card Header with Number and Icon */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sol.badgeColor}`}
                          >
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-[11px] font-extrabold text-slate-400 font-mono tracking-widest">
                              SOLUCIÓN {sol.number}
                            </span>
                            <h3
                              className={`text-2xl font-black tracking-tight leading-tight ${
                                isDark ? 'text-white' : 'text-[#001E3D]'
                              }`}
                            >
                              {sol.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-emerald-500">
                        {sol.tagline}
                      </p>

                      {/* 1. Para qué sirve / Qué problema resuelve */}
                      <div
                        className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                          isDark
                            ? 'bg-[#001428]/80 border-[#0284C7]/20 text-slate-300'
                            : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                        }`}
                      >
                        <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                          Para qué sirve:
                        </strong>{' '}
                        {sol.whatSolves}
                      </div>

                      {/* 2. Qué incluye */}
                      <div className="space-y-2">
                        <h4
                          className={`text-xs font-bold uppercase tracking-wider ${
                            isDark ? 'text-slate-300' : 'text-slate-800'
                          }`}
                        >
                          Qué incluye esta solución:
                        </h4>
                        <ul className="space-y-2 text-xs">
                          {sol.included.map((item, idx) => (
                            <li
                              key={idx}
                              className={`flex items-start gap-2.5 ${
                                isDark ? 'text-slate-300' : 'text-slate-700'
                              }`}
                            >
                              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* AI & Automation Role */}
                      <div
                        className={`p-3 rounded-2xl border text-[11px] flex items-start gap-2.5 ${
                          isDark
                            ? 'bg-[#002855]/60 border-[#0284C7]/30 text-slate-200'
                            : 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                        }`}
                      >
                        <Zap className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-emerald-500">IA y automatización aplicada:</strong>{' '}
                          {sol.aiRole}
                        </div>
                      </div>

                      {/* 3. Para quién es */}
                      <div
                        className={`text-xs pt-2 border-t ${
                          isDark ? 'border-slate-700/50 text-slate-400' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <strong>Recomendado para:</strong> {sol.targetAudience}
                      </div>
                    </div>

                    {/* 4. Llamada a la acción */}
                    <div className="pt-6">
                      <button
                        onClick={() => handleOpenBooking(`Solución: ${sol.title}`)}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>{sol.cta}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================== CALCULADORA ROI + VISOR 3D LIGERO ===================== */}
        <RoiCalculatorSection
          config={roiConfig}
          onBookWithRoi={handleBookWithRoi}
          onTryDemoWithRoi={handleTryDemoWithRoi}
          onCompareWithRoi={handleCompareWithRoi}
        />

        {/* ===================== SECTORES: PUNTOS DE DOLOR Y SOLUCIONES ESPECÍFICAS ===================== */}
        <SectorSolutionsSection onOpenBooking={(sec) => handleOpenBooking(`Sector: ${sec}`)} />

        {/* ===================== CÓMO TRABAJAMOS (PROCESO CLARO) ===================== */}
        <section
          id="como-trabajamos"
          className={`py-12 sm:py-20 border-t transition-colors duration-300 ${
            isDark ? 'bg-[#001833] border-[#0284C7]/20' : 'bg-slate-100/80 border-slate-200'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Cómo Trabajamos
              </span>
              <h2
                className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-[#001E3D]'
                }`}
              >
                Un proceso sencillo, transparente y sin tecnicismos confusos.
              </h2>
              <p
                className={`text-sm sm:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
              >
                Nos encargamos de toda la configuración técnica para que tú solo tengas que tomar decisiones claras.
              </p>
            </div>

            {/* 4-Step Process */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Diagnóstico inicial gratuito',
                  duration: '15–20 minutos',
                  desc: 'Hablamos sobre tu negocio, tus canales actuales y tus cuellos de botella para identificar prioridades concretas y factibles. Sin compromiso.',
                },
                {
                  step: '02',
                  title: 'Propuesta clara a medida',
                  duration: 'En 24-48 horas',
                  desc: 'Te enseñamos qué soluciones necesitas exactamente, cómo quedará tu sistema conectado y una propuesta transparente sin costes ocultos.',
                },
                {
                  step: '03',
                  title: 'Implementación e integración',
                  duration: 'Puesta en marcha ágil',
                  desc: 'Desarrollamos tu presencia digital, conectamos WhatsApp, agendas, facturación y automatizaciones de IA. Todo listo para empezar a captar.',
                },
                {
                  step: '04',
                  title: 'Tu negocio en marcha con soporte',
                  duration: 'Acompañamiento continuo',
                  desc: 'Formamos a tu equipo en el uso diario, resolvemos dudas y nos aseguramos de que el sistema funcione siempre de manera fluida.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl border transition flex flex-col justify-between ${
                    isDark
                      ? 'bg-[#001E3D] border-[#0284C7]/25 text-white shadow-lg'
                      : 'bg-white border-slate-200 text-slate-900 shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-black text-emerald-500">
                        {item.step}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          isDark
                            ? 'bg-[#002855] text-slate-300 border-[#0284C7]/30'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.duration}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base leading-snug">
                      {item.title}
                    </h3>

                    <p
                      className={`text-xs leading-relaxed ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-700/30 mt-4 text-[11px] text-emerald-500 font-semibold">
                    ✓ Sin ataduras ni sorpresas
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => handleOpenBooking('Diagnóstico gratuito')}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition cursor-pointer inline-flex items-center gap-2"
              >
                <span>Empezar con mi diagnóstico gratuito</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ===================== COMPARADOR DE PROPUESTAS BANNER ===================== */}
        <section className="py-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`relative overflow-hidden rounded-3xl border-2 p-6 sm:p-10 shadow-2xl backdrop-blur-xl transition-colors ${
                isDark
                  ? 'bg-gradient-to-r from-[#001833] via-[#002244] to-[#001833] border-emerald-500/40 shadow-[0_10px_35px_rgba(0,10,30,0.6)]'
                  : 'bg-gradient-to-r from-sky-50 via-white to-emerald-50 border-emerald-400/60 shadow-lg'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl text-center lg:text-left">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-extrabold text-[11px] uppercase tracking-wider border border-emerald-500/30">
                      Comparativa sin compromiso
                    </span>
                    <span className="text-xs font-bold text-emerald-500">
                      Evaluación confidencial en 24h
                    </span>
                  </div>

                  <h3
                    className={`text-2xl sm:text-3xl font-black tracking-tight ${
                      isDark ? 'text-white' : 'text-[#001E3D]'
                    }`}
                  >
                    ¿Ya tienes una propuesta? Antes de decidir, compárala con Asexia.
                  </h3>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Facilítanos la propuesta que hayas recibido de otra empresa o agencia y analizaremos tecnología,
                    servicios, costes innecesarios y condiciones para ofrecerte una alternativa ajustada y con mejor
                    relación calidad-precio, siempre que sea posible.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 text-emerald-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Análisis sin compromiso</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Comparación clara</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Sin costes ocultos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>A tu medida</span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 w-full sm:w-auto text-center">
                  <button
                    onClick={() => setIsComparatorOpen(true)}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Quiero comparar mi propuesta</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <div
                    className={`text-[11px] mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    Respuesta confidencial garantizada
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== CASOS Y DEMOS ===================== */}
        <section
          id="casos"
          className={`py-12 sm:py-20 border-t transition-colors duration-300 ${
            isDark ? 'bg-[#001833]/90 border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Casos y Demos
              </span>
              <h2
                className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-[#001E3D]'
                }`}
              >
                La diferencia entre trabajar a ciegas o tener un negocio conectado.
              </h2>
              <p
                className={`text-sm sm:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
              >
                Comprueba cómo cambia la operativa diaria de un negocio tradicional al conectar presencia,
                captación y seguimiento digital.
              </p>
            </div>

            {/* Realistic Before / After Comparison Slider */}
            <BeforeAfterSlider />

            {/* Diverse Sectors Representation (Servicios, Clínicas, Comercios, Hostelería) */}
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className={`p-5 rounded-2xl border text-left ${
                  isDark ? 'bg-[#001E3D] border-[#0284C7]/20' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-blue-500">
                  <Building2 className="w-5 h-5" />
                  <span className="font-extrabold text-xs">Servicios y Despachos</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Web corporativa con captación directa de solicitudes y seguimiento de propuestas sin pérdidas.
                </p>
              </div>

              <div
                className={`p-5 rounded-2xl border text-left ${
                  isDark ? 'bg-[#001E3D] border-[#0284C7]/20' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-sky-500">
                  <Stethoscope className="w-5 h-5" />
                  <span className="font-extrabold text-xs">Clínicas y Salud</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Agenda de citas 24/7 con recordatorios por WhatsApp y ficha de Google Maps con 5★.
                </p>
              </div>

              <div
                className={`p-5 rounded-2xl border text-left ${
                  isDark ? 'bg-[#001E3D] border-[#0284C7]/20' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-emerald-500">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-extrabold text-xs">Comercios Locales</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Catálogo móvil ágil, pedidos por WhatsApp y posicionamiento para búsquedas de proximidad.
                </p>
              </div>

              <div
                className={`p-5 rounded-2xl border text-left ${
                  isDark ? 'bg-[#001E3D] border-[#0284C7]/20' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-amber-500">
                  <Utensils className="w-5 h-5" />
                  <span className="font-extrabold text-xs">Hostelería (Ejemplo 3D)</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Reservas directas y cartas digitales interactivas en 3D como demo de experiencia inmersiva.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== TESTIMONIOS REALISTAS ===================== */}
        <TestimonialsSection />

        {/* ===================== SECCIÓN DE CONTACTO & AGENDAMIENTO DIRECTO ===================== */}
        <section
          id="contacto-directo"
          className={`py-16 border-t transition-colors duration-300 ${
            isDark ? 'bg-[#001428] border-[#0284C7]/20' : 'bg-white border-slate-200'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Contacto Directo
                </span>
                <h2
                  className={`text-3xl sm:text-4xl font-black tracking-tight ${
                    isDark ? 'text-white' : 'text-[#001E3D]'
                  }`}
                >
                  Elige cómo prefieres que hablemos sobre tu empresa.
                </h2>
                <p
                  className={`text-sm sm:text-base leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Sin formularios eternos ni esperas. Puedes agendar directamente en nuestro calendario
                  o llamarnos en horario comercial para una primera orientación de 15–20 minutos.
                </p>

                {/* Real Contact Details Card */}
                <div className="space-y-3 pt-2">
                  <a
                    href="tel:609735753"
                    className={`p-4 rounded-2xl border flex items-center gap-4 transition ${
                      isDark
                        ? 'bg-[#001E3D] border-[#0284C7]/30 hover:border-emerald-500/50'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Teléfono de atención</div>
                      <div className="font-black text-base sm:text-lg text-emerald-500">609 735 753</div>
                    </div>
                  </a>

                  <a
                    href="mailto:soyasexia@gmail.com"
                    className={`p-4 rounded-2xl border flex items-center gap-4 transition ${
                      isDark
                        ? 'bg-[#001E3D] border-[#0284C7]/30 hover:border-sky-500/50'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Correo electrónico</div>
                      <div className="font-bold text-sm sm:text-base">soyasexia@gmail.com</div>
                    </div>
                  </a>

                  <a
                    href="https://calendly.com/mundoconfia/orientacion?month=2026-03&date=2026-03-20"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition ${
                      isDark
                        ? 'bg-[#001E3D] border-emerald-500/40 hover:bg-[#002855]'
                        : 'bg-emerald-50/60 border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-500">Agenda tu reunión online</div>
                        <div className="font-black text-sm">Elegir día y hora en Calendly</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  </a>
                </div>
              </div>

              {/* Quick Diagnostic Request Form with Zero Presentation Glitches */}
              <div
                className={`p-5 sm:p-8 rounded-3xl border shadow-xl transition-all duration-300 ${
                  isDark
                    ? 'bg-[#001E3D] border-[#0284C7]/30 text-white'
                    : 'bg-white border-slate-200 text-slate-900 shadow-md'
                }`}
              >
                {isFormSubmitted ? (
                  <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black">¡Solicitud recibida con éxito!</h3>
                      <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Gracias <strong>{formName}</strong>. Nos pondremos en contacto contigo en el teléfono{' '}
                        <strong>{formPhone}</strong> en menos de 24 horas laborables para tu orientación gratuita.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                      <a
                        href={`https://wa.me/34609735753?text=${encodeURIComponent(
                          `Hola Asexia, acabo de solicitar mi diagnóstico web para mi negocio (${formSector}). Soy ${formName}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Avisar ahora por WhatsApp</span>
                      </a>

                      <button
                        onClick={() => {
                          setIsFormSubmitted(false);
                          setFormName('');
                          setFormPhone('');
                        }}
                        className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          isDark
                            ? 'bg-[#002855] text-slate-300 border-[#0284C7]/30'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        Enviar otra consulta
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-5 space-y-1 text-left">
                      <h3 className="text-xl font-black">Solicitar diagnóstico gratuito</h3>
                      <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Déjanos tus datos básicos y te contactamos en menos de 24 horas laborables.
                      </p>
                    </div>

                    <form onSubmit={handleDiagnosticFormSubmit} className="space-y-4 text-left">
                      {/* 1. Nombre o persona de contacto */}
                      <div>
                        <label className="block text-xs font-bold mb-1.5">
                          Nombre o persona de contacto <span className="text-emerald-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            required
                            placeholder="Ej. Carmen Rodríguez"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-xs sm:text-sm outline-none transition ${
                              isDark
                                ? 'bg-[#001428] border-[#0284C7]/30 text-white focus:border-emerald-500 placeholder:text-slate-500'
                                : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500 placeholder:text-slate-400'
                            }`}
                          />
                        </div>
                      </div>

                      {/* 2. Teléfono o WhatsApp */}
                      <div>
                        <label className="block text-xs font-bold mb-1.5">
                          Teléfono o WhatsApp directo <span className="text-emerald-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input
                            type="tel"
                            required
                            placeholder="Ej. 609 735 753"
                            value={formPhone}
                            onChange={(e) => setFormPhone(e.target.value)}
                            className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-xs sm:text-sm outline-none transition ${
                              isDark
                                ? 'bg-[#001428] border-[#0284C7]/30 text-white focus:border-emerald-500 placeholder:text-slate-500'
                                : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500 placeholder:text-slate-400'
                            }`}
                          />
                        </div>
                      </div>

                      {/* 3. Tipo de negocio o sector */}
                      <div>
                        <label className="block text-xs font-bold mb-1.5">
                          Tipo de negocio o sector <span className="text-emerald-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <select
                            value={formSector}
                            onChange={(e) => setFormSector(e.target.value)}
                            className={`w-full pl-10 pr-10 py-3 rounded-xl border text-xs sm:text-sm outline-none transition cursor-pointer appearance-none ${
                              isDark
                                ? 'bg-[#001428] border-[#0284C7]/30 text-white focus:border-emerald-500'
                                : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                            }`}
                          >
                            <option value="Restauración y Hostelería" className={isDark ? 'bg-[#001E3D] text-white' : 'bg-white text-slate-900'}>
                              🍽️ Restauración y Hostelería (Escandallos, Reservas)
                            </option>
                            <option value="Servicios Profesionales y Despachos" className={isDark ? 'bg-[#001E3D] text-white' : 'bg-white text-slate-900'}>
                              ⚖️ Servicios Profesionales y Despachos (Firma digital)
                            </option>
                            <option value="Clínicas y Salud" className={isDark ? 'bg-[#001E3D] text-white' : 'bg-white text-slate-900'}>
                              🩺 Clínicas y Salud (Agenda médica, RGPD)
                            </option>
                            <option value="Comercio Local y Proximidad" className={isDark ? 'bg-[#001E3D] text-white' : 'bg-white text-slate-900'}>
                              🛍️ Comercio Local y Proximidad (Maps 5★, Catálogo)
                            </option>
                            <option value="Inmobiliarias y Propiedades" className={isDark ? 'bg-[#001E3D] text-white' : 'bg-white text-slate-900'}>
                              🏠 Inmobiliarias y Propiedades (Filtro solvencia)
                            </option>
                            <option value="Otro sector de actividad" className={isDark ? 'bg-[#001E3D] text-white' : 'bg-white text-slate-900'}>
                              🏢 Otro sector de actividad
                            </option>
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* 4. Solución principal de interés */}
                      <div>
                        <label className="block text-xs font-bold mb-1.5">
                          Solución o necesidad principal <span className="text-emerald-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <Zap className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <select
                            value={formInterest}
                            onChange={(e) => setFormInterest(e.target.value)}
                            className={`w-full pl-10 pr-10 py-3 rounded-xl border text-xs sm:text-sm outline-none transition cursor-pointer appearance-none ${
                              isDark
                                ? 'bg-[#001428] border-[#0284C7]/30 text-white focus:border-emerald-500'
                                : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                            }`}
                          >
                            <option value="1. Presencia Digital" className={isDark ? 'bg-[#001E3D] text-white' : 'bg-white text-slate-900'}>
                              1. Presencia Digital (Web rápida, Google Maps, Reseñas)
                            </option>
                            <option value="2. Captación" className={isDark ? 'bg-[#001E3D] text-white' : 'bg-white text-slate-900'}>
                              2. Captación (WhatsApp directo, Citas 24/7, CRM)
                            </option>
                            <option value="3. Cumplimiento" className={isDark ? 'bg-[#001E3D] text-white' : 'bg-white text-slate-900'}>
                              3. Cumplimiento (Factura electrónica, Kit Digital)
                            </option>
                            <option value="4. Acelerador de Campañas" className={isDark ? 'bg-[#001E3D] text-white' : 'bg-white text-slate-900'}>
                              4. Acelerador de Campañas (Publicidad y Landing Pages)
                            </option>
                            <option value="Diagnóstico global de mi empresa" className={isDark ? 'bg-[#001E3D] text-white' : 'bg-white text-slate-900'}>
                              Diagnóstico global de mi empresa (15–20 min)
                            </option>
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isFormLoading}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                      >
                        <span>{isFormLoading ? 'Enviando solicitud...' : 'Quiero mi diagnóstico gratuito'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <p className="text-[11px] text-center text-slate-400 pt-1">
                        🔒 Tratamiento confidencial. Sin llamadas insistentes ni spam comercial.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Clean Footer */}
      <Footer
        onOpenBooking={() => handleOpenBooking('Diagnóstico desde pie de página')}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Persistent AI Assistant floating widget */}
      <AIAssistantWidget
        onOpenBooking={() => handleOpenBooking('Consulta con Asistente')}
        onOpenComparator={() => handleOpenComparator()}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        defaultPlan={selectedPlanForBooking}
        initialSector={bookingSector}
        initialNotes={bookingNotes}
      />

      {/* Proposal Comparator Modal */}
      <ProposalComparatorModal
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
        initialServices={comparatorServices}
        initialNotes={comparatorNotes}
      />

      {/* Admin Panel Modal (Internal Management, triggered privately) */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        roiConfig={roiConfig}
        onRoiConfigUpdated={setRoiConfig}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
