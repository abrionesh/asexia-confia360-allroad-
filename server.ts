import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import {
  DEFAULT_ROI_CONFIG,
  RoiConfig,
  RoiSectorId,
  CompanySizeId,
  RoiCtaId,
  SECTOR_ORDER,
  COMPANY_SIZE_ORDER,
  CTA_ORDER,
  cloneDefaultRoiConfig,
  calculateRoiResults,
} from './src/types/roi';
import {
  buildDiagnosticEvaluation,
  createDefaultAreaScores,
  CrmStoreData,
  DiagnosticTier,
} from './src/types/confia360';
import {
  buildOutboundCaptaGlobalPayload,
  loadCrmStore,
  mapSectorTextToId,
  mapSizeTextToId,
  saveCrmStore,
  upsertClientAndOpportunity,
} from './crmStore';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Persistent JSON file store for Admin ROI configuration
const DATA_DIR = path.resolve('data');
const ROI_CONFIG_FILE = path.join(DATA_DIR, 'roi-config.json');

function sanitizeRoiConfig(incoming: Partial<RoiConfig> | null | undefined): RoiConfig {
  const base = cloneDefaultRoiConfig();
  if (!incoming || typeof incoming !== 'object') {
    return base;
  }

  if (incoming.defaultSectorId && SECTOR_ORDER.includes(incoming.defaultSectorId)) {
    base.defaultSectorId = incoming.defaultSectorId;
  }

  if (incoming.defaultCompanySizeId && COMPANY_SIZE_ORDER.includes(incoming.defaultCompanySizeId)) {
    base.defaultCompanySizeId = incoming.defaultCompanySizeId;
  }

  if (incoming.globalRates && typeof incoming.globalRates === 'object') {
    const g = incoming.globalRates;
    base.globalRates = {
      locationLabel:
        typeof g.locationLabel === 'string' && g.locationLabel.trim()
          ? g.locationLabel.trim().slice(0, 80)
          : base.globalRates.locationLabel,
      weeksPerMonth:
        typeof g.weeksPerMonth === 'number' && g.weeksPerMonth > 0 && g.weeksPerMonth <= 5
          ? g.weeksPerMonth
          : base.globalRates.weeksPerMonth,
      monthsPerYear:
        typeof g.monthsPerYear === 'number' && g.monthsPerYear >= 1 && g.monthsPerYear <= 12
          ? g.monthsPerYear
          : base.globalRates.monthsPerYear,
      kitDigitalSetupDiscountRate:
        typeof g.kitDigitalSetupDiscountRate === 'number' &&
        g.kitDigitalSetupDiscountRate >= 0 &&
        g.kitDigitalSetupDiscountRate <= 1
          ? g.kitDigitalSetupDiscountRate
          : base.globalRates.kitDigitalSetupDiscountRate,
      maxTotalReductionCap:
        typeof g.maxTotalReductionCap === 'number' &&
        g.maxTotalReductionCap >= 0.2 &&
        g.maxTotalReductionCap <= 0.95
          ? g.maxTotalReductionCap
          : base.globalRates.maxTotalReductionCap,
    };
  }

  if (incoming.companySizes && typeof incoming.companySizes === 'object') {
    const clampWeight = (val: unknown, min: number, max: number, fallback: number) =>
      typeof val === 'number' && Number.isFinite(val) ? Math.min(max, Math.max(min, val)) : fallback;

    for (const sizeId of COMPANY_SIZE_ORDER) {
      const incSize = incoming.companySizes[sizeId as CompanySizeId];
      if (!incSize || typeof incSize !== 'object') continue;
      const def = base.companySizes[sizeId];
      base.companySizes[sizeId] = {
        ...def,
        label:
          typeof incSize.label === 'string' && incSize.label.trim()
            ? incSize.label.trim().slice(0, 40)
            : def.label,
        shortLabel:
          typeof incSize.shortLabel === 'string' && incSize.shortLabel.trim()
            ? incSize.shortLabel.trim().slice(0, 20)
            : def.shortLabel,
        headcountRange:
          typeof incSize.headcountRange === 'string' && incSize.headcountRange.trim()
            ? incSize.headcountRange.trim().slice(0, 32)
            : def.headcountRange,
        description:
          typeof incSize.description === 'string' && incSize.description.trim()
            ? incSize.description.trim().slice(0, 120)
            : def.description,
        timeSavingsWeight: clampWeight(incSize.timeSavingsWeight, 0.3, 2.5, def.timeSavingsWeight),
        leadRecoveryWeight: clampWeight(incSize.leadRecoveryWeight, 0.3, 2.5, def.leadRecoveryWeight),
        sectorExtraWeight: clampWeight(incSize.sectorExtraWeight, 0.3, 3.0, def.sectorExtraWeight),
        investmentMultiplier: clampWeight(incSize.investmentMultiplier, 0.3, 3.5, def.investmentMultiplier),
      };
    }
  }

  if (incoming.sectors && typeof incoming.sectors === 'object') {
    for (const secId of SECTOR_ORDER) {
      const incSec = incoming.sectors[secId as RoiSectorId];
      if (!incSec || typeof incSec !== 'object') continue;
      const def = base.sectors[secId];
      const num = (val: unknown, min: number, max: number, fallback: number) =>
        typeof val === 'number' && Number.isFinite(val) ? Math.min(max, Math.max(min, val)) : fallback;

      base.sectors[secId] = {
        ...def,
        localBenchmarkNote:
          typeof incSec.localBenchmarkNote === 'string' && incSec.localBenchmarkNote.trim()
            ? incSec.localBenchmarkNote.trim().slice(0, 140)
            : def.localBenchmarkNote,
        sectorExtraLabel:
          typeof incSec.sectorExtraLabel === 'string' && incSec.sectorExtraLabel.trim()
            ? incSec.sectorExtraLabel.trim().slice(0, 120)
            : def.sectorExtraLabel,
        defaultTeamSize: num(incSec.defaultTeamSize, 1, 100, def.defaultTeamSize),
        defaultCommHoursPerWeek: num(incSec.defaultCommHoursPerWeek, 0, 120, def.defaultCommHoursPerWeek),
        defaultAdminHoursPerWeek: num(incSec.defaultAdminHoursPerWeek, 0, 120, def.defaultAdminHoursPerWeek),
        defaultMissedLeadsPerWeek: num(incSec.defaultMissedLeadsPerWeek, 0, 200, def.defaultMissedLeadsPerWeek),
        defaultHourlyCost: num(incSec.defaultHourlyCost, 5, 250, def.defaultHourlyCost),
        defaultAvgTicket: num(incSec.defaultAvgTicket, 1, 50000, def.defaultAvgTicket),
        defaultSectorExtraMonthly: num(incSec.defaultSectorExtraMonthly, 0, 20000, def.defaultSectorExtraMonthly),
        commAutomationRate: num(incSec.commAutomationRate, 0.05, 0.95, def.commAutomationRate),
        adminAutomationRate: num(incSec.adminAutomationRate, 0.05, 0.95, def.adminAutomationRate),
        leadRecoveryRate: num(incSec.leadRecoveryRate, 0.05, 0.95, def.leadRecoveryRate),
        closingMultiplier: num(incSec.closingMultiplier, 0.05, 1, def.closingMultiplier),
        estimatedMonthlyPlanCost: num(incSec.estimatedMonthlyPlanCost, 0, 10000, def.estimatedMonthlyPlanCost),
        estimatedSetupCost: num(incSec.estimatedSetupCost, 0, 50000, def.estimatedSetupCost),
        maxWeeklyHoursCap: num(incSec.maxWeeklyHoursCap, 15, 160, def.maxWeeklyHoursCap),
      };
    }
  }

  if (incoming.ctaSettings && typeof incoming.ctaSettings === 'object') {
    if (
      incoming.ctaSettings.primaryCtaId &&
      CTA_ORDER.includes(incoming.ctaSettings.primaryCtaId)
    ) {
      base.ctaSettings.primaryCtaId = incoming.ctaSettings.primaryCtaId;
    }

    if (incoming.ctaSettings.items && typeof incoming.ctaSettings.items === 'object') {
      for (const ctaId of CTA_ORDER) {
        const incItem = incoming.ctaSettings.items[ctaId as RoiCtaId];
        if (!incItem || typeof incItem !== 'object') continue;
        const defItem = base.ctaSettings.items[ctaId];
        base.ctaSettings.items[ctaId] = {
          id: ctaId,
          enabled: typeof incItem.enabled === 'boolean' ? incItem.enabled : defItem.enabled,
          label:
            typeof incItem.label === 'string' && incItem.label.trim()
              ? incItem.label.trim().slice(0, 70)
              : defItem.label,
          sublabel:
            typeof incItem.sublabel === 'string' && incItem.sublabel.trim()
              ? incItem.sublabel.trim().slice(0, 140)
              : defItem.sublabel,
        };
      }
    }
  }

  base.updatedAt = new Date().toISOString();
  base.version = typeof incoming.version === 'number' ? incoming.version + 1 : DEFAULT_ROI_CONFIG.version;
  return base;
}

