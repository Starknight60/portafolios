"use client";

import { useState, useEffect } from "react";
import {
  Code2,
  Database,
  ExternalLink,
  Mail,
  Copy,
  Check,
  ArrowRight,
  Activity,
  Bot,
  Kanban,
  CheckCircle2,
  Plus,
  X,
  Trash2,
  FileText,
  Download,
  Settings,
} from "lucide-react";

// Icono oficial de GitHub nativo en SVG (evita errores de librerías externas)
function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface ProjectItem {
  id: string;
  category: "fullstack" | "ai" | "frontend";
  title: string;
  badge: string;
  gradient: string;
  description: string;
  tech: string[];
  features: string[];
  githubUrl: string;
  demoUrl: string;
  isCustom?: boolean;
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: "promptforge",
    category: "ai",
    title: "PromptForge Hub",
    badge: "ModelOps CI/CD & PostgreSQL",
    gradient: "from-purple-600 via-indigo-600 to-pink-600",
    description:
      "Plataforma empresarial de ModelOps para control de versiones de prompts tipo Git, playground de pruebas A/B en tiempo real, auditoría de tokens y optimización de costos en USD con PostgreSQL y Prisma ORM.",
    tech: ["Next.js", "PostgreSQL", "Prisma ORM", "Recharts", "TypeScript"],
    features: [
      "Versionado & Diffs visuales tipo Git",
      "Benchmark A/B con inferencia paralela",
      "Motor de costos en USD & umbral de presupuesto",
    ],
    githubUrl: "https://github.com/Starknight60/portafolios/tree/main/projects/promptforge-hub",
    demoUrl: "http://localhost:3000",
  },
  {
    id: "nexus",
    category: "fullstack",
    title: "Nexus Enterprise SaaS",
    badge: "Full-Stack & PostgreSQL",
    gradient: "from-indigo-600 to-violet-600",
    description:
      "Plataforma SaaS B2B con base de datos relacional PostgreSQL en pgAdmin, Prisma ORM, autenticación JWT con cookies HttpOnly seguras, control de acceso por roles y auditoría en tiempo real.",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Prisma ORM", "Tailwind CSS"],
    features: [
      "Transacciones atómicas ACID",
      "Roles RBAC & Multi-tenant",
      "Protección de rutas con Middleware",
    ],
    githubUrl: "https://github.com/Starknight60/portafolios/tree/main/projects/nexus-saas",
    demoUrl: "http://localhost:3000",
  },
  {
    id: "documind",
    category: "ai",
    title: "DocuMind AI",
    badge: "IA Generativa & Multimodal",
    gradient: "from-blue-600 to-indigo-600",
    description:
      "Asistente inteligente para análisis y chat con documentos PDF usando la API de Google Gemini con arquitectura de tolerancia a fallos ante saturación de servidores (503).",
    tech: ["Next.js", "Google Gemini API", "TypeScript", "Tailwind CSS"],
    features: [
      "Lectura multimodal de PDFs",
      "Fallback automático de modelos",
      "Exportación de reportes (.txt)",
    ],
    githubUrl: "https://github.com/Starknight60/portafolios/tree/main/projects/doc-ai-chat",
    demoUrl: "https://vercel.com/",
  },
  {
    id: "coinpulse",
    category: "ai",
    title: "CoinPulse Analytics",
    badge: "Fintech & Data Visualization",
    gradient: "from-cyan-600 to-blue-600",
    description:
      "Dashboard financiero de criptomonedas con Recharts, simulador histórico de retorno de inversión (ROI Máquina del Tiempo) y backend proxy anti rate-limits.",
    tech: ["Next.js", "Recharts", "TypeScript", "CoinGecko API", "Tailwind CSS"],
    features: [
      "Gráficos de series temporales",
      "Simulador matemático de ROI",
      "Caché proxy anti rate-limits",
    ],
    githubUrl: "https://github.com/Starknight60/portafolios/tree/main/projects/coinpulse-dashboard",
    demoUrl: "https://vercel.com/",
  },
  {
    id: "taskflow",
    category: "fullstack",
    title: "TaskFlow Kanban",
    badge: "Productividad & Drag & Drop",
    gradient: "from-purple-600 to-indigo-600",
    description:
      "Tablero Kanban inspirado en Linear con Drag & Drop nativo en HTML5 a 60 FPS, seguimiento de subtareas con barras de progreso dinámicas y filtros por prioridad.",
    tech: ["React", "HTML5 Drag & Drop", "TypeScript", "Tailwind CSS"],
    features: [
      "Drag & Drop sin librerías pesadas",
      "Barra de progreso de subtareas",
      "Filtros en tiempo real",
    ],
    githubUrl: "https://github.com/Starknight60/portafolios/tree/main/projects/taskflow-kanban",
    demoUrl: "http://localhost:3000",
  },
  {
    id: "opsguard",
    category: "fullstack",
    title: "OpsGuard Enterprise SRE",
    badge: "SRE & Incident Response",
    gradient: "from-rose-600 via-orange-600 to-amber-600",
    description:
      "Centro de comando de operaciones y respuesta a incidentes de infraestructura crítica (SRE) con telemetría en tiempo real, niveles de severidad P1/P2/P3 y métricas Recharts.",
    tech: ["Next.js", "Recharts", "TypeScript", "Tailwind CSS"],
    features: [
      "Monitoreo de servicios y estado SRE",
      "Triaje de incidentes críticos P1/P2/P3",
      "Gráficos de latencia y throughput",
    ],
    githubUrl: "https://github.com/Starknight60/portafolios/tree/main/projects/opsguard-enterprise",
    demoUrl: "http://localhost:3000",
  },
  {
    id: "telegram_ai",
    category: "ai",
    title: "Telegram AI Assistant",
    badge: "Bot Automatizado & Gemini API",
    gradient: "from-sky-500 to-blue-600",
    description:
      "Bot de mensajería inteligente desplegado en Telegram conectado con la API de Google Gemini para procesamiento de lenguaje natural y resolución de consultas automatizadas.",
    tech: ["Python", "Telegram Bot API", "Google Gemini API"],
    features: [
      "Procesamiento de lenguaje natural",
      "Manejo asíncrono de mensajes",
      "Integración directa de modelos LLM",
    ],
    githubUrl: "https://github.com/Starknight60/portafolios/tree/main/projects/telegram-bot",
    demoUrl: "https://github.com/Starknight60/portafolios/tree/main/projects/telegram-bot",
  },
  {
    id: "neural_net",
    category: "ai",
    title: "NeuralNet JS from Scratch",
    badge: "Machine Learning Puro",
    gradient: "from-emerald-600 to-teal-600",
    description:
      "Implementación de red neuronal multicapa construida desde cero en JavaScript sin librerías externas de ML, implementando forward propagation, backpropagation y descenso de gradiente.",
    tech: ["JavaScript Puro", "Álgebra Lineal", "HTML5 Canvas"],
    features: [
      "Backpropagation y cálculo de derivadas",
      "Funciones de activación Sigmoid/ReLU",
      "Visualización de entrenamiento en tiempo real",
    ],
    githubUrl: "https://github.com/Starknight60/portafolios/tree/main/projects/red-neuronal",
    demoUrl: "https://github.com/Starknight60/portafolios/tree/main/projects/red-neuronal",
  },
];

