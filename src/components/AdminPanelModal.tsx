import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  Search,
  Download,
  Phone,
  MessageSquare,
  Building,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Calculator,
  Save,
  RotateCcw,
  Sliders,
  Star
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  RoiConfig,
  RoiSectorId,
  CompanySizeId,
  RoiCtaId,
  RoiSectorDefaults,
  RoiCompanySizeProfile,
  SECTOR_ORDER,
  COMPANY_SIZE_ORDER,
  CTA_ORDER,
  DEFAULT_ROI_CONFIG,
  createInitialInputsForSector,
  calculateRoiResults,
  cloneDefaultRoiConfig,
} from '../types/roi';

function ensureCompleteRoiConfig(cfg?: RoiConfig): RoiConfig {
  const base = cloneDefaultRoiConfig();
  if (!cfg) return base;
  return {
    ...base,
    ...cfg,
    defaultCompanySizeId: cfg.defaultCompanySizeId || base.defaultCompanySizeId,
    globalRates: { ...base.globalRates, ...(cfg.globalRates || {}) },
    companySizes: { ...base.companySizes, ...(cfg.companySizes || {}) },
    sectors: { ...base.sectors, ...(cfg.sectors || {}) },
    ctaSettings: cfg.ctaSettings || base.ctaSettings,
  };
}

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  refreshTrigger?: number;
  roiConfig?: RoiConfig;
  onRoiConfigUpdated?: (nextConfig: RoiConfig) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  refreshTrigger = 0,
  roiConfig,
  onRoiConfigUpdated,
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'bookings' | 'proposals' | 'analytics' | 'roi'>('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  // ROI Admin Editor State
  const [draftRoi, setDraftRoi] = useState<RoiConfig>(() =>
    ensureCompleteRoiConfig(roiConfig ? JSON.parse(JSON.stringify(roiConfig)) : undefined)
  );
  const [selectedRoiSector, setSelectedRoiSector] = useState<RoiSectorId>('restauracion');
  const [isSavingRoi, setIsSavingRoi] = useState(false);
  const [roiSaveFeedback, setRoiSaveFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (roiConfig && isOpen) {
      setDraftRoi(ensureCompleteRoiConfig(JSON.parse(JSON.stringify(roiConfig))));
    }
  }, [roiConfig, isOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resBookings, resProposals, resAnalytics, resRoi] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/proposals'),
        fetch('/api/analytics'),
        fetch('/api/roi-config'),
      ]);

      if (resBookings.ok) {
        const data = await resBookings.json();
        setBookings(Array.isArray(data) ? data : data.bookings || []);
      }
      if (resProposals.ok) {
        const data = await resProposals.json();
        setProposals(Array.isArray(data) ? data : data.proposals || []);
      }
      if (resAnalytics.ok) {
        const data = await resAnalytics.json();
        setAnalytics(data);
      }
      if (resRoi.ok) {
        const data = await resRoi.json();
        if (data?.config) {
          setDraftRoi(ensureCompleteRoiConfig(data.config));
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setRoiSaveFeedback(null);
    }
  }, [isOpen, refreshTrigger]);

  if (!isOpen) return null;

  const handleSaveRoiConfig = async () => {
    setIsSavingRoi(true);
    setRoiSaveFeedback(null);
    try {
      const res = await fetch('/api/roi-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: draftRoi }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.config) {
          setDraftRoi(data.config);
          onRoiConfigUpdated?.(data.config);
          setRoiSaveFeedback('Configuración ROI y acciones guardadas correctamente.');
        }
      } else {
        setRoiSaveFeedback('Error al guardar la configuración.');
      }
    } catch (err) {
      console.error(err);
      setRoiSaveFeedback('Error de conexión al guardar.');
    } finally {
      setIsSavingRoi(false);
    }
  };

  const handleResetRoiConfig = async () => {
    setIsSavingRoi(true);
    setRoiSaveFeedback(null);
    try {
      const res = await fetch('/api/roi-config/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data?.config) {
          setDraftRoi(data.config);
          onRoiConfigUpdated?.(data.config);
          setRoiSaveFeedback('Medias de Getafe, Madrid y 4 CTAs restauradas por defecto.');
        }
      }
    } catch (err) {
      console.error(err);
      setRoiSaveFeedback('No se pudieron restaurar los valores.');
    } finally {
      setIsSavingRoi(false);
    }
  };

  const updateSectorField = <K extends keyof RoiSectorDefaults>(
    sectorId: RoiSectorId,
    field: K,
    value: RoiSectorDefaults[K]
  ) => {
    setDraftRoi((prev) => ({
      ...prev,
      sectors: {
        ...prev.sectors,
        [sectorId]: {
          ...prev.sectors[sectorId],
          [field]: value,
        },
      },
    }));
  };

  const updateCompanySizeField = <K extends keyof RoiCompanySizeProfile>(
    sizeId: CompanySizeId,
    field: K,
    value: RoiCompanySizeProfile[K]
  ) => {
    setDraftRoi((prev) => ({
      ...prev,
      companySizes: {
        ...(prev.companySizes || DEFAULT_ROI_CONFIG.companySizes),
        [sizeId]: {
          ...(prev.companySizes?.[sizeId] || DEFAULT_ROI_CONFIG.companySizes[sizeId]),
          [field]: value,
        },
      },
    }));
  };

  const updateCtaField = (
    ctaId: RoiCtaId,
    patch: Partial<{ enabled: boolean; label: string; sublabel: string }>
  ) => {
    setDraftRoi((prev) => ({
      ...prev,
      ctaSettings: {
        ...prev.ctaSettings,
        items: {
          ...prev.ctaSettings.items,
          [ctaId]: {
            ...prev.ctaSettings.items[ctaId],
            ...patch,
          },
        },
      },
    }));
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone?.includes(searchQuery) ||
      b.sector?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportBookingsCSV = () => {
    const headers = ['ID', 'Cliente', 'Empresa', 'Sector', 'Teléfono', 'Email', 'Fecha', 'Hora', 'Estado', 'Servicio'];
    const rows = bookings.map((b) => [
      b.id,
      `"${b.clientName}"`,
      `"${b.companyName}"`,
      `"${b.sector}"`,
      `"${b.phone}"`,
      `"${b.email}"`,
      b.date,
      b.time,
      b.status,
      `"${b.serviceInterest}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reservas-asexia-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-5xl h-[90vh] rounded-3xl border p-5 sm:p-8 shadow-2xl flex flex-col overflow-hidden transition-colors duration-300 ${
          isDark
            ? 'bg-[#001428] border-[#0284C7]/30 text-slate-100 shadow-[0_20px_60px_rgba(0,10,30,0.85)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Top Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3 ${
            isDark ? 'border-[#0284C7]/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-sky-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
                  Panel de Administración Asexia
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 text-[10px] font-bold border border-blue-500/30">
                  Control & Métricas
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Gestión de reservas de diagnóstico, comparador de propuestas y analíticas en tiempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={fetchData}
              title="Actualizar datos"
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDark
                  ? 'bg-[#001E3D] border-[#0284C7]/30 hover:bg-[#002855] text-slate-200'
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDark
                  ? 'bg-[#001E3D] border-[#0284C7]/30 hover:bg-[#002855] text-slate-400 hover:text-white'
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-500 hover:text-black'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Pulse Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              isDark
                ? 'bg-[#001E3D] border-[#0284C7]/20 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 relative">
              <Activity className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div>
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Visitantes En Directo</div>
              <div className="text-lg font-black flex items-center gap-1.5">
                <span>{analytics?.stats?.activeVisitors || 14}</span>
                <span className="text-[10px] font-normal text-emerald-500 bg-emerald-500/10 px-1.5 rounded">
                  Tiempo real
                </span>
              </div>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              isDark
                ? 'bg-[#001E3D] border-[#0284C7]/20 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Reservas Registradas</div>
              <div className="text-lg font-black">{bookings.length}</div>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              isDark
                ? 'bg-[#001E3D] border-[#0284C7]/20 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Comparativas Recibidas</div>
              <div className="text-lg font-black">{proposals.length}</div>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              isDark
                ? 'bg-[#001E3D] border-[#0284C7]/20 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tasa de Conversión</div>
              <div className="text-lg font-black">{analytics?.stats?.conversionRate || '4.8%'}</div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div
          className={`flex flex-wrap items-center gap-2 border-b pb-2 mb-4 ${
            isDark ? 'border-[#0284C7]/20' : 'border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-[#001E3D]'
                : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Reservas ({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'proposals'
                ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-[#001E3D]'
                : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Comparativas ({proposals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-[#001E3D]'
                : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analíticas</span>
          </button>
          <button
            onClick={() => setActiveTab('roi')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'roi'
                ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-[#001E3D]'
                : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Calculadora ROI &amp; CTAs</span>
          </button>
        </div>

        {/* TAB 1: RESERVAS */}
        {activeTab === 'bookings' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, empresa o sector..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 ${
                    isDark
                      ? 'bg-[#001E3D] border-[#0284C7]/30 text-white placeholder:text-slate-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                    isDark
                      ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-200'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="Pendiente">Pendientes</option>
                  <option value="Confirmada">Confirmadas</option>
                  <option value="Completada">Completadas</option>
                  <option value="Cancelada">Canceladas</option>
                </select>

                <button
                  onClick={exportBookingsCSV}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition cursor-pointer ${
                    isDark
                      ? 'bg-[#002855] hover:bg-[#003875] text-slate-200 border-[#0284C7]/30'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-blue-500" />
                  <span>Descargar CSV</span>
                </button>
              </div>
            </div>

            {/* Bookings Table / List */}
            <div
              className={`flex-1 overflow-y-auto rounded-2xl border ${
                isDark ? 'border-[#0284C7]/20 bg-[#001E3D]/50' : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              {filteredBookings.length === 0 ? (
                <div className={`p-8 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  No se encontraron reservas con esos filtros.
                </div>
              ) : (
                <div className={`divide-y ${isDark ? 'divide-[#0284C7]/15' : 'divide-slate-200'}`}>
                  {filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      className={`p-3.5 sm:p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        isDark ? 'hover:bg-[#002855]/70' : 'hover:bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>{b.clientName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isDark ? 'bg-[#001428] text-slate-300 border-[#0284C7]/30' : 'bg-slate-200 text-slate-700 border-slate-300'
                          }`}>
                            {b.sector}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              b.status === 'Confirmada'
                                ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                : b.status === 'Pendiente'
                                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                                : b.status === 'Completada'
                                ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                                : 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                        <div className={`flex flex-wrap items-center gap-3 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span className={`flex items-center gap-1 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <Building className="w-3 h-3 opacity-60" />
                            {b.companyName}
                          </span>
                          <span className="text-blue-500 font-mono font-semibold">
                            📅 {b.date} a las {b.time}h
                          </span>
                          <span>Interés: {b.serviceInterest}</span>
                        </div>
                        {b.notes && (
                          <div className={`text-[11px] italic p-1.5 rounded-lg border max-w-xl ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/20 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
                          }`}>
                            "{b.notes}"
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg border text-[11px] focus:outline-none ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                          }`}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Confirmada">Confirmada</option>
                          <option value="Completada">Completada</option>
                          <option value="Cancelada">Cancelada</option>
                        </select>

                        <a
                          href={`https://wa.me/34${b.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hola ${b.clientName}, te escribimos desde Asexia respecto a tu solicitud de diagnóstico para ${b.companyName}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Enviar WhatsApp directo al cliente"
                          className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 border border-emerald-500/30 transition flex items-center gap-1 font-semibold"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="text-[10px]">WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${b.phone}`}
                          title="Llamar"
                          className={`p-1.5 rounded-lg border transition ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-black'
                          }`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PROPUESTAS A COMPARAR */}
        {activeTab === 'proposals' && (
          <div
            className={`flex-1 overflow-y-auto rounded-2xl border p-3 sm:p-4 space-y-3 ${
              isDark ? 'border-[#0284C7]/20 bg-[#001E3D]/50' : 'border-slate-200 bg-slate-50/50'
            }`}
          >
            {proposals.length === 0 ? (
              <div className={`p-8 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Aún no hay propuestas de la competencia enviadas para comparar.
              </div>
            ) : (
              proposals.map((p) => (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border space-y-2 text-xs ${
                    isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>{p.name}</span>
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-500 font-semibold text-[10px]">
                        {p.company} ({p.sector})
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 text-[10px] font-semibold">
                      {p.status}
                    </span>
                  </div>

                  <div>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Presupuesto actual que le ofrecieron: </span>
                    <strong className="text-amber-500">{p.currentCompetitorBudget}</strong>
                  </div>

                  <div className={`p-2.5 rounded-lg border text-[11px] ${
                    isDark ? 'bg-[#001428] border-[#0284C7]/20 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    {p.details}
                  </div>

                  <div className={`flex items-center justify-between pt-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>Contacto: {p.phone} · {p.email}</span>
                    <a
                      href={`https://wa.me/34${p.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Hola ${p.name}, hemos analizado tu propuesta para ${p.company} y tenemos una alternativa más rentable.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-medium flex items-center gap-1 shadow-sm"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Enviar Contraoferta por WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: ANALÍTICAS EN VIVO */}
        {activeTab === 'analytics' && analytics && (
          <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Traffic Sources */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#001E3D] border-[#0284C7]/20' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <h4 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span>Fuentes de Adquisición de Tráfico</span>
                </h4>
                <div className="space-y-2.5">
                  {analytics.stats?.sources?.map((s: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className={`flex justify-between text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <span>{s.channel}</span>
                        <span className="font-mono text-blue-500 font-bold">{s.percentage}%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#001428]' : 'bg-slate-200'}`}>
                        <div
                          style={{ width: `${s.percentage}%` }}
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Distribution */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#001E3D] border-[#0284C7]/20' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <h4 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>Dispositivos de Acceso (PWA Ready)</span>
                </h4>
                <div className="space-y-3 pt-2">
                  <div className={`flex items-center justify-between p-2 rounded-xl border ${
                    isDark ? 'bg-[#001428] border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>📱 Móviles (Android / iOS PWA)</span>
                    <span className="font-bold text-emerald-500 font-mono text-sm">
                      {analytics.stats?.deviceDistribution?.mobile}%
                    </span>
                  </div>
                  <div className={`flex items-center justify-between p-2 rounded-xl border ${
                    isDark ? 'bg-[#001428] border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>💻 Ordenadores de escritorio</span>
                    <span className="font-bold text-blue-500 font-mono text-sm">
                      {analytics.stats?.deviceDistribution?.desktop}%
                    </span>
                  </div>
                  <div className={`flex items-center justify-between p-2 rounded-xl border ${
                    isDark ? 'bg-[#001428] border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>📟 Tablets & iPads</span>
                    <span className="font-bold text-sky-500 font-mono text-sm">
                      {analytics.stats?.deviceDistribution?.tablet}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Sectors Visited */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#001E3D] border-[#0284C7]/20' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <h4 className={`font-bold text-sm flex items-center justify-between ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
                <span>Interés por Sectores Económicos</span>
                <span className={`text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Actualizado hoy</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {analytics.stats?.popularSectors?.map((sec: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-center space-y-1 ${
                      isDark ? 'bg-[#001428] border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className={`text-[11px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{sec.name}</div>
                    <div className="text-sm font-extrabold text-blue-500">{sec.visits} visitas</div>
                    <div className="text-[10px] text-emerald-500 font-semibold">{sec.growth}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONFIGURACIÓN CALCULADORA ROI & 4 CTAs */}
        {activeTab === 'roi' && (
          <div className="flex-1 overflow-y-auto space-y-5 text-xs pr-1 pb-2">
            {/* Save / Feedback Header */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? 'bg-[#001E3D] border-[#0284C7]/25' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
                  Parámetros de Calculadora ROI y Acciones de Cierre
                </div>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Ajusta medias locales ({draftRoi.globalRates.locationLabel}), coeficientes de automatización y activa o desactiva las 4 CTAs finales.
                </p>
                {roiSaveFeedback && (
                  <p className="text-[11px] font-bold text-emerald-500 mt-1">{roiSaveFeedback}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetRoiConfig}
                  disabled={isSavingRoi}
                  className={`px-3 py-2 rounded-xl font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                    isDark
                      ? 'bg-[#001428] border-[#0284C7]/30 text-slate-300 hover:text-white'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  <span>Restaurar Getafe</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveRoiConfig}
                  disabled={isSavingRoi}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingRoi ? 'Guardando...' : 'Guardar configuración'}</span>
                </button>
              </div>
            </div>

            {/* 1. Global Parameters */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#001E3D]/70 border-[#0284C7]/20' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <h4 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                <Sliders className="w-3.5 h-3.5" />
                <span>Ajustes Globales del Simulador</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Localidad de referencia</label>
                  <input
                    type="text"
                    value={draftRoi.globalRates.locationLabel}
                    onChange={(e) =>
                      setDraftRoi((prev) => ({
                        ...prev,
                        globalRates: { ...prev.globalRates, locationLabel: e.target.value },
                      }))
                    }
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs ${
                      isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1">Sector inicial por defecto</label>
                  <select
                    value={draftRoi.defaultSectorId}
                    onChange={(e) =>
                      setDraftRoi((prev) => ({
                        ...prev,
                        defaultSectorId: e.target.value as RoiSectorId,
                      }))
                    }
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs ${
                      isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {SECTOR_ORDER.map((sid) => (
                      <option key={sid} value={sid}>
                        {draftRoi.sectors[sid].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1">Tamaño empresa inicial</label>
                  <select
                    value={draftRoi.defaultCompanySizeId || 'micro'}
                    onChange={(e) =>
                      setDraftRoi((prev) => ({
                        ...prev,
                        defaultCompanySizeId: e.target.value as CompanySizeId,
                      }))
                    }
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs ${
                      isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {COMPANY_SIZE_ORDER.map((sizeId) => (
                      <option key={sizeId} value={sizeId}>
                        {(draftRoi.companySizes?.[sizeId] || DEFAULT_ROI_CONFIG.companySizes[sizeId]).label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1">Bonificación Kit Digital (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(draftRoi.globalRates.kitDigitalSetupDiscountRate * 100)}
                    onChange={(e) =>
                      setDraftRoi((prev) => ({
                        ...prev,
                        globalRates: {
                          ...prev.globalRates,
                          kitDigitalSetupDiscountRate: Math.min(100, Math.max(0, Number(e.target.value))) / 100,
                        },
                      }))
                    }
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono tabular-nums ${
                      isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1">Tope reducción máx. (%)</label>
                  <input
                    type="number"
                    min={20}
                    max={95}
                    value={Math.round(draftRoi.globalRates.maxTotalReductionCap * 100)}
                    onChange={(e) =>
                      setDraftRoi((prev) => ({
                        ...prev,
                        globalRates: {
                          ...prev.globalRates,
                          maxTotalReductionCap: Math.min(95, Math.max(20, Number(e.target.value))) / 100,
                        },
                      }))
                    }
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono tabular-nums ${
                      isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* 1.5 Company Size Dynamic Weights (Micro, Pequeña, Mediana) */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#001E3D]/70 border-[#0284C7]/20' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  <Building className="w-3.5 h-3.5" />
                  <span>Pesos de Variables según Tamaño de Empresa</span>
                </h4>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Multiplicadores aplicados en vivo al seleccionar Micro, Pequeña o Mediana empresa
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                {COMPANY_SIZE_ORDER.map((sizeId) => {
                  const profile =
                    draftRoi.companySizes?.[sizeId] || DEFAULT_ROI_CONFIG.companySizes[sizeId];
                  return (
                    <div
                      key={sizeId}
                      className={`p-3.5 rounded-xl border space-y-2.5 ${
                        isDark ? 'bg-[#001428] border-[#0284C7]/25' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
                          {profile.label}
                        </span>
                        <span className="text-[11px] font-mono tabular-nums text-emerald-500 font-semibold">
                          {profile.headcountRange}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold mb-0.5">
                            Peso tiempo (×)
                          </label>
                          <input
                            type="number"
                            min={0.3}
                            max={2.5}
                            step={0.05}
                            value={profile.timeSavingsWeight}
                            onChange={(e) =>
                              updateCompanySizeField(
                                sizeId,
                                'timeSavingsWeight',
                                Number(e.target.value)
                              )
                            }
                            className={`w-full px-2 py-1 rounded-lg border font-mono tabular-nums text-xs ${
                              isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold mb-0.5">
                            Peso captación (×)
                          </label>
                          <input
                            type="number"
                            min={0.3}
                            max={2.5}
                            step={0.05}
                            value={profile.leadRecoveryWeight}
                            onChange={(e) =>
                              updateCompanySizeField(
                                sizeId,
                                'leadRecoveryWeight',
                                Number(e.target.value)
                              )
                            }
                            className={`w-full px-2 py-1 rounded-lg border font-mono tabular-nums text-xs ${
                              isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold mb-0.5">
                            Peso extra sector (×)
                          </label>
                          <input
                            type="number"
                            min={0.3}
                            max={3.0}
                            step={0.05}
                            value={profile.sectorExtraWeight}
                            onChange={(e) =>
                              updateCompanySizeField(
                                sizeId,
                                'sectorExtraWeight',
                                Number(e.target.value)
                              )
                            }
                            className={`w-full px-2 py-1 rounded-lg border font-mono tabular-nums text-xs ${
                              isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold mb-0.5">
                            Escala inversión (×)
                          </label>
                          <input
                            type="number"
                            min={0.3}
                            max={3.5}
                            step={0.05}
                            value={profile.investmentMultiplier}
                            onChange={(e) =>
                              updateCompanySizeField(
                                sizeId,
                                'investmentMultiplier',
                                Number(e.target.value)
                              )
                            }
                            className={`w-full px-2 py-1 rounded-lg border font-mono tabular-nums text-xs ${
                              isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Descripción breve</label>
                        <input
                          type="text"
                          value={profile.description}
                          onChange={(e) =>
                            updateCompanySizeField(sizeId, 'description', e.target.value)
                          }
                          className={`w-full px-2 py-1 rounded-lg border text-[11px] ${
                            isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Admin Preview across Micro, Pequeña, Mediana */}
              <div
                className={`p-3 rounded-xl border ${
                  isDark ? 'bg-[#001833] border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-[11px]">
                  <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>
                      Simulación en vivo ({draftRoi.sectors[selectedRoiSector].shortName} · con Kit Digital)
                    </span>
                  </span>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                    Cambia cualquier peso o media sectorial y comprueba el resultado antes de guardar
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-2 text-xs font-mono tabular-nums">
                  {COMPANY_SIZE_ORDER.map((sizeId) => {
                    const sec = draftRoi.sectors[selectedRoiSector];
                    const prof =
                      draftRoi.companySizes?.[sizeId] || DEFAULT_ROI_CONFIG.companySizes[sizeId];
                    const sim = calculateRoiResults(
                      createInitialInputsForSector(sec, true, sizeId),
                      sec,
                      draftRoi.globalRates,
                      draftRoi.companySizes
                    );
                    return (
                      <div
                        key={sizeId}
                        className={`px-3 py-2 rounded-lg border ${
                          isDark ? 'bg-[#001428] border-[#0284C7]/20' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="font-sans font-bold text-[11px] mb-0.5 flex justify-between">
                          <span>{prof.shortLabel}</span>
                          <span className="text-emerald-500">ROI {sim.roiPercent}%</span>
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-500">
                          +{sim.annualNetBenefit.toLocaleString('es-ES')} €/año netos
                        </div>
                        <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {sim.savedHoursWeek} h/sem · {sim.paybackWeeks} sem amortiz.
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. The 4 Conversion CTAs Toggle & Priority */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#001E3D]/70 border-[#0284C7]/20' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-sky-400' : 'text-blue-700'}`}>
                  <Star className="w-3.5 h-3.5" />
                  <span>Las 4 Acciones Finales tras calcular el ROI</span>
                </h4>
                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Activa, oculta, edita el texto y elige cuál destacar como principal
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {CTA_ORDER.map((ctaId) => {
                  const cta = draftRoi.ctaSettings.items[ctaId];
                  const isPrimary = draftRoi.ctaSettings.primaryCtaId === ctaId;
                  return (
                    <div
                      key={ctaId}
                      className={`p-3 rounded-xl border space-y-2.5 ${
                        cta.enabled
                          ? isDark
                            ? 'bg-[#001428] border-emerald-500/35'
                            : 'bg-emerald-50/40 border-emerald-300'
                          : isDark
                          ? 'bg-[#001428]/50 border-slate-800 opacity-75'
                          : 'bg-slate-100/70 border-slate-200 opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cta.enabled}
                            onChange={(e) => updateCtaField(ctaId, { enabled: e.target.checked })}
                            className="w-4 h-4 accent-emerald-500 cursor-pointer"
                          />
                          <span>{cta.enabled ? 'Visible en la web' : 'Oculta'}</span>
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            setDraftRoi((prev) => ({
                              ...prev,
                              ctaSettings: { ...prev.ctaSettings, primaryCtaId: ctaId },
                            }))
                          }
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                            isPrimary
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : isDark
                              ? 'border-[#0284C7]/30 text-slate-300 hover:text-white'
                              : 'border-slate-300 text-slate-600 hover:text-black'
                          }`}
                        >
                          {isPrimary ? 'Principal destacada' : 'Marcar principal'}
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Texto del botón</label>
                        <input
                          type="text"
                          value={cta.label}
                          onChange={(e) => updateCtaField(ctaId, { label: e.target.value })}
                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                            isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Sector-Specific Defaults & Formula Parameters */}
            <div
              className={`p-4 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#001E3D]/70 border-[#0284C7]/20' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className={`font-bold text-xs uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
                  Parámetros por Sector ({draftRoi.globalRates.locationLabel})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {SECTOR_ORDER.map((sid) => (
                    <button
                      key={sid}
                      type="button"
                      onClick={() => setSelectedRoiSector(sid)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        selectedRoiSector === sid
                          ? 'bg-blue-600 text-white'
                          : isDark
                          ? 'bg-[#001428] text-slate-300 hover:text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {draftRoi.sectors[sid].shortName}
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const sec = draftRoi.sectors[selectedRoiSector];
                return (
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Nota de referencia local</label>
                        <input
                          type="text"
                          value={sec.localBenchmarkNote}
                          onChange={(e) =>
                            updateSectorField(selectedRoiSector, 'localBenchmarkNote', e.target.value)
                          }
                          className={`w-full px-3 py-1.5 rounded-xl border text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Etiqueta ahorro extra sectorial</label>
                        <input
                          type="text"
                          value={sec.sectorExtraLabel}
                          onChange={(e) =>
                            updateSectorField(selectedRoiSector, 'sectorExtraLabel', e.target.value)
                          }
                          className={`w-full px-3 py-1.5 rounded-xl border text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Equipo base (pers.)</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={sec.defaultTeamSize}
                          onChange={(e) =>
                            updateSectorField(selectedRoiSector, 'defaultTeamSize', Number(e.target.value))
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono tabular-nums text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Coste/hora (€)</label>
                        <input
                          type="number"
                          min={5}
                          max={250}
                          value={sec.defaultHourlyCost}
                          onChange={(e) =>
                            updateSectorField(selectedRoiSector, 'defaultHourlyCost', Number(e.target.value))
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono tabular-nums text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Horas atención/sem</label>
                        <input
                          type="number"
                          min={0}
                          max={120}
                          value={sec.defaultCommHoursPerWeek}
                          onChange={(e) =>
                            updateSectorField(selectedRoiSector, 'defaultCommHoursPerWeek', Number(e.target.value))
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono tabular-nums text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Horas gestión/sem</label>
                        <input
                          type="number"
                          min={0}
                          max={120}
                          value={sec.defaultAdminHoursPerWeek}
                          onChange={(e) =>
                            updateSectorField(selectedRoiSector, 'defaultAdminHoursPerWeek', Number(e.target.value))
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono tabular-nums text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Consultas perdidas/sem</label>
                        <input
                          type="number"
                          min={0}
                          max={200}
                          value={sec.defaultMissedLeadsPerWeek}
                          onChange={(e) =>
                            updateSectorField(selectedRoiSector, 'defaultMissedLeadsPerWeek', Number(e.target.value))
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono tabular-nums text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Ticket medio (€)</label>
                        <input
                          type="number"
                          min={1}
                          max={50000}
                          value={sec.defaultAvgTicket}
                          onChange={(e) =>
                            updateSectorField(selectedRoiSector, 'defaultAvgTicket', Number(e.target.value))
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono tabular-nums text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Ahorro extra/mes (€)</label>
                        <input
                          type="number"
                          min={0}
                          max={20000}
                          value={sec.defaultSectorExtraMonthly}
                          onChange={(e) =>
                            updateSectorField(selectedRoiSector, 'defaultSectorExtraMonthly', Number(e.target.value))
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono tabular-nums text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Tope horas slider</label>
                        <input
                          type="number"
                          min={15}
                          max={160}
                          value={sec.maxWeeklyHoursCap}
                          onChange={(e) =>
                            updateSectorField(selectedRoiSector, 'maxWeeklyHoursCap', Number(e.target.value))
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono tabular-nums text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Auto. atención (%)</label>
                        <input
                          type="number"
                          min={5}
                          max={95}
                          value={Math.round(sec.commAutomationRate * 100)}
                          onChange={(e) =>
                            updateSectorField(
                              selectedRoiSector,
                              'commAutomationRate',
                              Math.min(95, Math.max(5, Number(e.target.value))) / 100
                            )
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono tabular-nums text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Auto. gestión (%)</label>
                        <input
                          type="number"
                          min={5}
                          max={95}
                          value={Math.round(sec.adminAutomationRate * 100)}
                          onChange={(e) =>
                            updateSectorField(
                              selectedRoiSector,
                              'adminAutomationRate',
                              Math.min(95, Math.max(5, Number(e.target.value))) / 100
                            )
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono tabular-nums text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Recup. consultas (%)</label>
                        <input
                          type="number"
                          min={5}
                          max={95}
                          value={Math.round(sec.leadRecoveryRate * 100)}
                          onChange={(e) =>
                            updateSectorField(
                              selectedRoiSector,
                              'leadRecoveryRate',
                              Math.min(95, Math.max(5, Number(e.target.value))) / 100
                            )
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono tabular-nums text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Tasa cierre real (%)</label>
                        <input
                          type="number"
                          min={5}
                          max={100}
                          value={Math.round(sec.closingMultiplier * 100)}
                          onChange={(e) =>
                            updateSectorField(
                              selectedRoiSector,
                              'closingMultiplier',
                              Math.min(100, Math.max(5, Number(e.target.value))) / 100
                            )
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono tabular-nums text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Plan ref. (€/mes)</label>
                        <input
                          type="number"
                          min={0}
                          max={10000}
                          value={sec.estimatedMonthlyPlanCost}
                          onChange={(e) =>
                            updateSectorField(selectedRoiSector, 'estimatedMonthlyPlanCost', Number(e.target.value))
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono tabular-nums text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Setup inicial (€)</label>
                        <input
                          type="number"
                          min={0}
                          max={50000}
                          value={sec.estimatedSetupCost}
                          onChange={(e) =>
                            updateSectorField(selectedRoiSector, 'estimatedSetupCost', Number(e.target.value))
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono tabular-nums text-xs ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Footer shortcuts */}
        <div
          className={`pt-3 mt-auto border-t flex flex-wrap items-center justify-between text-xs gap-2 ${
            isDark ? 'border-[#0284C7]/20 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <span>Contacto soporte Asexia: <strong>609 735 753</strong></span>
            <span>·</span>
            <span>Email: <strong>soyasexia@gmail.com</strong></span>
          </div>
          <a
            href="https://calendly.com/mundoconfia/orientacion?month=2026-03&date=2026-03-20"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Ver Calendly oficial</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