function loadRoiConfig(): RoiConfig {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ROI_CONFIG_FILE)) {
      const raw = fs.readFileSync(ROI_CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return sanitizeRoiConfig(parsed);
    }
    const defaults = cloneDefaultRoiConfig();
    fs.writeFileSync(ROI_CONFIG_FILE, JSON.stringify(defaults, null, 2), 'utf-8');
    return defaults;
  } catch (err) {
    console.warn('[ROI Config] Using in-memory defaults:', err);
    return cloneDefaultRoiConfig();
  }
}

function saveRoiConfig(config: RoiConfig): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ROI_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[ROI Config] Could not persist to disk, kept in memory:', err);
  }
}

let roiConfigStore: RoiConfig = loadRoiConfig();
let crmStore: CrmStoreData = loadCrmStore(roiConfigStore);

// Reusable CaptaGlobal Outbound Sync Engine (Manual & Auto-Sync + Retry Queue)
async function executeCaptaGlobalSync(
  oppId: string,
  options?: { isAuto?: boolean }
): Promise<{
  success: boolean;
  message: string;
  opportunity?: (typeof crmStore.opportunities)[number];
  payload?: ReturnType<typeof buildOutboundCaptaGlobalPayload>;
}> {
  const opp = crmStore.opportunities.find((o) => o.id === oppId);
  if (!opp) {
    return { success: false, message: 'Oportunidad no encontrada.' };
  }
  const client = crmStore.clients.find((c) => c.id === opp.clientId);
  if (!client) {
    return { success: false, message: 'Cliente no encontrado.' };
  }

  const cfg = crmStore.captaGlobalConfig;
  const targetUrl = `${cfg.endpointUrl.replace(/\/+$/, '')}${
    cfg.webhookPath.startsWith('/') ? cfg.webhookPath : `/${cfg.webhookPath}`
  }`;
  const payload = buildOutboundCaptaGlobalPayload(client, opp);
  const now = new Date().toISOString();

  let synced = false;
  let remoteStatus = 0;
  let remoteMessage = '';
  let externalLeadId = opp.captaGlobalSync?.externalLeadId;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (cfg.apiKey) {
      headers['Authorization'] = `Bearer ${cfg.apiKey}`;
      headers['X-API-Key'] = cfg.apiKey;
    }

    const remoteRes = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    remoteStatus = remoteRes.status;

    const text = await remoteRes.text();
    if (remoteRes.ok) {
      synced = true;
      try {
        const parsed = JSON.parse(text);
        externalLeadId =
          parsed?.id ||
          parsed?.leadId ||
          parsed?.opportunityId ||
          externalLeadId ||
          `CG-${Date.now().toString().slice(-5)}`;
      } catch {
        externalLeadId = externalLeadId || `CG-${Date.now().toString().slice(-5)}`;
      }
      remoteMessage = `Sincronizado correctamente con CaptaGlobal (HTTP ${remoteStatus}).`;
    } else {
      remoteMessage = `El endpoint remoto respondió HTTP ${remoteStatus}. Paquete JSON guardado y listo para reintento o importación.`;
    }
  } catch (err: any) {
    remoteMessage = `Conexión automática en espera (${err?.message || 'endpoint remoto inaccesible'}). Paquete JSON disponible para exportación.`;
  }

  const prevRetries = opp.captaGlobalSync?.retryCount || 0;
  const nextRetryCount = synced ? 0 : prevRetries + 1;
  const shouldQueueRetry = !synced && nextRetryCount < 3;
  const backoffMs = nextRetryCount === 1 ? 45_000 : 120_000;

  opp.captaGlobalSync = {
    externalLeadId,
    status: synced ? 'synced' : shouldQueueRetry ? 'queued' : 'error',
    retryCount: nextRetryCount,
    nextRetryAt: shouldQueueRetry ? new Date(Date.now() + backoffMs).toISOString() : undefined,
    targetUrl,
    lastAttemptAt: now,
    lastSyncedAt: synced ? now : opp.captaGlobalSync?.lastSyncedAt,
    lastError: synced ? undefined : remoteMessage,
    payloadSnapshot: payload,
  };

  if (synced || !options?.isAuto) {
    opp.communications.unshift({
      id: `com-cg-${Date.now().toString(36)}`,
      type: 'sync',
      direction: 'saliente',
      summary: synced
        ? `Sincronizado${options?.isAuto ? ' automáticamente' : ''} con ConfIA360 CaptaGlobal (${externalLeadId}).`
        : `Intento de traspaso a CaptaGlobal: ${remoteMessage}`,
      createdAt: now,
    });
  }

  opp.updatedAt = now;
  saveCrmStore(crmStore);

  return {
    success: synced,
    message: remoteMessage,
    opportunity: opp,
    payload,
  };
}

