import {
  ACTING_PRINCIPLES,
  CrmClient,
  CrmOpportunity,
  DiagnosticResult,
  SECTOR_DIAGNOSTIC_TEMPLATES,
  STAGE_LABELS,
  TIER_LABELS,
} from '../types/confia360';
import { RoiCalculationResult, RoiUserInputs } from '../types/roi';

function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function triggerFileDownload(content: string, mimeType: string, filename: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildCaptaGlobalPayload(client: CrmClient, opportunity: CrmOpportunity) {
  return {
    schema: 'confia360.captaglobal.opportunity.v1',
    exportedAt: new Date().toISOString(),
    sourcePlatform: 'Asexia Web & Diagnóstico ConfIA360',
    opportunity: {
      id: opportunity.id,
      title: opportunity.title,
      stage: opportunity.stage,
      stageLabel: STAGE_LABELS[opportunity.stage],
      source: opportunity.source,
      diagnosticTier: opportunity.diagnosticTier,
      estimatedAnnualValue: opportunity.estimatedAnnualValue,
      nextFollowUpAt: opportunity.nextFollowUpAt,
      assignedOwner: opportunity.assignedOwner,
    },
    client: {
      id: client.id,
      name: client.name,
      companyName: client.companyName,
      sectorId: client.sectorId,
      sectorLabel: client.sectorLabel,
      companySizeId: client.companySizeId,
      postalCode: client.postalCode,
      phone: client.phone,
      email: client.email,
    },
    diagnostic: opportunity.diagnosticResult
      ? {
          brandTitle: opportunity.diagnosticResult.brandTitle,
          tier: opportunity.diagnosticResult.tier,
          maturityScore: opportunity.diagnosticResult.maturityScore,
          maturityLevel: opportunity.diagnosticResult.maturityLevel,
          areaScores: opportunity.diagnosticResult.areaScores,
          prioritizedActions: opportunity.diagnosticResult.prioritizedActions,
          recommendedServices: opportunity.diagnosticResult.recommendedServices.map((s) => s.name),
          roadmap: opportunity.diagnosticResult.roadmap,
          dafo: opportunity.diagnosticResult.dafo,
        }
      : null,
    roiSimulation: opportunity.roiSimulation
      ? {
          inputs: opportunity.roiSimulation.inputs,
          results: {
            savedHoursWeek: opportunity.roiSimulation.results.savedHoursWeek,
            savedHoursYear: opportunity.roiSimulation.results.savedHoursYear,
            monthlyOperationalSavings: opportunity.roiSimulation.results.monthlyOperationalSavings,
            monthlyRecoveredRevenue: opportunity.roiSimulation.results.monthlyRecoveredRevenue,
            annualNetBenefit: opportunity.roiSimulation.results.annualNetBenefit,
            roiPercent: opportunity.roiSimulation.results.roiPercent,
            paybackWeeks: opportunity.roiSimulation.results.paybackWeeks,
          },
        }
      : null,
    proposals: opportunity.proposals,
    communicationsCount: opportunity.communications.length,
    deliverablesCount: opportunity.deliverables.length,
  };
}

export function buildDeliverablePlainText(params: {
  client: CrmClient;
  opportunity?: CrmOpportunity;
  diagnostic?: DiagnosticResult;
  roiInputs?: RoiUserInputs;
  roiResults?: RoiCalculationResult;
}): string {
  const { client, opportunity, diagnostic, roiResults } = params;
  const tpl = SECTOR_DIAGNOSTIC_TEMPLATES[client.sectorId] || SECTOR_DIAGNOSTIC_TEMPLATES.clinicas;
  const lines: string[] = [
    `${tpl.brandTitle.toUpperCase()} — INFORME EJECUTIVO DE DIAGNÓSTICO Y ROI`,
    '========================================================================',
    `Fecha: ${new Date().toLocaleDateString('es-ES')}`,
    `Cliente: ${client.name} · Empresa: ${client.companyName}`,
    `Sector: ${client.sectorLabel} · Código Postal: ${client.postalCode || 'N/D'}`,
    `Contacto: ${client.phone} · ${client.email}`,
    opportunity ? `Etapa CRM: ${STAGE_LABELS[opportunity.stage]} · Nivel: ${TIER_LABELS[opportunity.diagnosticTier]}` : '',
    '',
  ].filter(Boolean);

  if (diagnostic) {
    lines.push(
      `1. ÍNDICE DE MADUREZ DIGITAL (${diagnostic.tier.toUpperCase()}): ${diagnostic.maturityScore}/100 — Nivel ${diagnostic.maturityLevel}`,
      '',
      '2. PUNTUACIÓN EN LAS 10 ÁREAS CLAVE'
    );
    tpl.areas.forEach((a) => {
      lines.push(`   ${a.areaNumber}. ${a.title}: ${diagnostic.areaScores[a.key] ?? 4}/10`);
    });

    lines.push('', '3. MAPA DE INEFICIENCIAS Y PRIORIDADES');
    diagnostic.prioritizedActions.forEach((act, idx) => {
      lines.push(`   [${act.priority}] ${idx + 1}. ${act.title} -> ${act.detail} (${act.serviceName})`);
    });

    if (diagnostic.tier === 'pro' || diagnostic.tier === 'vip') {
      lines.push('', '4. DAFO ESTRATÉGICO');
      lines.push(`   Fortalezas: ${diagnostic.dafo.strengths.join(' | ')}`);
      lines.push(`   Debilidades: ${diagnostic.dafo.weaknesses.join(' | ')}`);
      lines.push(`   Oportunidades: ${diagnostic.dafo.opportunities.join(' | ')}`);
      lines.push(`   Amenazas: ${diagnostic.dafo.threats.join(' | ')}`);

      lines.push('', '5. RIESGOS TECNOLÓGICOS Y NORMATIVOS');
      diagnostic.risks.forEach((r) => lines.push(`   - ${r}`));

      lines.push('', '6. OPORTUNIDADES DE IA IDENTIFICADAS');
      diagnostic.aiOpportunities.forEach((ai) => lines.push(`   - ${ai}`));

      lines.push('', '7. HOJA DE RUTA (30 / 90 / 180 DÍAS)');
      lines.push('   [30 DÍAS] ' + diagnostic.roadmap.days30.join(' | '));
      lines.push('   [90 DÍAS] ' + diagnostic.roadmap.days90.join(' | '));
      lines.push('   [180 DÍAS] ' + diagnostic.roadmap.days180.join(' | '));
    }

    if (diagnostic.tier === 'vip') {
      lines.push('', '8. INDICADORES DE ÉXITO PROYECTADOS');
      diagnostic.successKpis.forEach((k) => lines.push(`   - ${k.label}: ${k.projectedTarget}`));

      lines.push('', '9. SERVICIOS CONFIA360 RECOMENDADOS');
      diagnostic.recommendedServices.forEach((s) => lines.push(`   - ${s.name}: ${s.subtitle}`));
    }
  }

  if (roiResults) {
    lines.push(
      '',
      'SIMULACIÓN ECONÓMICA Y ROI ESTIMADO',
      `- Tiempo liberado: ${roiResults.savedHoursWeek} h/semana (${roiResults.savedHoursYear} h/año · -${roiResults.timeReductionPercent}% carga manual)`,
      `- Ahorro operativo mensual: ${roiResults.monthlyOperationalSavings.toLocaleString('es-ES')} €/mes`,
      `- Ingresos recuperados estimados: +${roiResults.monthlyRecoveredRevenue.toLocaleString('es-ES')} €/mes (~${roiResults.recoveredLeadsMonth} oportunidades/mes)`,
      `- Beneficio neto anual estimado: ${roiResults.annualNetBenefit.toLocaleString('es-ES')} €/año`,
      `- ROI anual estimado: ${roiResults.roiPercent}% · Amortización en ~${roiResults.paybackWeeks} semanas`
    );
  }

  lines.push(
    '',
    'Principios de actuación AsExiA | MUNDOConfIA: ' + ACTING_PRINCIPLES.join(' · '),
    'Contacto: www.asexia.es · 609 735 753 · soyasexia@gmail.com'
  );

  return lines.join('\n');
}

export function downloadDeliverableTxt(params: {
  client: CrmClient;
  opportunity?: CrmOpportunity;
  diagnostic?: DiagnosticResult;
  roiInputs?: RoiUserInputs;
  roiResults?: RoiCalculationResult;
}): void {
  const txt = buildDeliverablePlainText(params);
  const slug = (params.client.companyName || params.client.name || 'empresa')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  triggerFileDownload(txt, 'text/plain;charset=utf-8', `dossier-confia360-${slug}.txt`);
}

export function downloadCaptaGlobalJson(client: CrmClient, opportunity: CrmOpportunity): void {
  const payload = buildCaptaGlobalPayload(client, opportunity);
  const slug = (client.companyName || client.name || 'oportunidad')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  triggerFileDownload(
    JSON.stringify(payload, null, 2),
    'application/json;charset=utf-8',
    `captaglobal-${slug}-${opportunity.id}.json`
  );
}

export function downloadDeliverableHtml(params: {
  client: CrmClient;
  opportunity?: CrmOpportunity;
  diagnostic?: DiagnosticResult;
  roiResults?: RoiCalculationResult;
}): void {
  const { client, opportunity, diagnostic, roiResults } = params;
  const tpl = SECTOR_DIAGNOSTIC_TEMPLATES[client.sectorId] || SECTOR_DIAGNOSTIC_TEMPLATES.clinicas;
  const tierLabel = diagnostic ? TIER_LABELS[diagnostic.tier] : opportunity ? TIER_LABELS[opportunity.diagnosticTier] : 'Base';

  const areasHtml = diagnostic
    ? tpl.areas
        .map((a) => {
          const score = diagnostic.areaScores[a.key] ?? 4;
          const pct = score * 10;
          return `
            <div class="area-row">
              <div class="area-head">
                <span><strong>${a.areaNumber}.</strong> ${escapeHtml(a.title)}</span>
                <span class="mono">${score}/10</span>
              </div>
              <div class="bar-bg"><div class="bar-fill" style="width:${pct}%"></div></div>
            </div>
          `;
        })
        .join('')
    : '<p>Diagnóstico pendiente de completar.</p>';

  const proSectionHtml =
    diagnostic && (diagnostic.tier === 'pro' || diagnostic.tier === 'vip')
      ? `
      <div class="grid-2">
        <div class="card">
          <h3>DAFO Estratégico</h3>
          <p><strong>Fortalezas:</strong> ${diagnostic.dafo.strengths.map(escapeHtml).join(' · ')}</p>
          <p><strong>Debilidades:</strong> ${diagnostic.dafo.weaknesses.map(escapeHtml).join(' · ')}</p>
          <p><strong>Oportunidades:</strong> ${diagnostic.dafo.opportunities.map(escapeHtml).join(' · ')}</p>
          <p><strong>Amenazas:</strong> ${diagnostic.dafo.threats.map(escapeHtml).join(' · ')}</p>
        </div>
        <div class="card">
          <h3>Riesgos y Oportunidades de IA</h3>
          <ul>${diagnostic.risks.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
          <h4 style="margin-top:10px;color:#0284c7;">Palancas de IA aplicables</h4>
          <ul>${diagnostic.aiOpportunities.map((o) => `<li>${escapeHtml(o)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="card" style="margin-top:14px;">
        <h3>Hoja de Ruta 30 / 90 / 180 Días</h3>
        <div class="grid-3">
          <div><strong>Primeros 30 días</strong><ul>${diagnostic.roadmap.days30.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div>
          <div><strong>Días 31 a 90</strong><ul>${diagnostic.roadmap.days90.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div>
          <div><strong>Días 91 a 180</strong><ul>${diagnostic.roadmap.days180.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div>
        </div>
      </div>`
      : '';

  const vipSectionHtml =
    diagnostic && diagnostic.tier === 'vip'
      ? `
      <div class="grid-2" style="margin-top:14px;">
        <div class="card">
          <h3>Indicadores de Éxito Proyectados</h3>
          <ul>${diagnostic.successKpis
            .map((k) => `<li><strong>${escapeHtml(k.label)}:</strong> <span class="mono">${escapeHtml(k.projectedTarget)}</span></li>`)
            .join('')}</ul>
        </div>
        <div class="card">
          <h3>Catálogo ConfIA360 Recomendado</h3>
          <ul>${diagnostic.recommendedServices
            .map((s) => `<li><strong>${escapeHtml(s.name)}</strong> — ${escapeHtml(s.subtitle)}</li>`)
            .join('')}</ul>
          <p style="margin-top:10px;font-size:11px;color:#475569;"><strong>Principios de Actuación:</strong> ${ACTING_PRINCIPLES.map(escapeHtml).join(' · ')}</p>
        </div>
      </div>`
      : '';

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(tpl.brandTitle)} — ${escapeHtml(client.companyName)}</title>
<style>
  body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 28px; background: #f8fafc; line-height: 1.45; }
  .sheet { max-width: 960px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 16px; overflow: hidden; }
  .header { background: linear-gradient(120deg, #001428 0%, #002855 60%, #0369a1 100%); color: #fff; padding: 24px 28px; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
  .header h1 { margin: 0 0 6px; font-size: 22px; }
  .header p { margin: 0; font-size: 13px; color: #cbd5e1; }
  .badge { background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.5); color: #6ee7b7; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
  .body { padding: 24px 28px; }
  .meta-bar { display: flex; flex-wrap: wrap; gap: 18px; padding-bottom: 14px; border-bottom: 1px solid #e2e8f0; margin-bottom: 18px; font-size: 12px; color: #334155; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; background: #fff; }
  .card h3 { margin: 0 0 10px; font-size: 15px; color: #001e3d; }
  .mono { font-family: ui-monospace, SFMono-Regular, monospace; font-variant-numeric: tabular-nums; font-weight: 700; }
  .kpi-num { font-size: 28px; font-weight: 900; color: #059669; }
  .area-row { margin-bottom: 8px; font-size: 12px; }
  .area-head { display: flex; justify-content: space-between; margin-bottom: 3px; }
  .bar-bg { height: 7px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
  .bar-fill { height: 100%; background: linear-gradient(90deg, #0284c7, #10b981); }
  ul { margin: 6px 0 0; padding-left: 18px; font-size: 12px; color: #334155; }
  li { margin-bottom: 4px; }
  .footer { background: #001428; color: #cbd5e1; padding: 14px 28px; font-size: 11px; display: flex; justify-content: space-between; }
  @media print { body { background: #fff; padding: 0; } .sheet { border: none; } }
</style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <h1>${escapeHtml(tpl.brandTitle)}</h1>
        <p>${escapeHtml(tpl.headline)} · Estrategia MUNDOConfIA</p>
      </div>
      <div class="badge">Informe Nivel ${escapeHtml(tierLabel)}</div>
    </div>
    <div class="body">
      <div class="meta-bar">
        <span><strong>Empresa:</strong> ${escapeHtml(client.companyName)}</span>
        <span><strong>Contacto:</strong> ${escapeHtml(client.name)}</span>
        <span><strong>Sector:</strong> ${escapeHtml(client.sectorLabel)}</span>
        <span><strong>CP:</strong> <span class="mono">${escapeHtml(client.postalCode || 'N/D')}</span></span>
        <span><strong>Tel:</strong> ${escapeHtml(client.phone)}</span>
        <span><strong>Email:</strong> ${escapeHtml(client.email)}</span>
      </div>

      <div class="grid-2" style="margin-bottom:14px;">
        <div class="card">
          <h3>Índice de Madurez Digital</h3>
          ${
            diagnostic
              ? `<div class="kpi-num mono">${diagnostic.maturityScore}/100 · ${escapeHtml(diagnostic.maturityLevel)}</div>
                 <p style="font-size:12px;color:#475569;margin:6px 0 0;">Prioridades inmediatas: ${diagnostic.prioritizedActions
                   .slice(0, 2)
                   .map((a) => escapeHtml(a.title))
                   .join(' · ')}</p>`
              : '<p style="font-size:12px;">Evaluación diagnóstica pendiente.</p>'
          }
        </div>
        <div class="card">
          <h3>Simulación Económica y ROI Estimado</h3>
          ${
            roiResults
              ? `<div class="kpi-num mono">+${roiResults.annualNetBenefit.toLocaleString('es-ES')} €/año</div>
                 <p style="font-size:12px;color:#475569;margin:6px 0 0;">Tiempo liberado: <strong>${roiResults.savedHoursWeek} h/sem</strong> · ROI <strong>${roiResults.roiPercent}%</strong> · Amortización ~${roiResults.paybackWeeks} semanas</p>`
              : '<p style="font-size:12px;">Simulación ROI pendiente.</p>'
          }
        </div>
      </div>

      <div class="card" style="margin-bottom:14px;">
        <h3>Evaluación de las 10 Áreas Clave</h3>
        <div class="grid-2">${areasHtml}</div>
      </div>

      ${proSectionHtml}
      ${vipSectionHtml}
    </div>
    <div class="footer">
      <span>AsExiA · Tecnología práctica para pymes y negocios locales · Respaldo MUNDOConfIA</span>
      <span>www.asexia.es · 609 735 753 · soyasexia@gmail.com</span>
    </div>
  </div>
</body>
</html>`;

  const slug = (client.companyName || client.name || 'empresa')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  triggerFileDownload(html, 'text/html;charset=utf-8', `dossier-${tierLabel.toLowerCase()}-confia360-${slug}.html`);
}

export function buildClientShareMessage(client: CrmClient, opportunity?: CrmOpportunity): string {
  const diag = opportunity?.diagnosticResult;
  const roi = opportunity?.roiSimulation?.results;
  const parts = [
    `Hola ${client.name}, aquí tienes el resumen de tu estudio *AsExiA | ConfIA360* para *${client.companyName}* (${client.sectorLabel}):`,
  ];
  if (diag) {
    parts.push(
      `• Índice de Madurez Digital (${TIER_LABELS[diag.tier]}): *${diag.maturityScore}/100 (${diag.maturityLevel})*`
    );
    if (diag.prioritizedActions[0]) {
      parts.push(`• Prioridad #1: ${diag.prioritizedActions[0].title}`);
    }
  }
  if (roi) {
    parts.push(
      `• Tiempo estimado liberado: *${roi.savedHoursWeek} h/sem* (${roi.savedHoursYear} h/año)`,
      `• Impacto neto anual estimado: *+${roi.annualNetBenefit.toLocaleString('es-ES')} €/año* (ROI ${roi.roiPercent}%)`
    );
  }
  parts.push(`Quedamos a tu disposición en el 609 735 753 · soyasexia@gmail.com.`);
  return parts.join('\n');
}

export function buildCaptaGlobalPrefillUrl(
  baseOrigin: string,
  client: Partial<CrmClient>,
  target: 'diagnostico' | 'roi' = 'diagnostico'
): string {
  const cleanOrigin = (baseOrigin || '').replace(/\/+$/, '');
  const params = new URLSearchParams();
  params.set('fuente', 'captaglobal');
  params.set('destino', target);
  if (client.name) params.set('nombre', client.name);
  if (client.companyName) params.set('empresa', client.companyName);
  if (client.sectorId) params.set('sector', client.sectorId);
  if (client.companySizeId) params.set('tamano', client.companySizeId);
  if (client.postalCode) params.set('cp', client.postalCode);
  if (client.phone) params.set('telefono', client.phone);
  if (client.email) params.set('email', client.email);
  const hash = target === 'roi' ? '#calculadora-roi' : '#diagnostico-confia360';
  return `${cleanOrigin}/?${params.toString()}${hash}`;
}

export function exportCrmOpportunitiesCsv(
  clientsById: Record<string, CrmClient>,
  opportunities: CrmOpportunity[]
): void {
  const escapeCsv = (val: unknown) => {
    const str = String(val ?? '');
    if (/[",\n;]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = [
    'ID_Oportunidad',
    'Empresa',
    'Contacto',
    'Sector',
    'Tamano',
    'Codigo_Postal',
    'Telefono',
    'Email',
    'Origen',
    'Etapa_CRM',
    'Nivel_Diagnostico',
    'Madurez_Digital_100',
    'Valor_Anual_Estimado_EUR',
    'Horas_Ahorro_Semana',
    'ROI_Porcentaje',
    'Estado_CaptaGlobal',
    'ID_Externo_CaptaGlobal',
    'Proximo_Seguimiento',
    'Ultima_Actualizacion',
  ];

  const rows = opportunities.map((opp) => {
    const cli = clientsById[opp.clientId];
    return [
      opp.id,
      cli?.companyName || '',
      cli?.name || '',
      cli?.sectorLabel || '',
      cli?.companySizeId || '',
      cli?.postalCode || '',
      cli?.phone || '',
      cli?.email || '',
      opp.source,
      STAGE_LABELS[opp.stage] || opp.stage,
      TIER_LABELS[opp.diagnosticTier] || opp.diagnosticTier,
      opp.diagnosticResult?.maturityScore ?? '',
      opp.estimatedAnnualValue ?? 0,
      opp.roiSimulation?.results.savedHoursWeek ?? '',
      opp.roiSimulation?.results.roiPercent ?? '',
      opp.captaGlobalSync?.status || 'pending',
      opp.captaGlobalSync?.externalLeadId || '',
      opp.nextFollowUpAt || '',
      opp.updatedAt,
    ]
      .map(escapeCsv)
      .join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
  const dateSlug = new Date().toISOString().slice(0, 10);
  triggerFileDownload(
    csvContent,
    'text/csv;charset=utf-8',
    `crm-confia360-captaglobal-${dateSlug}.csv`
  );
}

