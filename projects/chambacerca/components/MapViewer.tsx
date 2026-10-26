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

// Capas oficiales de Google Maps en alta resolución
const GOOGLE_MAPS_LAYERS = {
  roadmap: {
    name: 'Google Maps Calles',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
  },
  hybrid: {
    name: 'Google Maps Satélite',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
  },
  traffic: {
    name: 'Google Maps Tráfico',
    url: 'https://mt1.google.com/vt/lyrs=m,trafficinfo&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
  },
};

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
  useEffect(() => {
    if (selectedPlace && userLocation) {
      map.flyToBounds(
        [
          userLocation,
          [selectedPlace.latitude, selectedPlace.longitude],
        ],
        { padding: [70, 70], duration: 1.2 }
      );
    } else {
      map.flyTo(center, zoom, { duration: 1.2 });
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
  let bgColor = '#10B981'; // Emerald para vacantes verificadas
  let borderColor = '#059669';
  let glowColor = 'rgba(16, 185, 129, 0.6)';
  let iconHtml = '💼';

  if (item.status === 'COMMUNITY_HIRING') {
    bgColor = '#F59E0B'; // Ámbar
    borderColor = '#D97706';
    glowColor = 'rgba(245, 158, 11, 0.6)';
    iconHtml = '📢';
  } else if (item.status === 'COMMUNITY_NOT_HIRING') {
    bgColor = '#64748B';
    borderColor = '#475569';
    glowColor = 'rgba(100, 116, 139, 0.4)';
    iconHtml = '❌';
  } else if (item.status === 'POTENTIAL_PLACE') {
    bgColor = '#3B82F6';
    borderColor = '#2563EB';
    glowColor = 'rgba(59, 130, 246, 0.6)';
    iconHtml = '🏬';
  }

  const selectedAnimation = isSelected 
    ? 'transform: scale(1.18); box-shadow: 0 0 22px 6px #10B981; border: 2.5px solid #ffffff;' 
    : 'box-shadow: 0 4px 14px rgba(0,0,0,0.6);';

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);">
      <!-- Onda de eco de radar expansiva -->
      <div style="
        position: absolute;
        top: 2px;
        width: 100%;
        height: 28px;
        border-radius: 9999px;
        background: ${glowColor};
        animation: radar-pulse 2.2s infinite ease-out;
        z-index: 0;
      "></div>

      <!-- Tarjeta Pin Principal -->
      <div style="
        position: relative;
        z-index: 1;
        background: ${bgColor};
        color: white;
        border: 2px solid ${borderColor};
        border-radius: 9999px;
        padding: 5px 9px;
        font-size: 13px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        ${selectedAnimation}
      ">
        <span style="font-size: 13px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));">${iconHtml}</span>
        <span style="max-width: 110px; overflow: hidden; text-overflow: ellipsis; font-size: 11px; letter-spacing: -0.2px;">
          ${item.placeName.split(' ').slice(0, 2).join(' ')}
        </span>
        ${isSelected ? '<span style="color: #6ee7b7; font-size: 9px; font-weight: 900; background: rgba(0,0,0,0.4); padding: 1px 4px; border-radius: 4px;">ACTIVA</span>' : ''}
      </div>

      <!-- Triángulo inferior -->
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid ${bgColor};
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

function createUserLocationPin() {
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
      <!-- Ondas concéntricas de pulso GPS -->
      <div style="
        position: absolute;
        width: 44px;
        height: 44px;
        border-radius: 9999px;
        background: rgba(66, 133, 244, 0.25);
        border: 1px solid rgba(66, 133, 244, 0.6);
        animation: sonar-wave-expand 2.5s infinite cubic-bezier(0.2, 0.8, 0.2, 1);
      "></div>
      <div style="
        position: absolute;
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        background: rgba(66, 133, 244, 0.45);
        animation: radar-pulse 1.8s infinite ease-out;
      "></div>
      <!-- Núcleo central del GPS -->
      <div style="
        width: 14px;
        height: 14px;
        border-radius: 9999px;
        background: #3B82F6;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 12px #3B82F6, 0 2px 8px rgba(0,0,0,0.6);
        z-index: 2;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'user-location-pin',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
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
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid' | 'traffic'>('roadmap');
  const [showRadarHud, setShowRadarHud] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[440px] flex flex-col items-center justify-center bg-[#0B131F] rounded-2xl border border-slate-800 text-slate-400">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3 shadow-[0_0_20px_#10B981]"></div>
        <p className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Sincronizando Google Maps Satelital...
        </p>
        <p className="text-xs text-slate-400 mt-1">Calibrando radar de proximidad a pie</p>
      </div>
    );
  }

  const zoom = radiusMeters <= 600 ? 16 : radiusMeters <= 1500 ? 15 : radiusMeters <= 3500 ? 14 : 13;
  const currentLayer = GOOGLE_MAPS_LAYERS[mapType];
  const selectedPlace = places.find((p) => p.id === selectedPlaceId) || null;

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-[0_0_35px_rgba(0,0,0,0.7)] group">
      
      {/* =========================================================================
          HUD SUPERIOR: TELEMETRÍA EN VIVO Y SELECTORES FLOTANTES
          ========================================================================= */}
      
      {/* Telemetría Militar Táctica en Vivo (Esquina Superior Izquierda) */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none flex flex-col gap-1.5">
        <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
          </span>
          <span className="text-[10px] font-black tracking-widest text-emerald-300 font-mono uppercase">
            SONAR 360° ACTIVO
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            • {places.length} ECOS
          </span>
        </div>

        <div className="bg-slate-950/75 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800 text-[9px] font-mono text-slate-300 flex items-center gap-2 shadow">
          <Compass className="w-2.5 h-2.5 text-cyan-400" />
          <span>{center[0].toFixed(4)}°N, {Math.abs(center[1]).toFixed(4)}°W</span>
          <span className="text-emerald-400 font-bold">R={radiusMeters}m</span>
        </div>

        {/* Ticker de Ruta Activa Trazada */}
        {selectedPlace && (
          <div className="bg-emerald-950/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-400/80 text-[10px] font-mono text-emerald-300 flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <Footprints className="w-3.5 h-3.5 text-emerald-300 animate-bounce shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-[280px]">
              RUTA: <strong>{selectedPlace.placeName}</strong> ({selectedPlace.distanceFormatted} • {selectedPlace.walkTimeMinutes} min)
            </span>
          </div>
        )}
      </div>

      {/* Selector Flotante de Capa & Toggle Sonar (Esquina Superior Derecha) */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5">
        
        {/* Toggle para Activar/Desactivar el Haz de Sonar */}
        <button
          onClick={() => setShowRadarHud(!showRadarHud)}
          title="Alternar haz de radar sonar 360°"
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-md border shadow-xl cursor-pointer ${
            showRadarHud
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${showRadarHud ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">{showRadarHud ? 'Haz Sonar ON' : 'Haz Sonar OFF'}</span>
        </button>

        {/* Selector de Tipo de Capa Google Maps */}
        <div className="bg-slate-950/90 backdrop-blur-md rounded-xl p-1 border border-slate-700 shadow-xl flex items-center gap-1">
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              mapType === 'roadmap'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Calles
          </button>
          <button
            onClick={() => setMapType('hybrid')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              mapType === 'hybrid'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Satélite
          </button>
          <button
            onClick={() => setMapType('traffic')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              mapType === 'traffic'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Tráfico
          </button>
        </div>
      </div>

      {/* =========================================================================
          CAPA HUD NOVEDOSA: HAZ DE RADAR SONAR 360° Y RETÍCULA TÁCTICA
          ========================================================================= */}
      {showRadarHud && (
        <div className="absolute inset-0 z-[500] pointer-events-none overflow-hidden flex items-center justify-center">
          
          {/* Línea de Escaneo Táctico Dinámico */}
          <div className="animate-scanline" />

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

            {/* Haz Cónico Giratorio de Radar Sonar */}
            <div 
              className="absolute inset-0 rounded-full animate-sonar-beam pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg, rgba(16, 185, 129, 0) 0deg, rgba(16, 185, 129, 0) 275deg, rgba(16, 185, 129, 0.16) 335deg, rgba(52, 211, 153, 0.45) 360deg)',
                borderRight: '1.5px solid rgba(110, 231, 183, 0.8)',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)',
              }}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTENEDOR DEL MAPA LEAFLET + GOOGLE MAPS TILES
          ========================================================================= */}
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '460px' }}
      >
        <MapController center={center} zoom={zoom} selectedPlace={selectedPlace} userLocation={userLocation} />

        {/* Capa Oficial de Google Maps */}
        <TileLayer
          key={mapType}
          attribution='&copy; Google Maps'
          url={currentLayer.url}
          subdomains={currentLayer.subdomains}
          maxZoom={currentLayer.maxZoom}
        />

        {/* Círculo visual del radio de proximidad a pie con pulso */}
        <Circle
          center={center}
          radius={radiusMeters}
          pathOptions={{
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.08,
            weight: 2,
            dashArray: '6, 10',
          }}
        />

        {/* =========================================================================
            RUTA A PIE ANIMADA DIRECTA ENTRE TU GPS Y LA VACANTE SELECCIONADA
            ========================================================================= */}
        {selectedPlace && userLocation && (
          <>
            {/* Halo Neón Esmeralda Grueso de Base */}
            <Polyline
              positions={[
                userLocation,
                [selectedPlace.latitude, selectedPlace.longitude],
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
                userLocation,
                [selectedPlace.latitude, selectedPlace.longitude],
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
                (userLocation[0] + selectedPlace.latitude) / 2,
                (userLocation[1] + selectedPlace.longitude) / 2,
              ]}
              icon={createWalkingBadgeIcon(selectedPlace.walkTimeMinutes, selectedPlace.distanceMeters)}
            />
          </>
        )}

        {/* Pin de ubicación del usuario */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserLocationPin()}>
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
        {places.map((place) => {
          const isSelected = selectedPlaceId === place.id;
          const googleMapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.placeName} ${place.address}`)}`;
          const googleMapsWalkingUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&travelmode=walking`;

          return (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={createCustomPin(place, isSelected)}
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