function triggerAutoSyncIfEnabled(oppId: string): void {
  if (!crmStore.captaGlobalConfig?.autoSyncOnIntake) return;
  setImmediate(() => {
    executeCaptaGlobalSync(oppId, { isAuto: true }).catch(() => {
      // Background errors are captured safely inside opportunity.captaGlobalSync
    });
  });
}

// Background retry loop for queued CaptaGlobal opportunities
setInterval(() => {
  if (!crmStore.captaGlobalConfig?.autoSyncOnIntake) return;
  const nowMs = Date.now();
  const due = crmStore.opportunities.filter(
    (o) =>
      o.captaGlobalSync?.status === 'queued' &&
      (!o.captaGlobalSync.nextRetryAt || new Date(o.captaGlobalSync.nextRetryAt).getTime() <= nowMs) &&
      (o.captaGlobalSync.retryCount || 0) < 3
  );
  due.slice(0, 3).forEach((opp) => {
    executeCaptaGlobalSync(opp.id, { isAuto: true }).catch(() => {});
  });
}, 45_000);

// In-memory data store with realistic seed data for the Admin Panel
let bookings: Array<{
  id: string;
  clientName: string;
  email: string;
  phone: string;
  companyName: string;
  sector: string;
  serviceInterest: string;
  date: string;
  time: string;
  status: 'Confirmada' | 'Pendiente' | 'Completada' | 'Cancelada';
  source: string;
  notes?: string;
  createdAt: string;
}> = [
  {
    id: 'res-101',
    clientName: 'Carlos M. Barrena',
    email: 'carlos@mesonlosolivos.es',
    phone: '612345678',
    companyName: 'Mesón Los Olivos',
    sector: 'Restauración',
    serviceInterest: 'Digital (Carta 3D + Reservas + WhatsApp)',
    date: '2026-03-20',
    time: '11:00',
    status: 'Confirmada',
    source: 'Landing PWA',
    notes: 'Quiere sustituir carta física y automatizar reservas en mesa.',
    createdAt: '2026-03-18T10:15:00Z',
  },
  {
    id: 'res-102',
    clientName: 'Dra. Elena Valdés',
    email: 'elena@clinicavaldessalud.com',
    phone: '644987654',
    companyName: 'Clínica Dental Valdés',
    sector: 'Clínicas y salud',
    serviceInterest: 'IA (Agente de citas + WhatsApp automático)',
    date: '2026-03-21',
    time: '16:30',
    status: 'Pendiente',
    source: 'Diagnóstico Web',
    notes: 'Interesada en desviar llamadas perdidas a WhatsApp con IA.',
    createdAt: '2026-03-19T09:40:00Z',
  },
  {
    id: 'res-103',
    clientName: 'Marcos Benítez',
    email: 'marcos@benitezabogados.com',
    phone: '689112233',
    companyName: 'Benítez & Asociados Asesores',
    sector: 'Gestorías y despachos',
    serviceInterest: 'Gestión y procesos + Kit Digital',
    date: '2026-03-22',
    time: '10:00',
    status: 'Confirmada',
    source: 'Comparador Propuestas',
    notes: 'Tiene presupuesto de otra agencia y quiere comparar calidad/precio.',
    createdAt: '2026-03-19T14:20:00Z',
  },
  {
    id: 'res-104',
    clientName: 'Lucía Santamaría',
    email: 'lucia@esteticalumiere.es',
    phone: '655889900',
    companyName: 'Lumière Belleza & Spa',
    sector: 'Belleza y bienestar',
    serviceInterest: 'Presencia + Reseñas Google automatizadas',
    date: '2026-03-23',
    time: '12:30',
    status: 'Pendiente',
    source: 'Agente IA Chat',
    notes: 'Contactó a través del chatbot tras preguntar por SEO local.',
    createdAt: '2026-03-20T08:10:00Z',
  }
];

let proposals: Array<{
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  sector: string;
  currentCompetitorBudget?: string;
  details: string;
  status: 'Recibido' | 'En análisis' | 'Propuesta enviada' | 'Aceptada';
  createdAt: string;
}> = [
  {
    id: 'prop-201',
    name: 'Javier Navarro',
    email: 'jnavarro@inmobiliarialareina.es',
    phone: '670334455',
    company: 'Inmobiliaria La Reina',
    sector: 'Inmobiliarias',
    currentCompetitorBudget: 'Presupuesto de 4.500€ + 250€/mes',
    details: 'Nos piden demasiado por un CRM básico. Buscamos automatizar visitas y tours virtuales 3D.',
    status: 'En análisis',
    createdAt: '2026-03-19T11:00:00Z'
  },
  {
    id: 'prop-202',
    name: 'Sofía Carrasco',
    email: 'sofiacarrasco@vitalfitness.es',
    phone: '699223344',
    company: 'Vital Fitness Club',
    sector: 'Comercio local',
    currentCompetitorBudget: '2.800€ solo por web estática',
    details: 'Queremos sistema de reserva de clases y control de altas.',
    status: 'Propuesta enviada',
    createdAt: '2026-03-18T16:45:00Z'
  }
];

// Real-time analytics tracking
let realTimeStats = {
  activeVisitors: 14,
  pageViewsToday: 642,
  diagnosticRequests: 28,
  conversionRate: '4.8%',
  popularSectors: [
    { name: 'Restauración', visits: 184, growth: '+32%' },
    { name: 'Clínicas y salud', visits: 142, growth: '+24%' },
    { name: 'Comercio local', visits: 118, growth: '+18%' },
    { name: 'Gestorías y despachos', visits: 96, growth: '+15%' },
    { name: 'Belleza y bienestar', visits: 72, growth: '+12%' },
  ],
  deviceDistribution: {
    mobile: 68,
    desktop: 28,
    tablet: 4,
  },
  sources: [
    { channel: 'Google / SEO Local', percentage: 41 },
    { channel: 'WhatsApp Directo', percentage: 27 },
    { channel: 'Redes Sociales', percentage: 19 },
    { channel: 'Referencias y boca a boca', percentage: 13 },
  ]
};

