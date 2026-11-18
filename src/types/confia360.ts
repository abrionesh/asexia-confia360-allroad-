import {
  RoiSectorId,
  CompanySizeId,
  RoiUserInputs,
  RoiCalculationResult,
} from './roi';

export type DiagnosticTier = 'base' | 'pro' | 'vip';

export type CrmSource =
  | 'diagnostico-confia360'
  | 'roi-calculator'
  | 'captaglobal'
  | 'booking-web'
  | 'proposal-comparator'
  | 'chat-ia';

export type CrmStage =
  | 'nuevo'
  | 'diagnostico'
  | 'roi-enviado'
  | 'propuesta'
  | 'seguimiento'
  | 'ganada'
  | 'perdida';

export interface LeadProfile {
  name: string;
  companyName: string;
  sectorId: RoiSectorId;
  postalCode: string;
  phone: string;
  email: string;
  companySizeId: CompanySizeId;
}

export interface Confia360ServiceModule {
  id: 'captaglobal' | 'diagnostico' | 'digitaliza' | 'cumple' | 'crece' | 'forma' | 'evoluciona';
  name: string;
  subtitle: string;
  description: string;
  externalUrl?: string;
}

export const CONFIA360_SERVICES: Confia360ServiceModule[] = [
  {
    id: 'captaglobal',
    name: 'ConfIA360 CaptaGlobal',
    subtitle: 'Captación activa y puente CRM',
    description: 'Prospección multicanal de clientes conectada bidireccionalmente con Diagnóstico, ROI y seguimiento 360º.',
    externalUrl: 'https://asexia-confia360-captaglobal.grok.me',
  },
  {
    id: 'diagnostico',
    name: 'ConfIA360 Diagnóstico',
    subtitle: 'Evaluación inicial gratuita y diagnóstico avanzado',
    description: 'Auditoría integral de 10 áreas para detectar fugas de tiempo, clientes y margen.',
  },
  {
    id: 'digitaliza',
    name: 'ConfIA360 Digitaliza',
    subtitle: 'Digitalización y automatización',
    description: 'Flujos de reservas 24/7, WhatsApp automatizado, firma digital y procesos sin papel.',
  },
  {
    id: 'cumple',
    name: 'ConfIA360 Cumple',
    subtitle: 'Gobernanza de IA, privacidad y seguridad',
    description: 'RGPD, control horario, facturación electrónica verificada y supervisión humana.',
  },
  {
    id: 'crece',
    name: 'ConfIA360 Crece',
    subtitle: 'Marketing digital y reputación',
    description: 'Web rápida móvil, posicionamiento local en Google Maps y captación de reseñas 5★.',
  },
  {
    id: 'forma',
    name: 'ConfIA360 Forma',
    subtitle: 'Formación en IA y herramientas',
    description: 'Capacitación práctica del equipo para adoptar herramientas digitales sin fricción.',
  },
  {
    id: 'evoluciona',
    name: 'ConfIA360 Evoluciona',
    subtitle: 'Acompañamiento y mejora continua',
    description: 'Seguimiento trimestral de KPIs, optimización de retorno y soporte evolutivo.',
  },
];

export const ACTING_PRINCIPLES: string[] = [
  'Protección de datos desde el diseño',
  'Supervisión humana en procesos críticos',
  'Transparencia en el uso de IA',
  'Seguridad y control de accesos',
  'Independencia tecnológica',
  'Soluciones a medida',
  'Compromiso con tu éxito',
];

export interface DiagnosticAreaPrompt {
  areaNumber: number; // 1..10 matching infographic
  key: string;
  title: string;
  question: string;
  lowScoreHint: string;
  highScoreHint: string;
  recommendedServiceId: Confia360ServiceModule['id'];
}

export interface SectorDiagnosticTemplate {
  sectorId: RoiSectorId;
  brandTitle: string;
  headline: string;
  heroTagline: string;
  targetDescription: string;
  targetAudienceList: string[];
  areas: DiagnosticAreaPrompt[];
  sectorRisks: string[];
  aiOpportunities: string[];
  baseDafo: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  successIndicators: string[];
}

const COMMON_SUCCESS_INDICATORS: string[] = [
  'Tiempo administrativo liberado',
  'Reducción de ausencias y citas perdidas',
  'Incremento de clientes nuevos',
  'Mayor fidelización y recurrencia',
  'Mejora de reseñas y reputación',
  'Reducción de costes operativos',
  'Mayor nivel de digitalización',
  'Personal formado en IA',
  'Retorno económico de las iniciativas',
];

