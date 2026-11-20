// Base de Datos Integral del Sistema Metro de Caracas (L1, L2, L3, L4, MetroCable y Cabletrén)

export interface MetroStation {
  id: string;
  name: string;
  lineId: string;
  transfers?: string[]; // IDs de otras líneas a las que transfiere
  isTerminal?: boolean;
  order: number;
}

export interface MetroLine {
  id: string;
  name: string;
  shortName: string;
  color: string;
  gradient: string;
  textColor: string;
  stations: MetroStation[];
  status: 'normal' | 'delay' | 'maintenance';
  statusMessage: string;
  avgFrequencyMinutes: number;
}

export const METRO_LINES: MetroLine[] = [
  {
    id: 'L1',
    name: 'Línea 1: Propatria ↔ Palo Verde',
    shortName: 'Línea 1',
    color: '#E11D48', // Carmesí / Rojo Metro L1
    gradient: 'from-rose-600 via-red-600 to-rose-700',
    textColor: 'text-rose-400',
    status: 'normal',
    statusMessage: 'Operación continua en 22 estaciones con 18 trenes en vía.',
    avgFrequencyMinutes: 3,
    stations: [
      { id: 'l1-propatria', name: 'Propatria', lineId: 'L1', isTerminal: true, order: 1 },
      { id: 'l1-perez-bonalde', name: 'Pérez Bonalde', lineId: 'L1', order: 2 },
      { id: 'l1-plaza-sucre', name: 'Plaza Sucre', lineId: 'L1', order: 3 },
      { id: 'l1-gato-negro', name: 'Gato Negro', lineId: 'L1', order: 4 },
      { id: 'l1-agua-salud', name: 'Agua Salud', lineId: 'L1', order: 5 },
      { id: 'l1-cano-amarillo', name: 'Caño Amarillo', lineId: 'L1', order: 6 },
      { id: 'l1-capitolio', name: 'Capitolio', lineId: 'L1', transfers: ['L2'], order: 7 },
      { id: 'l1-la-hoyada', name: 'La Hoyada', lineId: 'L1', order: 8 },
      { id: 'l1-parque-carabobo', name: 'Parque Carabobo', lineId: 'L1', order: 9 },
      { id: 'l1-bellas-artes', name: 'Bellas Artes', lineId: 'L1', order: 10 },
      { id: 'l1-colegio-ingenieros', name: 'Colegio de Ingenieros', lineId: 'L1', order: 11 },
      { id: 'l1-plaza-venezuela', name: 'Plaza Venezuela', lineId: 'L1', transfers: ['L3', 'L4'], order: 12 },
      { id: 'l1-sabana-grande', name: 'Sabana Grande', lineId: 'L1', order: 13 },
      { id: 'l1-chacaito', name: 'Chacaíto', lineId: 'L1', order: 14 },
      { id: 'l1-chacao', name: 'Chacao', lineId: 'L1', order: 15 },
      { id: 'l1-altamira', name: 'Altamira', lineId: 'L1', order: 16 },
      { id: 'l1-miranda', name: 'Miranda', lineId: 'L1', order: 17 },
      { id: 'l1-los-dos-caminos', name: 'Los Dos Caminos', lineId: 'L1', order: 18 },
      { id: 'l1-los-cortijos', name: 'Los Cortijos', lineId: 'L1', order: 19 },
      { id: 'l1-la-california', name: 'La California', lineId: 'L1', order: 20 },
      { id: 'l1-petare', name: 'Petare', lineId: 'L1', transfers: ['CABLETREN'], order: 21 },
      { id: 'l1-palo-verde', name: 'Palo Verde', lineId: 'L1', transfers: ['METROCABLE_MARICHE'], isTerminal: true, order: 22 },
    ],
  },
  {
    id: 'L2',
    name: 'Línea 2: El Silencio ↔ Las Adjuntas / Zoológico',
    shortName: 'Línea 2',
    color: '#10B981', // Verde Esmeralda L2
    gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
    textColor: 'text-emerald-400',
    status: 'normal',
    statusMessage: 'Operación regular en ramales Zoológico y Las Adjuntas.',
    avgFrequencyMinutes: 5,
    stations: [
      { id: 'l2-el-silencio', name: 'El Silencio', lineId: 'L2', transfers: ['L1'], isTerminal: true, order: 1 },
      { id: 'l2-capuchinos', name: 'Capuchinos', lineId: 'L2', transfers: ['L4'], order: 2 },
      { id: 'l2-maternidad', name: 'Maternidad', lineId: 'L2', order: 3 },
      { id: 'l2-artigas', name: 'Artigas', lineId: 'L2', order: 4 },
      { id: 'l2-la-paz', name: 'La Paz', lineId: 'L2', order: 5 },
      { id: 'l2-la-yaguara', name: 'La Yaguara', lineId: 'L2', order: 6 },
      { id: 'l2-carapita', name: 'Carapita', lineId: 'L2', order: 7 },
      { id: 'l2-antimano', name: 'Antímano', lineId: 'L2', order: 8 },
      { id: 'l2-mamera', name: 'Mamera', lineId: 'L2', order: 9 },
      { id: 'l2-caricuao', name: 'Caricuao', lineId: 'L2', order: 10 },
      { id: 'l2-zoologico', name: 'Zoológico', lineId: 'L2', isTerminal: true, order: 11 },
      { id: 'l2-ruiz-pineda', name: 'Ruiz Pineda', lineId: 'L2', order: 12 },
      { id: 'l2-las-adjuntas', name: 'Las Adjuntas', lineId: 'L2', isTerminal: true, order: 13 },
    ],
  },
  {
    id: 'L3',
    name: 'Línea 3: Plaza Venezuela ↔ La Rinconada',
    shortName: 'Línea 3',
    color: '#2563EB', // Azul Cobalto L3
    gradient: 'from-blue-600 via-indigo-600 to-blue-700',
    textColor: 'text-blue-400',
    status: 'normal',
    statusMessage: 'Conexión directa con Ferrocarril IFE Valles del Tuy.',
    avgFrequencyMinutes: 4,
    stations: [
      { id: 'l3-plaza-venezuela', name: 'Plaza Venezuela', lineId: 'L3', transfers: ['L1', 'L4'], isTerminal: true, order: 1 },
      { id: 'l3-ciudad-universitaria', name: 'Ciudad Universitaria (UCV)', lineId: 'L3', order: 2 },
      { id: 'l3-los-simbolos', name: 'Los Símbolos', lineId: 'L3', order: 3 },
      { id: 'l3-la-bandera', name: 'La Bandera', lineId: 'L3', order: 4 },
      { id: 'l3-el-valle', name: 'El Valle', lineId: 'L3', order: 5 },
      { id: 'l3-los-jardines', name: 'Los Jardines', lineId: 'L3', order: 6 },
      { id: 'l3-coche', name: 'Coche', lineId: 'L3', order: 7 },
      { id: 'l3-mercado', name: 'Mercado', lineId: 'L3', order: 8 },
      { id: 'l3-la-rinconada', name: 'La Rinconada', lineId: 'L3', isTerminal: true, order: 9 },
    ],
  },
  {
    id: 'L4',
    name: 'Línea 4: Zona Rental ↔ Teatros / Capuchinos',
    shortName: 'Línea 4',
    color: '#F59E0B', // Amarillo / Ámbar L4
    gradient: 'from-amber-500 via-yellow-500 to-amber-600',
    textColor: 'text-amber-400',
    status: 'normal',
    statusMessage: 'Operación normal interconectada con Zona Rental.',
    avgFrequencyMinutes: 6,
    stations: [
      { id: 'l4-zona-rental', name: 'Zona Rental', lineId: 'L4', transfers: ['L1', 'L3'], isTerminal: true, order: 1 },
      { id: 'l4-parque-central', name: 'Parque Central', lineId: 'L4', transfers: ['METROCABLE_SAN_AGUSTIN'], order: 2 },
      { id: 'l4-nuevo-circo', name: 'Nuevo Circo', lineId: 'L4', order: 3 },
      { id: 'l4-teatros', name: 'Teatros', lineId: 'L4', order: 4 },
      { id: 'l4-capuchinos', name: 'Capuchinos', lineId: 'L4', transfers: ['L2'], isTerminal: true, order: 5 },
    ],
  },
];