// Periodic fluctuation to simulate genuine live real-time users
setInterval(() => {
  const delta = Math.floor(Math.random() * 5) - 2;
  realTimeStats.activeVisitors = Math.max(8, Math.min(32, realTimeStats.activeVisitors + delta));
  realTimeStats.pageViewsToday += Math.floor(Math.random() * 2);
}, 6000);

// Initialize Gemini Client
let geminiAi: GoogleGenAI | null = null;
let geminiQuotaCooldownUntil = 0;

if (process.env.GEMINI_API_KEY) {
  geminiAi = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. API: AI Chat Assistant with Asexia Knowledge Base
const SYSTEM_INSTRUCTION = `Eres el Agente Virtual Inteligente de "Asexia: Tecnología práctica para pymes y negocios locales".
Tu misión es atender consultas con claridad, empatía, solvencia profesional y orientar a los usuarios hacia el diagnóstico gratuito de 15–20 minutos. Hablas en español de España.

DATOS VERIFICADOS DE CONTACTO:
- Empresa: Asexia.
- Teléfono / WhatsApp comercial: 609 735 753 (disponible de lunes a viernes).
- Correo electrónico: soyasexia@gmail.com
- Agenda para Diagnóstico Gratuito: https://calendly.com/mundoconfia/orientacion?month=2026-03&date=2026-03-20

LAS 4 LÍNEAS COMERCIALES DE ASEXIA:
1. Presencia Digital: Web profesional ultra rápida, adaptada a móvil (100/100 Google Speed), ficha de Google Business y Google Maps optimizada, captación de reseñas 5★, alojamiento y mantenimiento técnico continuo.
2. Captación: Canal directo de WhatsApp web/móvil, sistema de reservas y citas online 24/7, formularios ágiles de alta conversión, CRM visual y sencillo, asistentes de respuesta con IA para no perder llamadas ni mensajes.
3. Cumplimiento: Preparación y adaptación para facturación electrónica obligatoria, digitalización de documentos, control horario del equipo, tramitación de subvenciones (como Kit Digital financiado hasta el 100%) y cumplimiento RGPD.
4. Acelerador de Campañas: Publicidad hiperlocal en Google Ads y Redes Sociales, landing pages de alta conversión, reactivación periódica de clientes por WhatsApp y medición transparente del retorno.

ROL DE LA INTELIGENCIA ARTIFICIAL:
La IA y la automatización son herramientas al servicio de estas soluciones: trabajan en segundo plano para eliminar cuellos de botella y tareas manuales repetitivas.

COMPARADOR DE PROPUESTAS:
Si el cliente ya tiene una propuesta de otra agencia o empresa, Asexia la analiza sin compromiso para revisar tecnología, alcance, costes innecesarios y ofrecer una mejor alternativa calidad-precio.

POLÍTICA DE PRECIOS:
Asexia no ofrece tarifas genéricas cerradas sin conocer el negocio: se elabora una propuesta clara y ajustada tras el diagnóstico inicial gratuito de 15–20 minutos.

INVITACIÓN A LA ACCIÓN:
Invita al usuario a solicitar su diagnóstico gratuito o a contactar por teléfono/WhatsApp al 609 735 753.`;

app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'El mensaje es requerido.' });
    return;
  }

  // Attempt using Gemini API if key is configured and not in quota cooldown
  if (geminiAi && Date.now() >= geminiQuotaCooldownUntil) {
    try {
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add recent conversation history for context
      if (Array.isArray(conversationHistory)) {
        for (const item of conversationHistory.slice(-6)) {
          if (item.sender === 'user') {
            contents.push({ role: 'user', parts: [{ text: item.text }] });
          } else if (item.sender === 'ai') {
            contents.push({ role: 'model', parts: [{ text: item.text }] });
          }
        }
      }

      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await geminiAi.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const reply = response.text || 'Disculpa, no he podido procesar tu solicitud. ¿Te gustaría agendar una llamada directa de 15 minutos con nuestro equipo en el 609 735 753?';
      res.json({ reply, source: 'gemini-4-hydrogen' });
      return;
    } catch (err: any) {
      const errMsg = String(err?.message || '');
      const isQuotaOrBilling =
        err?.status === 402 ||
        err?.status === 429 ||
        errMsg.includes('402') ||
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('prepayment credits');

      if (isQuotaOrBilling) {
        // Pause external Gemini requests briefly and serve seamless local expert responses
        geminiQuotaCooldownUntil = Date.now() + 10 * 60 * 1000;
      }
    }
  }

  // Robust intelligent fallback knowledge engine
  const q = message.toLowerCase();
  let fallbackReply = '';

  if (q.includes('roi') || q.includes('ahorro') || q.includes('calcul') || q.includes('retorno') || q.includes('getafe') || q.includes('tamaño') || q.includes('micro') || q.includes('mediana')) {
    fallbackReply = 'Puedes estimar exactamente cuántas horas y euros recuperas en nuestra **Calculadora ROI** interactiva (con medias reales de **Getafe, Madrid** y selector de tamaño Micro, Pequeña o Mediana empresa). Al terminar, puedes enviarnos ese cálculo directo en tu diagnóstico gratuito o por WhatsApp al **609 735 753**.';
  } else if (q.includes('precio') || q.includes('coste') || q.includes('tarifa') || q.includes('cuanto') || q.includes('cuánto')) {
    fallbackReply = 'En Asexia no aplicamos precios genéricos cerrados porque adaptamos cada solución a la medida exacta de tu negocio. Realizamos un **diagnóstico inicial gratuito de 15 minutos** para analizar tus necesidades y darte una propuesta personalizada con el mejor retorno de inversión garantizado. ¿Te gustaría agendar tu diagnóstico ahora?';
  } else if (q.includes('reserv') || q.includes('cita') || q.includes('agendar') || q.includes('calendly') || q.includes('hora') || q.includes('diagnóstico') || q.includes('diagnostico')) {
    fallbackReply = '¡Por supuesto! Puedes agendar tu sesión de orientación gratuita de 15-20 minutos directamente desde el botón **"Quiero mi diagnóstico gratuito"** de esta web, o mediante nuestra agenda Calendly: https://calendly.com/mundoconfia/orientacion?month=2026-03&date=2026-03-20. También puedes llamarnos o escribirnos por WhatsApp al **609 735 753**.';
  } else if (q.includes('ia') || q.includes('inteligencia') || q.includes('chatbot') || q.includes('agente') || q.includes('automatiz')) {
    fallbackReply = 'Implementamos **Agentes de IA** y automatizaciones prácticas (para WhatsApp, reservas y gestión diaria) capaces de responder a tus clientes las 24 horas, gestionar citas, filtrar pedidos y eliminar tareas repetitivas en facturación, firma digital o escandallos.';
  } else if (q.includes('propuesta') || q.includes('presupuesto') || q.includes('comparar') || q.includes('otra empresa')) {
    fallbackReply = '¡Tenemos un servicio especial de **Comparador de Propuestas**! Si ya te han presentado un presupuesto en otra agencia, envíanoslo. Lo analizamos sin compromiso y te indicamos si hay costes inflados, servicios innecesarios o si podemos ofrecerte más valor y tecnología avanzada por un precio mucho más justo.';
  } else if (q.includes('kit digital') || q.includes('ayuda') || q.includes('subvenc')) {
    fallbackReply = 'Asesoramos y tramitamos las ayudas del **Kit Digital** y subvenciones públicas para autónomos y PYMEs. Te ayudamos a conseguir hasta 100% de financiación en soluciones de presencia web, CRM, gestión de procesos y automatización.';
  } else if (q.includes('contacto') || q.includes('telefono') || q.includes('teléfono') || q.includes('email') || q.includes('correo') || q.includes('whatsapp')) {
    fallbackReply = 'Puedes contactar directamente con el equipo de Asexia:\n• **Teléfono / WhatsApp:** 609 735 753\n• **Email:** soyasexia@gmail.com\n• **Agenda online:** https://calendly.com/mundoconfia/orientacion\nEstamos disponibles para ayudarte a impulsar tu negocio.';
  } else if (q.includes('restauran') || q.includes('bar') || q.includes('carta') || q.includes('hostel')) {
    fallbackReply = 'Para hostelería y restauración disponemos de **control de escandallos**, cartas digitales interactivas, reservas directas sin comisiones por WhatsApp y captación automática de reseñas 5 estrellas en Google.';
  } else if (q.includes('clínic') || q.includes('clinic') || q.includes('salud') || q.includes('dental') || q.includes('fisioter')) {
    fallbackReply = 'Para clínicas y consultas de salud integramos **agenda médica 24/7**, recordatorios automáticos por WhatsApp para evitar ausencias (*no-shows*), lista de espera automática y consentimientos informados en firma digital.';
  } else if (q.includes('despacho') || q.includes('gestor') || q.includes('abogad') || q.includes('servicio') || q.includes('firma')) {
    fallbackReply = 'Para despachos y servicios profesionales implantamos **firma digital legal**, seguimiento automático de presupuestos, clasificación documental y cumplimiento de facturación electrónica sin persecuciones manuales.';
  } else if (q.includes('inmobiliaria') || q.includes('piso') || q.includes('comercio') || q.includes('tienda')) {
    fallbackReply = 'Tanto para comercios locales como para inmobiliarias conectamos **Google Maps 5★**, catálogo o fichas digitales, filtrado automático de interesados por WhatsApp y agenda directa sin llamadas perdidas.';
  } else {
    fallbackReply = `¡Hola! En **Asexia** ayudamos a tu PYME a conseguir más clientes y ahorrar tiempo gracias a presencia digital moderna, automatizaciones eficaces y soluciones adaptadas a tu sector.\n\n¿Qué tipo de negocio tienes o qué área te gustaría optimizar? También puedes usar nuestra **Calculadora ROI**, reservar tu **diagnóstico gratuito de 15 minutos** o contactarnos al **609 735 753**.`;
  }

  res.json({ reply: fallbackReply, source: 'expert-engine' });
});

