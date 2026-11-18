import fs from 'fs';
import path from 'path';
import {
  buildDiagnosticEvaluation,
  CaptaGlobalConfig,
  createDefaultAreaScores,
  CrmClient,
  CrmCommunication,
  CrmDeliverable,
  CrmOpportunity,
  CrmProposal,
  CrmSource,
  CrmStage,
  CrmStoreData,
  DiagnosticTier,
} from './src/types/confia360';
import {
  calculateRoiResults,
  CompanySizeId,
  createInitialInputsForSector,
  RoiConfig,
  RoiSectorId,
  RoiUserInputs,
} from './src/types/roi';

const DATA_DIR = path.resolve('data');
const CRM_STORE_FILE = path.join(DATA_DIR, 'crm-store.json');

export const DEFAULT_CAPTAGLOBAL_URL = 'https://asexia-confia360-captaglobal.grok.me';

export function mapSectorTextToId(raw?: string): RoiSectorId {
  const s = (raw || '').toLowerCase();
  if (s.includes('salud') || s.includes('clínic') || s.includes('clinic') || s.includes('fisio') || s.includes('dental')) {
    return 'clinicas';
  }
  if (s.includes('restaur') || s.includes('hostel') || s.includes('bar') || s.includes('cafet')) {
    return 'restauracion';
  }
  if (s.includes('inmobili') || s.includes('propied') || s.includes('finca')) {
    return 'inmobiliarias';
  }
  if (s.includes('comerc') || s.includes('tienda') || s.includes('estét') || s.includes('estet') || s.includes('belleza') || s.includes('retail')) {
    return 'comercios';
  }
  return 'servicios';
}

export function mapSizeTextToId(raw?: string): CompanySizeId {
  const s = (raw || '').toLowerCase();
  if (s.includes('median')) return 'mediana';
  if (s.includes('peque')) return 'pequena';
  return 'micro';
}

function normalizePhone(phone?: string): string {
  return (phone || '').replace(/\D+/g, '');
}

function normalizeEmail(email?: string): string {
  return (email || '').trim().toLowerCase();
}

