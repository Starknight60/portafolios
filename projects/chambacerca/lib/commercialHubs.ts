// lib/commercialHubs.ts - Principales Hubs y Polos Comerciales de Empleo en Venezuela

export interface CommercialHub {
  id: string;
  name: string;
  cityName: string;
  description: string;
  icon: string;
  lat: number;
  lng: number;
  badge: string;
}

export const COMMERCIAL_HUBS: CommercialHub[] = [
  // Caracas
  {
    id: 'caracas-sabanagrande',
    name: 'Sabana Grande / Chacaíto',
    cityName: 'Caracas',
    description: 'Boulevard comercial más transitado de Caracas: zapaterías, ropa, comida rápida y cadenas.',
    icon: '🛍️',
    lat: 10.4912,
    lng: -66.8728,
    badge: 'Comercio Masivo',
  },
  {
    id: 'caracas-chacao',
    name: 'Chacao / San Ignacio',
    cityName: 'Caracas',
    description: 'Polo financiero, restaurantes, bancos, tecnología y centros comerciales.',
    icon: '🏬',
    lat: 10.4950,
    lng: -66.8530,
    badge: 'Financiero & Retail',
  },
  {
    id: 'caracas-lasmercedes',
    name: 'Las Mercedes / Tolón',
    cityName: 'Caracas',
    description: 'Distrito gastronómico, automotriz, bodegones, hoteles y tiendas boutique.',
    icon: '🍽️',
    lat: 10.4800,
    lng: -66.8600,
    badge: 'Gastronomía & Lujo',
  },
  {
    id: 'caracas-candelaria',
    name: 'La Candelaria / Sambil',
    cityName: 'Caracas',
    description: 'Eje céntrico de alto flujo con el nuevo Sambil La Candelaria y comercios de tradición.',
    icon: '🏢',
    lat: 10.5050,
    lng: -66.9060,
    badge: 'Alto Tráfico',
  },
  {
    id: 'caracas-boleita',
    name: 'Boleíta / Los Cortijos',
    cityName: 'Caracas',
    description: 'Zona de almacenes, distribuidoras, laboratorios, mayoreo y empresas de logística.',
    icon: '📦',
    lat: 10.4980,
    lng: -66.8250,
    badge: 'Almacén & Logística',
  },
  {
    id: 'caracas-catia',
    name: 'Catia / Pérez Bonalde',
    cityName: 'Caracas',
    description: 'Gran eje comercial del oeste caraqueño: abastos, mercados y tiendas de víveres.',
    icon: '🛒',
    lat: 10.5180,
    lng: -66.9400,
    badge: 'Mercados & Víveres',
  },

  // Valencia
  {
    id: 'valencia-vinedo',
    name: 'El Viñedo / Sambil Valencia',
    cityName: 'Valencia',
    description: 'Polo comercial y corporativo del norte de Valencia.',
    icon: '🏬',
    lat: 10.2180,
    lng: -67.9950,
    badge: 'Comercial Norte',
  },
  {
    id: 'valencia-centro',
    name: 'Centro de Valencia / Av. Bolívar',
    cityName: 'Valencia',
    description: 'Corredor comercial tradicional de tiendas, zapaterías y telas.',
    icon: '🛍️',
    lat: 10.1800,
    lng: -68.0030,
    badge: 'Mayoristas',
  },

  // Maracaibo
  {
    id: 'maracaibo-5dejulio',
    name: '5 de Julio / Bella Vista',
    cityName: 'Maracaibo',
    description: 'Avenida bancaria y comercial principal de la capital zuliana.',
    icon: '🏢',
    lat: 10.6650,
    lng: -71.6150,
    badge: 'Bancos & Tiendas',
  },
  {
    id: 'maracaibo-sambil',
    name: 'Sambil Maracaibo / Milagro Norte',
    cityName: 'Maracaibo',
    description: 'Centro comercial con alta concentración de franquicias y tiendas por departamento.',
    icon: '🏬',
    lat: 10.7100,
    lng: -71.6250,
    badge: 'Franquicias',
  },

  // Barquisimeto
  {
    id: 'barquisimeto-av20',
    name: 'Avenida 20 / Centro',
    cityName: 'Barquisimeto',
    description: 'El mayor paseo comercial peatonal del estado Lara.',
    icon: '🛍️',
    lat: 10.0680,
    lng: -69.3250,
    badge: 'Paseo Peatonal',
  },
  {
    id: 'barquisimeto-este',
    name: 'Sambil Barquisimeto / Este',
    cityName: 'Barquisimeto',
    description: 'Centro neurálgico del este crepuscular: cines, moda y gastronomía.',
    icon: '🍽️',
    lat: 10.0650,
    lng: -69.2880,
    badge: 'Comercial Este',
  },

  // Maracay
  {
    id: 'maracay-delicias',
    name: 'Las Delicias / Parque Aragua',
    cityName: 'Maracay',
    description: 'Corredor gastronómico, farmacias y centros comerciales de Aragua.',
    icon: '🏬',
    lat: 10.2500,
    lng: -67.5950,
    badge: 'Eje Principal',
  },
];