// 2. API: Bookings Management
app.get('/api/bookings', (_req: Request, res: Response) => {
  res.json({ bookings, count: bookings.length });
});

app.post('/api/bookings', (req: Request, res: Response) => {
  const { clientName, email, phone, companyName, sector, serviceInterest, date, time, notes, source } = req.body;

  if (!clientName || !email || !phone) {
    res.status(400).json({ error: 'Nombre, email y teléfono son obligatorios.' });
    return;
  }

  const newBooking = {
    id: `res-${Date.now().toString().slice(-4)}`,
    clientName,
    email,
    phone,
    companyName: companyName || 'Empresa particular',
    sector: sector || 'General',
    serviceInterest: serviceInterest || 'Diagnóstico integral',
    date: date || new Date().toISOString().split('T')[0],
    time: time || '11:00',
    status: 'Pendiente' as const,
    source: source || 'Web PWA',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  bookings.unshift(newBooking);
  realTimeStats.diagnosticRequests += 1;

  // Also register/merge automatically inside Unified CRM
  const crmResult = upsertClientAndOpportunity(crmStore, roiConfigStore, {
    name: clientName,
    companyName: newBooking.companyName,
    sectorLabel: newBooking.sector,
    phone,
    email,
    source: 'booking-web',
    note: `Reserva web (${newBooking.date} ${newBooking.time}) · Interés: ${newBooking.serviceInterest}. ${notes || ''}`.trim(),
  });
  triggerAutoSyncIfEnabled(crmResult.opportunity.id);

  res.status(201).json({
    success: true,
    message: 'Reserva registrada con éxito.',
    booking: newBooking,
  });
});

app.patch('/api/bookings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const target = bookings.find((b) => b.id === id);
  if (!target) {
    res.status(404).json({ error: 'Reserva no encontrada.' });
    return;
  }

  if (status) target.status = status;
  if (notes !== undefined) target.notes = notes;

  res.json({ success: true, booking: target });
});

app.patch('/api/bookings/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const target = bookings.find((b) => b.id === id);
  if (!target) {
    res.status(404).json({ error: 'Reserva no encontrada.' });
    return;
  }

  if (status) target.status = status;
  if (notes !== undefined) target.notes = notes;

  res.json({ success: true, booking: target });
});

// 3. API: Proposal Comparison Requests
app.get('/api/proposals', (_req: Request, res: Response) => {
  res.json({ proposals, count: proposals.length });
});

