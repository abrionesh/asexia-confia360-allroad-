import React from 'react';
import { Phone, Mail, Globe, Calendar, ArrowRight, MessageSquare, Lock, ExternalLink } from 'lucide-react';
import { AsexiaLogo } from './AsexiaLogo';
import { useTheme } from '../context/ThemeContext';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking, onOpenAdmin }) => {
  const { isDark } = useTheme();

  return (
    <footer
      id="contacto"
      className={`border-t transition-colors duration-300 text-xs ${
        isDark
          ? 'bg-[#001428] border-[#0284C7]/20 text-slate-400'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}
    >
      {/* Pre-footer Call to Action Banner (Conversion Focused) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-sky-700 to-emerald-600 p-8 sm:p-12 shadow-2xl text-white">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-xl text-left">
              <span className="text-[11px] font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-blue-100">
                Diagnóstico inicial en 15–20 minutos
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                ¿Hablamos sobre cómo conectar y hacer crecer tu negocio?
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Analizamos tu presencia digital, tus canales de captación y tus procesos para identificar
                prioridades claras y próximos pasos. Sin compromiso.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-semibold">
                <span className="bg-black/25 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Presencia
                </span>
                <span className="bg-black/25 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-300" />
                  Captación
                </span>
                <span className="bg-black/25 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                  Cumplimiento
                </span>
                <span className="bg-black/25 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
                  Acelerador
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white text-slate-900 font-extrabold text-sm hover:bg-slate-100 shadow-2xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Quiero mi diagnóstico gratuito</span>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </button>

              <a
                href="tel:609735753"
                className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-[#001428]/85 hover:bg-[#001E3D] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl border border-white/20 transition"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>609 735 753</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div
          className={`grid grid-cols-1 md:grid-cols-4 gap-8 pt-16 pb-8 border-b ${
            isDark ? 'border-[#0284C7]/15' : 'border-slate-200'
          }`}
        >
          {/* Brand info with AsexiaLogo */}
          <div className="space-y-4 md:col-span-1 text-left">
            <AsexiaLogo
              size={44}
              showText={true}
              textColor={isDark ? 'text-white' : 'text-[#001E3D]'}
              subtextColor={isDark ? 'text-slate-400' : 'text-slate-600'}
            />
            <p
              className={`text-xs leading-relaxed mt-2 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Tecnología práctica y automatización conectada al servicio de pymes y negocios locales: presencia digital, captación, cumplimiento y aceleración comercial.
            </p>
          </div>

          {/* Contact Details (Verified Real Data) */}
          <div className="space-y-3 text-left">
            <h4
              className={`font-bold text-xs uppercase tracking-wider ${
                isDark ? 'text-white' : 'text-[#001E3D]'
              }`}
            >
              Contacto
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="tel:609735753"
                  className={`flex items-center gap-2 transition font-semibold ${
                    isDark ? 'text-slate-200 hover:text-white' : 'text-slate-800 hover:text-blue-600'
                  }`}
                >
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>609 735 753</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:soyasexia@gmail.com"
                  className={`flex items-center gap-2 transition ${
                    isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  <Mail className="w-4 h-4 text-sky-500" />
                  <span>soyasexia@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://calendly.com/mundoconfia/orientacion?month=2026-03&date=2026-03-20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline transition text-emerald-500 font-semibold"
                >
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span>Agendar en Calendly</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/34609735753"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition hover:text-emerald-400 font-medium"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <span>WhatsApp comercial</span>
                </a>
              </li>
            </ul>
          </div>

          {/* The 4 Commercial Lines */}
          <div className="space-y-3 text-left">
            <h4
              className={`font-bold text-xs uppercase tracking-wider ${
                isDark ? 'text-white' : 'text-[#001E3D]'
              }`}
            >
              Líneas Comerciales
            </h4>
            <ul
              className={`space-y-2 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              <li>
                <a href="#soluciones" className="hover:text-emerald-500 transition font-medium">
                  1. Presencia Digital
                </a>
              </li>
              <li>
                <a href="#soluciones" className="hover:text-emerald-500 transition font-medium">
                  2. Captación
                </a>
              </li>
              <li>
                <a href="#soluciones" className="hover:text-emerald-500 transition font-medium">
                  3. Cumplimiento
                </a>
              </li>
              <li>
                <a href="#soluciones" className="hover:text-emerald-500 transition font-medium">
                  4. Acelerador de Campañas
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation & Method */}
          <div className="space-y-3 text-left">
            <h4
              className={`font-bold text-xs uppercase tracking-wider ${
                isDark ? 'text-white' : 'text-[#001E3D]'
              }`}
            >
              Navegación
            </h4>
            <ul
              className={`space-y-2 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              <li><a href="#soluciones" className="hover:text-emerald-500 transition">Soluciones</a></li>
              <li><a href="#calculadora-roi" className="hover:text-emerald-500 transition">Calculadora ROI</a></li>
              <li><a href="#diagnostico-confia360" className="hover:text-emerald-500 transition font-semibold text-emerald-500">Diagnóstico ConfIA360</a></li>
              <li><a href="#sectores" className="hover:text-emerald-500 transition">Sectores</a></li>
              <li><a href="#como-trabajamos" className="hover:text-emerald-500 transition">Cómo trabajamos</a></li>
              <li><a href="#casos" className="hover:text-emerald-500 transition">Casos y demos</a></li>
              <li>
                <a
                  href="https://asexia-confia360-captaglobal.grok.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-500 transition inline-flex items-center gap-1 font-medium text-sky-500"
                >
                  <span>ConfIA360 CaptaGlobal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li><a href="#contacto" className="hover:text-emerald-500 transition">Contacto y reservas</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and private internal access */}
        <div
          className={`pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] ${
            isDark ? 'text-slate-500' : 'text-slate-500'
          }`}
        >
          <div>
            © {new Date().getFullYear()} Asexia. Tecnología práctica para pymes y negocios locales.
          </div>

          <div className="flex items-center gap-4">
            <span className="hover:text-emerald-500 transition cursor-pointer">Aviso Legal</span>
            <span>·</span>
            <span className="hover:text-emerald-500 transition cursor-pointer">Privacidad</span>
            <span>·</span>
            <span className="hover:text-emerald-500 transition cursor-pointer">Cookies</span>
            <span>·</span>
            {/* Private internal admin trigger (preserved internal access without cluttering public flow) */}
            <button
              onClick={onOpenAdmin}
              title="Acceso interno de gestión"
              className="hover:text-slate-300 transition flex items-center gap-1 cursor-pointer opacity-70 hover:opacity-100"
            >
              <Lock className="w-3 h-3" />
              <span>Acceso interno</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
