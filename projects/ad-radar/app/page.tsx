"use client";

import { useState, useEffect } from "react";
import {
  Radar,
  Search,
  BarChart3,
  Bookmark,
  PlusCircle,
  Globe,
  Calendar,
  Users,
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
  Info,
  Copy,
  Check,
  Star,
  ArrowRight,
  ShieldCheck,
  X,
  User,
  LogIn,
  LogOut,
  Lock,
  Mail,
  Building2,
  KeyRound,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string | null;
  avatarColor: string;
}

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
  user?: {
    name: string;
    company: string | null;
    avatarColor: string;
  } | null;
  items: {
    id: string;
    ad: Ad;
    userNote: string | null;
  }[];
}

const INDUSTRIES = [
  { id: "all", label: "Todas las Industrias", icon: Layers },
  { id: "food", label: "Comida Rápida (KFC, Arturo's)", icon: Utensils, emoji: "🍗" },
  { id: "delivery", label: "Delivery (PedidosYa, Yummy)", icon: Bike, emoji: "🛵" },
  { id: "mobility", label: "Movilidad (Ridery, Yango)", icon: Car, emoji: "🚕" },
  { id: "pharmacy", label: "Farmacias (Farmatodo, Locatel)", icon: Cross, emoji: "💊" },
  { id: "tech", label: "Tecnología (Apple, Samsung)", icon: Smartphone, emoji: "💻" },
  { id: "gaming", label: "Gaming (PlayStation, Xbox)", icon: Gamepad2, emoji: "🎮" },
];

const PLATFORMS = [
  { id: "all", label: "Todas las Plataformas" },
  { id: "INSTAGRAM", label: "Instagram Ads" },
  { id: "TIKTOK", label: "TikTok Ads" },
  { id: "FACEBOOK", label: "Facebook Feed" },
  { id: "GOOGLE_ADS", label: "Google Ads" },
];

const OFFER_TYPES = [
  { id: "all", label: "Todos los Tipos de Oferta" },
  { id: "COMBO", label: "Combos Especiales" },
  { id: "DISCOUNT", label: "Descuento en %" },
  { id: "TWO_FOR_ONE", label: "Promoción 2x1" },
  { id: "FREE_DELIVERY", label: "Envío Gratis" },
  { id: "NEW_LAUNCH", label: "Lanzamiento Nuevo" },
  { id: "BUNDLE", label: "Paquete / Regalo" },
];

const DUEL_PRESETS = [
  { label: "🍗 KFC vs Arturo's", slugA: "kfc", slugB: "arturos", industry: "Fast Food" },
  { label: "🛵 PedidosYa vs Yummy", slugA: "pedidosya", slugB: "yummy", industry: "Delivery" },
  { label: "🚕 Ridery vs Yango", slugA: "ridery", slugB: "yango", industry: "Movilidad" },
  { label: "💊 Farmatodo vs Locatel", slugA: "farmatodo", slugB: "locatel", industry: "Salud" },
  { label: "💻 Apple vs Samsung", slugA: "apple", slugB: "samsung", industry: "Tecnología" },
  { label: "🎮 PlayStation vs Xbox", slugA: "playstation", slugB: "xbox", industry: "Gaming" },
];

function getSafeUrl(url: string | null): string {
  if (!url) return "#";
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // fallback seguro
  }
  return "#";
}

