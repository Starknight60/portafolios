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
  Server,
  Database,
  CreditCard,
  Cpu,
  Zap,
  Radio,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Flame,
  Activity,
  Terminal,
  RefreshCw,
  Play,
  RotateCcw,
  UserCheck,
} from "lucide-react";

type ServiceStatus = "healthy" | "degraded" | "down";
type Severity = "P1 - Crítico" | "P2 - Alto" | "P3 - Medio";
type IncidentStatus = "investigando" | "reconocido" | "resuelto";

interface Microservice {
  id: string;
  name: string;
  type: string;
  status: ServiceStatus;
  latency: number; // ms
  uptime: number; // %
  errorRate: number; // %
  iconName: "auth" | "db" | "payments" | "cache" | "ai" | "notifications";
}

interface Incident {
  id: string;
  title: string;
  serviceId: string;
  severity: Severity;
  status: IncidentStatus;
  openedAt: string;
  assignedTo: string;
}

interface HttpTrace {
  id: string;
  timestamp: string;
  method: "GET" | "POST" | "PUT";
  path: string;
  status: number;
  duration: number;
}

const INITIAL_SERVICES: Microservice[] = [
  { id: "srv-db", name: "Cluster Primario PostgreSQL", type: "Base de Datos", status: "healthy", latency: 14, uptime: 99.99, errorRate: 0.01, iconName: "db" },
  { id: "srv-pay", name: "Motor de Facturación & Stripe", type: "Fintech Core", status: "healthy", latency: 85, uptime: 99.95, errorRate: 0.02, iconName: "payments" },
  { id: "srv-auth", name: "Servicio OAuth & Tokens JWT", type: "Seguridad", status: "healthy", latency: 22, uptime: 100.0, errorRate: 0.0, iconName: "auth" },
  { id: "srv-cache", name: "Cluster de Caché Redis", type: "En Memoria", status: "healthy", latency: 3, uptime: 99.99, errorRate: 0.0, iconName: "cache" },
  { id: "srv-ai", name: "Inferencia de Modelos LLM", type: "Worker IA", status: "healthy", latency: 310, uptime: 99.88, errorRate: 0.15, iconName: "ai" },
  { id: "srv-notif", name: "Dispatcher de Webhooks", type: "Mensajería", status: "healthy", latency: 45, uptime: 99.94, errorRate: 0.05, iconName: "notifications" },
];

