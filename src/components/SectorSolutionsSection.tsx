import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Building2,
  Stethoscope,
  ShoppingBag,
  Home,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileSignature,
  Calculator,
  CalendarCheck,
  MapPin,
  Filter,
  ShieldCheck,
  Zap,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SectorSolutionsSectionProps {
  onOpenBooking: (sectorName: string) => void;
}

export const SectorSolutionsSection: React.FC<SectorSolutionsSectionProps> = ({
  onOpenBooking,
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<number>(0);

  const sectors = [
    {
      id: 'restauracion',
      name: 'Restauración y Hostelería',
      shortName: 'Restauración',
      icon: Utensils,
      color: 'amber',
      badge: 'Escandallos, Reservas & 0 No-Shows',
      headline: 'Control de escandallos, mesas llenas y pedidos sin comisiones',
      subheadline:
        'Elimina las pérdidas por márgenes descontrolados y mesas vacías. Automatiza reservas, cartas y pedidos directos.',
      painPoints: [
        {
          title: 'Descontrol de escandallos y costes de materia prima',
          desc: 'La subida de precios de los ingredientes erosiona el margen sin que sepas con exactitud cuánto ganas o pierdes en cada plato de la carta.',
        },
        {
          title: 'Mesas vacías por «No-Shows» en horas punta',
          desc: 'Grupos que reservan mesa un viernes o sábado y no se presentan, dejando el restaurante con mesas bloqueadas y facturación perdida.',
        },
        {
          title: 'Comisiones abusivas de plataformas de delivery',
          desc: 'Pagar hasta un 30% de cada comanda a plataformas intermediarias reduce al mínimo el beneficio del servicio de comida para llevar.',
        },
        {
          title: 'Comandas en papel y lentitud de rotación',
          desc: 'Confusiones de comanda entre sala y cocina, retrasos en la cuenta y clientes esperando para pedir o pagar.',
        },
      ],
      solutions: [
        {
          icon: Calculator,
          title: 'Control digital de escandallos y márgenes',
          desc: 'Fichas técnicas de cada plato con cálculo automático del coste de ingredientes y fijación de precios con rentabilidad garantizada.',
        },
        {
          icon: CalendarCheck,
          title: 'Motor de reservas con confirmación por WhatsApp y fianza',
          desc: 'Reconfirmación automática de mesa 2 horas antes con cancelación en 1 clic o política de fianza para grupos grandes: cero mesas vacías.',
        },
        {
          icon: MessageSquare,
          title: 'Canal de pedidos directos por WhatsApp',
          desc: 'Tus clientes habituales piden a domicilio o para recoger directamente sin comisiones de terceros y con cobro integrado.',
        },
        {
          icon: Zap,
          title: 'Carta digital interactiva QR (con opción 3D)',
          desc: 'Filtro inmediato de alérgenos (celíacos, intolerancias), fotos atractivas y actualización de precios al instante sin reimprimir papel.',
        },
      ],
      commercialLinesFit: {
        presencia: 'Web rápida con carta interactiva y Google Maps 5★',
        captacion: 'Reservas por WhatsApp sin intermediarios',
        cumplimiento: 'Control de escandallos y tickets digitales',
        campanas: 'Promoción de menús de temporada y eventos',
      },
    },
    {
      id: 'servicios',
      name: 'Servicios Profesionales y Despachos',
      shortName: 'Servicios & Despachos',
      icon: Building2,
      color: 'blue',
      badge: 'Firma Digital, Facturación & Clientes',
      headline: 'Firma digital en un clic, orden documental y seguimiento comercial',
      subheadline:
        'Termina con las horas perdidas persiguiendo contratos firmados y facturas dispersas en mil canales.',
      painPoints: [
        {
          title: 'Horas perdidas persiguiendo firmas en papel',
          desc: 'Imprimir, desplazar, escanear y enviar llamadas recordatorias para conseguir la firma de contratos, mandatos o acuerdos de confidencialidad.',
        },
        {
          title: 'Recepción caótica de facturas y justificantes',
          desc: 'Clientes que envían fotos borrosas por WhatsApp a deshoras, tickets arrugados o emails dispersos que complican la contabilidad trimestral.',
        },
        {
          title: 'Presupuestos que se enfrían sin respuesta',
          desc: 'Enviar propuestas en PDF y no volver a saber del cliente por falta de tiempo para realizar un seguimiento comercial sistemático.',
        },
        {
          title: 'Adaptación urgente a la Facturación Electrónica',
          desc: 'Incertidumbre legal y necesidad de adaptar el software a los nuevos requisitos normativos obligatorios para pymes y autónomos.',
        },
      ],
      solutions: [
        {
          icon: FileSignature,
          title: 'Firma digital legal integrada en móvil',
          desc: 'Envía contratos, presupuestos o autorizaciones para que el cliente firme en 30 segundos desde su teléfono con plena validez legal y certificación.',
        },
        {
          icon: ShieldCheck,
          title: 'Canal de recepción documental automatizado',
          desc: 'Buzón inteligente donde tus clientes suben sus facturas y tickets clasificados automáticamente para tu equipo contable.',
        },
        {
          icon: TrendingUp,
          title: 'Seguimiento automatizado de propuestas comerciales',
          desc: 'Avisos cuando el cliente revisa la propuesta y recordatorios programados que aumentan la tasa de cierre hasta un +35%.',
        },
        {
          icon: CheckCircle2,
          title: 'Adaptación a Factura Electrónica y Kit Digital',
          desc: 'Tramitación y puesta en marcha financiada al 100% para digitalizar procesos internos y cumplir con la legislación.',
        },
      ],
      commercialLinesFit: {
        presencia: 'Web de despacho que transmite solvencia y prestigio',
        captacion: 'Captación de consultas cualificadas y agenda',
        cumplimiento: 'Firma digital legal y factura electrónica',
        campanas: 'Campañas de captación B2B para servicios clave',
      },
    },
    {
      id: 'clinicas',
      name: 'Clínicas y Consultas de Salud',
      shortName: 'Clínicas & Salud',
      icon: Stethoscope,
      color: 'sky',
      badge: 'Agenda IA, Recordatorios & Cero Cancelaciones',
      headline: 'Agenda médica sin huecos vacíos y recepción telefónica descongestionada',
      subheadline:
        'Atiende a tus pacientes con la máxima profesionalidad mientras la tecnología gestiona citas y recordatorios.',
      painPoints: [
        {
          title: 'Huecos vacíos por cancelaciones de última hora',
          desc: 'Pacientes que olvidan su cita o avisan con media hora de antelación, dejando a odontólogos, fisioterapeutas o médicos con tiempos muertos.',
        },
        {
          title: 'Mostrador de recepción saturado de llamadas',
          desc: 'El personal no puede prestar atención personalizada al paciente que está en consulta porque el teléfono suena constantemente para pedir hora o consultar tarifas.',
        },
        {
          title: 'Pacientes que acuden sin la preparación adecuada',
          desc: 'Olvidos de pautas previas (ayunas, ropa cómoda, radiografías) que obligan a posponer la sesión o retrasan el horario de la clínica.',
        },
        {
          title: 'Estricto cumplimiento de protección de datos médicos',
          desc: 'El tratamiento de historias clínicas y datos de salud exige protocolos de privacidad y consentimiento que no admiten descuidos.',
        },
      ],
      solutions: [
        {
          icon: CalendarCheck,
          title: 'Agenda 24/7 con confirmación interactiva por WhatsApp',
          desc: 'Envío de aviso 24 horas antes que solicita confirmación con un toque o reasigna el hueco libre de forma automática a pacientes en lista de espera.',
        },
        {
          icon: MessageSquare,
          title: 'Asistente de triaje y dudas frecuentes',
          desc: 'Responde de inmediato sobre horarios, preparación para pruebas, tarifas orientativas y ubicación sin ocupar la línea telefónica.',
        },
        {
          icon: FileSignature,
          title: 'Consentimientos informados digitales en tablet',
          desc: 'Firma electrónica de autorizaciones y RGPD antes de entrar a consulta, quedando archivados de forma segura en la ficha del paciente.',
        },
        {
          icon: ShieldCheck,
          title: 'Protocolos de privacidad sanitaria blindados',
          desc: 'Sistemas conformes con la normativa europea de protección de datos médicos y confidencialidad absoluta.',
        },
      ],
      commercialLinesFit: {
        presencia: 'Web accesible con cuadro médico y Google Maps 5★',
        captacion: 'Citas online y confirmación por WhatsApp',
        cumplimiento: 'Consentimientos informados y RGPD médico',
        campanas: 'Captación de nuevos pacientes para tratamientos específicos',
      },
    },
    {
      id: 'comercios',
      name: 'Comercio Local y Negocios de Proximidad',
      shortName: 'Comercio Local',
      icon: ShoppingBag,
      color: 'emerald',
      badge: 'SEO Local Maps, Catálogo & WhatsApp',
      headline: 'Que los vecinos de tu zona te encuentren primero y compren sin intermediarios',
      subheadline:
        'Compite con fuerza frente a las grandes plataformas ofreciendo cercanía, catálogo móvil ágil y trato directo.',
      painPoints: [
        {
          title: 'Fuga de clientes hacia gigantes de internet',
          desc: 'Los vecinos buscan en el móvil lo que necesitan y, si no ven tu catálogo o stock disponible, acaban comprando en plataformas online lejanas.',
        },
        {
          title: 'Invisibilidad en el mapa del barrio o localidad',
          desc: 'Cuando alguien busca "tienda de...", "taller de..." o "reformas cerca de mí", tu negocio no aparece en los primeros resultados de Google Maps.',
        },
        {
          title: 'Consultas de stock que se quedan sin respuesta',
          desc: 'Mensajes fuera de horario comercial preguntando si tienes un producto que se responden tarde, perdiendo la venta.',
        },
        {
          title: 'Falta de tiempo para mantener redes y promociones',
          desc: 'El día a día del negocio impide publicar ofertas periódicas o comunicarse con los clientes habituales para incentivar compras repetidas.',
        },
      ],
      solutions: [
        {
          icon: MapPin,
          title: 'Optimización máxima de Google Business y Maps',
          desc: 'Configuración para liderar las búsquedas de proximidad en tu código postal y captación sistemática de reseñas 5 estrellas de clientes satisfechos.',
        },
        {
          icon: ShoppingBag,
          title: 'Catálogo digital móvil con pedido a WhatsApp',
          desc: 'Tus productos estrella visibles en una web ligera y rápida donde el cliente puede consultar y pedir para recoger en tienda o envío local.',
        },
        {
          icon: MessageSquare,
          title: 'Respuestas automáticas de disponibilidad y horario',
          desc: 'Atención 24/7 en WhatsApp que resuelve dudas sobre ubicación, formas de pago y cómo realizar pedidos al momento.',
        },
        {
          icon: TrendingUp,
          title: 'Campañas periódicas de fidelización',
          desc: 'Avisos de promociones de temporada y descuentos exclusivos para tu lista de clientes sin intermediarios ni costes desproporcionados.',
        },
      ],
      commercialLinesFit: {
        presencia: 'Ficha de Google Maps destacada y web móvil',
        captacion: 'Canal de pedidos y consultas por WhatsApp',
        cumplimiento: 'Facturación adaptada a normativa',
        campanas: 'Publicidad hiperlocal dirigida a vecinos de tu zona',
      },
    },
    {
      id: 'inmobiliarias',
      name: 'Inmobiliarias y Gestión de Propiedades',
      shortName: 'Inmobiliarias',
      icon: Home,
      color: 'teal',
      badge: 'Filtro Solvencia, Arras Digitales & Visitas',
      headline: 'Filtrado previo de compradores solventes y firma digital de reservas',
      subheadline:
        'Dedica tiempo únicamente a visitas que tienen posibilidades reales de compra o alquiler.',
      painPoints: [
        {
          title: 'Tiempo perdido enseñando inmuebles a curiosos',
          desc: 'Comerciales que dedican tardes enteras a enseñar viviendas a personas que no cuentan con financiación concedida ni solvencia comprobada.',
        },
        {
          title: 'Lentitud en la firma de contratos de arras y reservas',
          desc: 'Operaciones que se enfrían o se pierden porque comprador y vendedor tardan días en coincidir presencialmente para firmar.',
        },
        {
          title: 'Dependencia de portales inmobiliarios de pago',
          desc: 'Costes crecientes por destacar anuncios sin disponer de un canal directo propio para captar propietarios y compradores locales.',
        },
        {
          title: 'Dificultad para coordinar agendas comerciales',
          desc: 'Desajustes de horarios entre propietarios, inquilinos y agentes que provocan retrasos y cancelaciones.',
        },
      ],
      solutions: [
        {
          icon: Filter,
          title: 'Filtro previo inteligente por WhatsApp',
          desc: 'Cuestionario ágil automático antes de la visita: presupuesto, estado de hipoteca y plazo de compra para cualificar al interesado.',
        },
        {
          icon: FileSignature,
          title: 'Firma digital de reservas y contratos de arras',
          desc: 'Cierre de la operación en el mismo día mediante firma certificada en smartphone: agilidad y seguridad jurídica sin desplazamientos.',
        },
        {
          icon: MapPin,
          title: 'Fichas interactivas de inmuebles compartibles',
          desc: 'Presentación limpia con planos, fotos de alta calidad y ubicación enviables en un clic por WhatsApp con captación de contacto.',
        },
        {
          icon: CalendarCheck,
          title: 'Agenda compartida de visitas sincronizada',
          desc: 'El cliente elige el horario disponible según la ruta del agente comercial y recibe confirmación con mapa de llegada.',
        },
      ],
      commercialLinesFit: {
        presencia: 'Web inmobiliaria moderna con catálogo ágil',
        captacion: 'Filtro de compradores y solicitud de visitas',
        cumplimiento: 'Firma digital de reservas y notas de encargo',
        campanas: 'Captación de propietarios en exclusiva en tu zona',
      },
    },
  ];

  useEffect(() => {
    const handleSelectSectorEvent = (e: any) => {
      const detail = e.detail;
      if (typeof detail === 'number' && detail >= 0 && detail < sectors.length) {
        setActiveTab(detail);
      } else if (typeof detail === 'string') {
        const idx = sectors.findIndex(
          (s) =>
            s.id.toLowerCase() === detail.toLowerCase() ||
            s.shortName.toLowerCase().includes(detail.toLowerCase()) ||
            s.name.toLowerCase().includes(detail.toLowerCase())
        );
        if (idx !== -1) {
          setActiveTab(idx);
        }
      }
      const el = document.getElementById('sectores');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('select-sector', handleSelectSectorEvent as EventListener);
    return () => {
      window.removeEventListener('select-sector', handleSelectSectorEvent as EventListener);
    };
  }, []);

  const currentSector = sectors[activeTab];
  const CurrentIcon = currentSector.icon;

  return (
    <section
      id="sectores"
      className={`py-12 sm:py-20 border-t transition-colors duration-300 ${
        isDark ? 'bg-[#001833]/90 border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Especialización Sectorial
          </span>
          <h2
            className={`text-3xl sm:text-4xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-[#001E3D]'
            }`}
          >
            Soluciones adaptadas a los retos reales de tu sector.
          </h2>
          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            No todos los negocios tienen los mismos cuellos de botella. Personalizamos cada herramienta para
            resolver tus problemas específicos: desde escandallos en hostelería hasta firma digital en despachos y agendas médicas.
          </p>
        </div>

        {/* Sector Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {sectors.map((sec, idx) => {
            const Icon = sec.icon;
            const isSelected = activeTab === idx;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.03]'
                    : isDark
                    ? 'bg-[#001E3D] text-slate-300 hover:text-white hover:bg-[#002855] border border-[#0284C7]/25'
                    : 'bg-white text-slate-700 hover:text-black hover:bg-slate-100 border border-slate-200 shadow-sm'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{sec.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Sector Deep Breakdown Card */}
        <div
          className={`rounded-3xl border p-4 sm:p-10 shadow-2xl transition-all duration-300 ${
            isDark
              ? 'bg-[#001E3D] border-[#0284C7]/30 text-white shadow-[0_15px_40px_rgba(0,10,30,0.6)]'
              : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}
        >
          {/* Sector Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-700/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <CurrentIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
                  {currentSector.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {currentSector.name}
                </h3>
              </div>
            </div>

            <button
              onClick={() => onOpenBooking(`Sector: ${currentSector.name}`)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition cursor-pointer self-start md:self-auto"
            >
              <span>Pedir diagnóstico para {currentSector.shortName}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-6 space-y-2">
            <h4 className="text-lg sm:text-xl font-extrabold text-emerald-500">
              {currentSector.headline}
            </h4>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {currentSector.subheadline}
            </p>
          </div>

          {/* 2-Column Grid: Pain Points vs. Specific Needed Solutions */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 my-6 sm:my-8 items-start">
            {/* Left: Specific Pain Points of this Sector */}
            <div
              className={`p-4 sm:p-6 rounded-2xl border ${
                isDark ? 'bg-[#001428]/80 border-rose-500/20' : 'bg-rose-50/40 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 text-rose-500 font-extrabold text-sm mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Puntos de dolor habituales en {currentSector.shortName}:</span>
              </div>

              <div className="space-y-3.5">
                {currentSector.painPoints.map((pain, i) => (
                  <div key={i} className="space-y-0.5 text-xs">
                    <div className="font-bold text-rose-400 flex items-start gap-1.5">
                      <span className="text-rose-500">✕</span>
                      <span>{pain.title}</span>
                    </div>
                    <p className={`pl-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {pain.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Specific Needed Solutions implemented by Asexia */}
            <div
              className={`p-4 sm:p-6 rounded-2xl border ${
                isDark ? 'bg-[#001428]/80 border-emerald-500/25' : 'bg-emerald-50/50 border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-sm mb-4">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Soluciones específicas que implementa Asexia:</span>
              </div>

              <div className="space-y-3.5">
                {currentSector.solutions.map((sol, i) => {
                  const SolIcon = sol.icon;
                  return (
                    <div key={i} className="space-y-0.5 text-xs">
                      <div className="font-bold text-emerald-400 flex items-center gap-2">
                        <SolIcon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{sol.title}</span>
                      </div>
                      <p className={`pl-5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {sol.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sector Integration with the 4 Commercial Lines */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#002855]/60 border-[#0284C7]/25' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Cómo se aplican las 4 líneas comerciales en {currentSector.name}:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <strong className="text-blue-400 block text-[11px]">1. Presencia</strong>
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  {currentSector.commercialLinesFit.presencia}
                </span>
              </div>
              <div>
                <strong className="text-emerald-400 block text-[11px]">2. Captación</strong>
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  {currentSector.commercialLinesFit.captacion}
                </span>
              </div>
              <div>
                <strong className="text-teal-400 block text-[11px]">3. Cumplimiento</strong>
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  {currentSector.commercialLinesFit.cumplimiento}
                </span>
              </div>
              <div>
                <strong className="text-indigo-400 block text-[11px]">4. Acelerador</strong>
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  {currentSector.commercialLinesFit.campanas}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
