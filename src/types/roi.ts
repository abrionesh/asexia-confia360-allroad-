export type RoiSectorId =
  | 'restauracion'
  | 'servicios'
  | 'clinicas'
  | 'comercios'
  | 'inmobiliarias';

export type CompanySizeId = 'micro' | 'pequena' | 'mediana';

export type RoiCtaId =
  | 'bookingWithRoi'
  | 'interactiveDemo'
  | 'whatsappSummary'
  | 'proposalComparator';

export interface RoiCompanySizeProfile {
  id: CompanySizeId;
  label: string;
  shortLabel: string;
  headcountRange: string;
  description: string;
  timeSavingsWeight: number; // multiplier on comm & admin automation efficiency
  leadRecoveryWeight: number; // multiplier on missed lead recovery efficiency
  sectorExtraWeight: number; // multiplier on sector-specific direct monthly savings
  investmentMultiplier: number; // multiplier on monthly plan & setup cost
}

export interface RoiSectorDefaults {
  id: RoiSectorId;
  name: string;
  shortName: string;
  bookingSectorValue: string;
  demoSectorValue: 'restauracion' | 'clinicas' | 'servicios' | 'comercios' | 'inmobiliarias';
  localBenchmarkNote: string;
  defaultTeamSize: number;
  defaultCommHoursPerWeek: number;
  defaultAdminHoursPerWeek: number;
  defaultMissedLeadsPerWeek: number;
  defaultHourlyCost: number;
  defaultAvgTicket: number;
  defaultSectorExtraMonthly: number;
  sectorExtraLabel: string;
  commAutomationRate: number; // 0..1
  adminAutomationRate: number; // 0..1
  leadRecoveryRate: number; // 0..1
  closingMultiplier: number; // 0..1 conservative conversion of recovered inquiries
  estimatedMonthlyPlanCost: number;
  estimatedSetupCost: number;
  maxWeeklyHoursCap: number;
}

export interface RoiGlobalRates {
  locationLabel: string;
  weeksPerMonth: number;
  monthsPerYear: number;
  kitDigitalSetupDiscountRate: number; // 0..1
  maxTotalReductionCap: number; // 0..1
}

export interface RoiCtaSetting {
  id: RoiCtaId;
  enabled: boolean;
  label: string;
  sublabel: string;
}

export interface RoiConfig {
  version: number;
  updatedAt: string;
  defaultSectorId: RoiSectorId;
  defaultCompanySizeId: CompanySizeId;
  globalRates: RoiGlobalRates;
  companySizes: Record<CompanySizeId, RoiCompanySizeProfile>;
  sectors: Record<RoiSectorId, RoiSectorDefaults>;
  ctaSettings: {
    primaryCtaId: RoiCtaId;
    items: Record<RoiCtaId, RoiCtaSetting>;
  };
}

export interface RoiUserInputs {
  sectorId: RoiSectorId;
  companySizeId: CompanySizeId;
  teamSize: number;
  commHoursPerWeek: number;
  adminHoursPerWeek: number;
  missedLeadsPerWeek: number;
  hourlyCost: number;
  avgTicket: number;
  sectorExtraMonthly: number;
  applyKitDigital: boolean;
}

export interface RoiCalculationResult {
  savedCommHoursWeek: number;
  savedAdminHoursWeek: number;
  savedHoursWeek: number;
  savedHoursMonth: number;
  savedHoursYear: number;
  manualHoursWeek: number;
  remainingHoursWeek: number;
  timeReductionPercent: number;
  effectiveCommRate: number;
  effectiveAdminRate: number;
  effectiveLeadRecoveryRate: number;
  appliedSizeProfile: RoiCompanySizeProfile;
  monthlyLaborSavings: number;
  monthlyExtraSavings: number;
  monthlyOperationalSavings: number;
  recoveredLeadsMonth: number;
  monthlyRecoveredRevenue: number;
  totalMonthlyBenefit: number;
  estimatedMonthlyCost: number;
  effectiveSetupCost: number;
  netMonthlyBenefit: number;
  annualTotalBenefit: number;
  annualInvestment: number;
  annualNetBenefit: number;
  roiPercent: number;
  paybackWeeks: number;
}

export const SECTOR_ORDER: RoiSectorId[] = [
  'restauracion',
  'servicios',
  'clinicas',
  'comercios',
  'inmobiliarias',
];

export const COMPANY_SIZE_ORDER: CompanySizeId[] = ['micro', 'pequena', 'mediana'];

export const CTA_ORDER: RoiCtaId[] = [
  'bookingWithRoi',
  'interactiveDemo',
  'whatsappSummary',
  'proposalComparator',
];