export const SECTOR_DIAGNOSTIC_TEMPLATES: Record<RoiSectorId, SectorDiagnosticTemplate> = {
  clinicas: {
    sectorId: 'clinicas',
    brandTitle: 'AsExiA | ConfIA360 Salud',
    headline: 'Transformación inteligente para clínicas y profesionales sanitarios',
    heroTagline: 'Más eficiencia · Más pacientes · Más crecimiento',
    targetDescription: 'Tu clínica más fuerte, más digital',
    targetAudienceList: [
      'Clínicas de fisioterapia independientes',
      'Centros de rehabilitación',
      'Clínicas con varias especialidades',
      'Centros con dos o más profesionales',
      'Pequeñas cadenas y grupos de clínicas',
      'Profesionales autónomos con consulta propia',
    ],
    areas: [
      {
        areaNumber: 1,
        key: 'perfil',
        title: 'Perfil, estructura y objetivos de la clínica',
        question: '¿Están definidos los objetivos por especialidad, ocupación de gabinetes y rentabilidad?',
        lowScoreHint: 'Gestión reactiva sin objetivos claros por box o profesional',
        highScoreHint: 'Cuadro de mando mensual por especialidad y tasa de ocupación',
        recommendedServiceId: 'diagnostico',
      },
      {
        areaNumber: 2,
        key: 'organizacion',
        title: 'Organización y gestión operativa',
        question: '¿Cómo coordinas recepción, cambios de turno, historiales y protocolos internos?',
        lowScoreHint: 'Dependencia total de notas en papel, llamadas y avisos verbales',
        highScoreHint: 'Flujos coordinados entre recepción y equipo sanitario sin cuellos de botella',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 3,
        key: 'agenda',
        title: 'Agenda, citas y atención al paciente',
        question: '¿Pueden pedir, confirmar o reprogramar citas 24/7 con recordatorios automáticos?',
        lowScoreHint: 'Llamadas perdidas en consulta y huecos vacíos por ausencias (no-shows)',
        highScoreHint: 'Reserva online + recordatorio automático WhatsApp + lista de espera activa',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 4,
        key: 'economia',
        title: 'Gestión económica y control de costes',
        question: '¿Tienes visibilidad sobre bonos, pagos pendientes, margen por tratamiento y facturación?',
        lowScoreHint: 'Control manual en Excel y conciliación lenta a final de mes',
        highScoreHint: 'Facturación ágil, control de bonos y previsión económica en tiempo real',
        recommendedServiceId: 'evoluciona',
      },
      {
        areaNumber: 5,
        key: 'captacion',
        title: 'Captación, marketing y reputación digital',
        question: '¿Captas pacientes locales desde Google Maps con flujo constante de reseñas 5★?',
        lowScoreHint: 'Web desactualizada, pocas reseñas recientes y alta dependencia de aseguradoras',
        highScoreHint: 'Posicionamiento local sólido, web rápida móvil y solicitud automática de reseñas',
        recommendedServiceId: 'crece',
      },
      {
        areaNumber: 6,
        key: 'sistemas',
        title: 'Sistemas, software e infraestructura',
        question: '¿Están integrados tu agenda clínica, WhatsApp, facturación y copias de seguridad?',
        lowScoreHint: 'Herramientas sueltas que obligan a duplicar datos manualmente',
        highScoreHint: 'Ecosistema conectado, accesible de forma segura desde cualquier dispositivo',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 7,
        key: 'ia',
        title: 'Uso actual y potencial de IA',
        question: '¿Utilizas asistentes inteligentes para triaje de dudas frecuentes, resúmenes o reactivación?',
        lowScoreHint: 'Cero automatización con IA en atención o tareas administrativas',
        highScoreHint: 'Asistente de atención 24/7 con supervisión humana y automatización administrativa',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 8,
        key: 'cumplimiento',
        title: 'Protección de datos, seguridad y cumplimiento',
        question: '¿Cumples con consentimientos informados digitales, RGPD sanitario y control de accesos?',
        lowScoreHint: 'Consentimientos en papel dispersos o envío de datos sin protocolo',
        highScoreHint: 'Firma digital legal, RGPD sanitario auditado y accesos trazables',
        recommendedServiceId: 'cumple',
      },
      {
        areaNumber: 9,
        key: 'competencias',
        title: 'Competencias y formación del equipo',
        question: '¿Cuenta tu equipo sanitario y de recepción con formación práctica en herramientas e IA?',
        lowScoreHint: 'Resistencia al cambio por falta de formación adaptada al día a día',
        highScoreHint: 'Equipo autónomo formado en flujos digitales y buenas prácticas de IA',
        recommendedServiceId: 'forma',
      },
      {
        areaNumber: 10,
        key: 'crecimiento',
        title: 'Oportunidades de crecimiento y automatización',
        question: '¿Reactivas pacientes inactivos o haces seguimiento post-alta de manera automatizada?',
        lowScoreHint: 'Sin seguimiento tras finalizar sesiones ni campañas de recurrencia',
        highScoreHint: 'Campañas automáticas de seguimiento y fidelización medible',
        recommendedServiceId: 'evoluciona',
      },
    ],
    sectorRisks: [
      'Exposición sancionadora por consentimientos en papel o datos clínicos en WhatsApp personal sin protocolo RGPD.',
      'Pérdida de 15–25% de ingresos semanales por no-shows y llamadas no atendidas durante consulta.',
      'Falta de trazabilidad ante la adaptación obligatoria de facturación electrónica.',
    ],
    aiOpportunities: [
      'Agente de triaje y reserva por WhatsApp 24/7 conectado con la agenda de la clínica.',
      'Confirmación proactiva de citas y reasignación automática de huecos cancelados.',
      'Automatización de solicitud de reseñas verificadas tras cada alta satisfactoria.',
    ],
    baseDafo: {
      strengths: [
        'Alta confianza clínica y trato cercano con el paciente',
        'Demanda recurrente de tratamientos y revisiones periódicas',
      ],
      weaknesses: [
        'Sobrecarga telefónica y administrativa en recepción',
        'Consentimientos informados y seguimiento post-visita aún manuales',
      ],
      opportunities: [
        'Captación de paciente privado de proximidad vía Google Maps y reservas directas',
        'Financiación vía Kit Digital para digitalización clínica y CRM',
      ],
      threats: [
        'Cadenas y policlínicas con reserva inmediata online captando primeras visitas',
        'Endurecimiento normativo en privacidad sanitaria y facturación digital',
      ],
    },
    successIndicators: [
      'Tiempo administrativo liberado en recepción',
      'Reducción de ausencias y citas perdidas',
      'Incremento de pacientes nuevos privados',
      'Mayor fidelización y recurrencia de sesiones',
      'Mejora de reseñas y reputación sanitaria',
      'Reducción de costes operativos y papel',
      'Mayor nivel de digitalización de historia y firma',
      'Personal sanitario y recepción formado en IA',
      'Retorno económico medible de cada iniciativa',
    ],
  },
  restauracion: {
    sectorId: 'restauracion',
    brandTitle: 'AsExiA | ConfIA360 Hostelería',
    headline: 'Transformación inteligente para restaurantes, bares y grupos de hostelería',
    heroTagline: 'Más mesas llenas · Más margen · Menos comisiones',
    targetDescription: 'Tu restaurante más rentable, más conectado',
    targetAudienceList: [
      'Restaurantes y gastrobares independientes',
      'Bares de barrio, terrazas y cafeterías',
      'Asadores, arrocerías y locales de carta',
      'Locales con servicio de reservas y eventos',
      'Pequeños grupos y cadenas de hostelería',
      'Negocios con delivery o recogida en local',
    ],
    areas: [
      {
        areaNumber: 1,
        key: 'perfil',
        title: 'Perfil, estructura y objetivos del local',
        question: '¿Tienes medidos el ticket medio, rotación de mesas y objetivos por turno y día?',
        lowScoreHint: 'Decisiones por intuición sin comparar rentabilidad por servicio',
        highScoreHint: 'Objetivos claros de ocupación, ticket medio y margen bruto por servicio',
        recommendedServiceId: 'diagnostico',
      },
      {
        areaNumber: 2,
        key: 'organizacion',
        title: 'Organización operativa entre sala y cocina',
        question: '¿Cómo gestionas turnos del equipo, proveedores, alérgenos y mermas diarias?',
        lowScoreHint: 'Cuadrantes y pedidos a proveedores desorganizados por mensajes sueltos',
        highScoreHint: 'Procesos ágiles en sala/cocina con control digital de turnos y compras',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 3,
        key: 'agenda',
        title: 'Reservas de mesa y atención al comensal',
        question: '¿Entran tus reservas 24/7 sin pagar comisiones por comensal y con confirmación por WhatsApp?',
        lowScoreHint: 'Llamadas perdidas en pleno servicio y mesas vacías por no-shows',
        highScoreHint: 'Motor propio sin comisiones + reconfirmación automática y lista de espera',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 4,
        key: 'economia',
        title: 'Escandallos, márgenes y control de costes',
        question: '¿Controlas escandallos actualizados y desviaciones de coste de materia prima?',
        lowScoreHint: 'Escandallos desactualizados; las subidas de proveedor erosionan el margen',
        highScoreHint: 'Escandallos digitales actualizados y alertas de variación de costes',
        recommendedServiceId: 'evoluciona',
      },
      {
        areaNumber: 5,
        key: 'captacion',
        title: 'Carta digital, Google Maps y reputación',
        question: '¿Tu carta móvil invita a pedir y captas reseñas 5★ de forma constante?',
        lowScoreHint: 'PDF ilegible en móvil, web lenta y reseñas sin responder',
        highScoreHint: 'Carta rápida e interactiva, SEO local fuerte y flujo continuo de reseñas 5★',
        recommendedServiceId: 'crece',
      },
      {
        areaNumber: 6,
        key: 'sistemas',
        title: 'TPV, reservas y sistemas conectados',
        question: '¿Se hablan entre sí tu TPV, reservas web, WhatsApp y facturación?',
        lowScoreHint: 'Sistemas desconectados y cierres manuales cada noche',
        highScoreHint: 'Flujo unificado con copias de seguridad y acceso desde móvil',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 7,
        key: 'ia',
        title: 'Uso actual y potencial de IA',
        question: '¿Responde un asistente IA dudas de alérgenos, horarios, grupos y reservas fuera de turno?',
        lowScoreHint: 'Mensajes y llamadas sin atender en cocina o días de cierre',
        highScoreHint: 'Asistente WhatsApp 24/7 resolviendo reservas y eventos de grupos',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 8,
        key: 'cumplimiento',
        title: 'Control horario, RGPD y facturación',
        question: '¿Cumples registro horario del personal, protección de datos y facturación adaptada?',
        lowScoreHint: 'Hojas firmadas a mano vulnerables ante inspección',
        highScoreHint: 'Control horario digital, cumplimiento normativo y facturas listas',
        recommendedServiceId: 'cumple',
      },
      {
        areaNumber: 9,
        key: 'competencias',
        title: 'Formación del equipo de sala y gerencia',
        question: '¿Sabe tu equipo aprovechar el sistema de reservas, upselling y herramientas digitales?',
        lowScoreHint: 'Cada camarero gestiona reservas o incidencias a su manera',
        highScoreHint: 'Protocolo unificado y personal formado con facilidad de uso',
        recommendedServiceId: 'forma',
      },
      {
        areaNumber: 10,
        key: 'crecimiento',
        title: 'Fidelización, eventos y clientes recurrentes',
        question: '¿Aprovechas tu base de comensales para llenar días valle y campañas estacionales?',
        lowScoreHint: 'Nunca contactas a clientes anteriores fuera de temporada alta',
        highScoreHint: 'Reactivación segmentada por WhatsApp y promociones directas medibles',
        recommendedServiceId: 'crece',
      },
    ],
    sectorRisks: [
      'Dependencia elevada de portales externos que cobran comisión por cada reserva propia.',
      'Pérdida silenciosa de margen por escandallos desactualizados frente a inflación de proveedores.',
      'Incumplimientos en registro horario de turnos partidos o facturación sin trazabilidad.',
    ],
    aiOpportunities: [
      'Recepcionista virtual en WhatsApp 24/7 para reservas de mesa, menús de grupo y alérgenos.',
      'Reactivación automática de clientes para llenar martes/miércoles o menús especiales.',
      'Detección de reseñas negativas antes de publicarse y captación automática de 5★.',
    ],
    baseDafo: {
      strengths: [
        'Producto gastronómico propio y experiencia presencial difícil de copiar',
        'Alta frecuencia de visita si se fideliza al cliente de barrio/zona',
      ],
      weaknesses: [
        'Picos de trabajo donde nadie puede coger el teléfono para reservar',
        'Falta de control en tiempo real de escandallos y mermas',
      ],
      opportunities: [
        'Sustituir comisiones de portales por canal propio de reserva directa y WhatsApp',
        'Llenar servicios entre semana mediante base de datos propia de comensales',
      ],
      threats: [
        'Competencia agresiva en Google Maps y plataformas de reservas',
        'Encarecimiento de costes de plantilla y suministros',
      ],
    },
    successIndicators: [
      'Tiempo liberado en atención telefónica de sala',
      'Reducción de mesas vacías y no-shows',
      'Incremento de reservas directas sin comisión',
      'Mayor repetición de clientes en días valle',
      'Aumento de nota media y reseñas en Google Maps',
      'Control exacto de escandallos y costes',
      'Digitalización completa de carta y turnos',
      'Equipo de sala y cocina formado en procesos',
      'Retorno económico directo en facturación y margen',
    ],
  },
  servicios: {
    sectorId: 'servicios',
    brandTitle: 'AsExiA | ConfIA360 Despachos',
    headline: 'Transformación inteligente para asesorías, gestorías, abogados y servicios profesionales',
    heroTagline: 'Más productividad · Menos papeleo · Más cierres',
    targetDescription: 'Tu despacho más ágil, más rentable',
    targetAudienceList: [
      'Asesorías fiscales, laborales y contables',
      'Despachos de abogados y procuradores',
      'Consultoras técnicas y de ingeniería',
      'Corredurías de seguros y fincas',
      'Estudios de arquitectura y servicios B2B',
      'Profesionales independientes y boutiques',
    ],
    areas: [
      {
        areaNumber: 1,
        key: 'perfil',
        title: 'Perfil de clientes, igualas y objetivos',
        question: '¿Mides la rentabilidad real por tipo de cliente, iguala mensual y horas invertidas?',
        lowScoreHint: 'Clientes que consumen muchas horas sin ajuste de honorarios',
        highScoreHint: 'Cartera segmentada con control claro de horas y margen por expediente',
        recommendedServiceId: 'diagnostico',
      },
      {
        areaNumber: 2,
        key: 'organizacion',
        title: 'Organización de expedientes y tareas internas',
        question: '¿Están centralizados los plazos, encargos y documentación de cada cliente?',
        lowScoreHint: 'Carpetas locales, correos reenviados y avisos en hojas de cálculo',
        highScoreHint: 'Flujo trazable por expediente con responsables y alertas automáticas',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 3,
        key: 'agenda',
        title: 'Atención, consultas iniciales y agenda comercial',
        question: '¿Cualificas consultas y agendas reuniones automáticamente sin interrumpir al equipo técnico?',
        lowScoreHint: 'Interrupciones continuas de teléfono/WhatsApp por consultas gratuitas sin filtro',
        highScoreHint: 'Triaje previo inteligente y cita concertada solo con leads cualificados',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 4,
        key: 'economia',
        title: 'Propuestas, facturación recurrente y cobros',
        question: '¿Emitís presupuestos con firma rápida, seguimiento y facturación automatizada?',
        lowScoreHint: 'Presupuestos enviados en PDF que nadie sigue ni recuerda',
        highScoreHint: 'Envío ágil con firma digital, recordatorio de aceptación y facturación conectada',
        recommendedServiceId: 'evoluciona',
      },
      {
        areaNumber: 5,
        key: 'captacion',
        title: 'Autoridad digital, SEO local y captación B2B',
        question: '¿Proyecta tu web solvencia técnica y genera solicitudes de alto valor en tu zona?',
        lowScoreHint: 'Web corporativa anticuada que no diferencia especialidades ni convierte visitas',
        highScoreHint: 'Posicionamiento experto, formularios orientados a caso y reseñas verificadas',
        recommendedServiceId: 'crece',
      },
      {
        areaNumber: 6,
        key: 'sistemas',
        title: 'Software de despacho, CRM y nube segura',
        question: '¿Trabaja tu equipo sobre un CRM y repositorio documental conectado en la nube?',
        lowScoreHint: 'Información duplicada entre correo, carpetas y programas legados',
        highScoreHint: 'Entorno colaborativo seguro con historial unificado de cliente',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 7,
        key: 'ia',
        title: 'Uso actual y potencial de IA productiva',
        question: '¿Usas IA controlada para resumir expedientes, redactar borradores o responder dudas tipo?',
        lowScoreHint: 'Redacción repetitiva desde cero y clasificación manual de documentos',
        highScoreHint: 'Asistentes internos con privacidad garantizada acelerando tareas documentales',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 8,
        key: 'cumplimiento',
        title: 'Seguridad, RGPD, firma legal y facturación electrónica',
        question: '¿Cuentas con firma electrónica probatoria, RGPD auditado y preparación VeriFactu?',
        lowScoreHint: 'Riesgos en envío de documentos sensibles por canales sin control',
        highScoreHint: 'Gobernanza estricta, firma digital legal y cumplimiento normativo completo',
        recommendedServiceId: 'cumple',
      },
      {
        areaNumber: 9,
        key: 'competencias',
        title: 'Competencias digitales e IA del equipo',
        question: '¿Domina la plantilla herramientas de automatización, CRM y prompting seguro de IA?',
        lowScoreHint: 'Uso desigual e inseguro de herramientas gratuitas sin criterio del despacho',
        highScoreHint: 'Protocolo común de IA segura y equipo formado con productividad medible',
        recommendedServiceId: 'forma',
      },
      {
        areaNumber: 10,
        key: 'crecimiento',
        title: 'Venta cruzada y recurrencia de cartera',
        question: '¿Identificas oportunidades de nuevos servicios dentro de tu propia base de clientes?',
        lowScoreHint: 'Solo se reactua cuando el cliente llama con una urgencia o problema',
        highScoreHint: 'Alertas proactivas de valor añadido (subvenciones, compliance, asesoría)',
        recommendedServiceId: 'evoluciona',
      },
    ],
    sectorRisks: [
      'Uso no regulado de herramientas de IA públicas con documentación confidencial de clientes.',
      'Fuga de propuestas comerciales por falta de seguimiento sistemático y firma ágil.',
      'Cuellos de botella en campañas fiscales/laborales por recepción manual de facturas y tickets.',
    ],
    aiOpportunities: [
      'Clasificador y extractor inteligente de documentación de clientes antes de contabilidad.',
      'Asistente previo en web/WhatsApp que filtra tipo de caso y agenda reunión con documentación.',
      'Seguimiento automático de propuestas enviadas y recordatorio de firma de hojas de encargo.',
    ],
    baseDafo: {
      strengths: [
        'Relación de confianza a largo plazo con empresas y particulares',
        'Base de clientes recurrente susceptible de servicios de mayor valor',
      ],
      weaknesses: [
        'Exceso de horas no facturables persiguiendo papeles y respondiendo llamadas',
        'Procesos comerciales poco sistematizados tras enviar presupuestos',
      ],
      opportunities: [
        'Diferenciarse como despacho ágil con portal/atención automatizada y firma inmediata',
        'Aprovechar obligatoriedad de factura electrónica y cumplimiento para ampliar igualas',
      ],
      threats: [
        'Gestorías 100% online con precios bajos compitiendo en captación digital',
        'Saturación operativa del equipo en picos trimestrales',
      ],
    },
    successIndicators: [
      'Horas administrativas liberadas por asesor',
      'Reducción de consultas no cualificadas y ausencias',
      'Aumento de nuevos expedientes e igualas',
      'Mayor retención y venta cruzada en cartera',
      'Reputación digital y autoridad en Google',
      'Reducción de costes de tramitación manual',
      'Digitalización y firma electrónica al 100%',
      'Equipo formado en IA segura y productiva',
      'ROI claro frente al tiempo facturable ganado',
    ],
  },
  comercios: {
    sectorId: 'comercios',
    brandTitle: 'AsExiA | ConfIA360 Comercio',
    headline: 'Transformación inteligente para comercios locales, tiendas y centros de estética/bienestar',
    heroTagline: 'Más visitas a tienda · Más pedidos · Clientes fieles',
    targetDescription: 'Tu comercio más visible, más rentable',
    targetAudienceList: [
      'Comercios locales de barrio y proximidad',
      'Centros de estética, peluquería y bienestar',
      'Tiendas especializadas (moda, óptica, hogar, deporte)',
      'Negocios con venta en tienda física y WhatsApp',
      'Comercios con varias sucursales locales',
      'Emprendedores y autónomos con punto de venta',
    ],
    areas: [
      {
        areaNumber: 1,
        key: 'perfil',
        title: 'Perfil comercial, catálogo y objetivos',
        question: '¿Identificas tus productos/servicios estrella, margen y estacionalidad de ventas?',
        lowScoreHint: 'Venta al día sin medir qué referencias o campañas generan más margen',
        highScoreHint: 'Control claro de ticket medio, rotación y líneas más rentables',
        recommendedServiceId: 'diagnostico',
      },
      {
        areaNumber: 2,
        key: 'organizacion',
        title: 'Organización de tienda, stock y encargos',
        question: '¿Cómo coordinas encargos por teléfono/WhatsApp, reservas y reposición de stock?',
        lowScoreHint: 'Pedidos apuntados en libreta o chats perdidos sin seguimiento',
        highScoreHint: 'Registro ágil de pedidos, stock actualizado y avisos automáticos al cliente',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 3,
        key: 'agenda',
        title: 'Atención, pedidos por WhatsApp y citas',
        question: '¿Pueden consultar disponibilidad, encargar o reservar cita en cualquier momento?',
        lowScoreHint: 'Consultas sin respuesta cuando estás atendiendo en mostrador',
        highScoreHint: 'Catálogo/reserva ágil móvil y respuesta instantánea por WhatsApp Business',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 4,
        key: 'economia',
        title: 'Control de caja, promociones y rentabilidad',
        question: '¿Mides el retorno de tus descuentos, tarjetas regalo o campañas locales?',
        lowScoreHint: 'Descuentos generales sin conocer si atraen cliente nuevo o reducen margen',
        highScoreHint: 'Promociones medidas por retorno y control de costes/facturación',
        recommendedServiceId: 'evoluciona',
      },
      {
        areaNumber: 5,
        key: 'captacion',
        title: 'Google Maps, escaparate digital y reseñas',
        question: '¿Apareces en los primeros resultados cuando buscan tu producto en tu ciudad/barrio?',
        lowScoreHint: 'Ficha de Google incompleta, fotos antiguas y pocas reseñas nuevas',
        highScoreHint: 'Top visibilidad local en Maps, catálogo móvil atractivo y reseñas constantes',
        recommendedServiceId: 'crece',
      },
      {
        areaNumber: 6,
        key: 'sistemas',
        title: 'TPV, catálogo digital y base de clientes',
        question: '¿Tienes una base de clientes organizada o solo tickets anónimos de caja?',
        lowScoreHint: 'No conservas contacto ni preferencias de quienes ya compran en tienda',
        highScoreHint: 'CRM ligero conectado con tickets, WhatsApp y catálogo digital',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 7,
        key: 'ia',
        title: 'Uso actual y potencial de IA en comercio',
        question: '¿Te ayuda la IA a responder dudas de horarios/productos o crear campañas locales?',
        lowScoreHint: 'Todo el contenido, mensajes y atención se hace a mano tras cerrar la tienda',
        highScoreHint: 'Asistente de catálogo/citas y automatización de mensajes de reposición',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 8,
        key: 'cumplimiento',
        title: 'RGPD, consentimiento comercial y facturación',
        question: '¿Recoges permisos correctos para enviar promociones por WhatsApp y facturas adaptadas?',
        lowScoreHint: 'Envío manual de difusiones sin consentimiento documentado',
        highScoreHint: 'Base de clientes consentida, seguridad y facturación electrónica preparada',
        recommendedServiceId: 'cumple',
      },
      {
        areaNumber: 9,
        key: 'competencias',
        title: 'Competencias digitales del equipo de tienda',
        question: '¿Sabe tu personal captar reseñas en caja, usar el catálogo móvil y atender digitalmente?',
        lowScoreHint: 'La digitalización depende de una sola persona cuando tiene tiempo libre',
        highScoreHint: 'Rutina simple integrada en mostrador por todo el equipo',
        recommendedServiceId: 'forma',
      },
      {
        areaNumber: 10,
        key: 'crecimiento',
        title: 'Fidelización y recompra recurrente',
        question: '¿Cuentas con avisos de novedades, reposición o cumpleaños para traer clientes de vuelta?',
        lowScoreHint: 'Dependencia exclusiva de tráfico espontáneo de la calle',
        highScoreHint: 'Club o canal directo de clientes habituales con recurrencia mensual',
        recommendedServiceId: 'crece',
      },
    ],
    sectorRisks: [
      'Invisibilidad frente a búsquedas locales "cerca de mí" en Google Maps por ficha desatendida.',
      'Pérdida de ventas por no responder consultas de stock o cita fuera del horario comercial.',
      'Campañas de WhatsApp sin base consentida conforme a normativa de protección de datos.',
    ],
    aiOpportunities: [
      'Asistente de WhatsApp con escaparate móvil para consultas de stock, precios y reservas.',
      'Sistema automático post-compra para conseguir reseñas 5★ en Google Maps.',
      'Reactivación inteligente de clientes por temporada o reposición de servicio.',
    ],
    baseDafo: {
      strengths: [
        'Asesoramiento experto y cercanía imposible de igualar por marketplaces',
        'Ubicación física y prueba inmediata de producto/servicio',
      ],
      weaknesses: [
        'Falta de tiempo en mostrador para atender mensajes y redes sociales',
        'Escasa captura de datos de clientes que ya visitan la tienda',
      ],
      opportunities: [
        'Convertir el tráfico de barrio y Google Maps en pedidos/reservas por WhatsApp',
        'Fidelizar clientes recurrentes con campañas directas de bajo coste y alto retorno',
      ],
      threats: [
        'Grandes plataformas online captando búsquedas de proximidad',
        'Aumento de competencia local mejor posicionada digitalmente',
      ],
    },
    successIndicators: [
      'Tiempo liberado en gestión de pedidos y mensajes',
      'Reducción de huecos o encargos perdidos',
      'Incremento de clientes nuevos desde Google Maps',
      'Mayor frecuencia de recompra y fidelización',
      'Subida constante de reseñas 5 estrellas',
      'Reducción de merma y stock parado',
      'Digitalización del escaparate y caja',
      'Equipo capacitado en ventas omnicanal',
      'Retorno directo en ventas mensuales',
    ],
  },
  inmobiliarias: {
    sectorId: 'inmobiliarias',
    brandTitle: 'AsExiA | ConfIA360 Inmobiliaria',
    headline: 'Transformación inteligente para agencias inmobiliarias y gestión patrimonial',
    heroTagline: 'Más captaciones · Visitas cualificadas · Cierres más rápidos',
    targetDescription: 'Tu inmobiliaria más ágil, más competitiva',
    targetAudienceList: [
      'Agencias inmobiliarias independientes',
      'Consultores y agentes inmobiliarios locales',
      'Gestoras de alquileres y patrimonio',
      'Promotoras de obra nueva y reformas',
      'Oficinas con varios comerciales de zona',
      'Servicios de home staging y comercialización',
    ],
    areas: [
      {
        areaNumber: 1,
        key: 'perfil',
        title: 'Perfil de cartera, zonas y objetivos de captación',
        question: '¿Tienes objetivos claros de exclusivas en zona, tasa de conversión y honorarios?',
        lowScoreHint: 'Captación oportunista sin seguimiento sistemático por código postal',
        highScoreHint: 'Control por zona, embudo de captación y rentabilidad por operación',
        recommendedServiceId: 'diagnostico',
      },
      {
        areaNumber: 2,
        key: 'organizacion',
        title: 'Organización de cartera, llaves y visitas',
        question: '¿Cómo coordinas visitas, partes de visita, feedback a propietarios y equipo?',
        lowScoreHint: 'Llamadas constantes entre comerciales y partes de visita en papel',
        highScoreHint: 'Coordinación digital fluida con reportes automáticos al propietario',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 3,
        key: 'agenda',
        title: 'Cualificación previa de leads y agenda de visitas',
        question: '¿Filtras solvencia, financiación y urgencia antes de desplazar a un agente a enseñar pisos?',
        lowScoreHint: 'Pérdida de horas en visitas curiosas sin capacidad de compra ni respuesta rápida',
        highScoreHint: 'Filtro inteligente 24/7 por WhatsApp y agenda directa solo con compradores aptos',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 4,
        key: 'economia',
        title: 'Valoraciones, comisiones y control de operaciones',
        question: '¿Controlas costes de portales frente al retorno real de tus canales propios?',
        lowScoreHint: 'Dependencia costosa de portales sin medir coste por operación cerrada',
        highScoreHint: 'Equilibrio sano entre portales y captación propia de alto margen',
        recommendedServiceId: 'evoluciona',
      },
      {
        areaNumber: 5,
        key: 'captacion',
        title: 'Captación de propietarios y reputación local',
        question: '¿Atraes propietarios vendedores desde Google, landing de valoración y reseñas 5★?',
        lowScoreHint: 'Captación solo a puerta fría o llamadas sin autoridad digital en la zona',
        highScoreHint: 'Embudo de valoración online, SEO local fuerte y prueba social sólida',
        recommendedServiceId: 'crece',
      },
      {
        areaNumber: 6,
        key: 'sistemas',
        title: 'CRM inmobiliario, web y automatización documental',
        question: '¿Están conectados tu web, WhatsApp, portales y CRM sin picar datos dos veces?',
        lowScoreHint: 'Leads de portales que se enfrían en la bandeja de correo sin respuesta en minutos',
        highScoreHint: 'Respuesta instantánea y registro automático en CRM unificado',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 7,
        key: 'ia',
        title: 'Uso actual y potencial de IA inmobiliaria',
        question: '¿Usas IA para atender leads de portales en segundos, cruzar demandas y generar fichas?',
        lowScoreHint: 'Redacción manual de anuncios y seguimiento tardío de solicitudes nocturnas',
        highScoreHint: 'Asistente IA cualificador 24/7 y matching inteligente comprador-inmueble',
        recommendedServiceId: 'digitaliza',
      },
      {
        areaNumber: 8,
        key: 'cumplimiento',
        title: 'Firma de arras/encargos, PBC y RGPD',
        question: '¿Cuentas con firma digital de notas de encargo/arras, custodia documental y RGPD?',
        lowScoreHint: 'Contratos enviados para imprimir/escanear con retrasos que hacen perder operaciones',
        highScoreHint: 'Firma electrónica en minutos con validez legal y archivo seguro',
        recommendedServiceId: 'cumple',
      },
      {
        areaNumber: 9,
        key: 'competencias',
        title: 'Competencias digitales e IA del equipo comercial',
        question: '¿Domina cada asesor el CRM, seguimiento por WhatsApp y herramientas de presentación?',
        lowScoreHint: 'Cada comercial trabaja en su móvil personal sin trazabilidad para la agencia',
        highScoreHint: 'Equipo alineado con procesos medibles y adopción práctica de IA',
        recommendedServiceId: 'forma',
      },
      {
        areaNumber: 10,
        key: 'crecimiento',
        title: 'Seguimiento de cartera y referidos',
        question: '¿Mantienes vivas demandas activas y ex-clientes para generar nuevas captaciones?',
        lowScoreHint: 'Demandas olvidadas en Excel tras pasar las dos primeras semanas',
        highScoreHint: 'Nurturing automático con alertas de nuevos inmuebles y referidos',
        recommendedServiceId: 'evoluciona',
      },
    ],
    sectorRisks: [
      'Pérdida de compradores calientes al tardar más de 15 minutos en contestar leads de portales.',
      'Desplazamientos improductivos por no filtrar financiación ni solvencia previamente.',
      'Riesgos documentales en hojas de encargo, arras o custodia de datos de identidad.',
    ],
    aiOpportunities: [
      'Agente WhatsApp 24/7 que responde leads de portales en <10 segundos y filtra presupuesto/hipoteca.',
      'Cruce automático de nuevas captaciones con compradores pre-cualificados del CRM.',
      'Embudo local de valoración gratuita para captar propietarios vendedores en exclusiva.',
    ],
    baseDafo: {
      strengths: [
        'Conocimiento micro-local de precios, calles y tipologías del barrio',
        'Valor elevado por operación cerrada (alto impacto de cada mejora)',
      ],
      weaknesses: [
        'Mucho tiempo perdido enseñando inmuebles a curiosos sin financiación',
        'Seguimiento irregular cuando hay varias operaciones simultáneas',
      ],
      opportunities: [
        'Captar propietarios directamente mediante valoración digital y reputación 5★',
        'Acelerar reservas y arras mediante firma digital inmediata desde el móvil',
      ],
      threats: [
        'Franquicias y proptechs respondiendo leads de forma instantánea 24/7',
        'Encarecimiento continuo de visibilidad en portales inmobiliarios',
      ],
    },
    successIndicators: [
      'Horas semanales liberadas de visitas improductivas',
      'Reducción drástica de leads sin respuesta rápida',
      'Incremento de captaciones en exclusiva',
      'Mayor cierre y cruce de demanda activa',
      'Mejora de reseñas de vendedores y compradores',
      'Menor dependencia de gasto en portales',
      'Firma digital y CRM adoptados al 100%',
      'Asesores comerciales formados en IA',
      'ROI multiplicado por operaciones cerradas',
    ],
  },
};

