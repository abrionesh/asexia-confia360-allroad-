import React, { useState, useRef } from 'react';
import { Globe, Calendar, MessageSquare, Star, Utensils, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface Interactive3DMockupProps {
  onOpenBooking: () => void;
}

export const Interactive3DMockup: React.FC<Interactive3DMockupProps> = ({ onOpenBooking }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(-4);
  const [rotateY, setRotateY] = useState(8);
  const [activeTab, setActiveTab] = useState<'restaurant' | 'clinic' | 'services'>('restaurant');
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Smooth 3D tilt
    setRotateX(-(y / (rect.height / 2)) * 14);
    setRotateY((x / (rect.width / 2)) * 16);
    setHasInteracted(true);
  };

  const handleMouseLeave = () => {
    setRotateX(-4);
    setRotateY(8);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-2xl mx-auto perspective-1000 py-6 select-none"
    >
      {/* Dynamic 3D Scene Wrapper */}
      <div
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`,
          transition: hasInteracted ? 'transform 0.1s ease-out' : 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="relative transform-style-3d will-change-transform"
      >
        {/* Ambient Backlight Glow */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/30 via-indigo-600/20 to-purple-600/30 rounded-3xl blur-2xl -z-10 opacity-70" />

        {/* Demo Selector Tabs */}
        <div className="flex items-center justify-between mb-4 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 text-xs shadow-xl">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('restaurant')}
              className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'restaurant'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Restauración 3D</span>
            </button>
            <button
              onClick={() => setActiveTab('clinic')}
              className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'clinic'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Clínicas & Citas</span>
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'services'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Comercio & Pymes</span>
            </button>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono text-blue-400 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 animate-pulse">
            Efecto 3D Interactivo
          </span>
        </div>

        {/* Laptop Frame */}
        <div className="relative rounded-2xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 p-2 sm:p-3 shadow-2xl border border-slate-700/80">
          {/* Laptop Top Bezel with Camera */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800/80 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950/80 px-3 py-0.5 rounded-full border border-slate-800">
              <Globe className="w-3 h-3 text-blue-400" />
              <span>https://asexia.es/experiencia-3d</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          </div>

          {/* Laptop Screen Content */}
          <div className="relative overflow-hidden rounded-xl bg-slate-950 aspect-[16/10] border border-slate-800/60 p-4 sm:p-6 flex flex-col justify-between">
            {/* Background Texture & Ambient Lights */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950/90 to-slate-950 -z-10" />

            {/* Screen Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1">
                  Asexia <span className="text-blue-500">.</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {activeTab === 'restaurant' ? 'Demo Gastro 3D' : activeTab === 'clinic' ? 'Demo Citas IA' : 'Demo Ecommerce & CRM'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold flex items-center gap-1 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Online
                </span>
              </div>
            </div>

            {/* Hero Inside Laptop */}
            <div className="my-auto py-2 grid sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-2 text-left">
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded-md">
                  Experiencias digitales que destacan
                </div>
                <h4 className="text-lg sm:text-2xl font-black text-white leading-tight">
                  {activeTab === 'restaurant' && 'TU RESTAURANTE EN OTRA DIMENSIÓN'}
                  {activeTab === 'clinic' && 'TU CLÍNICA CON CITAS AUTOMATIZADAS'}
                  {activeTab === 'services' && 'TU NEGOCIO LOCAL EN PILOTO AUTOMÁTICO'}
                </h4>
                <p className="text-xs text-slate-300">
                  {activeTab === 'restaurant' && 'Carta digital interactiva · Reservas automáticas · Más clientes'}
                  {activeTab === 'clinic' && 'Agente IA para WhatsApp · Confirmación de citas · Recordatorios'}
                  {activeTab === 'services' && 'CRM integrado · Reseñas 5★ automáticas · Facturación'}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={onOpenBooking}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-blue-500/30 transition cursor-pointer"
                  >
                    <span>Ver demo en vivo</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <span className="text-[11px] text-slate-400">100% móvil</span>
                </div>
              </div>

              {/* Visual Showcase Item inside Laptop */}
              <div className="relative flex items-center justify-center p-3 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800">
                <div className="relative group cursor-pointer">
                  {activeTab === 'restaurant' && (
                    <div className="text-center space-y-2">
                      <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/30 to-rose-500/20 p-2 border border-amber-500/30 shadow-2xl relative flex items-center justify-center animate-float-slow">
                        <div className="text-4xl sm:text-5xl">🥘</div>
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                          Plato 3D
                        </div>
                      </div>
                      <div className="text-xs font-bold text-white">Paella Valenciana Deluxe</div>
                      <div className="text-[10px] text-slate-400">Modelo 3D interactivo en carta digital</div>
                    </div>
                  )}

                  {activeTab === 'clinic' && (
                    <div className="text-center space-y-2 p-2">
                      <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/30 to-indigo-500/20 p-3 border border-cyan-500/30 shadow-2xl relative flex flex-col items-center justify-center animate-float-slow text-left">
                        <div className="text-3xl mb-1">🤖</div>
                        <div className="text-[10px] font-bold text-white">Asistente 24/7</div>
                        <div className="text-[9px] text-cyan-300">"Cita confirmada para el viernes 11:30h"</div>
                      </div>
                      <div className="text-xs font-bold text-white">Cero llamadas perdidas</div>
                      <div className="text-[10px] text-slate-400">WhatsApp sincronizado con agenda</div>
                    </div>
                  )}

                  {activeTab === 'services' && (
                    <div className="text-center space-y-2 p-2">
                      <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-2xl bg-gradient-to-tr from-purple-500/20 via-pink-500/30 to-indigo-500/20 p-3 border border-purple-500/30 shadow-2xl relative flex flex-col items-center justify-center animate-float-slow">
                        <div className="text-3xl mb-1">📈</div>
                        <div className="text-xs font-extrabold text-emerald-400">+340% Reseñas</div>
                        <div className="text-[9px] text-slate-300">4.9 ★★★★★ en Google</div>
                      </div>
                      <div className="text-xs font-bold text-white">Reputación y SEO Local</div>
                      <div className="text-[10px] text-slate-400">Automatizaciones para fidelizar</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Feature Pills Bar inside Laptop */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80 text-[10px]">
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                <Globe className="w-3 h-3 text-blue-400" /> Web rápida
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-purple-400" /> Reservas
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-emerald-400" /> WhatsApp
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" /> Reseñas 5★
              </span>
            </div>
          </div>

          {/* Laptop Base Plate */}
          <div className="w-full h-3 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-xl border-t border-slate-600 flex justify-center">
            <div className="w-16 h-1 bg-slate-600 rounded-full" />
          </div>
        </div>

        {/* Floating Mobile Phone Mockup Overlay on Right (Echoing uploaded image!) */}
        <div
          style={{
            transform: 'translateZ(50px) translateX(25px) translateY(20px)',
          }}
          className="absolute -bottom-6 -right-2 sm:-right-8 w-44 sm:w-56 rounded-3xl bg-slate-900 p-2 sm:p-2.5 shadow-2xl border-2 border-slate-700/80 transform-style-3d backdrop-blur-xl"
        >
          {/* Dynamic Glow */}
          <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-md -z-10" />

          {/* Phone Screen */}
          <div className="overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 text-[11px] p-2.5 space-y-2">
            {/* Phone Status Bar */}
            <div className="flex items-center justify-between text-[9px] text-slate-400 px-1">
              <span>9:41</span>
              <div className="w-10 h-2 bg-slate-800 rounded-full mx-auto" />
              <span>5G · 100%</span>
            </div>

            {/* App Header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-extrabold text-blue-400 text-xs">Asexia</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px]">PWA Móvil</span>
            </div>

            {/* Mobile Card */}
            <div className="rounded-xl bg-slate-900 p-2 border border-slate-800 space-y-1.5">
              <div className="h-16 rounded-lg bg-gradient-to-tr from-amber-600/30 to-rose-600/30 flex items-center justify-center text-2xl relative overflow-hidden">
                🍣
                <div className="absolute bottom-1 right-1 text-[8px] bg-slate-950/80 px-1.5 py-0.5 rounded text-amber-400">
                  Carta Digital
                </div>
              </div>
              <div className="font-bold text-white text-[11px]">Sabor que conecta</div>
              <p className="text-[9px] text-slate-400 leading-tight">
                Mesa reservada en 2 clics sin esperas telefónicas.
              </p>
              <button
                onClick={onOpenBooking}
                className="w-full py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-[10px] hover:brightness-110 transition shadow-sm cursor-pointer"
              >
                Reservar mesa ahora
              </button>
            </div>

            {/* Live WhatsApp notification toast */}
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center gap-1.5 text-[9px] text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">Confirmación enviada por WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Floating Tag Card Left (Echoing "Más clientes. Más tiempo. Más vida.") */}
        <div
          style={{ transform: 'translateZ(40px) translateX(-15px) translateY(-15px)' }}
          className="absolute -top-3 -left-3 sm:-left-6 hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl text-xs"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            ✦
          </div>
          <div>
            <div className="font-extrabold text-white text-xs">Más clientes. Más tiempo.</div>
            <div className="text-[10px] text-blue-400 font-medium font-handwriting text-sm">Más vida para ti.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
