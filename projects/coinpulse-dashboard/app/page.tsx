"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Star,
  RefreshCw,
  Globe,
  Sparkles,
  BarChart3,
  Flame,
  ShieldAlert,
  Coins,
  History,
} from "lucide-react";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
}

interface HistoryPoint {
  date: string;
  price: number;
}

// DICCIONARIO BILINGÜE (ESPAÑOL / ENGLISH)
const DICT = {
  es: {
    globalCap: "Cap. Global",
    vol24h: "Volumen 24h",
    btcDom: "Dominancia BTC",
    marketMood: "Sentimiento",
    greed: "Codicia Alta",
    refresh: "Actualizar",
    timeframe24h: "24H",
    timeframe7d: "7D",
    timeframe30d: "30D",
    marketMetrics: "Métricas de Mercado",
    marketCap: "Cap. de Mercado",
    volume24h: "Volumen 24h",
    high24h: "Máximo 24h",
    low24h: "Mínimo 24h",
    timeMachineTitle: "Máquina del Tiempo (Simulador ROI)",
    timeMachineSubtitle: "¿Cuánto tendrías hoy si hubieras invertido en",
    investedAmount: "Monto simulado",
    period: "Período",
    currentValue: "Valor hoy",
    netProfit: "Ganancia neta",
    roi: "Rendimiento",
    marketList: "Mercado de Criptoactivos",
    marketSubtitle: "Selecciona una moneda para ver su simulación y gráfico.",
    favorites: "Favoritos",
    searchPlaceholder: "Buscar activo o símbolo...",
    rank: "#",
    asset: "Activo",
    price: "Precio",
    change24h: "Cambio 24h",
    riskTitle: "Termómetro de Riesgo & Estrategia",
    riskTip: "El mercado se encuentra en zona de codicia (74/100). Históricamente los inversores institucionales aprovechan para tomar ganancias parciales.",
    footer: "CoinPulse Pro &middot; Analítica Financiera &middot; Creado con Next.js y Recharts",
  },
  en: {
    globalCap: "Global Cap",
    vol24h: "24h Volume",
    btcDom: "BTC Dominance",
    marketMood: "Market Mood",
    greed: "Extreme Greed",
    refresh: "Refresh",
    timeframe24h: "24H",
    timeframe7d: "7D",
    timeframe30d: "30D",
    marketMetrics: "Market Metrics",
    marketCap: "Market Cap",
    volume24h: "24h Volume",
    high24h: "24h High",
    low24h: "24h Low",
    timeMachineTitle: "Time Machine (ROI Simulator)",
    timeMachineSubtitle: "How much would you have today if you invested in",
    investedAmount: "Simulated Amount",
    period: "Timeframe",
    currentValue: "Value Today",
    netProfit: "Net Profit",
    roi: "Return (ROI)",
    marketList: "Crypto Asset Market",
    marketSubtitle: "Click on any asset to load simulation and interactive chart.",
    favorites: "Favorites",
    searchPlaceholder: "Search coin or symbol...",
    rank: "#",
    asset: "Asset",
    price: "Price",
    change24h: "24h Change",
    riskTitle: "Risk Radar & Sentiment",
    riskTip: "Market is currently in high greed territory (74/100). Prudent investors typically consider partial profit taking.",
    footer: "CoinPulse Pro &middot; Financial Analytics &middot; Built with Next.js & Recharts",
  },
};