export interface DiagnosticResult {
  sectorId: RoiSectorId;
  brandTitle: string;
  tier: DiagnosticTier;
  areaScores: Record<string, number>; // area key -> 1..10
  proChecklistKeys: string[];
  vipFocusGoal: string;
  maturityScore: number; // 0..100
  maturityLevel: 'Inicial' | 'En Transición' | 'Conectado' | 'Líder Digital';
  inefficiencyMap: Array<{
    areaNumber: number;
    title: string;
    score: number;
    issue: string;
    recommendedServiceId: Confia360ServiceModule['id'];
  }>;
  prioritizedActions: Array<{
    priority: 'Alta' | 'Media' | 'Estratégica';
    title: string;
    detail: string;
    serviceName: string;
  }>;
  dafo: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  risks: string[];
  aiOpportunities: string[];
  roadmap: {
    days30: string[];
    days90: string[];
    days180: string[];
  };
  recommendedServices: Confia360ServiceModule[];
  successKpis: Array<{ label: string; projectedTarget: string }>;
  generatedAt: string;
}

export function createDefaultAreaScores(sectorId: RoiSectorId): Record<string, number> {
  const tpl = SECTOR_DIAGNOSTIC_TEMPLATES[sectorId] || SECTOR_DIAGNOSTIC_TEMPLATES.clinicas;
  const scores: Record<string, number> = {};
  const defaults = [5, 4, 4, 5, 4, 4, 2, 5, 4, 3];
  tpl.areas.forEach((area, idx) => {
    scores[area.key] = defaults[idx] ?? 4;
  });
  return scores;
}

