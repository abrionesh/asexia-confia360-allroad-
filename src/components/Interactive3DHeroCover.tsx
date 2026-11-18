import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Calendar,
  MessageSquare,
  Star,
  Utensils,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Compass,
  Check,
  Zap,
  RotateCw,
  Maximize2,
  Layers,
  Activity,
  ShoppingBag,
  Stethoscope,
  Boxes,
  HeartPulse,
  Flame,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { AsexiaLogo } from './AsexiaLogo';
import { useTheme } from '../context/ThemeContext';

interface Interactive3DHeroCoverProps {
  onOpenBooking: (plan?: string) => void;
}

type SectorTab = 'restaurant' | 'clinic' | 'retail' | 'mode3d';

export const Interactive3DHeroCover: React.FC<Interactive3DHeroCoverProps> = ({ onOpenBooking }) => {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(-5);
  const [rotateY, setRotateY] = useState(10);
  const [activeTab, setActiveTab] = useState<SectorTab>('restaurant');
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<'emerald' | 'blue' | 'amber' | 'cyan'>('emerald');
  const [modelAngle, setModelAngle] = useState(0);

  // Auto rotation loop when enabled
  useEffect(() => {
    if (!isAutoRotating || isHovered) return;
    let angle = 0;
    const interval = setInterval(() => {
      angle += 0.03;
      setRotateY(Math.sin(angle) * 16);
      setRotateX(-5 + Math.cos(angle * 0.8) * 7);
      setModelAngle((prev) => (prev + 1) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isAutoRotating, isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    setRotateX(-(y / (rect.height / 2)) * 14);
    setRotateY((x / (rect.width / 2)) * 16);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!isAutoRotating) {
      setRotateX(-5);
      setRotateY(10);
    }
  };

  // Reset exploded state when tab changes
  const handleTabChange = (tab: SectorTab) => {
    setActiveTab(tab);
    setIsExploded(false);
    setModelAngle(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-4xl mx-auto perspective-1000 py-4 select-none"
    >
      {/* 3D Depth & Sector Controller Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 mb-3.5 px-3 py-2 rounded-2xl backdrop-blur-xl text-xs shadow-2xl transition-colors duration-300 border ${
          isDark
            ? 'bg-[#001E3D]/95 border-[#0284C7]/30 text-white shadow-[0_10px_30px_rgba(0,10,30,0.7)]'
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-xl'
        }`}
      >
        {/* Sector Tabs: Restauración, Clínicas, Comercios, Modo 3D Total */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => handleTabChange('restaurant')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 text-xs ${
              activeTab === 'restaurant'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/25 scale-[1.03]'
                : isDark
                ? 'bg-[#002855]/70 text-slate-300 hover:text-white hover:bg-[#003B7A]'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Restauración 3D</span>
          </button>

          <button
            onClick={() => handleTabChange('clinic')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 text-xs ${
              activeTab === 'clinic'
                ? 'bg-gradient-to-r from-blue-600 via-sky-500 to-teal-400 text-white shadow-md shadow-sky-500/25 scale-[1.03]'
                : isDark
                ? 'bg-[#002855]/70 text-slate-300 hover:text-white hover:bg-[#003B7A]'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clínicas & Citas IA</span>
          </button>

          <button
            onClick={() => handleTabChange('retail')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 text-xs ${
              activeTab === 'retail'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-md shadow-emerald-500/25 scale-[1.03]'
                : isDark
                ? 'bg-[#002855]/70 text-slate-300 hover:text-white hover:bg-[#003B7A]'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Comercios & Retail</span>
          </button>

          <button
            onClick={() => handleTabChange('mode3d')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 text-xs ${
              activeTab === 'mode3d'
                ? 'bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-500 text-white shadow-md shadow-blue-500/30 scale-[1.03]'
                : isDark
                ? 'bg-[#002855]/70 text-slate-300 hover:text-white hover:bg-[#003B7A]'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-cyan-400" />
            <span>Modo 3D Total</span>
          </button>
        </div>

        {/* 3D Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Exploded / Layers Toggle */}
          <button
            onClick={() => setIsExploded(!isExploded)}
            title="Alternar desglose 3D en capas"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer border ${
              isExploded
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : isDark
                ? 'bg-[#002855] text-slate-300 hover:text-white border-[#0284C7]/30'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
          >
            <Layers className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">{isExploded ? 'Desglose Activo' : 'Capa 3D'}</span>
          </button>

          {/* 3D Orbit Toggle */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            title="Alternar rotación automática en 3D"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer border ${
              isAutoRotating
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                : isDark
                ? 'bg-[#002855] text-slate-300 hover:text-white border-[#0284C7]/30'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
          >
            <Compass className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Giro 3D {isAutoRotating ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>

      {/* 3D Multi-Layer Stage */}
      <div
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`,
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="relative transform-style-3d will-change-transform rounded-3xl"
      >
        {/* Brand Sapphire & Emerald Aura Glow */}
        <div
          className={`absolute -inset-8 rounded-[48px] blur-3xl -z-10 opacity-70 transition-all duration-700 ${
            activeTab === 'restaurant'
              ? 'bg-gradient-to-tr from-orange-600/30 via-amber-600/25 to-emerald-500/25'
              : activeTab === 'clinic'
              ? 'bg-gradient-to-tr from-sky-600/35 via-blue-600/25 to-teal-400/30'
              : activeTab === 'retail'
              ? 'bg-gradient-to-tr from-emerald-600/30 via-cyan-600/25 to-blue-500/30'
              : 'bg-gradient-to-tr from-blue-700/40 via-indigo-600/30 to-emerald-500/35'
          }`}
        />

        {/* Dynamic Sector Atmosphere Ambient Image in Background */}
        <div
          style={{ transform: 'translateZ(-25px) translateX(-25px)' }}
          className="absolute -top-12 -left-8 sm:-left-16 w-52 sm:w-72 h-60 sm:h-80 rounded-3xl overflow-hidden pointer-events-none opacity-40 sm:opacity-60 -z-10 mix-blend-lighten hidden md:block transition-all duration-500"
        >
          {activeTab === 'restaurant' && (
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
              alt="Ambiente gastronómico"
              className="w-full h-full object-cover rounded-3xl filter contrast-125 saturate-125 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]"
            />
          )}
          {activeTab === 'clinic' && (
            <img
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"
              alt="Ambiente de clínica dental"
              className="w-full h-full object-cover rounded-3xl filter contrast-125 saturate-125 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]"
            />
          )}
          {activeTab === 'retail' && (
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"
              alt="Ambiente de comercio moderno"
              className="w-full h-full object-cover rounded-3xl filter contrast-125 saturate-125 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]"
            />
          )}
          {activeTab === 'mode3d' && (
            <img
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
              alt="Ecosistema tecnológico 3D"
              className="w-full h-full object-cover rounded-3xl filter contrast-125 saturate-125 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]"
            />
          )}
        </div>

        {/* Floating 3D Badge (Top Left with Brand Emblem) */}
        <div
          style={{ transform: 'translateZ(75px) translateX(-15px) translateY(-10px)' }}
          className={`absolute -top-4 -left-2 sm:-left-4 z-30 hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-2xl backdrop-blur-xl shadow-2xl text-xs animate-float-slow border transition-colors ${
            isDark
              ? 'bg-[#001E3D]/95 border-emerald-500/30 text-white shadow-[0_10px_30px_rgba(0,10,30,0.8)]'
              : 'bg-white/95 border-emerald-500/50 text-slate-900 shadow-slate-300'
          }`}
        >
          <AsexiaLogo size={32} showText={false} />
          <div>
            <div className={`font-extrabold text-xs ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
              {activeTab === 'restaurant' && 'Carta 3D & Más Mesas'}
              {activeTab === 'clinic' && '0 Llamadas Perdidas'}
              {activeTab === 'retail' && 'Catálogo 3D & Pedidos PWA'}
              {activeTab === 'mode3d' && 'Ecosistema 3D Completo'}
            </div>
            <div className="text-xs text-emerald-500 font-bold font-handwriting">
              Más vida para tu negocio.
            </div>
          </div>
        </div>

        {/* Floating 3D Badge (Top Right) */}
        <div
          style={{ transform: 'translateZ(65px) translateX(10px) translateY(-8px)' }}
          className={`absolute -top-3 -right-2 sm:-right-4 z-30 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-xl shadow-xl text-xs font-handwriting text-base border transition-colors ${
            isDark
              ? 'bg-[#001E3D]/95 border-sky-500/40 text-sky-300'
              : 'bg-white/95 border-sky-400 text-sky-700 shadow-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>
            {activeTab === 'restaurant' && 'Gastronomía en 360°'}
            {activeTab === 'clinic' && 'Agenda IA Médica 24/7'}
            {activeTab === 'retail' && 'Escaparate 3D Interactivo'}
            {activeTab === 'mode3d' && 'Experiencia Espacial WebGL'}
          </span>
        </div>

        {/* MAIN 3D HARDWARE SHELL / SCREEN */}
        <div
          className={`relative rounded-3xl p-2 sm:p-3 shadow-2xl border backdrop-blur-xl transition-colors duration-300 ${
            isDark
              ? 'bg-gradient-to-b from-[#001E3D] via-[#001833] to-[#001428] border-[#0284C7]/30 shadow-[0_25px_60px_rgba(0,10,30,0.85)]'
              : 'bg-gradient-to-b from-slate-100 via-white to-slate-50 border-slate-300/80 shadow-2xl'
          }`}
        >
          {/* Laptop Screen Top Window Bar */}
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800/60 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/90" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/90" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/90" />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-300 bg-slate-950/80 px-3 py-0.5 rounded-full border border-slate-800 font-mono">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>https://asexia.es/{activeTab}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-bold text-emerald-400 hidden sm:inline">ONLINE</span>
            </div>
          </div>

          {/* Laptop Screen Display Area */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-950 aspect-[16/10] sm:aspect-[16/9.5] border border-slate-800/80 p-4 sm:p-6 flex flex-col justify-between">
            {/* Screen Lighting and Mesh */}
            <div
              className={`absolute inset-0 -z-10 transition-all duration-700 ${
                activeTab === 'restaurant'
                  ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/40 via-slate-950/90 to-slate-950'
                  : activeTab === 'clinic'
                  ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/45 via-slate-950/90 to-slate-950'
                  : activeTab === 'retail'
                  ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-slate-950/90 to-slate-950'
                  : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/50 via-slate-950/90 to-slate-950'
              }`}
            />

            {/* Screen Header inside Laptop */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <AsexiaLogo size={26} showText={false} />
                <span className="font-black text-sm tracking-tight text-white flex items-center gap-1">
                  Asexia <span className="text-emerald-400">.</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {activeTab === 'restaurant' && 'Hostelería 3D & Carta Interactiva'}
                  {activeTab === 'clinic' && 'Clínica & Agenda Pacientes IA'}
                  {activeTab === 'retail' && 'Comercio Local & Catálogo 3D'}
                  {activeTab === 'mode3d' && 'Ecosistema Web 3D & PWA'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold flex items-center gap-1 border border-emerald-500/20">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>3D Activo</span>
                </span>
              </div>
            </div>

            {/* Central Showcase inside Laptop: Left Briefing + Right Impactful 3D Showcase */}
            <div className="my-auto py-2 grid md:grid-cols-12 gap-5 items-center z-10">
              {/* Left Briefing Column */}
              <div className="md:col-span-5 space-y-2.5 text-left">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" />
                  <span>Experiencia Inmersiva</span>
                </div>

                <h4 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
                  {activeTab === 'restaurant' && 'TU CARTA Y PLATOS EN 3D IMPACTANTE'}
                  {activeTab === 'clinic' && 'TU CLÍNICA CON ESCÁNER Y CITAS IA'}
                  {activeTab === 'retail' && 'PRODUCTOS 3D QUE SE VENDEN SOLOS'}
                  {activeTab === 'mode3d' && 'ECOSISTEMA DIGITAL EN 3 DIMENSIONES'}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeTab === 'restaurant' &&
                    'Los comensales ven cada plato en 360°, exploran alérgenos e ingredientes y reservan mesa desde su móvil en segundos.'}
                  {activeTab === 'clinic' &&
                    'Visualización anatómica clara para tus pacientes, recordatorios automáticos por WhatsApp y 0 llamadas perdidas en recepción.'}
                  {activeTab === 'retail' &&
                    'Muestra tus productos estrella con giro 360°, vista explosionada y botón de compra directa a WhatsApp.'}
                  {activeTab === 'mode3d' &&
                    'Integración completa de web ultra rápida, agente IA, pasarela de cobro, CRM y automatizaciones operativas.'}
                </p>

                {/* Key feature pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeTab === 'restaurant' && (
                    <>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30 text-orange-300">
                        🔥 +42% ticket medio
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                        📱 QR & Carta PWA
                      </span>
                    </>
                  )}
                  {activeTab === 'clinic' && (
                    <>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300">
                        🩺 -85% ausencias
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                        🤖 Triaje IA 24/7
                      </span>
                    </>
                  )}
                  {activeTab === 'retail' && (
                    <>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300">
                        ⭐ 4.9★ Google Maps
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                        📦 Catálogo PWA
                      </span>
                    </>
                  )}
                  {activeTab === 'mode3d' && (
                    <>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300">
                        ⚡ Rendimiento 100/100
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                        🔒 Kit Digital 100%
                      </span>
                    </>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => onOpenBooking(`Demo ${activeTab}`)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
                  >
                    <span>Ver demo interactiva</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-slate-400 font-mono">100% PWA</span>
                </div>
              </div>

              {/* Right Column: IMPACTFUL 3D VISUAL PRESENTATION WITH INTERACTIVITY */}
              <div className="md:col-span-7 relative">
                <div
                  className={`relative rounded-2xl p-3 border shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-500 group ${
                    isDark
                      ? 'bg-gradient-to-br from-[#001E3D] via-[#001833] to-[#001428] border-[#0284C7]/30 shadow-[0_15px_40px_rgba(0,10,30,0.9)]'
                      : 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-slate-700/80 shadow-2xl'
                  }`}
                >
                  {/* Glowing 3D Grid Floor Effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c715_1px,transparent_1px),linear-gradient(to_bottom,#0284c715_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

                  {/* ==================== 1. RESTAURACIÓN 3D SHOWCASE ==================== */}
                  {activeTab === 'restaurant' && (
                    <div className="relative flex flex-col items-center justify-center min-h-[220px] sm:min-h-[260px]">
                      {/* Floating Orbit Rings */}
                      <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-orange-500/25 animate-[spin_20s_linear_infinite] pointer-events-none" />
                      <div className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full border border-dashed border-emerald-500/20 animate-[spin_30s_linear_infinite_reverse] pointer-events-none" />

                      {/* Main 3D Gourmet Dish Image with 3D Depth & Layers */}
                      <div
                        style={{
                          transform: `scale(${isExploded ? 1.08 : 1}) rotateZ(${modelAngle * 0.1}deg)`,
                          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        }}
                        className="relative z-10 w-40 h-40 sm:w-52 sm:h-52 rounded-full p-2 bg-gradient-to-tr from-amber-500/20 via-orange-500/10 to-emerald-500/20 shadow-[0_15px_45px_rgba(249,115,22,0.35)]"
                      >
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-amber-500/50 relative shadow-inner">
                          <img
                            src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
                            alt="Plato gourmet en 3D interactivo"
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                          />
                          {/* Radial lighting vignette */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                          <div className="absolute bottom-2 inset-x-0 text-center">
                            <span className="text-[10px] font-extrabold text-amber-300 bg-black/75 px-3 py-1 rounded-full border border-amber-500/40 backdrop-blur-md">
                              ✦ Vista 360° en Mesa
                            </span>
                          </div>
                        </div>

                        {/* Interactive Exploded Ingredient Layers */}
                        {isExploded && (
                          <>
                            {/* Layer 1: Trufa */}
                            <div className="absolute -top-3 -right-4 px-2.5 py-1 rounded-xl bg-slate-900/95 border border-amber-400/60 shadow-xl text-[10px] text-amber-300 animate-in zoom-in-75 font-bold flex items-center gap-1 backdrop-blur-md">
                              <span>🍄 Trufa Negra Silvestre</span>
                            </div>
                            {/* Layer 2: Reducción PX */}
                            <div className="absolute top-1/2 -left-8 px-2.5 py-1 rounded-xl bg-slate-900/95 border border-rose-400/60 shadow-xl text-[10px] text-rose-300 animate-in zoom-in-75 font-bold flex items-center gap-1 backdrop-blur-md">
                              <span>🍷 Reducción P.X. 12 Años</span>
                            </div>
                            {/* Layer 3: Ibérico 100% */}
                            <div className="absolute -bottom-3 -right-2 px-2.5 py-1 rounded-xl bg-slate-900/95 border border-emerald-400/60 shadow-xl text-[10px] text-emerald-300 animate-in zoom-in-75 font-bold flex items-center gap-1 backdrop-blur-md">
                              <span>🥩 Solomillo Ibérico Bellota</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Bottom Info Bar of the 3D Dish */}
                      <div className="relative z-10 mt-3 flex items-center justify-between w-full px-2 text-xs">
                        <div className="text-left">
                          <div className="font-extrabold text-white flex items-center gap-1 text-xs sm:text-sm">
                            <span>Solomillo Ibérico Selección</span>
                            <span className="text-amber-400 text-xs">★★★★★</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Modelo 3D optimizado para carga instantánea móvil
                          </div>
                        </div>

                        <button
                          onClick={() => setIsExploded(!isExploded)}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{isExploded ? 'Recomponer' : 'Ver Capas'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ==================== 2. CLÍNICAS SHOWCASE ==================== */}
                  {activeTab === 'clinic' && (
                    <div className="relative flex flex-col items-center justify-center min-h-[220px] sm:min-h-[260px]">
                      {/* Laser Medical Scanner Pulse Grid */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0284c720_0%,transparent_70%)] animate-pulse pointer-events-none" />

                      {/* 3D Medical Tooth / Dental Scan Hologram */}
                      <div
                        style={{
                          transform: `scale(${isExploded ? 1.08 : 1}) rotateY(${modelAngle * 0.2}deg)`,
                          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        }}
                        className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-sky-500/50 p-2 bg-gradient-to-tr from-blue-900/40 via-sky-800/20 to-teal-500/20 shadow-[0_15px_45px_rgba(2,132,199,0.35)]"
                      >
                        <div className="relative w-full h-full rounded-xl overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"
                            alt="Escáner 3D clínico odontológico"
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700 filter brightness-95 contrast-110"
                          />
                          {/* Cyan scanning laser line */}
                          <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_12px_#38bdf8] animate-[bounce_3s_ease-in-out_infinite]" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-2.5 text-left">
                            <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] font-bold">
                              <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                              <span>ESCÁNER DENTAL 3D · 99.8% EXACTITUD</span>
                            </div>
                            <span className="text-[10px] text-slate-300">
                              Simulación antes y después para el paciente
                            </span>
                          </div>
                        </div>

                        {/* Interactive Medical Badges */}
                        {isExploded && (
                          <>
                            <div className="absolute -top-2 -right-4 px-2 py-0.5 rounded-lg bg-slate-950/90 border border-emerald-400 text-emerald-300 text-[9px] font-bold shadow-xl animate-in fade-in">
                              ✓ Cita Hoy 18:30h
                            </div>
                            <div className="absolute -bottom-2 -left-4 px-2 py-0.5 rounded-lg bg-slate-950/90 border border-sky-400 text-sky-300 text-[9px] font-bold shadow-xl animate-in fade-in">
                              🤖 Confirmada WhatsApp
                            </div>
                          </>
                        )}
                      </div>

                      {/* Bottom Info Bar of Clinic */}
                      <div className="relative z-10 mt-3 flex items-center justify-between w-full px-2 text-xs">
                        <div className="text-left">
                          <div className="font-extrabold text-white flex items-center gap-1 text-xs sm:text-sm">
                            <span>Clínica Dental & Estética Avanzada</span>
                            <span className="text-emerald-400 text-xs">● Agenda IA</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Envío automático de recordatorios · Cero huecos libres
                          </div>
                        </div>

                        <button
                          onClick={() => setIsExploded(!isExploded)}
                          className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <HeartPulse className="w-3 h-3" />
                          <span>{isExploded ? 'Modo Simple' : 'Ver Diagnóstico'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ==================== 3. RETAIL / COMERCIO SHOWCASE ==================== */}
                  {activeTab === 'retail' && (
                    <div className="relative flex flex-col items-center justify-center min-h-[220px] sm:min-h-[260px]">
                      {/* Holographic Concentric Rings */}
                      <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-emerald-500/30 animate-[spin_25s_linear_infinite] pointer-events-none" />

                      {/* 3D Smart Product Configurator */}
                      <div
                        style={{
                          transform: `scale(${isExploded ? 1.08 : 1}) rotateY(${modelAngle * 0.15}deg)`,
                          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        }}
                        className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-emerald-500/50 p-2 bg-gradient-to-tr from-emerald-950/40 via-teal-900/20 to-cyan-500/20 shadow-[0_15px_45px_rgba(16,185,129,0.35)]"
                      >
                        <div className="relative w-full h-full rounded-xl overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
                            alt="Producto retail en 3D interactivo"
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-2.5 text-left">
                            <span className="text-[10px] font-extrabold text-emerald-400">
                              VISUALIZADOR 3D INTERACTIVO
                            </span>
                            <span className="text-[9px] text-slate-300">
                              Configura colores, materiales y compra por WhatsApp
                            </span>
                          </div>
                        </div>

                        {/* Interactive Retail Hotspots */}
                        {isExploded && (
                          <>
                            <div className="absolute -top-3 -right-4 px-2 py-0.5 rounded-lg bg-slate-950/90 border border-amber-400 text-amber-300 text-[9px] font-bold shadow-xl">
                              ⭐ 4.9★ (680+ reseñas)
                            </div>
                            <div className="absolute -bottom-3 -left-4 px-2 py-0.5 rounded-lg bg-slate-950/90 border border-emerald-400 text-emerald-300 text-[9px] font-bold shadow-xl">
                              🔥 Solo 2 en stock
                            </div>
                          </>
                        )}
                      </div>

                      {/* Color Selector Pills */}
                      <div className="relative z-10 mt-3 flex items-center justify-between w-full px-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">Color 3D:</span>
                          <button
                            onClick={() => setSelectedColor('emerald')}
                            className={`w-4 h-4 rounded-full bg-emerald-500 border-2 ${
                              selectedColor === 'emerald' ? 'border-white scale-125' : 'border-transparent'
                            }`}
                          />
                          <button
                            onClick={() => setSelectedColor('blue')}
                            className={`w-4 h-4 rounded-full bg-blue-600 border-2 ${
                              selectedColor === 'blue' ? 'border-white scale-125' : 'border-transparent'
                            }`}
                          />
                          <button
                            onClick={() => setSelectedColor('amber')}
                            className={`w-4 h-4 rounded-full bg-amber-500 border-2 ${
                              selectedColor === 'amber' ? 'border-white scale-125' : 'border-transparent'
                            }`}
                          />
                          <button
                            onClick={() => setSelectedColor('cyan')}
                            className={`w-4 h-4 rounded-full bg-cyan-400 border-2 ${
                              selectedColor === 'cyan' ? 'border-white scale-125' : 'border-transparent'
                            }`}
                          />
                        </div>

                        <button
                          onClick={() => setIsExploded(!isExploded)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Boxes className="w-3 h-3" />
                          <span>{isExploded ? 'Normal' : 'Despiece 3D'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ==================== 4. MODO 3D TOTAL / HOLOGRÁFICO ==================== */}
                  {activeTab === 'mode3d' && (
                    <div className="relative flex flex-col items-center justify-center min-h-[220px] sm:min-h-[260px]">
                      {/* Deep Cybernetic Grid Matrix */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0284c730_0%,transparent_75%)] animate-pulse pointer-events-none" />

                      {/* 3D Holographic Platform Ecosystem */}
                      <div
                        style={{
                          transform: `scale(${isExploded ? 1.08 : 1}) rotateY(${modelAngle * 0.25}deg)`,
                          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        }}
                        className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-cyan-500/50 p-2 bg-gradient-to-tr from-blue-950/60 via-indigo-900/30 to-emerald-500/30 shadow-[0_15px_45px_rgba(2,132,199,0.45)]"
                      >
                        <div className="relative w-full h-full rounded-xl overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
                            alt="Ecosistema 3D de Asexia"
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700 filter brightness-95"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-2.5 text-left">
                            <span className="text-[10px] font-extrabold text-cyan-300">
                              ECOSISTEMA DIGITAL INTEGRADO
                            </span>
                            <span className="text-[9px] text-slate-300">
                              Web PWA + IA WhatsApp + Pasarelas + CRM
                            </span>
                          </div>
                        </div>

                        {/* Floating Isometric Micro Nodes */}
                        {isExploded && (
                          <>
                            <div className="absolute -top-2 -right-4 px-2 py-0.5 rounded-lg bg-slate-950/95 border border-cyan-400 text-cyan-300 text-[9px] font-bold shadow-xl animate-in zoom-in-50">
                              ⚡ 100/100 Google Speed
                            </div>
                            <div className="absolute -bottom-2 -left-4 px-2 py-0.5 rounded-lg bg-slate-950/95 border border-emerald-400 text-emerald-300 text-[9px] font-bold shadow-xl animate-in zoom-in-50">
                              🔒 100% Subvencionable
                            </div>
                          </>
                        )}
                      </div>

                      {/* Bottom Info Bar of 3D Mode */}
                      <div className="relative z-10 mt-3 flex items-center justify-between w-full px-2 text-xs">
                        <div className="text-left">
                          <div className="font-extrabold text-white flex items-center gap-1 text-xs sm:text-sm">
                            <span>Plataforma Cloud & PWA Nativa</span>
                            <span className="text-cyan-400 text-xs">● 0 Servidores Caídos</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Alojamiento ultra rápido, SSL automático y soporte 24/7
                          </div>
                        </div>

                        <button
                          onClick={() => setIsExploded(!isExploded)}
                          className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>{isExploded ? 'Compacto' : 'Desplegar Nodos'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Screen Bottom Tech Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80 text-[10px] z-10">
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                <Globe className="w-3 h-3 text-sky-400" /> Web ultra rápida
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-400" /> Reservas directas
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-emerald-400" /> WhatsApp IA
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Reseñas 5★ Google
              </span>
            </div>
          </div>

          {/* Laptop Hardware Base Plate */}
          <div className="w-full h-3.5 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-2xl border-t border-slate-600 flex justify-center items-center">
            <div className="w-20 h-1 bg-slate-500 rounded-full" />
          </div>
        </div>

        {/* FLOATING 3D SMARTPHONE PWA - DYNAMICALLY SYNCS WITH THE SELECTED SECTOR */}
        <div
          style={{
            transform: 'translateZ(85px) translateX(35px) translateY(25px)',
          }}
          className={`absolute -bottom-6 -right-2 sm:-right-8 w-44 sm:w-56 rounded-3xl p-2.5 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.9)] border-2 transform-style-3d backdrop-blur-xl transition-all duration-500 ${
            isDark
              ? 'bg-[#001E3D] border-[#0284C7]/40 text-white'
              : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          {/* Neon Halo */}
          <div
            className={`absolute inset-0 rounded-3xl blur-lg -z-10 transition-colors duration-500 ${
              activeTab === 'restaurant'
                ? 'bg-amber-500/25'
                : activeTab === 'clinic'
                ? 'bg-sky-500/25'
                : activeTab === 'retail'
                ? 'bg-emerald-500/25'
                : 'bg-indigo-500/25'
            }`}
          />

          {/* Phone Display */}
          <div className="overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 text-[11px] p-2.5 space-y-2">
            {/* Phone Top Notch */}
            <div className="flex items-center justify-between text-[9px] text-slate-400 px-1">
              <span>9:41</span>
              <div className="w-10 h-2 bg-slate-800 rounded-full mx-auto" />
              <span>5G · 100%</span>
            </div>

            {/* Mobile Header with Emblem */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <div className="flex items-center gap-1">
                <AsexiaLogo size={20} showText={false} />
                <span className="font-extrabold text-white text-xs">Asexia</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                PWA Instalada
              </span>
            </div>

            {/* Mobile Card Photo dynamically synced */}
            <div className="rounded-xl bg-slate-900 p-2 border border-slate-800 space-y-1.5">
              <div className="h-16 rounded-lg overflow-hidden relative">
                {activeTab === 'restaurant' && (
                  <img
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80"
                    alt="Restaurante acogedor"
                    className="w-full h-full object-cover"
                  />
                )}
                {activeTab === 'clinic' && (
                  <img
                    src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80"
                    alt="Cita clínica dental"
                    className="w-full h-full object-cover"
                  />
                )}
                {activeTab === 'retail' && (
                  <img
                    src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=400&q=80"
                    alt="Comercio local boutique"
                    className="w-full h-full object-cover"
                  />
                )}
                {activeTab === 'mode3d' && (
                  <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80"
                    alt="Dashboard y analíticas"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-1 right-1 text-[8px] bg-slate-950/80 px-1.5 py-0.5 rounded text-emerald-400 font-bold">
                  {activeTab === 'restaurant' && 'Mesa 4 · Confirmada'}
                  {activeTab === 'clinic' && 'Dr. Valdés · Hoy 18h'}
                  {activeTab === 'retail' && 'Pedido #4812 · Listo'}
                  {activeTab === 'mode3d' && 'PWA Activa 100/100'}
                </div>
              </div>

              <div className="font-bold text-white text-[11px]">
                {activeTab === 'restaurant' && 'Sabor que conecta'}
                {activeTab === 'clinic' && 'Salud sin esperas'}
                {activeTab === 'retail' && 'Tu tienda en el bolsillo'}
                {activeTab === 'mode3d' && 'Tu negocio en la nube'}
              </div>

              <p className="text-[9px] text-slate-400 leading-tight">
                {activeTab === 'restaurant' && 'Reserva directa en 2 clics sin llamadas telefónicas.'}
                {activeTab === 'clinic' && 'Confirmación inmediata y recordatorio por WhatsApp.'}
                {activeTab === 'retail' && 'Pago rápido y recogida en tienda o envío express.'}
                {activeTab === 'mode3d' && 'Gestión unificada de clientes, reservas y cobros.'}
              </p>

              <button
                onClick={() => onOpenBooking(`Móvil ${activeTab}`)}
                className="w-full py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold text-[10px] hover:brightness-110 transition shadow-sm cursor-pointer"
              >
                {activeTab === 'restaurant' && 'Reservar mesa ahora'}
                {activeTab === 'clinic' && 'Confirmar mi cita'}
                {activeTab === 'retail' && 'Pedir por WhatsApp'}
                {activeTab === 'mode3d' && 'Ver mi panel digital'}
              </button>
            </div>

            {/* Live WhatsApp Alert Notification */}
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center gap-1.5 text-[9px] text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">Notificación WhatsApp en tiempo real</span>
            </div>
          </div>
        </div>

        {/* Floating 3D Data Chips on the Left Side */}
        <div
          style={{ transform: 'translateZ(55px) translateX(-35px) translateY(85px)' }}
          className="absolute left-0 bottom-4 hidden lg:flex flex-col gap-2 z-20"
        >
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-sky-500/40 text-xs text-sky-300 backdrop-blur-md shadow-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>
              {activeTab === 'restaurant' && 'Reservas online automáticas'}
              {activeTab === 'clinic' && 'Triaje & Agenda IA médica'}
              {activeTab === 'retail' && 'Catálogo 3D con compra rápida'}
              {activeTab === 'mode3d' && 'Ecosistema PWA 100% integrado'}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-xs text-emerald-300 backdrop-blur-md shadow-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Agente IA 24/7 en WhatsApp oficial</span>
          </div>
        </div>
      </div>
    </div>
  );
};
