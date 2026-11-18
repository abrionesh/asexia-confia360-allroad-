import React, { useState, useEffect, useMemo } from 'react';
import {
  Stethoscope,
  Utensils,
  Building2,
  ShoppingBag,
  Home,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileText,
  Download,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Layers,
  Award,
  ArrowRight,
  Lock,
  Unlock,
  Compass,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Share2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  RoiConfig,
  RoiSectorId,
  CompanySizeId,
  RoiUserInputs,
  RoiCalculationResult,
  SECTOR_ORDER,
  COMPANY_SIZE_ORDER,
} from '../types/roi';
import {
  DiagnosticTier,
  LeadProfile,
  CrmClient,
  CrmOpportunity,
  SECTOR_DIAGNOSTIC_TEMPLATES,
  CONFIA360_SERVICES,
  ACTING_PRINCIPLES,
  TIER_LABELS,
  createDefaultAreaScores,
  buildDiagnosticEvaluation,
} from '../types/confia360';
import {
  buildClientShareMessage,
  buildDeliverablePlainText,
  downloadDeliverableHtml,
  downloadDeliverableTxt,
} from '../utils/deliverables';

interface ConfIA360DiagnosticSectionProps {
  roiConfig: RoiConfig;
  leadProfile: LeadProfile;
  onLeadProfileChange: (next: LeadProfile) => void;
  fromCaptaGlobal?: boolean;
  linkedRoiSnapshot?: {
    inputs: RoiUserInputs;
    results: RoiCalculationResult;
  } | null;
  onCrmSaved?: () => void;
  onOpenBookingWithDiagnostic: (summary: {
    plan: string;
    sector: string;
    notes: string;
  }) => void;
}

const SECTOR_ICONS: Record<RoiSectorId, React.ComponentType<{ className?: string }>> = {
  clinicas: Stethoscope,
  restauracion: Utensils,
  servicios: Building2,
  comercios: ShoppingBag,
  inmobiliarias: Home,
};

const PRO_AUDIT_CHECKS = [
  {
    key: 'cumplimiento-rgpd',
    label: 'RGPD y consentimientos verificados en captación / WhatsApp',
  },
  {
    key: 'firma-digital',
    label: 'Firma digital para presupuestos, encargos o consentimientos',
  },
  {
    key: 'factura-electronica',
    label: 'Preparación técnica para facturación electrónica (VeriFactu)',
  },
  {
    key: 'control-horario',
    label: 'Registro de jornada y copias de seguridad automáticas',
  },
];

const VIP_GOAL_OPTIONS = [
  'Escalar captación y automatización con retorno medible en 90 días',
  'Reducir al mínimo las llamadas perdidas y ausencias (no-shows)',
  'Ordenar cumplimiento normativo, firma digital y facturación electrónica',
  'Acelerar crecimiento comercial con Google Maps 5★ y reactivación WhatsApp',
];