app.post('/api/proposals', (req: Request, res: Response) => {
  const { name, email, phone, company, sector, currentCompetitorBudget, details } = req.body;

  if (!name || !email || !phone) {
    res.status(400).json({ error: 'Nombre, email y teléfono son requeridos.' });
    return;
  }

  const newProposal = {
    id: `prop-${Date.now().toString().slice(-4)}`,
    name,
    email,
    phone,
    company: company || 'Empresa / Negocio',
    sector: sector || 'No especificado',
    currentCompetitorBudget: currentCompetitorBudget || 'No indicado',
    details: details || 'Solicitud de comparativa de costes y servicios.',
    status: 'Recibido' as const,
    createdAt: new Date().toISOString(),
  };

  proposals.unshift(newProposal);

  // Also mirror proposal inside Unified CRM
  const crmPropResult = upsertClientAndOpportunity(crmStore, roiConfigStore, {
    name,
    companyName: newProposal.company,
    sectorLabel: newProposal.sector,
    phone,
    email,
    source: 'proposal-comparator',
    note: `Comparativa solicitada. Presupuesto actual: ${newProposal.currentCompetitorBudget}. ${newProposal.details}`,
  });
  triggerAutoSyncIfEnabled(crmPropResult.opportunity.id);

  res.status(201).json({ success: true, proposal: newProposal });
});

// 4. API: Real-time Analytics
app.get('/api/analytics', (_req: Request, res: Response) => {
  res.json({
    stats: realTimeStats,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === 'Pendiente').length,
    confirmedBookings: bookings.filter((b) => b.status === 'Confirmada').length,
    totalProposals: proposals.length,
  });
});

app.post('/api/analytics/track', (req: Request, res: Response) => {
  const { event } = req.body;
  if (event === 'pageview') {
    realTimeStats.pageViewsToday += 1;
  }
  res.json({ status: 'tracked', event });
});

// 5. API: ROI Calculator & Conversion CTAs Configuration
app.get('/api/roi-config', (_req: Request, res: Response) => {
  res.json({ config: roiConfigStore });
});

app.put('/api/roi-config', (req: Request, res: Response) => {
  const incoming = req.body?.config ?? req.body;
  const updated = sanitizeRoiConfig(incoming);
  roiConfigStore = updated;
  saveRoiConfig(updated);
  res.json({ success: true, config: roiConfigStore });
});

app.post('/api/roi-config/reset', (_req: Request, res: Response) => {
  const resetConfig = cloneDefaultRoiConfig();
  resetConfig.updatedAt = new Date().toISOString();
  roiConfigStore = resetConfig;
  saveRoiConfig(resetConfig);
  res.json({ success: true, config: roiConfigStore });
});

// 6. API: Unified CRM (ROI + Diagnóstico ConfIA360 + Entregables + Propuestas + CaptaGlobal)
app.get('/api/crm/overview', (_req: Request, res: Response) => {
  res.json({
    clients: crmStore.clients,
    opportunities: crmStore.opportunities,
    captaGlobalConfig: crmStore.captaGlobalConfig,
  });
});

app.post('/api/crm/intake', async (req: Request, res: Response) => {
  const {
    name,
    companyName,
    sectorId,
    sectorLabel,
    companySizeId,
    postalCode,
    phone,
    email,
    source,
    opportunityId,
    diagnosticTier,
    roiInputs,
    areaScores,
    proChecklistKeys,
    vipFocusGoal,
    note,
    deliverable,
  } = req.body || {};

  if (!name || !email || !phone) {
    res.status(400).json({ error: 'Nombre, teléfono y email son obligatorios para guardar el estudio.' });
    return;
  }

  const result = upsertClientAndOpportunity(crmStore, roiConfigStore, {
    name: String(name),
    companyName: String(companyName || `Empresa de ${name}`),
    sectorId,
    sectorLabel,
    companySizeId,
    postalCode: String(postalCode || ''),
    phone: String(phone),
    email: String(email),
    source: source || 'diagnostico-confia360',
    opportunityId,
    diagnosticTier,
    roiInputs,
    areaScores,
    proChecklistKeys,
    vipFocusGoal,
    note,
    deliverable,
  });

  realTimeStats.diagnosticRequests += 1;
  triggerAutoSyncIfEnabled(result.opportunity.id);

  res.status(201).json({
    success: true,
    client: result.client,
    opportunity: result.opportunity,
    isNewClient: result.isNewClient,
    autoSyncEnabled: Boolean(crmStore.captaGlobalConfig?.autoSyncOnIntake),
  });
});

app.patch('/api/crm/opportunities/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const opp = crmStore.opportunities.find((o) => o.id === id);
  if (!opp) {
    res.status(404).json({ error: 'Oportunidad no encontrada.' });
    return;
  }
  const client = crmStore.clients.find((c) => c.id === opp.clientId);
  if (!client) {
    res.status(404).json({ error: 'Cliente asociado no encontrado.' });
    return;
  }

  const now = new Date().toISOString();
  const {
    clientPatch,
    stage,
    assignedOwner,
    nextFollowUpAt,
    diagnosticTier,
    roiInputs,
    areaScores,
    proChecklistKeys,
    vipFocusGoal,
  } = req.body || {};

  if (clientPatch && typeof clientPatch === 'object') {
    if (typeof clientPatch.name === 'string' && clientPatch.name.trim()) client.name = clientPatch.name.trim();
    if (typeof clientPatch.companyName === 'string' && clientPatch.companyName.trim()) {
      client.companyName = clientPatch.companyName.trim();
    }
    if (typeof clientPatch.postalCode === 'string') client.postalCode = clientPatch.postalCode.trim();
    if (typeof clientPatch.phone === 'string' && clientPatch.phone.trim()) client.phone = clientPatch.phone.trim();
    if (typeof clientPatch.email === 'string' && clientPatch.email.trim()) client.email = clientPatch.email.trim();
    if (clientPatch.sectorId && roiConfigStore.sectors[clientPatch.sectorId as RoiSectorId]) {
      client.sectorId = clientPatch.sectorId;
      client.sectorLabel = roiConfigStore.sectors[clientPatch.sectorId as RoiSectorId].name;
    }
    if (clientPatch.companySizeId && roiConfigStore.companySizes[clientPatch.companySizeId as CompanySizeId]) {
      client.companySizeId = clientPatch.companySizeId;
    }
    client.updatedAt = now;
  }

  if (stage) opp.stage = stage;
  if (typeof assignedOwner === 'string') opp.assignedOwner = assignedOwner;
  if (typeof nextFollowUpAt === 'string') opp.nextFollowUpAt = nextFollowUpAt;

  const sectorDefaults = roiConfigStore.sectors[client.sectorId] || roiConfigStore.sectors.clinicas;

  if (roiInputs && typeof roiInputs === 'object') {
    const updatedInputs = {
      ...roiInputs,
      sectorId: client.sectorId,
      companySizeId: client.companySizeId,
    };
    const recalculated = calculateRoiResults(
      updatedInputs,
      sectorDefaults,
      roiConfigStore.globalRates,
      roiConfigStore.companySizes
    );
    opp.roiSimulation = {
      inputs: updatedInputs,
      results: recalculated,
      updatedAt: now,
      editedByAdmin: true,
    };
    opp.estimatedAnnualValue = recalculated.annualNetBenefit;
  }

  const nextTier: DiagnosticTier = diagnosticTier || opp.diagnosticTier;
  opp.diagnosticTier = nextTier;

  if (areaScores || diagnosticTier || proChecklistKeys || vipFocusGoal !== undefined || roiInputs) {
    const scoresToUse =
      areaScores ||
      opp.diagnosticResult?.areaScores ||
      createDefaultAreaScores(client.sectorId);
    const checksToUse = proChecklistKeys || opp.diagnosticResult?.proChecklistKeys || [];
    const goalToUse =
      vipFocusGoal !== undefined
        ? vipFocusGoal
        : opp.diagnosticResult?.vipFocusGoal || 'Escalar captación y automatización en 90 días';

    opp.diagnosticResult = buildDiagnosticEvaluation({
      sectorId: client.sectorId,
      companySizeId: client.companySizeId,
      tier: nextTier,
      areaScores: scoresToUse,
      proChecklistKeys: checksToUse,
      vipFocusGoal: goalToUse,
      roiResult: opp.roiSimulation?.results || null,
    });
  }

  opp.title = `${sectorDefaults.shortName} · ${client.companyName}`;
  opp.updatedAt = now;
  opp.communications.unshift({
    id: `com-edit-${Date.now().toString(36)}`,
    type: 'nota',
    direction: 'interno',
    summary: 'Ficha de oportunidad / ROI / diagnóstico actualizada desde Administración.',
    createdAt: now,
  });

  saveCrmStore(crmStore);
  triggerAutoSyncIfEnabled(opp.id);
  res.json({ success: true, client, opportunity: opp });
});

