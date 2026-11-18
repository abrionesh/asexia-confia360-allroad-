import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  Share2,
  Search,
  RefreshCw,
  Save,
  Download,
  MessageSquare,
  Mail,
  Phone,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Compass,
  FileText,
  Clock,
  Copy,
  Check,
  Send,
  Upload,
  Settings,
  X,
  Link2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  RoiConfig,
  RoiSectorId,
  CompanySizeId,
  RoiUserInputs,
  SECTOR_ORDER,
  COMPANY_SIZE_ORDER,
  calculateRoiResults,
  createInitialInputsForSector,
} from '../types/roi';
import {
  CrmClient,
  CrmOpportunity,
  CrmStage,
  CrmSource,
  DiagnosticTier,
  CaptaGlobalConfig,
  CrmProposal,
  CrmCommunication,
  SECTOR_DIAGNOSTIC_TEMPLATES,
  STAGE_LABELS,
  SOURCE_LABELS,
  TIER_LABELS,
  createDefaultAreaScores,
  buildDiagnosticEvaluation,
} from '../types/confia360';
import {
  buildCaptaGlobalPayload,
  buildCaptaGlobalPrefillUrl,
  buildClientShareMessage,
  downloadCaptaGlobalJson,
  downloadDeliverableHtml,
  downloadDeliverableTxt,
  exportCrmOpportunitiesCsv,
} from '../utils/deliverables';

interface AdminCrmTabProps {
  roiConfig: RoiConfig;
  refreshSignal?: number;
}

type DetailSubTab = 'ficha' | 'roi' | 'diagnostico' | 'entregables' | 'propuestas' | 'captaglobal';

const STAGE_ORDER: CrmStage[] = [
  'nuevo',
  'diagnostico',
  'roi-enviado',
  'propuesta',
  'seguimiento',
  'ganada',
  'perdida',
];