export default function OpsGuardDashboard() {
  const [services, setServices] = useState<Microservice[]>(INITIAL_SERVICES);
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: "INC-1092",
      title: "Latencia elevada en revalidación de caché Redis",
      serviceId: "srv-cache",
      severity: "P3 - Medio",
      status: "resuelto",
      openedAt: "Hace 42m",
      assignedTo: "David M. (SRE Lead)",
    },
  ]);
  const [traces, setTraces] = useState<HttpTrace[]>([]);
  const [telemetryData, setTelemetryData] = useState<{ time: string; latency: number; rps: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  // Inicialización de telemetría sintética
  useEffect(() => {
    setMounted(true);
    const initialPoints = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const t = new Date(now - i * 5000);
      initialPoints.push({
        time: t.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        latency: Math.floor(40 + Math.random() * 25),
        rps: Math.floor(1200 + Math.random() * 300),
      });
    }
    setTelemetryData(initialPoints);

    // Trazas iniciales
    setTraces([
      { id: "tr-1", timestamp: "10:14:02", method: "POST", path: "/api/v1/auth/tokens", status: 200, duration: 24 },
      { id: "tr-2", timestamp: "10:14:03", method: "GET", path: "/api/v1/users/profile", status: 200, duration: 18 },
      { id: "tr-3", timestamp: "10:14:05", method: "POST", path: "/api/v1/payments/checkout", status: 200, duration: 89 },
      { id: "tr-4", timestamp: "10:14:07", method: "GET", path: "/api/v1/analytics/realtime", status: 200, duration: 34 },
    ]);
  }, []);

  // Simulación de tráfico en vivo cada 3.5 segundos
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      const isCritical = services.some((s) => s.status === "down");
      const isDegraded = services.some((s) => s.status === "degraded");

      const baseLatency = isCritical ? 420 : isDegraded ? 180 : 45;
      const currentLatency = Math.floor(baseLatency + (Math.random() - 0.4) * 35);
      const currentRps = isCritical ? 420 : Math.floor(1400 + Math.random() * 250);

      const nowTime = new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setTelemetryData((prev) => [
        ...prev.slice(1),
        { time: nowTime, latency: currentLatency, rps: currentRps },
      ]);

      // Nueva traza HTTP
      const paths = ["/api/v1/checkout", "/api/v1/users", "/api/v1/metrics", "/api/v1/ai/stream"];
      const chosenPath = paths[Math.floor(Math.random() * paths.length)];
      const statusCode = isCritical && chosenPath.includes("checkout") ? 500 : 200;

      const newTrace: HttpTrace = {
        id: `tr-${Date.now()}`,
        timestamp: nowTime,
        method: Math.random() > 0.4 ? "POST" : "GET",
        path: chosenPath,
        status: statusCode,
        duration: currentLatency,
      };

      setTraces((prev) => [newTrace, ...prev.slice(0, 5)]);
    }, 3500);

    return () => clearInterval(interval);
  }, [mounted, services]);

  // INYECTOR DE FALLOS: Simular Caída de Base de Datos (P1)
  const triggerDatabaseCrash = () => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === "srv-db"
          ? { ...s, status: "down", latency: 980, errorRate: 34.5 }
          : s.id === "srv-pay"
            ? { ...s, status: "degraded", latency: 450, errorRate: 12.1 }
            : s
      )
    );

    const newIncident: Incident = {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      title: "Fallo crítico en Cluster PostgreSQL: Conexiones agotadas",
      serviceId: "srv-db",
      severity: "P1 - Crítico",
      status: "investigando",
      openedAt: "Ahora mismo",
      assignedTo: "David M. (SRE Lead)",
    };

    setIncidents((prev) => [newIncident, ...prev]);
  };

  // INYECTOR DE FALLOS: Simular Latencia en Pagos (P2)
  const triggerPaymentSpike = () => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === "srv-pay"
          ? { ...s, status: "degraded", latency: 680, errorRate: 4.8 }
          : s
      )
    );

    const newIncident: Incident = {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      title: "Spike de latencia en Pasarela Stripe (p99 > 600ms)",
      serviceId: "srv-pay",
      severity: "P2 - Alto",
      status: "investigando",
      openedAt: "Hace 1m",
      assignedTo: "Equipo On-Call",
    };

    setIncidents((prev) => [newIncident, ...prev]);
  };

  // AUTO-RECUPERACIÓN: Restaurar todos los sistemas
  const restoreAllSystems = () => {
    setServices(INITIAL_SERVICES);
    setIncidents((prev) =>
      prev.map((inc) => ({ ...inc, status: "resuelto" }))
    );
  };

  const updateIncidentStatus = (id: string, newStatus: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc))
    );
  };

  const renderServiceIcon = (icon: Microservice["iconName"]) => {
    switch (icon) {
      case "db": return <Database className="w-5 h-5 text-cyan-400" />;
      case "payments": return <CreditCard className="w-5 h-5 text-emerald-400" />;
      case "auth": return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
      case "cache": return <Zap className="w-5 h-5 text-amber-400" />;
      case "ai": return <Cpu className="w-5 h-5 text-purple-400" />;
      case "notifications": return <Radio className="w-5 h-5 text-rose-400" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case "healthy":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Saludable</span>;
      case "degraded":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/50"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />Degradado</span>;
      case "down":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800/50"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />Caído (Down)</span>;
    }
  };

  const hasCritical = services.some((s) => s.status === "down");
  const hasDegraded = services.some((s) => s.status === "degraded");

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* 1. TOPBAR ENTERPRISE & STATUS GENERAL */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">OpsGuard</span>
                <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                  SRE PROD-EAST
                </span>
              </div>
              <span className="text-xs text-slate-400">Enterprise Observability &amp; Incident Control</span>
            </div>
          </div>

          {/* Banner de Estado Global */}
          <div className="hidden md:flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">SLA Global:</span>
              <span className="font-bold text-white">99.98%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Latencia p95:</span>
              <span className={`font-bold ${hasCritical ? "text-rose-400" : hasDegraded ? "text-amber-400" : "text-emerald-400"}`}>
                {hasCritical ? "980ms" : hasDegraded ? "340ms" : "42ms"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">RPS Global:</span>
              <span className="font-bold text-cyan-400">14.2k req/s</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold">
              {hasCritical ? (
                <span className="text-rose-400 border-rose-800/60 bg-rose-950/40 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5" /> Incidente P1 en curso
                </span>
              ) : hasDegraded ? (
                <span className="text-amber-400 border-amber-800/60 bg-amber-950/40 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Rendimiento Degradado
                </span>
              ) : (
                <span className="text-emerald-400 border-emerald-800/60 bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Todos los sistemas operativos
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. PANEL DE CONTROL DE CHAOS ENGINEERING (BOTONES DE DEMO) */}
      <section className="bg-slate-900/40 border-b border-slate-800/60 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-200">Inyector de Caos (Demo para Entrevistas):</span>
            <span className="hidden sm:inline text-slate-500">Prueba cómo responde la plataforma en crisis:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={triggerDatabaseCrash}
              className="bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 font-medium"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              Simular Caída DB (P1)
            </button>
            <button
              onClick={triggerPaymentSpike}
              className="bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 font-medium"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Simular Spike Pagos (P2)
            </button>
            <button
              onClick={restoreAllSystems}
              className="bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              Auto-Heal (Recuperar Todo)
            </button>
          </div>
        </div>
      </section>

      {/* 3. CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {/* GRID DE MICROSERVICIOS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                Matriz de Microservicios &amp; Infraestructura
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Telemetría en tiempo real de nodos de producción.</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">6/6 NODOS ACTIVOS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((srv) => (
              <div
                key={srv.id}
                className={`bg-slate-900/60 border rounded-2xl p-5 transition-all shadow-sm ${srv.status === "down"
                    ? "border-rose-800/80 bg-rose-950/20 ring-1 ring-rose-500/20"
                    : srv.status === "degraded"
                      ? "border-amber-800/80 bg-amber-950/20"
                      : "border-slate-800/80 hover:border-slate-700"
                  }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      {renderServiceIcon(srv.iconName)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-white leading-tight">{srv.name}</h3>
                      <span className="text-[11px] text-slate-400">{srv.type}</span>
                    </div>
                  </div>
                  {getStatusBadge(srv.status)}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Latencia</span>
                    <span className={`font-mono font-semibold ${srv.latency > 300 ? "text-rose-400" : srv.latency > 150 ? "text-amber-400" : "text-slate-200"}`}>
                      {srv.latency}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Uptime</span>
                    <span className="font-mono font-semibold text-slate-200">{srv.uptime}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Error Rate</span>
                    <span className={`font-mono font-semibold ${srv.errorRate > 5 ? "text-rose-400" : srv.errorRate > 1 ? "text-amber-400" : "text-emerald-400"}`}>
                      {srv.errorRate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TELEMETRÍA EN VIVO (GRÁFICO ESTILO DATADOG) */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Telemetría en Vivo de Latencia (Cluster East)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Peticiones concurrentes y latencia p95 actualizada cada 3s.</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Latencia (ms)
              </span>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="telemetryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#090d16",
                    borderColor: "#1e293b",
                    borderRadius: "0.75rem",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val} ms`, "Latencia p95"]}
                />
                <Area type="monotone" dataKey="latency" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#telemetryGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECCIÓN INFERIOR: INCIDENTES (PAGERDUTY) & TRAZAS HTTP */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GESTIÓN DE INCIDENTES (SENTRY / PAGERDUTY LITE) */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  Centro de Respuesta a Incidentes
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Triage, asignaciones y SLA de recuperación.</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {incidents.filter((i) => i.status !== "resuelto").length} Pendientes
              </span>
            </div>

            <div className="space-y-3">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 transition ${inc.status === "resuelto"
                      ? "bg-slate-950/40 border-slate-800 text-slate-500"
                      : inc.severity.includes("P1")
                        ? "bg-rose-950/30 border-rose-800/60 text-slate-200"
                        : "bg-amber-950/30 border-amber-800/60 text-slate-200"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${inc.severity.includes("P1") ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                      {inc.severity}
                    </span>
                    <span className="text-slate-500 text-[11px] font-mono">{inc.openedAt}</span>
                  </div>

                  <h4 className="font-semibold text-white leading-snug">{inc.title}</h4>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> {inc.assignedTo}
                    </span>

                    <div className="flex gap-2">
                      {inc.status === "investigando" && (
                        <button
                          onClick={() => updateIncidentStatus(inc.id, "reconocido")}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg font-medium transition"
                        >
                          Reconocer (Ack)
                        </button>
                      )}
                      {inc.status !== "resuelto" && (
                        <button
                          onClick={() => updateIncidentStatus(inc.id, "resuelto")}
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg font-medium transition"
                        >
                          Resolver
                        </button>
                      )}
                      {inc.status === "resuelto" && (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resuelto
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONSOLA DE TRAZAS HTTP Y LOGS EN VIVO */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Stream de Tráfico &amp; Trazas HTTP
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Inspección de peticiones entrantes en producción.</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 font-mono text-[11px] space-y-2 max-h-[260px] overflow-y-auto">
              {traces.map((tr) => (
                <div key={tr.id} className="flex items-center justify-between py-1 border-b border-slate-900/80 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{tr.timestamp}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${tr.method === "POST" ? "bg-indigo-950 text-indigo-400 border border-indigo-800/40" : "bg-cyan-950 text-cyan-400 border border-cyan-800/40"
                      }`}>
                      {tr.method}
                    </span>
                    <span className="text-slate-300">{tr.path}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${tr.status === 200 ? "text-emerald-400" : "text-rose-400"}`}>
                      {tr.status}
                    </span>
                    <span className="text-slate-500">{tr.duration}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 bg-slate-900/30">
        <p>OpsGuard Enterprise SRE Platform &middot; Confiabilidad, Observabilidad &amp; Gestión de Incidentes</p>
      </footer>
    </div>
  );
}