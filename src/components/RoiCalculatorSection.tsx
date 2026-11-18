import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Calculator,
  RotateCcw,
  Clock,
  TrendingUp,
  Euro,
  Calendar,
  Play,
  MessageSquare,
  Scale,
  ArrowRight,
  Layers,
  ShieldCheck,
  Utensils,
  Building2,
  Stethoscope,
  ShoppingBag,
  Home,
  MapPin,
  Users,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Save,
  Compass,
  X,
  User,
  Briefcase,
  Phone,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import {
  LeadProfile,
} from '../types/confia360';
import { useTheme } from '../context/ThemeContext';
import { InfoPopover } from './InfoPopover';
import {
  RoiConfig,
  RoiSectorId,
  CompanySizeId,
  RoiCtaId,
  RoiUserInputs,
  RoiCalculationResult,
  SECTOR_ORDER,
  COMPANY_SIZE_ORDER,
  CTA_ORDER,
  DEFAULT_ROI_CONFIG,
  createInitialInputsForSector,
  calculateRoiResults,
} from '../types/roi';

export interface RoiSubmissionContext {
  sectorId: RoiSectorId;
  sectorName: string;
  bookingSectorValue: string;
  demoSectorValue: 'restauracion' | 'clinicas' | 'servicios' | 'comercios' | 'inmobiliarias';
  inputs: RoiUserInputs;
  results: RoiCalculationResult;
  summaryText: string;
}

interface RoiCalculatorSectionProps {
  config: RoiConfig;
  onBookWithRoi: (context: RoiSubmissionContext) => void;
  onTryDemoWithRoi: (context: RoiSubmissionContext) => void;
  onCompareWithRoi: (context: RoiSubmissionContext) => void;
  leadProfile?: LeadProfile;
  onLeadProfileChange?: (next: LeadProfile) => void;
  fromCaptaGlobal?: boolean;
  onRoiSnapshotChange?: (snapshot: {
    inputs: RoiUserInputs;
    results: RoiCalculationResult;
  }) => void;
  onCrmSaved?: () => void;
  onJumpToDiagnostic?: () => void;
}

const SECTOR_ICONS: Record<RoiSectorId, React.ComponentType<{ className?: string }>> = {
  restauracion: Utensils,
  servicios: Building2,
  clinicas: Stethoscope,
  comercios: ShoppingBag,
  inmobiliarias: Home,
};

