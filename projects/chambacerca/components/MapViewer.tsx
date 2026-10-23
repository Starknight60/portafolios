'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { PlaceResultItem } from '@/app/api/places/route';
import { MapPin, Navigation, Briefcase, Users, Store, ExternalLink } from 'lucide-react';

interface MapViewerProps {
  center: [number, number];
  radiusMeters: number;
  places: PlaceResultItem[];
  selectedPlaceId: string | null;
  onSelectPlace: (place: PlaceResultItem) => void;
  userLocation: [number, number] | null;
}

// Subcomponente para sincronizar suavemente la vista del mapa cuando cambian las coordenadas
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Generador de iconos HTML Leaflet personalizados y estilizados
function createCustomPin(item: PlaceResultItem, isSelected: boolean) {
  let bgColor = '#10B981'; // Emerald para vacantes verificadas
  let borderColor = '#059669';
  let iconHtml = '💼';

  if (item.status === 'COMMUNITY_HIRING') {
    bgColor = '#F59E0B'; // Ámbar para reportes de contratación
    borderColor = '#D97706';
    iconHtml = '📢';
  } else if (item.status === 'COMMUNITY_NOT_HIRING') {
    bgColor = '#64748B'; // Gris para "No contratando"
    borderColor = '#475569';
    iconHtml = '❌';
  } else if (item.status === 'POTENTIAL_PLACE') {
    bgColor = '#3B82F6'; // Azul para comercios potenciales
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
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        transition: transform 0.2s ease;
      ">
        <span>${iconHtml}</span>
        <span style="max-width: 110px; overflow: hidden; text-overflow: ellipsis; font-size: 11px;">
          ${item.placeName.split(' ')[0]}
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
    iconSize: [120, 36],
    iconAnchor: [60, 34],
    popupAnchor: [0, -32],
  });
}

function createUserLocationPin() {
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
      <div style="
        position: absolute;
        width: 32px;
        height: 32px;
        border-radius: 9999px;
        background: rgba(16, 185, 129, 0.35);
        animation: radar-pulse 2s infinite ease-out;
      "></div>
      <div style="
        width: 14px;
        height: 14px;
        border-radius: 9999px;
        background: #10B981;
        border: 3px solid #ffffff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.6);
        z-index: 2;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'user-location-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-[#0B131F] rounded-2xl border border-slate-800 text-slate-400">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Iniciando radar geoespacial...</p>
      </div>
    );
  }

  // Zoom según radio de búsqueda
  const zoom = radiusMeters <= 600 ? 16 : radiusMeters <= 1500 ? 15 : radiusMeters <= 3500 ? 14 : 13;

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '420px' }}
      >
        <MapController center={center} zoom={zoom} />

        {/* Mapa base CartoDB Dark Matter para alto contraste y visibilidad */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Círculo visual del radio de búsqueda del usuario */}
        <Circle
          center={center}
          radius={radiusMeters}
          pathOptions={{
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.08,
            weight: 2,
            dashArray: '6, 8',
          }}
        />

        {/* Marcador de la posición del usuario */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserLocationPin()}>
            <Popup>
              <div className="p-1 text-slate-800">
                <p className="font-semibold text-xs flex items-center gap-1 text-emerald-600">
                  <Navigation className="w-3.5 h-3.5" /> Tu Ubicación
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Explorando empleo a pie</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de oportunidades laborales y lugares */}
        {places.map((place) => {
          const isSelected = selectedPlaceId === place.id;
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
                <div className="p-1 max-w-[220px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{place.categoryIcon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      {place.categoryLabel}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100 line-clamp-1">{place.placeName}</h4>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">{place.title}</p>

                  <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-emerald-400">📍 {place.distanceFormatted}</span>
                    <span>🚶 {place.walkTimeMinutes} min a pie</span>
                  </div>

                  <button
                    onClick={() => onSelectPlace(place)}
                    className="mt-2.5 w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    Ver detalles & cómo postular <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Leyenda flotante en esquina del mapa */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-xl flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
          <span>Vacante Verificada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#F59E0B]"></span>
          <span>Reporte Vecino</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>Comercio Potencial</span>
        </div>
      </div>
    </div>
  );
}
