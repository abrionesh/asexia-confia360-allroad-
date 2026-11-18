import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Zap,
  Star,
  MessageCircle,
  Cpu,
  Layers,
  Check,
  Smartphone,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

// 1. Dynamic Visual: Web Rápida vs Anticuada
export const WebSpeedDynamicVisual: React.FC = () => {
  return (
    <div className="relative w-full min-h-[9rem] sm:h-36 rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-950 p-3 border border-sky-500/30 overflow-hidden group">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/15 rounded-full blur-xl pointer-events-none" />

      {/* Browser Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        <span className="font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
          asexia.es/tu-negocio
        </span>
        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
          <Zap className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" /> 0.3s
        </span>
      </div>

      {/* Dynamic Animated Content */}
      <div className="mt-2.5 flex items-center justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="h-2 w-3/4 bg-slate-800 rounded-full animate-pulse" />
          <div className="h-2 w-1/2 bg-slate-800/60 rounded-full animate-pulse [animation-delay:0.2s]" />
          <div className="flex items-center gap-2 pt-1">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold flex items-center gap-1 border border-emerald-500/30">
              <Check className="w-2.5 h-2.5" /> 100/100 Google Speed
            </span>
          </div>
        </div>

        {/* Speedometer Gauge in Emerald/Sapphire */}
        <div className="relative w-16 h-16 rounded-full border-2 border-emerald-500/30 flex flex-col items-center justify-center bg-slate-950/80 shadow-lg shadow-emerald-500/10">
          <span className="text-emerald-400 font-black text-sm">99</span>
          <span className="text-[8px] text-slate-400 uppercase font-bold">Óptimo</span>
          <div className="absolute inset-0 rounded-full border-t-2 border-emerald-400 animate-spin [animation-duration:3s]" />
        </div>
      </div>
    </div>
  );
};

// 2. Dynamic Visual: Reseñas 5 Estrellas Google
export const ReviewsDynamicVisual: React.FC = () => {
  return (
    <div className="relative w-full min-h-[9rem] sm:h-36 rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-950 p-3.5 border border-emerald-500/30 overflow-hidden group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">⭐</span>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              Google Reviews
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-[10px] text-slate-400">Captación automática</div>
          </div>
        </div>
        <span className="text-emerald-400 font-mono font-bold text-xs bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
          +48 este mes
        </span>
      </div>

      {/* Floating 5-star animated bar */}
      <div className="mt-3 p-2 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse [animation-delay:0.1s]" />
            ))}
          </div>
          <span className="text-[10px] font-bold text-white">4.9 / 5.0</span>
        </div>
        <p className="text-[10px] text-slate-300 italic truncate">
          "Trato impecable, reservamos online en 1 minuto..."
        </p>
      </div>

      {/* Live notification pill */}
      <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Fidelización activa
        </span>
        <span>Sin reseñas negativas públicas</span>
      </div>
    </div>
  );
};

// 3. Dynamic Visual: Consultas & WhatsApp Bot
export const WhatsAppBotDynamicVisual: React.FC = () => {
  return (
    <div className="relative w-full min-h-[9rem] sm:h-36 rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-950 p-3 border border-emerald-500/30 overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Agente WhatsApp 24/7</span>
        </div>
        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px]">
          Respuesta &lt; 2s
        </span>
      </div>

      {/* Simulated Live Chat Bubbles */}
      <div className="space-y-1.5 my-1 text-[10px]">
        <div className="bg-slate-800/80 text-slate-200 p-1.5 px-2.5 rounded-xl rounded-bl-none max-w-[85%]">
          ¿Tenéis mesa para 4 hoy a las 21:30?
        </div>
        <div className="bg-emerald-600 text-white p-1.5 px-2.5 rounded-xl rounded-br-none ml-auto max-w-[90%] shadow-md">
          ¡Hola! Sí, mesa reservada para 4 a las 21:30h ✅
        </div>
      </div>

      {/* Typing indicator */}
      <div className="flex items-center gap-1 text-[9px] text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span>Cero llamadas perdidas · Confirmación automática</span>
      </div>
    </div>
  );
};