export default function PortfolioPage() {
  const [lang, setLang] = useState<"es" | "en">("es");
  const [filter, setFilter] = useState<"all" | "fullstack" | "ai">("all");
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);

  // Estados de modales
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);

  // Enlace del CV (Guardado en navegador o archivo local)
  const [cvUrl, setCvUrl] = useState("/cv.pdf");
  const [tempCvUrl, setTempCvUrl] = useState("");

  // Form State para subir proyectos nuevos
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [badge, setBadge] = useState("");
  const [category, setCategory] = useState<"fullstack" | "ai" | "frontend">("fullstack");
  const [techInput, setTechInput] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");

  useEffect(() => {
    const savedProjects = localStorage.getItem("angel_portfolio_projects");
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error(e);
      }
    }

    const savedCv = localStorage.getItem("angel_cv_url");
    if (savedCv) {
      setCvUrl(savedCv);
      setTempCvUrl(savedCv);
    }
  }, []);

  const saveProjects = (items: ProjectItem[]) => {
    setProjects(items);
    localStorage.setItem("angel_portfolio_projects", JSON.stringify(items));
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    const newProject: ProjectItem = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      description: desc.trim(),
      badge: badge.trim() || "Web App",
      category,
      gradient: "from-emerald-600 to-teal-600",
      tech: techInput ? techInput.split(",").map((t) => t.trim()) : ["React", "TypeScript"],
      features: ["Diseño responsive", "Arquitectura moderna"],
      githubUrl: githubUrl.trim() || "https://github.com/",
      demoUrl: demoUrl.trim() || "https://vercel.com/",
      isCustom: true,
    };

    saveProjects([newProject, ...projects]);
    setTitle("");
    setDesc("");
    setBadge("");
    setTechInput("");
    setGithubUrl("");
    setDemoUrl("");
    setIsProjectModalOpen(false);
  };

  const deleteCustomProject = (id: string) => {
    saveProjects(projects.filter((p) => p.id !== id));
  };

  const handleSaveCvUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempCvUrl.trim()) {
      setCvUrl(tempCvUrl.trim());
      localStorage.setItem("angel_cv_url", tempCvUrl.trim());
    }
    setIsCvModalOpen(false);
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === "all") return true;
    return p.category === filter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-300">
      {/* 1. NAVBAR */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              Ángel David Morillo García
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* BOTÓN PARA SUBIR NUEVO PROYECTO */}
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Subir Proyecto</span>
            </button>

            {/* BOTÓN CONFIGURAR CV */}
            <button
              onClick={() => setIsCvModalOpen(true)}
              title="Configurar enlace de CV"
              className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* SELECTOR IDIOMA */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setLang("es")}
                className={`px-2 py-0.5 rounded-lg font-medium transition ${lang === "es" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
              >
                🇪🇸 ES
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 rounded-lg font-medium transition ${lang === "en" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
              >
                🇺🇸 EN
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {lang === "es"
            ? "Disponible para oportunidades de desarrollo"
            : "Available for engineering opportunities"}
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
            Ángel David Morillo García
          </span>
          <span className="block text-2xl sm:text-4xl text-slate-300 font-bold mt-2">
            {lang === "es" ? "Desarrollador Full-Stack" : "Full-Stack Software Developer"}
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {lang === "es"
            ? "Especializado en la creación de aplicaciones web completas, bases de datos relacionales en PostgreSQL, arquitecturas modernas en Next.js, TypeScript e Inteligencia Artificial."
            : "Specialized in full-stack web applications, PostgreSQL relational databases, modern Next.js architecture, TypeScript, and AI integrations."}
        </p>

        {/* ACCIONES DEL HERO */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="#proyectos"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-3 rounded-xl transition shadow-lg shadow-indigo-600/25"
          >
            <span>{lang === "es" ? "Ver Proyectos" : "View Projects"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>

          {/* BOTÓN DESCARGAR / VER CV */}
          <a
            href={cvUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold px-5 py-3 rounded-xl transition"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>{lang === "es" ? "Descargar / Ver CV" : "Download / View CV"}</span>
          </a>
        </div>
      </section>

      {/* 3. PROYECTOS */}
      <section id="proyectos" className="max-w-6xl mx-auto px-6 py-16 space-y-10 border-t border-slate-900">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {lang === "es" ? "Proyectos Desarrollados" : "Featured Projects"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {lang === "es"
                ? "Software funcional con bases de datos relacionales, IA y APIs."
                : "Functional software featuring relational databases, AI, and APIs."}
            </p>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${filter === "all" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
            >
              Todos ({projects.length})
            </button>
            <button
              onClick={() => setFilter("fullstack")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${filter === "fullstack" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
            >
              Full-Stack & DB
            </button>
            <button
              onClick={() => setFilter("ai")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${filter === "ai" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
            >
              IA & Analítica
            </button>
          </div>
        </div>

        {/* Grid de Proyectos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${p.gradient} text-white shadow-md`}>
                    {p.category === "fullstack" ? (
                      <Database className="w-5 h-5" />
                    ) : p.category === "ai" ? (
                      <Bot className="w-5 h-5" />
                    ) : (
                      <Code2 className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                      {p.badge}
                    </span>
                    {p.isCustom && (
                      <button
                        onClick={() => deleteCustomProject(p.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.description}</p>
                </div>

                {/* Características destacadas */}
                <div className="space-y-1.5 pt-2">
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Etiquetas de Tecnología */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {p.tech.map((tItem, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono"
                    >
                      {tItem}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botones de enlace */}
              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-800/80">
                <a
                  href={p.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>Código</span>
                </a>
                <a
                  href={p.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-md shadow-indigo-600/20"
                >
                  <span>Ver Demo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. MODAL: SUBIR NUEVO PROYECTO */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsProjectModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white mb-4">Agregar Nuevo Proyecto</h3>

            <form onSubmit={handleAddProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título del Proyecto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: E-Commerce Store Pro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="fullstack">Full-Stack & DB</option>
                    <option value="ai">IA & Analítica</option>
                    <option value="frontend">Frontend</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Etiqueta Badge</label>
                  <input
                    type="text"
                    placeholder="Ej: Full-Stack / Stripe"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descripción *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explica qué hace la aplicación y qué tecnologías usaste..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tecnologías (separadas por comas)</label>
                <input
                  type="text"
                  placeholder="Next.js, TypeScript, PostgreSQL, Tailwind"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Enlace a GitHub</label>
                  <input
                    type="url"
                    placeholder="https://github.com/tu-usuario/repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Enlace de la Demo en Vivo</label>
                  <input
                    type="url"
                    placeholder="https://tu-app.vercel.app"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition"
                >
                  Guardar Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: CONFIGURAR ENLACE DE CV */}
      {isCvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsCvModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white mb-2">Configurar tu Curriculum (CV)</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Puedes pegar un enlace directo a tu CV (por ejemplo de Google Drive, Dropbox o LinkedIn), o colocar tu archivo llamado <code className="text-indigo-400">cv.pdf</code> dentro de la carpeta <code className="text-indigo-400">public/</code> de este proyecto.
            </p>

            <form onSubmit={handleSaveCvUrl} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Enlace o Ruta del CV</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/... o /cv.pdf"
                  value={tempCvUrl}
                  onChange={(e) => setTempCvUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCvModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition"
                >
                  Guardar Enlace de CV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. FOOTER */}
      <footer className="border-t border-slate-900 py-12 text-center text-xs text-slate-600">
        <p>Ángel David Morillo García &middot; Desarrollador Full-Stack</p>
      </footer>
    </div>
  );
}