function createInitialCrmSeed(roiConfig: RoiConfig): CrmStoreData {
  const now = new Date().toISOString();

  // Seed 1: Clínica Dental Valdés (Salud - Nivel Pro + ROI)
  const clinicaInputs = createInitialInputsForSector(roiConfig.sectors.clinicas, true, 'pequena');
  const clinicaRoi = calculateRoiResults(
    clinicaInputs,
    roiConfig.sectors.clinicas,
    roiConfig.globalRates,
    roiConfig.companySizes
  );
  const clinicaDiag = buildDiagnosticEvaluation({
    sectorId: 'clinicas',
    companySizeId: 'pequena',
    tier: 'pro',
    areaScores: {
      perfil: 6,
      organizacion: 5,
      agenda: 3,
      economia: 5,
      captacion: 4,
      sistemas: 4,
      ia: 2,
      cumplimiento: 5,
      competencias: 4,
      crecimiento: 3,
    },
    proChecklistKeys: ['cumplimiento-rgpd'],
    roiResult: clinicaRoi,
  });

  // Seed 2: Mesón Los Olivos (Restauración - ROI + Diagnóstico Base)
  const mesonInputs = createInitialInputsForSector(roiConfig.sectors.restauracion, true, 'micro');
  const mesonRoi = calculateRoiResults(
    mesonInputs,
    roiConfig.sectors.restauracion,
    roiConfig.globalRates,
    roiConfig.companySizes
  );
  const mesonDiag = buildDiagnosticEvaluation({
    sectorId: 'restauracion',
    companySizeId: 'micro',
    tier: 'base',
    areaScores: createDefaultAreaScores('restauracion'),
    roiResult: mesonRoi,
  });

  // Seed 3: Benítez & Asociados (Servicios - VIP + Propuesta + Sincronizado CaptaGlobal)
  const despachoInputs = createInitialInputsForSector(roiConfig.sectors.servicios, true, 'pequena');
  const despachoRoi = calculateRoiResults(
    despachoInputs,
    roiConfig.sectors.servicios,
    roiConfig.globalRates,
    roiConfig.companySizes
  );
  const despachoDiag = buildDiagnosticEvaluation({
    sectorId: 'servicios',
    companySizeId: 'pequena',
    tier: 'vip',
    areaScores: {
      perfil: 7,
      organizacion: 5,
      agenda: 5,
      economia: 6,
      captacion: 4,
      sistemas: 6,
      ia: 3,
      cumplimiento: 7,
      competencias: 5,
      crecimiento: 4,
    },
    proChecklistKeys: ['cumplimiento-rgpd', 'firma-digital', 'factura-electronica'],
    vipFocusGoal: 'Automatizar recepción documental y firma de encargos en 90 días',
    roiResult: despachoRoi,
  });

  // Seed 4: Inmobiliaria La Reina (Lead procedente de CaptaGlobal)
  const inmoInputs = createInitialInputsForSector(roiConfig.sectors.inmobiliarias, true, 'micro');
  const inmoRoi = calculateRoiResults(
    inmoInputs,
    roiConfig.sectors.inmobiliarias,
    roiConfig.globalRates,
    roiConfig.companySizes
  );

  const clients: CrmClient[] = [
    {
      id: 'cli-101',
      name: 'Dra. Elena Valdés',
      companyName: 'Clínica Dental Valdés',
      sectorId: 'clinicas',
      sectorLabel: 'Clínicas y Salud',
      companySizeId: 'pequena',
      postalCode: '28901',
      phone: '644987654',
      email: 'elena@clinicavaldessalud.com',
      primarySource: 'diagnostico-confia360',
      createdAt: '2026-03-19T09:40:00Z',
      updatedAt: now,
    },
    {
      id: 'cli-102',
      name: 'Carlos M. Barrena',
      companyName: 'Mesón Los Olivos',
      sectorId: 'restauracion',
      sectorLabel: 'Restauración y Hostelería',
      companySizeId: 'micro',
      postalCode: '28902',
      phone: '612345678',
      email: 'carlos@mesonlosolivos.es',
      primarySource: 'roi-calculator',
      createdAt: '2026-03-18T10:15:00Z',
      updatedAt: now,
    },
    {
      id: 'cli-103',
      name: 'Marcos Benítez',
      companyName: 'Benítez & Asociados Asesores',
      sectorId: 'servicios',
      sectorLabel: 'Servicios Profesionales y Despachos',
      companySizeId: 'pequena',
      postalCode: '28003',
      phone: '689112233',
      email: 'marcos@benitezabogados.com',
      primarySource: 'diagnostico-confia360',
      createdAt: '2026-03-19T14:20:00Z',
      updatedAt: now,
    },
    {
      id: 'cli-104',
      name: 'Javier Navarro',
      companyName: 'Inmobiliaria La Reina',
      sectorId: 'inmobiliarias',
      sectorLabel: 'Inmobiliarias y Propiedades',
      companySizeId: 'micro',
      postalCode: '28903',
      phone: '670334455',
      email: 'jnavarro@inmobiliarialareina.es',
      primarySource: 'captaglobal',
      createdAt: '2026-03-19T11:00:00Z',
      updatedAt: now,
    },
  ];

  const opportunities: CrmOpportunity[] = [
    {
      id: 'opp-101',
      clientId: 'cli-101',
      title: 'ConfIA360 Salud Pro · Clínica Dental Valdés',
      source: 'diagnostico-confia360',
      stage: 'diagnostico',
      diagnosticTier: 'pro',
      assignedOwner: 'Consultoría Asexia',
      nextFollowUpAt: '2026-03-25',
      estimatedAnnualValue: clinicaRoi.annualNetBenefit,
      roiSimulation: {
        inputs: clinicaInputs,
        results: clinicaRoi,
        updatedAt: '2026-03-19T09:45:00Z',
      },
      diagnosticResult: clinicaDiag,
      deliverables: [
        {
          id: 'del-101',
          type: 'dossier-html',
          tier: 'pro',
          channel: 'descarga',
          recipient: 'elena@clinicavaldessalud.com',
          summary: 'Dossier Pro ConfIA360 Salud con DAFO y Hoja de Ruta 30/90/180',
          generatedAt: '2026-03-19T09:50:00Z',
        },
      ],
      proposals: [],
      communications: [
        {
          id: 'com-101',
          type: 'nota',
          direction: 'interno',
          summary: 'Diagnóstico Pro completado. Dolor principal: llamadas perdidas en gabinete y no-shows.',
          createdAt: '2026-03-19T09:50:00Z',
        },
      ],
      captaGlobalSync: {
        status: 'pending',
        targetUrl: DEFAULT_CAPTAGLOBAL_URL,
      },
      createdAt: '2026-03-19T09:40:00Z',
      updatedAt: now,
    },
    {
      id: 'opp-102',
      clientId: 'cli-102',
      title: 'Simulación ROI Hostelería · Mesón Los Olivos',
      source: 'roi-calculator',
      stage: 'roi-enviado',
      diagnosticTier: 'base',
      assignedOwner: 'Consultoría Asexia',
      nextFollowUpAt: '2026-03-24',
      estimatedAnnualValue: mesonRoi.annualNetBenefit,
      roiSimulation: {
        inputs: mesonInputs,
        results: mesonRoi,
        updatedAt: '2026-03-18T10:20:00Z',
      },
      diagnosticResult: mesonDiag,
      deliverables: [
        {
          id: 'del-102',
          type: 'informe-txt',
          tier: 'base',
          channel: 'whatsapp',
          recipient: '612345678',
          summary: 'Resumen ROI enviado por WhatsApp tras cálculo Getafe',
          generatedAt: '2026-03-18T10:22:00Z',
        },
      ],
      proposals: [],
      communications: [
        {
          id: 'com-102',
          type: 'whatsapp',
          direction: 'saliente',
          summary: 'Enviado resumen ROI Hostelería y enlace de orientación 15 min.',
          createdAt: '2026-03-18T10:25:00Z',
        },
      ],
      captaGlobalSync: {
        status: 'pending',
        targetUrl: DEFAULT_CAPTAGLOBAL_URL,
      },
      createdAt: '2026-03-18T10:15:00Z',
      updatedAt: now,
    },
    {
      id: 'opp-103',
      clientId: 'cli-103',
      title: 'Transformación VIP Despacho · Benítez & Asociados',
      source: 'diagnostico-confia360',
      stage: 'propuesta',
      diagnosticTier: 'vip',
      assignedOwner: 'Dirección MUNDOConfIA',
      nextFollowUpAt: '2026-03-26',
      estimatedAnnualValue: despachoRoi.annualNetBenefit,
      roiSimulation: {
        inputs: despachoInputs,
        results: despachoRoi,
        updatedAt: '2026-03-19T14:30:00Z',
      },
      diagnosticResult: despachoDiag,
      deliverables: [
        {
          id: 'del-103',
          type: 'dossier-html',
          tier: 'vip',
          channel: 'email',
          recipient: 'marcos@benitezabogados.com',
          summary: 'Dossier Ejecutivo VIP ConfIA360 Despachos + 9 KPIs de éxito',
          generatedAt: '2026-03-19T14:35:00Z',
        },
      ],
      proposals: [
        {
          id: 'crmprop-103',
          title: 'Plan Despacho Conectado + Kit Digital (ConfIA360 Digitaliza & Cumple)',
          setupFee: 450,
          monthlyFee: 195,
          kitDigitalApplied: true,
          servicesIncluded: ['ConfIA360 Diagnóstico', 'ConfIA360 Digitaliza', 'ConfIA360 Cumple', 'ConfIA360 Forma'],
          notes: 'Incluye firma digital legal, portal cliente y automatización documental.',
          status: 'enviada',
          createdAt: '2026-03-19T15:00:00Z',
        },
      ],
      communications: [
        {
          id: 'com-103',
          type: 'reunion',
          direction: 'saliente',
          summary: 'Presentado Dossier VIP y comparativa frente a propuesta externa.',
          createdAt: '2026-03-19T15:10:00Z',
        },
      ],
      captaGlobalSync: {
        externalLeadId: 'CG-2026-0842',
        status: 'synced',
        targetUrl: DEFAULT_CAPTAGLOBAL_URL,
        lastAttemptAt: '2026-03-19T15:12:00Z',
        lastSyncedAt: '2026-03-19T15:12:00Z',
      },
      createdAt: '2026-03-19T14:20:00Z',
      updatedAt: now,
    },
    {
      id: 'opp-104',
      clientId: 'cli-104',
      title: 'Lead CaptaGlobal · Inmobiliaria La Reina',
      source: 'captaglobal',
      stage: 'seguimiento',
      diagnosticTier: 'base',
      assignedOwner: 'Consultoría Asexia',
      nextFollowUpAt: '2026-03-23',
      estimatedAnnualValue: inmoRoi.annualNetBenefit,
      roiSimulation: {
        inputs: inmoInputs,
        results: inmoRoi,
        updatedAt: '2026-03-19T11:05:00Z',
      },
      deliverables: [],
      proposals: [],
      communications: [
        {
          id: 'com-104',
          type: 'sync',
          direction: 'entrante',
          summary: 'Oportunidad importada desde ConfIA360 CaptaGlobal para estudio de cualificación 24/7.',
          createdAt: '2026-03-19T11:00:00Z',
        },
      ],
      captaGlobalSync: {
        externalLeadId: 'CG-2026-0791',
        status: 'imported',
        targetUrl: DEFAULT_CAPTAGLOBAL_URL,
        lastSyncedAt: '2026-03-19T11:00:00Z',
      },
      createdAt: '2026-03-19T11:00:00Z',
      updatedAt: now,
    },
  ];

  const captaGlobalConfig: CaptaGlobalConfig = {
    endpointUrl: DEFAULT_CAPTAGLOBAL_URL,
    webhookPath: '/api/opportunities/import',
    apiKey: '',
    autoSyncOnIntake: true,
    updatedAt: now,
  };

  return { clients, opportunities, captaGlobalConfig };
}

