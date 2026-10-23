'use client';

import { useState, useEffect, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { PlaceResultItem } from '@/app/api/places/route';
import { CATEGORIES, BASE_CATEGORIES } from '@/lib/categories';
import VacancyDetailModal from '@/components/VacancyDetailModal';
import ReportModal from '@/components/ReportModal';
import EmployerModal from '@/components/EmployerModal';
import { 
  Compass, MapPin, Navigation, Search, Filter, RefreshCw, 
  Briefcase, MessageCircle, DollarSign, Clock, Users, ArrowUpRight, 
  ExternalLink, ChevronRight, Layers, ShieldCheck, HeartHandshake 
} from 'lucide-react';

// Carga dinámica del mapa de Leaflet sin SSR para evitar errores de servidor
const MapViewer = dynamic(() => import('@/components/MapViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] flex flex-col items-center justify-center bg-[#0B131F] rounded-2xl border border-slate-800 text-slate-400">
      <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
      <p className="text-xs">Cargando radar de mapas...</p>
    </div>
  ),
});

const QUICK_ZONES = [
  { name: 'Altamira / Chacao', lat: 10.4960, lng: -66.8520 },
  { name: 'Los Palos Grandes', lat: 10.4952, lng: -66.8485 },
  { name: 'Sabana Grande', lat: 10.4900, lng: -66.8790 },
  { name: 'La Trinidad', lat: 10.4350, lng: -66.8610 },
];

const RADIUS_OPTIONS = [
  { label: '500m • 5 min a pie', value: 500 },
  { label: '1 km • 12 min a pie', value: 1000 },
  { label: '3 km • En transporte', value: 3000 },
  { label: '5 km • Zona amplia', value: 5000 },
];