// Tarifas del Metro de Caracas y Planes de Recarga
export const METRO_FARE = {
  tripPriceBs: 15.00,
  bcvExchangeRate: 54.80, // Tasa referencial oficial BCV
  plans: [
    {
      id: 'single',
      name: 'Viaje Simple',
      trips: 1,
      priceBs: 15.00,
      badge: 'Básico',
      description: '1 viaje de acceso a torniquete',
    },
    {
      id: 'pack10',
      name: 'Pack Rutero 10',
      trips: 10,
      priceBs: 135.00, // 10% descuento
      badge: 'Ahorro 10%',
      popular: true,
      description: '10 viajes (13.50 Bs. c/u)',
    },
    {
      id: 'pack30',
      name: 'Multi-Abono 30',
      trips: 30,
      priceBs: 380.00, // ~15% descuento
      badge: 'Ahorro 15%',
      description: '30 viajes (12.60 Bs. c/u) válido 30 días',
    },
    {
      id: 'student',
      name: 'Pase Estudiantil',
      trips: 20,
      priceBs: 50.00,
      badge: 'Subsidio UCV / Escolar',
      description: 'Tarifa preferencial para estudiantes verificados',
    },
    {
      id: 'senior',
      name: 'Adulto Mayor / Tercera Edad',
      trips: 50,
      priceBs: 0.00,
      badge: 'Exonerado 100%',
      description: 'Pase gratuito para mayores de 60 años',
    },
  ],
};

