export interface VenezuelaCity {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  description: string;
}

export const VENEZUELA_CITIES: VenezuelaCity[] = [
  {
    id: 'caracas',
    name: 'Caracas (Chacao / Altamira / Sucre)',
    state: 'Distrito Capital / Miranda',
    lat: 10.4960,
    lng: -66.8520,
    description: 'Eje Chacao, Altamira, Los Palos Grandes, Sabana Grande y Sucre',
  },
  {
    id: 'valencia',
    name: 'Valencia (Naguanagua / San Diego)',
    state: 'Carabobo',
    lat: 10.1960,
    lng: -68.0050,
    description: 'Zona comercial norte, El Viñedo, Av. Bolívar, Naguanagua y San Diego',
  },
  {
    id: 'maracaibo',
    name: 'Maracaibo (Bella Vista / 5 de Julio)',
    state: 'Zulia',
    lat: 10.6650,
    lng: -71.6250,
    description: 'Eje Bella Vista, Calle 72, Delicias, 5 de Julio y San Francisco',
  },
  {
    id: 'barquisimeto',
    name: 'Barquisimeto (Este / Cabudare)',
    state: 'Lara',
    lat: 10.0678,
    lng: -69.3474,
    description: 'Zona Este, Av. Lara, Av. 20, Los Leones y Cabudare',
  },
  {
    id: 'maracay',
    name: 'Maracay (Las Delicias / Centro)',
    state: 'Aragua',
    lat: 10.2469,
    lng: -67.5958,
    description: 'Av. Las Delicias, Centro, Av. Bolívar y El Limón',
  },
  {
    id: 'anzoategui',
    name: 'Lechería / Pto La Cruz / Barcelona',
    state: 'Anzoátegui',
    lat: 10.1980,
    lng: -64.6920,
    description: 'Plaza Mayor, Av. Principal de Lechería, Paseo Colón y Barcelona',
  },
  {
    id: 'puerto_ordaz',
    name: 'Puerto Ordaz / San Félix',
    state: 'Bolívar',
    lat: 8.3000,
    lng: -62.7167,
    description: 'Alta Vista, Paseo Caroní, Unare y San Félix',
  },
  {
    id: 'san_cristobal',
    name: 'San Cristóbal (Pueblo Nuevo)',
    state: 'Táchira',
    lat: 7.7669,
    lng: -72.2250,
    description: 'Pueblo Nuevo, Av. 19 de Abril, Las Lomas y Centro',
  },
  {
    id: 'margarita',
    name: 'Margarita (Porlamar / Pampatar)',
    state: 'Nueva Esparta',
    lat: 10.9577,
    lng: -63.8697,
    description: 'Av. 4 de Mayo, Av. Santiago Mariño, Pampatar y Playa El Ángel',
  },
  {
    id: 'merida',
    name: 'Mérida (Las Américas / Centro)',
    state: 'Mérida',
    lat: 8.5983,
    lng: -71.1450,
    description: 'Av. Las Américas, Viaducto Campo Elías y Los Próceres',
  },
  {
    id: 'maturin',
    name: 'Maturín (Tipuro / Juanico)',
    state: 'Monagas',
    lat: 9.7460,
    lng: -63.1830,
    description: 'Zona Norte, Tipuro, Av. Alirio Ugarte Pelayo y Juanico',
  },
];
