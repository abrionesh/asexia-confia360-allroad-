import React, { useState } from 'react';
import {
  Globe,
  Calendar,
  MessageSquare,
  Star,
  FileCheck,
  TrendingUp,
  Building2,
  Stethoscope,
  ShoppingBag,
  Utensils,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AsexiaLogo } from './AsexiaLogo';

interface BusinessEcosystemHeroShowcaseProps {
  onOpenBooking: (context?: string) => void;
  onOpenComparator: () => void;
}

type BusinessType = 'servicios' | 'clinicas' | 'comercios' | 'hosteleria';

export const BusinessEcosystemHeroShowcase: React.FC<BusinessEcosystemHeroShowcaseProps> = ({
  onOpenBooking,
}) => {
  const { isDark } = useTheme();
  const [activeBusiness, setActiveBusiness] = useState<BusinessType>('servicios');

  const businessData = {
    servicios: {
      title: 'Despachos y Servicios Profesionales',
      subtitle: 'Abogados, gestorías, consultorías y profesionales técnicos',
      statPrimary: '15-20h',
      statLabel: 'Ahorro semanal en trámites',
      channels: ['Web corporativa de alta velocidad', 'Captación de solicitudes por WhatsApp', 'Gestión de facturación electrónica y Kit Digital', 'Seguimiento comercial de propuestas'],
      highlight: '0 llamadas ni consultas perdidas gracias al asistente de recepción',
      previewBadge: 'Servicios Profesionales',
      badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    },
    clinicas: {
      title: 'Clínicas y Consultas de Salud',
      subtitle: 'Fisioterapia, odontología, podología y centros médicos',
      statPrimary: '-85%',
      statLabel: 'Ausencias gracias a confirmación por WhatsApp',
      channels: ['Ficha de Google Maps con reseñas 5★', 'Agenda y reserva de citas 24/7', 'Recordatorios automatizados previos', 'Cumplimiento normativo y RGPD sanitario'],
      highlight: 'Agenda completa con sincronización automática de especialistas',
      previewBadge: 'Clínicas y Salud',
      badgeColor: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
    },
    comercios: {
      title: 'Comercios y Negocios Locales',
      subtitle: 'Tiendas de proximidad, talleres, reformas y retail',
      statPrimary: '+40%',
      statLabel: 'Visibilidad en búsquedas locales de la zona',
      channels: ['Perfil Google Business optimizado', 'Catálogo digital móvil para clientes', 'Canal de pedidos directos por WhatsApp', 'Campañas segmentadas para vecinos del barrio'],
      highlight: 'Tus vecinos te encuentran primero cuando buscan lo que ofreces',
      previewBadge: 'Comercio Local',
      badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    },
    hosteleria: {
      title: 'Hostelería y Restauración',
      subtitle: 'Restaurantes, gastrobares y locales de ocio',
      statPrimary: '+25%',
      statLabel: 'Aumento en reservas directas sin comisiones',
      channels: ['Reservas de mesa online sin intermediarios', 'Carta digital interactiva (con demo visual 3D)', 'Captación continua de reseñas en Google', 'Campañas para eventos y fechas especiales'],
      highlight: 'Carta accesible en 1 toque y confirmación de mesa inmediata',
      previewBadge: 'Hostelería (Ejemplo interactivo)',
      badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    },
  };

  const current = businessData[activeBusiness];

  return (
    <div className="w-full max-w-xl mx-auto lg:max-w-none">
      {/* Clean Segment Selector for Business Sectors */}
      <div
        className={`flex flex-wrap items-center justify-between gap-1.5 p-1.5 rounded-2xl border mb-4 backdrop-blur-xl transition-colors ${
          isDark
            ? 'bg-[#001E3D]/90 border-[#0284C7]/20 text-slate-300'
            : 'bg-white/95 border-slate-200 text-slate-700 shadow-sm'
        }`}
      >
        <button
          onClick={() => setActiveBusiness('servicios')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
            activeBusiness === 'servicios'
              ? 'bg-blue-600 text-white shadow-sm'
              : isDark
              ? 'hover:text-white hover:bg-[#002855]'
              : 'hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Servicios</span>
        </button>

        <button
          onClick={() => setActiveBusiness('clinicas')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
            activeBusiness === 'clinicas'
              ? 'bg-sky-600 text-white shadow-sm'
              : isDark
              ? 'hover:text-white hover:bg-[#002855]'
              : 'hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Clínicas</span>
        </button>

        <button
          onClick={() => setActiveBusiness('comercios')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
            activeBusiness === 'comercios'
              ? 'bg-emerald-600 text-white shadow-sm'
              : isDark
              ? 'hover:text-white hover:bg-[#002855]'
              : 'hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Comercios</span>
        </button>

        <button
          onClick={() => setActiveBusiness('hosteleria')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
            activeBusiness === 'hosteleria'
              ? 'bg-amber-600 text-white shadow-sm'
              : isDark
              ? 'hover:text-white hover:bg-[#002855]'
              : 'hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Hostelería</span>
        </button>
      </div>

      {/* Main Showcase Panel */}
      <div
        className={`rounded-3xl border shadow-xl p-5 sm:p-6 transition-all duration-300 relative overflow-hidden ${
          isDark
            ? 'bg-[#001E3D] border-[#0284C7]/25 text-white'
            : 'bg-white border-slate-200/90 text-slate-900 shadow-slate-200/60'
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/40 text-xs">
          <div className="flex items-center gap-2">
            <AsexiaLogo size={24} showText={false} />
            <span className="font-extrabold text-sm tracking-tight">Sistema Conectado Asexia</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${current.badgeColor}`}
            >
              {current.previewBadge}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Operativo 24/7</span>
          </div>
        </div>

        {/* Core Business Preview Header */}
        <div className="pt-4 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight">{current.title}</h3>
              <p
                className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
              >
                {current.subtitle}
              </p>
            </div>

            {/* Impact Metric Box */}
            <div
              className={`flex-shrink-0 px-3.5 py-2 rounded-2xl border text-right ${
                isDark ? 'bg-[#001428] border-[#0284C7]/30' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-lg font-black text-emerald-500 leading-none">{current.statPrimary}</div>
              <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {current.statLabel}
              </div>
            </div>
          </div>
        </div>

        {/* The 4 Commercial Lines Connected Grid */}
        <div className="grid sm:grid-cols-2 gap-2.5 my-4">
          {/* 1. Presencia Digital */}
          <div
            className={`p-3 rounded-2xl border transition ${
              isDark
                ? 'bg-[#001428]/80 border-[#0284C7]/20 hover:border-sky-400'
                : 'bg-slate-50 border-slate-200/90 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black">1. Presencia Digital</span>
            </div>
            <p className={`text-[11px] leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Web ultra rápida, móvil y ficha en Google Maps optimizada para captar búsquedas de tu zona.
            </p>
          </div>

          {/* 2. Captación */}
          <div
            className={`p-3 rounded-2xl border transition ${
              isDark
                ? 'bg-[#001428]/80 border-[#0284C7]/20 hover:border-emerald-400'
                : 'bg-slate-50 border-slate-200/90 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black">2. Captación</span>
            </div>
            <p className={`text-[11px] leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Canal de WhatsApp, reservas online directas y seguimiento comercial sin llamadas perdidas.
            </p>
          </div>

          {/* 3. Cumplimiento */}
          <div
            className={`p-3 rounded-2xl border transition ${
              isDark
                ? 'bg-[#001428]/80 border-[#0284C7]/20 hover:border-teal-400'
                : 'bg-slate-50 border-slate-200/90 hover:border-teal-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black">3. Cumplimiento</span>
            </div>
            <p className={`text-[11px] leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Facturación electrónica, orden administrativo y tramitación de subvenciones como Kit Digital.
            </p>
          </div>

          {/* 4. Acelerador de Campañas */}
          <div
            className={`p-3 rounded-2xl border transition ${
              isDark
                ? 'bg-[#001428]/80 border-[#0284C7]/20 hover:border-indigo-400'
                : 'bg-slate-50 border-slate-200/90 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black">4. Acelerador</span>
            </div>
            <p className={`text-[11px] leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Publicidad segmentada y landing pages enfocadas en generar consultas y clientes reales.
            </p>
          </div>
        </div>

        {/* Feature summary row */}
        <div
          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs mb-4 ${
            isDark
              ? 'bg-[#002855]/60 border-[#0284C7]/30 text-slate-200'
              : 'bg-emerald-50/70 border-emerald-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="truncate font-medium">{current.highlight}</span>
          </div>

          <span className="text-[11px] font-bold text-emerald-500 flex-shrink-0">
            IA aplicada
          </span>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-700/40">
          <div
            className={`text-xs flex items-center gap-2 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Puesta en marcha ágil · Soporte continuo</span>
          </div>

          <button
            onClick={() => onOpenBooking(`Interés en ${current.title}`)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <span>Pedir diagnóstico para mi sector</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
