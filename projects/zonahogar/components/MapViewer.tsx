'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { PropertyItem } from '@/lib/properties';
import { Navigation, ExternalLink, Layers, MapPin, Eye, Compass, DollarSign, Droplets, Zap, Wifi } from 'lucide-react';

interface MapViewerProps {
  center: [number, number];
  properties: PropertyItem[];
  selectedPropertyId: string | null;
  onSelectProperty: (property: PropertyItem) => void;
  userLocation: [number, number] | null;
}

const GOOGLE_MAPS_LAYERS = {
  roadmap: {
    name: 'Google Calles',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
  },
  hybrid: {
    name: 'Google Satélite',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
  },
};

function MapController({
  center,
  zoom,
  selectedProperty,
  userLocation,
}: {
  center: [number, number];
  zoom: number;
  selectedProperty?: PropertyItem | null;
  userLocation?: [number, number] | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (selectedProperty && userLocation) {
      map.flyToBounds(
        [userLocation, [selectedProperty.latitude, selectedProperty.longitude]],
        { padding: [60, 60], duration: 1.2 }
      );
    } else {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, selectedProperty, userLocation, map]);
  return null;
}

function createPropertyPricePin(property: PropertyItem, isSelected: boolean) {
  const bgGradient = isSelected
    ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
    : 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)';
  const borderColor = isSelected ? '#FBBF24' : '#F59E0B';
  const textColor = isSelected ? '#000000' : '#F8FAFC';
  const glow = isSelected ? 'box-shadow: 0 0 24px rgba(245, 158, 11, 0.9), 0 0 0 2px #fff;' : 'box-shadow: 0 4px 14px rgba(0,0,0,0.6);';

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);">
      ${isSelected ? `
        <div style="
          position: absolute;
          top: 0;
          width: 100%;
          height: 30px;
          border-radius: 9999px;
          background: rgba(245, 158, 11, 0.4);
          animation: property-pulse 2s infinite ease-out;
          z-index: 0;
        "></div>
      ` : ''}

      <div style="
        position: relative;
        z-index: 1;
        background: ${bgGradient};
        color: ${textColor};
        border: 2px solid ${borderColor};
        border-radius: 9999px;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 900;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        ${glow}
      ">
        <span style="font-size: 13px;">${property.typeIcon}</span>
        <span style="font-family: monospace; font-size: 13px; font-weight: 900;">$${property.priceMonthlyUsd}</span>
        <span style="font-size: 10px; opacity: 0.85; font-weight: 600;">/mes</span>
      </div>

      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid ${borderColor};
        margin-top: -1px;
        z-index: 1;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'property-marker-pin',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function createUserGpsPin() {
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.35);
        animation: property-pulse 2s infinite ease-out;
      "></div>
      <div style="
        position: relative;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #3B82F6;
        border: 3px solid #ffffff;
        box-shadow: 0 0 14px rgba(59, 130, 246, 0.8);
      "></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'user-gps-marker',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function MapViewer({
  center,
  properties,
  selectedPropertyId,
  onSelectProperty,
  userLocation,
}: MapViewerProps) {
  const [activeLayer, setActiveLayer] = useState<'roadmap' | 'hybrid'>('roadmap');
  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-[#0A101C] rounded-2xl overflow-hidden border border-slate-800">
      {/* Controles Flotantes del Mapa */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 bg-[#0E1626]/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg">
        <button
          onClick={() => setActiveLayer('roadmap')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
            activeLayer === 'roadmap'
              ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Calles
        </button>
        <button
          onClick={() => setActiveLayer('hybrid')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
            activeLayer === 'hybrid'
              ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Satélite
        </button>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          url={GOOGLE_MAPS_LAYERS[activeLayer].url}
          subdomains={GOOGLE_MAPS_LAYERS[activeLayer].subdomains}
          maxZoom={GOOGLE_MAPS_LAYERS[activeLayer].maxZoom}
          attribution="&copy; Google Maps"
        />

        <MapController
          center={center}
          zoom={13}
          selectedProperty={selectedProperty}
          userLocation={userLocation}
        />

        {/* Marcador GPS del Usuario */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserGpsPin()}>
            <Popup>
              <div className="p-1 text-xs">
                <p className="font-bold text-blue-400">📍 Tu Ubicación Actual</p>
                <p className="text-[10px] text-slate-400">Buscando alquileres a tu alrededor</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de Inmuebles con Precios en $ */}
        {properties.map((prop) => {
          const isSelected = prop.id === selectedPropertyId;
          return (
            <Marker
              key={prop.id}
              position={[prop.latitude, prop.longitude]}
              icon={createPropertyPricePin(prop, isSelected)}
              eventHandlers={{
                click: () => onSelectProperty(prop),
              }}
            >
              <Popup>
                <div className="p-1 max-w-[220px]">
                  <p className="font-extrabold text-sm text-white line-clamp-1">{prop.title}</p>
                  <p className="text-xs font-bold text-amber-400 mt-0.5">
                    ${prop.priceMonthlyUsd} USD / mes
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>{prop.zone}, {prop.city}</span>
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{prop.waterSystem.hasTank ? '🚰 Tanque Propio' : 'Agua regular'}</span>
                    <span>{prop.internet.hasFiber ? '⚡ Fibra Óptica' : 'Wifi'}</span>
                  </div>
                  <button
                    onClick={() => onSelectProperty(prop)}
                    className="w-full mt-2.5 py-1 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                  >
                    Ver detalles & fotos
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Ruta a pie si hay inmueble seleccionado y GPS de usuario */}
        {selectedProperty && userLocation && (
          <Polyline
            positions={[userLocation, [selectedProperty.latitude, selectedProperty.longitude]]}
            pathOptions={{
              color: '#F59E0B',
              weight: 4,
              dashArray: '8, 8',
              opacity: 0.9,
              className: 'leaflet-walking-path',
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