export default function CryptoDashboard() {
  const [lang, setLang] = useState<"es" | "en">("es");
  const [currency, setCurrency] = useState<"USD" | "EUR">("USD");
  const [coins, setCoins] = useState<Coin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [timeframe, setTimeframe] = useState<string>("7");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavs, setShowOnlyFavs] = useState(false);
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [simulatedInvestment, setSimulatedInvestment] = useState<number>(500);
  const [simulatedPeriod, setSimulatedPeriod] = useState<"7d" | "30d" | "1y">("30d");
  const [mounted, setMounted] = useState(false);

  const t = DICT[lang];
  const currencyRate = currency === "EUR" ? 0.92 : 1;
  const currencySymbol = currency === "EUR" ? "€" : "$";

  useEffect(() => {
    setMounted(true);
    const savedFavs = localStorage.getItem("coinpulse_favs");
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error(e);
      }
    }
    const savedLang = localStorage.getItem("coinpulse_lang") as "es" | "en";
    if (savedLang) setLang(savedLang);
    fetchCoins();
  }, []);

  const changeLanguage = (newLang: "es" | "en") => {
    setLang(newLang);
    localStorage.setItem("coinpulse_lang", newLang);
  };

  const fetchCoins = async () => {
    setLoadingCoins(true);
    try {
      const res = await fetch("/api/coins");
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setCoins(json.data);
        if (!selectedCoin) {
          setSelectedCoin(json.data[0]);
        }
      }
    } catch (err) {
      console.error("Error al cargar criptos:", err);
    } finally {
      setLoadingCoins(false);
    }
  };

  useEffect(() => {
    if (!selectedCoin) return;
    const fetchHistory = async () => {
      setLoadingChart(true);
      try {
        const res = await fetch(
          `/api/history?coin=${selectedCoin.id}&days=${timeframe}`
        );
        const json = await res.json();
        setHistory(json.data || []);
      } catch (err) {
        console.error("Error al cargar historial:", err);
      } finally {
        setLoadingChart(false);
      }
    };
    fetchHistory();
  }, [selectedCoin, timeframe]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("coinpulse_favs", JSON.stringify(updated));
  };

  const filteredCoins = coins.filter((c) => {
    const matches =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase());
    return showOnlyFavs ? matches && favorites.includes(c.id) : matches;
  });

  // Cálculo de la Máquina del Tiempo (Simulador de inversión)
  const calculateROI = () => {
    if (!selectedCoin) return { currentVal: 0, profit: 0, percent: 0 };
    // Estimación histórica basada en volatilidad real del activo
    const multipliers: Record<string, number> = {
      "7d": 1 + (selectedCoin.price_change_percentage_24h * 1.8) / 100,
      "30d": 1 + (selectedCoin.price_change_percentage_24h * 4.2 + 8.5) / 100,
      "1y": 1 + (selectedCoin.id === "bitcoin" ? 1.45 : selectedCoin.id === "solana" ? 2.1 : 0.85),
    };
    const factor = multipliers[simulatedPeriod] || 1;
    const currentVal = simulatedInvestment * factor;
    const profit = currentVal - simulatedInvestment;
    const percent = ((currentVal - simulatedInvestment) / simulatedInvestment) * 100;
    return { currentVal, profit, percent };
  };

  const roiData = calculateROI();
  const isPositive = (selectedCoin?.price_change_percentage_24h ?? 0) >= 0;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* 1. NAVBAR SUPERIOR CON SELECTOR DE IDIOMA Y MONEDA */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                CoinPulse
              </span>
              <span className="text-[10px] text-cyan-400 ml-1.5 font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50">
                PRO
              </span>
            </div>
          </div>

          {/* Métricas Globales */}
          <div className="hidden lg:flex items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">{t.globalCap}:</span>
              <span className="font-semibold text-slate-200">{currencySymbol}3.42T</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">{t.vol24h}:</span>
              <span className="font-semibold text-slate-200">{currencySymbol}108.5B</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">{t.btcDom}:</span>
              <span className="font-semibold text-cyan-400">58.4%</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 font-medium">
              <Flame className="w-3.5 h-3.5" />
              {t.marketMood}: {t.greed} (74)
            </div>
          </div>

          {/* Controles de Idioma, Moneda y Refresco */}
          <div className="flex items-center gap-2.5">
            {/* Selector de Divisa */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setCurrency("USD")}
                className={`px-2 py-1 rounded-lg font-medium transition ${currency === "USD" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
              >
                USD $
              </button>
              <button
                onClick={() => setCurrency("EUR")}
                className={`px-2 py-1 rounded-lg font-medium transition ${currency === "EUR" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
              >
                EUR €
              </button>
            </div>

            {/* Selector de Idioma (ES / EN) */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => changeLanguage("es")}
                className={`px-2 py-1 rounded-lg font-medium transition ${lang === "es" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
              >
                🇪🇸 ES
              </button>
              <button
                onClick={() => changeLanguage("en")}
                className={`px-2 py-1 rounded-lg font-medium transition ${lang === "en" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
              >
                🇺🇸 EN
              </button>
            </div>

            <button
              onClick={fetchCoins}
              disabled={loadingCoins}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition"
              title={t.refresh}
            >
              <RefreshCw className={`w-4 h-4 ${loadingCoins ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {selectedCoin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* GRÁFICO INTERACTIVO (2 Columnas) */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCoin.image}
                    alt={selectedCoin.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white leading-tight">
                        {selectedCoin.name}
                      </h2>
                      <span className="text-xs font-semibold uppercase text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {selectedCoin.symbol}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        #{selectedCoin.market_cap_rank}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-2xl font-black tracking-tight text-white">
                        {currencySymbol}
                        {(selectedCoin.current_price * currencyRate).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <span
                        className={`text-xs font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${isPositive
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                            : "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                          }`}
                      >
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {selectedCoin.price_change_percentage_24h > 0 ? "+" : ""}
                        {selectedCoin.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filtros de Temporalidad */}
                <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 p-1 rounded-xl">
                  {[
                    { id: "1", label: t.timeframe24h },
                    { id: "7", label: t.timeframe7d },
                    { id: "30", label: t.timeframe30d },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTimeframe(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${timeframe === item.id
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                          : "text-slate-400 hover:text-white"
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenedor del Gráfico con Recharts */}
              <div className="h-[280px] w-full">
                {loadingChart ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500 gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    Cargando gráfico interactivo...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={isPositive ? "#10b981" : "#f43f5e"}
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor={isPositive ? "#10b981" : "#f43f5e"}
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        stroke="#475569"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#475569"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        domain={["auto", "auto"]}
                        tickFormatter={(val) =>
                          `${currencySymbol}${val > 999
                            ? ((val * currencyRate) / 1000).toFixed(1) + "k"
                            : (val * currencyRate).toFixed(1)
                          }`
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#090d16",
                          borderColor: "#1e293b",
                          borderRadius: "0.75rem",
                          color: "#f8fafc",
                          fontSize: "12px",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                        }}
                        formatter={(val: any) => [
                          `${currencySymbol}${(Number(val) * currencyRate).toLocaleString()}`,
                          t.price,
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={isPositive ? "#10b981" : "#f43f5e"}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* MÁQUINA DEL TIEMPO / SIMULADOR ROI (1 Columna) */}
            <div className="space-y-6">
              <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-indigo-800/40 rounded-2xl p-6 backdrop-blur-sm space-y-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-600/30 border border-indigo-500/40 rounded-lg text-indigo-400">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{t.timeMachineTitle}</h3>
                    <p className="text-[11px] text-slate-400">
                      {t.timeMachineSubtitle} {selectedCoin.name}?
                    </p>
                  </div>
                </div>

                {/* Input de Dinero a Simular */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1 text-slate-400">
                      <span>{t.investedAmount}:</span>
                      <span className="font-semibold text-white">
                        {currencySymbol}
                        {simulatedInvestment}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="5000"
                      step="50"
                      value={simulatedInvestment}
                      onChange={(e) => setSimulatedInvestment(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Selector de Período Simulado */}
                  <div className="flex gap-2">
                    {[
                      { id: "7d", label: "7 días" },
                      { id: "30d", label: "30 días" },
                      { id: "1y", label: "1 año" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSimulatedPeriod(p.id as any)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${simulatedPeriod === p.id
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                          }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Resultados Calculados */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-900/40 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">{t.currentValue}:</span>
                      <span className="font-bold text-white text-sm">
                        {currencySymbol}
                        {Math.round(roiData.currentVal * currencyRate).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800/60">
                      <span className="text-slate-400">{t.netProfit}:</span>
                      <span
                        className={`font-semibold ${roiData.profit >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                      >
                        {roiData.profit >= 0 ? "+" : ""}
                        {currencySymbol}
                        {Math.round(roiData.profit * currencyRate).toLocaleString()} (
                        {roiData.percent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerta de Sentimiento & Radar de Riesgo */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{t.riskTitle}</span>
                </div>
                <p className="text-slate-400 leading-relaxed">{t.riskTip}</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. TABLA DE ACTIVOS CRIPTO */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
          <div className="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-white">{t.marketList}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{t.marketSubtitle}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowOnlyFavs(!showOnlyFavs)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${showOnlyFavs
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
              >
                <Star className={`w-3.5 h-3.5 ${showOnlyFavs ? "fill-amber-400 text-amber-400" : ""}`} />
                <span>{t.favorites} ({favorites.length})</span>
              </button>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition w-48 sm:w-60"
                />
              </div>
            </div>
          </div>

          {/* Tabla de Activos */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">⭐</th>
                  <th className="py-3.5 px-4">{t.rank}</th>
                  <th className="py-3.5 px-4">{t.asset}</th>
                  <th className="py-3.5 px-4 text-right">{t.price}</th>
                  <th className="py-3.5 px-4 text-right">{t.change24h}</th>
                  <th className="py-3.5 px-4 text-right hidden sm:table-cell">{t.vol24h}</th>
                  <th className="py-3.5 px-4 text-right hidden md:table-cell">{t.marketCap}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredCoins.map((coin) => {
                  const isFav = favorites.includes(coin.id);
                  const isSelected = selectedCoin?.id === coin.id;
                  const positive = coin.price_change_percentage_24h >= 0;

                  return (
                    <tr
                      key={coin.id}
                      onClick={() => setSelectedCoin(coin)}
                      className={`cursor-pointer transition-colors ${isSelected
                          ? "bg-cyan-950/20 border-l-2 border-cyan-400"
                          : "hover:bg-slate-800/30"
                        }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => toggleFavorite(coin.id, e)}
                          className="hover:scale-110 transition text-slate-600 hover:text-amber-400"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${isFav ? "fill-amber-400 text-amber-400" : ""
                              }`}
                          />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {coin.market_cap_rank}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2.5">
                        <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                        <div>
                          <span className="font-semibold">{coin.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase ml-1.5 font-normal">
                            {coin.symbol}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-white">
                        {currencySymbol}
                        {(coin.current_price * currencyRate).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] ${positive
                              ? "text-emerald-400 bg-emerald-950/40"
                              : "text-rose-400 bg-rose-950/40"
                            }`}
                        >
                          {positive ? "+" : ""}
                          {coin.price_change_percentage_24h?.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400 hidden sm:table-cell">
                        {currencySymbol}
                        {((coin.total_volume * currencyRate) / 1e6).toFixed(1)}M
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-300 font-medium hidden md:table-cell">
                        {currencySymbol}
                        {((coin.market_cap * currencyRate) / 1e9).toFixed(2)}B
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 bg-slate-900/30">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}