export const ConfIA360DiagnosticSection: React.FC<ConfIA360DiagnosticSectionProps> = ({
  roiConfig,
  leadProfile,
  onLeadProfileChange,
  fromCaptaGlobal = false,
  linkedRoiSnapshot,
  onCrmSaved,
  onOpenBookingWithDiagnostic,
}) => {
  const { isDark } = useTheme();

  const activeSectorId: RoiSectorId = leadProfile.sectorId || 'clinicas';
  const activeSizeId: CompanySizeId = leadProfile.companySizeId || 'micro';
  const template =
    SECTOR_DIAGNOSTIC_TEMPLATES[activeSectorId] || SECTOR_DIAGNOSTIC_TEMPLATES.clinicas;
  const sectorMeta = roiConfig.sectors[activeSectorId] || roiConfig.sectors.clinicas;

  const [tier, setTier] = useState<DiagnosticTier>('base');
  const [areaScoresBySector, setAreaScoresBySector] = useState<
    Partial<Record<RoiSectorId, Record<string, number>>>
  >({});
  const [proChecklistKeys, setProChecklistKeys] = useState<string[]>(['cumplimiento-rgpd']);
  const [vipFocusGoal, setVipFocusGoal] = useState<string>(VIP_GOAL_OPTIONS[0]);

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [savedClient, setSavedClient] = useState<CrmClient | null>(null);
  const [savedOpportunity, setSavedOpportunity] = useState<CrmOpportunity | null>(null);

  const currentAreaScores = useMemo(() => {
    return areaScoresBySector[activeSectorId] || createDefaultAreaScores(activeSectorId);
  }, [areaScoresBySector, activeSectorId]);

  const diagnosticEval = useMemo(
    () =>
      buildDiagnosticEvaluation({
        sectorId: activeSectorId,
        companySizeId: activeSizeId,
        tier,
        areaScores: currentAreaScores,
        proChecklistKeys,
        vipFocusGoal,
        roiResult: linkedRoiSnapshot?.results || null,
      }),
    [
      activeSectorId,
      activeSizeId,
      tier,
      currentAreaScores,
      proChecklistKeys,
      vipFocusGoal,
      linkedRoiSnapshot,
    ]
  );

  // Check if the 6 required client identification fields are filled
  const isProfileComplete = Boolean(
    leadProfile.name.trim() &&
      leadProfile.companyName.trim() &&
      leadProfile.postalCode.trim() &&
      leadProfile.phone.trim() &&
      leadProfile.email.trim()
  );

  useEffect(() => {
    setFormError(null);
  }, [
    leadProfile.name,
    leadProfile.companyName,
    leadProfile.postalCode,
    leadProfile.phone,
    leadProfile.email,
  ]);

  const handleSectorChange = (sectorId: RoiSectorId) => {
    onLeadProfileChange({
      ...leadProfile,
      sectorId,
    });
  };

  const handleAreaScoreChange = (areaKey: string, value: number) => {
    setAreaScoresBySector((prev) => ({
      ...prev,
      [activeSectorId]: {
        ...(prev[activeSectorId] || createDefaultAreaScores(activeSectorId)),
        [areaKey]: value,
      },
    }));
  };

  const toggleProChecklist = (key: string) => {
    setProChecklistKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const persistDiagnosticToCrm = async (deliverableMeta?: {
    type: 'dossier-html' | 'informe-txt' | 'paquete-json';
    channel: 'descarga' | 'email' | 'whatsapp' | 'crm';
    summary: string;
  }): Promise<{ client: CrmClient; opportunity: CrmOpportunity } | null> => {
    if (!isProfileComplete) {
      setFormError(
        'Completa los 6 campos de tu empresa (nombre, empresa, sector, código postal, teléfono y email) para guardar el diagnóstico y generar tus entregables.'
      );
      return null;
    }

    setIsSaving(true);
    setFormError(null);
    setSaveSuccessMsg(null);

    try {
      const res = await fetch('/api/crm/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadProfile.name.trim(),
          companyName: leadProfile.companyName.trim(),
          sectorId: activeSectorId,
          sectorLabel: sectorMeta.name,
          companySizeId: activeSizeId,
          postalCode: leadProfile.postalCode.trim(),
          phone: leadProfile.phone.trim(),
          email: leadProfile.email.trim(),
          source: fromCaptaGlobal ? 'captaglobal' : 'diagnostico-confia360',
          opportunityId: savedOpportunity?.id,
          diagnosticTier: tier,
          roiInputs: linkedRoiSnapshot?.inputs,
          areaScores: currentAreaScores,
          proChecklistKeys,
          vipFocusGoal,
          deliverable: deliverableMeta
            ? {
                type: deliverableMeta.type,
                tier,
                channel: deliverableMeta.channel,
                recipient: leadProfile.email.trim(),
                summary: deliverableMeta.summary,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data?.error || 'No se pudo guardar el diagnóstico en el CRM.');
        return null;
      }

      setSavedClient(data.client);
      setSavedOpportunity(data.opportunity);
      setSaveSuccessMsg(
        `Diagnóstico ${TIER_LABELS[tier]} (${diagnosticEval.maturityScore}/100) guardado en CRM ConfIA360${
          data.autoSyncEnabled ? ' y enlazado automáticamente con CaptaGlobal.' : '.'
        }`
      );
      onCrmSaved?.();
      return { client: data.client, opportunity: data.opportunity };
    } catch {
      setFormError('Error de conexión al guardar en el CRM ConfIA360.');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadHtmlDossier = async () => {
    const saved = await persistDiagnosticToCrm({
      type: 'dossier-html',
      channel: 'descarga',
      summary: `Dossier ${TIER_LABELS[tier]} descargado (${diagnosticEval.maturityScore}/100)`,
    });
    if (!saved) return;
    downloadDeliverableHtml({
      client: saved.client,
      opportunity: saved.opportunity,
      diagnostic: saved.opportunity.diagnosticResult || diagnosticEval,
      roiResults: saved.opportunity.roiSimulation?.results || linkedRoiSnapshot?.results,
    });
  };

  const handleDownloadTxtDossier = async () => {
    const saved = await persistDiagnosticToCrm({
      type: 'informe-txt',
      channel: 'descarga',
      summary: `Resumen ejecutivo TXT ${TIER_LABELS[tier]} descargado`,
    });
    if (!saved) return;
    downloadDeliverableTxt({
      client: saved.client,
      opportunity: saved.opportunity,
      diagnostic: saved.opportunity.diagnosticResult || diagnosticEval,
      roiInputs: saved.opportunity.roiSimulation?.inputs || linkedRoiSnapshot?.inputs,
      roiResults: saved.opportunity.roiSimulation?.results || linkedRoiSnapshot?.results,
    });
  };

  const handleShareDiagnosticChannel = async (channel: 'whatsapp' | 'email') => {
    const saved = await persistDiagnosticToCrm({
      type: 'informe-txt',
      channel,
      summary: `Diagnóstico ${TIER_LABELS[tier]} enviado vía ${channel.toUpperCase()} (${diagnosticEval.maturityScore}/100)`,
    });
    if (!saved) return;
    if (channel === 'whatsapp') {
      const msg = buildClientShareMessage(saved.client, saved.opportunity);
      const digits = saved.client.phone.replace(/\D/g, '') || '609735753';
      const waPhone = digits.startsWith('34') && digits.length >= 11 ? digits : `34${digits}`;
      const targetUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
      const link = document.createElement('a');
      link.href = targetUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    } else {
      const subject = `Estudio ConfIA360 ${TIER_LABELS[tier]} — ${saved.client.companyName}`;
      const body = buildDeliverablePlainText({
        client: saved.client,
        opportunity: saved.opportunity,
        diagnostic: saved.opportunity.diagnosticResult || diagnosticEval,
        roiResults: saved.opportunity.roiSimulation?.results || linkedRoiSnapshot?.results,
      }).slice(0, 1500);
      window.location.href = `mailto:${encodeURIComponent(
        saved.client.email
      )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  const handleBookFromDiagnostic = async () => {
    if (isProfileComplete) {
      await persistDiagnosticToCrm();
    }
    const topPriority = diagnosticEval.prioritizedActions[0]?.title || 'Áreas operativas';
    onOpenBookingWithDiagnostic({
      plan: `ConfIA360 ${TIER_LABELS[tier]} (${sectorMeta.shortName})`,
      sector: sectorMeta.bookingSectorValue,
      notes: `Empresa: ${leadProfile.companyName || 'Pendiente'} · CP: ${
        leadProfile.postalCode || 'N/D'
      } · Madurez Digital ${diagnosticEval.maturityScore}/100 (${
        diagnosticEval.maturityLevel
      }) · Prioridad #1: ${topPriority}${
        linkedRoiSnapshot
          ? ` · ROI est.: +${linkedRoiSnapshot.results.annualNetBenefit.toLocaleString('es-ES')} €/año`
          : ''
      }`,
    });
  };

  const prioritizedServiceIds = new Set(diagnosticEval.recommendedServices.map((s) => s.id));

  return (
    <section
      id="diagnostico-confia360"
      className={`scroll-mt-24 py-14 sm:py-20 border-t transition-colors duration-300 ${
        isDark ? 'bg-[#001428] border-[#0284C7]/20' : 'bg-white border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-sky-500">
            <Compass className="w-4 h-4" />
            <span>AsExiA | ConfIA360 Multisector</span>
            <span aria-hidden="true">·</span>
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Estrategia MUNDOConfIA</span>
          </div>

          <h2
            style={{ textWrap: 'balance' }}
            className={`text-2xl sm:text-4xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-[#001E3D]'
            }`}
          >
            Diagnóstico Inteligente ConfIA360 adaptado a tu sector.
          </h2>

          <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Analizamos las <strong>10 áreas clave</strong> de tu negocio de forma incremental (
            <strong>Base</strong>, <strong>Pro</strong> y <strong>VIP</strong>) para obtener tu índice de
            madurez digital, mapa de ineficiencias, DAFO, hoja de ruta 30/90/180 días y entregables conectados
            con tu ROI.
          </p>
        </div>

        {/* Multisector Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {SECTOR_ORDER.map((sid) => {
            const Icon = SECTOR_ICONS[sid];
            const sec = roiConfig.sectors[sid];
            const isSelected = activeSectorId === sid;
            return (
              <button
                key={sid}
                type="button"
                onClick={() => handleSectorChange(sid)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-600 to-emerald-500 text-white border-transparent shadow-md shadow-sky-500/20'
                    : isDark
                    ? 'bg-[#001E3D] text-slate-300 border-[#0284C7]/25 hover:text-white hover:bg-[#002855]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{sec?.shortName || sid}</span>
              </button>
            );
          })}
        </div>

        {/* Branded Sector Banner ("Promotor AsExiA · Estrategia MUNDOConfIA · ¿A quién nos dirigimos?") */}
        <div
          className={`rounded-3xl border p-5 sm:p-7 transition-colors ${
            isDark
              ? 'bg-[#001E3D] border-[#0284C7]/30 text-white'
              : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-emerald-500">
                <span>{template.brandTitle}</span>
                <span aria-hidden="true">·</span>
                <span className={isDark ? 'text-sky-400' : 'text-blue-700'}>{template.heroTagline}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                {template.headline}
              </h3>

              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                «{template.targetDescription}». No vendemos tecnología por tecnología: generamos resultados
                medibles combinando consultoría estratégica, digitalización, IA aplicada, cumplimiento y
                acompañamiento al equipo.
              </p>

              {/* 5-step Methodology Strip */}
              <div className={`pt-3 border-t flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] ${isDark ? 'border-slate-700/60 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                <span className="font-bold text-emerald-500">Metodología:</span>
                <span>1. Descubrir</span>
                <span>2. Evaluar</span>
                <span>3. Priorizar</span>
                <span>4. Implantar</span>
                <span>5. Medir ROI</span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className={`text-xs font-extrabold uppercase tracking-wider mb-2.5 ${isDark ? 'text-sky-400' : 'text-blue-800'}`}>
                ¿A quién nos dirigimos en este sector?
              </div>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-1 gap-1.5 text-xs">
                {template.targetAudienceList.map((aud, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>{aud}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Native ConfIA360 + CaptaGlobal Connected Ecosystem Strip */}
        <div
          className={`rounded-2xl border p-4 transition-colors ${
            isDark
              ? 'bg-[#001833]/90 border-[#0284C7]/30 text-slate-200'
              : 'bg-sky-50/70 border-sky-200 text-slate-800'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-black text-emerald-500 inline-flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                <span>Ecosistema Conectado ConfIA360:</span>
              </span>
              <span className="font-bold">1. CaptaGlobal (Captación)</span>
              <span aria-hidden="true" className="text-sky-500">→</span>
              <span className="font-bold">2. Diagnóstico 10 Áreas</span>
              <span aria-hidden="true" className="text-sky-500">→</span>
              <span className="font-bold">3. Calculadora ROI</span>
              <span aria-hidden="true" className="text-sky-500">→</span>
              <span className="font-bold">4. CRM 360º Automático</span>
            </div>

            <a
              href="https://asexia-confia360-captaglobal.grok.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-sky-500 hover:text-emerald-500 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>Módulo ConfIA360 CaptaGlobal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {fromCaptaGlobal && (
            <div className="mt-2.5 pt-2.5 border-t border-emerald-500/25 text-xs text-emerald-500 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Datos precargados automáticamente desde ConfIA360 CaptaGlobal para{' '}
                <strong>{leadProfile.companyName || leadProfile.name || 'tu empresa'}</strong>. Completa tus
                puntuaciones y descarga tu dossier al instante.
              </span>
            </div>
          )}
        </div>

        {/* Step 1: Unified 6-Field Business Profile & CRM Registration */}
        <div
          className={`rounded-3xl border p-5 sm:p-7 transition-colors ${
            isDark
              ? 'bg-[#001833] border-[#0284C7]/30 text-white'
              : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-700/20">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                <span>Paso 1 · Ficha de Identificación en CRM ConfIA360</span>
                {savedOpportunity && (
                  <span className="inline-flex items-center gap-1 text-emerald-500 font-bold normal-case">
                    <Unlock className="w-3.5 h-3.5" />
                    Guardada (#{savedOpportunity.id})
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Introduce los datos de tu empresa para vincular tu ROI, generar el diagnóstico y conservar los
                entregables en nuestro CRM unificado.
              </p>
            </div>

            {linkedRoiSnapshot && (
              <div className="text-left sm:text-right font-mono tabular-nums text-xs shrink-0">
                <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>ROI vinculado en vivo</div>
                <div className="font-black text-emerald-500">
                  +{linkedRoiSnapshot.results.annualNetBenefit.toLocaleString('es-ES')} €/año (
                  {linkedRoiSnapshot.results.savedHoursWeek} h/sem)
                </div>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold mb-1">
                Nombre de contacto <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ej. Dra. Elena Valdés"
                  value={leadProfile.name}
                  onChange={(e) => onLeadProfileChange({ ...leadProfile, name: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border outline-none transition ${
                    isDark
                      ? 'bg-[#001428] border-[#0284C7]/30 text-white focus:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">
                Empresa o clínica <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ej. Clínica Dental Valdés"
                  value={leadProfile.companyName}
                  onChange={(e) => onLeadProfileChange({ ...leadProfile, companyName: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border outline-none transition ${
                    isDark
                      ? 'bg-[#001428] border-[#0284C7]/30 text-white focus:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">
                Sector y tamaño <span className="text-emerald-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={activeSectorId}
                  onChange={(e) => handleSectorChange(e.target.value as RoiSectorId)}
                  className={`w-full px-2.5 py-2.5 rounded-xl border outline-none cursor-pointer ${
                    isDark
                      ? 'bg-[#001428] border-[#0284C7]/30 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  {SECTOR_ORDER.map((sid) => (
                    <option key={sid} value={sid}>
                      {roiConfig.sectors[sid].shortName}
                    </option>
                  ))}
                </select>
                <select
                  value={activeSizeId}
                  onChange={(e) =>
                    onLeadProfileChange({ ...leadProfile, companySizeId: e.target.value as CompanySizeId })
                  }
                  className={`w-full px-2.5 py-2.5 rounded-xl border outline-none cursor-pointer ${
                    isDark
                      ? 'bg-[#001428] border-[#0284C7]/30 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  {COMPANY_SIZE_ORDER.map((sz) => (
                    <option key={sz} value={sz}>
                      {roiConfig.companySizes[sz].shortLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">
                Código postal <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  maxLength={10}
                  placeholder="Ej. 28901"
                  value={leadProfile.postalCode}
                  onChange={(e) => onLeadProfileChange({ ...leadProfile, postalCode: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border font-mono tabular-nums outline-none transition ${
                    isDark
                      ? 'bg-[#001428] border-[#0284C7]/30 text-white focus:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">
                Teléfono / WhatsApp <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="Ej. 609 735 753"
                  value={leadProfile.phone}
                  onChange={(e) => onLeadProfileChange({ ...leadProfile, phone: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border outline-none transition ${
                    isDark
                      ? 'bg-[#001428] border-[#0284C7]/30 text-white focus:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">
                Correo electrónico <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="contacto@tuempresa.es"
                  value={leadProfile.email}
                  onChange={(e) => onLeadProfileChange({ ...leadProfile, email: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border outline-none transition ${
                    isDark
                      ? 'bg-[#001428] border-[#0284C7]/30 text-white focus:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {formError && (
            <div className="mt-4 p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-500 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {saveSuccessMsg && (
            <div className="mt-4 p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span className={`text-[11px] flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isProfileComplete ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ficha completa · lista para guardar y generar entregables ConfIA360.</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Puedes simular las 10 áreas abajo y completar los 6 datos al descargar o guardar.</span>
                </>
              )}
            </span>

            <button
              type="button"
              onClick={() => persistDiagnosticToCrm()}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSaving ? 'Guardando en CRM...' : 'Guardar ficha y diagnóstico en CRM'}</span>
            </button>
          </div>
        </div>

        {/* Incremental Tier Selector (Base -> Pro -> VIP) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className={`text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-[#001E3D]'}`}>
              Profundidad del Diagnóstico ConfIA360
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Avanza de forma incremental: empieza por las 10 áreas (Base), añade DAFO + Hoja de Ruta (Pro)
              y completa KPIs + Catálogo ConfIA360 (VIP).
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Nivel incremental de diagnóstico"
            className={`grid grid-cols-3 gap-1.5 p-1 rounded-2xl border shrink-0 ${
              isDark ? 'bg-[#001833] border-[#0284C7]/25' : 'bg-slate-100 border-slate-200'
            }`}
          >
            {(['base', 'pro', 'vip'] as DiagnosticTier[]).map((t) => {
              const isSelected = tier === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setTier(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-sm'
                      : isDark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Nivel {TIER_LABELS[t]}
                </button>
              );
            })}
          </div>
        </div>

        {/* TIER BASE WORKSPACE: 10 Areas + Maturity + Inefficiency Map + Priorities */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left: 10 Key Areas Interactive Sliders */}
          <div
            className={`lg:col-span-7 rounded-3xl border p-5 sm:p-6 space-y-4 ${
              isDark
                ? 'bg-[#001E3D] border-[#0284C7]/25 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-700/20">
              <div>
                <h4 className="font-extrabold text-sm sm:text-base">
                  Evaluación de las 10 Áreas Clave ({sectorMeta.shortName})
                </h4>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Puntúa del 1 (muy manual / crítico) al 10 (automatizado y medible)
                </p>
              </div>
              <span className="font-mono tabular-nums text-xs font-bold text-emerald-500 whitespace-nowrap">
                Media {Math.round(diagnosticEval.maturityScore / 10 * 10) / 10}/10
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {template.areas.map((area) => {
                const score = currentAreaScores[area.key] ?? 4;
                const scoreColor =
                  score <= 3
                    ? 'text-rose-500'
                    : score <= 6
                    ? 'text-amber-500'
                    : 'text-emerald-500';
                return (
                  <div
                    key={area.key}
                    className={`p-3.5 rounded-2xl border space-y-2 ${
                      isDark ? 'bg-[#001428] border-[#0284C7]/20' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <span className="font-bold leading-snug">
                        <span className="text-sky-500 font-mono mr-1">{area.areaNumber}.</span>
                        {area.title}
                      </span>
                      <span className={`font-mono tabular-nums font-black shrink-0 ${scoreColor}`}>
                        {score}/10
                      </span>
                    </div>

                    <p className={`text-[11px] leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {area.question}
                    </p>

                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={score}
                      onChange={(e) => handleAreaScoreChange(area.key, Number(e.target.value))}
                      className="w-full h-2 rounded-lg accent-emerald-500 cursor-pointer"
                    />

                    <div className={`text-[10px] leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {score <= 5 ? area.lowScoreHint : area.highScoreHint}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Live Base Results (Maturity Gauge, Inefficiency Map, Prioritized Actions, Linked ROI) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Maturity Index Card */}
            <div
              className={`rounded-3xl border p-5 sm:p-6 space-y-4 ${
                isDark
                  ? 'bg-[#001E3D] border-emerald-500/35 text-white'
                  : 'bg-white border-emerald-300 text-slate-900 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    Entregable Base · Madurez Digital
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black font-mono tabular-nums text-emerald-500">
                      {diagnosticEval.maturityScore}
                    </span>
                    <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      / 100
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Nivel actual
                  </div>
                  <div className="text-base font-black text-sky-500">
                    {diagnosticEval.maturityLevel}
                  </div>
                </div>
              </div>

              <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-[#001428]' : 'bg-slate-200'}`}>
                <div
                  style={{ width: `${diagnosticEval.maturityScore}%` }}
                  className="h-full bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-500 transition-all duration-300"
                />
              </div>

              {/* Top Inefficiencies */}
              <div className="pt-3 border-t border-slate-700/20 space-y-2.5">
                <div className="text-xs font-extrabold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mapa de Ineficiencias y Pérdidas Detectadas</span>
                </div>
                <div className="space-y-2">
                  {diagnosticEval.inefficiencyMap.slice(0, 4).map((item) => (
                    <div
                      key={item.areaNumber}
                      className={`p-2.5 rounded-xl border text-xs ${
                        isDark ? 'bg-[#001428] border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 font-bold">
                        <span className="truncate">
                          {item.areaNumber}. {item.title}
                        </span>
                        <span className="font-mono tabular-nums text-amber-500 shrink-0">
                          {item.score}/10
                        </span>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {item.issue}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prioritized Actions */}
              <div className="pt-3 border-t border-slate-700/20 space-y-2">
                <div className="text-xs font-extrabold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Priorización de Acciones</span>
                </div>
                <div className="space-y-2">
                  {diagnosticEval.prioritizedActions.slice(0, 3).map((act, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start justify-between gap-2 text-xs pb-2 border-b last:border-b-0 last:pb-0 ${
                        isDark ? 'border-slate-800' : 'border-slate-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold">
                          <span className="text-emerald-500 mr-1.5">[{act.priority}]</span>
                          {act.title}
                        </div>
                        <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Módulo: <strong>{act.serviceName}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick upgrade CTA when in Base */}
              {tier === 'base' && (
                <button
                  type="button"
                  onClick={() => setTier('pro')}
                  className="w-full py-2.5 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>Ampliar a Nivel Pro (DAFO + Riesgos + Hoja de Ruta 30/90/180d)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TIER PRO WORKSPACE: Compliance Audit + DAFO + Risks + AI Opportunities + 30/90/180 Roadmap */}
        {(tier === 'pro' || tier === 'vip') && (
          <div
            className={`rounded-3xl border p-5 sm:p-7 space-y-6 ${
              isDark
                ? 'bg-[#001833] border-sky-500/35 text-white'
                : 'bg-slate-50 border-sky-300 text-slate-900'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700/20">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-sky-500">
                  Nivel Pro Desbloqueado · Estrategia y Cumplimiento
                </div>
                <h4 className="text-lg font-black mt-0.5">
                  Auditoría Rápida, DAFO Estratégico, Riesgos IA y Hoja de Ruta 30 / 90 / 180 Días
                </h4>
              </div>
              {tier === 'pro' && (
                <button
                  type="button"
                  onClick={() => setTier('vip')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Desbloquear Nivel VIP (KPIs + Catálogo ConfIA360)</span>
                </button>
              )}
            </div>

            {/* Pro Compliance Checklist */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Marca los controles ya implantados en tu empresa (ajusta tu hoja de ruta):</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {PRO_AUDIT_CHECKS.map((chk) => {
                  const checked = proChecklistKeys.includes(chk.key);
                  return (
                    <label
                      key={chk.key}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition ${
                        checked
                          ? isDark
                            ? 'bg-[#002855] border-emerald-500/50 text-white'
                            : 'bg-emerald-50 border-emerald-400 text-slate-900'
                          : isDark
                          ? 'bg-[#001428] border-[#0284C7]/20 text-slate-300'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleProChecklist(chk.key)}
                        className="mt-0.5 w-4 h-4 accent-emerald-500 cursor-pointer shrink-0"
                      />
                      <span>{chk.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Dynamic DAFO + Risks & AI Opportunities */}
            <div className="grid lg:grid-cols-2 gap-5">
              {/* 4-Quadrant DAFO */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#001428] border-[#0284C7]/25' : 'bg-white border-slate-200'
                }`}
              >
                <div className="font-extrabold text-sm">DAFO Estratégico Personalizado</div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-emerald-500">Fortalezas</div>
                    <ul className={`space-y-1 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {diagnosticEval.dafo.strengths.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-rose-500">Debilidades</div>
                    <ul className={`space-y-1 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {diagnosticEval.dafo.weaknesses.map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-sky-500">Oportunidades</div>
                    <ul className={`space-y-1 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {diagnosticEval.dafo.opportunities.map((o, i) => (
                        <li key={i}>• {o}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-amber-500">Amenazas</div>
                    <ul className={`space-y-1 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {diagnosticEval.dafo.threats.map((t, i) => (
                        <li key={i}>• {t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sector Risks & AI Opportunities */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
                  isDark ? 'bg-[#001428] border-[#0284C7]/25' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="font-extrabold text-sm text-amber-500 mb-1.5">
                    Riesgos Tecnológicos y Normativos
                  </div>
                  <ul className={`space-y-1.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {diagnosticEval.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-700/20">
                  <div className="font-extrabold text-sm text-sky-500 mb-1.5">
                    Identificación de Oportunidades de IA
                  </div>
                  <ul className={`space-y-1.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {diagnosticEval.aiOpportunities.map((ai, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{ai}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 30 / 90 / 180-Day Roadmap */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Primeros 30 días · Impacto inmediato', items: diagnosticEval.roadmap.days30, accent: 'text-emerald-500' },
                { label: 'Días 31 a 90 · Automatización y CRM', items: diagnosticEval.roadmap.days90, accent: 'text-sky-500' },
                { label: 'Días 91 a 180 · Escalado y ROI', items: diagnosticEval.roadmap.days180, accent: 'text-blue-500' },
              ].map((phase, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isDark ? 'bg-[#001428] border-[#0284C7]/25' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className={`text-xs font-extrabold ${phase.accent}`}>{phase.label}</div>
                  <ul className={`space-y-1.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {phase.items.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${phase.accent}`} />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIER VIP WORKSPACE: 9 KPIs + ConfIA360 6 Services + 7 Principles */}
        {tier === 'vip' && (
          <div
            className={`rounded-3xl border p-5 sm:p-7 space-y-6 ${
              isDark
                ? 'bg-[#001E3D] border-emerald-500/40 text-white'
                : 'bg-white border-emerald-400 text-slate-900 shadow-lg'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/20">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                  Nivel VIP Ejecutivo · Plan Completo AsExiA | ConfIA360
                </div>
                <h4 className="text-lg font-black mt-0.5">
                  Indicadores de Éxito Proyectados, Catálogo ConfIA360 y Principios de Actuación
                </h4>
              </div>

              <div className="min-w-[240px]">
                <label className="block text-[11px] font-bold mb-1">Objetivo estratégico prioritario</label>
                <select
                  value={vipFocusGoal}
                  onChange={(e) => setVipFocusGoal(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none cursor-pointer ${
                    isDark
                      ? 'bg-[#001428] border-[#0284C7]/30 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  {VIP_GOAL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              {/* 9 Success KPIs */}
              <div className="lg:col-span-6 space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-sky-500">
                  9 Indicadores de Éxito Proyectados
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {diagnosticEval.successKpis.map((kpi, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs ${
                        isDark ? 'bg-[#001428] border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {kpi.label}
                      </div>
                      <div className="font-black font-mono tabular-nums text-emerald-500 mt-0.5">
                        {kpi.projectedTarget}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ConfIA360 6 Services Catalog + 7 Acting Principles */}
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 mb-2.5">
                    Catálogo de Servicios ConfIA360
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {CONFIA360_SERVICES.map((svc) => {
                      const isRecommended = prioritizedServiceIds.has(svc.id);
                      return (
                        <div
                          key={svc.id}
                          className={`p-3 rounded-xl border text-xs ${
                            isRecommended
                              ? isDark
                                ? 'bg-[#002855] border-emerald-500/50'
                                : 'bg-emerald-50/70 border-emerald-400'
                              : isDark
                              ? 'bg-[#001428] border-[#0284C7]/20 opacity-85'
                              : 'bg-slate-50 border-slate-200 opacity-90'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold">{svc.name}</span>
                            {isRecommended && (
                              <span className="text-[10px] font-bold text-emerald-500">Prioritario</span>
                            )}
                          </div>
                          <div className="text-[11px] font-semibold text-sky-500 mt-0.5">
                            {svc.subtitle}
                          </div>
                          <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {svc.description}
                          </p>
                          {svc.externalUrl && (
                            <a
                              href={svc.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-emerald-500 hover:underline"
                            >
                              <span>Abrir CaptaGlobal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 7 Principios de Actuación */}
                <div
                  className={`p-3.5 rounded-2xl border text-xs ${
                    isDark ? 'bg-[#001428] border-[#0284C7]/25' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="font-extrabold mb-1.5 text-emerald-500">
                    Principios de Actuación AsExiA | ConfIA360
                  </div>
                  <div className={`flex flex-wrap gap-x-3 gap-y-1 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {ACTING_PRINCIPLES.map((pr, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{pr}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deliverables & Closing Action Bar */}
        <div
          className={`rounded-3xl border p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
            isDark
              ? 'bg-[#001E3D] border-[#0284C7]/30 text-white'
              : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div className="space-y-1">
            <div className="text-sm font-black flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Entregables del Diagnóstico (Nivel {TIER_LABELS[tier]})</span>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Descarga tu dossier personalizado o solicita una sesión de 15–20 min para revisar la propuesta de
              acompañamiento y ayudas Kit Digital aplicables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDownloadHtmlDossier}
              disabled={isSaving}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                isDark
                  ? 'bg-[#001428] border-[#0284C7]/35 text-slate-200 hover:text-white hover:bg-[#002855]'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-sky-500" />
              <span>Descargar Dossier HTML / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTxtDossier}
              disabled={isSaving}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                isDark
                  ? 'bg-[#001428] border-[#0284C7]/35 text-slate-200 hover:text-white hover:bg-[#002855]'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>Resumen TXT</span>
            </button>

            <button
              type="button"
              onClick={() => handleShareDiagnosticChannel('whatsapp')}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 flex items-center gap-1.5 transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Enviar por WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => handleShareDiagnosticChannel('email')}
              disabled={isSaving}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                isDark
                  ? 'bg-[#001428] border-[#0284C7]/35 text-sky-400 hover:bg-[#002855]'
                  : 'bg-white border-slate-300 text-blue-700 hover:bg-slate-100 shadow-sm'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Enviar por Email</span>
            </button>

            <button
              type="button"
              onClick={handleBookFromDiagnostic}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Revisar diagnóstico en sesión gratuita</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
