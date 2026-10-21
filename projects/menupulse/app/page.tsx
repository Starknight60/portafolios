"use client";

import { useState, useEffect } from "react";
import {
  Utensils,
  Search,
  TrendingUp,
  AlertTriangle,
  Bookmark,
  PlusCircle,
  Sparkles,
  Layers,
  Pizza,
  Coffee,
  Fish,
  Flame,
  Drumstick,
  ArrowRight,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
  Lock,
  Mail,
  Building2,
  DollarSign,
  Percent,
  CheckCircle2,
  ChevronRight,
  Calculator,
  BarChart3,
  Copy,
  Check,
  Trash2,
  Sliders,
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

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  physicalAddress: string;
  logoColor: string;
  logoIcon: string;
  avgMarkupPct: number;
  dishCount: number;
}

interface Dish {
  id: string;
  restaurantId: string;
  restaurant: Restaurant;
  name: string;
  category: string;
  description: string;
  physicalPrice: number;
  pedidosYaPrice: number;
  uberEatsPrice: number;
  yummyPrice: number;
  phantomMarkupPct: number;
  badge: string | null;
  foodCostEst: number;
  isSurgeActive: boolean;
}

interface WatchlistItem {
  id: string;
  dish: Dish;
  userNote: string | null;
}

interface Watchlist {
  id: string;
  title: string;
  notes: string | null;
  items: WatchlistItem[];
}

const CATEGORIES = [
  { id: "all", label: "Todas las Categorías", icon: Layers },
  { id: "Hamburguesas", label: "Hamburguesas", icon: Flame, emoji: "🍔" },
  { id: "Pollo", label: "Pollo Frito", icon: Drumstick, emoji: "🍗" },
  { id: "Pizzas", label: "Pizzas", icon: Pizza, emoji: "🍕" },
  { id: "Sushi", label: "Sushi & Asiática", icon: Fish, emoji: "🍣" },
  { id: "Café", label: "Cafetería & Bakery", icon: Coffee, emoji: "☕" },
  { id: "Combos", label: "Combos Familiares", icon: Utensils, emoji: "🍟" },
];

const DUEL_PRESETS = [
  { label: "🍔 McDonald's vs Burger King", slugA: "mcdonalds", slugB: "burger-king" },
  { label: "🍗 KFC vs Arturo's", slugA: "kfc", slugB: "arturos" },
  { label: "🍕 Papa John's vs Domino's Pizza", slugA: "papa-johns", slugB: "dominos" },
  { label: "🍔 Ávila Burger vs McDonald's", slugA: "avila-burger", slugB: "mcdonalds" },
];