export const RoiCalculatorSection: React.FC<RoiCalculatorSectionProps> = ({
  config,
  onBookWithRoi,
  onTryDemoWithRoi,
  onCompareWithRoi,
  leadProfile,
  onLeadProfileChange,
  fromCaptaGlobal = false,
  onRoiSnapshotChange,
  onCrmSaved,
  onJumpToDiagnostic,
}) => {
  const { isDark } = useTheme();
  const viewerRef = useRef<HTMLDivElement>(null);

  const initialSector = config.sectors[config.defaultSectorId] || config.sectors.restauracion;
  const initialSizeId: CompanySizeId = config.defaultCompanySizeId || 'micro';
  const [inputs, setInputs] = useState<RoiUserInputs>(() =>
    createInitialInputsForSector(initialSector, true, initialSizeId)
  );
  const [hasManualEdits, setHasManualEdits] = useState(false);

  // Lightweight 3D Viewer interactive tilt & specular glare state
  const [tiltX, setTiltX] = useState(-3);
  const [tiltY, setTiltY] = useState(4);
  const [glarePos, setGlarePos] = useState<{ x: number; y: number }>({ x: 68, y: 22 });
  const [isViewerHovered, setIsViewerHovered] = useState(false);
  const [isExploded3D, setIsExploded3D] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // CRM 6-Field Capture Modal State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [pendingActionAfterCapture, setPendingActionAfterCapture] = useState<
    'save' | 'download' | 'diagnostic'
  >('save');
  const [modalDraft, setModalDraft] = useState<LeadProfile>({
    name: leadProfile?.name || '',
    companyName: leadProfile?.companyName || '',
    sectorId: leadProfile?.sectorId || initialSector.id,
    postalCode: leadProfile?.postalCode || '',
    phone: leadProfile?.phone || '',
    email: leadProfile?.email || '',
    companySizeId: leadProfile?.companySizeId || initialSizeId,
  });
  const [isSavingToCrm, setIsSavingToCrm] = useState(false);
  const [crmSavedNotice, setCrmSavedNotice] = useState<string | null>(null);
  const [crmErrorNotice, setCrmErrorNotice] = useState<string | null>(null);

  const currentSector = config.sectors[inputs.sectorId] || initialSector;
  const companySizesMap = config.companySizes || DEFAULT_ROI_CONFIG.companySizes;
  const currentSizeProfile =
    companySizesMap[inputs.companySizeId] || companySizesMap[initialSizeId] || companySizesMap.micro;

  // Sync defaults when admin updates ROI config (unless visitor manually dragged sliders on current sector)
  useEffect(() => {
    if (!hasManualEdits) {
      const targetSector = config.sectors[inputs.sectorId] || config.sectors[config.defaultSectorId];
      const targetSize = config.defaultCompanySizeId || inputs.companySizeId || 'micro';
      if (targetSector) {
        setInputs(createInitialInputsForSector(targetSector, inputs.applyKitDigital, targetSize));
      }
    }
  }, [config]);

  // Subtle organic 3D idle motion when pointer is outside viewer
  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isViewerHovered || reduced) return;
    let phase = 0;
    const timer = setInterval(() => {
      phase += 0.03;
      setTiltX(-2.5 + Math.cos(phase * 0.85) * 1.8);
      setTiltY(3.5 + Math.sin(phase) * 2.5);
    }, 55);
    return () => clearInterval(timer);
  }, [isViewerHovered]);

  const handleSelectSector = (sectorId: RoiSectorId) => {
    const nextSector = config.sectors[sectorId];
    if (!nextSector) return;
    setInputs(createInitialInputsForSector(nextSector, inputs.applyKitDigital, inputs.companySizeId));
    setHasManualEdits(false);
    if (leadProfile && onLeadProfileChange && leadProfile.sectorId !== sectorId) {
      onLeadProfileChange({ ...leadProfile, sectorId });
    }
  };

  const handleSelectCompanySize = (companySizeId: CompanySizeId) => {
    setHasManualEdits(true);
    setInputs((prev) => ({ ...prev, companySizeId }));
    if (leadProfile && onLeadProfileChange && leadProfile.companySizeId !== companySizeId) {
      onLeadProfileChange({ ...leadProfile, companySizeId });
    }
  };

  const handleSyncTeamToSize = () => {
    const targetTeam =
      inputs.companySizeId === 'micro'
        ? currentSector.defaultTeamSize
        : inputs.companySizeId === 'pequena'
        ? 18
        : 65;
    updateInput('teamSize', targetTeam);
  };

  const handleResetToGetafeBenchmark = () => {
    setInputs(
      createInitialInputsForSector(currentSector, true, config.defaultCompanySizeId || 'micro')
    );
    setHasManualEdits(false);
  };

  const updateInput = <K extends keyof RoiUserInputs>(key: K, value: RoiUserInputs[K]) => {
    setHasManualEdits(true);
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const results = useMemo(
    () => calculateRoiResults(inputs, currentSector, config.globalRates, companySizesMap),
    [inputs, currentSector, config.globalRates, companySizesMap]
  );

  // Sync external sector/size selection from ConfIA360 diagnostic if changed
  useEffect(() => {
    if (!leadProfile) return;
    setInputs((prev) => {
      if (
        prev.sectorId === leadProfile.sectorId &&
        prev.companySizeId === leadProfile.companySizeId
      ) {
        return prev;
      }
      const nextSec = config.sectors[leadProfile.sectorId] || currentSector;
      if (!hasManualEdits && prev.sectorId !== leadProfile.sectorId) {
        return createInitialInputsForSector(
          nextSec,
          prev.applyKitDigital,
          leadProfile.companySizeId
        );
      }
      return {
        ...prev,
        sectorId: leadProfile.sectorId,
        companySizeId: leadProfile.companySizeId,
      };
    });
  }, [leadProfile?.sectorId, leadProfile?.companySizeId]);

  // Share live ROI snapshot upwards so ConfIA360 Diagnostic reflects current figures
  useEffect(() => {
    onRoiSnapshotChange?.({ inputs, results });
  }, [inputs, results]);

  // Side-by-side results for Micro / Pequeña / Mediana comparison
  const comparisonBySize = useMemo(
    () =>
      COMPANY_SIZE_ORDER.map((sizeId) => ({
        sizeId,
        profile: companySizesMap[sizeId],
        calc: calculateRoiResults(
          { ...inputs, companySizeId: sizeId },
          currentSector,
          config.globalRates,
          companySizesMap
        ),
      })),
    [inputs, currentSector, config.globalRates, companySizesMap]
  );

  // 12-month cumulative break-even curve points
  const projection12Months = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, idx) => {
      const m = idx + 1;
      const cumulativeSavings = results.totalMonthlyBenefit * m;
      const cumulativeInvestment = results.effectiveSetupCost + results.estimatedMonthlyCost * m;
      const netCumulative = cumulativeSavings - cumulativeInvestment;
      return { month: m, cumulativeSavings, cumulativeInvestment, netCumulative };
    });
    const maxValue = Math.max(
      1,
      ...months.map((pt) => Math.max(pt.cumulativeSavings, pt.cumulativeInvestment))
    );
    const breakEvenMonth = months.find((pt) => pt.netCumulative >= 0)?.month || 12;
    return { months, maxValue, breakEvenMonth };
  }, [results]);

  // Build formatted plain summary for Booking / Comparator / WhatsApp
  const submissionContext: RoiSubmissionContext = useMemo(() => {
    const summaryText = [
      `Cálculo ROI Asexia (${config.globalRates.locationLabel})`,
      `Sector: ${currentSector.name} · Tamaño: ${currentSizeProfile.label} (${currentSizeProfile.headcountRange}, ${inputs.teamSize} pers.)`,
      `Ahorro de tiempo: ${results.savedHoursWeek} h/semana (${results.savedHoursYear} h/año · -${results.timeReductionPercent}% carga manual)`,
      `Ahorro operativo estimado: ${results.monthlyOperationalSavings.toLocaleString('es-ES')} €/mes`,
      `Ingresos recuperados estimados: ${results.monthlyRecoveredRevenue.toLocaleString('es-ES')} €/mes (~${results.recoveredLeadsMonth} oportunidades/mes)`,
      `Beneficio neto anual estimado: ${results.annualNetBenefit.toLocaleString('es-ES')} €/año (ROI ${results.roiPercent}% · Amortización en ${results.paybackWeeks} sem${inputs.applyKitDigital ? ' · con Kit Digital' : ''})`,
    ].join(' | ');

    return {
      sectorId: currentSector.id,
      sectorName: currentSector.name,
      bookingSectorValue: currentSector.bookingSectorValue,
      demoSectorValue: currentSector.demoSectorValue,
      inputs,
      results,
      summaryText,
    };
  }, [config.globalRates.locationLabel, currentSector, currentSizeProfile, inputs, results]);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(submissionContext.summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2200);
    } catch {
      // Clipboard blocked in restricted context; fallback skipped cleanly
    }
  };

  const triggerTxtDownload = (profile?: LeadProfile) => {
    const lines = [
      'INFORME ESTIMADO DE RETORNO DE INVERSIÓN (ROI) — ASEXIA | CONFIA360',
      '====================================================================',
      `Referencia geográfica: ${config.globalRates.locationLabel}`,
      `Fecha de simulación: ${new Date().toLocaleDateString('es-ES')}`,
      profile?.name ? `Contacto: ${profile.name} · Empresa: ${profile.companyName} (CP ${profile.postalCode})` : '',
      profile?.phone ? `Teléfono: ${profile.phone} · Email: ${profile.email}` : '',
      `Sector seleccionado: ${currentSector.name}`,
      `Tamaño de empresa: ${currentSizeProfile.label} (${currentSizeProfile.headcountRange})`,
      `Pesos aplicados: Tiempo ×${currentSizeProfile.timeSavingsWeight.toFixed(2)} | Captación ×${currentSizeProfile.leadRecoveryWeight.toFixed(2)} | Extra sector ×${currentSizeProfile.sectorExtraWeight.toFixed(2)} | Escala plan ×${currentSizeProfile.investmentMultiplier.toFixed(2)}`,
      '',
      'PARÁMETROS INTRODUCIDOS',
      `- Personas en gestión: ${inputs.teamSize}`,
      `- Coste/hora del equipo: ${inputs.hourlyCost} €/h`,
      `- Horas semanales en llamadas/WhatsApp/citas: ${inputs.commHoursPerWeek} h/sem`,
      `- Horas semanales en facturas/papeleo/gestión: ${inputs.adminHoursPerWeek} h/sem`,
      `- Consultas o citas perdidas/semana: ${inputs.missedLeadsPerWeek}`,
      `- Valor medio por cliente: ${inputs.avgTicket} €`,
      `- Bonificación Kit Digital aplicada: ${inputs.applyKitDigital ? 'Sí' : 'No'}`,
      '',
      'RESULTADOS ESTIMADOS',
      `- Tiempo liberado: ${results.savedHoursWeek} h/semana (${results.savedHoursYear} h/año · -${results.timeReductionPercent}% carga manual)`,
      `- Ahorro operativo mensual: ${results.monthlyOperationalSavings.toLocaleString('es-ES')} €/mes`,
      `- Ingresos recuperados estimados: +${results.monthlyRecoveredRevenue.toLocaleString('es-ES')} €/mes (~${results.recoveredLeadsMonth} oportunidades/mes)`,
      `- Inversión mensual de referencia: ${results.estimatedMonthlyCost.toLocaleString('es-ES')} €/mes (Setup inicial: ${results.effectiveSetupCost.toLocaleString('es-ES')} €)`,
      `- Beneficio neto anual estimado: ${results.annualNetBenefit.toLocaleString('es-ES')} €/año`,
      `- ROI anual estimado: ${results.roiPercent}%`,
      `- Plazo estimado de amortización: ~${results.paybackWeeks} semanas`,
      '',
      'Nota: Cifras orientativas basadas en medias del sector y parámetros configurados.',
      'Contacto Asexia: 609 735 753 · soyasexia@gmail.com',
    ].filter((line) => line !== '');
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `informe-roi-asexia-${currentSector.id}-${inputs.companySizeId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasCompleteLeadProfile = Boolean(
    leadProfile?.name?.trim() &&
      leadProfile?.companyName?.trim() &&
      leadProfile?.postalCode?.trim() &&
      leadProfile?.phone?.trim() &&
      leadProfile?.email?.trim()
  );

  const saveRoiSimulationToCrm = async (
    profile: LeadProfile,
    afterAction: 'save' | 'download' | 'diagnostic'
  ): Promise<boolean> => {
    setIsSavingToCrm(true);
    setCrmErrorNotice(null);
    setCrmSavedNotice(null);
    try {
      const res = await fetch('/api/crm/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name.trim(),
          companyName: profile.companyName.trim(),
          sectorId: profile.sectorId || inputs.sectorId,
          sectorLabel: config.sectors[profile.sectorId || inputs.sectorId]?.name || currentSector.name,
          companySizeId: profile.companySizeId || inputs.companySizeId,
          postalCode: profile.postalCode.trim(),
          phone: profile.phone.trim(),
          email: profile.email.trim(),
          source: fromCaptaGlobal ? 'captaglobal' : 'roi-calculator',
          roiInputs: {
            ...inputs,
            sectorId: profile.sectorId || inputs.sectorId,
            companySizeId: profile.companySizeId || inputs.companySizeId,
          },
          deliverable:
            afterAction === 'download'
              ? {
                  type: 'informe-txt',
                  tier: 'base',
                  channel: 'descarga',
                  recipient: profile.email.trim(),
                  summary: `Informe ROI (${results.annualNetBenefit.toLocaleString('es-ES')} €/año netos)`,
                }
              : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCrmErrorNotice(data?.error || 'No se pudo guardar en el CRM.');
        return false;
      }
      onLeadProfileChange?.(profile);
      onCrmSaved?.();
      setCrmSavedNotice(
        `Simulación guardada en CRM (#${data.opportunity?.id || 'CRM'}) para ${profile.companyName}${
          data.autoSyncEnabled ? ' · Sincronización automática CaptaGlobal activada.' : '.'
        }`
      );
      if (afterAction === 'download') {
        triggerTxtDownload(profile);
      } else if (afterAction === 'diagnostic') {
        onJumpToDiagnostic?.();
      }
      return true;
    } catch {
      setCrmErrorNotice('Error de conexión al guardar la simulación.');
      return false;
    } finally {
      setIsSavingToCrm(false);
    }
  };

  const initiateRoiSaveOrDownload = (action: 'save' | 'download' | 'diagnostic') => {
    if (hasCompleteLeadProfile && leadProfile) {
      saveRoiSimulationToCrm(
        {
          ...leadProfile,
          sectorId: inputs.sectorId,
          companySizeId: inputs.companySizeId,
        },
        action
      );
      return;
    }
    setModalDraft({
      name: leadProfile?.name || '',
      companyName: leadProfile?.companyName || '',
      sectorId: inputs.sectorId,
      postalCode: leadProfile?.postalCode || '',
      phone: leadProfile?.phone || '',
      email: leadProfile?.email || '',
      companySizeId: inputs.companySizeId,
    });
    setPendingActionAfterCapture(action);
    setCrmErrorNotice(null);
    setIsLeadModalOpen(true);
  };

  const handleDownloadReport = () => {
    initiateRoiSaveOrDownload('download');
  };

  // 3D pointer parallax & glare tracking on desktop viewports
  const handleViewerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewerRef.current || window.innerWidth < 1024) return;
    const rect = viewerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTiltX(-(y / (rect.height / 2)) * 9);
    setTiltY((x / (rect.width / 2)) * 11);
    setGlarePos({
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    });
  };

  const handleViewerMouseLeave = () => {
    setIsViewerHovered(false);
    setTiltX(-2.5);
    setTiltY(3.5);
    setGlarePos({ x: 68, y: 22 });
  };

  // Ordered enabled CTAs driven by Admin Settings
  const enabledCtas = useMemo(() => {
    const active = CTA_ORDER.map((id) => config.ctaSettings.items[id]).filter(
      (item) => item && item.enabled
    );
    return active.sort((a, b) => {
      if (a.id === config.ctaSettings.primaryCtaId) return -1;
      if (b.id === config.ctaSettings.primaryCtaId) return 1;
      return 0;
    });
  }, [config.ctaSettings]);

  const handleCtaClick = (ctaId: RoiCtaId) => {
    if (ctaId === 'bookingWithRoi') {
      onBookWithRoi(submissionContext);
    } else if (ctaId === 'interactiveDemo') {
      onTryDemoWithRoi(submissionContext);
    } else if (ctaId === 'proposalComparator') {
      onCompareWithRoi(submissionContext);
    } else if (ctaId === 'whatsappSummary') {
      const waMessage = [
        `Hola Asexia, he calculado mi ahorro estimado en vuestra web (${config.globalRates.locationLabel}):`,
        `• Sector: ${currentSector.name}`,
        `• Tamaño de empresa: ${currentSizeProfile.label} (${currentSizeProfile.headcountRange})`,
        `• Tiempo liberado: ${results.savedHoursWeek} h/semana (${results.savedHoursYear} h/año)`,
        `• Beneficio mensual total: ${results.totalMonthlyBenefit.toLocaleString('es-ES')} €/mes`,
        `• ROI anual estimado: ${results.roiPercent}% (${results.annualNetBenefit.toLocaleString('es-ES')} €/año netos)`,
        `Me gustaría comentarlo en una orientación breve.`,
      ].join('\n');
      const anchor = document.createElement('a');
      anchor.href = `https://wa.me/34609735753?text=${encodeURIComponent(waMessage)}`;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  };

  const getCtaIcon = (ctaId: RoiCtaId) => {
    switch (ctaId) {
      case 'bookingWithRoi':
        return Calendar;
      case 'interactiveDemo':
        return Play;
      case 'whatsappSummary':
        return MessageSquare;
      case 'proposalComparator':
        return Scale;
    }
  };

  const workdaysSavedYear = Math.round(results.savedHoursYear / 8);
  const manualCommShare =
    results.manualHoursWeek > 0
      ? Math.round((inputs.commHoursPerWeek / results.manualHoursWeek) * 100)
      : 50;
  const remainingWidthPercent = Math.max(8, 100 - results.timeReductionPercent);

  return (
    <section
      id="calculadora-roi"
      className={`scroll-mt-24 py-12 sm:py-20 border-t transition-colors duration-300 ${
        isDark ? 'bg-[#001833]/85 border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-500">
            <Calculator className="w-4 h-4" />
            <span>Calculadora de Retorno y Ahorro</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {config.globalRates.locationLabel}
            </span>
          </div>

          {fromCaptaGlobal && leadProfile?.companyName && (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>
                Estudio vinculado con CaptaGlobal para <strong>{leadProfile.companyName}</strong>
              </span>
            </div>
          )}

          <h2
            style={{ textWrap: 'balance' }}
            className={`text-2xl sm:text-4xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-[#001E3D]'
            }`}
          >
            Calcula cuántas horas y euros recuperas automatizando con Asexia.
          </h2>

          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Hemos pre-cargado las medias operativas reales de cada sector en{' '}
            <strong className={isDark ? 'text-white' : 'text-slate-900'}>
              {config.globalRates.locationLabel}
            </strong>
            . Ajusta tus cifras y observa al instante el impacto en tu negocio.
          </p>
        </div>

        {/* Sector Selector Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 sm:mb-8">
          {SECTOR_ORDER.map((secId) => {
            const sec = config.sectors[secId];
            if (!sec) return null;
            const Icon = SECTOR_ICONS[secId];
            const isSelected = inputs.sectorId === secId;
            return (
              <button
                key={secId}
                type="button"
                onClick={() => handleSelectSector(secId)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white border-transparent shadow-md shadow-emerald-500/20'
                    : isDark
                    ? 'bg-[#001E3D] text-slate-300 border-[#0284C7]/25 hover:text-white hover:bg-[#002855]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-sm'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{sec.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Interactive Grid */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* LEFT COLUMN: Sector-Adapted ROI Sliders & Controls */}
          <div
            className={`lg:col-span-6 rounded-3xl border p-5 sm:p-7 flex flex-col justify-between transition-colors ${
              isDark
                ? 'bg-[#001E3D] border-[#0284C7]/30 text-white shadow-xl'
                : 'bg-white border-slate-200 text-slate-900 shadow-lg'
            }`}
          >
            <div className="space-y-5">
              {/* Top Context Row */}
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${
                  isDark ? 'border-[#0284C7]/20' : 'border-slate-200'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-extrabold truncate">
                    {currentSector.name}
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {currentSector.localBenchmarkNote}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetToGetafeBenchmark}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-center ${
                    isDark
                      ? 'bg-[#001428] border-[#0284C7]/30 text-slate-300 hover:text-white hover:bg-[#002855]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Media {config.globalRates.locationLabel.split(',')[0]}</span>
                </button>
              </div>

              {/* Company Size Selector (Micro / Pequeña / Mediana) */}
              <div
                className={`pb-4 border-b space-y-2.5 ${
                  isDark ? 'border-[#0284C7]/20' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>Tamaño de empresa</span>
                    <InfoPopover
                      title="Tamaño de empresa"
                      meaning="Clasifica tu plantilla en Micro (1–9), Pequeña (10–49) o Mediana (50–249) según el estándar pyme."
                      impact={`Aplica los multiplicadores configurados para tu escala: Tiempo ×${currentSizeProfile.timeSavingsWeight.toFixed(2)}, Captación ×${currentSizeProfile.leadRecoveryWeight.toFixed(2)}, Extra ×${currentSizeProfile.sectorExtraWeight.toFixed(2)} y Escala plan ×${currentSizeProfile.investmentMultiplier.toFixed(2)}.`}
                    />
                  </span>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {currentSizeProfile.description}
                  </span>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Tamaño de empresa"
                  className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl border ${
                    isDark ? 'bg-[#001428] border-[#0284C7]/25' : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  {COMPANY_SIZE_ORDER.map((sizeId) => {
                    const sizeItem = companySizesMap[sizeId];
                    const isSelected = inputs.companySizeId === sizeId;
                    return (
                      <button
                        key={sizeId}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectCompanySize(sizeId)}
                        className={`px-2.5 py-2 rounded-lg text-xs transition flex flex-col items-center justify-center text-center cursor-pointer min-h-[44px] ${
                          isSelected
                            ? isDark
                              ? 'bg-[#002855] text-white font-bold border border-emerald-500/40 shadow-sm'
                              : 'bg-white text-[#001E3D] font-bold border border-emerald-400 shadow-sm'
                            : isDark
                            ? 'text-slate-300 hover:text-white hover:bg-[#001E3D]/60 border border-transparent'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
                        }`}
                      >
                        <span className="whitespace-nowrap">{sizeItem.shortLabel}</span>
                        <span
                          className={`text-[10px] font-mono tabular-nums whitespace-nowrap ${
                            isSelected
                              ? 'text-emerald-500'
                              : isDark
                              ? 'text-slate-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {sizeItem.headcountRange}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Unboxed metadata showing active dynamic weights from Admin */}
                <div
                  className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono tabular-nums ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <span className="font-sans font-medium">Pesos activos:</span>
                  <span>
                    Tiempo{' '}
                    <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                      ×{currentSizeProfile.timeSavingsWeight.toFixed(2)}
                    </strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Captación{' '}
                    <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                      ×{currentSizeProfile.leadRecoveryWeight.toFixed(2)}
                    </strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Ahorro sector{' '}
                    <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                      ×{currentSizeProfile.sectorExtraWeight.toFixed(2)}
                    </strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Escala plan{' '}
                    <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                      ×{currentSizeProfile.investmentMultiplier.toFixed(2)}
                    </strong>
                  </span>
                </div>
              </div>

              {/* 1. Team Size & Hourly Cost */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <label htmlFor="roi-team-size" className="font-semibold flex items-center gap-1.5 truncate">
                        <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>Personas en gestión</span>
                      </label>
                      <InfoPopover
                        title="Personas en gestión"
                        meaning="Miembros del equipo que dedican parte de su jornada a responder consultas, agendar citas o tramitar documentación."
                        impact="Contextualiza tu capacidad operativa y queda reflejado en el diagnóstico y comparativa de tu empresa."
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleSyncTeamToSize}
                        title="Ajustar número de personas al rango habitual del tamaño elegido"
                        className={`text-[10px] font-semibold underline cursor-pointer ${
                          isDark ? 'text-sky-400 hover:text-sky-300' : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        Ajustar a {currentSizeProfile.shortLabel}
                      </button>
                      <span className="font-mono tabular-nums font-bold text-emerald-500">
                        {inputs.teamSize} {inputs.teamSize === 1 ? 'persona' : 'personas'}
                      </span>
                    </div>
                  </div>
                  <input
                    id="roi-team-size"
                    type="range"
                    min={1}
                    max={inputs.companySizeId === 'mediana' ? 200 : inputs.companySizeId === 'pequena' ? 49 : 25}
                    step={1}
                    value={inputs.teamSize}
                    onChange={(e) => updateInput('teamSize', Number(e.target.value))}
                    className="w-full h-2.5 rounded-lg accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <label htmlFor="roi-hourly-cost" className="font-semibold flex items-center gap-1.5 truncate">
                        <Euro className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>Coste/hora equipo</span>
                      </label>
                      <InfoPopover
                        title="Coste por hora del equipo"
                        meaning="Coste laboral bruto por hora trabajada (salario más Seguridad Social) en tu sector y zona."
                        impact="Multiplica directamente cada hora semanal liberada para convertir el tiempo recuperado en ahorro operativo mensual (€/mes)."
                        align="right"
                      />
                    </div>
                    <span className="font-mono tabular-nums font-bold text-sky-500 shrink-0">
                      {inputs.hourlyCost} €/h
                    </span>
                  </div>
                  <input
                    id="roi-hourly-cost"
                    type="range"
                    min={10}
                    max={60}
                    step={1}
                    value={inputs.hourlyCost}
                    onChange={(e) => updateInput('hourlyCost', Number(e.target.value))}
                    className="w-full h-2.5 rounded-lg accent-sky-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* 2. Weekly Manual Hours: Attention/Calls/WhatsApp */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <label htmlFor="roi-comm-hours" className="font-semibold truncate">
                      Horas/semana en llamadas, WhatsApp y citas
                    </label>
                    <InfoPopover
                      title="Horas en atención y citas"
                      meaning="Tiempo semanal que tu equipo invierte contestando dudas frecuentes, dando precios básicos o cerrando citas manualmente."
                      impact={`Se automatiza aproximadamente un ${Math.round(results.effectiveCommRate * 100)}% con flujos de WhatsApp y reserva directa, liberando horas productivas cada semana.`}
                    />
                  </div>
                  <span className="font-mono tabular-nums font-bold text-emerald-500 whitespace-nowrap shrink-0">
                    {inputs.commHoursPerWeek} h/sem
                  </span>
                </div>
                <input
                  id="roi-comm-hours"
                  type="range"
                  min={1}
                  max={currentSector.maxWeeklyHoursCap}
                  step={1}
                  value={inputs.commHoursPerWeek}
                  onChange={(e) => updateInput('commHoursPerWeek', Number(e.target.value))}
                  className="w-full h-2.5 rounded-lg accent-emerald-500 cursor-pointer"
                />
                <div className={`flex justify-between text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>Atención manual repetitiva</span>
                  <span className="font-mono tabular-nums">
                    Automatizable ~{Math.round(results.effectiveCommRate * 100)}%
                  </span>
                </div>
              </div>

              {/* 3. Weekly Manual Hours: Admin/Invoicing/Contracts */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <label htmlFor="roi-admin-hours" className="font-semibold truncate">
                      Horas/semana en facturas, papeleo y gestión
                    </label>
                    <InfoPopover
                      title="Horas administrativas y de gestión"
                      meaning="Tiempo dedicado a facturación, presupuestos, firmas digitales, escandallos, RGPD o registro manual de datos."
                      impact={`Asexia reduce en torno al ${Math.round(results.effectiveAdminRate * 100)}% esta carga mecánica, sumando ahorro directo en horas y menos errores administrativos.`}
                    />
                  </div>
                  <span className="font-mono tabular-nums font-bold text-blue-500 whitespace-nowrap shrink-0">
                    {inputs.adminHoursPerWeek} h/sem
                  </span>
                </div>
                <input
                  id="roi-admin-hours"
                  type="range"
                  min={1}
                  max={currentSector.maxWeeklyHoursCap}
                  step={1}
                  value={inputs.adminHoursPerWeek}
                  onChange={(e) => updateInput('adminHoursPerWeek', Number(e.target.value))}
                  className="w-full h-2.5 rounded-lg accent-blue-500 cursor-pointer"
                />
                <div className={`flex justify-between text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>Tareas administrativas y cumplimiento</span>
                  <span className="font-mono tabular-nums">
                    Automatizable ~{Math.round(results.effectiveAdminRate * 100)}%
                  </span>
                </div>
              </div>

              {/* 4. Missed Inquiries / No-Shows & Average Ticket */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <label htmlFor="roi-missed-leads" className="font-semibold truncate">
                        Consultas o citas perdidas/sem
                      </label>
                      <InfoPopover
                        title="Oportunidades o citas perdidas"
                        meaning="Llamadas no atendidas en horas punta, mensajes sin seguimiento rápido o huecos vacíos por ausencias (no-shows)."
                        impact={`Estimamos recuperar un ${Math.round(results.effectiveLeadRecoveryRate * 100)}% mediante respuesta 24/7 y recordatorios, multiplicado por una tasa de cierre conservadora del ${Math.round(currentSector.closingMultiplier * 100)}%.`}
                      />
                    </div>
                    <span className="font-mono tabular-nums font-bold text-amber-500 shrink-0">
                      {inputs.missedLeadsPerWeek} / sem
                    </span>
                  </div>
                  <input
                    id="roi-missed-leads"
                    type="range"
                    min={0}
                    max={35}
                    step={1}
                    value={inputs.missedLeadsPerWeek}
                    onChange={(e) => updateInput('missedLeadsPerWeek', Number(e.target.value))}
                    className="w-full h-2.5 rounded-lg accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <label htmlFor="roi-avg-ticket" className="font-semibold truncate">
                        Valor medio cliente (€)
                      </label>
                      <InfoPopover
                        title="Valor medio por cliente"
                        meaning="Importe promedio de un servicio, ticket de compra, tratamiento o comisión cerrada en tu actividad."
                        impact="Determina el valor económico de cada consulta o cita recuperada, impulsando los ingresos adicionales mensuales y reduciendo el plazo de amortización."
                        align="right"
                      />
                    </div>
                    <span className="font-mono tabular-nums font-bold text-emerald-500 shrink-0">
                      {inputs.avgTicket.toLocaleString('es-ES')} €
                    </span>
                  </div>
                  <input
                    id="roi-avg-ticket"
                    type="range"
                    min={15}
                    max={currentSector.id === 'inmobiliarias' ? 3500 : 1000}
                    step={currentSector.id === 'inmobiliarias' ? 50 : 5}
                    value={inputs.avgTicket}
                    onChange={(e) => updateInput('avgTicket', Number(e.target.value))}
                    className="w-full h-2.5 rounded-lg accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* 5. Sector-Specific Direct Savings */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <label htmlFor="roi-extra-savings" className="font-semibold truncate">
                      {currentSector.sectorExtraLabel}
                    </label>
                    <InfoPopover
                      title="Ahorro directo específico del sector"
                      meaning="Costes recurrentes propios de tu actividad (comisiones externas, papel, mermas o desplazamientos improductivos) que se reducen al digitalizar."
                      impact={`Se suma íntegramente al ahorro operativo mensual ajustado por el peso de tu tamaño (×${currentSizeProfile.sectorExtraWeight.toFixed(2)} = ${results.monthlyExtraSavings.toLocaleString('es-ES')} €/mes).`}
                    />
                  </div>
                  <span className="font-mono tabular-nums font-bold text-teal-500 whitespace-nowrap shrink-0">
                    {results.monthlyExtraSavings.toLocaleString('es-ES')} €/mes
                  </span>
                </div>
                <input
                  id="roi-extra-savings"
                  type="range"
                  min={0}
                  max={1500}
                  step={10}
                  value={inputs.sectorExtraMonthly}
                  onChange={(e) => updateInput('sectorExtraMonthly', Number(e.target.value))}
                  className="w-full h-2.5 rounded-lg accent-teal-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Kit Digital Subsidy Toggle */}
            <div
              className={`mt-5 pt-4 border-t flex items-center justify-between gap-3 ${
                isDark ? 'border-[#0284C7]/20' : 'border-slate-200'
              }`}
            >
              <div className="min-w-0">
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Aplicar bonificación Kit Digital</span>
                  <InfoPopover
                    title="Bonificación Kit Digital"
                    meaning={`Ayuda pública tramitada por Asexia que cubre hasta un ${Math.round(config.globalRates.kitDigitalSetupDiscountRate * 100)}% del coste de implantación inicial.`}
                    impact="Reduce drásticamente la inversión inicial (setup), acortando el plazo de equilibrio en semanas y elevando el ROI porcentual del primer año."
                  />
                </div>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Subvenciona hasta el {Math.round(config.globalRates.kitDigitalSetupDiscountRate * 100)}% de la puesta en marcha inicial
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={inputs.applyKitDigital}
                onClick={() => updateInput('applyKitDigital', !inputs.applyKitDigital)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  inputs.applyKitDigital
                    ? 'bg-emerald-500'
                    : isDark
                    ? 'bg-slate-700'
                    : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition duration-200 ${
                    inputs.applyKitDigital ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Connected 3-Layer 3D Viewer + Break-Even + Dynamic CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-5">
            {/* 3D Interactive Stage */}
            <div
              ref={viewerRef}
              onMouseEnter={() => setIsViewerHovered(true)}
              onMouseMove={handleViewerMouseMove}
              onMouseLeave={handleViewerMouseLeave}
              className="perspective-1200 relative flex-1 flex flex-col justify-center"
            >
              {/* Top 3D Control & Export Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 px-1">
                <div className={`text-xs font-semibold flex items-center gap-2 min-w-0 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">
                    Visor 3D en vivo · {currentSizeProfile.label} ({currentSizeProfile.headcountRange})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    title="Copiar resumen del cálculo"
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                      copiedSummary
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                        : isDark
                        ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-300 hover:text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSummary ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => initiateRoiSaveOrDownload('save')}
                    disabled={isSavingToCrm}
                    title="Guardar simulación en el sistema CRM"
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                      isDark
                        ? 'bg-[#001E3D] border-emerald-500/35 text-emerald-400 hover:text-white'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingToCrm ? 'Guardando...' : 'Guardar CRM'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    title="Descargar informe ROI completo"
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                      isDark
                        ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-300 hover:text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5 text-sky-500" />
                    <span className="hidden sm:inline">Informe</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExploded3D(!isExploded3D)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      isExploded3D
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                        : isDark
                        ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-300 hover:text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isExploded3D ? 'Vista integrada' : 'Separar capas 3D'}</span>
                  </button>
                </div>
              </div>

              {crmSavedNotice && (
                <div className="mb-2.5 px-3 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-xs font-semibold flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{crmSavedNotice}</span>
                  </span>
                  {onJumpToDiagnostic && (
                    <button
                      type="button"
                      onClick={onJumpToDiagnostic}
                      className="underline font-bold cursor-pointer whitespace-nowrap"
                    >
                      Completar Diagnóstico ConfIA360 →
                    </button>
                  )}
                </div>
              )}

              {/* 3D Transform Wrapper */}
              <div
                style={{
                  transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
                  transformStyle: 'preserve-3d',
                  transition: isViewerHovered
                    ? 'transform 0.12s ease-out'
                    : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="relative will-change-transform space-y-3"
              >
                {/* LAYER 1 (BACK DEPTH): Volumetric Weekly Workload Comparison */}
                <div
                  style={{
                    transform: isExploded3D
                      ? 'translateZ(-62px) translateY(-10px) scale(0.94)'
                      : 'translateZ(-24px) scale(0.97)',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className={`rounded-2xl border p-4 sm:p-5 transition-colors ${
                    isDark
                      ? 'bg-[#001428] border-[#0284C7]/30 text-slate-200'
                      : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-3">
                    <span className="font-bold">01. Carga operativa semanal comparada</span>
                    <span className="font-mono tabular-nums font-bold text-emerald-500">
                      -{results.timeReductionPercent}% trabajo manual
                    </span>
                  </div>

                  {/* 3D Volumetric Extruded Comparison Bars */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                          Situación actual ({manualCommShare}% atención / {100 - manualCommShare}% gestión)
                        </span>
                        <span className="font-mono tabular-nums font-semibold">
                          {results.manualHoursWeek} h/sem
                        </span>
                      </div>
                      <div className={`relative h-3.5 w-full rounded-lg overflow-hidden shadow-inner ${isDark ? 'bg-slate-800/90' : 'bg-slate-200'}`}>
                        <div className="h-full w-full bg-gradient-to-b from-rose-400 via-rose-500 to-amber-600 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-emerald-500">
                          Con sistema conectado Asexia
                        </span>
                        <span className="font-mono tabular-nums font-bold text-emerald-500">
                          {results.remainingHoursWeek} h/sem restantes
                        </span>
                      </div>
                      <div className={`relative h-3.5 w-full rounded-lg overflow-hidden shadow-inner ${isDark ? 'bg-slate-800/90' : 'bg-slate-200'}`}>
                        <div
                          style={{ width: `${remainingWidthPercent}%` }}
                          className="h-full bg-gradient-to-b from-emerald-300 via-emerald-500 to-blue-600 rounded-lg transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_2px_8px_rgba(16,185,129,0.4)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* LAYER 2 (MID DEPTH): 12-Month Cumulative Break-Even Curve */}
                <div
                  style={{
                    transform: isExploded3D
                      ? 'translateZ(10px) scale(0.98)'
                      : 'translateZ(4px) scale(0.99)',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className={`rounded-2xl border p-4 transition-colors ${
                    isDark
                      ? 'bg-[#001833]/95 border-[#0284C7]/25 text-slate-200 shadow-lg'
                      : 'bg-white/95 border-slate-200 text-slate-800 shadow-md'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                    <span className="font-bold flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      <span>02. Retorno acumulado a 12 meses</span>
                    </span>
                    <span className="font-mono tabular-nums text-[11px] font-semibold text-sky-500">
                      Equilibrio en mes {projection12Months.breakEvenMonth} · Neto +{results.annualNetBenefit.toLocaleString('es-ES')} €
                    </span>
                  </div>

                  <div className="relative h-24 w-full">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 330 80">
                      <defs>
                        <linearGradient id="roiCumSavingsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      <line x1="0" y1="20" x2="330" y2="20" stroke={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)'} strokeDasharray="3 3" />
                      <line x1="0" y1="50" x2="330" y2="50" stroke={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)'} strokeDasharray="3 3" />

                      {/* Area under cumulative savings */}
                      <polygon
                        points={`0,76 ${projection12Months.months
                          .map((pt, i) => {
                            const x = (i / 11) * 330;
                            const y = 76 - (pt.cumulativeSavings / projection12Months.maxValue) * 68;
                            return `${x},${y}`;
                          })
                          .join(' ')} 330,76`}
                        fill="url(#roiCumSavingsGrad)"
                      />

                      {/* Cumulative Investment line */}
                      <polyline
                        points={projection12Months.months
                          .map((pt, i) => {
                            const x = (i / 11) * 330;
                            const y = 76 - (pt.cumulativeInvestment / projection12Months.maxValue) * 68;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="1.75"
                        strokeDasharray="4 4"
                      />

                      {/* Cumulative Savings line */}
                      <polyline
                        points={projection12Months.months
                          .map((pt, i) => {
                            const x = (i / 11) * 330;
                            const y = 76 - (pt.cumulativeSavings / projection12Months.maxValue) * 68;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className={`flex items-center justify-between text-[10px] font-mono tabular-nums pt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>Mes 1</span>
                    <span>Mes 4</span>
                    <span>Mes 8</span>
                    <span className="text-emerald-500 font-bold">
                      Mes 12: {results.annualTotalBenefit.toLocaleString('es-ES')} € acumulados
                    </span>
                  </div>
                </div>

                {/* LAYER 3 (FRONT DEPTH): Executive ROI & Time Savings Card with Dynamic Glare */}
                <div
                  style={{
                    transform: isExploded3D ? 'translateZ(56px) translateY(8px)' : 'translateZ(28px)',
                    boxShadow: isDark
                      ? `${-tiltY * 1.3}px ${18 + tiltX}px 48px rgba(0, 10, 30, 0.72)`
                      : `${-tiltY}px ${14 + tiltX}px 36px rgba(15, 23, 42, 0.14)`,
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
                  }}
                  className={`relative overflow-hidden rounded-3xl border p-5 sm:p-7 transition-colors ${
                    isDark
                      ? 'bg-[#001E3D] border-emerald-500/40 text-white'
                      : 'bg-white border-emerald-300 text-slate-900'
                  }`}
                >
                  {/* Dynamic Pointer Specular Light Sheen */}
                  <div
                    aria-hidden="true"
                    style={{
                      background: isDark
                        ? `radial-gradient(circle 260px at ${glarePos.x}% ${glarePos.y}%, rgba(56, 189, 248, 0.14), rgba(16, 185, 129, 0.05) 45%, transparent 72%)`
                        : `radial-gradient(circle 260px at ${glarePos.x}% ${glarePos.y}%, rgba(2, 132, 199, 0.09), rgba(16, 185, 129, 0.04) 45%, transparent 72%)`,
                    }}
                    className="pointer-events-none absolute inset-0 rounded-3xl"
                  />

                  {/* Primary Time Savings Highlight */}
                  <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-700/20">
                    <div>
                      <div className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5 mb-1">
                        <Clock className="w-4 h-4" />
                        <span>Tiempo liberado estimado</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-5xl font-black font-mono tabular-nums tracking-tight text-emerald-500">
                          {results.savedHoursWeek} h
                        </span>
                        <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          / semana
                        </span>
                      </div>
                      <div className={`text-xs mt-1 font-mono tabular-nums ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {results.savedHoursYear.toLocaleString('es-ES')} h al año · Equivale a{' '}
                        <strong className={isDark ? 'text-white' : 'text-[#001E3D]'}>
                          {workdaysSavedYear} jornadas
                        </strong>{' '}
                        completas recuperadas
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        ROI anual estimado
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-blue-500">
                        {results.roiPercent > 0 ? `+${results.roiPercent}%` : `${results.roiPercent}%`}
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-500 font-mono tabular-nums">
                        Amortización en ~{results.paybackWeeks} {results.paybackWeeks === 1 ? 'semana' : 'semanas'}
                      </div>
                    </div>
                  </div>

                  {/* Financial Metrics Breakdown (Clean 2x2 Grid with Hairline Dividers) */}
                  <div className="grid grid-cols-2 gap-4 py-5 border-b border-slate-700/20">
                    <div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Ahorro operativo / mes
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono tabular-nums mt-0.5">
                        {results.monthlyOperationalSavings.toLocaleString('es-ES')} €
                      </div>
                      <div className={`text-[11px] font-mono tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {results.savedCommHoursWeek}h atención + {results.savedAdminHoursWeek}h gestión
                      </div>
                    </div>

                    <div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Ingresos recuperados / mes
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-emerald-500 mt-0.5">
                        +{results.monthlyRecoveredRevenue.toLocaleString('es-ES')} €
                      </div>
                      <div className={`text-[11px] font-mono tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        ~{results.recoveredLeadsMonth} consultas/citas salvadas
                      </div>
                    </div>

                    <div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Impacto bruto anual
                      </div>
                      <div className="text-lg sm:text-xl font-extrabold font-mono tabular-nums text-sky-500 mt-0.5">
                        {results.annualTotalBenefit.toLocaleString('es-ES')} €/año
                      </div>
                    </div>

                    <div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Beneficio neto tras inversión
                      </div>
                      <div className="text-lg sm:text-xl font-extrabold font-mono tabular-nums text-emerald-500 mt-0.5">
                        {results.annualNetBenefit.toLocaleString('es-ES')} €/año
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Admin-Controlled Conversion CTAs */}
                  <div className="pt-5 space-y-3">
                    {enabledCtas.length > 0 ? (
                      <>
                        <div className="text-xs font-bold flex items-center justify-between gap-2">
                          <span>Siguiente paso con tu cálculo</span>
                          <span className={`text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Inversión ref. {results.estimatedMonthlyCost} €/mes
                            {inputs.applyKitDigital ? ` · Setup bonificado (${results.effectiveSetupCost} €)` : ''}
                          </span>
                        </div>

                        <div
                          className={`grid gap-2.5 ${
                            enabledCtas.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                          }`}
                        >
                          {enabledCtas.map((cta, index) => {
                            const Icon = getCtaIcon(cta.id);
                            const isPrimary =
                              cta.id === config.ctaSettings.primaryCtaId || index === 0;
                            return (
                              <button
                                key={cta.id}
                                type="button"
                                onClick={() => handleCtaClick(cta.id)}
                                title={cta.sublabel}
                                className={`px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between gap-2 cursor-pointer text-left ${
                                  isPrimary
                                    ? 'bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 sm:col-span-2'
                                    : isDark
                                    ? 'bg-[#001428] hover:bg-[#002855] text-slate-200 border border-[#0284C7]/30'
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                                }`}
                              >
                                <span className="flex items-center gap-2 min-w-0">
                                  <Icon
                                    className={`w-4 h-4 shrink-0 ${
                                      isPrimary ? 'text-white' : 'text-emerald-500'
                                    }`}
                                  />
                                  <span className="truncate">{cta.label}</span>
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
                              </button>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div
                        className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                          isDark
                            ? 'bg-[#001428] border-[#0284C7]/25 text-slate-300'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>
                          Guarda este resultado y consúltanos en el{' '}
                          <a href="tel:609735753" className="font-bold text-emerald-500 hover:underline">
                            609 735 753
                          </a>
                          .
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Strip Across Company Sizes */}
        <div className="mt-8 sm:mt-10">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
              Comparativa instantánea según tamaño de empresa ({currentSector.shortName})
            </h3>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Pulsa un bloque para activar sus pesos de ahorro en la calculadora
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {comparisonBySize.map(({ sizeId, profile, calc }) => {
              const isCurrent = inputs.companySizeId === sizeId;
              return (
                <button
                  key={sizeId}
                  type="button"
                  onClick={() => handleSelectCompanySize(sizeId)}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    isCurrent
                      ? isDark
                        ? 'bg-[#001E3D] border-emerald-500/50 text-white shadow-lg'
                        : 'bg-white border-emerald-400 text-slate-900 shadow-md'
                      : isDark
                      ? 'bg-[#001428]/80 border-[#0284C7]/20 text-slate-300 hover:border-[#0284C7]/45'
                      : 'bg-white/80 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-extrabold text-sm">{profile.label}</span>
                    <span className="text-[11px] font-mono tabular-nums text-emerald-500 font-semibold">
                      {profile.headcountRange}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono tabular-nums">
                    <div>
                      <div className={`font-sans text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Beneficio neto/año
                      </div>
                      <div className="font-black text-base text-emerald-500">
                        {calc.annualNetBenefit.toLocaleString('es-ES')} €
                      </div>
                    </div>
                    <div>
                      <div className={`font-sans text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Horas liberadas
                      </div>
                      <div className="font-bold text-base">
                        {calc.savedHoursYear.toLocaleString('es-ES')} h/año
                      </div>
                    </div>
                  </div>

                  <div className={`mt-2.5 pt-2 border-t text-[11px] font-mono tabular-nums flex items-center justify-between ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                  }`}>
                    <span>ROI {calc.roiPercent}%</span>
                    <span>Amortización ~{calc.paybackWeeks} sem</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        {/* Cross-Link Strip to ConfIA360 Diagnostic */}
        {onJumpToDiagnostic && (
          <div
            className={`mt-6 rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDark
                ? 'bg-[#001428] border-[#0284C7]/30 text-white'
                : 'bg-white border-slate-200 text-slate-900 shadow-sm'
            }`}
          >
            <div className="space-y-1">
              <div className="text-xs font-extrabold uppercase tracking-wider text-sky-500 flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>Siguiente nivel · Diagnóstico Inteligente ConfIA360</span>
              </div>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Lleva estos resultados económicos al evaluador de 10 áreas para obtener tu índice de madurez
                digital, DAFO, hoja de ruta 30/90/180 días y entregable completo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => initiateRoiSaveOrDownload('diagnostic')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-500 hover:from-sky-500 hover:to-emerald-400 text-white text-xs font-extrabold flex items-center gap-2 shrink-0 shadow-md cursor-pointer"
            >
              <span>Continuar con Diagnóstico ConfIA360</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 6-Field Business Profile Capture Modal for ROI Persistence */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-3xl border p-5 sm:p-6 shadow-2xl space-y-4 ${
              isDark
                ? 'bg-[#001428] border-[#0284C7]/35 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                  Ficha de Empresa ConfIA360
                </div>
                <h3 className="text-lg font-black mt-0.5">
                  Guarda tu simulación de ROI ({results.annualNetBenefit.toLocaleString('es-ES')} €/año)
                </h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Introduce los 6 datos básicos para conservar tu cálculo en el CRM y generar tu informe.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLeadModalOpen(false)}
                className={`p-1.5 rounded-lg border cursor-pointer ${
                  isDark ? 'border-slate-700 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  !modalDraft.name.trim() ||
                  !modalDraft.companyName.trim() ||
                  !modalDraft.postalCode.trim() ||
                  !modalDraft.phone.trim() ||
                  !modalDraft.email.trim()
                ) {
                  setCrmErrorNotice('Por favor, completa todos los campos obligatorios.');
                  return;
                }
                const ok = await saveRoiSimulationToCrm(modalDraft, pendingActionAfterCapture);
                if (ok) setIsLeadModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Nombre *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Barrena"
                      value={modalDraft.name}
                      onChange={(e) => setModalDraft({ ...modalDraft, name: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border ${
                        isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1">Empresa *</label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Mesón Los Olivos"
                      value={modalDraft.companyName}
                      onChange={(e) => setModalDraft({ ...modalDraft, companyName: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border ${
                        isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1">Sector *</label>
                  <select
                    value={modalDraft.sectorId}
                    onChange={(e) =>
                      setModalDraft({ ...modalDraft, sectorId: e.target.value as RoiSectorId })
                    }
                    className={`w-full px-3 py-2 rounded-xl border ${
                      isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    {SECTOR_ORDER.map((sid) => (
                      <option key={sid} value={sid}>
                        {config.sectors[sid].name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Código postal *</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="28901"
                      value={modalDraft.postalCode}
                      onChange={(e) => setModalDraft({ ...modalDraft, postalCode: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border font-mono ${
                        isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1">Teléfono *</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="609 735 753"
                      value={modalDraft.phone}
                      onChange={(e) => setModalDraft({ ...modalDraft, phone: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border ${
                        isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="contacto@empresa.es"
                      value={modalDraft.email}
                      onChange={(e) => setModalDraft({ ...modalDraft, email: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border ${
                        isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {crmErrorNotice && (
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{crmErrorNotice}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className={`px-4 py-2 rounded-xl border font-semibold cursor-pointer ${
                    isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingToCrm}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>
                    {isSavingToCrm
                      ? 'Guardando...'
                      : pendingActionAfterCapture === 'download'
                      ? 'Guardar y Descargar'
                      : pendingActionAfterCapture === 'diagnostic'
                      ? 'Guardar e ir a Diagnóstico'
                      : 'Guardar en CRM'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
