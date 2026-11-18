import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Scale, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTheme } from '../context/ThemeContext';

interface ProposalComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServices?: string;
  initialNotes?: string;
  onProposalSubmitted?: () => void;
}

export const ProposalComparatorModal: React.FC<ProposalComparatorModalProps> = ({
  isOpen,
  onClose,
  initialServices = '',
  initialNotes = '',
  onProposalSubmitted,
}) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    competitorQuote: '',
    servicesIncluded: initialServices,
    additionalNotes: initialNotes,
  });

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      if (initialServices || initialNotes) {
        setFormData((prev) => ({
          ...prev,
          servicesIncluded: initialServices || prev.servicesIncluded,
          additionalNotes: initialNotes || prev.additionalNotes,
        }));
      }
    }
  }, [isOpen, initialServices, initialNotes]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0284C7', '#10B981', '#84CC16'],
        });
        if (onProposalSubmitted) onProposalSubmitted();
      }
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-3xl border p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
          isDark
            ? 'bg-[#001428] border-[#0284C7]/30 text-slate-100 shadow-[0_15px_50px_rgba(0,10,30,0.8)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-1.5 rounded-full transition cursor-pointer ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-[#002855]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-sky-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  NOVEDAD · COMPARADOR ASEXIA
                </span>
                <h3 className={`text-xl font-black mt-1 ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
                  Compara tu propuesta antes de decidir
                </h3>
              </div>
            </div>

            <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Analizaremos de forma gratuita y sin compromiso la tecnología, servicios, costes y condiciones
              de la oferta que te han presentado para garantizarte la mejor relación calidad-precio.
            </p>

            {/* Benefit items */}
            <div
              className={`grid grid-cols-2 gap-2 mb-5 text-[11px] p-3 rounded-2xl border ${
                isDark
                  ? 'bg-[#001E3D] border-[#0284C7]/20 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Análisis sin compromiso</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Comparación clara</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Sin servicios innecesarios</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Propuesta a tu medida</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Tu Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Roberto Sánchez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 ${
                      isDark
                        ? 'bg-[#001E3D] border-[#0284C7]/30 text-white placeholder:text-slate-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 609 735 753"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 ${
                      isDark
                        ? 'bg-[#001E3D] border-[#0284C7]/30 text-white placeholder:text-slate-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email Profesional *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="roberto@miempresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 ${
                      isDark
                        ? 'bg-[#001E3D] border-[#0284C7]/30 text-white placeholder:text-slate-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Empresa / Negocio
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Sánchez & Asociados"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 ${
                      isDark
                        ? 'bg-[#001E3D] border-[#0284C7]/30 text-white placeholder:text-slate-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Importe aproximado de la propuesta recibida (€ o rango)
                </label>
                <input
                  type="text"
                  placeholder="Ej. 1.800€ + IVA o 150€/mes..."
                  value={formData.competitorQuote}
                  onChange={(e) => setFormData({ ...formData, competitorQuote: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 ${
                    isDark
                      ? 'bg-[#001E3D] border-[#0284C7]/30 text-white placeholder:text-slate-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  ¿Qué servicios te incluían?
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Diseño web WordPress, mantenimiento mensual, sin automatizaciones ni IA..."
                  value={formData.servicesIncluded}
                  onChange={(e) => setFormData({ ...formData, servicesIncluded: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 ${
                    isDark
                      ? 'bg-[#001E3D] border-[#0284C7]/30 text-white placeholder:text-slate-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Comentarios adicionales o dudas
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles de la empresa proveedora, plazos, condiciones..."
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 ${
                    isDark
                      ? 'bg-[#001E3D] border-[#0284C7]/30 text-white placeholder:text-slate-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Analizando...' : 'Enviar para contrastar oferta →'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
                ¡Propuesta Recibida para Contrastar!
              </h4>
              <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Uno de nuestros consultores senior revisará tu presupuesto y en un plazo máximo de 24 horas
                te remitiremos un informe comparativo totalmente transparente.
              </p>
            </div>

            <div
              className={`p-3 rounded-2xl border text-xs text-left max-w-sm mx-auto space-y-1 ${
                isDark
                  ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div><strong>Contacto:</strong> {formData.name} ({formData.phone})</div>
              <div><strong>Empresa:</strong> {formData.company || 'Particular'}</div>
              <div><strong>Presupuesto a comparar:</strong> {formData.competitorQuote || 'No indicado'}</div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-xs font-bold hover:brightness-110 shadow-lg cursor-pointer"
            >
              Entendido, volver a la página
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
