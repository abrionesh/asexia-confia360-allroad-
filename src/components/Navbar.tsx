import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Menu,
  X,
  Phone,
  ChevronDown,
  Utensils,
  Building2,
  Stethoscope,
  ShoppingBag,
  Home,
  ArrowRight
} from 'lucide-react';
import { AsexiaLogo } from './AsexiaLogo';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onOpenBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sectorsDropdownOpen, setSectorsDropdownOpen] = useState(false);
  const [mobileSectorsOpen, setMobileSectorsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  const sectorItems = [
    {
      id: 'restauracion',
      title: 'Restauración y Hostelería',
      focus: 'Escandallos, reservas sin comisiones y 0 no-shows',
      icon: Utensils,
      color: 'text-amber-500',
    },
    {
      id: 'servicios',
      title: 'Servicios Profesionales y Despachos',
      focus: 'Firma digital legal, facturación y orden documental',
      icon: Building2,
      color: 'text-blue-500',
    },
    {
      id: 'clinicas',
      title: 'Clínicas y Consultas de Salud',
      focus: 'Agenda médica 24/7, recordatorios y RGPD sanitario',
      icon: Stethoscope,
      color: 'text-sky-500',
    },
    {
      id: 'comercios',
      title: 'Comercio Local y Proximidad',
      focus: 'Google Maps 5★, catálogo WhatsApp y fidelización',
      icon: ShoppingBag,
      color: 'text-emerald-500',
    },
    {
      id: 'inmobiliarias',
      title: 'Inmobiliarias y Propiedades',
      focus: 'Filtro previo de solvencia y firma digital de arras',
      icon: Home,
      color: 'text-teal-500',
    },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSectorsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSector = (sectorId: string) => {
    setSectorsDropdownOpen(false);
    setMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent('select-sector', { detail: sectorId }));
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-300 ${
        isDark
          ? 'bg-[#001428]/95 border-[#0284C7]/20 text-slate-100 shadow-[0_4px_20px_rgba(0,20,40,0.5)]'
          : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Asexia with Official Corporate Emblem */}
          <a href="#" className="flex items-center group">
            <AsexiaLogo
              size={44}
              showText={true}
              textColor={isDark ? 'text-white' : 'text-[#001E3D]'}
              subtextColor={isDark ? 'text-slate-400' : 'text-slate-600'}
            />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold">
            <a
              href="#soluciones"
              className={`transition-colors py-1 ${
                isDark ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-700 hover:text-blue-600'
              }`}
            >
              Soluciones
            </a>

            {/* Sectores with Dropdown menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setSectorsDropdownOpen(!sectorsDropdownOpen)}
                onMouseEnter={() => setSectorsDropdownOpen(true)}
                className={`flex items-center gap-1.5 py-1 transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-200 hover:text-emerald-400'
                    : 'text-slate-700 hover:text-blue-600'
                }`}
              >
                <span>Sectores</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    sectorsDropdownOpen ? 'rotate-180 text-emerald-500' : ''
                  }`}
                />
              </button>

              {/* Sectores Dropdown Content */}
              {sectorsDropdownOpen && (
                <div
                  onMouseLeave={() => setSectorsDropdownOpen(false)}
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 sm:w-96 rounded-2xl border p-2.5 shadow-2xl backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-150 z-50 ${
                    isDark
                      ? 'bg-[#001E3D]/95 border-[#0284C7]/30 text-white shadow-[0_15px_40px_rgba(0,10,30,0.8)]'
                      : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
                  }`}
                >
                  <div className="px-3 py-2 border-b border-slate-700/30 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-500">
                      Puntos de dolor y soluciones por sector
                    </span>
                    <a
                      href="#sectores"
                      onClick={() => setSectorsDropdownOpen(false)}
                      className="text-[11px] text-blue-400 hover:underline font-semibold"
                    >
                      Ver todos
                    </a>
                  </div>

                  <div className="p-1 space-y-1">
                    {sectorItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectSector(item.id)}
                          className={`w-full p-2.5 rounded-xl text-left transition flex items-start gap-3 cursor-pointer ${
                            isDark
                              ? 'hover:bg-[#002855] text-slate-200 hover:text-white'
                              : 'hover:bg-slate-50 text-slate-800 hover:text-blue-600'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isDark ? 'bg-[#001428]' : 'bg-slate-100'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${item.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold leading-snug truncate">
                              {item.title}
                            </div>
                            <div
                              className={`text-[11px] leading-tight line-clamp-1 ${
                                isDark ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              {item.focus}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <a
              href="#como-trabajamos"
              className={`transition-colors py-1 ${
                isDark ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-700 hover:text-blue-600'
              }`}
            >
              Cómo trabajamos
            </a>

            <a
              href="#casos"
              className={`transition-colors py-1 ${
                isDark ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-700 hover:text-blue-600'
              }`}
            >
              Casos y demos
            </a>

            <a
              href="#contacto"
              className={`transition-colors py-1 ${
                isDark ? 'text-slate-200 hover:text-emerald-400' : 'text-slate-700 hover:text-blue-600'
              }`}
            >
              Contacto
            </a>
          </nav>

          {/* Right Header CTAs: Theme Toggle & Primary Featured CTA */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Single clean Day / Night Theme Switcher */}
            <ThemeToggle showDetails={false} />

            {/* Featured CTA: Diagnóstico gratuito */}
            <button
              onClick={onOpenBooking}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>Diagnóstico gratuito</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className={`p-2 rounded-xl border ${
                isDark
                  ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-black'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b p-4 space-y-3 animate-in slide-in-from-top duration-200 ${
            isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-white border-slate-200 shadow-xl'
          }`}
        >
          <div className="space-y-1">
            <a
              href="#soluciones"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isDark
                  ? 'text-slate-200 hover:bg-[#002855] hover:text-emerald-400'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-blue-600'
              }`}
            >
              Soluciones
            </a>

            {/* Mobile Sectores with Accordion */}
            <div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl">
                <a
                  href="#sectores"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-semibold transition ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}
                >
                  Sectores
                </a>
                <button
                  type="button"
                  onClick={() => setMobileSectorsOpen(!mobileSectorsOpen)}
                  className="p-1 text-slate-400 hover:text-emerald-400"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      mobileSectorsOpen ? 'rotate-180 text-emerald-500' : ''
                    }`}
                  />
                </button>
              </div>

              {mobileSectorsOpen && (
                <div
                  className={`pl-3 pr-2 py-1.5 ml-2 border-l space-y-1 ${
                    isDark ? 'border-[#0284C7]/30 bg-[#001428]/40' : 'border-slate-200 bg-slate-50'
                  } rounded-r-xl`}
                >
                  {sectorItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectSector(item.id)}
                        className={`w-full py-2 px-2.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between gap-2 transition cursor-pointer ${
                          isDark
                            ? 'text-slate-300 hover:text-white hover:bg-[#002855]'
                            : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Icon className={`w-3.5 h-3.5 ${item.color} flex-shrink-0`} />
                          <span className="truncate">{item.title}</span>
                        </span>
                        <ArrowRight className="w-3 h-3 opacity-60 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <a
              href="#como-trabajamos"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isDark
                  ? 'text-slate-200 hover:bg-[#002855] hover:text-emerald-400'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-blue-600'
              }`}
            >
              Cómo trabajamos
            </a>

            <a
              href="#casos"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isDark
                  ? 'text-slate-200 hover:bg-[#002855] hover:text-emerald-400'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-blue-600'
              }`}
            >
              Casos y demos
            </a>

            <a
              href="#contacto"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isDark
                  ? 'text-slate-200 hover:bg-[#002855] hover:text-emerald-400'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-blue-600'
              }`}
            >
              Contacto
            </a>
          </div>

          <div
            className={`pt-3 border-t space-y-2.5 ${
              isDark ? 'border-[#0284C7]/20' : 'border-slate-200'
            }`}
          >
            <button
              onClick={() => {
                onOpenBooking();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Diagnóstico gratuito</span>
            </button>

            <a
              href="tel:609735753"
              className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border ${
                isDark
                  ? 'bg-[#002855] text-slate-200 border-[#0284C7]/30'
                  : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Llamar al 609 735 753</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