export const DEFAULT_ROI_CONFIG: RoiConfig = {
  version: 2,
  updatedAt: '2026-03-20T09:00:00.000Z',
  defaultSectorId: 'restauracion',
  defaultCompanySizeId: 'micro',
  globalRates: {
    locationLabel: 'Getafe, Madrid',
    weeksPerMonth: 4.33,
    monthsPerYear: 12,
    kitDigitalSetupDiscountRate: 0.9,
    maxTotalReductionCap: 0.85,
  },
  companySizes: {
    micro: {
      id: 'micro',
      label: 'Microempresa',
      shortLabel: 'Micro',
      headcountRange: '1–9 personas',
      description: 'Negocio local o despacho con gestión directa y equipo reducido',
      timeSavingsWeight: 0.9,
      leadRecoveryWeight: 0.92,
      sectorExtraWeight: 0.85,
      investmentMultiplier: 0.85,
    },
    pequena: {
      id: 'pequena',
      label: 'Pequeña empresa',
      shortLabel: 'Pequeña',
      headcountRange: '10–49 personas',
      description: 'Varios turnos o departamentos con mayor volumen administrativo',
      timeSavingsWeight: 1.0,
      leadRecoveryWeight: 1.0,
      sectorExtraWeight: 1.0,
      investmentMultiplier: 1.0,
    },
    mediana: {
      id: 'mediana',
      label: 'Mediana empresa',
      shortLabel: 'Mediana',
      headcountRange: '50–249 personas',
      description: 'Múltiples áreas o sedes donde la coordinación multiplica el retorno',
      timeSavingsWeight: 1.2,
      leadRecoveryWeight: 1.15,
      sectorExtraWeight: 1.35,
      investmentMultiplier: 1.45,
    },
  },
  sectors: {
    restauracion: {
      id: 'restauracion',
      name: 'Restauración y Hostelería',
      shortName: 'Restauración',
      bookingSectorValue: 'Restauración',
      demoSectorValue: 'restauracion',
      localBenchmarkNote: 'Media pyme hostelería en Getafe, Madrid (3 personas en sala/gestión)',
      defaultTeamSize: 3,
      defaultCommHoursPerWeek: 11,
      defaultAdminHoursPerWeek: 8,
      defaultMissedLeadsPerWeek: 6,
      defaultHourlyCost: 16,
      defaultAvgTicket: 58,
      defaultSectorExtraMonthly: 240,
      sectorExtraLabel: 'Ahorro en comisiones de plataformas y no-shows (€/mes)',
      commAutomationRate: 0.75,
      adminAutomationRate: 0.65,
      leadRecoveryRate: 0.65,
      closingMultiplier: 0.6,
      estimatedMonthlyPlanCost: 145,
      estimatedSetupCost: 1400,
      maxWeeklyHoursCap: 45,
    },
    servicios: {
      id: 'servicios',
      name: 'Servicios Profesionales y Despachos',
      shortName: 'Servicios & Despachos',
      bookingSectorValue: 'Gestorías y despachos',
      demoSectorValue: 'servicios',
      localBenchmarkNote: 'Media despacho/asesoría en Getafe, Madrid (3 técnicos/administración)',
      defaultTeamSize: 3,
      defaultCommHoursPerWeek: 9,
      defaultAdminHoursPerWeek: 14,
      defaultMissedLeadsPerWeek: 3,
      defaultHourlyCost: 22,
      defaultAvgTicket: 360,
      defaultSectorExtraMonthly: 110,
      sectorExtraLabel: 'Ahorro en papel, mensajería y persecución de firmas (€/mes)',
      commAutomationRate: 0.68,
      adminAutomationRate: 0.72,
      leadRecoveryRate: 0.55,
      closingMultiplier: 0.4,
      estimatedMonthlyPlanCost: 165,
      estimatedSetupCost: 1600,
      maxWeeklyHoursCap: 50,
    },
    clinicas: {
      id: 'clinicas',
      name: 'Clínicas y Consultas de Salud',
      shortName: 'Clínicas & Salud',
      bookingSectorValue: 'Clínicas y salud',
      demoSectorValue: 'clinicas',
      localBenchmarkNote: 'Media clínica dental/fisioterapia en Getafe, Madrid (recepción + especialistas)',
      defaultTeamSize: 3,
      defaultCommHoursPerWeek: 13,
      defaultAdminHoursPerWeek: 9,
      defaultMissedLeadsPerWeek: 5,
      defaultHourlyCost: 19,
      defaultAvgTicket: 65,
      defaultSectorExtraMonthly: 130,
      sectorExtraLabel: 'Ahorro en consentimientos impresos y reasignación de huecos (€/mes)',
      commAutomationRate: 0.76,
      adminAutomationRate: 0.68,
      leadRecoveryRate: 0.68,
      closingMultiplier: 0.65,
      estimatedMonthlyPlanCost: 155,
      estimatedSetupCost: 1500,
      maxWeeklyHoursCap: 45,
    },
    comercios: {
      id: 'comercios',
      name: 'Comercio Local y Proximidad',
      shortName: 'Comercio Local',
      bookingSectorValue: 'Comercio local',
      demoSectorValue: 'comercios',
      localBenchmarkNote: 'Media comercio de proximidad en Getafe, Madrid (2 personas en tienda)',
      defaultTeamSize: 2,
      defaultCommHoursPerWeek: 8,
      defaultAdminHoursPerWeek: 7,
      defaultMissedLeadsPerWeek: 7,
      defaultHourlyCost: 15,
      defaultAvgTicket: 44,
      defaultSectorExtraMonthly: 95,
      sectorExtraLabel: 'Ahorro en comisiones de marketplaces externos (€/mes)',
      commAutomationRate: 0.7,
      adminAutomationRate: 0.62,
      leadRecoveryRate: 0.58,
      closingMultiplier: 0.52,
      estimatedMonthlyPlanCost: 120,
      estimatedSetupCost: 1200,
      maxWeeklyHoursCap: 40,
    },
    inmobiliarias: {
      id: 'inmobiliarias',
      name: 'Inmobiliarias y Gestión de Propiedades',
      shortName: 'Inmobiliarias',
      bookingSectorValue: 'Inmobiliarias',
      demoSectorValue: 'inmobiliarias',
      localBenchmarkNote: 'Media agencia inmobiliaria en Getafe, Madrid (3 agentes y coordinación)',
      defaultTeamSize: 3,
      defaultCommHoursPerWeek: 14,
      defaultAdminHoursPerWeek: 10,
      defaultMissedLeadsPerWeek: 4,
      defaultHourlyCost: 21,
      defaultAvgTicket: 1350,
      defaultSectorExtraMonthly: 180,
      sectorExtraLabel: 'Ahorro en desplazamientos a visitas sin solvencia (€/mes)',
      commAutomationRate: 0.74,
      adminAutomationRate: 0.66,
      leadRecoveryRate: 0.55,
      closingMultiplier: 0.22,
      estimatedMonthlyPlanCost: 185,
      estimatedSetupCost: 1800,
      maxWeeklyHoursCap: 50,
    },
  },
  ctaSettings: {
    primaryCtaId: 'bookingWithRoi',
    items: {
      bookingWithRoi: {
        id: 'bookingWithRoi',
        enabled: true,
        label: 'Agendar diagnóstico con este cálculo',
        sublabel: 'Envía tus datos de ahorro directamente a la cita de 15–20 min',
      },
      interactiveDemo: {
        id: 'interactiveDemo',
        enabled: true,
        label: 'Probar Modo Demo con mis datos',
        sublabel: 'Simula ahora una reserva automática en tu sector',
      },
      whatsappSummary: {
        id: 'whatsappSummary',
        enabled: true,
        label: 'Enviar resumen por WhatsApp',
        sublabel: 'Recibe o comparte esta estimación con el equipo en el 609 735 753',
      },
      proposalComparator: {
        id: 'proposalComparator',
        enabled: true,
        label: 'Comparar propuesta con este ahorro',
        sublabel: 'Contrasta otro presupuesto teniendo en cuenta tu retorno real',
      },
    },
  },
};

