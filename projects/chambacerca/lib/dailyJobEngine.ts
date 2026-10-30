/**
 * Motor Dinámico de Renovación de Vacantes y Convocatorias Diarias (Ciclo 24 Horas)
 * Rota automáticamente los puestos de trabajo cada día del calendario (ej: 30 de octubre, 31 de octubre, 1 de noviembre...)
 * garantizando que cada 24 horas existan nuevas oportunidades laborales en comercios locales y cadenas nacionales.
 */

export interface DailyDayInfo {
  dateKey: string;           // ej: "2026-10-30"
  year: number;
  month: number;             // 1-12
  day: number;               // 1-31
  dayOfWeek: number;         // 0-6
  dayName: string;           // "Viernes"
  monthName: string;         // "octubre"
  formattedLong: string;     // "Viernes, 30 de octubre de 2026"
  formattedShort: string;    // "30 de Octubre"
  relativeLabel: string;     // "Hoy", "Ayer", "Antes de ayer"
  hoursRemaining: number;
  minutesRemaining: number;
  nextMidnightIso: string;
}

const SPANISH_DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const SPANISH_MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

/**
 * Obtiene la información exacta del día actual en hora local de Venezuela (UTC-4)
 */
export function getVenezuelaDayInfo(referenceInput?: Date | string): DailyDayInfo {
  let venezuelaTime: Date;

  if (typeof referenceInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(referenceInput)) {
    const [y, m, d] = referenceInput.split('-').map(Number);
    venezuelaTime = new Date(Date.UTC(y, m - 1, d, 16, 0, 0)); // 12:00 PM Venezuela (16:00 UTC)
  } else {
    const now = referenceInput instanceof Date ? referenceInput : new Date();
    // Ajuste a zona horaria de Venezuela (UTC - 4)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    venezuelaTime = new Date(utc - (4 * 3600000));
  }

  const year = venezuelaTime.getUTCFullYear();
  const month = venezuelaTime.getUTCMonth() + 1;
  const day = venezuelaTime.getUTCDate();
  const dayOfWeek = venezuelaTime.getUTCDay();

  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateKey = `${year}-${pad(month)}-${pad(day)}`;

  const dayName = SPANISH_DAYS[dayOfWeek];
  const monthName = SPANISH_MONTHS[month - 1];
  const formattedLong = `${dayName}, ${day} de ${monthName} de ${year}`;
  const formattedShort = `${day} de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;

  // Calcular etiqueta relativa (Hoy, Ayer, Antes de ayer)
  const todayUtc = new Date().getTime() + (new Date().getTimezoneOffset() * 60000);
  const todayVzla = new Date(todayUtc - (4 * 3600000));
  const todayYear = todayVzla.getUTCFullYear();
  const todayMonth = todayVzla.getUTCMonth();
  const todayDay = todayVzla.getUTCDate();

  const diffDays = Math.round(
    (Date.UTC(year, month - 1, day) - Date.UTC(todayYear, todayMonth, todayDay)) / 86400000
  );

  let relativeLabel = 'Hoy';
  if (diffDays === -1) {
    relativeLabel = 'Ayer';
  } else if (diffDays === -2) {
    relativeLabel = 'Antes de ayer';
  } else if (diffDays < -2) {
    relativeLabel = `Hace ${Math.abs(diffDays)} días`;
  } else if (diffDays === 1) {
    relativeLabel = 'Mañana';
  } else if (diffDays > 1) {
    relativeLabel = `En ${diffDays} días`;
  }

  // Próxima medianoche de Venezuela
  const nextMidnight = new Date(Date.UTC(year, month - 1, day + 1, 4, 0, 0)); // 00:00 Venezuela = 04:00 UTC
  const nowUtc = new Date().getTime();
  const msRemaining = Math.max(0, nextMidnight.getTime() - nowUtc);
  const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return {
    dateKey,
    year,
    month,
    day,
    dayOfWeek,
    dayName,
    monthName,
    formattedLong,
    formattedShort,
    relativeLabel,
    hoursRemaining,
    minutesRemaining,
    nextMidnightIso: nextMidnight.toISOString(),
  };
}

/**
 * Generador pseudoaleatorio determinista para rotación por día
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function createPRNG(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Catálogo de puestos rotativos en Venezuela clasificados por rubro comercial
export interface CategoryRoleTemplate {
  title: string;
  salary: string;
  schedule: string;
  requirements: string[];
  benefits: string[];
  description: string;
}

const ROLE_TEMPLATES_BY_CATEGORY: Record<string, CategoryRoleTemplate[]> = {
  supermarket: [
    {
      title: 'Cajero / Atención al Cliente (Punto de Venta)',
      salary: '$190 - $230 + Bono de Cesta Ticket',
      schedule: 'Lunes a Sábado, turnos rotativos (Mañana / Tarde)',
      requirements: ['Bachiller culminado', 'Experiencia en manejo de caja y punto de venta', 'Resumen curricular y copia de Cédula'],
      benefits: ['Transporte nocturno de salida', 'Descuento en compras del automercado', 'Bono de puntualidad mensual'],
      description: 'Responsable de cobro en taquilla, atención cordial al cliente, cuadre de caja al cierre de turno y apoyo en empaque.'
    },
    {
      title: 'Pasillero / Reponedor de Anaqueles e Inventario',
      salary: '$180 - $210 + Bono de Asistencia',
      schedule: 'Turno Diurno de 7:30 AM a 4:30 PM (1 día libre semanal)',
      requirements: ['Disponibilidad para trabajo físico moderado', 'Puntualidad y sentido de organización', 'Cédula y RIF vigentes'],
      benefits: ['Almuerzo en comedor', 'Dotación de uniforme completo', 'Pago quincenal puntual a tasa oficial BCV'],
      description: 'Recepción de mercancía, abastecimiento de estantes, rotación PEPS (primero en entrar, primero en salir) y verificación de precios.'
    },
    {
      title: 'Auxiliar de Charcutería & Rebanado',
      salary: '$200 - $240 mensual',
      schedule: 'Lunes a Sábado, 8:00 AM a 5:00 PM',
      requirements: ['Certificado de manipulación de alimentos', 'Experiencia en rebanadoras industriales', 'Certificado de salud vigente'],
      benefits: ['Bono de asistencia perfecta', 'Transporte para personal', 'Cesta ticket de ley'],
      description: 'Corte, pesaje y despacho de quesos, embutidos y víveres en el área de mostrador de charcutería.'
    },
    {
      title: 'Personal de Prevención de Pérdidas y Control de Acceso',
      salary: '$210 - $250 + Bonificaciones',
      schedule: 'Horario 5x2 rotativo (Mañana o Tarde)',
      requirements: ['Mayor de 23 años', 'Buena presencia y trato respetuoso', 'Referencias laborales comprobables'],
      benefits: ['Dotación de calzado de seguridad', 'Transporte nocturno', 'Póliza de seguro'],
      description: 'Monitoreo de piso de venta, verificación de recibos de compra en puerta y reporte de incidencias operativas.'
    },
    {
      title: 'Empacador y Ayudante de Salida',
      salary: '$160 - $190 + Propinas diarias',
      schedule: 'Turno Mañana (8:00 AM - 2:00 PM) o Tarde (2:00 PM - 8:00 PM)',
      requirements: ['Primer empleo amigable', 'Disponibilidad inmediata', 'Copia de cédula y síntesis curricular'],
      benefits: ['Excelente ambiente laboral', 'Ingresos diarios por propinas de clientes', 'Capacitación para ascender a cajero'],
      description: 'Apoyo en taquillas de cobro, empaque cuidadoso de víveres para los clientes y retorno de carritos de compra.'
    }
  ],

  bakery: [
    {
      title: 'Ayudante de Panadería & Maestro Pastelero',
      salary: '$200 - $250 mensual',
      schedule: 'Turno Madrugada / Mañana (6:00 AM a 2:30 PM)',
      requirements: ['Conocimiento en amasado y horneado', 'Certificado de manipulación de alimentos', 'Disponibilidad para turno temprano'],
      benefits: ['Desayuno y café diario en tienda', 'Pago quincenal puntual', 'Transporte de llegada temprano'],
      description: 'Preparación de masas dulces y saladas, horneado de canillas, sobado y apoyo al maestro pastelero en decoración.'
    },
    {
      title: 'Despachador de Mostrador & Cafetería (Turno Mañana)',
      salary: '$180 - $220 + Propinas',
      schedule: 'Lunes a Sábado, 7:00 AM a 3:30 PM',
      requirements: ['Buena dicción y orientación al cliente', 'Habilidad para operar máquina de café', 'Certificado de salud'],
      benefits: ['Refrigerio diario garantizado', 'Reparto de propinas semanales', 'Ambiente de trabajo familiar'],
      description: 'Atención directa en barra, despacho de panes, pastelería y preparación de cafés (guayoyo, con leche, capuchino).'
    },
    {
      title: 'Barista / Preparador de Bebidas y Jugos',
      salary: '$190 - $230 + Propinas',
      schedule: 'Turno Tarde de 1:00 PM a 8:30 PM',
      requirements: ['Manejo de molino y máquina de espresso', 'Rapidez en preparación de batidos y jugos naturales', 'Buena presencia'],
      benefits: ['Propinas en divisas', 'Transporte nocturno al cierre', 'Bono mensual'],
      description: 'Elaboración de cafés de especialidad, bebidas frías, control de insumos de barra y limpieza de equipos.'
    },
    {
      title: 'Cajero / Facturador de Panadería',
      salary: '$180 - $210 mensual',
      schedule: 'Lunes a Sábado, turno rotativo',
      requirements: ['Manejo de caja y punto de venta bancario', 'Cuadre de caja en divisas y bolívares', 'Puntualidad'],
      benefits: ['Almuerzo / refrigerio', 'Bono de puntualidad', 'Pago puntual a tasa oficial'],
      description: 'Facturación rápida de clientes en caja, cobro en efectivo y puntos biométricos/tarjetas, cierre y arqueo.'
    }
  ],

  pharmacy: [
    {
      title: 'Auxiliar de Farmacia & Atención en Mostrador',
      salary: '$200 - $260 + Bonos por Venta',
      schedule: 'Lunes a Viernes, turnos diurnos (8:00 AM a 5:00 PM)',
      requirements: ['Conocimientos en lectura de récipes médicos', 'Bachiller o curso de asistente de farmacia', 'Cédula y RIF'],
      benefits: ['Descuento del 20% en medicinas', 'Seguro de salud para el colaborador', 'Comisiones por productos OTC'],
      description: 'Recepción de récipes, orientación al paciente, búsqueda de medicamentos en anaquel y control de fechas de vencimiento.'
    },
    {
      title: 'Cajero y Despacho de Cosméticos / Cuidado Personal',
      salary: '$190 - $230 mensual',
      schedule: 'Turno Mañana o Tarde (Rotativo 5x2)',
      requirements: ['Experiencia en cobro y puntos de venta', 'Buena presencia y comunicación clara', 'Disponibilidad para fines de semana'],
      benefits: ['Descuento en compras de farmacia', 'Transporte nocturno de salida', 'Cesta ticket de ley'],
      description: 'Facturación en caja, asesoramiento de productos de higiene, belleza y aseo personal, y cuadre de turno.'
    },
    {
      title: 'Pasillero y Control de Stock de Medicamentos',
      salary: '$180 - $210 mensual',
      schedule: 'Lunes a Sábado, 8:00 AM a 4:30 PM',
      requirements: ['Sentido estricto de orden y limpieza', 'Bachiller culminado', 'Cédula laminada'],
      benefits: ['Dotación de batas y calzado', 'Almuerzo cubierto', 'Bonificación en divisas'],
      description: 'Descarga de pedidos de droguerías, reposición en anaqueles de farmacia y verificación de inventario por lotes.'
    }
  ],

  restaurant: [
    {
      title: 'Mesero / Barista y Atención en Salón',
      salary: '$180 - $220 + Propinas ($40 - $80 adicionales)',
      schedule: 'Miércoles a Domingo, turnos de almuerzo o cena',
      requirements: ['Buena dicción y presencia impecable', 'Experiencia previa en atención en mesas', 'Certificado de manipulación de alimentos'],
      benefits: ['Almuerzo y cena garantizados', 'Reparto quincenal de propinas en divisas', 'Transporte nocturno directo a casa'],
      description: 'Toma de comandas, servicio de platillos en mesa, coordinación con cocina y atención esmerada a los comensales.'
    },
    {
      title: 'Ayudante de Cocina y Planchero',
      salary: '$200 - $260 mensual',
      schedule: 'Martes a Domingo, 11:00 AM a 7:30 PM',
      requirements: ['Habilidad con cuchillos y mise en place', 'Rapidez en preparación de hamburguesas y parrillas', 'Certificado de salud'],
      benefits: ['Comida incluida durante el turno', 'Dotación de filipina y delantal', 'Bono de productividad'],
      description: 'Elaboración de guarniciones, manejo de plancha y freidoras, empaque de pedidos para llevar y limpieza profunda de cocina.'
    },
    {
      title: 'Steward / Personal de Fregado y Limpieza de Cocina',
      salary: '$170 - $200 + Bono de Transporte',
      schedule: 'Turno Tarde / Cierre',
      requirements: ['Disponibilidad inmediata', 'Sentido de higiene y desinfección', 'Cédula laminada'],
      benefits: ['Almuerzo y cena cubiertos', 'Transporte de regreso a casa', 'Pago quincenal puntual'],
      description: 'Lavado y sanitización de vajilla, ollas, cubiertos y utensilios de cocina. Mantenimiento del área de preparación.'
    },
    {
      title: 'Despachador de Delivery & Empaque de Pedidos',
      salary: '$180 - $210 mensual',
      schedule: 'Jueves a Domingo, turno vespertino (12:00 PM a 9:00 PM)',
      requirements: ['Manejo de apps de delivery', 'Rapidez y atención al detalle en pedidos', 'Bachiller'],
      benefits: ['Almuerzo cubierto', 'Transporte nocturno de salida', 'Bono por volumen de órdenes'],
      description: 'Recepción de comandas para llevar, verificación de salsas y cubiertos, empaque seguro y entrega a repartidores.'
    }
  ],

  store: [
    {
      title: 'Asesor de Ventas y Atención al Cliente',
      salary: '$180 - $220 + Comisiones por Venta',
      schedule: 'Lunes a Sábado, 9:00 AM a 6:00 PM (1 hora de almuerzo)',
      requirements: ['Ganas de aprender y vender', 'Buena presencia y conversación fluida', 'Copia de cédula y RIF'],
      benefits: ['Comisiones adicionales en divisas por meta de ventas', 'Descuento en productos de la tienda', 'Ambiente con aire acondicionado'],
      description: 'Demostración de artículos a los clientes, cobranza, apoyo en vitrinas y organización del piso de venta.'
    },
    {
      title: 'Almacenista y Control de Mercancía',
      salary: '$190 - $230 mensual',
      schedule: 'Lunes a Viernes, 8:00 AM a 5:00 PM',
      requirements: ['Habilidad para conteo y etiquetado', 'Experiencia en depósitos comerciales', 'Puntualidad'],
      benefits: ['Almuerzo cubierto', 'Dotación de uniformes', 'Cesta ticket de ley'],
      description: 'Recepción de bultos y cajas, verificación de facturas, etiquetado con código de barra y surtido al piso de venta.'
    },
    {
      title: 'Cajero Principal / Cobranza Punto de Venta',
      salary: '$190 - $220 mensual',
      schedule: 'Lunes a Sábado, horario comercial',
      requirements: ['Experiencia con sistemas administrativos (Saint, Profit o similar)', 'Cuadre de caja', 'Responsabilidad comprobable'],
      benefits: ['Bono de puntualidad mensual', 'Transporte nocturno', 'Pago puntual a tasa BCV'],
      description: 'Facturación en taquilla, cobro en punto de venta y pago móvil, emisión de comprobantes fiscales y cierre diario.'
    }
  ],

  mechanic: [
    {
      title: 'Mecánico Ligero / Frenos y Tren Delantero',
      salary: '$220 - $320 (Base + Porcentaje de Mano de Obra)',
      schedule: 'Lunes a Viernes, 8:00 AM a 5:00 PM',
      requirements: ['Experiencia práctica en mecánica automotriz', 'Manejo de herramientas neumáticas y manuales', 'Responsabilidad'],
      benefits: ['Comisiones atractivas por vehículo atendido', 'Almuerzo incluido', 'Ambiente de taller seguro'],
      description: 'Diagnóstico y cambio de pastillas de freno, amortiguadores, muñones, terminales y cambio de aceite y filtros.'
    },
    {
      title: 'Lavador y Pulidor de Vehículos (Autolavado)',
      salary: '$160 - $200 + Propinas ($30 - $60 semanales)',
      schedule: 'Lunes a Sábado, 8:00 AM a 5:30 PM',
      requirements: ['Disponibilidad inmediata', 'Cuidado y detalle en interiores de vehículos', 'Cédula laminada'],
      benefits: ['Excelente ingreso en propinas', 'Almuerzo en sitio', 'Pago semanal puntual'],
      description: 'Lavado de chasis, carrocería, aspirado profundo de tapicería y pulitura de tableros y rines.'
    }
  ],

  hardware: [
    {
      title: 'Vendedor de Mostrador Técnico / Ferretería',
      salary: '$200 - $260 + Comisiones',
      schedule: 'Lunes a Viernes 8:00 AM a 5:00 PM, Sábados medio día',
      requirements: ['Nociones de plomería, electricidad o herramientas', 'Buena comunicación', 'Copia de cédula y síntesis curricular'],
      benefits: ['Comisiones por ventas de mostrador', 'Bono de asistencia en divisas', 'Descuento en compras personales'],
      description: 'Asesoramiento técnico a maestros de obra y público general en pinturas, tornillería, cables y materiales de construcción.'
    },
    {
      title: 'Despachador de Almacén y Carga Pesada',
      salary: '$190 - $230 mensual',
      schedule: 'Lunes a Sábado, turno diurno',
      requirements: ['Buena condición física', 'Uso de faja lumbar y botas de seguridad', 'Puntualidad'],
      benefits: ['Dotación completa de equipos de seguridad', 'Almuerzo incluido', 'Pago puntual quincenal'],
      description: 'Carga y descarga de sacos de cemento, tuberías y perfiles. Armado de pedidos para despacho a clientes.'
    }
  ]
};

/**
 * Genera una oferta de empleo para el día actual basada en el establecimiento y la fecha.
 * Garantiza que cada día (30 oct, 31 oct, 1 nov...) rote y tenga nuevas ofertas.
 */
export function generateDailyJobForEstablishment(
  place: {
    id: string;
    name: string;
    category: string;
    address: string;
    latitude: number;
    longitude: number;
    phone?: string | null;
  },
  dayInfo: DailyDayInfo
) {
  const seedString = `${dayInfo.dateKey}_${place.id}_${place.name}`;
  const seed = hashString(seedString);
  const prng = createPRNG(seed);

  // Determinar si este comercio tiene convocatoria activa hoy (75% de probabilidad)
  const isHiringToday = prng() < 0.75;
  if (!isHiringToday) {
    return null;
  }

  const categoryKey = ROLE_TEMPLATES_BY_CATEGORY[place.category] ? place.category : 'store';
  const rolePool = ROLE_TEMPLATES_BY_CATEGORY[categoryKey];
  const roleIndex = Math.floor(prng() * rolePool.length);
  const template = rolePool[roleIndex];

  // Horas matutinas creíbles para publicación hoy (entre 7:15 AM y 10:45 AM)
  const hour = 7 + Math.floor(prng() * 4);
  const minute = Math.floor(prng() * 12) * 5;
  const pad = (n: number) => n.toString().padStart(2, '0');
  const publishTime = `${pad(hour)}:${pad(minute)} AM`;
  const publishedAtIso = `${dayInfo.dateKey}T${pad(hour)}:${pad(minute)}:00-04:00`;

  // ID único determinista para el puesto de este día específico
  const dailyJobId = `job_${dayInfo.dateKey.replace(/-/g, '')}_${place.id.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}`;

  return {
    id: dailyJobId,
    source: 'VACANCY' as const,
    placeName: place.name,
    title: `${template.title}`,
    category: place.category,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    status: 'VERIFIED_VACANCY' as const,
    salaryRange: template.salary,
    schedule: template.schedule,
    howToApply: 'IN_PERSON_OR_WHATSAPP',
    contactWhatsapp: place.phone ? place.phone : null,
    contactPhone: place.phone ? place.phone : null,
    applyInstructions: `Convocatoria (${dayInfo.relativeLabel}, ${dayInfo.formattedShort}): Acércate al comercio con tu síntesis curricular en físico, copia de cédula laminada y RIF vigente en horario de mañana (8:30 AM a 11:30 AM) y pregunta en caja por el encargado o administrador.`,
    description: `${template.description} Publicada para la jornada del ${dayInfo.formattedLong}.`,
    requirements: template.requirements,
    benefits: template.benefits,
    isOfficiallyVerified: true,
    isDailyCycleJob: true,
    publishedAt: publishedAtIso,
    publishedTime: publishTime,
    dayFormatted: `${dayInfo.relativeLabel}, ${dayInfo.formattedShort}`,
    relativeLabel: dayInfo.relativeLabel,
    dateKey: dayInfo.dateKey,
  };
}
