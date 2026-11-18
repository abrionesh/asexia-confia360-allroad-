import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, CheckCircle2, Building, User, Mail, Phone, ArrowRight, ExternalLink, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTheme } from '../context/ThemeContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: string;
  initialSector?: string;
  initialNotes?: string;
  onBookingCreated?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  defaultPlan = 'Diagnóstico Integral Gratuito',
  initialSector = 'Restauración',
  initialNotes = '',
  onBookingCreated,
}) => {
  const { isDark } = useTheme();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState('2026-03-20');
  const [selectedTime, setSelectedTime] = useState('11:00');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    companyName: '',
    sector: initialSector,
    serviceInterest: defaultPlan,
    notes: initialNotes,
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData((prev) => ({
        ...prev,
        sector: initialSector || prev.sector,
        serviceInterest: defaultPlan || prev.serviceInterest,
        notes: initialNotes !== undefined ? initialNotes : prev.notes,
      }));
    }
  }, [isOpen, defaultPlan, initialSector, initialNotes]);

  if (!isOpen) return null;

  const timeSlots = [
    '09:30', '10:15', '11:00', '12:00', '13:00',
    '16:00', '17:00', '18:15', '19:00'
  ];

  const availableDates = [
    { label: 'Hoy', value: '2026-03-20', weekday: 'Viernes 20 Mar' },
    { label: 'Próx', value: '2026-03-23', weekday: 'Lunes 23 Mar' },
    { label: '', value: '2026-03-24', weekday: 'Martes 24 Mar' },
    { label: '', value: '2026-03-25', weekday: 'Miércoles 25 Mar' },
    { label: '', value: '2026-03-26', weekday: 'Jueves 26 Mar' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: selectedDate,
          time: selectedTime,
        }),
      });

      if (res.ok) {
        setStep(3);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0284C7', '#10B981', '#84CC16', '#38BDF8'],
        });
        if (onBookingCreated) onBookingCreated();
      }
    } catch (err) {
      console.error(err);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const downloadIcsFile = () => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Asexia//Diagnostico PYME//ES',
      'BEGIN:VEVENT',
      `SUMMARY:Diagnóstico Estratégico Asexia - ${formData.companyName || formData.clientName}`,
      `DESCRIPTION:Sesión de orientación estratégica de 15-20 minutos para analizar oportunidades de digitalización e IA con el equipo de Asexia.\\nContacto: soyasexia@gmail.com / 609735753`,
      `DTSTART:${selectedDate.replace(/-/g, '')}T${selectedTime.replace(':', '')}00Z`,
      `DTEND:${selectedDate.replace(/-/g, '')}T${parseInt(selectedTime.split(':')[0]) + 1}${selectedTime.split(':')[1]}00Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `asexia-diagnostico-${selectedDate}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-xl rounded-3xl border p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
          isDark
            ? 'bg-[#001428] border-[#0284C7]/30 text-slate-100 shadow-[0_15px_50px_rgba(0,10,30,0.8)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-1.5 rounded-full transition cursor-pointer ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-[#002855]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
              Diagnóstico Gratuito 15-20 min
            </span>
            <h3 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
              {step === 3 ? '¡Cita Reservada con Éxito!' : 'Agenda tu sesión con Asexia'}
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {step === 3
                ? 'Nos pondremos en contacto contigo en la fecha indicada.'
                : 'Sin compromiso · Análisis claro de oportunidades para tu PYME'}
            </p>
          </div>
        </div>

        {/* STEP 1: Select Date & Time */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                1. Selecciona el día
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableDates.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedDate(item.value)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      selectedDate === item.value
                        ? 'border-blue-500 bg-blue-600 text-white shadow-md'
                        : isDark
                        ? 'border-[#0284C7]/20 bg-[#001E3D] text-slate-300 hover:border-[#0284C7]/40 hover:text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.weekday}</div>
                    <div className={`text-[10px] font-mono mt-0.5 ${selectedDate === item.value ? 'text-blue-100' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.value}
                    </div>
                    {item.label && (
                      <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        selectedDate === item.value ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {item.label}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                2. Selecciona la franja horaria
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2 px-3 rounded-xl border text-center text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedTime === slot
                        ? 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : isDark
                        ? 'border-[#0284C7]/20 bg-[#001E3D] text-slate-300 hover:border-[#0284C7]/40 hover:text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-3 h-3 opacity-60" />
                    <span>{slot}h</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Calendly Alternative Box */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                isDark
                  ? 'bg-[#001E3D] border-[#0284C7]/20 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="space-y-0.5">
                <div className="font-semibold">¿Prefieres ver el calendario completo?</div>
                <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Puedes reservar directamente en nuestro Calendly oficial
                </div>
              </div>
              <a
                href="https://calendly.com/mundoconfia/orientacion?month=2026-03&date=2026-03-20"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                  isDark
                    ? 'bg-[#002855] hover:bg-[#003875] text-slate-200 border-[#0284C7]/30'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
                }`}
              >
                <span>Abrir Calendly</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <span>Continuar con mis datos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Client Info Form */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                isDark
                  ? 'bg-[#002855]/60 border-[#0284C7]/30'
                  : 'bg-sky-50 border-sky-200'
              }`}
            >
              <div>
                <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Fecha seleccionada: </span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>{selectedDate} a las {selectedTime}h</span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-blue-500 hover:underline text-[11px] font-semibold"
              >
                Cambiar hora
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Tu Nombre *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 border ${
                      isDark
                        ? 'bg-[#001E3D] border-[#0284C7]/30 text-white placeholder:text-slate-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Teléfono / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 609 735 753"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 border ${
                      isDark
                        ? 'bg-[#001E3D] border-[#0284C7]/30 text-white placeholder:text-slate-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email Profesional *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="nombre@tuempresa.es"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 border ${
                      isDark
                        ? 'bg-[#001E3D] border-[#0284C7]/30 text-white placeholder:text-slate-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Nombre de tu Negocio / Empresa
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ej. Restaurante El Sol, Clínica..."
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 border ${
                      isDark
                        ? 'bg-[#001E3D] border-[#0284C7]/30 text-white placeholder:text-slate-400'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Sector de Actividad
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 border ${
                    isDark
                      ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-200'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Restauración">Restauración y Hostelería</option>
                  <option value="Belleza y bienestar">Belleza y bienestar</option>
                  <option value="Clínicas y salud">Clínicas y salud</option>
                  <option value="Comercio local">Comercio local</option>
                  <option value="Gestorías y despachos">Gestorías y despachos</option>
                  <option value="Inmobiliarias">Inmobiliarias</option>
                  <option value="Profesionales y consultorías">Profesionales y consultorías</option>
                  <option value="Otro sector">Otro sector</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Línea Comercial de Interés
                </label>
                <select
                  value={formData.serviceInterest}
                  onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 border ${
                    isDark
                      ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-200'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Diagnóstico gratuito">Diagnóstico gratuito (15–20 min)</option>
                  <option value="1. Presencia Digital">1. Presencia Digital (Web, Google Maps, Reseñas)</option>
                  <option value="2. Captación">2. Captación (WhatsApp, Reservas 24/7, CRM)</option>
                  <option value="3. Cumplimiento">3. Cumplimiento (Facturación electrónica, Kit Digital)</option>
                  <option value="4. Acelerador de Campañas">4. Acelerador de Campañas (Publicidad y Landing Pages)</option>
                  <option value="Comparar Propuesta">Comparar una propuesta que ya tengo</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                ¿Algún detalle o necesidad especial? (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Cuéntanos brevemente qué te gustaría mejorar o qué problemas tienes actualmente..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 border ${
                  isDark
                    ? 'bg-[#001E3D] border-[#0284C7]/30 text-white placeholder:text-slate-400'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`text-xs transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'}`}
              >
                ← Volver a horarios
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Confirmando...' : 'Confirmar Reserva de Diagnóstico →'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 3 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
                ¡Reserva Registrada con Éxito!
              </h4>
              <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Hemos bloqueado tu sesión de diagnóstico de 15 minutos para el{' '}
                <strong className="text-blue-500">{selectedDate} a las {selectedTime}h</strong>.
              </p>
            </div>

            {/* Reservation Summary Card */}
            <div
              className={`border rounded-2xl p-4 text-xs text-left space-y-2 max-w-md mx-auto ${
                isDark
                  ? 'bg-[#001E3D] border-[#0284C7]/30 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm'
              }`}
            >
              <div className={`flex justify-between border-b pb-1.5 ${isDark ? 'border-[#0284C7]/20' : 'border-slate-200'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Cliente:</span>
                <span className="font-semibold">{formData.clientName}</span>
              </div>
              <div className={`flex justify-between border-b pb-1.5 ${isDark ? 'border-[#0284C7]/20' : 'border-slate-200'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Empresa:</span>
                <span className="font-semibold">{formData.companyName || 'Particular'}</span>
              </div>
              <div className={`flex justify-between border-b pb-1.5 ${isDark ? 'border-[#0284C7]/20' : 'border-slate-200'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Contacto:</span>
                <span className="font-semibold">{formData.phone} · {formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Objetivo:</span>
                <span className="font-semibold text-emerald-500">{formData.serviceInterest}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={downloadIcsFile}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition cursor-pointer ${
                  isDark
                    ? 'bg-[#002855] hover:bg-[#003875] text-slate-200 border-[#0284C7]/30'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
                }`}
              >
                <Download className="w-4 h-4 text-blue-500" />
                <span>Añadir a mi Calendario (.ics)</span>
              </button>

              <a
                href={`https://wa.me/34609735753?text=${encodeURIComponent(`Hola Asexia, he reservado un diagnóstico para el ${selectedDate} a las ${selectedTime}h a nombre de ${formData.clientName} (${formData.companyName}).`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition"
              >
                <span>Confirmar por WhatsApp directo</span>
              </a>
            </div>

            <button
              onClick={onClose}
              className={`text-xs underline pt-2 cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
              }`}
            >
              Cerrar y seguir navegando por la web
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
