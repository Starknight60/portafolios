'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { PlaceResultItem } from '@/app/api/places/route';
import { Navigation, ExternalLink, Layers, MapPin, Eye } from 'lucide-react';

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

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

function createCustomPin(item: PlaceResultItem, isSelected: boolean) {
  let bgColor = '#10B981'; // Emerald para vacantes verificadas
  let borderColor = '#059669';
  let iconHtml = '💼';

  if (item.status === 'COMMUNITY_HIRING') {
    bgColor = '#F59E0B'; // Ámbar
    borderColor = '#D97706';
    iconHtml = '📢';
  } else if (item.status === 'COMMUNITY_NOT_HIRING') {
    bgColor = '#64748B';
    borderColor = '#475569';
    iconHtml = '❌';
  } else if (item.status === 'POTENTIAL_PLACE') {
    bgColor = '#3B82F6';
    borderColor = '#2563EB';
    iconHtml = '🏬';
  }

  const selectedRing = isSelected ? 'ring-4 ring-white shadow-2xl scale-125 z-50' : 'shadow-lg';

  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      <div class="${selectedRing}" style="
        background: ${bgColor};
        color: white;
        border: 2px solid ${borderColor};
        border-radius: 9999px;
        padding: 5px 8px;
        font-size: 13px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        transition: transform 0.2s ease;
      ">
        <span>${iconHtml}</span>
        <span style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; font-size: 11px;">
          ${item.placeName.split(' ').slice(0, 2).join(' ')}
        </span>
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid ${bgColor};
        margin-top: -1px;
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
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
      <div style="
        position: absolute;
        width: 34px;
        height: 34px;
        border-radius: 9999px;
        background: rgba(66, 133, 244, 0.4);
        animation: radar-pulse 2s infinite ease-out;
      "></div>
      <div style="
        width: 15px;
        height: 15px;
        border-radius: 9999px;
        background: #4285F4;
        border: 3px solid #ffffff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.6);
        z-index: 2;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'user-location-pin',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[420px] flex flex-col items-center justify-center bg-[#0B131F] rounded-2xl border border-slate-800 text-slate-400">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-slate-200">Cargando Google Maps...</p>
        <p className="text-xs text-slate-500">Conectando con servidores de mapas satelitales</p>
      </div>
    );
  }

  const zoom = radiusMeters <= 600 ? 16 : radiusMeters <= 1500 ? 15 : radiusMeters <= 3500 ? 14 : 13;
  const currentLayer = GOOGLE_MAPS_LAYERS[mapType];

  return (
    <div className="relative w-full h-full min-h-[440px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl">
      {/* Selector Flotante de Tipo de Capa Google Maps */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-1 border border-slate-300 dark:border-slate-700 shadow-xl flex items-center gap-1">
        <button
          onClick={() => setMapType('roadmap')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
            mapType === 'roadmap'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          Calles
        </button>
        <button
          onClick={() => setMapType('hybrid')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
            mapType === 'hybrid'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          Satélite
        </button>
        <button
          onClick={() => setMapType('traffic')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
            mapType === 'traffic'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          Tráfico
        </button>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '440px' }}
      >
        <MapController center={center} zoom={zoom} />

        {/* Capa Oficial de Google Maps */}
        <TileLayer
          key={mapType}
          attribution='&copy; Google Maps'
          url={currentLayer.url}
          subdomains={currentLayer.subdomains}
          maxZoom={currentLayer.maxZoom}
        />

        {/* Círculo visual del radio de proximidad a pie */}
        <Circle
          center={center}
          radius={radiusMeters}
          pathOptions={{
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.12,
            weight: 2,
            dashArray: '5, 8',
          }}
        />

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

        {/* Marcadores de oportunidades reales */}
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
                      className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition shadow"
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
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 shadow-2xl flex items-center gap-3">
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
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Reporte Vecinal</span>
        </div>
      </div>
    </div>
  );
}