// 4. Dynamic Visual: Tareas Repetitivas y Automatización
export const AutomationSyncVisual: React.FC = () => {
  return (
    <div className="relative w-full min-h-[9rem] sm:h-36 rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950/30 to-slate-950 p-3 border border-sky-500/30 overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-sky-400 font-bold flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Automatización Diaria
        </span>
        <span className="text-emerald-400 font-bold font-mono">-18h / semana</span>
      </div>

      {/* Visual node sync animation */}
      <div className="flex items-center justify-between px-2 my-auto">
        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
          <div className="text-xs">📄</div>
          <div className="text-[8px] text-slate-400 mt-0.5">Facturas</div>
        </div>

        <div className="flex-1 mx-2 relative h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 bg-gradient-to-r from-sky-500 to-emerald-400 w-1/2 rounded-full animate-[shimmer_2s_infinite]" />
        </div>

        <div className="p-2 rounded-xl bg-slate-950 border border-emerald-500/40 text-center shadow-lg shadow-emerald-500/10">
          <div className="text-xs">🤖</div>
          <div className="text-[8px] text-emerald-300 font-bold mt-0.5">Auto-Sync</div>
        </div>

        <div className="flex-1 mx-2 relative h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 bg-gradient-to-r from-emerald-400 to-sky-500 w-1/2 rounded-full animate-[shimmer_2s_infinite_0.5s]" />
        </div>

        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
          <div className="text-xs">🏦</div>
          <div className="text-[8px] text-slate-400 mt-0.5">Gestoría</div>
        </div>
      </div>

      <div className="text-[9px] text-center text-slate-400">
        Datos sincronizados al segundo sin intervención manual
      </div>
    </div>
  );
};

// 5. Dynamic Visual: Herramientas Conectadas
export const ConnectedToolsVisual: React.FC = () => {
  return (
    <div className="relative w-full min-h-[9rem] sm:h-36 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/30 to-slate-950 p-3 border border-blue-500/30 overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-blue-400 font-bold flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Ecosistema Conectado
        </span>
        <span className="text-cyan-400 font-mono text-[9px] bg-cyan-500/15 px-2 py-0.5 rounded-full">
          100% Integrado
        </span>
      </div>

      {/* Grid of connected tool badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 my-2 sm:my-auto text-center text-[9px]">
        <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
          <div className="text-sm mb-0.5">💬</div>
          WhatsApp
        </div>
        <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
          <div className="text-sm mb-0.5">📅</div>
          Calendario
        </div>
        <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
          <div className="text-sm mb-0.5">💳</div>
          TPV / Pagos
        </div>
        <div className="p-1.5 rounded-lg bg-slate-950/80 border border-emerald-500/30 text-emerald-300 font-bold">
          <div className="text-sm mb-0.5">⚡</div>
          CRM Central
        </div>
      </div>

      <div className="text-[9px] text-slate-400 flex items-center justify-between">
        <span>Cero duplicidades</span>
        <span className="text-emerald-400">Flujo continuo</span>
      </div>
    </div>
  );
};

// 6. Dynamic Visual: Inteligencia Artificial Aplicada
export const AIWaveformDynamicVisual: React.FC = () => {
  return (
    <div className="relative w-full min-h-[9rem] sm:h-36 rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-950 p-3 border border-purple-500/30 overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-purple-400 font-bold flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5" /> Asistente IA Cognitivo
        </span>
        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[9px]">
          Gemini 3.8
        </span>
      </div>

      {/* Animated Sound Wave Bars */}
      <div className="flex items-center justify-center gap-1.5 h-12 my-auto">
        <span className="w-1 bg-gradient-to-t from-blue-500 to-emerald-400 rounded-full animate-wave-1" />
        <span className="w-1 bg-gradient-to-t from-blue-500 to-emerald-400 rounded-full animate-wave-2" />
        <span className="w-1 bg-gradient-to-t from-blue-500 to-emerald-400 rounded-full animate-wave-3" />
        <span className="w-1 bg-gradient-to-t from-blue-500 to-emerald-400 rounded-full animate-wave-4" />
        <span className="w-1 bg-gradient-to-t from-blue-500 to-emerald-400 rounded-full animate-wave-5" />
        <span className="w-1 bg-gradient-to-t from-blue-500 to-emerald-400 rounded-full animate-wave-2" />
        <span className="w-1 bg-gradient-to-t from-blue-500 to-emerald-400 rounded-full animate-wave-4" />
        <span className="w-1 bg-gradient-to-t from-blue-500 to-emerald-400 rounded-full animate-wave-1" />
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400">
        <span>Voz & Chat entrenados con tu catálogo</span>
        <span className="text-emerald-400 font-bold">24h activo</span>
      </div>
    </div>
  );
};