export default function HomePage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 10.4960, lng: -66.8520 });
  const [userLocation, setUserLocation] = useState<[number, number] | null>([10.4960, -66.8520]);
  const [radius, setRadius] = useState<number>(1500);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [places, setPlaces] = useState<PlaceResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResultItem | null>(null);
  const [reportTargetPlace, setReportTargetPlace] = useState<PlaceResultItem | null>(null);
  const [isEmployerModalOpen, setIsEmployerModalOpen] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'feed' | 'map'>('feed');
  const [summary, setSummary] = useState<any>(null);

  // Carga de datos de oportunidades desde la API
  async function fetchPlaces() {
    setLoading(true);
    try {
      const url = `/api/places?lat=${coords.lat}&lng=${coords.lng}&radius=${radius}&category=${selectedCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.places)) {
        setPlaces(data.places);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Error fetching places:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlaces();
  }, [coords, radius, selectedCategory]);

  // Geolocalización del navegador
  function handleRequestLocation() {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización. Puedes seleccionar una de las zonas urbanas de acceso rápido.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(newCoords);
        setUserLocation([newCoords.lat, newCoords.lng]);
        setGpsLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setGpsLoading(false);
        alert('No se pudo acceder al GPS. Asegúrate de permitir el acceso a tu ubicación o elige una zona en la barra superior.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  return (
    <div className="min-h-screen bg-[#080D15] text-slate-100 flex flex-col font-sans">
      {/* 1. Header Principal */}
      <header className="sticky top-0 z-[100] bg-[#0E1726]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Identidad de Marca */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-950 flex items-center justify-center">
              <div className="w-full h-full bg-[#080D15] rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                  Chamba<span className="text-emerald-400">Cerca</span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  Radar Social
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xs:block">
                Oportunidades de empleo de proximidad • Sin intermediarios
              </p>
            </div>
          </div>

          {/* Acciones de Cabecera */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                if (places.length > 0) {
                  setReportTargetPlace(places[0]);
                } else {
                  alert('Selecciona primero un comercio o zona para aportar tu dato.');
                }
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-950/50 hover:bg-amber-900/40 text-amber-300 border border-amber-800/50 transition"
            >
              <span>📢 Fui a preguntar</span>
            </button>

            <button
              onClick={() => setIsEmployerModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-950"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Publicar Empleo</span>
            </button>

            <a
              href="https://portafolios-rho.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition border border-slate-800"
            >
              <span>Mi Portafolio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* 2. Barra de Control Geográfico & Filtros */}
      <section className="bg-[#0B131F] border-b border-slate-800/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Fila 1: Botón GPS, Selector de Zona y Selector de Radio */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Botón de Geolocation del Navegador */}
              <button
                onClick={handleRequestLocation}
                disabled={gpsLoading}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-bold transition shadow-sm"
              >
                <Navigation className={`w-3.5 h-3.5 text-emerald-400 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? 'Obteniendo GPS...' : 'Usar mi ubicación actual'}</span>
              </button>

              {/* Zonas Urbanas Rápidas */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Zonas:</span>
                {QUICK_ZONES.map((zone) => {
                  const isActive = Math.abs(coords.lat - zone.lat) < 0.001 && Math.abs(coords.lng - zone.lng) < 0.001;
                  return (
                    <button
                      key={zone.name}
                      onClick={() => {
                        setCoords({ lat: zone.lat, lng: zone.lng });
                        setUserLocation([zone.lat, zone.lng]);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                        isActive
                          ? 'bg-slate-700 text-white font-semibold'
                          : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {zone.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de Radio de Distancia */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80 self-start md:self-auto overflow-x-auto">
              <span className="text-[11px] text-slate-400 px-2 font-medium">Radio:</span>
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRadius(opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    radius === opt.value
                      ? 'bg-emerald-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fila 2: Categorías de Empleo */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 border ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800/60 hover:text-slate-200'
              }`}
            >
              <span>🌟</span>
              <span>Todos los rubros</span>
              {summary && <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">{summary.totalFound}</span>}
            </button>

            {BASE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Selector Móvil de Vista (Feed vs Mapa) */}
      <div className="lg:hidden flex items-center border-b border-slate-800 bg-[#0E1726]">
        <button
          onClick={() => setMobileTab('feed')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
            mobileTab === 'feed'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
              : 'border-transparent text-slate-400'
          }`}
        >
          <span>Lista de Vacantes ({places.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
            mobileTab === 'map'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
              : 'border-transparent text-slate-400'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Mapa de Proximidad</span>
        </button>
      </div>

      {/* 4. Cuerpo Principal con Dual Screen (Mapa a la Izquierda, Feed a la Derecha) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Mapa Interactivo Geoespacial (Fijo / Visible según vista) */}
        <div className={`lg:col-span-7 h-[420px] lg:h-[calc(100vh-230px)] lg:sticky lg:top-[160px] ${mobileTab === 'map' ? 'block' : 'hidden lg:block'}`}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-400" /> Radar en Vivo
              </span>
              <span className="text-[11px] text-slate-400">
                {places.length} puntos detectados a pie
              </span>
            </div>
            <div className="flex-1 h-full min-h-[380px]">
              <MapViewer
                center={[coords.lat, coords.lng]}
                radiusMeters={radius}
                places={places}
                selectedPlaceId={selectedPlace ? selectedPlace.id : null}
                onSelectPlace={(p) => setSelectedPlace(p)}
                userLocation={userLocation}
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Feed de Oportunidades Ordenado por Distancia Métrica */}
        <div className={`lg:col-span-5 space-y-4 ${mobileTab === 'feed' ? 'block' : 'hidden lg:block'}`}>
          {/* Tarjeta Informativa de Ayuda al Desempleado */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-800/40 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-900/50 text-emerald-400 shrink-0 mt-0.5">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">¿Buscando trabajo por tu zona?</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Las oportunidades marcadas en <strong className="text-emerald-400">verde</strong> son vacantes activas. Los comercios en <strong className="text-blue-400">azul</strong> son lugares de alto movimiento donde puedes acudir a solicitar empleo con tu currículo impreso.
                </p>
              </div>
            </div>
          </div>

          {/* Estado de Carga */}
          {loading ? (
            <div className="p-12 text-center space-y-3 bg-[#0E1726] rounded-2xl border border-slate-800">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-200">Escaneando comercios y vacantes...</p>
              <p className="text-xs text-slate-400">Consultando Neon PostgreSQL y servicios de proximidad</p>
            </div>
          ) : places.length === 0 ? (
            /* Estado Vacío */
            <div className="p-10 text-center space-y-4 bg-[#0E1726] rounded-2xl border border-slate-800">
              <span className="text-4xl">🔍</span>
              <h4 className="font-bold text-base text-slate-200">No hay lugares registrados en este radio exacto</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Prueba ampliando el radio a 3 km o 5 km, o sé el primero en reportar un comercio que esté contratando en tu comunidad.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setRadius(3000)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  Ampliar a 3 km
                </button>
                <button
                  onClick={() => setIsEmployerModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
                >
                  Publicar Vacante
                </button>
              </div>
            </div>
          ) : (
            /* Lista de Tarjetas de Oportunidades */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-semibold text-slate-300">
                  {places.length} resultados ordenados por distancia:
                </span>
                <span>🚶 Estimado a pie (80m/min)</span>
              </div>

              {places.map((place) => {
                const isSelected = selectedPlace?.id === place.id;
                const isVerified = place.status === 'VERIFIED_VACANCY';
                const isCommunity = place.status === 'COMMUNITY_HIRING';
                const isPotential = place.status === 'POTENTIAL_PLACE';

                return (
                  <div
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    className={`p-4 rounded-2xl border transition cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-500'
                        : 'bg-[#0E1726] border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Badge de Distancia en la Esquina Superior */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isVerified && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Vacante Activa
                          </span>
                        )}
                        {isCommunity && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-950 text-amber-400 border border-amber-800">
                            📢 Reporte Vecinal
                          </span>
                        )}
                        {isPotential && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-950 text-blue-400 border border-blue-900/80">
                            🏬 Comercio Potencial
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {place.categoryIcon} {place.categoryLabel}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                          📍 {place.distanceFormatted}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {place.walkTimeMinutes} min a pie
                        </p>
                      </div>
                    </div>

                    {/* Título y Nombre del Lugar */}
                    <h4 className="font-bold text-base text-white group-hover:text-emerald-300 transition line-clamp-1">
                      {place.title || place.placeName}
                    </h4>
                    <p className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{place.placeName} — {place.address}</span>
                    </p>

                    {/* Fila de Salario y Horario si existen */}
                    {(place.salaryRange || place.schedule) && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-800 flex items-center gap-3 text-xs">
                        {place.salaryRange && (
                          <span className="font-semibold text-emerald-400 flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" /> {place.salaryRange}
                          </span>
                        )}
                        {place.schedule && (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" /> {place.schedule}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Comentario de vecino si aplica */}
                    {place.recentComment && (
                      <p className="mt-2 text-xs text-amber-300/90 italic bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                        "{place.recentComment}"
                      </p>
                    )}

                    {/* Acciones Rápidas */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlace(place);
                        }}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      >
                        Ver cómo postular <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReportTargetPlace(place);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-300 text-xs transition"
                          title="Fui a preguntar / Aportar dato"
                        >
                          📢 Aportar dato
                        </button>

                        {place.contactWhatsapp && (
                          <a
                            href={`https://wa.me/${place.contactWhatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 5. Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#0E1726] py-6 px-4 sm:px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong>ChambaCerca</strong> © 2026 • Plataforma de impacto social para la búsqueda de empleo local y de proximidad.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-emerald-400">● Base de datos Neon en la nube activa</span>
            <button
              onClick={() => setIsEmployerModalOpen(true)}
              className="text-slate-300 hover:text-white underline"
            >
              Publicar Empleo Gratis
            </button>
          </div>
        </div>
      </footer>

      {/* 6. Modales Interactivos */}
      <VacancyDetailModal
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
        onOpenReport={(p) => setReportTargetPlace(p)}
      />

      <ReportModal
        place={reportTargetPlace}
        onClose={() => setReportTargetPlace(null)}
        onSuccess={() => fetchPlaces()}
      />

      <EmployerModal
        isOpen={isEmployerModalOpen}
        onClose={() => setIsEmployerModalOpen(false)}
        userCoords={coords}
        onVacancyCreated={() => fetchPlaces()}
      />
    </div>
  );
}
