'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PlaceResultItem } from '@/app/api/places/route';
import { CATEGORIES, BASE_CATEGORIES } from '@/lib/categories';
import { VENEZUELA_CITIES } from '@/lib/venezuelaCities';
import VacancyDetailModal from '@/components/VacancyDetailModal';
import ReportModal from '@/components/ReportModal';
import EmployerModal from '@/components/EmployerModal';
import AuthModal from '@/components/AuthModal';
import { 
  Compass, MapPin, Navigation, Search, Filter, RefreshCw, 
  Briefcase, MessageCircle, DollarSign, Clock, Users, ArrowUpRight, 
  ExternalLink, ChevronRight, Layers, ShieldCheck, HeartHandshake,
  AlertTriangle, Globe, Mail, Sparkles, User, LogOut, Star, Bookmark
} from 'lucide-react';

// Carga dinámica del mapa de Google Maps sin SSR para evitar errores de hidratación
const MapViewer = dynamic(() => import('@/components/MapViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[440px] flex flex-col items-center justify-center bg-[#0B131F] rounded-2xl border border-slate-800 text-slate-400">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-semibold text-slate-200">Cargando Google Maps satelital...</p>
      <p className="text-xs text-slate-500">Conectando con servidores de mapas y radar de proximidad</p>
    </div>
  ),
});

const RADIUS_OPTIONS = [
  { label: '500m • 5 min a pie', value: 500 },
  { label: '1 km • 12 min a pie', value: 1000 },
  { label: '3 km • En transporte', value: 3000 },
  { label: '5 km • Toda la zona', value: 5000 },
];

