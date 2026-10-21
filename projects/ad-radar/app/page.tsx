"use client";

import { useState, useEffect } from "react";
import {
  Radar,
  Search,
  Filter,
  BarChart3,
  Bookmark,
  PlusCircle,
  Globe,
  Share2,
  Calendar,
  Users,
  Eye,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Layers,
  Utensils,
  Bike,
  Car,
  Cross,
  Smartphone,
  Gamepad2,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Database,
  Cloud,
  Terminal,
  Zap,
  Info
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface Company {
  id: string;
  name: string;
  slug: string;
  industry: string;
  tagline: string | null;
  logoColor: string;
  logoIcon: string;
  website: string | null;
  country: string;
  activeAdsCount: number;
}

interface Ad {
  id: string;
  companyId: string;
  company: Company;
  headline: string;
  bodyText: string;
  callToAction: string;
  platform: string;
  format: string;
  offerType: string;
  offerBadge: string | null;
  accentGradient: string;
  estimatedReach: number;
  daysActive: number;
  isActive: boolean;
  targetAudience: string;
  createdAt: string;
}

interface Board {
  id: string;
  title: string;
  description: string | null;
  colorTag: string;
  items: {
    id: string;
    ad: Ad;
    userNote: string | null;
  }[];
}

const INDUSTRIES = [
  { id: "all", label: "Todas las Industrias", icon: Layers },
  { id: "food", label: "🍔 Comida Rápida (KFC, Arturo's)", icon: Utensils },
  { id: "delivery", label: "🛵 Delivery (PedidosYa, Yummy)", icon: Bike },
  { id: "mobility", label: "🚕 Movilidad (Ridery)", icon: Car },
  { id: "pharmacy", label: "💊 Farmacias (Farmatodo, Locatel)", icon: Cross },
  { id: "tech", label: "💻 Tecnología (Apple, Samsung)", icon: Smartphone },
  { id: "gaming", label: "🎮 Gaming (PlayStation, Xbox)", icon: Gamepad2 },
];

const PLATFORMS = [
  { id: "all", label: "Todas las Plataformas" },
  { id: "INSTAGRAM", label: "Instagram" },
  { id: "TIKTOK", label: "TikTok" },
  { id: "FACEBOOK", label: "Facebook" },
  { id: "GOOGLE_ADS", label: "Google Ads" },
];

const OFFER_TYPES = [
  { id: "all", label: "Todas las Ofertas" },
  { id: "COMBO", label: "Combos Especiales" },
  { id: "DISCOUNT", label: "Descuento en %" },
  { id: "TWO_FOR_ONE", label: "Promoción 2x1" },
  { id: "FREE_DELIVERY", label: "Envío Gratis" },
  { id: "NEW_LAUNCH", label: "Lanzamiento Nuevo" },
  { id: "BUNDLE", label: "Paquete / Regalo" },
];

export default function AdRadarApp() {
  const [activeTab, setActiveTab] = useState<"radar" | "compare" | "boards" | "new_ad" | "deployment">("radar");
  const [ads, setAds] = useState<Ad[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedOfferType, setSelectedOfferType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Comparador Head-to-Head
  const [compareA, setCompareA] = useState<string>("");
  const [compareB, setCompareB] = useState<string>("");
  const [compareResult, setCompareResult] = useState<any>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Formulario Nuevo Anuncio
  const [newAdCompanyId, setNewAdCompanyId] = useState("");
  const [newAdHeadline, setNewAdHeadline] = useState("");
  const [newAdBody, setNewAdBody] = useState("");
  const [newAdOfferType, setNewAdOfferType] = useState("COMBO");
  const [newAdBadge, setNewAdBadge] = useState("");
  const [newAdPlatform, setNewAdPlatform] = useState("INSTAGRAM");
  const [newAdCta, setNewAdCta] = useState("ORDER_NOW");
  const [formSuccess, setFormSuccess] = useState(false);

  // Carga inicial de datos
  useEffect(() => {
    fetchData();
  }, [selectedIndustry, selectedCompany, selectedPlatform, selectedOfferType, searchQuery]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedIndustry !== "all") params.append("industry", selectedIndustry);
      if (selectedCompany !== "all") params.append("company", selectedCompany);
      if (selectedPlatform !== "all") params.append("platform", selectedPlatform);
      if (selectedOfferType !== "all") params.append("offerType", selectedOfferType);
      if (searchQuery.trim() !== "") params.append("search", searchQuery);

      const [adsRes, compRes, boardsRes] = await Promise.all([
        fetch(`/api/ads?${params.toString()}`),
        fetch("/api/companies"),
        fetch("/api/boards"),
      ]);

      const adsData = await adsRes.json();
      const compData = await compRes.json();
      const boardsData = await boardsRes.json();

      setAds(adsData.ads || []);
      setCompanies(compData.companies || []);
      setBoards(boardsData.boards || []);

      if (compData.companies?.length >= 2 && !compareA && !compareB) {
        // Inicializar con Arturo's y KFC si existen
        const art = compData.companies.find((c: any) => c.slug === "arturos") || compData.companies[0];
        const kf = compData.companies.find((c: any) => c.slug === "kfc") || compData.companies[1];
        setCompareA(art.id);
        setCompareB(kf.id);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  }

  // Ejecutar comparador
  useEffect(() => {
    if (activeTab === "compare" && compareA && compareB && compareA !== compareB) {
      runComparison(compareA, compareB);
    }
  }, [activeTab, compareA, compareB]);

  async function runComparison(idA: string, idB: string) {
    setCompareLoading(true);
    try {
      const res = await fetch(`/api/compare?companyA=${idA}&companyB=${idB}`);
      const data = await res.json();
      setCompareResult(data);
    } catch (err) {
      console.error("Error en comparativa:", err);
    } finally {
      setCompareLoading(false);
    }
  }

  async function handleSaveAdToBoard(adId: string) {
    if (boards.length === 0) return;
    try {
      await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_ad",
          boardId: boards[0].id,
          adId,
          userNote: "Guardado para análisis de campaña competitiva",
        }),
      });
      fetchData();
      alert("¡Anuncio guardado exitosamente en tu Tablero de Inspiración!");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateAd(e: React.FormEvent) {
    e.preventDefault();
    if (!newAdCompanyId || !newAdHeadline || !newAdBody) {
      alert("Por favor completa los campos requeridos");
      return;
    }
    try {
      await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: newAdCompanyId,
          headline: newAdHeadline,
          bodyText: newAdBody,
          offerType: newAdOfferType,
          offerBadge: newAdBadge || undefined,
          platform: newAdPlatform,
          callToAction: newAdCta,
        }),
      });
      setFormSuccess(true);
      setNewAdHeadline("");
      setNewAdBody("");
      setNewAdBadge("");
      fetchData();
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-slate-100">

      {/* BARRA SUPERIOR DE NAVEGACIÓN */}
      <header className="sticky top-0 z-50 bg-[#0A0F1D]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Radar className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white font-mono">
                  Ad<span className="text-cyan-400">Radar</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-slate-400">Inteligencia Competitiva de Anuncios y Ofertas</p>
            </div>
          </div>

          {/* Menú de Navegación de Pestañas */}
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("radar")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "radar"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Search className="w-4 h-4" />
              Radar de Anuncios
            </button>

            <button
              onClick={() => setActiveTab("compare")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "compare"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Comparador (KFC vs Arturo&apos;s)
            </button>

            <button
              onClick={() => setActiveTab("boards")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "boards"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Tableros de Ideas ({boards[0]?.items?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab("new_ad")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "new_ad"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Registrar Anuncio
            </button>

            <button
              onClick={() => setActiveTab("deployment")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "deployment"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              <Cloud className="w-4 h-4" />
              Despliegue & URL Pública
            </button>
          </nav>

          {/* Badge de PostgreSQL */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">PostgreSQL Activo</span>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">

        {/* 1. VISTA: RADAR DE ANUNCIOS (FEED MULTIMARCA) */}
        {activeTab === "radar" && (
          <div className="space-y-6">

            {/* Banner Informativo */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
              <div className="relative z-10 max-w-3xl">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  Monitorización Publicitaria en Tiempo Real
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Descubre qué campañas, ofertas y copys están usando tus competidores
                </h1>
                <p className="text-sm text-slate-400 mt-2">
                  Monitorea marcas líderes: Compara promociones de <strong>KFC</strong> frente a <strong>Arturo&apos;s</strong>,
                  estrategias de <strong>PedidosYa</strong> vs <strong>Yummy</strong>, o lanzamientos de <strong>Apple</strong> vs <strong>Samsung</strong>.
                </p>
              </div>

              {/* Contadores Rápidos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Anuncios en Base de Datos</p>
                  <p className="text-2xl font-black text-white mt-1">{ads.length}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Marcas Monitoreadas</p>
                  <p className="text-2xl font-black text-cyan-400 mt-1">{companies.length}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Industrias Cubiertas</p>
                  <p className="text-2xl font-black text-indigo-400 mt-1">6 Sectores</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Base de Datos</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">PostgreSQL 17</p>
                </div>
              </div>
            </div>

            {/* BARRA DE FILTROS */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-3">
                {/* Buscador de texto */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por marca, titular, copy ('pollo', '2x1', 'envío gratis', 'balde')..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Filtro Marca */}
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">Todas las Marcas</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name} ({c.activeAdsCount} anuncios)
                    </option>
                  ))}
                </select>

                {/* Filtro Plataforma */}
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>

                {/* Filtro Tipo de Oferta */}
                <select
                  value={selectedOfferType}
                  onChange={(e) => setSelectedOfferType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {OFFER_TYPES.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Chips de Industria */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {INDUSTRIES.map((ind) => {
                  const Icon = ind.icon;
                  const isSelected = selectedIndustry === ind.id;
                  return (
                    <button
                      key={ind.id}
                      onClick={() => {
                        setSelectedIndustry(ind.id);
                        setSelectedCompany("all");
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        isSelected
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {ind.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GRILLA DE ANUNCIOS */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-400">Consultando base de datos PostgreSQL...</p>
              </div>
            ) : ads.length === 0 ? (
              <div className="py-20 text-center p-8 rounded-2xl bg-slate-900/40 border border-slate-800">
                <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-base font-bold text-white">No se encontraron anuncios con los filtros aplicados</p>
                <p className="text-xs text-slate-400 mt-1">Prueba cambiando la industria o limpiando el texto de búsqueda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden group shadow-lg"
                  >
                    {/* Header de la Tarjeta: Marca e Industria */}
                    <div className="p-4 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/40">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white"
                          style={{ backgroundColor: ad.company.logoColor }}
                        >
                          {ad.company.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white">{ad.company.name}</span>
                            <span className="text-[10px] text-slate-400">• {ad.company.country}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{ad.company.tagline}</span>
                        </div>
                      </div>

                      {/* Badge de Oferta */}
                      {ad.offerBadge && (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {ad.offerBadge}
                        </span>
                      )}
                    </div>

                    {/* Arte Visual del Anuncio (Simulación Creativa) */}
                    <div className={`h-40 bg-gradient-to-br ${ad.accentGradient} p-5 flex flex-col justify-between relative overflow-hidden`}>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-black/40 backdrop-blur-md text-white rounded-md">
                          {ad.platform} • {ad.format}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-white/90 bg-black/30 px-2 py-0.5 rounded-md">
                          <Calendar className="w-3 h-3" />
                          Activo hace {ad.daysActive}d
                        </span>
                      </div>

                      <div>
                        <p className="text-white font-black text-base drop-shadow-md line-clamp-2">
                          {ad.headline}
                        </p>
                      </div>
                    </div>

                    {/* Copy Publicitario (Texto) */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Copy Publicitario (Creativo)
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                          {ad.bodyText}
                        </p>
                      </div>

                      {/* Métricas estimadas */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          ~{ad.estimatedReach.toLocaleString()} personas
                        </span>
                        <span className="text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Campaña Activa
                        </span>
                      </div>

                      {/* Botones de Acción */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleSaveAdToBoard(ad.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                          Guardar Idea
                        </button>

                        <a
                          href={ad.company.website || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all"
                          title="Ver web de la marca"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. VISTA: COMPARADOR HEAD-TO-HEAD (KFC vs ARTURO'S, etc.) */}
        {activeTab === "compare" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                <BarChart3 className="w-3.5 h-3.5" />
                Benchmark Estratégico Frente a Frente
              </span>
              <h2 className="text-2xl font-black text-white">Comparador Competitivo Directo</h2>
              <p className="text-xs text-slate-400 mt-1">
                Selecciona dos marcas rivales y analiza sus estrategias de precios, ofertas más agresivas y canales de difusión.
              </p>

              {/* Selectores de Marcas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Empresa A (Referencia)</label>
                  <select
                    value={compareA}
                    onChange={(e) => setCompareA(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-cyan-500"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id} disabled={c.id === compareB}>
                        {c.name} ({c.industry.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Empresa B (Competidor)</label>
                  <select
                    value={compareB}
                    onChange={(e) => setCompareB(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id} disabled={c.id === compareA}>
                        {c.name} ({c.industry.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Resultados de la Comparativa */}
            {compareLoading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400">Analizando métricas en PostgreSQL...</p>
              </div>
            ) : compareResult ? (
              <div className="space-y-6">

                {/* Insight Estratégico */}
                {compareResult.pairInsight && (
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3">
                    <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wide">
                        Diagnóstico Competitivo de Inteligencia
                      </h4>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                        {compareResult.pairInsight}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tarjetas Frente a Frente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Marca A */}
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white"
                        style={{ backgroundColor: compareResult.companyA.logoColor }}
                      >
                        {compareResult.companyA.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-white">{compareResult.companyA.name}</h3>
                        <p className="text-xs text-slate-400">{compareResult.companyA.tagline}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Anuncios Activos</span>
                        <p className="text-xl font-black text-white mt-0.5">{compareResult.companyA.ads?.length || 0}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Alcance Estimado</span>
                        <p className="text-xl font-black text-cyan-400 mt-0.5">
                          ~{(compareResult.companyA.totalReach / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>

                    {/* Lista de Anuncios Recientes de A */}
                    <div>
                      <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Campañas Activas</h5>
                      <div className="space-y-2">
                        {compareResult.companyA.ads?.map((ad: any) => (
                          <div key={ad.id} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs">
                            <span className="font-bold text-white block">{ad.headline}</span>
                            <span className="text-[10px] text-amber-400 font-semibold">{ad.offerBadge}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Marca B */}
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white"
                        style={{ backgroundColor: compareResult.companyB.logoColor }}
                      >
                        {compareResult.companyB.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-white">{compareResult.companyB.name}</h3>
                        <p className="text-xs text-slate-400">{compareResult.companyB.tagline}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Anuncios Activos</span>
                        <p className="text-xl font-black text-white mt-0.5">{compareResult.companyB.ads?.length || 0}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Alcance Estimado</span>
                        <p className="text-xl font-black text-indigo-400 mt-0.5">
                          ~{(compareResult.companyB.totalReach / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>

                    {/* Lista de Anuncios Recientes de B */}
                    <div>
                      <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Campañas Activas</h5>
                      <div className="space-y-2">
                        {compareResult.companyB.ads?.map((ad: any) => (
                          <div key={ad.id} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs">
                            <span className="font-bold text-white block">{ad.headline}</span>
                            <span className="text-[10px] text-amber-400 font-semibold">{ad.offerBadge}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gráfico Comparativo de Alcance */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4">
                    Comparativa de Alcance Total Estimado de Audiencia
                  </h4>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: compareResult.companyA.name, reach: compareResult.companyA.totalReach, fill: "#00F0FF" },
                          { name: compareResult.companyB.name, reach: compareResult.companyB.totalReach, fill: "#6366F1" },
                        ]}
                      >
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                        <YAxis stroke="#94A3B8" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px" }}
                          itemStyle={{ color: "#FFF", fontSize: "12px" }}
                        />
                        <Bar dataKey="reach" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        )}

        {/* 3. VISTA: TABLEROS DE INSPIRACIÓN / SWIPE FILE */}
        {activeTab === "boards" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase">Swipe File & Colecciones</span>
                <h2 className="text-2xl font-black text-white mt-1">Tableros de Ideas Guardadas</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Guarda los mejores ganchos publicitarios y ofertas de la competencia para inspirar tus próximas campañas.
                </p>
              </div>
            </div>

            {boards.length === 0 ? (
              <div className="py-20 text-center p-8 rounded-2xl bg-slate-900/40 border border-slate-800">
                <Bookmark className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-white">No tienes tableros creados aún</p>
              </div>
            ) : (
              <div className="space-y-8">
                {boards.map((b) => (
                  <div key={b.id} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-black text-white">{b.title}</h3>
                        <p className="text-xs text-slate-400">{b.description}</p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {b.items.length} ideas guardadas
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                      {b.items.map((item) => (
                        <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold text-cyan-400">{item.ad.company.name}</span>
                              <span className="text-[10px] text-slate-500">• {item.ad.platform}</span>
                            </div>
                            <h4 className="text-xs font-bold text-white">{item.ad.headline}</h4>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-3">{item.ad.bodyText}</p>
                          </div>

                          {item.userNote && (
                            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-200">
                              💡 Nota: {item.userNote}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. VISTA: REGISTRAR NUEVO ANUNCIO DE COMPETENCIA */}
        {activeTab === "new_ad" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h2 className="text-2xl font-black text-white">Registrar Anuncio de Competidor</h2>
              <p className="text-xs text-slate-400 mt-1">
                Agrega anuncios detectados de cualquier marca para alimentar la base de datos de PostgreSQL.
              </p>

              {formSuccess && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  ¡Anuncio guardado con éxito en la base de datos PostgreSQL!
                </div>
              )}

              <form onSubmit={handleCreateAd} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Empresa / Marca *</label>
                  <select
                    value={newAdCompanyId}
                    onChange={(e) => setNewAdCompanyId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Selecciona una empresa...</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.industry.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Titular del Anuncio / Gancho *</label>
                  <input
                    type="text"
                    value={newAdHeadline}
                    onChange={(e) => setNewAdHeadline(e.target.value)}
                    required
                    placeholder="ej: ¡Mega Balde de 8 Piezas con papas y refrescos por $9.99!"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Texto del Copy Publicitario *</label>
                  <textarea
                    rows={4}
                    value={newAdBody}
                    onChange={(e) => setNewAdBody(e.target.value)}
                    required
                    placeholder="El texto persuasivo completo utilizado en el anuncio..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Tipo de Oferta</label>
                    <select
                      value={newAdOfferType}
                      onChange={(e) => setNewAdOfferType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="COMBO">Combo Especial</option>
                      <option value="DISCOUNT">Descuento %</option>
                      <option value="TWO_FOR_ONE">Promoción 2x1</option>
                      <option value="FREE_DELIVERY">Envío Gratis</option>
                      <option value="NEW_LAUNCH">Lanzamiento Nuevo</option>
                      <option value="BUNDLE">Paquete / Regalo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Badge / Etiqueta de Oferta</label>
                    <input
                      type="text"
                      value={newAdBadge}
                      onChange={(e) => setNewAdBadge(e.target.value)}
                      placeholder="ej: 50% OFF, 2x1, $9.99"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Plataforma</label>
                    <select
                      value={newAdPlatform}
                      onChange={(e) => setNewAdPlatform(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="TIKTOK">TikTok</option>
                      <option value="FACEBOOK">Facebook</option>
                      <option value="GOOGLE_ADS">Google Ads</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Llamada a la Acción (CTA)</label>
                    <select
                      value={newAdCta}
                      onChange={(e) => setNewAdCta(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="ORDER_NOW">Pedir Ahora</option>
                      <option value="GET_OFFER">Obtener Oferta</option>
                      <option value="INSTALL_APP">Instalar App</option>
                      <option value="LEARN_MORE">Más Información</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Guardar Anuncio en PostgreSQL
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 5. VISTA: GUÍA DE DESPLIEGUE EN PRODUCCIÓN (VERCEL & CLOUD POSTGRESQL) */}
        {activeTab === "deployment" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/30 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-2">
                <Cloud className="w-4 h-4" />
                Guía de Producción & Despliegue en la Nube
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Cómo desplegar AdRadar en Internet con su Propia URL Pública
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                Has pedido aprender cómo llevar este proyecto de tu laptop a <strong>producción real en la nube</strong> para que
                cualquier cliente o empresa pueda acceder desde su celular o computadora con un enlace público (ej. <code className="text-cyan-400 bg-slate-950 px-2 py-0.5 rounded">https://adradar.vercel.app</code> o tu propio dominio <code className="text-cyan-400 bg-slate-950 px-2 py-0.5 rounded">https://adradar.com</code>).
              </p>
            </div>

            {/* Los 3 Pasos de Producción */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Paso 1 */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-sm">
                  1
                </div>
                <h3 className="font-bold text-white text-sm">Base de Datos PostgreSQL en la Nube</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para que la base de datos no viva solo en tu laptop cuando se apague, se crea una base de datos PostgreSQL gratuita en <strong>Neon.tech</strong> o <strong>Supabase</strong>.
                </p>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <p>1. Entras a <a href="https://neon.tech" target="_blank" rel="noreferrer" className="text-cyan-400 underline">neon.tech</a></p>
                  <p>2. Creas un proyecto gratuito llamado <code>adradar-db</code></p>
                  <p>3. Copias tu <code>DATABASE_URL</code> con SSL.</p>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-sm">
                  2
                </div>
                <h3 className="font-bold text-white text-sm">Repositorio en GitHub</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  El código ya lo tenemos integrado y vinculado a tu repositorio oficial de GitHub:
                </p>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1 font-mono">
                  <p className="text-cyan-400">git add .</p>
                  <p className="text-cyan-400">git commit -m &quot;feat: adradar saas&quot;</p>
                  <p className="text-cyan-400">git push origin main</p>
                </div>
                <p className="text-[11px] text-slate-500">
                  Vercel lee directamente desde este repositorio de GitHub automáticamente.
                </p>
              </div>

              {/* Paso 3 */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">
                  3
                </div>
                <h3 className="font-bold text-white text-sm">Conectar con Vercel (1 Clic)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Entras a <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">vercel.com</a>, inicias con tu cuenta de GitHub y seleccionas el repositorio.
                </p>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <p>1. Click en <strong>&quot;Add New Project&quot;</strong></p>
                  <p>2. Pegas tu variable <code>DATABASE_URL</code></p>
                  <p>3. Click en <strong>&quot;Deploy&quot;</strong></p>
                </div>
                <p className="text-[11px] text-emerald-400 font-semibold">
                  ¡Listo! En 1 minuto tendrás tu enlace mundial HTTPS con CDN global.
                </p>
              </div>

            </div>

            {/* Diagrama de Arquitectura de Producción */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="font-black text-white text-sm uppercase tracking-wider">
                ¿Qué hace que un entorno de producción soporte miles de usuarios?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <Globe className="w-5 h-5 text-cyan-400 mb-2" />
                  <h4 className="font-bold text-xs text-white">Edge Caching & CDN</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Vercel distribuye la página web en más de 300 ciudades del mundo. Cuando un usuario de España, México o Venezuela entra, carga en milisegundos.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <Zap className="w-5 h-5 text-amber-400 mb-2" />
                  <h4 className="font-bold text-xs text-white">Serverless Auto-Scaling</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Si entran 10 personas o 100,000 personas al mismo tiempo, los servidores en la nube se multiplican al instante sin que el sitio se caiga.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <Database className="w-5 h-5 text-emerald-400 mb-2" />
                  <h4 className="font-bold text-xs text-white">Connection Pooling en PostgreSQL</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Prisma ORM y Neon usan un multiplexor de conexiones para que miles de consultas simultáneas no saturen la memoria de la base de datos.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 AdRadar Enterprise — Desarrollado por Ángel David Morillo García</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Next.js 16</span>
            <span>•</span>
            <span>PostgreSQL 17</span>
            <span>•</span>
            <span>Prisma ORM</span>
            <span>•</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
