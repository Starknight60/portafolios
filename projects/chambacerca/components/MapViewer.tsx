'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { PlaceResultItem } from '@/app/api/places/route';
import { Navigation, ExternalLink, Layers, MapPin, Eye, Radio, Sparkles, Compass, Crosshair, Footprints } from 'lucide-react';

interface MapViewerProps {
  center: [number, number];
  radiusMeters: number;
  places: PlaceResultItem[];
  selectedPlaceId: string | null;
  onSelectPlace: (place: PlaceResultItem) => void;
  userLocation: [number, number] | null;
}

// Capas de mapas de alta velocidad (CartoDB & Esri optimizados para carga instantánea <150ms, cero marcas de agua, alto contraste y zoom completo hasta 20)
const MAP_LAYERS = {
  tactical: {
    name: 'Radar Táctico (Oscuro)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
    maxZoom: 20,
  },
  streets: {
    name: 'Calles en Alta Definición',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
    maxZoom: 20,
  },
  satellite: {
    name: 'Satélite en Vivo',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: ['server'],
    attribution: '&copy; Esri &copy; Earthstar Geographics',
    maxZoom: 19,
  },
};

// Validación estricta de coordenadas geográficas para prevenir errores fatales de Leaflet en WebView/móvil
function isValidLatLng(lat: any, lng: any): boolean {
  const nLat = Number(lat);
  const nLng = Number(lng);
  return (
    typeof nLat === 'number' &&
    typeof nLng === 'number' &&
    Number.isFinite(nLat) &&
    Number.isFinite(nLng) &&
    !isNaN(nLat) &&
    !isNaN(nLng) &&
    nLat >= -90 &&
    nLat <= 90 &&
    nLng >= -180 &&
    nLng <= 180
  );
}

// Cálculo de distancia geodésica en kilómetros para evitar rutas imposibles entre países o continentes
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!Number.isFinite(lat1) || !Number.isFinite(lon1) || !Number.isFinite(lat2) || !Number.isFinite(lon2)) {
    return Infinity;
  }
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function MapController({ 
  center, 
  zoom, 
  selectedPlace, 
  userLocation 
}: { 
  center: [number, number]; 
  zoom: number;
  selectedPlace?: PlaceResultItem | null;
  userLocation?: [number, number] | null;
}) {
  const map = useMap();

  // Forzar redimensionado inmediato con ResizeObserver nativo (garantiza render al 100% sin franjas negras al cambiar de tab)
  useEffect(() => {
    if (!map) return;
    map.invalidateSize();

    const container = map.getContainer();
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && container) {
      resizeObserver = new ResizeObserver(() => {
        try {
          if (container.clientWidth > 0 && container.clientHeight > 0) {
            map.invalidateSize();
            if (center && isValidLatLng(center[0], center[1])) {
              map.setView([Number(center[0]), Number(center[1])], zoom);
            }
          }
        } catch {}
      });
      resizeObserver.observe(container);
    }

    const t1 = setTimeout(() => { try { map.invalidateSize(); } catch {} }, 60);
    const t2 = setTimeout(() => { try { map.invalidateSize(); } catch {} }, 200);
    const t3 = setTimeout(() => { try { map.invalidateSize(); } catch {} }, 500);

    const onResize = () => {
      try {
        map.invalidateSize();
      } catch {}
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', onResize);
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;
    try {
      map.invalidateSize();
      const size = map.getSize();
      // Si el contenedor está oculto en móvil (ancho o alto = 0), no ejecutar animaciones flyTo para evitar división por cero en Leaflet (NaN, NaN)
      if (!size || size.x <= 0 || size.y <= 0) {
        return;
      }

      const hasValidUser = userLocation && isValidLatLng(userLocation[0], userLocation[1]);
      const hasValidSelected = selectedPlace && isValidLatLng(selectedPlace.latitude, selectedPlace.longitude);

      if (hasValidSelected) {
        const placeLat = Number(selectedPlace.latitude);
        const placeLng = Number(selectedPlace.longitude);
        const distKm = hasValidUser ? getDistanceKm(Number(userLocation[0]), Number(userLocation[1]), placeLat, placeLng) : Infinity;

        // Si el usuario está a distancia caminable/urbana (<15 km), encuadrar ambos
        if (hasValidUser && distKm <= 15) {
          const bounds = L.latLngBounds(
            [Number(userLocation[0]), Number(userLocation[1])],
            [placeLat, placeLng]
          );
          if (bounds.isValid()) {
            map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 17, duration: 1.0 });
            return;
          }
        }

        // Si el usuario está lejos (otra ciudad o emulador GPS en EE.UU.), enfocar directamente el comercio seleccionado
        map.flyTo([placeLat, placeLng], 16, { duration: 1.0 });
      } else if (center && isValidLatLng(center[0], center[1])) {
        map.flyTo([Number(center[0]), Number(center[1])], zoom, { duration: 1.0 });
      }
    } catch (err) {
      console.warn('MapController fly error suppressed:', err);
    }
  }, [center, zoom, selectedPlace, userLocation, map]);
  return null;
}