app.post('/api/crm/opportunities/:id/deliverables', (req: Request, res: Response) => {
  const { id } = req.params;
  const opp = crmStore.opportunities.find((o) => o.id === id);
  if (!opp) {
    res.status(404).json({ error: 'Oportunidad no encontrada.' });
    return;
  }
  const { type, tier, channel, recipient, summary } = req.body || {};
  const now = new Date().toISOString();
  const entry = {
    id: `del-${Date.now().toString(36)}`,
    type: type || 'dossier-html',
    tier: tier || opp.diagnosticTier,
    channel: channel || 'descarga',
    recipient: recipient || '',
    summary: summary || 'Entregable generado desde CRM',
    generatedAt: now,
  };
  opp.deliverables.unshift(entry);
  opp.communications.unshift({
    id: `com-del-${Date.now().toString(36)}`,
    type: channel === 'whatsapp' ? 'whatsapp' : channel === 'email' ? 'email' : 'nota',
    direction: 'saliente',
    summary: `Entregable (${entry.type} · ${entry.tier.toUpperCase()}) vía ${entry.channel}: ${entry.summary}`,
    createdAt: now,
  });
  opp.updatedAt = now;
  saveCrmStore(crmStore);
  res.status(201).json({ success: true, deliverable: entry, opportunity: opp });
});

app.post('/api/crm/opportunities/:id/proposals', (req: Request, res: Response) => {
  const { id } = req.params;
  const opp = crmStore.opportunities.find((o) => o.id === id);
  if (!opp) {
    res.status(404).json({ error: 'Oportunidad no encontrada.' });
    return;
  }
  const { title, setupFee, monthlyFee, kitDigitalApplied, servicesIncluded, notes, status } = req.body || {};
  const now = new Date().toISOString();
  const proposal = {
    id: `crmprop-${Date.now().toString(36)}`,
    title: String(title || `Propuesta ConfIA360 · ${opp.title}`),
    setupFee: Number(setupFee) || 0,
    monthlyFee: Number(monthlyFee) || 0,
    kitDigitalApplied: Boolean(kitDigitalApplied),
    servicesIncluded: Array.isArray(servicesIncluded) ? servicesIncluded : [],
    notes: String(notes || ''),
    status: status || 'borrador',
    createdAt: now,
  };
  opp.proposals.unshift(proposal);
  if (opp.stage === 'nuevo' || opp.stage === 'diagnostico' || opp.stage === 'roi-enviado') {
    opp.stage = 'propuesta';
  }
  opp.communications.unshift({
    id: `com-prop-${Date.now().toString(36)}`,
    type: 'nota',
    direction: 'interno',
    summary: `Propuesta creada: "${proposal.title}" (${proposal.monthlyFee} €/mes · Setup ${proposal.setupFee} €).`,
    createdAt: now,
  });
  opp.updatedAt = now;
  saveCrmStore(crmStore);
  res.status(201).json({ success: true, proposal, opportunity: opp });
});

app.patch('/api/crm/opportunities/:id/proposals/:proposalId', (req: Request, res: Response) => {
  const { id, proposalId } = req.params;
  const opp = crmStore.opportunities.find((o) => o.id === id);
  if (!opp) {
    res.status(404).json({ error: 'Oportunidad no encontrada.' });
    return;
  }
  const prop = opp.proposals.find((p) => p.id === proposalId);
  if (!prop) {
    res.status(404).json({ error: 'Propuesta no encontrada.' });
    return;
  }
  if (req.body?.status) prop.status = req.body.status;
  opp.updatedAt = new Date().toISOString();
  saveCrmStore(crmStore);
  res.json({ success: true, proposal: prop, opportunity: opp });
});

app.post('/api/crm/opportunities/:id/communications', (req: Request, res: Response) => {
  const { id } = req.params;
  const opp = crmStore.opportunities.find((o) => o.id === id);
  if (!opp) {
    res.status(404).json({ error: 'Oportunidad no encontrada.' });
    return;
  }
  const { type, direction, summary } = req.body || {};
  if (!summary || !String(summary).trim()) {
    res.status(400).json({ error: 'El resumen de la comunicación es obligatorio.' });
    return;
  }
  const now = new Date().toISOString();
  const comm = {
    id: `com-${Date.now().toString(36)}`,
    type: type || 'nota',
    direction: direction || 'saliente',
    summary: String(summary).trim(),
    createdAt: now,
  };
  opp.communications.unshift(comm);
  opp.updatedAt = now;
  saveCrmStore(crmStore);
  res.status(201).json({ success: true, communication: comm, opportunity: opp });
});

