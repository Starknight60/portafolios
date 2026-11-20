// Almacenamiento local persistente y Bóveda Criptográfica de Tokens Offline para el Metro

export interface TransitCard {
  id: string; // ej: SUVE-CCS-8942-0192
  holderName: string;
  idNumber: string; // C.I.
  balanceBs: number;
  tripsAvailable: number;
  cardType: 'STANDARD' | 'STUDENT' | 'SENIOR';
  nfcEnabled: boolean;
  virtualPan: string; // Número de tarjeta visible **** 4819
  createdAt: string;
}

export interface TransitTripLog {
  id: string;
  stationName: string;
  lineId: string;
  timestamp: string;
  fareChargedBs: number;
  remainingTrips: number;
  method: 'NFC_APPLE_PAY' | 'QR_DYNAMIC_OFFLINE' | 'EMULATOR_TAP';
  turnstileNumber: string;
}

const STORAGE_KEY_CARD = 'metropay_card_v1';
const STORAGE_KEY_TRIPS = 'metropay_trips_log_v1';

export const DEFAULT_TRANSIT_CARD: TransitCard = {
  id: 'SUVE-CCS-7841-9210',
  holderName: 'David Briceño',
  idNumber: '28.450.192',
  balanceBs: 75.00, // 5 viajes de bienvenida
  tripsAvailable: 5,
  cardType: 'STANDARD',
  nfcEnabled: true,
  virtualPan: '4892 •••• •••• 0192',
  createdAt: new Date().toISOString(),
};

export function getSavedCard(): TransitCard {
  if (typeof window === 'undefined') return DEFAULT_TRANSIT_CARD;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CARD);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_TRANSIT_CARD, ...parsed };
    }
  } catch {}
  return DEFAULT_TRANSIT_CARD;
}

export function saveCard(card: TransitCard) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CARD, JSON.stringify(card));
  } catch {}
}

export function getSavedTrips(): TransitTripLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRIPS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'trip-init-1',
      stationName: 'Plaza Venezuela',
      lineId: 'L1',
      timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
      fareChargedBs: 15.00,
      remainingTrips: 5,
      method: 'NFC_APPLE_PAY',
      turnstileNumber: 'T-04',
    },
    {
      id: 'trip-init-2',
      stationName: 'Chacao',
      lineId: 'L1',
      timestamp: new Date(Date.now() - 3600000 * 26).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
      fareChargedBs: 15.00,
      remainingTrips: 6,
      method: 'NFC_APPLE_PAY',
      turnstileNumber: 'T-02',
    },
  ];
}

export function addTripLog(log: TransitTripLog) {
  if (typeof window === 'undefined') return;
  try {
    const trips = getSavedTrips();
    const updated = [log, ...trips].slice(0, 50); // Últimos 50 viajes
    localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(updated));
  } catch {}
}

// Bóveda de tokens dinámicos anti-captura (cambia cada 15s con semilla criptográfica)
export function generateTransitToken(cardId: string): { token: string; secondsRemaining: number } {
  const now = Math.floor(Date.now() / 1000);
  const timeStep = 15; // 15 segundos de validez
  const currentWindow = Math.floor(now / timeStep);
  const secondsRemaining = timeStep - (now % timeStep);

  // Semilla criptográfica ficticia pero determinista
  const hash = Math.abs(Math.sin(currentWindow * 9999 + cardId.length) * 1000000).toFixed(0).padStart(6, '0');
  const token = `METRO-CCS|${cardId}|${currentWindow}|${hash}|OFFLINE_OK`;

  return { token, secondsRemaining };
}