export function createInitialInputsForSector(
  sector: RoiSectorDefaults,
  applyKitDigital = true,
  companySizeId: CompanySizeId = 'micro'
): RoiUserInputs {
  return {
    sectorId: sector.id,
    companySizeId,
    teamSize: sector.defaultTeamSize,
    commHoursPerWeek: sector.defaultCommHoursPerWeek,
    adminHoursPerWeek: sector.defaultAdminHoursPerWeek,
    missedLeadsPerWeek: sector.defaultMissedLeadsPerWeek,
    hourlyCost: sector.defaultHourlyCost,
    avgTicket: sector.defaultAvgTicket,
    sectorExtraMonthly: sector.defaultSectorExtraMonthly,
    applyKitDigital,
  };
}

export function calculateRoiResults(
  inputs: RoiUserInputs,
  sector: RoiSectorDefaults,
  globalRates: RoiGlobalRates,
  companySizes?: Record<CompanySizeId, RoiCompanySizeProfile>
): RoiCalculationResult {
  const sizeProfile =
    companySizes?.[inputs.companySizeId] ||
    DEFAULT_ROI_CONFIG.companySizes[inputs.companySizeId] ||
    DEFAULT_ROI_CONFIG.companySizes.micro;

  const clampRate = (val: number) => Math.min(0.95, Math.max(0.05, val));
  const effectiveCommRate = clampRate(sector.commAutomationRate * sizeProfile.timeSavingsWeight);
  const effectiveAdminRate = clampRate(sector.adminAutomationRate * sizeProfile.timeSavingsWeight);
  const effectiveLeadRecoveryRate = clampRate(sector.leadRecoveryRate * sizeProfile.leadRecoveryWeight);

  const manualHoursWeek = Math.max(0, inputs.commHoursPerWeek + inputs.adminHoursPerWeek);
  const rawSavedComm = inputs.commHoursPerWeek * effectiveCommRate;
  const rawSavedAdmin = inputs.adminHoursPerWeek * effectiveAdminRate;
  const rawTotalSaved = rawSavedComm + rawSavedAdmin;

  const maxCap = manualHoursWeek * globalRates.maxTotalReductionCap;
  const scaleFactor = rawTotalSaved > maxCap && rawTotalSaved > 0 ? maxCap / rawTotalSaved : 1;

  const savedCommHoursWeek = Number((rawSavedComm * scaleFactor).toFixed(1));
  const savedAdminHoursWeek = Number((rawSavedAdmin * scaleFactor).toFixed(1));
  const savedHoursWeek = Number((savedCommHoursWeek + savedAdminHoursWeek).toFixed(1));
  const remainingHoursWeek = Number(Math.max(0, manualHoursWeek - savedHoursWeek).toFixed(1));
  const timeReductionPercent =
    manualHoursWeek > 0 ? Math.round((savedHoursWeek / manualHoursWeek) * 100) : 0;

  const savedHoursMonth = Math.round(savedHoursWeek * globalRates.weeksPerMonth);
  const savedHoursYear = Math.round(savedHoursWeek * globalRates.weeksPerMonth * globalRates.monthsPerYear);

  const monthlyLaborSavings = Math.round(
    savedHoursWeek * globalRates.weeksPerMonth * inputs.hourlyCost
  );
  const monthlyExtraSavings = Math.round(inputs.sectorExtraMonthly * sizeProfile.sectorExtraWeight);
  const monthlyOperationalSavings = monthlyLaborSavings + monthlyExtraSavings;

  const recoveredLeadsMonth = Number(
    (inputs.missedLeadsPerWeek * globalRates.weeksPerMonth * effectiveLeadRecoveryRate).toFixed(1)
  );
  const monthlyRecoveredRevenue = Math.round(
    recoveredLeadsMonth * inputs.avgTicket * sector.closingMultiplier
  );

  const totalMonthlyBenefit = monthlyOperationalSavings + monthlyRecoveredRevenue;
  const estimatedMonthlyCost = Math.round(
    sector.estimatedMonthlyPlanCost * sizeProfile.investmentMultiplier
  );
  const baseSetupCost = sector.estimatedSetupCost * sizeProfile.investmentMultiplier;
  const effectiveSetupCost = Math.round(
    inputs.applyKitDigital
      ? baseSetupCost * (1 - globalRates.kitDigitalSetupDiscountRate)
      : baseSetupCost
  );

  const netMonthlyBenefit = totalMonthlyBenefit - estimatedMonthlyCost;
  const annualTotalBenefit = totalMonthlyBenefit * globalRates.monthsPerYear;
  const annualInvestment = effectiveSetupCost + estimatedMonthlyCost * globalRates.monthsPerYear;
  const annualNetBenefit = annualTotalBenefit - annualInvestment;

  const roiPercent =
    annualInvestment > 0 ? Math.round((annualNetBenefit / annualInvestment) * 100) : 0;

  const weeklyNet = netMonthlyBenefit / globalRates.weeksPerMonth;
  const paybackWeeks =
    netMonthlyBenefit <= 0
      ? 52
      : effectiveSetupCost <= 0
      ? 2
      : Math.max(1, Math.min(52, Math.ceil(effectiveSetupCost / weeklyNet)));

  return {
    savedCommHoursWeek,
    savedAdminHoursWeek,
    savedHoursWeek,
    savedHoursMonth,
    savedHoursYear,
    manualHoursWeek,
    remainingHoursWeek,
    timeReductionPercent,
    effectiveCommRate,
    effectiveAdminRate,
    effectiveLeadRecoveryRate,
    appliedSizeProfile: sizeProfile,
    monthlyLaborSavings,
    monthlyExtraSavings,
    monthlyOperationalSavings,
    recoveredLeadsMonth,
    monthlyRecoveredRevenue,
    totalMonthlyBenefit,
    estimatedMonthlyCost,
    effectiveSetupCost,
    netMonthlyBenefit,
    annualTotalBenefit,
    annualInvestment,
    annualNetBenefit,
    roiPercent,
    paybackWeeks,
  };
}

export function cloneDefaultRoiConfig(): RoiConfig {
  return JSON.parse(JSON.stringify(DEFAULT_ROI_CONFIG)) as RoiConfig;
}