export const AdminCrmTab: React.FC<AdminCrmTabProps> = ({ roiConfig, refreshSignal = 0 }) => {
  const { isDark } = useTheme();

  const [clients, setClients] = useState<CrmClient[]>([]);
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>([]);
  const [captaConfig, setCaptaConfig] = useState<CaptaGlobalConfig>({
    endpointUrl: 'https://asexia-confia360-captaglobal.grok.me',
    webhookPath: '/api/opportunities/import',
    apiKey: '',
    autoSyncOnIntake: true,
    updatedAt: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Master Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'ALL' | CrmStage>('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | CrmSource>('ALL');
  const [tierFilter, setTierFilter] = useState<'ALL' | DiagnosticTier>('ALL');
  const [syncFilter, setSyncFilter] = useState<'ALL' | 'PENDING' | 'SYNCED'>('ALL');
  const [selectedOppId, setSelectedOppId] = useState<string>('');
  const [detailTab, setDetailTab] = useState<DetailSubTab>('ficha');

  // Config & Import Modals
  const [showCaptaConfig, setShowCaptaConfig] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importQuickLead, setImportQuickLead] = useState({
    name: '',
    companyName: '',
    sectorId: 'clinicas' as RoiSectorId,
    postalCode: '',
    phone: '',
    email: '',
    notes: '',
  });

  // Feedback
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [isTestingCapta, setIsTestingCapta] = useState(false);
  const [captaTestResult, setCaptaTestResult] = useState<{
    reachable: boolean;
    status: number | null;
    latencyMs: number;
    message: string;
  } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedPrefillTarget, setCopiedPrefillTarget] = useState<'diagnostico' | 'roi' | null>(null);

  // Editable Drafts for Selected Opportunity
  const [clientDraft, setClientDraft] = useState<Partial<CrmClient>>({});
  const [oppMetaDraft, setOppMetaDraft] = useState<{
    stage: CrmStage;
    assignedOwner: string;
    nextFollowUpAt: string;
  }>({ stage: 'nuevo', assignedOwner: '', nextFollowUpAt: '' });
  const [roiDraft, setRoiDraft] = useState<RoiUserInputs | null>(null);
  const [diagTierDraft, setDiagTierDraft] = useState<DiagnosticTier>('base');
  const [areaScoresDraft, setAreaScoresDraft] = useState<Record<string, number>>({});

  // New Proposal & Communication Drafts
  const [proposalDraft, setProposalDraft] = useState({
    title: '',
    setupFee: 450,
    monthlyFee: 149,
    kitDigitalApplied: true,
    notes: '',
  });
  const [commDraft, setCommDraft] = useState<{
    type: CrmCommunication['type'];
    direction: CrmCommunication['direction'];
    summary: string;
  }>({
    type: 'llamada',
    direction: 'saliente',
    summary: '',
  });

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/crm/overview');
      if (res.ok) {
        const data = await res.json();
        const nextClients: CrmClient[] = data.clients || [];
        const nextOpps: CrmOpportunity[] = data.opportunities || [];
        setClients(nextClients);
        setOpportunities(nextOpps);
        if (data.captaGlobalConfig) setCaptaConfig(data.captaGlobalConfig);
        if (!selectedOppId && nextOpps[0]) {
          setSelectedOppId(nextOpps[0].id);
        } else if (selectedOppId && !nextOpps.some((o) => o.id === selectedOppId) && nextOpps[0]) {
          setSelectedOppId(nextOpps[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading CRM overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [refreshSignal]);

  const clientsById = useMemo(() => {
    const map: Record<string, CrmClient> = {};
    clients.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [clients]);

  const selectedOpp = useMemo(
    () => opportunities.find((o) => o.id === selectedOppId) || opportunities[0] || null,
    [opportunities, selectedOppId]
  );

  const selectedClient = selectedOpp ? clientsById[selectedOpp.clientId] || null : null;

  // Hydrate drafts whenever selected opportunity changes
  useEffect(() => {
    if (!selectedOpp || !selectedClient) return;
    setClientDraft({
      name: selectedClient.name,
      companyName: selectedClient.companyName,
      sectorId: selectedClient.sectorId,
      companySizeId: selectedClient.companySizeId,
      postalCode: selectedClient.postalCode,
      phone: selectedClient.phone,
      email: selectedClient.email,
    });
    setOppMetaDraft({
      stage: selectedOpp.stage,
      assignedOwner: selectedOpp.assignedOwner,
      nextFollowUpAt: selectedOpp.nextFollowUpAt ? selectedOpp.nextFollowUpAt.slice(0, 10) : '',
    });
    const secDefaults = roiConfig.sectors[selectedClient.sectorId] || roiConfig.sectors.clinicas;
    setRoiDraft(
      selectedOpp.roiSimulation?.inputs ||
        createInitialInputsForSector(secDefaults, true, selectedClient.companySizeId)
    );
    setDiagTierDraft(selectedOpp.diagnosticTier);
    setAreaScoresDraft(
      selectedOpp.diagnosticResult?.areaScores || createDefaultAreaScores(selectedClient.sectorId)
    );
    setProposalDraft((prev) => ({
      ...prev,
      title: `Propuesta ConfIA360 · ${selectedClient.companyName}`,
    }));
  }, [selectedOpp?.id, selectedClient?.id]);

  const filteredOpps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return opportunities.filter((opp) => {
      const cli = clientsById[opp.clientId];
      if (!cli) return false;
      const matchesQ =
        !q ||
        cli.name.toLowerCase().includes(q) ||
        cli.companyName.toLowerCase().includes(q) ||
        cli.postalCode.toLowerCase().includes(q) ||
        cli.phone.toLowerCase().includes(q) ||
        cli.email.toLowerCase().includes(q) ||
        cli.sectorLabel.toLowerCase().includes(q);
      const matchesStage = stageFilter === 'ALL' || opp.stage === stageFilter;
      const matchesSource = sourceFilter === 'ALL' || opp.source === sourceFilter;
      const matchesTier = tierFilter === 'ALL' || opp.diagnosticTier === tierFilter;
      const syncStatus = opp.captaGlobalSync?.status || 'pending';
      const matchesSync =
        syncFilter === 'ALL' ||
        (syncFilter === 'SYNCED' && (syncStatus === 'synced' || syncStatus === 'imported')) ||
        (syncFilter === 'PENDING' && (syncStatus === 'pending' || syncStatus === 'queued' || syncStatus === 'error'));
      return matchesQ && matchesStage && matchesSource && matchesTier && matchesSync;
    });
  }, [opportunities, clientsById, searchQuery, stageFilter, sourceFilter, tierFilter, syncFilter]);

  const pipelineKpis = useMemo(() => {
    const totalAnnualValue = opportunities.reduce((sum, o) => sum + (o.estimatedAnnualValue || 0), 0);
    const syncedCount = opportunities.filter(
      (o) => o.captaGlobalSync?.status === 'synced' || o.captaGlobalSync?.status === 'imported'
    ).length;
    const pendingSyncCount = opportunities.filter(
      (o) =>
        o.captaGlobalSync?.status === 'pending' ||
        o.captaGlobalSync?.status === 'queued' ||
        o.captaGlobalSync?.status === 'error'
    ).length;
    return {
      totalClients: clients.length,
      totalOpps: opportunities.length,
      totalAnnualValue,
      syncedCount,
      pendingSyncCount,
    };
  }, [clients.length, opportunities]);

  const liveRoiPreview = useMemo(() => {
    if (!roiDraft || !selectedClient) return null;
    const sec = roiConfig.sectors[clientDraft.sectorId || selectedClient.sectorId] || roiConfig.sectors.clinicas;
    return calculateRoiResults(
      {
        ...roiDraft,
        sectorId: clientDraft.sectorId || selectedClient.sectorId,
        companySizeId: clientDraft.companySizeId || selectedClient.companySizeId,
      },
      sec,
      roiConfig.globalRates,
      roiConfig.companySizes
    );
  }, [roiDraft, selectedClient, clientDraft.sectorId, clientDraft.companySizeId, roiConfig]);

  const liveDiagPreview = useMemo(() => {
    if (!selectedClient) return null;
    return buildDiagnosticEvaluation({
      sectorId: (clientDraft.sectorId || selectedClient.sectorId) as RoiSectorId,
      companySizeId: (clientDraft.companySizeId || selectedClient.companySizeId) as CompanySizeId,
      tier: diagTierDraft,
      areaScores: areaScoresDraft,
      proChecklistKeys: selectedOpp?.diagnosticResult?.proChecklistKeys || [],
      vipFocusGoal: selectedOpp?.diagnosticResult?.vipFocusGoal,
      roiResult: liveRoiPreview || selectedOpp?.roiSimulation?.results || null,
    });
  }, [selectedClient, clientDraft, diagTierDraft, areaScoresDraft, selectedOpp, liveRoiPreview]);

  const replaceOpportunityInState = (updatedClient: CrmClient | null, updatedOpp: CrmOpportunity) => {
    if (updatedClient) {
      setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
    }
    setOpportunities((prev) => prev.map((o) => (o.id === updatedOpp.id ? updatedOpp : o)));
  };

  const handlePatchOpportunity = async (payload: Record<string, unknown>, okMessage: string) => {
    if (!selectedOpp) return;
    setIsMutating(true);
    setActionMsg(null);
    setActionError(null);
    try {
      const res = await fetch(`/api/crm/opportunities/${selectedOpp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data?.error || 'Error al actualizar la oportunidad.');
        return;
      }
      replaceOpportunityInState(data.client, data.opportunity);
      setActionMsg(okMessage);
    } catch {
      setActionError('Error de conexión al guardar en el CRM.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleRecordDeliverable = async (
    type: 'dossier-html' | 'informe-txt' | 'paquete-json',
    channel: 'descarga' | 'email' | 'whatsapp' | 'crm',
    summary: string
  ) => {
    if (!selectedOpp || !selectedClient) return;
    try {
      const res = await fetch(`/api/crm/opportunities/${selectedOpp.id}/deliverables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          tier: selectedOpp.diagnosticTier,
          channel,
          recipient: channel === 'whatsapp' ? selectedClient.phone : selectedClient.email,
          summary,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        replaceOpportunityInState(null, data.opportunity);
        setActionMsg(`Entregable registrado (${channel}).`);
      }
    } catch {
      // Skip non-fatal error on UI trigger
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp || !proposalDraft.title.trim()) return;
    setIsMutating(true);
    setActionError(null);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/crm/opportunities/${selectedOpp.id}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposalDraft),
      });
      const data = await res.json();
      if (res.ok) {
        replaceOpportunityInState(null, data.opportunity);
        setActionMsg('Propuesta comercial creada y añadida a la ficha.');
        setProposalDraft((prev) => ({ ...prev, notes: '' }));
      } else {
        setActionError(data?.error || 'No se pudo crear la propuesta.');
      }
    } catch {
      setActionError('Error de conexión al crear propuesta.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateProposalStatus = async (proposalId: string, status: CrmProposal['status']) => {
    if (!selectedOpp) return;
    try {
      const res = await fetch(`/api/crm/opportunities/${selectedOpp.id}/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        replaceOpportunityInState(null, data.opportunity);
      }
    } catch {
      setActionError('No se pudo actualizar el estado de la propuesta.');
    }
  };

  const handleAddCommunication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp || !commDraft.summary.trim()) return;
    setIsMutating(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/crm/opportunities/${selectedOpp.id}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commDraft),
      });
      const data = await res.json();
      if (res.ok) {
        replaceOpportunityInState(null, data.opportunity);
        setCommDraft({ ...commDraft, summary: '' });
        setActionMsg('Comunicación registrada en el historial.');
      } else {
        setActionError(data?.error || 'No se pudo registrar la comunicación.');
      }
    } catch {
      setActionError('Error al guardar comunicación.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleSaveCaptaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMutating(true);
    setActionError(null);
    try {
      const res = await fetch('/api/crm/captaglobal/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(captaConfig),
      });
      const data = await res.json();
      if (res.ok) {
        setCaptaConfig(data.captaGlobalConfig);
        setActionMsg('Configuración de enlace CaptaGlobal guardada.');
        setShowCaptaConfig(false);
      }
    } catch {
      setActionError('Error al guardar configuración de CaptaGlobal.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleSyncToCaptaGlobal = async () => {
    if (!selectedOpp) return;
    setIsMutating(true);
    setActionMsg(null);
    setActionError(null);
    try {
      const res = await fetch(`/api/crm/opportunities/${selectedOpp.id}/sync-captaglobal`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data?.opportunity) {
        replaceOpportunityInState(null, data.opportunity);
      }
      if (data?.success) {
        setActionMsg(data.message);
      } else {
        setActionError(data?.message || 'No se pudo sincronizar automáticamente.');
      }
    } catch {
      setActionError('Error de red al conectar con el servicio de sincronización.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleSyncAllPending = async () => {
    setIsBulkSyncing(true);
    setActionMsg(null);
    setActionError(null);
    try {
      const res = await fetch('/api/crm/captaglobal/sync-pending', { method: 'POST' });
      const data = await res.json();
      await fetchOverview();
      if (data.total === 0) {
        setActionMsg('Todas las oportunidades están al día con ConfIA360 CaptaGlobal.');
      } else if (data.syncedCount > 0 && data.failedCount === 0) {
        setActionMsg(`${data.syncedCount} oportunidades sincronizadas automáticamente con CaptaGlobal.`);
      } else {
        setActionError(
          `Sync lote: ${data.syncedCount} OK · ${data.failedCount} en cola o pendientes de endpoint remoto (puedes exportar CSV/JSON).`
        );
      }
    } catch {
      setActionError('Error de red al sincronizar el lote con CaptaGlobal.');
    } finally {
      setIsBulkSyncing(false);
    }
  };

  const handleImportFromCaptaGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMutating(true);
    setActionError(null);
    setActionMsg(null);
    try {
      let payload: unknown;
      if (importJsonText.trim()) {
        payload = JSON.parse(importJsonText);
      } else {
        payload = importQuickLead;
      }
      const res = await fetch('/api/crm/webhooks/captaglobal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data?.error || 'Error al importar el lead de CaptaGlobal.');
        return;
      }
      await fetchOverview();
      if (data.opportunity?.id) setSelectedOppId(data.opportunity.id);
      setShowImportModal(false);
      setImportJsonText('');
      setActionMsg(
        data.message || 'Oportunidad importada desde ConfIA360 CaptaGlobal al CRM unificado.'
      );
    } catch {
      setActionError('Revisa el formato JSON (objeto único o array [...]) o los campos obligatorios.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleCopyPayload = async () => {
    if (!selectedClient || !selectedOpp) return;
    try {
      const payload = buildCaptaGlobalPayload(selectedClient, selectedOpp);
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  const handleCopyPrefillLink = async (target: 'diagnostico' | 'roi') => {
    if (!selectedClient) return;
    try {
      const url = buildCaptaGlobalPrefillUrl(window.location.origin, selectedClient, target);
      await navigator.clipboard.writeText(url);
      setCopiedPrefillTarget(target);
      setActionMsg(
        `Enlace pre-rellenado (${target === 'roi' ? 'Calculadora ROI' : 'Diagnóstico ConfIA360'}) copiado para ${selectedClient.companyName}.`
      );
      setTimeout(() => setCopiedPrefillTarget(null), 2500);
    } catch {
      setActionError('No se pudo copiar el enlace al portapapeles.');
    }
  };

  const handleTestCaptaConnection = async () => {
    setIsTestingCapta(true);
    setCaptaTestResult(null);
    setActionError(null);
    try {
      const res = await fetch('/api/crm/captaglobal/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointUrl: captaConfig.endpointUrl,
          webhookPath: captaConfig.webhookPath,
          apiKey: captaConfig.apiKey,
        }),
      });
      const data = await res.json();
      setCaptaTestResult({
        reachable: Boolean(data.reachable),
        status: data.status ?? null,
        latencyMs: Number(data.latencyMs || 0),
        message: data.message || 'Comprobación completada.',
      });
    } catch {
      setCaptaTestResult({
        reachable: false,
        status: null,
        latencyMs: 0,
        message: 'Error de red al comprobar el endpoint desde el servidor.',
      });
    } finally {
      setIsTestingCapta(false);
    }
  };

  const handleCopyWebhookUrl = async () => {
    try {
      const fullWebhook = `${window.location.origin}/api/crm/webhooks/captaglobal`;
      await navigator.clipboard.writeText(fullWebhook);
      setCopiedWebhook(true);
      setActionMsg(`URL de webhook entrante copiada: ${fullWebhook}`);
      setTimeout(() => setCopiedWebhook(false), 2500);
    } catch {
      setActionError('No se pudo copiar la URL del webhook.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 text-xs">
      {/* Top KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
        <div
          className={`p-3 rounded-xl border ${
            isDark ? 'bg-[#001E3D] border-[#0284C7]/25' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className={`text-[11px] flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Users className="w-3.5 h-3.5 text-sky-500" />
            <span>Clientes unificados</span>
          </div>
          <div className="text-lg font-black font-mono tabular-nums mt-0.5">
            {pipelineKpis.totalClients}
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            isDark ? 'bg-[#001E3D] border-[#0284C7]/25' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className={`text-[11px] flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Briefcase className="w-3.5 h-3.5 text-blue-500" />
            <span>Oportunidades activas</span>
          </div>
          <div className="text-lg font-black font-mono tabular-nums mt-0.5">
            {pipelineKpis.totalOpps}
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            isDark ? 'bg-[#001E3D] border-[#0284C7]/25' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className={`text-[11px] flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Valor anual estimado</span>
          </div>
          <div className="text-lg font-black font-mono tabular-nums text-emerald-500 mt-0.5">
            {pipelineKpis.totalAnnualValue.toLocaleString('es-ES')} €
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            isDark ? 'bg-[#001E3D] border-[#0284C7]/25' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className={`text-[11px] flex items-center justify-between gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>CaptaGlobal</span>
            </span>
            <span className={`font-bold ${captaConfig.autoSyncOnIntake ? 'text-emerald-500' : 'text-amber-500'}`}>
              {captaConfig.autoSyncOnIntake ? 'Auto-sync ON' : 'Manual'}
            </span>
          </div>
          <div className="text-lg font-black font-mono tabular-nums mt-0.5">
            {pipelineKpis.syncedCount}{' '}
            <span className={`text-[11px] font-sans font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              OK · {pipelineKpis.pendingSyncCount} pend.
            </span>
          </div>
        </div>
      </div>

      {/* Filter & CaptaGlobal Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente, empresa, CP o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl border outline-none ${
                isDark
                  ? 'bg-[#001E3D] border-[#0284C7]/30 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as 'ALL' | CrmStage)}
            className={`px-2.5 py-1.5 rounded-xl border ${
              isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
            }`}
          >
            <option value="ALL">Todas las etapas</option>
            {STAGE_ORDER.map((st) => (
              <option key={st} value={st}>
                {STAGE_LABELS[st]}
              </option>
            ))}
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as 'ALL' | CrmSource)}
            className={`px-2.5 py-1.5 rounded-xl border ${
              isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
            }`}
          >
            <option value="ALL">Todos los orígenes</option>
            {(Object.keys(SOURCE_LABELS) as CrmSource[]).map((src) => (
              <option key={src} value={src}>
                {SOURCE_LABELS[src]}
              </option>
            ))}
          </select>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as 'ALL' | DiagnosticTier)}
            className={`px-2.5 py-1.5 rounded-xl border ${
              isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
            }`}
          >
            <option value="ALL">Base / Pro / VIP</option>
            <option value="base">Nivel Base</option>
            <option value="pro">Nivel Pro</option>
            <option value="vip">Nivel VIP</option>
          </select>

          <select
            value={syncFilter}
            onChange={(e) => setSyncFilter(e.target.value as 'ALL' | 'PENDING' | 'SYNCED')}
            className={`px-2.5 py-1.5 rounded-xl border ${
              isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
            }`}
          >
            <option value="ALL">Sync: Todos</option>
            <option value="PENDING">Pendientes / En cola</option>
            <option value="SYNCED">Sincronizados OK</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isBulkSyncing}
            onClick={handleSyncAllPending}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              isDark
                ? 'bg-[#001E3D] border-sky-500/40 text-sky-400 hover:bg-[#002855]'
                : 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100'
            }`}
          >
            <Share2 className={`w-3.5 h-3.5 ${isBulkSyncing ? 'animate-pulse' : ''}`} />
            <span>
              {isBulkSyncing
                ? 'Sincronizando...'
                : `Sync pendientes (${pipelineKpis.pendingSyncCount})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => exportCrmOpportunitiesCsv(clientsById, filteredOpps)}
            className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 cursor-pointer ${
              isDark
                ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-200 hover:text-white'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 cursor-pointer ${
              isDark
                ? 'bg-[#001E3D] border-emerald-500/35 text-emerald-400 hover:bg-[#002855]'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar CaptaGlobal</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCaptaConfig(!showCaptaConfig)}
            className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 cursor-pointer ${
              isDark
                ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-300 hover:text-white'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-sky-500" />
            <span>Configurar</span>
          </button>

          <button
            type="button"
            onClick={fetchOverview}
            title="Recargar CRM"
            className={`p-1.5 rounded-xl border cursor-pointer ${
              isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable CaptaGlobal Endpoint Config */}
      {showCaptaConfig && (
        <form
          onSubmit={handleSaveCaptaConfig}
          className={`p-3.5 rounded-2xl border space-y-2.5 shrink-0 ${
            isDark ? 'bg-[#001E3D] border-sky-500/35' : 'bg-slate-50 border-sky-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-sky-500">
              Conector Bidireccional ConfIA360 CaptaGlobal
            </span>
            <a
              href={captaConfig.endpointUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-emerald-500 hover:underline flex items-center gap-1"
            >
              <span>Abrir CaptaGlobal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="grid sm:grid-cols-4 gap-2.5">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold mb-0.5">URL base de CaptaGlobal</label>
              <input
                type="url"
                value={captaConfig.endpointUrl}
                onChange={(e) => setCaptaConfig({ ...captaConfig, endpointUrl: e.target.value })}
                className={`w-full px-2.5 py-1.5 rounded-lg border font-mono text-[11px] ${
                  isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-0.5">Ruta webhook</label>
              <input
                type="text"
                value={captaConfig.webhookPath}
                onChange={(e) => setCaptaConfig({ ...captaConfig, webhookPath: e.target.value })}
                className={`w-full px-2.5 py-1.5 rounded-lg border font-mono text-[11px] ${
                  isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-0.5">API Key / Token (opcional)</label>
              <input
                type="password"
                placeholder="Bearer token..."
                value={captaConfig.apiKey}
                onChange={(e) => setCaptaConfig({ ...captaConfig, apiKey: e.target.value })}
                className={`w-full px-2.5 py-1.5 rounded-lg border font-mono text-[11px] ${
                  isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300'
                }`}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={captaConfig.autoSyncOnIntake}
                onChange={(e) =>
                  setCaptaConfig({ ...captaConfig, autoSyncOnIntake: e.target.checked })
                }
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
              <span>Sincronizar automáticamente al captar o actualizar oportunidades</span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyWebhookUrl}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                  isDark
                    ? 'bg-[#001428] border-[#0284C7]/35 text-slate-200 hover:text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {copiedWebhook ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-sky-500" />}
                <span>{copiedWebhook ? 'Webhook copiado' : 'Copiar Webhook'}</span>
              </button>

              <button
                type="button"
                disabled={isTestingCapta}
                onClick={handleTestCaptaConnection}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                  isDark
                    ? 'bg-[#001428] border-emerald-500/40 text-emerald-400 hover:bg-[#002855]'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${isTestingCapta ? 'animate-spin' : ''}`} />
                <span>{isTestingCapta ? 'Probando...' : 'Probar conexión'}</span>
              </button>

              <button
                type="submit"
                disabled={isMutating}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer"
              >
                Guardar configuración
              </button>
            </div>
          </div>

          {captaTestResult && (
            <div
              className={`px-3 py-2 rounded-xl border text-[11px] flex flex-wrap items-center justify-between gap-2 ${
                captaTestResult.reachable
                  ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-500'
                  : 'bg-amber-500/10 border-amber-500/35 text-amber-500'
              }`}
            >
              <span className="font-semibold flex items-center gap-1.5">
                {captaTestResult.reachable ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{captaTestResult.message}</span>
              </span>
              <span className="font-mono tabular-nums font-bold">
                {captaTestResult.status ? `HTTP ${captaTestResult.status} · ` : ''}
                {captaTestResult.latencyMs} ms
              </span>
            </div>
          )}
        </form>
      )}

      {/* Notifications */}
      {(actionMsg || actionError) && (
        <div
          className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-2 shrink-0 ${
            actionError
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'
          }`}
        >
          <span className="flex items-center gap-1.5 font-semibold">
            {actionError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{actionError || actionMsg}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setActionMsg(null);
              setActionError(null);
            }}
            className="cursor-pointer opacity-70 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Master-Detail Workspace */}
      <div className="flex-1 min-h-0 grid lg:grid-cols-12 gap-3 overflow-hidden">
        {/* LEFT COLUMN: Opportunities List */}
        <div
          className={`lg:col-span-4 rounded-2xl border overflow-y-auto divide-y ${
            isDark
              ? 'bg-[#001E3D]/60 border-[#0284C7]/25 divide-[#0284C7]/15'
              : 'bg-slate-50/70 border-slate-200 divide-slate-200'
          }`}
        >
          {filteredOpps.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              No hay oportunidades que coincidan con los filtros.
            </div>
          ) : (
            filteredOpps.map((opp) => {
              const cli = clientsById[opp.clientId];
              if (!cli) return null;
              const isSelected = selectedOpp?.id === opp.id;
              return (
                <button
                  key={opp.id}
                  type="button"
                  onClick={() => setSelectedOppId(opp.id)}
                  className={`w-full p-3 text-left transition cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-[#002855] text-white'
                        : 'bg-white text-slate-900 shadow-sm'
                      : isDark
                      ? 'hover:bg-[#002244] text-slate-200'
                      : 'hover:bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-extrabold text-sm truncate">{cli.companyName}</div>
                      <div className={`text-[11px] truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {cli.name} · CP {cli.postalCode || 'N/D'}
                      </div>
                    </div>
                    <span className="font-mono tabular-nums font-black text-emerald-500 shrink-0">
                      {(opp.estimatedAnnualValue || 0).toLocaleString('es-ES')} €
                    </span>
                  </div>

                  <div className={`mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="font-semibold text-sky-500">{STAGE_LABELS[opp.stage]}</span>
                    <span aria-hidden="true">·</span>
                    <span>Nivel {TIER_LABELS[opp.diagnosticTier]}</span>
                    <span aria-hidden="true">·</span>
                    <span>{SOURCE_LABELS[opp.source]}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        opp.captaGlobalSync?.status === 'synced' || opp.captaGlobalSync?.status === 'imported'
                          ? 'text-emerald-500 font-bold'
                          : opp.captaGlobalSync?.status === 'queued'
                          ? 'text-sky-400 font-bold'
                          : opp.captaGlobalSync?.status === 'error'
                          ? 'text-amber-500 font-bold'
                          : ''
                      }
                    >
                      {opp.captaGlobalSync?.status === 'synced'
                        ? 'CaptaGlobal OK'
                        : opp.captaGlobalSync?.status === 'imported'
                        ? 'CaptaGlobal Import'
                        : opp.captaGlobalSync?.status === 'queued'
                        ? 'En cola auto'
                        : opp.captaGlobalSync?.status === 'error'
                        ? 'Error sync'
                        : 'Pendiente sync'}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: 360° Client & Opportunity Drawer */}
        <div
          className={`lg:col-span-8 rounded-2xl border flex flex-col min-h-0 overflow-hidden ${
            isDark ? 'bg-[#001E3D]/70 border-[#0284C7]/25' : 'bg-white border-slate-200'
          }`}
        >
          {!selectedOpp || !selectedClient ? (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
              Selecciona una oportunidad para ver su ficha 360º, ROI, diagnóstico y entregables.
            </div>
          ) : (
            <>
              {/* Drawer Header */}
              <div
                className={`p-3.5 border-b flex flex-wrap items-center justify-between gap-2 shrink-0 ${
                  isDark ? 'border-[#0284C7]/20 bg-[#001428]/60' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-base truncate">{selectedClient.companyName}</h4>
                    <span className="font-mono tabular-nums text-[11px] text-sky-500 font-bold">
                      #{selectedOpp.id}
                    </span>
                  </div>
                  <div className={`text-[11px] flex flex-wrap items-center gap-x-2 gap-y-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span>{selectedClient.name}</span>
                    <span>·</span>
                    <span>{selectedClient.sectorLabel}</span>
                    <span>·</span>
                    <span className="font-mono">CP {selectedClient.postalCode || 'N/D'}</span>
                    <span>·</span>
                    <span>{selectedClient.phone}</span>
                  </div>
                </div>

                {/* Sub-tabs */}
                <div className="flex flex-wrap items-center gap-1">
                  {(
                    [
                      { id: 'ficha', label: 'Ficha', icon: Users },
                      { id: 'roi', label: 'ROI', icon: Sliders },
                      { id: 'diagnostico', label: 'Diagnóstico', icon: Compass },
                      { id: 'entregables', label: `Entregables (${selectedOpp.deliverables.length})`, icon: FileText },
                      { id: 'propuestas', label: `Propuestas (${selectedOpp.proposals.length})`, icon: Clock },
                      { id: 'captaglobal', label: 'CaptaGlobal', icon: Share2 },
                    ] as Array<{ id: DetailSubTab; label: string; icon: React.ComponentType<{ className?: string }> }>
                  ).map((t) => {
                    const Icon = t.icon;
                    const active = detailTab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setDetailTab(t.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer transition ${
                          active
                            ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white'
                            : isDark
                            ? 'text-slate-300 hover:bg-[#002855]'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-tab Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* SUBTAB 1: FICHA & SEGUIMIENTO */}
                {detailTab === 'ficha' && (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Nombre contacto</label>
                        <input
                          type="text"
                          value={clientDraft.name || ''}
                          onChange={(e) => setClientDraft({ ...clientDraft, name: e.target.value })}
                          className={`w-full px-2.5 py-1.5 rounded-xl border ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Empresa</label>
                        <input
                          type="text"
                          value={clientDraft.companyName || ''}
                          onChange={(e) => setClientDraft({ ...clientDraft, companyName: e.target.value })}
                          className={`w-full px-2.5 py-1.5 rounded-xl border ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Sector</label>
                        <select
                          value={clientDraft.sectorId || selectedClient.sectorId}
                          onChange={(e) =>
                            setClientDraft({ ...clientDraft, sectorId: e.target.value as RoiSectorId })
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        >
                          {SECTOR_ORDER.map((sid) => (
                            <option key={sid} value={sid}>
                              {roiConfig.sectors[sid].name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Tamaño empresa</label>
                        <select
                          value={clientDraft.companySizeId || selectedClient.companySizeId}
                          onChange={(e) =>
                            setClientDraft({ ...clientDraft, companySizeId: e.target.value as CompanySizeId })
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        >
                          {COMPANY_SIZE_ORDER.map((sz) => (
                            <option key={sz} value={sz}>
                              {roiConfig.companySizes[sz].label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Código Postal</label>
                        <input
                          type="text"
                          value={clientDraft.postalCode || ''}
                          onChange={(e) => setClientDraft({ ...clientDraft, postalCode: e.target.value })}
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Teléfono</label>
                        <input
                          type="tel"
                          value={clientDraft.phone || ''}
                          onChange={(e) => setClientDraft({ ...clientDraft, phone: e.target.value })}
                          className={`w-full px-2.5 py-1.5 rounded-xl border ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Email</label>
                        <input
                          type="email"
                          value={clientDraft.email || ''}
                          onChange={(e) => setClientDraft({ ...clientDraft, email: e.target.value })}
                          className={`w-full px-2.5 py-1.5 rounded-xl border ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Etapa comercial CRM</label>
                        <select
                          value={oppMetaDraft.stage}
                          onChange={(e) =>
                            setOppMetaDraft({ ...oppMetaDraft, stage: e.target.value as CrmStage })
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-semibold ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        >
                          {STAGE_ORDER.map((st) => (
                            <option key={st} value={st}>
                              {STAGE_LABELS[st]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Próximo seguimiento</label>
                        <input
                          type="date"
                          value={oppMetaDraft.nextFollowUpAt}
                          onChange={(e) =>
                            setOppMetaDraft({ ...oppMetaDraft, nextFollowUpAt: e.target.value })
                          }
                          className={`w-full px-2.5 py-1.5 rounded-xl border font-mono ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/20">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`tel:${selectedClient.phone}`}
                          className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 ${
                            isDark ? 'border-[#0284C7]/30 text-slate-200' : 'border-slate-300 text-slate-700'
                          }`}
                        >
                          <Phone className="w-3.5 h-3.5 text-sky-500" />
                          <span>Llamar</span>
                        </a>
                        <a
                          href={`https://wa.me/${(() => {
                            const digits = selectedClient.phone.replace(/\D/g, '') || '609735753';
                            return digits.startsWith('34') && digits.length >= 11 ? digits : `34${digits}`;
                          })()}?text=${encodeURIComponent(
                            buildClientShareMessage(selectedClient, selectedOpp)
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            handleRecordDeliverable(
                              'informe-txt',
                              'whatsapp',
                              `Resumen ejecutivo enviado por WhatsApp desde Ficha`
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/35 text-emerald-500 font-semibold flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp resumen</span>
                        </a>
                        <a
                          href={`mailto:${selectedClient.email}?subject=${encodeURIComponent(
                            `Resumen ConfIA360 · ${selectedClient.companyName}`
                          )}&body=${encodeURIComponent(buildClientShareMessage(selectedClient, selectedOpp))}`}
                          onClick={() =>
                            handleRecordDeliverable(
                              'informe-txt',
                              'email',
                              `Resumen ejecutivo enviado por Email desde Ficha`
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 ${
                            isDark ? 'border-[#0284C7]/30 text-slate-200 hover:text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-500" />
                          <span>Email directo</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyPrefillLink('diagnostico')}
                          className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 cursor-pointer ${
                            isDark ? 'border-[#0284C7]/30 text-sky-400 hover:bg-[#002855]' : 'border-sky-300 text-sky-700 bg-sky-50 hover:bg-sky-100'
                          }`}
                        >
                          {copiedPrefillTarget === 'diagnostico' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Link2 className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {copiedPrefillTarget === 'diagnostico' ? 'Enlace copiado' : 'Enlace Diagnóstico'}
                          </span>
                        </button>
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={handleSyncToCaptaGlobal}
                          className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                            isDark ? 'border-emerald-500/35 text-emerald-400 hover:bg-[#002855]' : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Traspasar CaptaGlobal</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() =>
                          handlePatchOpportunity(
                            {
                              clientPatch: clientDraft,
                              stage: oppMetaDraft.stage,
                              assignedOwner: oppMetaDraft.assignedOwner,
                              nextFollowUpAt: oppMetaDraft.nextFollowUpAt
                                ? new Date(oppMetaDraft.nextFollowUpAt).toISOString()
                                : '',
                            },
                            'Ficha de cliente y etapa comercial actualizadas.'
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar ficha</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: EDIT ROI IN PLACE */}
                {detailTab === 'roi' && roiDraft && liveRoiPreview && (
                  <div className="space-y-4">
                    <div
                      className={`p-3.5 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums ${
                        isDark ? 'bg-[#001428] border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200'
                      }`}
                    >
                      <div>
                        <div className="font-sans text-[10px] text-slate-400">Horas liberadas</div>
                        <div className="text-base font-black text-emerald-500">
                          {liveRoiPreview.savedHoursWeek} h/sem
                        </div>
                      </div>
                      <div>
                        <div className="font-sans text-[10px] text-slate-400">Ahorro mensual</div>
                        <div className="text-base font-black">
                          {liveRoiPreview.monthlyOperationalSavings.toLocaleString('es-ES')} €
                        </div>
                      </div>
                      <div>
                        <div className="font-sans text-[10px] text-slate-400">Beneficio neto anual</div>
                        <div className="text-base font-black text-emerald-500">
                          +{liveRoiPreview.annualNetBenefit.toLocaleString('es-ES')} €
                        </div>
                      </div>
                      <div>
                        <div className="font-sans text-[10px] text-slate-400">ROI / Amortización</div>
                        <div className="text-base font-black text-sky-500">
                          {liveRoiPreview.roiPercent}% ({liveRoiPreview.paybackWeeks} sem)
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Personas en gestión</label>
                        <input
                          type="number"
                          min={1}
                          max={250}
                          value={roiDraft.teamSize}
                          onChange={(e) => setRoiDraft({ ...roiDraft, teamSize: Number(e.target.value) })}
                          className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Coste/hora (€)</label>
                        <input
                          type="number"
                          min={8}
                          max={120}
                          value={roiDraft.hourlyCost}
                          onChange={(e) => setRoiDraft({ ...roiDraft, hourlyCost: Number(e.target.value) })}
                          className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Horas atención/sem</label>
                        <input
                          type="number"
                          min={0}
                          max={120}
                          value={roiDraft.commHoursPerWeek}
                          onChange={(e) =>
                            setRoiDraft({ ...roiDraft, commHoursPerWeek: Number(e.target.value) })
                          }
                          className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Horas gestión/sem</label>
                        <input
                          type="number"
                          min={0}
                          max={120}
                          value={roiDraft.adminHoursPerWeek}
                          onChange={(e) =>
                            setRoiDraft({ ...roiDraft, adminHoursPerWeek: Number(e.target.value) })
                          }
                          className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Consultas perdidas/sem</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={roiDraft.missedLeadsPerWeek}
                          onChange={(e) =>
                            setRoiDraft({ ...roiDraft, missedLeadsPerWeek: Number(e.target.value) })
                          }
                          className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Ticket medio (€)</label>
                        <input
                          type="number"
                          min={10}
                          max={25000}
                          value={roiDraft.avgTicket}
                          onChange={(e) => setRoiDraft({ ...roiDraft, avgTicket: Number(e.target.value) })}
                          className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">Ahorro extra sector (€/mes)</label>
                        <input
                          type="number"
                          min={0}
                          max={10000}
                          value={roiDraft.sectorExtraMonthly}
                          onChange={(e) =>
                            setRoiDraft({ ...roiDraft, sectorExtraMonthly: Number(e.target.value) })
                          }
                          className={`w-full px-2.5 py-1.5 rounded-lg border font-mono ${
                            isDark ? 'bg-[#001428] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>
                      <label className="flex items-center gap-2 pt-4 cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={roiDraft.applyKitDigital}
                          onChange={(e) =>
                            setRoiDraft({ ...roiDraft, applyKitDigital: e.target.checked })
                          }
                          className="w-4 h-4 accent-emerald-500"
                        />
                        <span>Aplicar Kit Digital</span>
                      </label>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() =>
                          handlePatchOpportunity(
                            { roiInputs: roiDraft },
                            'Simulación ROI recalculada y guardada en CRM.'
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar ROI actualizado</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: DIAGNOSTICO CONFIA360 (BASE -> PRO -> VIP) */}
                {detailTab === 'diagnostico' && liveDiagPreview && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-black text-sm">
                          {liveDiagPreview.brandTitle} · Madurez {liveDiagPreview.maturityScore}/100 (
                          <span className="text-emerald-500">{liveDiagPreview.maturityLevel}</span>)
                        </div>
                        <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Escala el diagnóstico entre Base, Pro y VIP o ajusta las 10 áreas con el cliente.
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {(['base', 'pro', 'vip'] as DiagnosticTier[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setDiagTierDraft(t)}
                            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                              diagTierDraft === t
                                ? 'bg-emerald-500 text-white'
                                : isDark
                                ? 'bg-[#001428] text-slate-300 border border-[#0284C7]/30'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            Nivel {TIER_LABELS[t]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {(SECTOR_DIAGNOSTIC_TEMPLATES[selectedClient.sectorId] || SECTOR_DIAGNOSTIC_TEMPLATES.clinicas).areas.map(
                        (area) => {
                          const val = areaScoresDraft[area.key] ?? 4;
                          return (
                            <div
                              key={area.key}
                              className={`p-2.5 rounded-xl border space-y-1 ${
                                isDark ? 'bg-[#001428] border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex justify-between gap-2 font-bold">
                                <span className="truncate">
                                  {area.areaNumber}. {area.title}
                                </span>
                                <span className="font-mono text-emerald-500">{val}/10</span>
                              </div>
                              <input
                                type="range"
                                min={1}
                                max={10}
                                value={val}
                                onChange={(e) =>
                                  setAreaScoresDraft({
                                    ...areaScoresDraft,
                                    [area.key]: Number(e.target.value),
                                  })
                                }
                                className="w-full h-1.5 accent-emerald-500 cursor-pointer"
                              />
                            </div>
                          );
                        }
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() =>
                          handlePatchOpportunity(
                            {
                              diagnosticTier: diagTierDraft,
                              areaScores: areaScoresDraft,
                            },
                            `Diagnóstico Nivel ${TIER_LABELS[diagTierDraft]} actualizado y guardado.`
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar diagnóstico ConfIA360</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* SUBTAB 4: ENTREGABLES Y ENVÍOS */}
                {detailTab === 'entregables' && (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          downloadDeliverableHtml({
                            client: selectedClient,
                            opportunity: selectedOpp,
                            diagnostic: selectedOpp.diagnosticResult,
                            roiResults: selectedOpp.roiSimulation?.results,
                          });
                          handleRecordDeliverable(
                            'dossier-html',
                            'descarga',
                            `Dossier HTML ${TIER_LABELS[selectedOpp.diagnosticTier]} descargado por Admin`
                          );
                        }}
                        className={`p-3 rounded-xl border font-bold flex items-center justify-between cursor-pointer ${
                          isDark ? 'bg-[#001428] border-[#0284C7]/30 hover:bg-[#002855]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-sky-500" />
                          <span>Descargar Dossier HTML / PDF</span>
                        </span>
                        <span className="text-[10px] text-emerald-500">Nivel {TIER_LABELS[selectedOpp.diagnosticTier]}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          downloadDeliverableTxt({
                            client: selectedClient,
                            opportunity: selectedOpp,
                            diagnostic: selectedOpp.diagnosticResult,
                            roiInputs: selectedOpp.roiSimulation?.inputs,
                            roiResults: selectedOpp.roiSimulation?.results,
                          });
                          handleRecordDeliverable(
                            'informe-txt',
                            'descarga',
                            `Resumen TXT ${TIER_LABELS[selectedOpp.diagnosticTier]} descargado por Admin`
                          );
                        }}
                        className={`p-3 rounded-xl border font-bold flex items-center justify-between cursor-pointer ${
                          isDark ? 'bg-[#001428] border-[#0284C7]/30 hover:bg-[#002855]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-emerald-500" />
                          <span>Descargar Informe TXT</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Plano</span>
                      </button>

                      <a
                        href={`https://wa.me/34${selectedClient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          buildClientShareMessage(selectedClient, selectedOpp)
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          handleRecordDeliverable(
                            'informe-txt',
                            'whatsapp',
                            `Resumen Diagnóstico y ROI enviado por WhatsApp a ${selectedClient.phone}`
                          )
                        }
                        className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>Enviar resumen por WhatsApp</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <a
                        href={`mailto:${selectedClient.email}?subject=${encodeURIComponent(
                          `Tu Diagnóstico AsExiA | ConfIA360 — ${selectedClient.companyName}`
                        )}&body=${encodeURIComponent(buildClientShareMessage(selectedClient, selectedOpp))}`}
                        onClick={() =>
                          handleRecordDeliverable(
                            'dossier-html',
                            'email',
                            `Resumen y enlace de informe enviado por Email a ${selectedClient.email}`
                          )
                        }
                        className="p-3 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-500 font-bold flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>Enviar por Email</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="space-y-2">
                      <div className="font-extrabold text-xs">Historial de Entregables y Envíos</div>
                      {selectedOpp.deliverables.length === 0 ? (
                        <div className="text-slate-400 py-3">Aún no se han generado entregables para esta oportunidad.</div>
                      ) : (
                        <div className="space-y-2">
                          {selectedOpp.deliverables.map((del) => (
                            <div
                              key={del.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                                isDark ? 'bg-[#001428] border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="font-bold truncate">{del.summary}</div>
                                <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {del.type} · Nivel {TIER_LABELS[del.tier]} · Canal {del.channel} · {del.recipient}
                                </div>
                              </div>
                              <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                {new Date(del.generatedAt).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SUBTAB 5: PROPUESTAS & COMUNICACIONES */}
                {detailTab === 'propuestas' && (
                  <div className="grid lg:grid-cols-2 gap-4">
                    {/* Commercial Proposals */}
                    <div className="space-y-3">
                      <div className="font-extrabold">Propuestas Generadas</div>
                      <form
                        onSubmit={handleCreateProposal}
                        className={`p-3 rounded-xl border space-y-2 ${
                          isDark ? 'bg-[#001428] border-[#0284C7]/25' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <input
                          type="text"
                          required
                          placeholder="Título de propuesta..."
                          value={proposalDraft.title}
                          onChange={(e) => setProposalDraft({ ...proposalDraft, title: e.target.value })}
                          className={`w-full px-2.5 py-1.5 rounded-lg border ${
                            isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300'
                          }`}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400">Setup (€)</label>
                            <input
                              type="number"
                              min={0}
                              value={proposalDraft.setupFee}
                              onChange={(e) =>
                                setProposalDraft({ ...proposalDraft, setupFee: Number(e.target.value) })
                              }
                              className={`w-full px-2 py-1 rounded-lg border font-mono ${
                                isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400">Cuota (€/mes)</label>
                            <input
                              type="number"
                              min={0}
                              value={proposalDraft.monthlyFee}
                              onChange={(e) =>
                                setProposalDraft({ ...proposalDraft, monthlyFee: Number(e.target.value) })
                              }
                              className={`w-full px-2 py-1 rounded-lg border font-mono ${
                                isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300'
                              }`}
                            />
                          </div>
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Alcance de módulos ConfIA360 incluidos..."
                          value={proposalDraft.notes}
                          onChange={(e) => setProposalDraft({ ...proposalDraft, notes: e.target.value })}
                          className={`w-full px-2.5 py-1.5 rounded-lg border ${
                            isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300'
                          }`}
                        />
                        <button
                          type="submit"
                          disabled={isMutating}
                          className="w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Generar propuesta en ficha</span>
                        </button>
                      </form>

                      <div className="space-y-2">
                        {selectedOpp.proposals.map((prop) => (
                          <div
                            key={prop.id}
                            className={`p-2.5 rounded-xl border space-y-1 ${
                              isDark ? 'bg-[#001428] border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold truncate">{prop.title}</span>
                              <select
                                value={prop.status}
                                onChange={(e) =>
                                  handleUpdateProposalStatus(
                                    prop.id,
                                    e.target.value as CrmProposal['status']
                                  )
                                }
                                className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                                  isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300'
                                }`}
                              >
                                <option value="borrador">Borrador</option>
                                <option value="enviada">Enviada</option>
                                <option value="aceptada">Aceptada</option>
                                <option value="rechazada">Rechazada</option>
                              </select>
                            </div>
                            <div className="font-mono text-[11px] text-emerald-500">
                              Setup {prop.setupFee} € · {prop.monthlyFee} €/mes{' '}
                              {prop.kitDigitalApplied ? '(Kit Digital)' : ''}
                            </div>
                            {prop.notes && (
                              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {prop.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Communications Timeline */}
                    <div className="space-y-3">
                      <div className="font-extrabold">Comunicaciones y Seguimiento</div>
                      <form
                        onSubmit={handleAddCommunication}
                        className={`p-3 rounded-xl border space-y-2 ${
                          isDark ? 'bg-[#001428] border-[#0284C7]/25' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={commDraft.type}
                            onChange={(e) =>
                              setCommDraft({
                                ...commDraft,
                                type: e.target.value as CrmCommunication['type'],
                              })
                            }
                            className={`px-2 py-1.5 rounded-lg border ${
                              isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300'
                            }`}
                          >
                            <option value="llamada">Llamada</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="email">Email</option>
                            <option value="reunion">Reunión</option>
                            <option value="nota">Nota interna</option>
                          </select>
                          <select
                            value={commDraft.direction}
                            onChange={(e) =>
                              setCommDraft({
                                ...commDraft,
                                direction: e.target.value as CrmCommunication['direction'],
                              })
                            }
                            className={`px-2 py-1.5 rounded-lg border ${
                              isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300'
                            }`}
                          >
                            <option value="saliente">Saliente</option>
                            <option value="entrante">Entrante</option>
                            <option value="interno">Interno</option>
                          </select>
                        </div>
                        <textarea
                          rows={2}
                          required
                          placeholder="Resumen de llamada, envío o siguiente paso acordado..."
                          value={commDraft.summary}
                          onChange={(e) => setCommDraft({ ...commDraft, summary: e.target.value })}
                          className={`w-full px-2.5 py-1.5 rounded-lg border ${
                            isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-white border-slate-300'
                          }`}
                        />
                        <button
                          type="submit"
                          disabled={isMutating}
                          className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Registrar seguimiento</span>
                        </button>
                      </form>

                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedOpp.communications.map((c) => (
                          <div
                            key={c.id}
                            className={`p-2.5 rounded-xl border text-[11px] ${
                              isDark ? 'bg-[#001428] border-[#0284C7]/20' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-sky-500 mb-0.5">
                              <span>
                                {c.type.toUpperCase()} ({c.direction})
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {new Date(c.createdAt).toLocaleString('es-ES')}
                              </span>
                            </div>
                            <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{c.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 6: CONECTOR CONFIA360 CAPTAGLOBAL */}
                {detailTab === 'captaglobal' && (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-2xl border space-y-2 ${
                        isDark ? 'bg-[#001428] border-[#0284C7]/30' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-black text-sm">
                            Traspaso a ConfIA360 CaptaGlobal
                          </div>
                          <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Destino: <code className="font-mono">{captaConfig.endpointUrl}{captaConfig.webhookPath}</code>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                            selectedOpp.captaGlobalSync?.status === 'synced' ||
                            selectedOpp.captaGlobalSync?.status === 'imported'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : selectedOpp.captaGlobalSync?.status === 'error'
                              ? 'bg-amber-500/15 text-amber-500'
                              : 'bg-sky-500/15 text-sky-500'
                          }`}
                        >
                          Estado:{' '}
                          {selectedOpp.captaGlobalSync?.status === 'synced'
                            ? 'Sincronizado'
                            : selectedOpp.captaGlobalSync?.status === 'imported'
                            ? 'Importado CaptaGlobal'
                            : selectedOpp.captaGlobalSync?.status === 'queued'
                            ? `En cola (reintento ${selectedOpp.captaGlobalSync?.retryCount || 0}/3)`
                            : selectedOpp.captaGlobalSync?.status === 'error'
                            ? 'Error de entrega'
                            : 'Pendiente'}
                          {selectedOpp.captaGlobalSync?.externalLeadId
                            ? ` (${selectedOpp.captaGlobalSync.externalLeadId})`
                            : ''}
                        </span>
                      </div>

                      {selectedOpp.captaGlobalSync?.lastError && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[11px]">
                          {selectedOpp.captaGlobalSync.lastError}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={handleSyncToCaptaGlobal}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{isMutating ? 'Transfiriendo...' : 'Traspasar ahora a CaptaGlobal'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyPrefillLink('diagnostico')}
                          className={`px-3 py-2 rounded-xl border font-semibold flex items-center gap-1.5 cursor-pointer ${
                            isDark ? 'border-emerald-500/40 text-emerald-400' : 'border-emerald-300 text-emerald-700'
                          }`}
                        >
                          {copiedPrefillTarget === 'diagnostico' ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Link2 className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {copiedPrefillTarget === 'diagnostico'
                              ? 'Enlace Diagnóstico copiado'
                              : 'Copiar enlace Diagnóstico'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyPrefillLink('roi')}
                          className={`px-3 py-2 rounded-xl border font-semibold flex items-center gap-1.5 cursor-pointer ${
                            isDark ? 'border-[#0284C7]/35 text-sky-400' : 'border-sky-300 text-sky-700'
                          }`}
                        >
                          {copiedPrefillTarget === 'roi' ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Link2 className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {copiedPrefillTarget === 'roi' ? 'Enlace ROI copiado' : 'Copiar enlace ROI'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadCaptaGlobalJson(selectedClient, selectedOpp)}
                          className={`px-3 py-2 rounded-xl border font-semibold flex items-center gap-1.5 cursor-pointer ${
                            isDark ? 'border-[#0284C7]/30 text-slate-200' : 'border-slate-300 text-slate-700'
                          }`}
                        >
                          <Download className="w-3.5 h-3.5 text-sky-500" />
                          <span>Descargar JSON</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCopyPayload}
                          className={`px-3 py-2 rounded-xl border font-semibold flex items-center gap-1.5 cursor-pointer ${
                            isDark ? 'border-[#0284C7]/30 text-slate-200' : 'border-slate-300 text-slate-700'
                          }`}
                        >
                          {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedPayload ? 'JSON Copiado' : 'Copiar JSON'}</span>
                        </button>

                        <a
                          href={captaConfig.endpointUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl border border-emerald-500/40 text-emerald-500 font-semibold flex items-center gap-1.5"
                        >
                          <span>Abrir CaptaGlobal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold">
                        Carga útil estructurada (Cliente + Oportunidad + ROI + Diagnóstico):
                      </div>
                      <pre
                        className={`p-3 rounded-xl border font-mono text-[10px] overflow-x-auto max-h-56 ${
                          isDark ? 'bg-[#001428] border-[#0284C7]/25 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        {JSON.stringify(buildCaptaGlobalPayload(selectedClient, selectedOpp), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal: Importar Lead desde CaptaGlobal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-3xl border p-5 space-y-4 ${
              isDark ? 'bg-[#001428] border-[#0284C7]/35 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                  Importación CaptaGlobal → CRM Asexia
                </div>
                <h4 className="text-base font-black">Incorporar oportunidad de CaptaGlobal</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-lg border border-slate-700/40 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportFromCaptaGlobal} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Nombre contacto *"
                  value={importQuickLead.name}
                  onChange={(e) => setImportQuickLead({ ...importQuickLead, name: e.target.value })}
                  className={`px-3 py-2 rounded-xl border ${
                    isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Empresa *"
                  value={importQuickLead.companyName}
                  onChange={(e) =>
                    setImportQuickLead({ ...importQuickLead, companyName: e.target.value })
                  }
                  className={`px-3 py-2 rounded-xl border ${
                    isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <select
                  value={importQuickLead.sectorId}
                  onChange={(e) =>
                    setImportQuickLead({
                      ...importQuickLead,
                      sectorId: e.target.value as RoiSectorId,
                    })
                  }
                  className={`px-3 py-2 rounded-xl border ${
                    isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  {SECTOR_ORDER.map((sid) => (
                    <option key={sid} value={sid}>
                      {roiConfig.sectors[sid].name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Código Postal"
                  value={importQuickLead.postalCode}
                  onChange={(e) =>
                    setImportQuickLead({ ...importQuickLead, postalCode: e.target.value })
                  }
                  className={`px-3 py-2 rounded-xl border font-mono ${
                    isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <input
                  type="tel"
                  placeholder="Teléfono *"
                  value={importQuickLead.phone}
                  onChange={(e) => setImportQuickLead({ ...importQuickLead, phone: e.target.value })}
                  className={`px-3 py-2 rounded-xl border ${
                    isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={importQuickLead.email}
                  onChange={(e) => setImportQuickLead({ ...importQuickLead, email: e.target.value })}
                  className={`px-3 py-2 rounded-xl border ${
                    isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-1">
                  O pega JSON exportado desde ConfIA360 CaptaGlobal (opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder='{"nombre": "...", "empresa": "...", "sector": "...", "cp": "28901", "telefono": "...", "email": "..."}'
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border font-mono text-[11px] ${
                    isDark ? 'bg-[#001E3D] border-[#0284C7]/30 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-500/30 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold cursor-pointer"
                >
                  {isMutating ? 'Importando...' : 'Importar al CRM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
