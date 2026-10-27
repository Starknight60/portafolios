export interface PropertyItem {
  id: string;
  title: string;
  type: 'room' | 'annex' | 'studio' | 'apartment';
  typeLabel: string;
  typeIcon: string;
  priceMonthlyUsd: number;
  depositMonths: number;
  contractFeeUsd: number;
  zone: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  nearestTransport: string;
  walkMinutesToTransport: number;
  waterSystem: {
    hasTank: boolean;
    tankLitres: number;
    schedule: string;
  };
  electricity: {
    hasGenerator: boolean;
    description: string;
  };
  internet: {
    hasFiber: boolean;
    provider: string;
    speedMbps: number;
  };
  rules: {
    allowsCouples: boolean;
    allowsPets: boolean;
    allowsStudents: boolean;
    allowsVisitors: boolean;
    hasIndependentKeys: boolean;
  };
  amenities: string[];
  verifiedDirectOwner: boolean;
  ownerName: string;
  ownerWhatsapp: string;
  images: string[];
  description: string;
  publishedDate: string;
}

export const CITIES_LIST = [
  { id: 'caracas', name: 'Caracas', lat: 10.4960, lng: -66.8520 },
  { id: 'valencia', name: 'Valencia', lat: 10.1800, lng: -67.9950 },
  { id: 'maracay', name: 'Maracay', lat: 10.2469, lng: -67.5958 },
  { id: 'maracaibo', name: 'Maracaibo', lat: 10.6427, lng: -71.6125 },
  { id: 'barquisimeto', name: 'Barquisimeto', lat: 10.0678, lng: -69.3474 },
];