export default function HomePage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 10.4960, lng: -66.8520 });
  const [userLocation, setUserLocation] = useState<[number, number] | null>([10.4960, -66.8520]);
  const [radius, setRadius] = useState<number>(2500);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [places, setPlaces] = useState<PlaceResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResultItem | null>(null);
  const [reportTargetPlace, setReportTargetPlace] = useState<PlaceResultItem | null>(null);
  const [isEmployerModalOpen, setIsEmployerModalOpen] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'feed' | 'map'>('feed');
  const [summary, setSummary] = useState<any>(null);

  // Estados de Autenticación de Usuario
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [filterSavedOnly, setFilterSavedOnly] = useState<boolean>(false);

  // Verificar sesión actual al cargar
  async function checkSession() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
        fetchSaved();
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  }

  // Obtener IDs de vacantes guardadas
  async function fetchSaved() {
    try {
      const res = await fetch('/api/saved');
      const data = await res.json();
      if (data.savedIds && Array.isArray(data.savedIds)) {
        setSavedIds(data.savedIds);
      }
    } catch {
      // Silencioso
    }
  }

  // Cerrar sesión
  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setSavedIds([]);
      setFilterSavedOnly(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  // Guardar / Quitar de guardados
  async function handleToggleSave(placeId: string) {
    if (!currentUser) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacancyId: placeId }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.saved) {
          setSavedIds((prev) => [...prev, placeId]);
        } else {
          setSavedIds((prev) => prev.filter((id) => id !== placeId));
        }
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  }

  // Consulta de lugares a la API
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

  // Solicitar ubicación GPS automáticamente al cargar
  useEffect(() => {
    checkSession();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(newCoords);
          setUserLocation([newCoords.lat, newCoords.lng]);
        },
        () => {
          // Fallback silencioso a coordenadas por defecto
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [coords, radius, selectedCategory]);

  function handleRequestLocation() {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización. Elige tu ciudad en la barra superior.');
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
        alert('No se pudo acceder al GPS. Asegúrate de permitir el acceso o selecciona tu ciudad en la lista.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  // Filtrado final de lugares (incluyendo filtro de guardados)
  const displayedPlaces = filterSavedOnly
    ? places.filter((p) => savedIds.includes(p.id))
    : places;

  return (
    <div className="min-h-screen bg-[#080D15] text-slate-100 flex flex-col font-sans">
      {/* 1. Alerta Superior Anti-Estafas en Venezuela */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-800/40 px-4 py-1.5 text-center text-[11px] text-emerald-300 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>Información 100% Real y Verificada:</strong> Canales oficiales de CompuTrabajo, LinkedIn, Instagram y WhatsApp corporativo sin intermediarios fraudulentos.
        </span>
      </div>

      {/* 2. Header Principal con Autenticación de Usuario */}
      <header className="sticky top-0 z-[100] bg-[#0E1726]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-950 flex items-center justify-center">
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
                  Venezuela Real
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xs:block">
                Radar de empleo local por GPS • Google Maps en vivo
              </p>
            </div>
          </div>

          {/* Acciones de Cabecera & Perfil de Usuario */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                if (places.length > 0) {
                  setReportTargetPlace(places[0]);
                } else {
                  alert('Selecciona primero un comercio para aportar tu reporte vecinal.');
                }
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-950/50 hover:bg-amber-900/40 text-amber-300 border border-amber-800/50 transition"
            >
              <span>📢 Fui a preguntar</span>
            </button>

            <button
              onClick={() => setIsEmployerModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-950"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Publicar Empleo</span>
            </button>

            {/* Estado de Sesión del Usuario */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-900/90 p-1 pl-2.5 rounded-xl border border-slate-700/80">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left pr-1">
                  <p className="text-xs font-bold text-slate-100 leading-tight line-clamp-1">{currentUser.name}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">
                    {currentUser.role === 'EMPLOYER' ? 'Comercio / Empleador' : 'Buscador de Chamba'}
                  </p>
                </div>

                <button
                  onClick={() => setFilterSavedOnly(!filterSavedOnly)}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                    filterSavedOnly ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-amber-300'
                  }`}
                  title="Ver oportunidades guardadas"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-[11px]">{savedIds.length}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Iniciar Sesión</span>
              </button>
            )}

            <a
              href="https://portafolios-rho.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition border border-slate-800"
            >
              <span>Portafolio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* 3. Barra de Control Geográfico & Selector de Ciudades de Venezuela */}
      <section className="bg-[#0B131F] border-b border-slate-800/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Fila 1: Botón GPS, Selector de Ciudad Nacional y Selector de Radio */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Botón GPS */}
              <button
                onClick={handleRequestLocation}
                disabled={gpsLoading}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-xs font-bold transition shadow-sm"
              >
                <Navigation className={`w-3.5 h-3.5 text-emerald-400 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? 'Obteniendo GPS...' : '📍 Mi Ubicación GPS'}</span>
              </button>

              {/* Selector de Ciudades en Toda Venezuela */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar max-w-full md:max-w-xl">
                <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline whitespace-nowrap">Ciudades:</span>
                {VENEZUELA_CITIES.map((city) => {
                  const isActive = Math.abs(coords.lat - city.lat) < 0.05 && Math.abs(coords.lng - city.lng) < 0.05;
                  return (
                    <button
                      key={city.id}
                      onClick={() => {
                        setCoords({ lat: city.lat, lng: city.lng });
                        setUserLocation([city.lat, city.lng]);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                        isActive
                          ? 'bg-emerald-600 text-white font-bold shadow'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {city.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de Radio de Distancia */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start md:self-auto overflow-x-auto">
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

          {/* Fila 2: Indicador de Ubicación Detectada & Filtro de Categorías */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
            <div className="flex items-center gap-2 flex-wrap">
              {summary?.detectedLocation && (
                <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Explorando en: <strong className="text-white">{summary.detectedLocation}</strong></span>
                </p>
              )}

              {currentUser && savedIds.length > 0 && (
                <button
                  onClick={() => setFilterSavedOnly(!filterSavedOnly)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                    filterSavedOnly
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-900 text-amber-300 border border-amber-800/60 hover:bg-slate-800'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{filterSavedOnly ? 'Viendo Guardadas' : `Mis Guardadas (${savedIds.length})`}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 border ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span>🌟 Todos los rubros</span>
                {summary && <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">{summary.totalFound}</span>}
              </button>

              {BASE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 border ${
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
        </div>
      </section>

      {/* 4. Selector Móvil de Vista (Feed vs Mapa) */}
      <div className="lg:hidden flex items-center border-b border-slate-800 bg-[#0E1726]">
        <button
          onClick={() => setMobileTab('feed')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
            mobileTab === 'feed'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
              : 'border-transparent text-slate-400'
          }`}
        >
          <span>Lista de Vacantes ({displayedPlaces.length})</span>
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
          <span>Google Maps ({displayedPlaces.length})</span>
        </button>
      </div>

      {/* 5. Dual Screen: Mapa a la Izquierda, Feed a la Derecha */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Mapa de Google Maps */}
        <div className={`lg:col-span-7 h-[440px] lg:h-[calc(100vh-230px)] lg:sticky lg:top-[160px] ${mobileTab === 'map' ? 'block' : 'hidden lg:block'}`}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="text-blue-400 font-bold">G</span>
                <span className="text-rose-400 font-bold">o</span>
                <span className="text-amber-400 font-bold">o</span>
                <span className="text-blue-400 font-bold">g</span>
                <span className="text-emerald-400 font-bold">l</span>
                <span className="text-rose-400 font-bold">e</span>
                <span className="text-slate-200">Maps Proximidad</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {displayedPlaces.length} comercios reales detectados
              </span>
            </div>
            <div className="flex-1 h-full min-h-[400px]">
              <MapViewer
                center={[coords.lat, coords.lng]}
                radiusMeters={radius}
                places={displayedPlaces}
                selectedPlaceId={selectedPlace ? selectedPlace.id : null}
                onSelectPlace={(p) => setSelectedPlace(p)}
                userLocation={userLocation}
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Feed de Oportunidades Reales */}
        <div className={`lg:col-span-5 space-y-4 ${mobileTab === 'feed' ? 'block' : 'hidden lg:block'}`}>
          {/* Banner de Ayuda al Solicitante de Empleo */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-800/40 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-900/60 text-emerald-400 shrink-0 mt-0.5">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">¿Buscando trabajo cerca de ti?</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Mostramos vacantes verificadas en <strong className="text-emerald-400">CompuTrabajo, LinkedIn, WhatsApp corporativo y redes oficiales</strong>. Inicia sesión para guardar tus oportunidades favoritas.
                </p>
              </div>
            </div>
          </div>

          {/* Estado de Carga */}
          {loading ? (
            <div className="p-12 text-center space-y-3 bg-[#0E1726] rounded-2xl border border-slate-800">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-200">Consultando oportunidades reales...</p>
              <p className="text-xs text-slate-400">Conectando con Neon PostgreSQL y servicios de proximidad en Venezuela</p>
            </div>
          ) : displayedPlaces.length === 0 ? (
            /* Estado Vacío */
            <div className="p-10 text-center space-y-4 bg-[#0E1726] rounded-2xl border border-slate-800">
              <span className="text-4xl">🔍</span>
              <h4 className="font-bold text-base text-slate-200">
                {filterSavedOnly ? 'No tienes oportunidades guardadas todavía' : 'No encontramos registros en este radio inmediato'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {filterSavedOnly
                  ? 'Guarda oportunidades haciendo clic en la estrella (★) para tenerlas a mano cuando salgas a postularte.'
                  : 'Amplía el radio a 3 km o 5 km, o selecciona una de las ciudades principales en la barra superior.'}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                {filterSavedOnly ? (
                  <button
                    onClick={() => setFilterSavedOnly(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    Ver todas las ofertas
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setRadius(5000)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                    >
                      Ampliar a 5 km
                    </button>
                    <button
                      onClick={() => setIsEmployerModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
                    >
                      Publicar Vacante
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Feed de Oportunidades */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-semibold text-slate-300">
                  {displayedPlaces.length} lugares ordenados por distancia:
                </span>
                <span>🚶 Caminata estimada (80m/min)</span>
              </div>

              {displayedPlaces.map((place) => {
                const isSelected = selectedPlace?.id === place.id;
                const isVerified = place.status === 'VERIFIED_VACANCY';
                const isCommunity = place.status === 'COMMUNITY_HIRING';
                const isPotential = place.status === 'POTENTIAL_PLACE';
                const isSaved = savedIds.includes(place.id);

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
                    {/* Badge Superior */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isVerified && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            {place.isOfficiallyVerified ? 'Canal Oficial Verificado' : 'Vacante Activa'}
                          </span>
                        )}
                        {isCommunity && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-950 text-amber-400 border border-amber-800">
                            📢 Reporte Vecinal
                          </span>
                        )}
                        {isPotential && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-950 text-blue-400 border border-blue-900/80">
                            🏬 Comercio Real
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {place.categoryIcon} {place.categoryLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(place.id);
                          }}
                          className={`p-1 rounded-lg border transition ${
                            isSaved
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                              : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-amber-300'
                          }`}
                          title={isSaved ? 'Guardada en tus favoritos' : 'Guardar oportunidad'}
                        >
                          <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>

                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                            📍 {place.distanceFormatted}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Título & Nombre del Comercio */}
                    <h4 className="font-bold text-base text-white group-hover:text-emerald-300 transition line-clamp-1">
                      {place.title || place.placeName}
                    </h4>
                    <p className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="line-clamp-1">{place.placeName} — {place.address}</span>
                    </p>

                    {/* Fila de Salario / Horario */}
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

                    {/* Canales Reales Detectados */}
                    {(place.computrabajoUrl || place.contactWhatsapp || place.contactEmail) && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px]">
                        {place.contactWhatsapp && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                            ✓ WhatsApp de Selección
                          </span>
                        )}
                        {place.computrabajoUrl && (
                          <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/60 font-semibold">
                            ✓ En CompuTrabajo
                          </span>
                        )}
                        {place.contactEmail && (
                          <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60 font-semibold">
                            ✓ Correo RRHH
                          </span>
                        )}
                      </div>
                    )}

                    {/* Acciones Rápidas */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
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
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&travelmode=walking`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 font-medium text-[11px] flex items-center gap-1 transition"
                          title="Abrir ruta en Google Maps"
                        >
                          <Navigation className="w-3 h-3 text-blue-400" />
                          <span>Google Maps</span>
                        </a>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReportTargetPlace(place);
                          }}
                          className="p-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-300 text-[11px] transition"
                          title="Fui a preguntar / Aportar dato"
                        >
                          📢 Aportar
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

                        {place.computrabajoUrl && !place.contactWhatsapp && (
                          <a
                            href={place.computrabajoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1 rounded-lg bg-red-700 hover:bg-red-600 text-white font-semibold text-[11px] flex items-center gap-1 transition"
                          >
                            <Briefcase className="w-3.5 h-3.5" /> CompuTrabajo
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

      {/* 6. Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#0E1726] py-6 px-4 sm:px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong>ChambaCerca</strong> © 2026 • Plataforma de empleo de proximidad para toda Venezuela. Conectando con canales 100% reales de reclutamiento.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-emerald-400">● Neon Cloud PostgreSQL Activa</span>
            {!currentUser && (
              <button
                onClick={() => {
                  setAuthModalTab('register');
                  setIsAuthModalOpen(true);
                }}
                className="text-slate-300 hover:text-white underline"
              >
                Crear Cuenta Gratis
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* 7. Modales */}
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        onSuccess={(user) => {
          setCurrentUser(user);
          fetchSaved();
        }}
      />
    </div>
  );
}