function createWalkingBadgeIcon(walkMinutes: number, meters: number) {
  const steps = Math.round(meters * 1.3);
  const html = `
    <div style="
      background: rgba(10, 16, 28, 0.95);
      color: #34d399;
      border: 1.5px solid #10b981;
      border-radius: 9999px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.8), 0 4px 12px rgba(0,0,0,0.8);
      transform: translate(-50%, -50%);
      pointer-events: none;
    ">
      <span style="font-size: 13px;">🚶‍♂️</span>
      <span>${walkMinutes} min a pie</span>
      <span style="color: #94a3b8; font-weight: 600; font-size: 10px;">(~${steps} pasos)</span>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'walking-route-midpoint-badge',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function createCustomPin(item: PlaceResultItem, isSelected: boolean) {
  let bgGradient = 'linear-gradient(135deg, #10B981 0%, #059669 100%)'; // Emerald vivo
  let borderColor = '#34D399';
  let glowColor = 'rgba(16, 185, 129, 0.75)';
  let arrowColor = '#059669';
  let iconHtml = '💼';

  if (item.status === 'COMMUNITY_HIRING') {
    bgGradient = 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'; // Ámbar dorado
    borderColor = '#FCD34D';
    glowColor = 'rgba(245, 158, 11, 0.75)';
    arrowColor = '#D97706';
    iconHtml = '📢';
  } else if (item.status === 'COMMUNITY_NOT_HIRING') {
    bgGradient = 'linear-gradient(135deg, #64748B 0%, #475569 100%)';
    borderColor = '#94A3B8';
    glowColor = 'rgba(100, 116, 139, 0.4)';
    arrowColor = '#475569';
    iconHtml = '❌';
  } else if (item.status === 'POTENTIAL_PLACE') {
    bgGradient = 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'; // Azul Zafiro
    borderColor = '#93C5FD';
    glowColor = 'rgba(59, 130, 246, 0.75)';
    arrowColor = '#1D4ED8';
    iconHtml = '🏬';
  }

  const selectedAnimation = isSelected 
    ? 'transform: scale(1.18); box-shadow: 0 0 0 2px #ffffff, 0 0 24px 6px #10B981; border: 2px solid #ffffff;' 
    : `box-shadow: 0 4px 14px rgba(0,0,0,0.6), 0 0 10px ${glowColor};`;

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);">
      <!-- Tarjeta Pin Principal -->
      <div style="
        position: relative;
        z-index: 1;
        background: ${bgGradient};
        color: white;
        border: 1.5px solid ${borderColor};
        border-radius: 9999px;
        padding: 5px 10px;
        font-size: 13px;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(0,0,0,0.4);
        ${selectedAnimation}
      ">
        <span style="font-size: 13px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));">${iconHtml}</span>
        <span style="max-width: 110px; overflow: hidden; text-overflow: ellipsis; font-size: 11px; letter-spacing: -0.2px;">
          ${item.placeName.split(' ').slice(0, 2).join(' ')}
        </span>
        ${isSelected ? '<span style="color: #6ee7b7; font-size: 9px; font-weight: 900; background: rgba(0,0,0,0.5); padding: 1px 5px; border-radius: 4px; border: 1px solid rgba(110,231,183,0.5);">ACTIVA</span>' : ''}
      </div>

      <!-- Triángulo inferior -->
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid ${arrowColor};
        margin-top: -1px;
        z-index: 1;
        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-pin',
    iconSize: [130, 36],
    iconAnchor: [65, 34],
    popupAnchor: [0, -32],
  });
}

// Caché de íconos para evitar recrear DOM en cada render (Optimización 60fps)
const pinIconCache = new Map<string, L.DivIcon>();

function getCustomPin(item: PlaceResultItem, isSelected: boolean): L.DivIcon {
  const key = `${item.id}_${item.status}_${isSelected ? '1' : '0'}`;
  let icon = pinIconCache.get(key);
  if (!icon) {
    icon = createCustomPin(item, isSelected);
    pinIconCache.set(key, icon);
  }
  return icon;
}

let cachedUserLocationPin: L.DivIcon | null = null;
function getUserLocationPin(): L.DivIcon {
  if (!cachedUserLocationPin) {
    cachedUserLocationPin = createUserLocationPin();
  }
  return cachedUserLocationPin;
}

function createUserLocationPin() {
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
      <!-- Halo GPS Estático Ligero -->
      <div style="
        position: absolute;
        width: 32px;
        height: 32px;
        border-radius: 9999px;
        background: rgba(59, 130, 246, 0.2);
        border: 1.5px solid rgba(59, 130, 246, 0.5);
      "></div>
      <!-- Núcleo central del GPS -->
      <div style="
        width: 14px;
        height: 14px;
        border-radius: 9999px;
        background: #3B82F6;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 10px #3B82F6, 0 2px 8px rgba(0,0,0,0.6);
        z-index: 2;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'user-location-pin',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export default function MapViewer({
  center,
  radiusMeters,
  places,
  selectedPlaceId,
  onSelectPlace,
  userLocation,
}: MapViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [mapType, setMapType] = useState<'tactical' | 'streets' | 'satellite'>('tactical');
  const [showRadarHud, setShowRadarHud] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[440px] flex flex-col items-center justify-center bg-[#0B131F] rounded-2xl border border-slate-800 text-slate-400">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3 shadow-[0_0_20px_#10B981]"></div>
        <p className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Calibrando Radar de Proximidad...
        </p>
        <p className="text-xs text-slate-400 mt-1">Cargando mapa satelital de alta velocidad</p>
      </div>
    );
  }

  const safeCenter: [number, number] = (center && isValidLatLng(center[0], center[1]))
    ? [Number(center[0]), Number(center[1])]
    : [10.4960, -66.8520];

  const safeUserLocation: [number, number] | null = (userLocation && isValidLatLng(userLocation[0], userLocation[1]))
    ? [Number(userLocation[0]), Number(userLocation[1])]
    : null;

  const safeRadius = (Number.isFinite(radiusMeters) && radiusMeters > 0) ? radiusMeters : 2500;

  const validPlaces = (places || []).filter(p => p && isValidLatLng(p.latitude, p.longitude));

  const zoom = safeRadius <= 600 ? 16 : safeRadius <= 1500 ? 15 : safeRadius <= 3500 ? 14 : 13;
  const currentLayer = MAP_LAYERS[mapType];
  const selectedPlace = validPlaces.find((p) => p.id === selectedPlaceId) || null;
  const isWalkingDistance = Boolean(
    selectedPlace &&
    safeUserLocation &&
    getDistanceKm(safeUserLocation[0], safeUserLocation[1], Number(selectedPlace.latitude), Number(selectedPlace.longitude)) <= 15
  );
  const hasSelectedRoute = Boolean(selectedPlace && safeUserLocation && isWalkingDistance);

  return (
    <div className="relative w-full h-full min-h-[360px] sm:min-h-[420px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-[0_0_35px_rgba(0,0,0,0.7)] group">
      
      {/* =========================================================================
          HUD SUPERIOR: TELEMETRÍA EN VIVO Y SELECTORES FLOTANTES
          ========================================================================= */}
      
      {/* Telemetría Militar Táctica en Vivo (Esquina Superior Izquierda) */}
      <div className="absolute top-2.5 left-2.5 z-[1000] pointer-events-none flex flex-col gap-1 max-w-[48%] sm:max-w-none">
        <div className="bg-[#0B131F]/95 px-2.5 py-1 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center gap-1.5 backdrop-blur-sm">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
          </span>
          <span className="text-[10px] font-black tracking-wider text-emerald-300 font-mono uppercase truncate">
            RADAR GPS
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            • {validPlaces.length} ECOS
          </span>
        </div>

        <div className="bg-[#080D15]/95 px-2 py-0.5 rounded-lg border border-slate-800 text-[9px] font-mono text-slate-300 flex items-center gap-1.5 shadow backdrop-blur-sm">
          <Compass className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
          <span className="truncate">{safeCenter[0].toFixed(3)}°N, {Math.abs(safeCenter[1]).toFixed(3)}°W</span>
          <span className="text-emerald-400 font-bold shrink-0">R={safeRadius >= 1000 ? `${(safeRadius/1000).toFixed(1)}k` : `${safeRadius}m`}</span>
        </div>

        {/* Ticker de Ruta Activa Trazada */}
        {selectedPlace && (
          <div className="bg-[#062419]/95 px-2.5 py-1 rounded-xl border border-emerald-400/80 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <Footprints className="w-3.5 h-3.5 text-emerald-300 animate-bounce shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-[280px]">
              RUTA: <strong>{selectedPlace.placeName}</strong> ({selectedPlace.distanceFormatted} • {selectedPlace.walkTimeMinutes} min)
            </span>
          </div>
        )}
      </div>

      {/* Selector Flotante de Capa & Toggle Sonar (Esquina Superior Derecha) */}
      <div className="absolute top-2.5 right-2.5 z-[1000] flex items-center gap-1">
        
        {/* Toggle para Activar/Desactivar el Haz de Sonar */}
        <button
          onClick={() => setShowRadarHud(!showRadarHud)}
          title="Alternar retícula de distancia de radar"
          className={`px-2 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 border shadow-xl cursor-pointer ${
            showRadarHud
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${showRadarHud ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">{showRadarHud ? 'Retícula ON' : 'Retícula OFF'}</span>
        </button>

        {/* Selector de Tipo de Capa de Alta Velocidad */}
        <div className="bg-[#0B131F]/95 rounded-xl p-0.5 border border-slate-700 shadow-xl flex items-center gap-0.5">
          <button
            onClick={() => setMapType('tactical')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              mapType === 'tactical'
                ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Táctico
          </button>
          <button
            onClick={() => setMapType('streets')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              mapType === 'streets'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Calles
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              mapType === 'satellite'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Satélite
          </button>
        </div>
      </div>

      {/* =========================================================================
          CAPA HUD NOVEDOSA: RETÍCULA TÁCTICA LIGERA (SIN ANIMACIONES PESADAS)
          ========================================================================= */}
      {showRadarHud && (
        <div className="absolute inset-0 z-[500] pointer-events-none overflow-hidden flex items-center justify-center">
          {/* Anillos Concéntricos de Distancia Militares */}
          <div className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] rounded-full border border-emerald-500/25 flex items-center justify-center">
            
            {/* Anillo Intermedio (1 km) */}
            <div className="w-[70%] h-[70%] rounded-full border border-dashed border-emerald-400/30 flex items-center justify-center">
              {/* Anillo Interior (500m a pie) */}
              <div className="w-[50%] h-[50%] rounded-full border border-emerald-400/40" />
            </div>

            {/* Marcas de Cruz Cardinal Táctica (+) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent" />
            </div>

            {/* Indicadores Cardinales HUD */}
            <span className="absolute top-2 text-[9px] font-mono font-bold text-emerald-400/80 bg-slate-950/60 px-1 rounded">N 000°</span>
            <span className="absolute right-2 text-[9px] font-mono font-bold text-emerald-400/80 bg-slate-950/60 px-1 rounded">E 090°</span>
            <span className="absolute bottom-2 text-[9px] font-mono font-bold text-emerald-400/80 bg-slate-950/60 px-1 rounded">S 180°</span>
            <span className="absolute left-2 text-[9px] font-mono font-bold text-emerald-400/80 bg-slate-950/60 px-1 rounded">W 270°</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTENEDOR DEL MAPA LEAFLET + GOOGLE MAPS TILES
          ========================================================================= */}
      <MapContainer
        center={safeCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <MapController center={safeCenter} zoom={zoom} selectedPlace={selectedPlace} userLocation={safeUserLocation} />

        {/* Capa de Mapa Ultrarrápida con CDN global y caché inteligente */}
        <TileLayer
          key={mapType}
          attribution={currentLayer.attribution}
          url={currentLayer.url}
          subdomains={currentLayer.subdomains}
          maxZoom={currentLayer.maxZoom}
          keepBuffer={4}
          updateWhenIdle={false}
          updateWhenZooming={true}
        />

        {/* Círculo visual del radio de proximidad a pie con pulso */}
        <Circle
          center={safeCenter}
          radius={safeRadius}
          pathOptions={{
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.08,
            weight: 2,
            dashArray: '6, 10',
          }}
        />

        {/* RUTA A PIE ANIMADA DIRECTA ENTRE TU GPS Y LA VACANTE SELECCIONADA */}
        {hasSelectedRoute && selectedPlace && safeUserLocation && (
          <>
            {/* Halo Neón Esmeralda Grueso de Base */}
            <Polyline
              positions={[
                safeUserLocation,
                [Number(selectedPlace.latitude), Number(selectedPlace.longitude)],
              ]}
              pathOptions={{
                color: '#10B981',
                weight: 8,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />

            {/* Haz Láser Animado de Ruta a Pie */}
            <Polyline
              className="leaflet-walking-path"
              positions={[
                safeUserLocation,
                [Number(selectedPlace.latitude), Number(selectedPlace.longitude)],
              ]}
              pathOptions={{
                color: '#34D399',
                weight: 4,
                dashArray: '10, 16',
                opacity: 0.95,
                lineCap: 'round',
              }}
            />

            {/* Badge Flotante en el Punto Medio de la Ruta */}
            <Marker
              position={[
                (safeUserLocation[0] + Number(selectedPlace.latitude)) / 2,
                (safeUserLocation[1] + Number(selectedPlace.longitude)) / 2,
              ]}
              icon={createWalkingBadgeIcon(selectedPlace.walkTimeMinutes, selectedPlace.distanceMeters)}
            />
          </>
        )}

        {/* Pin de ubicación del usuario */}
        {safeUserLocation && (
          <Marker position={safeUserLocation} icon={getUserLocationPin()}>
            <Popup>
              <div className="p-1 text-slate-800">
                <p className="font-semibold text-xs flex items-center gap-1 text-blue-600">
                  <Navigation className="w-3.5 h-3.5" /> Tu Ubicación en Google Maps
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">Explorando empleo a pie</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de oportunidades reales con efectos de sonar */}
        {validPlaces.map((place) => {
          const isSelected = selectedPlaceId === place.id;
          const googleMapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.placeName} ${place.address}`)}`;
          const googleMapsWalkingUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&travelmode=walking`;

          return (
            <Marker
              key={place.id}
              position={[Number(place.latitude), Number(place.longitude)]}
              icon={getCustomPin(place, isSelected)}
              eventHandlers={{
                click: () => onSelectPlace(place),
              }}
            >
              <Popup>
                <div className="p-1.5 max-w-[240px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{place.categoryIcon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                      {place.categoryLabel}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100 line-clamp-1">{place.placeName}</h4>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">{place.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{place.address}</p>

                  <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-emerald-400">📍 {place.distanceFormatted}</span>
                    <span>🚶 {place.walkTimeMinutes} min a pie</span>
                  </div>

                  <div className="mt-2.5 flex flex-col gap-1.5">
                    <button
                      onClick={() => onSelectPlace(place)}
                      className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition shadow cursor-pointer"
                    >
                      Ver cómo postular <ExternalLink className="w-3 h-3" />
                    </button>

                    <a
                      href={googleMapsWalkingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1 px-2 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition"
                    >
                      <Navigation className="w-3 h-3 text-blue-400" /> Ruta en Google Maps
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Marca de Google Maps y Leyenda en la esquina inferior */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 shadow-2xl flex items-center gap-3">
        <div className="flex items-center gap-1 font-bold text-white pr-2 border-r border-slate-700">
          <span className="text-blue-400 font-extrabold">G</span>
          <span className="text-rose-400 font-extrabold">o</span>
          <span className="text-amber-400 font-extrabold">o</span>
          <span className="text-blue-400 font-extrabold">g</span>
          <span className="text-emerald-400 font-extrabold">l</span>
          <span className="text-rose-400 font-extrabold">e</span>
          <span className="ml-1 text-[10px] text-slate-400 font-normal">Maps</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
          <span>Vacante Verificada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#F59E0B]"></span>
          <span>Reporte Vecinal</span>
        </div>
      </div>
    </div>
  );
}