export const INITIAL_PROPERTIES: PropertyItem[] = [
  // =========================================================================
  // CARACAS - CHACAO & ESTE
  // =========================================================================
  {
    id: 'zh-ccs-001',
    title: 'Habitación Amoblada con Baño Privado y Tanque Propio',
    type: 'room',
    typeLabel: 'Habitación Privada',
    typeIcon: '🛏️',
    priceMonthlyUsd: 120,
    depositMonths: 1,
    contractFeeUsd: 30,
    zone: 'Chacao',
    city: 'Caracas',
    address: 'Calle Bolívar, a 2 cuadras de la Plaza Bolívar de Chacao',
    latitude: 10.4925,
    longitude: -66.8550,
    nearestTransport: 'Metro Chacao • 5 min a pie',
    walkMinutesToTransport: 5,
    waterSystem: {
      hasTank: true,
      tankLitres: 2500,
      schedule: 'Agua constante con sistema hidroneumático del edificio',
    },
    electricity: {
      hasGenerator: false,
      description: 'Sector Chacao Centro con servicio eléctrico sumamente estable',
    },
    internet: {
      hasFiber: true,
      provider: 'NetUno Fibra Óptica',
      speedMbps: 200,
    },
    rules: {
      allowsCouples: false,
      allowsPets: false,
      allowsStudents: true,
      allowsVisitors: true,
      hasIndependentKeys: true,
    },
    amenities: ['Cama individual nueva', 'Nevera ejecutiva', 'Closet amplio', 'Escritorio para laptop', 'Baño privado remodelado'],
    verifiedDirectOwner: true,
    ownerName: 'Sra. Carmen Rodríguez (Dueña Directa)',
    ownerWhatsapp: '+584125550101',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Habitación independiente ideal para estudiante o profesional que trabaje en el este. Trato directo sin inmobiliarias ni comisiones abusivas. Edificio tranquilo con llave magnética.',
    publishedDate: 'Hace 2 días',
  },
  {
    id: 'zh-ccs-002',
    title: 'Anexo Independiente con Cocina Empotrada y Sala',
    type: 'annex',
    typeLabel: 'Anexo Completo',
    typeIcon: '🏡',
    priceMonthlyUsd: 220,
    depositMonths: 2,
    contractFeeUsd: 40,
    zone: 'Los Palos Grandes',
    city: 'Caracas',
    address: '3ra Avenida de Los Palos Grandes, entre 1ra y 2da Transversal',
    latitude: 10.4990,
    longitude: -66.8480,
    nearestTransport: 'Metro Miranda / Parque del Este • 6 min a pie',
    walkMinutesToTransport: 6,
    waterSystem: {
      hasTank: true,
      tankLitres: 4000,
      schedule: 'Tanque subterráneo + 2 tanques aéreos de reserva',
    },
    electricity: {
      hasGenerator: true,
      description: 'Planta eléctrica para luces básicas e internet durante fallas',
    },
    internet: {
      hasFiber: true,
      provider: 'Fibex Telecom',
      speedMbps: 300,
    },
    rules: {
      allowsCouples: true,
      allowsPets: true,
      allowsStudents: true,
      allowsVisitors: true,
      hasIndependentKeys: true,
    },
    amenities: ['Entrada totalmente independiente', 'Cocina a gas equipada', 'Lavadora automática', 'Aire acondicionado split', 'Puesto de estacionamiento opcional'],
    verifiedDirectOwner: true,
    ownerName: 'Ing. Marcos Valera (Propietario)',
    ownerWhatsapp: '+584149990202',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Anexo privado de 45m² en quinta de Los Palos Grandes. Acepta parejas responsables. Zona segura con cafeterías, panaderías y plazas a corta distancia caminando.',
    publishedDate: 'Hoy',
  },
  {
    id: 'zh-ccs-003',
    title: 'Habitación Económica Estudiantil cerca de la UCV',
    type: 'room',
    typeLabel: 'Habitación Estudiantil',
    typeIcon: '🎓',
    priceMonthlyUsd: 70,
    depositMonths: 1,
    contractFeeUsd: 20,
    zone: 'Sabana Grande',
    city: 'Caracas',
    address: 'Calle Real de Sabana Grande, cerca del callejón La Asunción',
    latitude: 10.4930,
    longitude: -66.8720,
    nearestTransport: 'Metro Sabana Grande • 3 min a pie / 10 min a pie a UCV',
    walkMinutesToTransport: 3,
    waterSystem: {
      hasTank: true,
      tankLitres: 1500,
      schedule: 'Suministro constante con tanque auxiliar de apoyo',
    },
    electricity: {
      hasGenerator: false,
      description: 'Luz continua de zona comercial bulevar',
    },
    internet: {
      hasFiber: true,
      provider: 'Cantv Fibra ABA Ultra',
      speedMbps: 100,
    },
    rules: {
      allowsCouples: false,
      allowsPets: false,
      allowsStudents: true,
      allowsVisitors: false,
      hasIndependentKeys: true,
    },
    amenities: ['Cama individual', 'Uso de cocina y microondas', 'Nevera compartida', 'Gas directo', 'Lavadero'],
    verifiedDirectOwner: true,
    ownerName: 'Prof. Teresa Mendoza',
    ownerWhatsapp: '+584241234567',
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Habitación muy económica para estudiante activo de la UCV o USB. Ambiente sano, silencioso para estudiar. Solo 1 mes de depósito y contrato directo con la dueña.',
    publishedDate: 'Hace 3 días',
  },
  {
    id: 'zh-ccs-004',
    title: 'Apartamento Tipo Estudio con Vista a El Ávila',
    type: 'studio',
    typeLabel: 'Tipo Estudio',
    typeIcon: '🏢',
    priceMonthlyUsd: 280,
    depositMonths: 2,
    contractFeeUsd: 50,
    zone: 'La Castellana',
    city: 'Caracas',
    address: 'Av. Principal de La Castellana, frente a Plaza Isabel La Católica',
    latitude: 10.4980,
    longitude: -66.8570,
    nearestTransport: 'Metro Altamira • 7 min a pie',
    walkMinutesToTransport: 7,
    waterSystem: {
      hasTank: true,
      tankLitres: 5000,
      schedule: 'Pozo de agua profundo propio del edificio (100% agua continua)',
    },
    electricity: {
      hasGenerator: true,
      description: 'Planta eléctrica 100% para todo el apartamento y ascensores',
    },
    internet: {
      hasFiber: true,
      provider: 'Inter Fibra 500Mbps',
      speedMbps: 500,
    },
    rules: {
      allowsCouples: true,
      allowsPets: true,
      allowsStudents: false,
      allowsVisitors: true,
      hasIndependentKeys: true,
    },
    amenities: ['Pozo de agua propio', 'Planta 100%', 'Balcón con vista al Ávila', 'Cocina vitrocerámica', 'Vigilancia privada 24/7'],
    verifiedDirectOwner: true,
    ownerName: 'Dr. Alejandro Peña',
    ownerWhatsapp: '+584128887766',
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502005229762-ee15247a322c?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Monoambiente de lujo para profesional o pareja que trabaje en remoto. Pozo de agua y planta eléctrica que garantiza cero interrupciones de luz o agua.',
    publishedDate: 'Ayer',
  },

  // =========================================================================
  // CARACAS - CENTRO & OESTE
  // =========================================================================
  {
    id: 'zh-ccs-005',
    title: 'Anexo Céntrico con Entrada Independiente y Gas Directo',
    type: 'annex',
    typeLabel: 'Anexo Independiente',
    typeIcon: '🔑',
    priceMonthlyUsd: 140,
    depositMonths: 1,
    contractFeeUsd: 30,
    zone: 'La Candelaria',
    city: 'Caracas',
    address: 'Av. Urdaneta con esquina de Platanal',
    latitude: 10.5065,
    longitude: -66.9030,
    nearestTransport: 'Metro Bellas Artes / Parque Carabobo • 4 min a pie',
    walkMinutesToTransport: 4,
    waterSystem: {
      hasTank: true,
      tankLitres: 2000,
      schedule: 'Tanque aéreo con bomba automática',
    },
    electricity: {
      hasGenerator: false,
      description: 'Zona de ministerios y comercios con energía prioritaria',
    },
    internet: {
      hasFiber: true,
      provider: 'NetUno Fibra',
      speedMbps: 150,
    },
    rules: {
      allowsCouples: true,
      allowsPets: false,
      allowsStudents: true,
      allowsVisitors: true,
      hasIndependentKeys: true,
    },
    amenities: ['Gas directo', 'Baño privado', 'Área de lavamopas', 'Nevera', 'Cocina de 4 hornillas'],
    verifiedDirectOwner: true,
    ownerName: 'Sr. Giuseppe De Luca',
    ownerWhatsapp: '+584163334455',
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Anexo en edificio familiar tradicional de La Candelaria. Fácil acceso al centro de Caracas, camionetas a toda la ciudad y Metro a una cuadra.',
    publishedDate: 'Hace 4 días',
  },
  {
    id: 'zh-ccs-006',
    title: 'Habitación Grande para Dama o Estudiante de Medicina',
    type: 'room',
    typeLabel: 'Habitación para Dama',
    typeIcon: '👩',
    priceMonthlyUsd: 85,
    depositMonths: 1,
    contractFeeUsd: 25,
    zone: 'San Bernardino',
    city: 'Caracas',
    address: 'Av. Eraso, a 1 cuadra del Centro Médico de Caracas',
    latitude: 10.5140,
    longitude: -66.8960,
    nearestTransport: 'Camioneticas a Bellas Artes y Chacaíto en la puerta',
    walkMinutesToTransport: 2,
    waterSystem: {
      hasTank: true,
      tankLitres: 3000,
      schedule: 'Agua constante garantizada por sistema de almacenamiento',
    },
    electricity: {
      hasGenerator: false,
      description: 'Circuito eléctrico de clínicas de San Bernardino',
    },
    internet: {
      hasFiber: true,
      provider: 'SuperCable Fibra',
      speedMbps: 100,
    },
    rules: {
      allowsCouples: false,
      allowsPets: false,
      allowsStudents: true,
      allowsVisitors: false,
      hasIndependentKeys: true,
    },
    amenities: ['Cama matrimonial', 'Closet empotrado de pared a pared', 'Baño compartido con 1 sola persona', 'Nevera ejecutiva'],
    verifiedDirectOwner: true,
    ownerName: 'Lic. Beatriz Colmenares',
    ownerWhatsapp: '+584142223344',
    images: [
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Especialmente acondicionada para residente médica, enfermera o estudiante universitaria. Ambiente super tranquilo, limpio y seguro.',
    publishedDate: 'Hoy',
  },

  // =========================================================================
  // VALENCIA - CARABOBO
  // =========================================================================
  {
    id: 'zh-val-001',
    title: 'Anexo Universitario en Naguanagua cerca de Faces UC',
    type: 'annex',
    typeLabel: 'Anexo Universitario',
    typeIcon: '🎓',
    priceMonthlyUsd: 110,
    depositMonths: 1,
    contractFeeUsd: 30,
    zone: 'Naguanagua',
    city: 'Valencia',
    address: 'Urb. Tarapío, cerca de la Av. Universidad',
    latitude: 10.2520,
    longitude: -68.0120,
    nearestTransport: 'Parada de autobuses UC y transporte público a 100m',
    walkMinutesToTransport: 2,
    waterSystem: {
      hasTank: true,
      tankLitres: 3500,
      schedule: 'Tanque propio + bomba con presscontrol automático',
    },
    electricity: {
      hasGenerator: false,
      description: 'Sector residencial tranquilo con pocos cortes',
    },
    internet: {
      hasFiber: true,
      provider: 'Fibex Telecom 200Mbps',
      speedMbps: 200,
    },
    rules: {
      allowsCouples: true,
      allowsPets: false,
      allowsStudents: true,
      allowsVisitors: true,
      hasIndependentKeys: true,
    },
    amenities: ['Cocina a gas', 'Nevera', 'Entrada independiente por pasillo lateral', 'Lavadero techado', 'Wifi de alta velocidad'],
    verifiedDirectOwner: true,
    ownerName: 'Sr. Ramón Castillo',
    ownerWhatsapp: '+584127778899',
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Ideal para estudiantes de la Universidad de Carabobo (UC) o trabajadores de la zona industrial norte. Trato directo, no se piden meses de comisión.',
    publishedDate: 'Hace 1 día',
  },
  {
    id: 'zh-val-002',
    title: 'Habitación Ejecutiva en El Viñedo con Pozo de Agua',
    type: 'room',
    typeLabel: 'Habitación Ejecutiva',
    typeIcon: '⭐',
    priceMonthlyUsd: 130,
    depositMonths: 1,
    contractFeeUsd: 35,
    zone: 'El Viñedo',
    city: 'Valencia',
    address: 'Calle de los Cafés, a pocos metros de la Av. Bolívar Norte',
    latitude: 10.2150,
    longitude: -68.0050,
    nearestTransport: 'Av. Bolívar Norte con transporte continuo a 3 min',
    walkMinutesToTransport: 3,
    waterSystem: {
      hasTank: true,
      tankLitres: 10000,
      schedule: 'Pozo de agua profundo permanente (Agua 24/7)',
    },
    electricity: {
      hasGenerator: true,
      description: 'Planta para áreas comunes y puntos esenciales',
    },
    internet: {
      hasFiber: true,
      provider: 'NetUno Fibra Óptica 300Mbps',
      speedMbps: 300,
    },
    rules: {
      allowsCouples: false,
      allowsPets: false,
      allowsStudents: false,
      allowsVisitors: true,
      hasIndependentKeys: true,
    },
    amenities: ['Baño privado de lujo', 'Aire acondicionado', 'Pozo de agua', 'TV Smart', 'Vigilancia privada'],
    verifiedDirectOwner: true,
    ownerName: 'Abg. Claudia Soto',
    ownerWhatsapp: '+584146665544',
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'En la mejor zona comercial y gastronómica de Valencia. Seguridad total, pozo de agua y trato directo.',
    publishedDate: 'Hace 2 días',
  },

  // =========================================================================
  // MARACAIBO - ZULIA
  // =========================================================================
  {
    id: 'zh-mar-001',
    title: 'Anexo con Aire Acondicionado y Fibra Airtek en 5 de Julio',
    type: 'annex',
    typeLabel: 'Anexo Climatizado',
    typeIcon: '❄️',
    priceMonthlyUsd: 150,
    depositMonths: 1,
    contractFeeUsd: 30,
    zone: '5 de Julio',
    city: 'Maracaibo',
    address: 'Calle 72 con Av. 13A, sector Tierra Negra',
    latitude: 10.6650,
    longitude: -71.6180,
    nearestTransport: 'Carros por puesto de 5 de Julio y Bella Vista a 1 cuadra',
    walkMinutesToTransport: 2,
    waterSystem: {
      hasTank: true,
      tankLitres: 5000,
      schedule: 'Tanque subterráneo grande con bomba presurizadora',
    },
    electricity: {
      hasGenerator: true,
      description: 'Planta a gasolina para aire y luz de noche',
    },
    internet: {
      hasFiber: true,
      provider: 'Airtek Fibra Óptica 600Mbps',
      speedMbps: 600,
    },
    rules: {
      allowsCouples: true,
      allowsPets: true,
      allowsStudents: true,
      allowsVisitors: true,
      hasIndependentKeys: true,
    },
    amenities: ['Aire acondicionado 18000 BTU', 'Fibra Airtek ultrarrápida', 'Cocina con gas por tubería', 'Tanque grande', 'Estacionamiento techado'],
    verifiedDirectOwner: true,
    ownerName: 'Ing. Carlos Villalobos',
    ownerWhatsapp: '+584246112233',
    images: [
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Anexo totalmente acondicionado para el calor marabino. Aire acondicionado de alta potencia, internet Airtek ultra rápido y planta para dormir fresco.',
    publishedDate: 'Hoy',
  },

  // =========================================================================
  // MARACAY - ARAGUA
  // =========================================================================
  {
    id: 'zh-mcy-001',
    title: 'Habitación con Entrada Independiente en Las Delicias',
    type: 'room',
    typeLabel: 'Habitación en Quinta',
    typeIcon: '🌴',
    priceMonthlyUsd: 90,
    depositMonths: 1,
    contractFeeUsd: 25,
    zone: 'Las Delicias',
    city: 'Maracay',
    address: 'Av. Las Delicias, cerca del C.C. Las Américas',
    latitude: 10.2650,
    longitude: -67.5950,
    nearestTransport: 'Parada de Las Delicias a 100 metros',
    walkMinutesToTransport: 2,
    waterSystem: {
      hasTank: true,
      tankLitres: 3000,
      schedule: 'Agua constante con sistema hidroneumático',
    },
    electricity: {
      hasGenerator: false,
      description: 'Luz continua de zona norte de Maracay',
    },
    internet: {
      hasFiber: true,
      provider: 'Thundernet Fibra 200Mbps',
      speedMbps: 200,
    },
    rules: {
      allowsCouples: false,
      allowsPets: false,
      allowsStudents: true,
      allowsVisitors: true,
      hasIndependentKeys: true,
    },
    amenities: ['Cama queen', 'Aire acondicionado split', 'Closet de madera', 'Baño privado', 'Cámaras de seguridad en entrada'],
    verifiedDirectOwner: true,
    ownerName: 'Dra. Miriam Blanco',
    ownerWhatsapp: '+584144556677',
    images: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Excelente ubicación en el norte de Maracay. A pie del C.C. Las Américas, supermercados y farmacias.',
    publishedDate: 'Hace 2 días',
  },

  // =========================================================================
  // BARQUISIMETO - LARA
  // =========================================================================
  {
    id: 'zh-bqt-001',
    title: 'Anexo Tipo Estudio en Nueva Segovia con Tanque y Fibra',
    type: 'studio',
    typeLabel: 'Tipo Estudio',
    typeIcon: '🎸',
    priceMonthlyUsd: 130,
    depositMonths: 1,
    contractFeeUsd: 30,
    zone: 'Nueva Segovia',
    city: 'Barquisimeto',
    address: 'Carrera 1 con Calle 6, sector Este',
    latitude: 10.0580,
    longitude: -69.2920,
    nearestTransport: 'Av. Lara con transporte a toda la ciudad a 3 min a pie',
    walkMinutesToTransport: 3,
    waterSystem: {
      hasTank: true,
      tankLitres: 4000,
      schedule: 'Tanque subterráneo de gran capacidad, agua garantizada',
    },
    electricity: {
      hasGenerator: false,
      description: 'Zona este de Barquisimeto de alta prioridad',
    },
    internet: {
      hasFiber: true,
      provider: 'Fibex Telecom 250Mbps',
      speedMbps: 250,
    },
    rules: {
      allowsCouples: true,
      allowsPets: false,
      allowsStudents: true,
      allowsVisitors: true,
      hasIndependentKeys: true,
    },
    amenities: ['Cocina empotrada', 'Tanque de 4000L', 'Fibra óptica', 'Portón eléctrico', 'Lavadero propio'],
    verifiedDirectOwner: true,
    ownerName: 'Ing. Gustavo Alvarado',
    ownerWhatsapp: '+584129991122',
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Hermoso anexo en el este de Barquisimeto. Cercano a la Av. Lara, centros comerciales y clínicas.',
    publishedDate: 'Hoy',
  },
];