app.put('/api/crm/captaglobal/config', (req: Request, res: Response) => {
  const { endpointUrl, webhookPath, apiKey, autoSyncOnIntake } = req.body || {};
  crmStore.captaGlobalConfig = {
    endpointUrl:
      typeof endpointUrl === 'string' && endpointUrl.trim()
        ? endpointUrl.trim().replace(/\/+$/, '')
        : crmStore.captaGlobalConfig.endpointUrl,
    webhookPath:
      typeof webhookPath === 'string'
        ? webhookPath.trim()
        : crmStore.captaGlobalConfig.webhookPath,
    apiKey: typeof apiKey === 'string' ? apiKey.trim() : crmStore.captaGlobalConfig.apiKey,
    autoSyncOnIntake:
      typeof autoSyncOnIntake === 'boolean'
        ? autoSyncOnIntake
        : crmStore.captaGlobalConfig.autoSyncOnIntake,
    updatedAt: new Date().toISOString(),
  };
  saveCrmStore(crmStore);
  res.json({ success: true, captaGlobalConfig: crmStore.captaGlobalConfig });
});

app.post('/api/crm/opportunities/:id/sync-captaglobal', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await executeCaptaGlobalSync(id, { isAuto: false });
  if (!result.opportunity) {
    res.status(404).json({ error: result.message });
    return;
  }
  res.json({
    success: result.success,
    message: result.message,
    opportunity: result.opportunity,
    payload: result.payload,
  });
});

app.post('/api/crm/captaglobal/sync-pending', async (_req: Request, res: Response) => {
  const targets = crmStore.opportunities.filter(
    (o) =>
      o.captaGlobalSync?.status === 'pending' ||
      o.captaGlobalSync?.status === 'queued' ||
      o.captaGlobalSync?.status === 'error'
  );

  let syncedCount = 0;
  let failedCount = 0;

  for (const opp of targets) {
    const syncRes = await executeCaptaGlobalSync(opp.id, { isAuto: false });
    if (syncRes.success) syncedCount += 1;
    else failedCount += 1;
  }

  res.json({
    success: failedCount === 0,
    total: targets.length,
    syncedCount,
    failedCount,
    opportunities: crmStore.opportunities,
  });
});

app.post('/api/crm/captaglobal/test-connection', async (req: Request, res: Response) => {
  const endpointUrl = String(
    req.body?.endpointUrl || crmStore.captaGlobalConfig.endpointUrl || ''
  )
    .trim()
    .replace(/\/+$/, '');
  const apiKey = String(req.body?.apiKey ?? crmStore.captaGlobalConfig.apiKey ?? '').trim();

  if (!endpointUrl) {
    res.status(400).json({ reachable: false, message: 'URL de CaptaGlobal no especificada.' });
    return;
  }

  const startedAt = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const headers: Record<string, string> = { Accept: 'application/json, text/html' };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['X-API-Key'] = apiKey;
    }

    const remoteRes = await fetch(endpointUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startedAt;

    res.json({
      reachable: remoteRes.status < 500,
      status: remoteRes.status,
      latencyMs,
      targetUrl: endpointUrl,
      message:
        remoteRes.status < 400
          ? `Conexión activa con CaptaGlobal (HTTP ${remoteRes.status} · ${latencyMs} ms).`
          : `Servidor accesible con respuesta HTTP ${remoteRes.status} (${latencyMs} ms). Verifica la ruta webhook o clave API si procede.`,
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startedAt;
    res.json({
      reachable: false,
      status: 0,
      latencyMs,
      targetUrl: endpointUrl,
      message: `No se pudo alcanzar ${endpointUrl} (${err?.message || 'tiempo agotado'}). La cola automática y exportación CSV/JSON siguen operativas.`,
    });
  }
});

app.post('/api/crm/webhooks/captaglobal', (req: Request, res: Response) => {
  const rawBody = req.body || {};
  const list = Array.isArray(rawBody)
    ? rawBody
    : Array.isArray(rawBody.leads)
    ? rawBody.leads
    : [rawBody];

  const imported: Array<{ client: any; opportunity: any }> = [];

  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const c = item.client || item;
    const name = c.name || c.nombre || c.contacto || item.name || item.nombre;
    const companyName =
      c.companyName || c.empresa || c.company || item.empresa || `Empresa de ${name || 'CaptaGlobal'}`;
    const phone = c.phone || c.telefono || c.movil || item.telefono || '';
    const email = c.email || c.correo || item.email || '';
    const postalCode = c.postalCode || c.cp || c.codigo_postal || c.codigoPostal || item.cp || '';
    const rawSector = c.sectorId || c.sector || item.sector || '';
    const rawSize = c.companySizeId || c.tamano || c.size || 'micro';

    if (!name || (!email && !phone)) continue;

    const sectorId = roiConfigStore.sectors[rawSector as RoiSectorId]
      ? (rawSector as RoiSectorId)
      : mapSectorTextToId(String(rawSector));

    const result = upsertClientAndOpportunity(crmStore, roiConfigStore, {
      name: String(name),
      companyName: String(companyName),
      sectorId,
      companySizeId: mapSizeTextToId(String(rawSize)),
      postalCode: String(postalCode),
      phone: String(phone || 'Sin teléfono'),
      email: String(email || `${String(name).toLowerCase().replace(/[^a-z0-9]/g, '')}@captaglobal.local`),
      source: 'captaglobal',
      externalLeadId: String(
        item.externalId || item.id || item.opportunity?.id || `CG-${Date.now().toString().slice(-5)}`
      ),
      note: String(item.notes || item.notas || item.summary || 'Lead importado desde ConfIA360 CaptaGlobal.'),
    });
    imported.push({ client: result.client, opportunity: result.opportunity });
  }

  if (imported.length === 0) {
    res.status(400).json({
      error: 'El payload debe incluir al menos nombre y email o teléfono.',
    });
    return;
  }

  res.status(201).json({
    success: true,
    importedCount: imported.length,
    message:
      imported.length === 1
        ? 'Lead de CaptaGlobal integrado en el CRM unificado.'
        : `${imported.length} leads de CaptaGlobal integrados en el CRM unificado.`,
    client: imported[0].client,
    opportunity: imported[0].opportunity,
  });
});

// Setup Vite Dev Middleware or Static Serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Asexia Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