export function buildDiagnosticEvaluation(params: {
  sectorId: RoiSectorId;
  companySizeId: CompanySizeId;
  tier: DiagnosticTier;
  areaScores: Record<string, number>;
  proChecklistKeys?: string[];
  vipFocusGoal?: string;
  roiResult?: RoiCalculationResult | null;
}): DiagnosticResult {
  const {
    sectorId,
    companySizeId,
    tier,
    areaScores,
    proChecklistKeys = [],
    vipFocusGoal = 'Escalar captación y automatización con retorno medible en 90 días',
    roiResult = null,
  } = params;

  const tpl = SECTOR_DIAGNOSTIC_TEMPLATES[sectorId] || SECTOR_DIAGNOSTIC_TEMPLATES.clinicas;
  const normalizedScores: Record<string, number> = {};
  let totalScore = 0;

  tpl.areas.forEach((area) => {
    const raw = areaScores[area.key];
    const safe = typeof raw === 'number' && Number.isFinite(raw) ? Math.min(10, Math.max(1, Math.round(raw))) : 4;
    normalizedScores[area.key] = safe;
    totalScore += safe;
  });

  // Base maturity from 10 areas (max 100), slightly calibrated by pro compliance checklist if present
  const basePercent = Math.round((totalScore / (tpl.areas.length * 10)) * 100);
  const maturityScore = Math.min(100, Math.max(10, basePercent));

  let maturityLevel: DiagnosticResult['maturityLevel'] = 'Inicial';
  if (maturityScore >= 80) maturityLevel = 'Líder Digital';
  else if (maturityScore >= 60) maturityLevel = 'Conectado';
  else if (maturityScore >= 40) maturityLevel = 'En Transición';

  const sortedLow = [...tpl.areas].sort(
    (a, b) => (normalizedScores[a.key] || 4) - (normalizedScores[b.key] || 4)
  );
  const sortedHigh = [...tpl.areas].sort(
    (a, b) => (normalizedScores[b.key] || 4) - (normalizedScores[a.key] || 4)
  );

  const inefficiencyMap = sortedLow.slice(0, 5).map((area) => ({
    areaNumber: area.areaNumber,
    title: area.title,
    score: normalizedScores[area.key],
    issue: area.lowScoreHint,
    recommendedServiceId: area.recommendedServiceId,
  }));

  const serviceById = Object.fromEntries(CONFIA360_SERVICES.map((s) => [s.id, s])) as Record<
    Confia360ServiceModule['id'],
    Confia360ServiceModule
  >;

  const prioritizedActions = sortedLow.slice(0, 4).map((area, idx) => {
    const svc = serviceById[area.recommendedServiceId] || CONFIA360_SERVICES[1];
    return {
      priority: (idx < 2 ? 'Alta' : idx === 2 ? 'Media' : 'Estratégica') as 'Alta' | 'Media' | 'Estratégica',
      title: `${area.areaNumber}. ${area.title}`,
      detail: `Puntuación actual ${normalizedScores[area.key]}/10 · Objetivo: ${area.highScoreHint}`,
      serviceName: svc.name,
    };
  });

  const dynamicStrengths = [
    ...sortedHigh
      .filter((a) => normalizedScores[a.key] >= 6)
      .slice(0, 2)
      .map((a) => `Base sólida en ${a.title} (${normalizedScores[a.key]}/10)`),
    ...tpl.baseDafo.strengths,
  ].slice(0, 4);

  const dynamicWeaknesses = [
    ...sortedLow
      .slice(0, 2)
      .map((a) => `${a.title} (${normalizedScores[a.key]}/10): ${a.lowScoreHint}`),
    ...tpl.baseDafo.weaknesses,
  ].slice(0, 4);

  const needsCaptacionBoost =
    (normalizedScores['captacion'] ?? 5) <= 6 || (normalizedScores['crecimiento'] ?? 5) <= 6;
  const recommendedIds = Array.from(
    new Set<Confia360ServiceModule['id']>([
      ...(needsCaptacionBoost || tier === 'pro' || tier === 'vip'
        ? (['captaglobal'] as Confia360ServiceModule['id'][])
        : []),
      'diagnostico',
      ...sortedLow.slice(0, 4).map((a) => a.recommendedServiceId),
      ...(tier === 'vip' ? (['forma', 'evoluciona'] as Confia360ServiceModule['id'][]) : []),
    ])
  );
  const recommendedServices = recommendedIds.map((id) => serviceById[id]).filter(Boolean);

  const sizeFocus =
    companySizeId === 'mediana'
      ? 'despliegue multi-equipo con gobernanza y control por áreas'
      : companySizeId === 'pequena'
      ? 'coordinación ágil del equipo sin tareas duplicadas'
      : 'impacto rápido con mínima complejidad operativa';

  const roadmap = {
    days30: [
      `Arranque rápido en ${sortedLow[0]?.title || 'atención y agenda'} (${sizeFocus}).`,
      'Optimización de presencia local, web móvil y canal directo de WhatsApp.',
      proChecklistKeys.includes('cumplimiento-rgpd')
        ? 'Validación documental de cumplimiento RGPD y firma digital.'
        : 'Revisión urgente de cumplimiento RGPD, consentimientos y copias de seguridad.',
    ],
    days90: [
      `Automatización completa de ${sortedLow[1]?.title || 'captación y seguimiento'} con agente IA supervisado.`,
      'Integración de CRM unificado con recordatorios automáticos y captación de reseñas 5★.',
      'Formación práctica del equipo (ConfIA360 Forma) para consolidar adopción sin errores.',
    ],
    days180: [
      `Escalado hacia ${vipFocusGoal.toLowerCase()}.`,
      'Cuadro de mando de KPIs y revisión trimestral de retorno (ConfIA360 Evoluciona).',
      'Campañas recurrentes de reactivación y crecimiento sostenible sobre base propia.',
    ],
  };

  const hoursTarget = roiResult ? `~${roiResult.savedHoursWeek} h/sem` : '10–18 h/sem';
  const netTarget = roiResult ? `+${roiResult.annualNetBenefit.toLocaleString('es-ES')} €/año` : '+18.000 €/año';
  const leadsTarget = roiResult ? `+${roiResult.recoveredLeadsMonth} clientes/mes` : '+25% captación';

  const kpiTargets = [
    hoursTarget,
    '-65% ausencias y llamadas perdidas',
    leadsTarget,
    '+30% recurrencia de cartera',
    '4.8–4.9 ★ en Google Maps',
    roiResult ? `${roiResult.monthlyOperationalSavings.toLocaleString('es-ES')} €/mes ahorro` : '-22% coste operativo',
    `De ${maturityScore}/100 a ≥85/100`,
    '100% equipo capacitado en IA segura',
    netTarget,
  ];

  const successKpis = tpl.successIndicators.map((label, idx) => ({
    label,
    projectedTarget: kpiTargets[idx] || COMMON_SUCCESS_INDICATORS[idx] || 'Mejora medible',
  }));

  return {
    sectorId,
    brandTitle: tpl.brandTitle,
    tier,
    areaScores: normalizedScores,
    proChecklistKeys,
    vipFocusGoal,
    maturityScore,
    maturityLevel,
    inefficiencyMap,
    prioritizedActions,
    dafo: {
      strengths: dynamicStrengths,
      weaknesses: dynamicWeaknesses,
      opportunities: tpl.baseDafo.opportunities,
      threats: tpl.baseDafo.threats,
    },
    risks: tpl.sectorRisks,
    aiOpportunities: tpl.aiOpportunities,
    roadmap,
    recommendedServices,
    successKpis,
    generatedAt: new Date().toISOString(),
  };
}

