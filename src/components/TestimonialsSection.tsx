import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const TestimonialsSection: React.FC = () => {
  const { isDark } = useTheme();

  const testimonials = [
    {
      name: 'Antonio Gallardo',
      role: 'Propietario',
      company: 'Restaurante & Gastrobar La Fragua',
      city: 'Madrid',
      sector: 'Restauración',
      metric: '+340% Reservas Online',
      metricSub: '-18h semanales en atención telefónica',
      rating: 5,
      avatar: '👨‍🍳',
      quote:
        'Gracias a Asexia ahora tenemos más reservas, una presencia impecable en Google y ahorramos muchísimo tiempo en tareas que antes nos quitaban el día. La carta digital interactiva en 3D enamora a los comensales y el agente por WhatsApp gestiona las mesas sin fallos.',
    },
    {
      name: 'Dra. Carmen Montes',
      role: 'Directora Médica',
      company: 'Clínica Dental Montes',
      city: 'Valencia',
      sector: 'Clínicas y salud',
      metric: '0 Llamadas Perdidas',
      metricSub: '+85 citas confirmadas por IA al mes',
      rating: 5,
      avatar: '👩‍⚕️',
      quote:
        'Antes perdíamos decenas de pacientes potenciales por llamadas que entraban mientras atendíamos en gabinete. Asexia nos implementó un agente inteligente de WhatsApp que agenda, confirma y resuelve dudas al segundo. Es la mejor inversión que hemos hecho.',
    },
    {
      name: 'Fernando Requena',
      role: 'Socio Director',
      company: 'Requena Abogados & Asesores',
      city: 'Barcelona',
      sector: 'Gestorías y despachos',
      metric: '100% Subvención Kit Digital',
      metricSub: 'Ahorro del 60% frente a otras propuestas',
      rating: 5,
      avatar: '👨‍💼',
      quote:
        'Utilizamos el Comparador de Propuestas de Asexia porque otra consultora nos presupuestó una barbaridad. Asexia no solo nos tramitó el Kit Digital sin coste para nosotros, sino que integró firma digital y CRM en tiempo récord. Total transparencia.',
    },
    {
      name: 'Natalia Ortiz',
      role: 'Fundadora',
      company: 'Studio Belleza & Spa Élite',
      city: 'Sevilla',
      sector: 'Belleza y bienestar',
      metric: '4.9 ★ en Google Reviews',
      metricSub: 'Automatización de recordatorios y fidelización',
      rating: 5,
      avatar: '💆‍♀️',
      quote:
        'El sistema de recordatorios automáticos redujo las cancelaciones de última hora a prácticamente cero. Mis clientas reservan desde el móvil cómodamente y las reseñas positivas se dispararon solas.',
    },
  ];

  return (
    <section
      id="testimonios"
      className={`scroll-mt-24 py-12 sm:py-20 relative overflow-hidden border-t transition-colors duration-300 ${
        isDark
          ? 'bg-[#001428] border-[#0284C7]/20 text-slate-100'
          : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}
    >
      {/* Background radial aura */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[140px] pointer-events-none -z-10 ${
          isDark ? 'bg-sky-600/10' : 'bg-emerald-500/10'
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-bold uppercase tracking-wider">
            <Quote className="w-3.5 h-3.5" />
            <span>Testimonios Reales</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-[#001E3D]'
            }`}
          >
            Negocios reales, resultados que se notan en caja
          </h2>
          <p
            className={`text-sm sm:text-base ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Descubre cómo empresas de hostelería, salud y servicios han transformado su día a día con Asexia.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className={`p-5 sm:p-7 rounded-3xl border transition duration-300 shadow-xl flex flex-col justify-between group ${
                isDark
                  ? 'bg-gradient-to-br from-[#001E3D] via-[#001833] to-[#001428] border-[#0284C7]/25 hover:border-emerald-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.3)]'
                  : 'bg-white border-slate-200/90 hover:border-emerald-400 shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
              }`}
            >
              <div className="space-y-4">
                {/* Metric banner */}
                <div
                  className={`flex flex-wrap items-center justify-between gap-2 pb-3 border-b ${
                    isDark ? 'border-[#0284C7]/20' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{t.avatar}</span>
                    <div>
                      <div
                        className={`text-sm font-extrabold flex items-center gap-1.5 ${
                          isDark ? 'text-white' : 'text-[#001E3D]'
                        }`}
                      >
                        {t.name}
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <div
                        className={`text-[11px] ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {t.role} · {t.company} ({t.city})
                      </div>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>

                {/* Key Metric highlight */}
                <div
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                    isDark
                      ? 'bg-[#002855]/70 border-[#0284C7]/30 text-emerald-400'
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-black">{t.metric}</div>
                    <div
                      className={`text-[10px] ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {t.metricSub}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDark
                        ? 'bg-[#001E3D] text-sky-300'
                        : 'bg-white text-emerald-700 shadow-sm'
                    }`}
                  >
                    {t.sector}
                  </span>
                </div>

                {/* Quote body */}
                <p
                  className={`text-xs sm:text-sm leading-relaxed italic ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  "{t.quote}"
                </p>
              </div>

              {/* Verified badge */}
              <div
                className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] ${
                  isDark
                    ? 'border-[#0284C7]/15 text-slate-400'
                    : 'border-slate-100 text-slate-500'
                }`}
              >
                <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Cliente verificado
                </span>
                <span>Caso auditado</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
