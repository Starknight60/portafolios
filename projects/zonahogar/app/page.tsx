'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  PropertyItem, INITIAL_PROPERTIES, CITIES_LIST 
} from '@/lib/properties';
import { 
  Home, Search, Filter, MapPin, DollarSign, Droplets, Zap, 
  Wifi, ShieldCheck, PlusCircle, Calculator, Heart, Phone, 
  Share2, ArrowUpDown, CheckCircle2, Sparkles, Compass, 
  SlidersHorizontal, Check, RefreshCw, Layers, Users, ExternalLink
} from 'lucide-react';
import { playTacticalClick, playHomeChime } from '@/lib/audio';
import PropertyDetailModal from '@/components/PropertyDetailModal';
import MovingCalculatorModal from '@/components/MovingCalculatorModal';
import PostPropertyModal from '@/components/PostPropertyModal';

// Cargamos MapViewer dinámicamente para evitar SSR de Leaflet en el cliente
const MapViewer = dynamic(() => import('@/components/MapViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
      <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Cargando Radar de Inmuebles...</span>
    </div>
  ),
});

export default function HomePage() {
  // Estado de lista de propiedades
  const [properties, setProperties] = useState<PropertyItem[]>(INITIAL_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [activePropertyForCalculator, setActivePropertyForCalculator] = useState<PropertyItem | null>(null);

  // Modales
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Filtros
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTankOnly, setFilterTankOnly] = useState(false);
  const [filterGeneratorOnly, setFilterGeneratorOnly] = useState(false);
  const [filterFiberOnly, setFilterFiberOnly] = useState(false);
  const [filterUnder100Only, setFilterUnder100Only] = useState(false);
  const [filterStudentsOnly, setFilterStudentsOnly] = useState(false);
  const [filterCouplesOnly, setFilterCouplesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'recent' | 'walk'>('recent');

  // Favoritos guardados en memoria
  const [savedFavorites, setSavedFavorites] = useState<string[]>([]);

  // Centro de mapa dinámico según ciudad
  const mapCenter = useMemo<[number, number]>(() => {
    if (selectedProperty) {
      return [selectedProperty.latitude, selectedProperty.longitude];
    }
    if (selectedCity !== 'all') {
      const cityData = CITIES_LIST.find((c) => c.name.toLowerCase() === selectedCity.toLowerCase());
      if (cityData) return [cityData.lat, cityData.lng];
    }
    return [10.4960, -66.8520]; // Caracas por defecto
  }, [selectedCity, selectedProperty]);

  // Cargar favoritos de localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zh_favorites');
      if (saved) {
        try {
          setSavedFavorites(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const toggleFavorite = (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playTacticalClick();
    setSavedFavorites((prev) => {
      const updated = prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('zh_favorites', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Filtrado reactivo de propiedades
  const filteredProperties = useMemo(() => {
    return properties
      .filter((item) => {
        // Ciudad
        if (selectedCity !== 'all' && item.city.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
        // Tipo
        if (selectedType !== 'all' && item.type !== selectedType) {
          return false;
        }
        // Filtros vitales
        if (filterTankOnly && !item.waterSystem.hasTank) return false;
        if (filterGeneratorOnly && !item.electricity.hasGenerator) return false;
        if (filterFiberOnly && !item.internet.hasFiber) return false;
        if (filterUnder100Only && item.priceMonthlyUsd > 100) return false;
        if (filterStudentsOnly && !item.rules.allowsStudents) return false;
        if (filterCouplesOnly && !item.rules.allowsCouples) return false;

        // Búsqueda de texto
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(query);
          const matchZone = item.zone.toLowerCase().includes(query);
          const matchCity = item.city.toLowerCase().includes(query);
          const matchDesc = item.description.toLowerCase().includes(query);
          const matchAmenities = item.amenities.some((a) => a.toLowerCase().includes(query));
          if (!matchTitle && !matchZone && !matchCity && !matchDesc && !matchAmenities) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.priceMonthlyUsd - b.priceMonthlyUsd;
        if (sortBy === 'price_desc') return b.priceMonthlyUsd - a.priceMonthlyUsd;
        if (sortBy === 'walk') return a.walkMinutesToTransport - b.walkMinutesToTransport;
        return 0; // recent (default list order)
      });
  }, [
    properties,
    selectedCity,
    selectedType,
    filterTankOnly,
    filterGeneratorOnly,
    filterFiberOnly,
    filterUnder100Only,
    filterStudentsOnly,
    filterCouplesOnly,
    searchQuery,
    sortBy,
  ]);

  // Manejador al hacer clic en un inmueble
  const handleSelectProperty = (property: PropertyItem) => {
    playTacticalClick();
    setSelectedProperty(property);
    setIsDetailModalOpen(true);
  };

  // Manejador de agregar nueva propiedad
  const handleAddProperty = (newProp: PropertyItem) => {
    setProperties((prev) => [newProp, ...prev]);
    setSelectedProperty(newProp);
  };

  // Métricas en vivo
  const avgPrice = useMemo(() => {
    if (filteredProperties.length === 0) return 0;
    const sum = filteredProperties.reduce((acc, p) => acc + p.priceMonthlyUsd, 0);
    return Math.round(sum / filteredProperties.length);
  }, [filteredProperties]);

  const tankPercentage = useMemo(() => {
    if (filteredProperties.length === 0) return 0;
    const withTank = filteredProperties.filter((p) => p.waterSystem.hasTank).length;
    return Math.round((withTank / filteredProperties.length) * 100);
  }, [filteredProperties]);

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* ==================================================================== */}
      {/* 1. CABECERA PRINCIPAL ELEGANTE & COMPACTA */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 bg-[#0A1020]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 text-slate-950 font-black">
              <Home className="w-5 h-5 text-slate-950" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0A1020] flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">ZonaHogar</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  Trato Directo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Radar de Habitaciones & Anexos en Venezuela • 0% Comisiones
              </p>
            </div>
          </div>

          {/* Selector Rápido de Ciudades */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => {
                playTacticalClick();
                setSelectedCity('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCity === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas
            </button>
            {CITIES_LIST.map((city) => (
              <button
                key={city.id}
                onClick={() => {
                  playTacticalClick();
                  setSelectedCity(city.name);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCity.toLowerCase() === city.name.toLowerCase()
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>

          {/* Botones de Acción (Calculadora + Publicar Gratis) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                playTacticalClick();
                setActivePropertyForCalculator(null);
                setIsCalculatorOpen(true);
              }}
              className="px-3 sm:px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all"
              title="Calcula el costo total para mudarte"
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Calculadora Mudanza</span>
              <span className="sm:hidden">Calcular</span>
            </button>

            <button
              onClick={() => {
                playTacticalClick();
                setIsPostModalOpen(true);
              }}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publicar Gratis</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. RADAR PANORÁMICO (GOOGLE MAPS CON PINES INTERACTIVOS) */}
      {/* ==================================================================== */}
      <section className="relative w-full h-[360px] sm:h-[440px] lg:h-[480px] bg-slate-950 border-b border-slate-800 overflow-hidden shadow-2xl">
        <MapViewer
          center={mapCenter}
          properties={filteredProperties}
          selectedPropertyId={selectedProperty ? selectedProperty.id : null}
          onSelectProperty={handleSelectProperty}
          userLocation={null}
        />

        {/* Tarjeta flotante con resumen del radar */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 sm:p-4 rounded-2xl shadow-xl max-w-[280px] sm:max-w-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                Radar en Vivo
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              Mostrando <strong className="text-amber-400">{filteredProperties.length}</strong> inmuebles en {selectedCity === 'all' ? 'Venezuela' : selectedCity}. Toca cualquier pin para ver fotos y requisitos.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Trato directo garantizado</span>
              <span className="text-emerald-400 font-bold">0% Comisión</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. BARRA DE MÉTRICAS EN TIEMPO REAL */}
      {/* ==================================================================== */}
      <div className="bg-[#0E1626] border-b border-slate-800/80 py-3 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2 sm:p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Inmuebles Activos</div>
            <div className="text-lg sm:text-xl font-black text-white">{filteredProperties.length} verificados</div>
          </div>
          <div className="p-2 sm:p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Canon Promedio</div>
            <div className="text-lg sm:text-xl font-black text-amber-400">${avgPrice} USD/mes</div>
          </div>
          <div className="p-2 sm:p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Con Tanque Propio</div>
            <div className="text-lg sm:text-xl font-black text-cyan-400">{tankPercentage}% de la oferta</div>
          </div>
          <div className="p-2 sm:p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Ahorro en Comisiones</div>
            <div className="text-lg sm:text-xl font-black text-emerald-400">$200 - $500 USD</div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. SECCIÓN PRINCIPAL: FILTROS DIRECTOS & OFERTAS DEBAJO DEL RADAR */}
      {/* ==================================================================== */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 space-y-6 flex-1">
        
        {/* Barra de Búsqueda y Filtros Rápidos */}
        <div className="space-y-3 bg-[#0A1020] p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl">
          
          {/* Fila superior: Input de búsqueda + Selector de Orden */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca por zona (ej: Chacao, Los Palos Grandes, Naguanagua, El Viñedo) o características..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="recent">Más Recientes</option>
                <option value="price_asc">Menor Precio ($ USD)</option>
                <option value="price_desc">Mayor Precio ($ USD)</option>
                <option value="walk">Más Cerca del Metro / Parada</option>
              </select>
            </div>
          </div>

          {/* Fila inferior: Pastillas de filtros esenciales para inquilinos venezolanos */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
            
            {/* Tipo de Inmueble */}
            {[
              { id: 'all', label: 'Todos los Tipos' },
              { id: 'room', label: '🛏️ Habitaciones' },
              { id: 'annex', label: '🏡 Anexos' },
              { id: 'studio', label: '🏢 Monoambientes' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  playTacticalClick();
                  setSelectedType(t.id);
                }}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 border transition-all ${
                  selectedType === t.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}

            <div className="w-[1px] h-5 bg-slate-800 shrink-0 mx-1" />

            {/* Pastilla: Tanque de Agua */}
            <button
              onClick={() => {
                playTacticalClick();
                setFilterTankOnly(!filterTankOnly);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 border flex items-center gap-1.5 transition-all ${
                filterTankOnly
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Con Tanque Propio</span>
            </button>

            {/* Pastilla: Fibra Óptica */}
            <button
              onClick={() => {
                playTacticalClick();
                setFilterFiberOnly(!filterFiberOnly);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 border flex items-center gap-1.5 transition-all ${
                filterFiberOnly
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Internet Fibra Óptica</span>
            </button>

            {/* Pastilla: Menos de $100 */}
            <button
              onClick={() => {
                playTacticalClick();
                setFilterUnder100Only(!filterUnder100Only);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 border flex items-center gap-1.5 transition-all ${
                filterUnder100Only
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Menos de $100 / mes</span>
            </button>

            {/* Pastilla: Acepta Estudiantes */}
            <button
              onClick={() => {
                playTacticalClick();
                setFilterStudentsOnly(!filterStudentsOnly);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 border flex items-center gap-1.5 transition-all ${
                filterStudentsOnly
                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>🎓 Estudiantes</span>
            </button>

            {/* Pastilla: Parejas */}
            <button
              onClick={() => {
                playTacticalClick();
                setFilterCouplesOnly(!filterCouplesOnly);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 border flex items-center gap-1.5 transition-all ${
                filterCouplesOnly
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>👫 Parejas</span>
            </button>

            {/* Pastilla: Planta Eléctrica */}
            <button
              onClick={() => {
                playTacticalClick();
                setFilterGeneratorOnly(!filterGeneratorOnly);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 border flex items-center gap-1.5 transition-all ${
                filterGeneratorOnly
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Planta Eléctrica</span>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 5. GRID DE 3 COLUMNAS: OFERTAS DEBAJO DEL RADAR SIN HUECOS */}
        {/* ==================================================================== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Inmuebles Disponibles</span>
                <span className="text-xs font-normal text-slate-400">({filteredProperties.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Contacta directamente por WhatsApp con el dueño sin intermediarios
              </p>
            </div>
            
            {(filterTankOnly || filterFiberOnly || filterUnder100Only || filterStudentsOnly || filterCouplesOnly || filterGeneratorOnly || selectedCity !== 'all' || selectedType !== 'all') && (
              <button
                onClick={() => {
                  playTacticalClick();
                  setFilterTankOnly(false);
                  setFilterFiberOnly(false);
                  setFilterUnder100Only(false);
                  setFilterStudentsOnly(false);
                  setFilterCouplesOnly(false);
                  setFilterGeneratorOnly(false);
                  setSelectedCity('all');
                  setSelectedType('all');
                  setSearchQuery('');
                }}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Restablecer filtros
              </button>
            )}
          </div>

          {filteredProperties.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">No encontramos inmuebles con estos filtros exactos</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Intenta desactivar algunos filtros de servicios o buscar en otra ciudad vecina.
              </p>
              <button
                onClick={() => {
                  playTacticalClick();
                  setSelectedCity('all');
                  setSelectedType('all');
                  setFilterTankOnly(false);
                  setFilterFiberOnly(false);
                  setFilterUnder100Only(false);
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Ver todos los inmuebles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProperties.map((property) => {
                const isSaved = savedFavorites.includes(property.id);
                const isSelected = selectedProperty?.id === property.id;

                return (
                  <div
                    key={property.id}
                    onClick={() => handleSelectProperty(property)}
                    className={`group relative flex flex-col bg-[#0A1020] rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-2xl ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-amber-500/10'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Contenedor de Imagen */}
                    <div className="relative w-full h-48 bg-slate-900 overflow-hidden">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Gradiente oscuro sobre imagen para legibilidad */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1020] via-transparent to-black/40" />

                      {/* Pastilla de Tipo de Inmueble */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-xs font-semibold text-white">
                        <span>{property.typeIcon}</span>
                        <span>{property.typeLabel}</span>
                      </div>

                      {/* Botón Favorito */}
                      <button
                        onClick={(e) => toggleFavorite(property.id, e)}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-xl backdrop-blur-md border flex items-center justify-center transition-transform active:scale-90 ${
                          isSaved
                            ? 'bg-rose-500/80 border-rose-400 text-white'
                            : 'bg-slate-950/60 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                      </button>

                      {/* Badge de Trato Directo Verificado */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-slate-950 font-bold text-[10px] shadow-sm">
                        <ShieldCheck className="w-3 h-3 stroke-[3]" />
                        <span>Trato Directo</span>
                      </div>

                      {/* Precio Mensual Destacado */}
                      <div className="absolute bottom-3 right-3 text-right">
                        <div className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 stroke-[3]" />
                          <span>{property.priceMonthlyUsd}</span>
                          <span className="text-[10px] font-bold">/ mes</span>
                        </div>
                      </div>
                    </div>

                    {/* Contenido de la Tarjeta */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Ubicación y distancia a transporte */}
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span className="flex items-center gap-1 font-medium text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            {property.zone}, {property.city}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {property.walkMinutesToTransport} min a pie
                          </span>
                        </div>

                        {/* Título */}
                        <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-amber-400 transition-colors">
                          {property.title}
                        </h3>
                      </div>

                      {/* Pastillas de Servicios Vitales */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {/* Tanque */}
                        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                          <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">
                            {property.waterSystem.hasTank
                              ? `Tanque ${property.waterSystem.tankLitres}L`
                              : 'Agua directa'}
                          </span>
                        </div>

                        {/* Fibra */}
                        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                          <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">
                            {property.internet.hasFiber
                              ? `${property.internet.speedMbps}Mbps Fibra`
                              : 'Internet'}
                          </span>
                        </div>
                      </div>

                      {/* Reglas / Compatibilidad rápida */}
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        {property.rules.allowsStudents && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                            Estudiantes OK
                          </span>
                        )}
                        {property.rules.allowsCouples && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300">
                            Parejas OK
                          </span>
                        )}
                        {property.rules.hasIndependentKeys && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                            Entrada libre
                          </span>
                        )}
                      </div>

                      {/* Botones de Acción al pie de cada tarjeta */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProperty(property);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>Ver Ficha Completa</span>
                        </button>

                        <a
                          href={`https://wa.me/${property.ownerWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hola, vi en ZonaHogar su publicación de ${property.typeLabel} en ${property.zone} ($${property.priceMonthlyUsd}/mes) y quisiera conocerlo personalmente.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20 transition-all shrink-0"
                          title="Contactar al dueño directo por WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ==================================================================== */}
      {/* 6. MODALES INTERACTIVOS */}
      {/* ==================================================================== */}
      
      {/* Modal de Detalle Completo del Inmueble */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenMovingCalculator={(prop) => {
          setIsDetailModalOpen(false);
          setActivePropertyForCalculator(prop);
          setIsCalculatorOpen(true);
        }}
      />

      {/* Modal de Calculadora de Mudanza */}
      <MovingCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        initialProperty={activePropertyForCalculator}
      />

      {/* Modal de Publicar Alquiler Gratis */}
      <PostPropertyModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onAddProperty={handleAddProperty}
      />

      {/* ==================================================================== */}
      {/* 7. FOOTER ELEGANTE */}
      {/* ==================================================================== */}
      <footer className="mt-auto border-t border-slate-800 bg-[#070B16] py-8 px-4 lg:px-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">ZonaHogar Venezuela</span>
              <p className="text-[11px] text-slate-400">
                La plataforma transparente de alquileres directos para estudiantes, trabajadores y parejas.
              </p>
            </div>
          </div>
          <div className="text-center md:text-right text-[11px] text-slate-400">
            <div>Caracas • Valencia • Maracay • Maracaibo • Barquisimeto</div>
            <div className="text-slate-400">Desarrollado con Leaflet & Google Maps • Cero comisiones</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