export interface CrmDeliverable {
  id: string;
  type: 'dossier-html' | 'informe-txt' | 'paquete-json';
  tier: DiagnosticTier;
  channel: 'descarga' | 'email' | 'whatsapp' | 'crm';
  recipient: string;
  summary: string;
  generatedAt: string;
}

export interface CrmProposal {
  id: string;
  title: string;
  setupFee: number;
  monthlyFee: number;
  kitDigitalApplied: boolean;
  servicesIncluded: string[];
  notes: string;
  status: 'borrador' | 'enviada' | 'aceptada' | 'rechazada';
  createdAt: string;
}

export interface CrmCommunication {
  id: string;
  type: 'llamada' | 'whatsapp' | 'email' | 'reunion' | 'nota' | 'sync';
  direction: 'saliente' | 'entrante' | 'interno';
  summary: string;
  createdAt: string;
}

export interface CaptaGlobalSyncState {
  externalLeadId?: string;
  status: 'pending' | 'queued' | 'synced' | 'error' | 'imported';
  targetUrl: string;
  retryCount?: number;
  nextRetryAt?: string;
  lastAttemptAt?: string;
  lastSyncedAt?: string;
  lastError?: string;
  payloadSnapshot?: Record<string, unknown>;
}

export interface CaptaGlobalConfig {
  endpointUrl: string;
  webhookPath: string;
  apiKey: string;
  autoSyncOnIntake: boolean;
  updatedAt: string;
}