export function loadCrmStore(roiConfig: RoiConfig): CrmStoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(CRM_STORE_FILE)) {
      const raw = fs.readFileSync(CRM_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<CrmStoreData>;
      if (parsed && Array.isArray(parsed.clients) && Array.isArray(parsed.opportunities)) {
        return {
          clients: parsed.clients,
          opportunities: parsed.opportunities,
          captaGlobalConfig: parsed.captaGlobalConfig || {
            endpointUrl: DEFAULT_CAPTAGLOBAL_URL,
            webhookPath: '/api/opportunities/import',
            apiKey: '',
            autoSyncOnIntake: true,
            updatedAt: new Date().toISOString(),
          },
        };
      }
    }
    const seed = createInitialCrmSeed(roiConfig);
    fs.writeFileSync(CRM_STORE_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  } catch (err) {
    console.warn('[CRM Store] Using in-memory seed:', err);
    return createInitialCrmSeed(roiConfig);
  }
}

export function saveCrmStore(store: CrmStoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CRM_STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[CRM Store] Could not persist to disk:', err);
  }
}

export function upsertClientAndOpportunity(
  store: CrmStoreData,
  roiConfig: RoiConfig,
  payload: {
    name: string;
    companyName: string;
    sectorId?: RoiSectorId;
    sectorLabel?: string;
    companySizeId?: CompanySizeId;
    postalCode?: string;
    phone: string;
    email: string;
    source: CrmSource;
    opportunityId?: string;
    diagnosticTier?: DiagnosticTier;
    roiInputs?: RoiUserInputs;
    areaScores?: Record<string, number>;
    proChecklistKeys?: string[];
    vipFocusGoal?: string;
    note?: string;
    externalLeadId?: string;
    deliverable?: Omit<CrmDeliverable, 'id' | 'generatedAt'>;
    proposal?: Omit<CrmProposal, 'id' | 'createdAt'>;
  }
): { client: CrmClient; opportunity: CrmOpportunity; isNewClient: boolean } {
  const now = new Date().toISOString();
  const sectorId = payload.sectorId || mapSectorTextToId(payload.sectorLabel);
  const companySizeId = payload.companySizeId || 'micro';
  const sectorDefaults = roiConfig.sectors[sectorId] || roiConfig.sectors.clinicas;
  const sectorLabel = payload.sectorLabel || sectorDefaults.name;

  const normEmail = normalizeEmail(payload.email);
  const normPhone = normalizePhone(payload.phone);

  let client = store.clients.find(
    (c) =>
      (normEmail && normalizeEmail(c.email) === normEmail) ||
      (normPhone.length >= 7 && normalizePhone(c.phone) === normPhone)
  );
  const isNewClient = !client;

  if (!client) {
    client = {
      id: `cli-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      name: payload.name.trim(),
      companyName: payload.companyName.trim() || `Empresa de ${payload.name.trim()}`,
      sectorId,
      sectorLabel,
      companySizeId,
      postalCode: (payload.postalCode || '').trim(),
      phone: payload.phone.trim(),
      email: payload.email.trim(),
      primarySource: payload.source,
      createdAt: now,
      updatedAt: now,
    };
    store.clients.unshift(client);
  } else {
    client.name = payload.name.trim() || client.name;
    client.companyName = payload.companyName.trim() || client.companyName;
    client.sectorId = sectorId;
    client.sectorLabel = sectorLabel;
    client.companySizeId = companySizeId;
    if (payload.postalCode?.trim()) client.postalCode = payload.postalCode.trim();
    if (payload.phone?.trim()) client.phone = payload.phone.trim();
    if (payload.email?.trim()) client.email = payload.email.trim();
    client.updatedAt = now;
  }

  let opportunity = payload.opportunityId
    ? store.opportunities.find((o) => o.id === payload.opportunityId)
    : store.opportunities.find(
        (o) =>
          o.clientId === client!.id &&
          o.stage !== 'ganada' &&
          o.stage !== 'perdida'
      );

  const effectiveRoiInputs =
    payload.roiInputs ||
    opportunity?.roiSimulation?.inputs ||
    createInitialInputsForSector(sectorDefaults, true, companySizeId);
  const roiResults = calculateRoiResults(
    { ...effectiveRoiInputs, sectorId, companySizeId },
    sectorDefaults,
    roiConfig.globalRates,
    roiConfig.companySizes
  );

  const diagnosticTier: DiagnosticTier =
    payload.diagnosticTier ||
    opportunity?.diagnosticTier ||
    (payload.areaScores ? 'base' : 'base');

  const effectiveAreaScores =
    payload.areaScores ||
    opportunity?.diagnosticResult?.areaScores ||
    (payload.source === 'diagnostico-confia360' || payload.diagnosticTier
      ? createDefaultAreaScores(sectorId)
      : undefined);

  const diagnosticResult = effectiveAreaScores
    ? buildDiagnosticEvaluation({
        sectorId,
        companySizeId,
        tier: diagnosticTier,
        areaScores: effectiveAreaScores,
        proChecklistKeys: payload.proChecklistKeys,
        vipFocusGoal: payload.vipFocusGoal,
        roiResult: roiResults,
      })
    : opportunity?.diagnosticResult;

  const initialStage: CrmStage = payload.proposal
    ? 'propuesta'
    : diagnosticResult
    ? 'diagnostico'
    : payload.roiInputs
    ? 'roi-enviado'
    : 'nuevo';

  const newComms: CrmCommunication[] = [];
  if (payload.note) {
    newComms.push({
      id: `com-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      type: payload.source === 'captaglobal' ? 'sync' : 'nota',
      direction: payload.source === 'captaglobal' ? 'entrante' : 'interno',
      summary: payload.note,
      createdAt: now,
    });
  }

  if (!opportunity) {
    opportunity = {
      id: `opp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      clientId: client.id,
      title: `${sectorDefaults.shortName} · ${client.companyName}`,
      source: payload.source,
      stage: initialStage,
      diagnosticTier,
      assignedOwner: 'Consultoría Asexia',
      nextFollowUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedAnnualValue: roiResults.annualNetBenefit,
      roiSimulation: {
        inputs: { ...effectiveRoiInputs, sectorId, companySizeId },
        results: roiResults,
        updatedAt: now,
      },
      diagnosticResult,
      deliverables: payload.deliverable
        ? [
            {
              ...payload.deliverable,
              id: `del-${Date.now().toString(36)}`,
              generatedAt: now,
            },
          ]
        : [],
      proposals: payload.proposal
        ? [
            {
              ...payload.proposal,
              id: `crmprop-${Date.now().toString(36)}`,
              createdAt: now,
            },
          ]
        : [],
      communications: [
        {
          id: `com-init-${Date.now().toString(36)}`,
          type: payload.source === 'captaglobal' ? 'sync' : 'nota',
          direction: 'entrante',
          summary: `Oportunidad registrada desde ${payload.source} (${client.postalCode || 'sin CP'}).`,
          createdAt: now,
        },
        ...newComms,
      ],
      captaGlobalSync: {
        externalLeadId: payload.externalLeadId,
        status:
          payload.source === 'captaglobal'
            ? 'imported'
            : store.captaGlobalConfig.autoSyncOnIntake
            ? 'queued'
            : 'pending',
        retryCount: 0,
        targetUrl: store.captaGlobalConfig.endpointUrl || DEFAULT_CAPTAGLOBAL_URL,
        lastSyncedAt: payload.source === 'captaglobal' ? now : undefined,
      },
      createdAt: now,
      updatedAt: now,
    };
    store.opportunities.unshift(opportunity);
  } else {
    opportunity.title = `${sectorDefaults.shortName} · ${client.companyName}`;
    opportunity.diagnosticTier = diagnosticTier;
    opportunity.estimatedAnnualValue = roiResults.annualNetBenefit;
    if (payload.roiInputs || !opportunity.roiSimulation) {
      opportunity.roiSimulation = {
        inputs: { ...effectiveRoiInputs, sectorId, companySizeId },
        results: roiResults,
        updatedAt: now,
      };
    }
    if (diagnosticResult) {
      opportunity.diagnosticResult = diagnosticResult;
    }
    if (opportunity.stage === 'nuevo' && initialStage !== 'nuevo') {
      opportunity.stage = initialStage;
    }
    if (payload.deliverable) {
      opportunity.deliverables.unshift({
        ...payload.deliverable,
        id: `del-${Date.now().toString(36)}`,
        generatedAt: now,
      });
    }
    if (payload.proposal) {
      opportunity.proposals.unshift({
        ...payload.proposal,
        id: `crmprop-${Date.now().toString(36)}`,
        createdAt: now,
      });
    }
    if (newComms.length > 0) {
      opportunity.communications.unshift(...newComms);
    }
    opportunity.updatedAt = now;
  }

  saveCrmStore(store);
  return { client, opportunity, isNewClient };
}

export function buildOutboundCaptaGlobalPayload(client: CrmClient, opportunity: CrmOpportunity) {
  return {
    schema: 'confia360.captaglobal.opportunity.v1',
    exportedAt: new Date().toISOString(),
    sourcePlatform: 'Asexia Web & Diagnóstico ConfIA360',
    opportunity: {
      id: opportunity.id,
      title: opportunity.title,
      stage: opportunity.stage,
      source: opportunity.source,
      diagnosticTier: opportunity.diagnosticTier,
      estimatedAnnualValue: opportunity.estimatedAnnualValue,
      nextFollowUpAt: opportunity.nextFollowUpAt,
      assignedOwner: opportunity.assignedOwner,
    },
    client,
    diagnostic: opportunity.diagnosticResult || null,
    roiSimulation: opportunity.roiSimulation || null,
    proposals: opportunity.proposals,
    deliverablesCount: opportunity.deliverables.length,
    communicationsCount: opportunity.communications.length,
  };
}