// Bancos para Pago Móvil en Venezuela
export const VENEZUELA_BANKS = [
  { code: '0102', name: 'Banco de Venezuela (BDV)' },
  { code: '0134', name: 'Banesco Banco Universal' },
  { code: '0105', name: 'Banco Mercantil' },
  { code: '0108', name: 'BBVA Banco Provincial' },
  { code: '0172', name: 'Bancamiga Banco Universal' },
  { code: '0163', name: 'Banco Nacional de Crédito (BNC)' },
  { code: '0114', name: 'Bancaribe' },
  { code: '0115', name: 'Banco Exterior' },
];

// Cálculo de ruta entre dos estaciones
export function calculateMetroRoute(originId: string, destinationId: string) {
  let originStation: MetroStation | null = null;
  let originLine: MetroLine | null = null;
  let destStation: MetroStation | null = null;
  let destLine: MetroLine | null = null;

  for (const line of METRO_LINES) {
    for (const st of line.stations) {
      if (st.id === originId) {
        originStation = st;
        originLine = line;
      }
      if (st.id === destinationId) {
        destStation = st;
        destLine = line;
      }
    }
  }

  if (!originStation || !destStation || !originLine || !destLine) {
    return null;
  }

  if (originStation.id === destStation.id) {
    return {
      sameStation: true,
      stationsCount: 0,
      timeMinutes: 0,
      transfers: [],
      instructions: 'Estás en la misma estación.',
    };
  }

  // Mismo trayecto en la misma línea
  if (originLine.id === destLine.id) {
    const count = Math.abs(destStation.order - originStation.order);
    const timeMinutes = Math.round(count * 1.8 + 1);
    const direction = destStation.order > originStation.order 
      ? originLine.stations[originLine.stations.length - 1].name 
      : originLine.stations[0].name;

    return {
      sameStation: false,
      stationsCount: count,
      timeMinutes,
      direct: true,
      transfers: [],
      direction,
      line: originLine,
      instructions: `Toma ${originLine.shortName} dirección a ${direction}. Recorre ${count} estaciones (~${timeMinutes} min).`,
    };
  }

  // Ruta interconectada con transferencia (ej: Plaza Venezuela o Silencio/Capitolio)
  let transferStationName = 'Plaza Venezuela';
  if ((originLine.id === 'L1' && destLine.id === 'L2') || (originLine.id === 'L2' && destLine.id === 'L1')) {
    transferStationName = 'Capitolio ↔ El Silencio';
  }

  const countApprox = 7;
  const timeMinutes = 18;

  return {
    sameStation: false,
    stationsCount: countApprox,
    timeMinutes,
    direct: false,
    transfers: [transferStationName],
    instructions: `Comienza en ${originLine.shortName}. Realiza transferencia en ${transferStationName} hacia ${destLine.shortName}. (~${timeMinutes} min).`,
  };
}