export interface CrmClient {
  id: string;
  name: string;
  companyName: string;
  sectorId: RoiSectorId;
  sectorLabel: string;
  companySizeId: CompanySizeId;
  postalCode: string;
  phone: string;
  email: string;
  primarySource: CrmSource;
  createdAt: string;
  updatedAt: string;
}

export interface CrmOpportunity {
  id: string;
  clientId: string;
  title: string;
  source: CrmSource;
  stage: CrmStage;
  diagnosticTier: DiagnosticTier;
  assignedOwner: string;
  nextFollowUpAt: string;
  estimatedAnnualValue: number;
  roiSimulation?: {
    inputs: RoiUserInputs;
    results: RoiCalculationResult;
    updatedAt: string;
    editedByAdmin?: boolean;
  };
  diagnosticResult?: DiagnosticResult;
  deliverables: CrmDeliverable[];
  proposals: CrmProposal[];
  communications: CrmCommunication[];
  captaGlobalSync: CaptaGlobalSyncState;
  createdAt: string;
  updatedAt: string;
}

export interface CrmStoreData {
  clients: CrmClient[];
  opportunities: CrmOpportunity[];
  captaGlobalConfig: CaptaGlobalConfig;
}

export const STAGE_LABELS: Record<CrmStage, string> = {
  nuevo: 'Nuevo Lead',
  diagnostico: 'Diagnóstico Realizado',
  'roi-enviado': 'ROI / Informe Enviado',
  propuesta: 'Propuesta Generada',
  seguimiento: 'En Seguimiento',
  ganada: 'Ganada',
  perdida: 'Perdida',
};

export const SOURCE_LABELS: Record<CrmSource, string> = {
  'diagnostico-confia360': 'Diagnóstico ConfIA360',
  'roi-calculator': 'Calculadora ROI',
  captaglobal: 'ConfIA360 CaptaGlobal',
  'booking-web': 'Reserva Web',
  'proposal-comparator': 'Comparador Propuestas',
  'chat-ia': 'Agente IA Chat',
};

export const TIER_LABELS: Record<DiagnosticTier, string> = {
  base: 'Base',
  pro: 'Pro',
  vip: 'VIP',
};