export default function AdRadarApp() {
  const [activeTab, setActiveTab] = useState<"radar" | "compare" | "boards" | "new_ad" | "deployment">("radar");
  const [ads, setAds] = useState<Ad[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  // Autenticación de Usuario
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authCompany, setAuthCompany] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Filtros
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedOfferType, setSelectedOfferType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }

  // Verificar sesión activa al montar
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error("Error al verificar sesión:", err);
    }
  }

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
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const resAds = await fetch(`/api/ads?${params.toString()}`);
      const dataAds = await resAds.json();
      setAds(dataAds.ads || []);

      const resComp = await fetch("/api/companies");
      const dataComp = await resComp.json();
      setCompanies(dataComp.companies || []);

      const resBoards = await fetch("/api/boards");
      const dataBoards = await resBoards.json();
      setBoards(dataBoards.boards || []);

      // Auto-seleccionar primer duelo si no hay selección
      if (!compareA && dataComp.companies?.length >= 2) {
        const kfc = dataComp.companies.find((c: Company) => c.slug === "kfc");
        const arturos = dataComp.companies.find((c: Company) => c.slug === "arturos");
        if (kfc && arturos) {
          setCompareA(kfc.id);
          setCompareB(arturos.id);
        } else {
          setCompareA(dataComp.companies[0].id);
          setCompareB(dataComp.companies[1].id);
        }
      }
    } catch (err) {
      console.error("Error cargando datos de PostgreSQL:", err);
    } finally {
      setLoading(false);
    }
  }

  // Comparador
  useEffect(() => {
    if (compareA && compareB && compareA !== compareB) {
      handleRunCompare(compareA, compareB);
    }
  }, [compareA, compareB]);

  async function handleRunCompare(idA: string, idB: string) {
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

  function handleQuickDuelSelect(slugA: string, slugB: string) {
    const compA = companies.find((c) => c.slug === slugA);
    const compB = companies.find((c) => c.slug === slugB);
    if (compA && compB) {
      setCompareA(compA.id);
      setCompareB(compB.id);
      setActiveTab("compare");
      showToast(`Cargando duelo: ${compA.name} vs ${compB.name}`);
    }
  }

  async function handleSaveAdToBoard(adId: string) {
    if (!currentUser && boards.length === 0) {
      setAuthMode("register");
      setAuthModalOpen(true);
      showToast("🔐 Crea una cuenta o inicia sesión para guardar en tu Swipe File");
      return;
    }

    try {
      const targetBoard = boards[0];
      await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_ad",
          boardId: targetBoard ? targetBoard.id : undefined,
          adId,
          userNote: currentUser
            ? `Guardado por ${currentUser.name} (${currentUser.company || "Analista"})`
            : "Guardado para análisis de campaña competitiva",
        }),
      });
      fetchData();
      showToast("⭐ ¡Anuncio guardado exitosamente en tu Swipe File!");
    } catch (err) {
      console.error(err);
      showToast("Error al guardar en el tablero");
    }
  }

  function handleCopyCopyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("📋 Copy creativo copiado al portapapeles!");
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  }

  async function handleCreateAd(e: React.FormEvent) {
    e.preventDefault();
    if (!newAdCompanyId || !newAdHeadline || !newAdBody) {
      showToast("⚠️ Por favor completa los campos requeridos");
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
      showToast("🚀 ¡Anuncio indexado con éxito en PostgreSQL!");
      setTimeout(() => setFormSuccess(false), 3500);
    } catch (err) {
      console.error(err);
      showToast("Error al guardar anuncio en PostgreSQL");
    }
  }

  // Manejadores de Autenticación
  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const endpoint = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload = authMode === "register"
        ? { name: authName, email: authEmail, password: authPassword, company: authCompany }
        : { email: authEmail, password: authPassword };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Ocurrió un error en la autenticación");
        return;
      }

      setCurrentUser(data.user);
      setAuthModalOpen(false);
      setAuthPassword("");
      showToast(`✨ ¡Bienvenido/a, ${data.user.name}! Sesión iniciada con éxito.`);
      fetchData();
    } catch (err) {
      setAuthError("Error de conexión al servidor");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      showToast("Has cerrado sesión exitosamente");
      fetchData();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  }

  function handleQuickDemoLogin(email: string) {
    setAuthEmail(email);
    setAuthPassword("123456");
    setAuthMode("login");
    setAuthError(null);
  }

  const selectedCompanyForPreview = companies.find((c) => c.id === newAdCompanyId) || companies[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#070A13] text-slate-100 selection:bg-indigo-500 selection:text-white">

      {/* TOAST FLOTANTE */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 border border-indigo-500/50 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl text-white text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MODAL DE AUTENTICACIÓN / REGISTRO / LOGIN */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0A0E1A] border border-slate-800 p-6 md:p-8 space-y-6 shadow-2xl relative">

            {/* Botón Cerrar */}
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Cabecera del Modal */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 mx-auto shadow-lg shadow-indigo-500/30">
                <div className="w-full h-full bg-[#070A13] rounded-[14px] flex items-center justify-center">
                  <Lock className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {authMode === "register" ? "Crear Cuenta de Analista" : "Iniciar Sesión"}
              </h3>
              <p className="text-xs text-slate-400">
                {authMode === "register"
                  ? "Acceso seguro a tableros privados, swipe files y auditoría en PostgreSQL."
                  : "Ingresa tus credenciales para acceder a tu entorno seguro."}
              </p>
            </div>

            {/* Selector de Pestañas Registro / Login */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => { setAuthMode("register"); setAuthError(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === "register"
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Crear Cuenta
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setAuthError(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === "login"
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Iniciar Sesión
              </button>
            </div>

            {/* Alerta de Error */}
            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authMode === "register" && (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      required
                      placeholder="ej: Carlos Silva"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                    placeholder="tu@empresa.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Contraseña * (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {authMode === "register" && (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Empresa / Marca u Organización
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={authCompany}
                      onChange={(e) => setAuthCompany(e.target.value)}
                      placeholder="ej: KFC Marketing, Arturo's Agency, Independiente"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 mt-2"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : authMode === "register" ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Crear Cuenta Segura</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Entrar al Sistema</span>
                  </>
                )}
              </button>
            </form>

            {/* Botones de Acceso Rápido con Cuentas Demo */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">
                ⚡ O prueba al instante con una cuenta demo:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("david@adradar.io")}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
                >
                  <span className="text-[11px] font-bold text-white block group-hover:text-cyan-400">David Morillo</span>
                  <span className="text-[10px] text-slate-500 block font-mono">david@adradar.io</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("analista@kfc.com")}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-left transition-all group"
                >
                  <span className="text-[11px] font-bold text-white block group-hover:text-rose-400">Analista KFC</span>
                  <span className="text-[10px] text-slate-500 block font-mono">analista@kfc.com</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* BARRA SUPERIOR DE NAVEGACIÓN CORPORATIVA */}
      <header className="sticky top-0 z-40 bg-[#0A0E1A]/85 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Logo & Identidad de Marca */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-blue-500 p-0.5 shadow-lg shadow-indigo-500/25">
                <div className="w-full h-full bg-[#070A13] rounded-[10px] flex items-center justify-center">
                  <Radar className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl tracking-tight text-white">
                    Ad<span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Radar</span>
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 text-cyan-300 border border-cyan-500/30 rounded-md tracking-wider">
                    ENTERPRISE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Inteligencia Competitiva de Anuncios y Ofertas</p>
              </div>
            </div>

            {/* Status en móvil */}
            <div className="md:hidden flex items-center gap-2">
              {currentUser ? (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-slate-950 font-bold"
                  style={{ backgroundColor: currentUser.avatarColor || "#00D2EF" }}
                >
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
              ) : (
                <button
                  onClick={() => { setAuthMode("login"); setAuthModalOpen(true); }}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Entrar
                </button>
              )}
            </div>
          </div>

          {/* Segmented Control de Pestañas */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 shadow-inner overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab("radar")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === "radar"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Radar de Anuncios
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-white/90">
                {ads.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("compare")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === "compare"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Comparador (KFC vs Arturo's)
            </button>

            <button
              onClick={() => setActiveTab("boards")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === "boards"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Swipe File ({boards[0]?.items?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab("new_ad")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === "new_ad"
                  ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Registrar
            </button>

            <button
              onClick={() => setActiveTab("deployment")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === "deployment"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold"
                  : "text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10"
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              Despliegue & URL
            </button>
          </nav>

          {/* Área de Usuario & Conexión DB */}
          <div className="hidden md:flex items-center gap-3">
            {/* Status de PostgreSQL */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">PostgreSQL 17</span>
            </div>

            {/* Estado de Autenticación */}
            {currentUser ? (
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-slate-950 shadow-md"
                  style={{ backgroundColor: currentUser.avatarColor || "#00D2EF" }}
                >
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{currentUser.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                      {currentUser.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">{currentUser.company || "Analista"}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors ml-1"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                <button
                  onClick={() => { setAuthMode("login"); setAuthModalOpen(true); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => { setAuthMode("register"); setAuthModalOpen(true); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-white shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Crear Cuenta
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">

        {/* 1. VISTA: RADAR DE ANUNCIOS (FEED MULTIMARCA) */}
        {activeTab === "radar" && (
          <div className="space-y-6">

            {/* HERO BANNER CORPORATIVO */}
            <div className="relative p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B1021] to-[#0A0D1B] border border-slate-800/80 shadow-2xl overflow-hidden">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  Monitorización Publicitaria B2B en Tiempo Real
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                  Descubre qué campañas, ofertas y creativos están usando tus rivales
                </h1>

                <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                  Monitorea de forma continua las estrategias de tu competencia: Compara ofertas de{" "}
                  <strong className="text-white bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">KFC vs Arturo's</strong>,
                  tácticas de <strong className="text-white bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">PedidosYa vs Yummy</strong>,
                  o campañas de <strong className="text-white bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">Apple vs Samsung</strong>.
                </p>
              </div>

              {/* Contadores Clave de Inteligencia */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8 pt-6 border-t border-slate-800/80">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/70">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>Anuncios Indexados</span>
                    <Radar className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <p className="text-2xl font-black text-white mt-1.5">{ads.length}</p>
                  <p className="text-[10px] text-cyan-400 font-medium mt-0.5">En circulación activa</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/70">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>Marcas Monitoreadas</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <p className="text-2xl font-black text-indigo-300 mt-1.5">{companies.length}</p>
                  <p className="text-[10px] text-indigo-400 font-medium mt-0.5">Líderes de mercado</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/70">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>Sectores Cubiertos</span>
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-2xl font-black text-amber-300 mt-1.5">6 Industrias</p>
                  <p className="text-[10px] text-amber-400 font-medium mt-0.5">Comida, Delivery, Tech...</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/70">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>Base de Datos</span>
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-emerald-300 mt-1.5">PostgreSQL 17</p>
                  <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Persistencia relacional</p>
                </div>
              </div>
            </div>

            {/* ACCESO RÁPIDO A DUELOS COMPETITIVOS */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  Duelos Competitivos Clave (Haz clic para comparar en vivo)
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">Head-to-Head Benchmarks</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {DUEL_PRESETS.map((duel, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickDuelSelect(duel.slugA, duel.slugB)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-800/60 text-xs font-semibold text-slate-200 whitespace-nowrap transition-all duration-200 shadow-sm"
                  >
                    <span>{duel.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {duel.industry}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* BARRA DE FILTROS AVANZADA */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row items-center gap-3">
                {/* Buscador de texto */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por marca, titular o copy ('pollo', '2x1', 'delivery gratis', 'balde')..."
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filtro Marca */}
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full md:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">Todas las Marcas ({companies.length})</option>
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
                  className="w-full md:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-cyan-500"
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
                  className="w-full md:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-cyan-500"
                >
                  {OFFER_TYPES.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Chips de Industria */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
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
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                        isSelected
                          ? "bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm"
                          : "bg-slate-950/80 text-slate-400 border border-slate-800/80 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {ind.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GRILLA DE TARJETAS DE ANUNCIOS */}
            {loading ? (
              <div className="py-24 text-center">
                <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold text-white">Consultando base de datos PostgreSQL...</p>
                <p className="text-xs text-slate-500 mt-1">Obteniendo campañas y creatividades en tiempo real</p>
              </div>
            ) : ads.length === 0 ? (
              <div className="py-20 text-center p-8 rounded-3xl bg-slate-900/40 border border-slate-800">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-base font-bold text-white">No se encontraron anuncios con los filtros aplicados</p>
                <p className="text-xs text-slate-400 mt-1">Prueba cambiando la categoría de industria o limpiando el texto de búsqueda.</p>
                <button
                  onClick={() => {
                    setSelectedIndustry("all");
                    setSelectedCompany("all");
                    setSelectedPlatform("all");
                    setSelectedOfferType("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
                >
                  Restablecer todos los filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="flex flex-col rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300 overflow-hidden group shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10"
                  >
                    {/* Header de la Tarjeta: Marca, Monograma y País */}
                    <div className="p-4 flex items-center justify-between border-b border-slate-800/70 bg-slate-950/60">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-md"
                          style={{ backgroundColor: ad.company.logoColor }}
                        >
                          {ad.company.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white tracking-tight">{ad.company.name}</span>
                            <span className="text-[10px] text-slate-400">• {ad.company.country}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block line-clamp-1">{ad.company.tagline}</span>
                        </div>
                      </div>

                      {/* Badge de Oferta */}
                      {ad.offerBadge && (
                        <span className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm">
                          {ad.offerBadge}
                        </span>
                      )}
                    </div>

                    {/* Arte Visual del Anuncio (Simulación Creativa con Gradiente de Campaña) */}
                    <div className={`h-44 bg-gradient-to-br ${ad.accentGradient} p-5 flex flex-col justify-between relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="px-2.5 py-1 text-[10px] font-extrabold bg-black/50 backdrop-blur-md text-white rounded-lg border border-white/10 uppercase tracking-wider">
                          {ad.platform} • {ad.format}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                          <Calendar className="w-3 h-3" />
                          Hace {ad.daysActive}d
                        </span>
                      </div>

                      <div className="relative z-10">
                        <p className="text-white font-black text-base md:text-lg drop-shadow-lg line-clamp-2 leading-snug">
                          {ad.headline}
                        </p>
                      </div>
                    </div>

                    {/* Cuerpo del Copy Publicitario */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Copy Persuasivo (Creativo)
                          </span>
                          <button
                            onClick={() => handleCopyCopyText(ad.bodyText, ad.id)}
                            className="text-[11px] font-semibold text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                          >
                            {copiedId === ad.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">¡Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 line-clamp-4 font-normal">
                          &ldquo;{ad.bodyText}&rdquo;
                        </p>
                      </div>

                      {/* Métricas estimadas de Audiencia */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          ~{ad.estimatedReach.toLocaleString()} alcance est.
                        </span>
                        <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          Activo en Campaña
                        </span>
                      </div>

                      {/* Botones de Acción */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleSaveAdToBoard(ad.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all duration-200 border border-slate-700/60 shadow-sm"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                          Guardar Idea
                        </button>

                        <a
                          href={getSafeUrl(ad.company.website)}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold transition-all shadow-md shadow-cyan-500/20"
                          title="Visitar web oficial de la marca"
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

        {/* 2. VISTA: COMPARADOR HEAD-TO-HEAD */}
        {activeTab === "compare" && (
          <div className="space-y-6">

            {/* Cabecera del Comparador */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 mb-3">
                <BarChart3 className="w-3.5 h-3.5" />
                Benchmark Estratégico Frente a Frente
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Comparador Competitivo Directo
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Selecciona dos marcas rivales para contrastar en tiempo real su volumen de anuncios, tácticas de descuento agresivas y canales de distribución.
              </p>

              {/* Botones de Duelo Rápido */}
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Duelos Predeterminados:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {DUEL_PRESETS.map((duel, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickDuelSelect(duel.slugA, duel.slugB)}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 text-xs font-semibold text-slate-300 whitespace-nowrap transition-all"
                    >
                      {duel.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selectores de Marcas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <label className="text-xs font-bold text-cyan-400 block mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Marca A (Tu Empresa o Referencia)
                  </label>
                  <select
                    value={compareA}
                    onChange={(e) => setCompareA(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-cyan-500"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id} disabled={c.id === compareB}>
                        {c.name} ({c.industry.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <label className="text-xs font-bold text-indigo-400 block mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    Marca B (Tu Competidor Directo)
                  </label>
                  <select
                    value={compareB}
                    onChange={(e) => setCompareB(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
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
                <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-bold text-white">Analizando métricas y copys en PostgreSQL...</p>
              </div>
            ) : compareResult ? (
              <div className="space-y-6">

                {/* Insight Estratégico AI */}
                {compareResult.pairInsight && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/40 flex items-start gap-3 shadow-lg">
                    <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wider">
                        Diagnóstico Estratégico de Inteligencia Competitiva
                      </h4>
                      <p className="text-xs md:text-sm text-slate-200 mt-1.5 leading-relaxed">
                        {compareResult.pairInsight}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tarjetas Frente a Frente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Tarjeta Marca A */}
                  <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-lg"
                        style={{ backgroundColor: compareResult.companyA.logoColor }}
                      >
                        {compareResult.companyA.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-white">{compareResult.companyA.name}</h3>
                        <p className="text-xs text-slate-400">{compareResult.companyA.tagline}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Anuncios en Circulación</span>
                        <p className="text-2xl font-black text-white mt-1">{compareResult.companyA.ads?.length || 0}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Alcance Total Estimado</span>
                        <p className="text-2xl font-black text-cyan-400 mt-1">
                          ~{(compareResult.companyA.totalReach / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>

                    {/* Lista de Anuncios de A */}
                    <div className="pt-2">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                        Campañas Activas de {compareResult.companyA.name}
                      </h5>
                      <div className="space-y-2.5">
                        {compareResult.companyA.ads?.map((ad: any) => (
                          <div key={ad.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white block line-clamp-1">{ad.headline}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold">
                                {ad.offerBadge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2">&ldquo;{ad.bodyText}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta Marca B */}
                  <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-lg"
                        style={{ backgroundColor: compareResult.companyB.logoColor }}
                      >
                        {compareResult.companyB.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-white">{compareResult.companyB.name}</h3>
                        <p className="text-xs text-slate-400">{compareResult.companyB.tagline}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Anuncios en Circulación</span>
                        <p className="text-2xl font-black text-white mt-1">{compareResult.companyB.ads?.length || 0}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Alcance Total Estimado</span>
                        <p className="text-2xl font-black text-indigo-400 mt-1">
                          ~{(compareResult.companyB.totalReach / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>

                    {/* Lista de Anuncios de B */}
                    <div className="pt-2">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                        Campañas Activas de {compareResult.companyB.name}
                      </h5>
                      <div className="space-y-2.5">
                        {compareResult.companyB.ads?.map((ad: any) => (
                          <div key={ad.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white block line-clamp-1">{ad.headline}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold">
                                {ad.offerBadge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2">&ldquo;{ad.bodyText}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Gráfico Comparativo de Alcance */}
                <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 shadow-xl">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Comparativa Gráfica de Alcance Total de Audiencia
                  </h4>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: compareResult.companyA.name, reach: compareResult.companyA.totalReach, fill: "#00F0FF" },
                          { name: compareResult.companyB.name, reach: compareResult.companyB.totalReach, fill: "#6366F1" },
                        ]}
                      >
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#070A13", borderColor: "#334155", borderRadius: "12px", color: "#FFF" }}
                          itemStyle={{ color: "#FFF", fontSize: "12px" }}
                        />
                        <Bar dataKey="reach" radius={[10, 10, 0, 0]} />
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
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" />
                  Swipe File Creativo & Colecciones
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white mt-1">Tableros de Ideas Guardadas</h2>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  {currentUser
                    ? `Colección privada de ${currentUser.name} (${currentUser.company || "Analista de Inteligencia"}).`
                    : "Colecciona los mejores ganchos publicitarios, ángulos y copys para inspirar tus próximas campañas."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {!currentUser && (
                  <button
                    onClick={() => { setAuthMode("register"); setAuthModalOpen(true); }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-md"
                  >
                    Crear mi Swipe File Privado
                  </button>
                )}
                <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  {boards[0]?.items?.length || 0} Ideas Guardadas
                </span>
              </div>
            </div>

            {boards.length === 0 || boards[0]?.items?.length === 0 ? (
              <div className="py-20 text-center p-8 rounded-3xl bg-slate-900/40 border border-slate-800">
                <Bookmark className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-base font-bold text-white">No tienes ideas guardadas en tu Swipe File aún</p>
                <p className="text-xs text-slate-400 mt-1">
                  Ve a la pestaña <strong>"Radar de Anuncios"</strong> y haz clic en <strong>"Guardar Idea"</strong> en cualquier anuncio.
                </p>
                <button
                  onClick={() => setActiveTab("radar")}
                  className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Explorar Radar de Anuncios
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {boards.map((b) => (
                  <div key={b.id} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-white">{b.title}</h3>
                          {b.user && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/30">
                              👤 {b.user.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{b.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {b.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 flex flex-col justify-between space-y-3 transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-cyan-400">{item.ad.company.name}</span>
                              <span className="text-[10px] text-slate-500">{item.ad.platform}</span>
                            </div>
                            <h4 className="text-xs font-bold text-white line-clamp-2">{item.ad.headline}</h4>
                            <p className="text-[11px] text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                              &ldquo;{item.ad.bodyText}&rdquo;
                            </p>
                          </div>

                          {item.userNote && (
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
                              💡 {item.userNote}
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

        {/* 4. VISTA: REGISTRAR NUEVO ANUNCIO */}
        {activeTab === "new_ad" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* Formulario */}
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800/80 space-y-6 shadow-2xl">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5" />
                  Indexación en Base de Datos PostgreSQL
                </span>
                <h2 className="text-2xl font-black text-white mt-1">Registrar Anuncio de Competidor</h2>
                <p className="text-xs text-slate-400 mt-1">
                  {currentUser
                    ? `Publicando como: ${currentUser.name} (${currentUser.company || "Analista de Inteligencia"})`
                    : "Agrega nuevos anuncios detectados en redes para nutrir el repositorio competitivo."}
                </p>
              </div>

              {formSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ¡Anuncio guardado con éxito en la base de datos PostgreSQL!
                </div>
              )}

              <form onSubmit={handleCreateAd} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Empresa / Marca Competidora *</label>
                  <select
                    value={newAdCompanyId}
                    onChange={(e) => setNewAdCompanyId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
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
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Titular del Anuncio / Gancho *</label>
                  <input
                    type="text"
                    value={newAdHeadline}
                    onChange={(e) => setNewAdHeadline(e.target.value)}
                    required
                    placeholder="ej: ¡Mega Balde de 8 Piezas con papas por $9.99!"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Texto del Copy Publicitario *</label>
                  <textarea
                    rows={4}
                    value={newAdBody}
                    onChange={(e) => setNewAdBody(e.target.value)}
                    required
                    placeholder="El texto persuasivo completo utilizado en el anuncio..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Tipo de Oferta</label>
                    <select
                      value={newAdOfferType}
                      onChange={(e) => setNewAdOfferType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
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
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Badge de Oferta</label>
                    <input
                      type="text"
                      value={newAdBadge}
                      onChange={(e) => setNewAdBadge(e.target.value)}
                      placeholder="ej: 50% OFF, 2x1, $9.99"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Plataforma</label>
                    <select
                      value={newAdPlatform}
                      onChange={(e) => setNewAdPlatform(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="TIKTOK">TikTok</option>
                      <option value="FACEBOOK">Facebook</option>
                      <option value="GOOGLE_ADS">Google Ads</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Llamada a la Acción (CTA)</label>
                    <select
                      value={newAdCta}
                      onChange={(e) => setNewAdCta(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
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
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-rose-600/20"
                >
                  Indexar en PostgreSQL
                </button>
              </form>
            </div>

            {/* Vista Previa en Vivo */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                👁️ Vista Previa en Tiempo Real
              </span>

              <div className="rounded-3xl bg-slate-900/90 border border-slate-800/80 overflow-hidden shadow-2xl">
                {/* Header Preview */}
                <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/60">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white"
                      style={{ backgroundColor: selectedCompanyForPreview?.logoColor || "#4F46E5" }}
                    >
                      {selectedCompanyForPreview ? selectedCompanyForPreview.name.slice(0, 2).toUpperCase() : "AD"}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white">
                        {selectedCompanyForPreview ? selectedCompanyForPreview.name : "Nombre de Marca"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {selectedCompanyForPreview?.tagline || "Eslogan comercial"}
                      </span>
                    </div>
                  </div>

                  {newAdBadge && (
                    <span className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/40">
                      {newAdBadge}
                    </span>
                  )}
                </div>

                {/* Banner Preview */}
                <div className="h-44 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 p-5 flex flex-col justify-between">
                  <span className="px-2.5 py-1 text-[10px] font-extrabold bg-black/50 text-white rounded-lg self-start">
                    {newAdPlatform} • ANUNCIO EN VIVO
                  </span>
                  <p className="text-white font-black text-lg line-clamp-2">
                    {newAdHeadline || "El titular del anuncio aparecerá aquí mientras escribes..."}
                  </p>
                </div>

                {/* Copy Preview */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {newAdBody || "El copy creativo persuasivo se verá renderizado de esta forma..."}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>CTA: <strong className="text-cyan-400">{newAdCta}</strong></span>
                    <span className="text-emerald-400 font-bold">● Simulación en Vivo</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 5. VISTA: GUÍA DE DESPLIEGUE EN PRODUCCIÓN */}
        {activeTab === "deployment" && (
          <div className="space-y-6">

            {/* Banner de Producción */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-[#0B1021] to-indigo-950/40 border border-emerald-500/30 shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 mb-3">
                <Cloud className="w-3.5 h-3.5" />
                Despliegue Activo en Producción
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                AdRadar está Activo en Internet (24/7)
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                Tu proyecto cuenta con su propia URL permanente:{" "}
                <a
                  href="https://ad-radar-eta.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 underline font-mono font-bold"
                >
                  https://ad-radar-eta.vercel.app/
                </a>
                . Corre sobre servidores Edge mundiales de Vercel y base de datos relacional serverless en Neon.
              </p>
            </div>

            {/* Los 3 Pasos Clave */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Paso 1: Cloud DB */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 space-y-4 shadow-xl">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-base">
                  1
                </div>
                <h3 className="font-bold text-white text-base">PostgreSQL en la Nube (Neon.tech)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Base de datos relacional con SSL activo, auto-escalado a cero para optimizar recursos y conexión segura TLS.
                </p>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-emerald-400 font-bold space-y-1">
                  <p>✓ Conectado a Neon Serverless</p>
                  <p>✓ Tablas sincronizadas con Prisma 6</p>
                  <p>✓ 12 marcas y campañas indexadas</p>
                </div>
              </div>

              {/* Paso 2: GitHub CI/CD */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 space-y-4 shadow-xl">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-base">
                  2
                </div>
                <h3 className="font-bold text-white text-base">Repositorio GitHub con CI/CD</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cada vez que se realiza un commit en la rama <code>main</code>, Vercel detecta los cambios y actualiza la web automáticamente sin interrupciones.
                </p>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-cyan-400 font-mono space-y-1">
                  <p>git push origin main</p>
                  <p className="text-slate-400">repo: Starknight60/portafolios</p>
                </div>
              </div>

              {/* Paso 3: Vercel */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 space-y-4 shadow-xl">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-base">
                  3
                </div>
                <h3 className="font-bold text-white text-base">Vercel Edge Global</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Entrega de contenido a través de una red CDN con más de 300 puntos de presencia globales y certificado HTTPS automático.
                </p>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-emerald-400 font-bold space-y-1">
                  <p>✓ Dominio: ad-radar-eta.vercel.app</p>
                  <p>✓ Cabeceras de seguridad activas</p>
                  <p>✓ Sistema de autenticación JWT</p>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#070A13] py-6 px-4 md:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 AdRadar Enterprise — Desarrollado por Ángel David Morillo García</p>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Next.js 16 (App Router)</span>
            <span>•</span>
            <span>PostgreSQL 17 (Neon)</span>
            <span>•</span>
            <span>Prisma ORM 6</span>
            <span>•</span>
            <span>Bcrypt + JWT Auth</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