export default function MenuPulseApp() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Formulario Auth
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authCompany, setAuthCompany] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Navegación en Dashboard
  const [activeTab, setActiveTab] = useState<"radar" | "duels" | "simulator" | "watchlists" | "new_dish">("radar");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros del Radar
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [sortBy, setSortBy] = useState("markup_desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Duelos
  const [compareSlugA, setCompareSlugA] = useState("mcdonalds");
  const [compareSlugB, setCompareSlugB] = useState("burger-king");
  const [compareData, setCompareData] = useState<any>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Simulador de Márgenes
  const [simDishName, setSimDishName] = useState("Hamburguesa Especial Trufada");
  const [simPhysicalPrice, setSimPhysicalPrice] = useState("8.50");
  const [simFoodCost, setSimFoodCost] = useState("2.50");
  const [simCommissionPct, setSimCommissionPct] = useState("24");
  const [simPackagingCost, setSimPackagingCost] = useState("0.60");
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Formulario Nuevo Plato
  const [newRestaurantId, setNewRestaurantId] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Hamburguesas");
  const [newDesc, setNewDesc] = useState("");
  const [newPhysicalPrice, setNewPhysicalPrice] = useState("");
  const [newPedidosYaPrice, setNewPedidosYaPrice] = useState("");
  const [newUberEatsPrice, setNewUberEatsPrice] = useState("");
  const [newYummyPrice, setNewYummyPrice] = useState("");
  const [newFoodCost, setNewFoodCost] = useState("");
  const [creatingDish, setCreatingDish] = useState(false);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }

  // 1. Verificar sesión
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
      console.error("Error al comprobar sesión:", err);
    } finally {
      setSessionChecked(true);
    }
  }

  // 2. Cargar datos cuando el usuario está logueado
  useEffect(() => {
    if (currentUser) {
      fetchDishes();
      fetchRestaurants();
      fetchWatchlists();
    }
  }, [currentUser, selectedCategory, selectedRestaurant, sortBy, searchQuery]);

  async function fetchDishes() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedRestaurant !== "all") params.append("restaurantId", selectedRestaurant);
      if (sortBy) params.append("sortBy", sortBy);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/dishes?${params.toString()}`);
      const data = await res.json();
      if (data.dishes) setDishes(data.dishes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRestaurants() {
    try {
      const res = await fetch("/api/restaurants");
      const data = await res.json();
      if (data.restaurants) {
        setRestaurants(data.restaurants);
        if (!newRestaurantId && data.restaurants.length > 0) {
          setNewRestaurantId(data.restaurants[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchWatchlists() {
    try {
      const res = await fetch("/api/watchlists");
      const data = await res.json();
      if (data.watchlists) setWatchlists(data.watchlists);
    } catch (err) {
      console.error(err);
    }
  }

  // Cargar duelo cuando se selecciona la pestaña de duelos
  useEffect(() => {
    if (activeTab === "duels") {
      fetchDuelData();
    }
  }, [activeTab, compareSlugA, compareSlugB]);

  async function fetchDuelData() {
    setCompareLoading(true);
    try {
      const res = await fetch(`/api/compare?slugA=${compareSlugA}&slugB=${compareSlugB}`);
      const data = await res.json();
      setCompareData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCompareLoading(false);
    }
  }

  // Ejecutar simulación automática al cambiar valores
  useEffect(() => {
    if (activeTab === "simulator") {
      runSimulation();
    }
  }, [activeTab, simPhysicalPrice, simFoodCost, simCommissionPct, simPackagingCost]);

  async function runSimulation(save: boolean = false) {
    setSimLoading(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dishName: simDishName,
          physicalPrice: parseFloat(simPhysicalPrice) || 0,
          foodCost: parseFloat(simFoodCost) || 0,
          appCommissionPct: parseFloat(simCommissionPct) || 24,
          packagingCost: parseFloat(simPackagingCost) || 0.6,
          saveSimulation: save,
        }),
      });
      const data = await res.json();
      if (data.simulation) {
        setSimResult(data.simulation);
        if (save) showToast("💾 ¡Simulación guardada en Neon PostgreSQL!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  }

  // Manejo de Auth
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
      setAuthPassword("");
      showToast(`✨ ¡Bienvenido, ${data.user.name}! Acceso verificado.`);
    } catch {
      setAuthError("Error de conexión al servidor");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleDirectDemoLogin(email: string) {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "123456" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Error al ingresar con cuenta demo");
        return;
      }
      setCurrentUser(data.user);
      showToast(`✨ Acceso demo concedido como: ${data.user.name}`);
    } catch {
      setAuthError("Error de conexión");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      showToast("Has cerrado sesión exitosamente");
    } catch (err) {
      console.error(err);
    }
  }

  // Guardar en Watchlist
  async function handleAddToWatchlist(dishId: string) {
    if (!watchlists.length) {
      showToast("No tienes ninguna watchlist creada.");
      return;
    }
    const targetWatchlist = watchlists[0];
    try {
      const res = await fetch("/api/watchlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_item",
          watchlistId: targetWatchlist.id,
          dishId,
          userNote: "Monitoreo activo de sobreprecio",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Error al agregar plato");
        return;
      }
      showToast("⭐ Plato agregado a tu Watchlist");
      fetchWatchlists();
    } catch {
      showToast("Error al conectar con la base de datos");
    }
  }

  async function handleRemoveWatchlistItem(itemId: string) {
    try {
      const res = await fetch("/api/watchlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove_item", itemId }),
      });
      if (res.ok) {
        showToast("Elemento eliminado de la watchlist");
        fetchWatchlists();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Crear Plato
  async function handleCreateDish(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || !newPhysicalPrice || !newPedidosYaPrice) {
      showToast("Por favor complete los campos obligatorios");
      return;
    }
    setCreatingDish(true);
    try {
      const res = await fetch("/api/dishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: newRestaurantId,
          name: newName,
          category: newCategory,
          description: newDesc,
          physicalPrice: parseFloat(newPhysicalPrice),
          pedidosYaPrice: parseFloat(newPedidosYaPrice),
          uberEatsPrice: parseFloat(newUberEatsPrice || newPedidosYaPrice),
          yummyPrice: parseFloat(newYummyPrice || newPedidosYaPrice),
          foodCostEst: parseFloat(newFoodCost || "0"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Error al registrar plato");
        return;
      }
      showToast("🚀 ¡Plato indexado y brecha calculada en Neon!");
      setNewName("");
      setNewDesc("");
      setNewPhysicalPrice("");
      setNewPedidosYaPrice("");
      setNewUberEatsPrice("");
      setNewYummyPrice("");
      setNewFoodCost("");
      fetchDishes();
      setActiveTab("radar");
    } catch {
      showToast("Error de conexión al servidor");
    } finally {
      setCreatingDish(false);
    }
  }

  // Pantalla de carga inicial
  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#070A13] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 p-0.5 animate-pulse mb-4 shadow-xl shadow-amber-500/20">
          <div className="w-full h-full bg-[#070A13] rounded-[14px] flex items-center justify-center">
            <Utensils className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Cargando MenuPulse Enterprise...</p>
      </div>
    );
  }

  // =========================================================================
  // VISTA 1: GATEKEEPER PORTAL CORPORATIVO (CUANDO NO ESTÁ LOGUEADO)
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-12 bg-[#070A13] text-slate-100 selection:bg-amber-500 selection:text-white">
        
        {/* TOAST FLOTANTE */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 border border-amber-500/50 shadow-2xl shadow-amber-500/20 backdrop-blur-xl text-white text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* COLUMNA IZQUIERDA: EXPLICACIÓN CORPORATIVA & CASOS REALES */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-gradient-to-br from-slate-950 via-[#0D111E] to-[#070A13] relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo Superior */}
          <div className="relative z-10 flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-orange-500 p-0.5 shadow-lg shadow-amber-500/25">
              <div className="w-full h-full bg-[#070A13] rounded-[14px] flex items-center justify-center">
                <Utensils className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight text-white">
                  Menu<span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">Pulse</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-md tracking-wider">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Radar de Inflación Oculta y Brecha de Precios en Delivery</p>
            </div>
          </div>

          {/* Título & Explicación Formal */}
          <div className="relative z-10 space-y-5 my-auto py-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              PostgreSQL 17 en Neon Cloud • Cifrado Bcrypt & JWT
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Audita el sobreprecio fantasma entre la carta física y las apps de delivery.
            </h1>

            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              <strong>MenuPulse</strong> es la plataforma B2B de inteligencia de precios para cadenas de restaurantes, franquicias e inversores gastronómicos. Rastrea en tiempo real cómo las marcas inflan sus precios entre un <strong>15% y 45%</strong> en PedidosYa, UberEats y Yummy para transferir las comisiones a los clientes, detectando sobreprecios abusivos y oportunidades de cuota de mercado.
            </p>

            {/* Tarjetas de Casos de Estudio Reales */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-1">
                  <span>🍔</span> McDonald's vs Burger King
                </div>
                <p className="text-xs text-slate-300 font-semibold">Cuarto de Libra vs Whopper</p>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-[11px] text-slate-400">Sobreprecio Delivery:</span>
                  <span className="text-xs font-extrabold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">+36.0%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                  <span>🍗</span> KFC vs Arturo's
                </div>
                <p className="text-xs text-slate-300 font-semibold">Pollo Frito Familiar</p>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-[11px] text-slate-400">Arturo's (Honesto):</span>
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">+19.0%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                  <span>🍕</span> Papa John's vs Domino's
                </div>
                <p className="text-xs text-slate-300 font-semibold">Pizza Familiar Especial</p>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-[11px] text-slate-400">Brecha Máxima:</span>
                  <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">+$6.50 / pizza</span>
                </div>
              </div>
            </div>

            {/* Checklist de Capacidades */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Radar de brecha física vs delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Simulador de margen y food cost</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Duelos Head-to-Head entre marcas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Watchlists privadas con alertas</span>
              </div>
            </div>
          </div>

          {/* Footer de la columna izquierda */}
          <div className="relative z-10 pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>© 2026 MenuPulse Intelligence</span>
            <span>Cloud Cluster: Neon US-East</span>
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO DE ACCESO & DEMO 1-CLICK */}
        <div className="lg:col-span-5 p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-[#090D18]">
          <div className="w-full max-w-md mx-auto space-y-6">

            {/* Selector de Modo (Login / Registro) */}
            <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setAuthError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === "login"
                    ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("register"); setAuthError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === "register"
                    ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            {/* Mensaje de Error */}
            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre Completo</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Ej. Carlos Mendoza"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Empresa o Cadena Gastronómica</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={authCompany}
                        onChange={(e) => setAuthCompany(e.target.value)}
                        placeholder="Ej. Grupo Gastronómico Andino"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Correo Corporativo</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="nombre@restaurante.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{authMode === "login" ? "Ingresar al Radar" : "Registrar Analista"}</span>
                  </>
                )}
              </button>
            </form>

            {/* SECCIÓN DEMO EN 1 CLIC */}
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Acceso Rápido de Demostración:</span>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">Sin escribir contraseña</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin("director@foodgroup.com")}
                  disabled={authLoading}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all text-left group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-white group-hover:text-amber-400">David González</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Director FoodGroup (Admin)</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">director@foodgroup.com</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin("analista@burgerlab.io")}
                  disabled={authLoading}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all text-left group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-white group-hover:text-amber-400">Valeria Rivas</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Senior Pricing Analyst</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">analista@burgerlab.io</p>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    );
  }

  // =========================================================================
  // VISTA 2: PANEL DE CONTROL COMPLETO (USUARIO AUTENTICADO)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 selection:bg-amber-500 selection:text-white flex flex-col">

      {/* TOAST FLOTANTE */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 border border-amber-500/50 shadow-2xl shadow-amber-500/20 backdrop-blur-xl text-white text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BARRA SUPERIOR (HEADER) */}
      <header className="border-b border-slate-800/80 bg-[#070A13]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Logo y Status de Neon */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 p-0.5 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-[#070A13] rounded-[10px] flex items-center justify-center">
                <Utensils className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">
                  Menu<span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">Pulse</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded">
                  ENTERPRISE
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Neon Cloud PostgreSQL Activo</span>
              </div>
            </div>
          </div>

          {/* Navegación por Módulos */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 border border-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab("radar")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "radar"
                  ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Radar de Precios</span>
            </button>
            <button
              onClick={() => setActiveTab("duels")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "duels"
                  ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Duelos Head-to-Head</span>
            </button>
            <button
              onClick={() => setActiveTab("simulator")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "simulator"
                  ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador de Margen</span>
            </button>
            <button
              onClick={() => setActiveTab("watchlists")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "watchlists"
                  ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Mis Watchlists</span>
            </button>
            <button
              onClick={() => setActiveTab("new_dish")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "new_dish"
                  ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Auditar Plato</span>
            </button>
          </nav>

          {/* Perfil del Usuario & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold text-white"
                style={{ backgroundColor: currentUser.avatarColor }}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{currentUser.company || "Analista"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Barra Móvil de Pestañas */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto px-4 py-2 border-t border-slate-800/60 text-xs">
          <button
            onClick={() => setActiveTab("radar")}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === "radar" ? "bg-amber-500 text-white font-bold" : "text-slate-400"}`}
          >
            Radar
          </button>
          <button
            onClick={() => setActiveTab("duels")}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === "duels" ? "bg-amber-500 text-white font-bold" : "text-slate-400"}`}
          >
            Duelos
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === "simulator" ? "bg-amber-500 text-white font-bold" : "text-slate-400"}`}
          >
            Simulador
          </button>
          <button
            onClick={() => setActiveTab("watchlists")}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === "watchlists" ? "bg-amber-500 text-white font-bold" : "text-slate-400"}`}
          >
            Watchlists
          </button>
          <button
            onClick={() => setActiveTab("new_dish")}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === "new_dish" ? "bg-amber-500 text-white font-bold" : "text-slate-400"}`}
          >
            + Plato
          </button>
        </div>
      </header>

      {/* CUERPO PRINCIPAL DEL DASHBOARD */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* RESUMEN DE INDICADORES CLAVE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Platos Auditados</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-white">{dishes.length}</span>
              <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">En vivo</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cadenas Indexadas</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-white">{restaurants.length}</span>
              <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">9 Marcas</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sobreprecio Promedio</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-amber-400">+31.2%</span>
              <span className="text-xs text-slate-400">Phantom Markup</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Brecha Máxima Detectada</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-rose-400">+44.0%</span>
              <span className="text-xs text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">Café & Sushi</span>
            </div>
          </div>
        </div>

        {/* ===================================================================
            PESTAÑA 1: RADAR DE DISPARIDAD DE PRECIOS
            =================================================================== */}
        {activeTab === "radar" && (
          <div className="space-y-6">
            
            {/* Barra de Filtros */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                
                {/* Buscador */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar plato, combo o ingrediente..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Filtro de Restaurante */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedRestaurant}
                    onChange={(e) => setSelectedRestaurant(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Todas las Marcas</option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.avgMarkupPct}% markup)
                      </option>
                    ))}
                  </select>

                  {/* Ordenamiento */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="markup_desc">Mayor Sobreprecio %</option>
                    <option value="markup_asc">Menor Sobreprecio (Honesto)</option>
                    <option value="physical_asc">Menor Precio en Salón</option>
                    <option value="delivery_desc">Mayor Precio Delivery</option>
                  </select>
                </div>
              </div>

              {/* Categorías Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shrink-0 transition-all ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {cat.emoji && <span>{cat.emoji}</span>}
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid de Platos Auditados */}
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Consultando Neon PostgreSQL...</p>
              </div>
            ) : dishes.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                <Utensils className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No se encontraron platos con estos filtros</p>
                <p className="text-xs text-slate-500">Prueba cambiando la categoría o término de búsqueda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dishes.map((dish) => {
                  const avgDelivery = ((dish.pedidosYaPrice + dish.uberEatsPrice + dish.yummyPrice) / 3);
                  const dollarDifference = avgDelivery - dish.physicalPrice;

                  return (
                    <div
                      key={dish.id}
                      className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-lg"
                    >
                      <div>
                        {/* Cabecera del Plato: Restaurante y Badges */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: dish.restaurant.logoColor }}
                            />
                            <span className="text-xs font-bold text-slate-300">{dish.restaurant.name}</span>
                          </div>

                          {dish.badge && (
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                dish.badge.includes("Mayor")
                                  ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                                  : dish.badge.includes("Honesto")
                                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                  : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {dish.badge}
                            </span>
                          )}
                        </div>

                        {/* Nombre y Descripción */}
                        <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                          {dish.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>

                        {/* CUADRO COMPARATIVO DE PRECIOS */}
                        <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                          
                          {/* Precio Físico */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium">🏪 Salón Físico / Mostrador:</span>
                            <span className="font-extrabold text-white text-sm">${dish.physicalPrice.toFixed(2)}</span>
                          </div>

                          <div className="h-px bg-slate-800/60" />

                          {/* Precios en Delivery Apps */}
                          <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                              <span className="block text-[9px] text-slate-400 font-semibold">PedidosYa</span>
                              <span className="text-xs font-black text-rose-400">${dish.pedidosYaPrice.toFixed(2)}</span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                              <span className="block text-[9px] text-slate-400 font-semibold">UberEats</span>
                              <span className="text-xs font-black text-amber-400">${dish.uberEatsPrice.toFixed(2)}</span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                              <span className="block text-[9px] text-slate-400 font-semibold">Yummy</span>
                              <span className="text-xs font-black text-purple-400">${dish.yummyPrice.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Brecha / Phantom Markup */}
                          <div className="pt-1.5 flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium">Sobreprecio Oculto:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-300 font-semibold">+${dollarDifference.toFixed(2)}</span>
                              <span
                                className={`font-black text-xs px-1.5 py-0.5 rounded ${
                                  dish.phantomMarkupPct > 30
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                }`}
                              >
                                +{dish.phantomMarkupPct}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botón Guardar en Watchlist */}
                      <button
                        type="button"
                        onClick={() => handleAddToWatchlist(dish.id)}
                        className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-amber-500/20 hover:border-amber-500/40 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Espiar en mi Watchlist</span>
                      </button>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ===================================================================
            PESTAÑA 2: DUELOS GASTRONÓMICOS HEAD-TO-HEAD
            =================================================================== */}
        {activeTab === "duels" && (
          <div className="space-y-6">
            
            {/* Selector de Presets de Batallas */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">Duelos Gastronómicos de Precios</h2>
                <p className="text-xs text-slate-400">Compara la política de sobreprecios entre dos cadenas competidoras directas.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {DUEL_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setCompareSlugA(preset.slugA);
                      setCompareSlugB(preset.slugB);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      compareSlugA === preset.slugA && compareSlugB === preset.slugB
                        ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white border-transparent"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resultados del Duelo */}
            {compareLoading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Analizando datos en Neon PostgreSQL...</p>
              </div>
            ) : compareData ? (
              <div className="space-y-6">
                
                {/* Tarjeta de Ganador y Penalización */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#0F1424] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl">
                      🏆
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Cadena con Política de Precios Más Honesta</span>
                      <h3 className="text-xl font-black text-white">{compareData.winnerFairPrice}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Aplica un <strong>{compareData.markupDifference}% menos</strong> de sobreprecio que su rival en delivery.
                      </p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="text-xs text-slate-400 block">Diferencia de Brecha:</span>
                    <span className="text-2xl font-black text-amber-400">{compareData.markupDifference}%</span>
                  </div>
                </div>

                {/* Cara a Cara (Grid 2 Columnas) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Competidor A */}
                  <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: compareData.restaurantA.logoColor }}
                        />
                        <h3 className="text-lg font-black text-white">{compareData.restaurantA.name}</h3>
                      </div>
                      <span className="text-xs font-bold text-slate-400">{compareData.restaurantA.city}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Salón Promedio</span>
                        <span className="text-sm font-black text-white">${compareData.restaurantA.avgPhysicalPrice}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Delivery Promedio</span>
                        <span className="text-sm font-black text-rose-400">${compareData.restaurantA.avgDeliveryPrice}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Markup Promedio</span>
                        <span className="text-sm font-black text-amber-400">+{compareData.restaurantA.avgMarkupPct}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-300">Platos de {compareData.restaurantA.name}:</p>
                      {compareData.restaurantA.dishes?.slice(0, 4).map((d: any) => (
                        <div key={d.id} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200">{d.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">${d.physicalPrice.toFixed(2)} Físico</span>
                            <span className="font-extrabold text-amber-400">+{d.phantomMarkupPct}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Competidor B */}
                  <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: compareData.restaurantB.logoColor }}
                        />
                        <h3 className="text-lg font-black text-white">{compareData.restaurantB.name}</h3>
                      </div>
                      <span className="text-xs font-bold text-slate-400">{compareData.restaurantB.city}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Salón Promedio</span>
                        <span className="text-sm font-black text-white">${compareData.restaurantB.avgPhysicalPrice}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Delivery Promedio</span>
                        <span className="text-sm font-black text-rose-400">${compareData.restaurantB.avgDeliveryPrice}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Markup Promedio</span>
                        <span className="text-sm font-black text-amber-400">+{compareData.restaurantB.avgMarkupPct}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-300">Platos de {compareData.restaurantB.name}:</p>
                      {compareData.restaurantB.dishes?.slice(0, 4).map((d: any) => (
                        <div key={d.id} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200">{d.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">${d.physicalPrice.toFixed(2)} Físico</span>
                            <span className="font-extrabold text-amber-400">+{d.phantomMarkupPct}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* GRÁFICA COMPARATIVA DE BARRAS */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
                    Comparativa de Precios Promedio: Salón vs Delivery ($)
                  </h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: compareData.restaurantA.name,
                            Fisico: compareData.restaurantA.avgPhysicalPrice,
                            Delivery: compareData.restaurantA.avgDeliveryPrice,
                          },
                          {
                            name: compareData.restaurantB.name,
                            Fisico: compareData.restaurantB.avgPhysicalPrice,
                            Delivery: compareData.restaurantB.avgDeliveryPrice,
                          },
                        ]}
                      >
                        <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                        <YAxis stroke="#64748B" fontSize={12} unit="$" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0F172A",
                            borderColor: "#334155",
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="Fisico" fill="#10B981" radius={[6, 6, 0, 0]} name="Precio Salón ($)" />
                        <Bar dataKey="Delivery" fill="#F43F5E" radius={[6, 6, 0, 0]} name="Precio Delivery ($)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : null}

          </div>
        )}

        {/* ===================================================================
            PESTAÑA 3: SIMULADOR DE MARGEN Y ELASTICIDAD ÓPTIMA
            =================================================================== */}
        {activeTab === "simulator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Columna Izquierda: Parámetros del Restaurante */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-400" />
                  <span>Calculadora de Precios Óptimos</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Introduce los costos de tu plato para calcular cuánto debes cobrar en PedidosYa / UberEats sin sacrificar tu margen.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nombre del Plato / Combo</label>
                  <input
                    type="text"
                    value={simDishName}
                    onChange={(e) => setSimDishName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Precio en Salón ($)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={simPhysicalPrice}
                      onChange={(e) => setSimPhysicalPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Food Cost / Insumos ($)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={simFoodCost}
                      onChange={(e) => setSimFoodCost(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-300">Comisión de la App de Delivery</label>
                    <span className="font-extrabold text-rose-400">{simCommissionPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="35"
                    step="1"
                    value={simCommissionPct}
                    onChange={(e) => setSimCommissionPct(e.target.value)}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>15% (Tarifa básica)</span>
                    <span>24% (Estándar)</span>
                    <span>35% (Exclusividad/Promoción)</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Costo de Empaque / Packaging ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simPackagingCost}
                    onChange={(e) => setSimPackagingCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => runSimulation(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Guardar Simulación en PostgreSQL
                </button>
              </div>
            </div>

            {/* Columna Derecha: Proyección y Recomendaciones */}
            <div className="lg:col-span-7 space-y-4">
              {simResult ? (
                <>
                  {/* Tarjeta Principal de Precio Recomendado */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0B101E] to-slate-900 border border-amber-500/30 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Recomendación Algorítmica MenuPulse
                      </span>
                      <span className="text-xs text-slate-400">Protección de Margen 100%</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2">
                      <div>
                        <span className="text-xs text-slate-400">Precio Óptimo de Venta en Delivery:</span>
                        <div className="text-4xl font-black text-white mt-1">
                          ${simResult.recommendedDeliveryPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Sobreprecio Necesario:</span>
                        <div className="text-2xl font-black text-amber-400">
                          +{simResult.phantomMarkupPct}%
                        </div>
                      </div>
                    </div>

                    {/* Desglose de Ganancias */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-center text-xs">
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Ganancia en Salón</span>
                        <span className="text-sm font-black text-emerald-400">${simResult.physicalProfit.toFixed(2)}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Ganancia Delivery</span>
                        <span className="text-sm font-black text-emerald-400">${simResult.deliveryProfit.toFixed(2)}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Comisión a la App</span>
                        <span className="text-sm font-black text-rose-400">${simResult.commissionPaidToApp.toFixed(2)}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Margen Neto %</span>
                        <span className="text-sm font-black text-white">{simResult.deliveryMarginPct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Evaluación de Sensibilidad y Demanda */}
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Elasticidad y Probabilidad de Conversión del Comensal
                    </span>
                    <p className="text-xs text-slate-300 font-medium">
                      Diagnóstico: <strong className={simResult.penaltyScore > 50 ? "text-rose-400" : "text-emerald-400"}>{simResult.conversionImpact}</strong>
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Si el sobreprecio supera el 30%, los consumidores tienden a cancelar el pedido o buscar un rival en la misma categoría. Para mitigar esta penalización, se recomienda agrupar el plato en formato de <em>combo</em> para ocultar el valor unitario.
                    </p>
                  </div>
                </>
              ) : null}
            </div>

          </div>
        )}

        {/* ===================================================================
            PESTAÑA 4: MIS WATCHLISTS PRIVADAS
            =================================================================== */}
        {activeTab === "watchlists" && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Mis Listas de Espionaje de Menús</h2>
                <p className="text-xs text-slate-400">Platos de competidores guardados para monitorear variaciones de precio.</p>
              </div>
            </div>

            {watchlists.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">Aún no tienes platos en tu watchlist</p>
                <p className="text-xs text-slate-500">Ve al Radar de Precios y haz clic en "Espiar en mi Watchlist".</p>
              </div>
            ) : (
              <div className="space-y-6">
                {watchlists.map((wl) => (
                  <div key={wl.id} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-black text-white">{wl.title}</h3>
                        {wl.notes && <p className="text-xs text-slate-400 mt-0.5">{wl.notes}</p>}
                      </div>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                        {wl.items.length} platos vigilados
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {wl.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-slate-200">{item.dish.name}</span>
                              <span className="text-[10px] text-slate-400">({item.dish.restaurant.name})</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs mt-1">
                              <span className="text-slate-400">Salón: ${item.dish.physicalPrice.toFixed(2)}</span>
                              <span className="text-rose-400 font-bold">Delivery: ${item.dish.pedidosYaPrice.toFixed(2)}</span>
                              <span className="text-amber-400 font-extrabold">+{item.dish.phantomMarkupPct}%</span>
                            </div>
                            {item.userNote && (
                              <p className="text-[11px] text-slate-500 italic mt-1.5">"{item.userNote}"</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveWatchlistItem(item.id)}
                            title="Eliminar de la Watchlist"
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            PESTAÑA 5: AUDITAR NUEVO PLATO
            =================================================================== */}
        {activeTab === "new_dish" && (
          <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <span>Auditar e Indexar Nuevo Plato</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Registra un plato o combo de la competencia. El sistema calculará automáticamente la brecha y el sobreprecio fantasma.
              </p>
            </div>

            <form onSubmit={handleCreateDish} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cadena / Restaurante</label>
                  <select
                    value={newRestaurantId}
                    onChange={(e) => setNewRestaurantId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Hamburguesas">Hamburguesas</option>
                    <option value="Pollo">Pollo Frito</option>
                    <option value="Pizzas">Pizzas</option>
                    <option value="Sushi">Sushi & Asiática</option>
                    <option value="Café">Cafetería & Bakery</option>
                    <option value="Combos">Combos Familiares</option>
                    <option value="Postres">Postres</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nombre del Plato / Combo</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Combo Crispy Supreme con Aros"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descripción del Plato</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detalles de ingredientes, porción, acompañantes..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Precio Salón ($)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={newPhysicalPrice}
                    onChange={(e) => setNewPhysicalPrice(e.target.value)}
                    placeholder="7.50"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">PedidosYa ($)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={newPedidosYaPrice}
                    onChange={(e) => setNewPedidosYaPrice(e.target.value)}
                    placeholder="10.20"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">UberEats ($)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newUberEatsPrice}
                    onChange={(e) => setNewUberEatsPrice(e.target.value)}
                    placeholder="10.50"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Yummy ($)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newYummyPrice}
                    onChange={(e) => setNewYummyPrice(e.target.value)}
                    placeholder="9.90"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingDish}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold transition-all shadow-lg shadow-amber-500/25 cursor-pointer disabled:opacity-50"
              >
                {creatingDish ? "Guardando en Neon..." : "Indexar en Neon PostgreSQL"}
              </button>
            </form>
          </div>
        )}

      </main>

    </div>
  );
}
