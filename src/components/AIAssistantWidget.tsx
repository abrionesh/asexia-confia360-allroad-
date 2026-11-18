import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageCircle, Calendar, Phone, Check } from 'lucide-react';
import { AsexiaLogo } from './AsexiaLogo';
import { useTheme } from '../context/ThemeContext';

interface AIAssistantWidgetProps {
  onOpenBooking: () => void;
  onOpenComparator: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  onOpenBooking,
  onOpenComparator,
}) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: '¡Hola! 👋 Soy el Asistente Virtual de **Asexia**. Digitalizamos y automatizamos tu PYME con Inteligencia Artificial para que consigas más clientes y ahorres tiempo.\n\n¿En qué sector está tu negocio o qué duda te gustaría resolver?',
      time: 'Ahora',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    '¿Cómo funciona el diagnóstico gratis de 15 min?',
    '¿Qué puede hacer la IA por mi negocio?',
    '¿Cómo comparo un presupuesto que ya tengo?',
    '¿Tramitáis las ayudas del Kit Digital?',
    '¿Cuáles son vuestros teléfonos y contacto directo?',
  ];

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: messages.slice(-5),
        }),
      });

      const data = await res.json();
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Estamos listos para orientarte. ¿Quieres que agendemos un diagnóstico gratuito de 15 minutos?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Puedes contactar directamente con nuestro equipo al teléfono o WhatsApp **609 735 753** o agendar tu diagnóstico en nuestra web.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40">
      {/* Floating Toggle Button with Asexia Emblem */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-700 via-sky-600 to-emerald-500 p-2 sm:px-4 sm:py-2.5 text-white shadow-2xl shadow-emerald-500/30 hover:scale-105 transition active:scale-95 cursor-pointer border border-white/20"
          aria-label="Abrir asistente de IA"
        >
          <div className="relative">
            <AsexiaLogo size={34} showText={false} />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>
          <div className="hidden sm:block text-left pr-1">
            <div className="text-xs font-bold leading-tight flex items-center gap-1">
              <span>Asistente Asexia IA</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </div>
            <div className="text-[10px] text-emerald-100 font-medium">Resuelve tus dudas al instante</div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`w-[calc(100vw-2rem)] sm:w-[380px] h-[480px] sm:h-[520px] max-h-[82vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 backdrop-blur-xl ${
            isDark
              ? 'bg-[#001428] border-[#0284C7]/30 shadow-[0_10px_40px_rgba(0,10,30,0.8)]'
              : 'bg-white border-slate-300 shadow-[0_10px_40px_rgba(0,0,0,0.15)]'
          }`}
        >
          {/* Header with Asexia Emblem */}
          <div
            className={`p-3.5 border-b flex items-center justify-between ${
              isDark
                ? 'bg-gradient-to-r from-[#001E3D] via-[#002855] to-[#001E3D] border-[#0284C7]/20'
                : 'bg-gradient-to-r from-slate-50 via-sky-50/50 to-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AsexiaLogo size={36} showText={false} />
              <div>
                <div
                  className={`text-xs font-bold flex items-center gap-1.5 ${
                    isDark ? 'text-white' : 'text-[#001E3D]'
                  }`}
                >
                  <span>Asistente IA Asexia</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-500 text-[9px] font-semibold border border-emerald-500/30">
                    Online
                  </span>
                </div>
                <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Atención inmediata para tu PYME
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-lg transition cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-[#002855]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Bar under header */}
          <div
            className={`px-3 py-1.5 border-b flex items-center justify-between text-[10px] ${
              isDark
                ? 'bg-[#001833] border-[#0284C7]/20 text-slate-300'
                : 'bg-slate-100/80 border-slate-200 text-slate-600'
            }`}
          >
            <button
              onClick={() => {
                onOpenBooking();
                setIsOpen(false);
              }}
              className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 font-semibold cursor-pointer"
            >
              <Calendar className="w-3 h-3" />
              <span>Reservar 15m</span>
            </button>
            <a
              href="https://wa.me/34609735753"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 font-semibold"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp: 609 735 753</span>
            </a>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-br-none'
                      : isDark
                      ? 'bg-[#001E3D] border border-[#0284C7]/25 text-slate-100 rounded-bl-none'
                      : 'bg-slate-100 border border-slate-200 text-slate-900 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs">{msg.text}</div>
                  <div
                    className={`text-[9px] mt-1 text-right ${
                      msg.sender === 'user'
                        ? 'text-sky-200'
                        : isDark
                        ? 'text-slate-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className={`rounded-2xl rounded-bl-none p-3 flex items-center gap-1.5 text-xs ${
                    isDark
                      ? 'bg-[#001E3D] border border-[#0284C7]/25 text-slate-300'
                      : 'bg-slate-100 border border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px] text-emerald-500 font-medium">Asexia IA está escribiendo...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Suggested Quick Question Chips */}
          <div
            className={`p-2 border-t overflow-x-auto flex gap-1.5 no-scrollbar ${
              isDark
                ? 'border-[#0284C7]/20 bg-[#001833]'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className={`whitespace-nowrap flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full border transition cursor-pointer ${
                  isDark
                    ? 'bg-[#001E3D] hover:bg-[#002855] text-slate-200 border-[#0284C7]/30'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className={`p-2.5 border-t flex items-center gap-2 ${
              isDark
                ? 'bg-[#001E3D] border-[#0284C7]/20'
                : 'bg-white border-slate-200'
            }`}
          >
            <input
              type="text"
              placeholder="Pregúntale lo que quieras sobre Asexia..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 ${
                isDark
                  ? 'bg-[#001428] border border-[#0284C7]/30 text-white placeholder:text-slate-400'
                  : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:brightness-110 text-white flex items-center justify-center transition cursor-pointer disabled:opacity-40 flex-shrink-0 shadow-md shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
