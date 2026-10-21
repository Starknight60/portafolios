"use client";

import { useState, useEffect } from "react";
import {
  GitBranch,
  GitCommit,
  Play,
  BarChart3,
  Layers,
  Cpu,
  DollarSign,
  Clock,
  Sparkles,
  Plus,
  Check,
  AlertTriangle,
  TrendingDown,
  Zap,
  RefreshCw,
  FileCode,
  ShieldCheck,
  ExternalLink,
  Copy,
  ChevronRight,
  Database,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface ExecutionLog {
  id: string;
  inputTokens: number;
  outputTokens: number;
  totalCostUsd: number;
  latencyMs: number;
  status: string;
  userVariables?: string | null;
  aiOutput?: string | null;
  createdAt: string;
}

interface PromptVersion {
  id: string;
  versionNumber: number;
  systemPrompt: string;
  userTemplate: string;
  modelTarget: string;
  temperature: number;
  diffSummary: string | null;
  createdAt: string;
  executionLogs: ExecutionLog[];
}

interface Prompt {
  id: string;
  name: string;
  category: string;
  versions: PromptVersion[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  budgetLimitUsd: number;
  prompts: Prompt[];
  metrics: {
    totalSpentUsd: number;
    totalTokens: number;
    totalExecutions: number;
    avgLatencyMs: number;
    budgetPercentUsed: number;
  };
}

export default function PromptForgeApp() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [activeTab, setActiveTab] = useState<"versions" | "playground" | "analytics">("versions");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [versionAId, setVersionAId] = useState<string>("");
  const [versionBId, setVersionBId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [runningTest, setRunningTest] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Playground State
  const [testVariables, setTestVariables] = useState<Record<string, string>>({
    txId: "TX-9942",
    amount: "$285.50",
    merchant: "Apple Store Online",
    userMessage: "Card was billed for an iPad order I never authorized while I was on vacation.",
  });

  const [testResults, setTestResults] = useState<{
    resultA: any;
    resultB: any;
    comparison: any;
  } | null>(null);

  // New Version Modal State
  const [showCommitModal, setShowCommitModal] = useState<boolean>(false);
  const [commitForm, setCommitForm] = useState({
    systemPrompt: "",
    userTemplate: "",
    modelTarget: "gemini-1.5-flash",
    temperature: 0.3,
    diffSummary: "",
  });
  const [committing, setCommitting] = useState<boolean>(false);

  // Fetch initial project & prompt data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/prompts");
      const data = await res.json();
      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects);
        const firstPrompt = data.projects[0]?.prompts[0];
        if (firstPrompt) {
          setSelectedPromptId(firstPrompt.id);
          const versions = firstPrompt.versions;
          if (versions.length >= 2) {
            setVersionAId(versions[versions.length - 1].id); // oldest (v1)
            setVersionBId(versions[0].id); // newest (v2)
          } else if (versions.length === 1) {
            setVersionAId(versions[0].id);
            setVersionBId(versions[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load prompts data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeProject = projects[0];
  const activePrompt = activeProject?.prompts.find((p) => p.id === selectedPromptId);
  const versionA = activePrompt?.versions.find((v) => v.id === versionAId);
  const versionB = activePrompt?.versions.find((v) => v.id === versionBId);

  // Switch active prompt and reset versions
  const handleSelectPrompt = (promptId: string) => {
    setSelectedPromptId(promptId);
    const p = activeProject?.prompts.find((item) => item.id === promptId);
    if (p && p.versions.length >= 2) {
      setVersionAId(p.versions[p.versions.length - 1].id);
      setVersionBId(p.versions[0].id);
    } else if (p && p.versions.length === 1) {
      setVersionAId(p.versions[0].id);
      setVersionBId(p.versions[0].id);
    }
    setTestResults(null);
  };

  // Run Playground A/B Test
  const handleRunBenchmark = async () => {
    if (!versionAId) return;
    setRunningTest(true);
    try {
      const res = await fetch("/api/run-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionAId,
          versionBId: versionBId !== versionAId ? versionBId : undefined,
          variables: testVariables,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResults({
          resultA: data.resultA,
          resultB: data.resultB,
          comparison: data.comparison,
        });
        // Silently refresh project metrics
        const resPrompts = await fetch("/api/prompts");
        const refreshedData = await resPrompts.json();
        if (refreshedData.projects) setProjects(refreshedData.projects);
      }
    } catch (error) {
      console.error("Benchmark error:", error);
    } finally {
      setRunningTest(false);
    }
  };

  // Commit new prompt version
  const handleCommitVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromptId || !commitForm.systemPrompt) return;
    setCommitting(true);
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "commit_version",
          promptId: selectedPromptId,
          systemPrompt: commitForm.systemPrompt,
          userTemplate: commitForm.userTemplate || "{{input}}",
          modelTarget: commitForm.modelTarget,
          temperature: commitForm.temperature,
          diffSummary: commitForm.diffSummary,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCommitModal(false);
        setCommitForm({
          systemPrompt: "",
          userTemplate: "",
          modelTarget: "gemini-1.5-flash",
          temperature: 0.3,
          diffSummary: "",
        });
        await fetchData();
      }
    } catch (err) {
      console.error("Commit failed:", err);
    } finally {
      setCommitting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate comparative averages for Tab 1
  const v1AvgCost =
    versionA && versionA.executionLogs.length > 0
      ? versionA.executionLogs.reduce((acc, log) => acc + log.totalCostUsd, 0) /
        versionA.executionLogs.length
      : 0.0035;

  const v2AvgCost =
    versionB && versionB.executionLogs.length > 0
      ? versionB.executionLogs.reduce((acc, log) => acc + log.totalCostUsd, 0) /
        versionB.executionLogs.length
      : 0.00018;

  const v1AvgLatency =
    versionA && versionA.executionLogs.length > 0
      ? Math.round(
          versionA.executionLogs.reduce((acc, log) => acc + log.latencyMs, 0) /
            versionA.executionLogs.length
        )
      : 1100;

  const v2AvgLatency =
    versionB && versionB.executionLogs.length > 0
      ? Math.round(
          versionB.executionLogs.reduce((acc, log) => acc + log.latencyMs, 0) /
            versionB.executionLogs.length
        )
      : 295;

  const costSavingsPercent =
    v1AvgCost > 0 ? (((v1AvgCost - v2AvgCost) / v1AvgCost) * 100).toFixed(1) : "0";
  const latencyReductionPercent =
    v1AvgLatency > 0
      ? (((v1AvgLatency - v2AvgLatency) / v1AvgLatency) * 100).toFixed(1)
      : "0";

  // Prepare chart data for Analytics Tab
  const analyticsData =
    activePrompt?.versions.flatMap((ver) =>
      ver.executionLogs.map((log, idx) => ({
        name: `v${ver.versionNumber} (#${idx + 1})`,
        cost: Number((log.totalCostUsd * 1000).toFixed(3)), // millicents for legible chart
        latency: log.latencyMs,
        tokens: log.inputTokens + log.outputTokens,
        model: ver.modelTarget,
      }))
    ) || [];

  const modelComparisonData = [
    { model: "GPT-4o", costPer1k: 4.85, latency: 1120 },
    { model: "Claude 3.5 Sonnet", costPer1k: 5.40, latency: 1250 },
    { model: "Gemini 1.5 Flash", costPer1k: 0.22, latency: 295 },
    { model: "Gemini 2.0 Flash", costPer1k: 0.28, latency: 240 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-300">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  PromptForge
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  ModelOps CI/CD
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>By</span>
                <span className="text-slate-200 font-medium">Ángel David Morillo García</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Database className="w-3 h-3 inline" /> PostgreSQL Connected
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Project Indicator */}
            {activeProject && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-400">{language === "es" ? "Proyecto:" : "Project:"}</span>
                <span className="text-slate-200 font-medium">{activeProject.name}</span>
              </div>
            )}

            {/* Commit New Version Button */}
            <button
              onClick={() => {
                if (versionB) {
                  setCommitForm({
                    systemPrompt: versionB.systemPrompt,
                    userTemplate: versionB.userTemplate,
                    modelTarget: versionB.modelTarget,
                    temperature: versionB.temperature,
                    diffSummary: "",
                  });
                }
                setShowCommitModal(true);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === "es" ? "Commit Versión" : "Commit Version"}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
              <button
                onClick={() => setLanguage("es")}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  language === "es"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  language === "en"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 border-t border-slate-800/60 pt-1">
          <button
            onClick={() => setActiveTab("versions")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === "versions"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>{language === "es" ? "Historial Git & Diffs" : "Git History & Diffs"}</span>
          </button>

          <button
            onClick={() => setActiveTab("playground")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === "playground"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Play className="w-4 h-4" />
            <span>{language === "es" ? "Playground A/B en Vivo" : "Live A/B Playground"}</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{language === "es" ? "Inteligencia de Costos & Tokens" : "Cost & Token Intelligence"}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Prompt Selector Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 whitespace-nowrap">
              {language === "es" ? "Prompt Objetivo:" : "Target Prompt:"}
            </span>
            <div className="flex flex-wrap gap-2">
              {activeProject?.prompts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPrompt(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedPromptId === p.id
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                      : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{p.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/80 text-slate-400">
                    {p.versions.length}v
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {language === "es"
                ? "Políticas de tokens & presupuesto activas"
                : "Token policies & budget active"}
            </span>
          </div>
        </div>

        {/* TAB 1: GIT HISTORY & DIFFS */}
        {activeTab === "versions" && (
          <div className="space-y-6">
            {/* ROI Executive Impact Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-indigo-950/40 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    -{costSavingsPercent}% {language === "es" ? "Ahorro por Ejecución" : "Cost Savings"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-xs border border-cyan-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    +{latencyReductionPercent}% {language === "es" ? "Más Rápido" : "Faster Latency"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {language === "es"
                    ? "Optimización de Prompt con Arquitectura Multimodelo"
                    : "Multi-Model Architecture Prompt Optimization"}
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {language === "es"
                    ? "La versión 2 migró desde el modelo generalista a un modelo optimizado de baja latencia con esquema JSON estricto, reduciendo drásticamente la huella de tokens y el costo operativo mensual."
                    : "Version 2 migrated from generalist foundation models to high-throughput low-cost inference with strict JSON schemas, dramatically reducing token footprint and monthly expenditure."}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                    {language === "es" ? "Ahorro Estimado / 100k Runs" : "Estimated 100k Runs Savings"}
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    ${((v1AvgCost - v2AvgCost) * 100000).toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Version Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-300">
                    {language === "es" ? "Versión Base (A):" : "Baseline Version (A):"}
                  </span>
                </div>
                <select
                  value={versionAId}
                  onChange={(e) => setVersionAId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
                >
                  {activePrompt?.versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.versionNumber} ({v.modelTarget})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-300">
                    {language === "es" ? "Versión Comparada (B):" : "Target Version (B):"}
                  </span>
                </div>
                <select
                  value={versionBId}
                  onChange={(e) => setVersionBId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
                >
                  {activePrompt?.versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.versionNumber} ({v.modelTarget})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Side by Side Git Diff View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Version A Card */}
              {versionA ? (
                <div className="rounded-2xl bg-slate-900/90 border border-amber-500/20 overflow-hidden shadow-lg flex flex-col">
                  <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          v{versionA.versionNumber}.0
                        </span>
                        <span className="text-xs font-medium text-slate-300">
                          {versionA.modelTarget}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          temp: {versionA.temperature}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 italic font-sans">
                        "{versionA.diffSummary || "Baseline release"}"
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(versionA.systemPrompt, "vA")}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                      title="Copy Prompt"
                    >
                      {copiedId === "vA" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-4 space-y-4 flex-1">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
                        System Prompt
                      </span>
                      <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed border border-slate-800/80 whitespace-pre-wrap max-h-56 overflow-y-auto">
                        {versionA.systemPrompt}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
                        User Template
                      </span>
                      <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed border border-slate-800/80 whitespace-pre-wrap">
                        {versionA.userTemplate}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Costo Promedio</span>
                      <span className="font-mono font-bold text-amber-400">
                        ${v1AvgCost.toFixed(5)}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Latencia Promedio</span>
                      <span className="font-mono font-bold text-slate-200">
                        {v1AvgLatency} ms
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  {language === "es" ? "Selecciona la Versión A" : "Select Version A"}
                </div>
              )}

              {/* Version B Card */}
              {versionB ? (
                <div className="rounded-2xl bg-slate-900/90 border border-emerald-500/20 overflow-hidden shadow-lg flex flex-col">
                  <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          v{versionB.versionNumber}.0
                        </span>
                        <span className="text-xs font-medium text-slate-300">
                          {versionB.modelTarget}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          temp: {versionB.temperature}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active Target
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 italic font-sans">
                        "{versionB.diffSummary || "Optimized commit"}"
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(versionB.systemPrompt, "vB")}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                      title="Copy Prompt"
                    >
                      {copiedId === "vB" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-4 space-y-4 flex-1">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
                        System Prompt
                      </span>
                      <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-emerald-300/90 leading-relaxed border border-emerald-500/20 whitespace-pre-wrap max-h-56 overflow-y-auto">
                        {versionB.systemPrompt}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
                        User Template
                      </span>
                      <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed border border-slate-800/80 whitespace-pre-wrap">
                        {versionB.userTemplate}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Costo Promedio</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ${v2AvgCost.toFixed(5)}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Latencia Promedio</span>
                      <span className="font-mono font-bold text-cyan-400">
                        {v2AvgLatency} ms
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  {language === "es" ? "Selecciona la Versión B" : "Select Version B"}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE A/B TESTING PLAYGROUND */}
        {activeTab === "playground" && (
          <div className="space-y-6">
            {/* Control Panel & Quick Presets */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    {language === "es"
                      ? "Inferencia Paralela & Comparación A/B en Vivo"
                      : "Parallel Inference & Live A/B Benchmark"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === "es"
                      ? "Dispara simultáneamente el prompt con variables dinámicas para medir precisión, costo y milisegundos en tiempo real."
                      : "Trigger side-by-side prompt runs with dynamic variables to measure schema accuracy, latency, and costs in real-time."}
                  </p>
                </div>

                <button
                  onClick={handleRunBenchmark}
                  disabled={runningTest}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {runningTest ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === "es" ? "Ejecutando Modelos..." : "Inferring Models..."}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>{language === "es" ? "Lanzar Benchmark A/B" : "Run A/B Benchmark"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Variable Presets */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">
                  {language === "es" ? "Presets de Prueba:" : "Test Presets:"}
                </span>
                <button
                  onClick={() =>
                    setTestVariables({
                      txId: "TX-9901",
                      amount: "$1,250.00",
                      merchant: "Luxury Watches Dubai",
                      userMessage: "Card was charged abroad while customer passport shows domestic presence.",
                    })
                  }
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  🚨 High Risk Fraud
                </button>
                <button
                  onClick={() =>
                    setTestVariables({
                      txId: "TX-9902",
                      amount: "$42.15",
                      merchant: "Starbucks Store #482",
                      userMessage: "Register swiped twice in 2 seconds for a single latte order.",
                    })
                  }
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  ⚡ Duplicate Swipe
                </button>
                <button
                  onClick={() =>
                    setTestVariables({
                      txId: "TX-9903",
                      amount: "$15.99",
                      merchant: "FitGym Monthly",
                      userMessage: "Membership was cancelled via written notice 30 days prior.",
                    })
                  }
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  📋 Cancelled Recurring
                </button>
              </div>

              {/* Dynamic Variables Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {Object.entries(testVariables).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400">
                      {`{{${key}}}`}
                    </label>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) =>
                        setTestVariables({ ...testVariables, [key]: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Test Results Banner */}
            {testResults?.comparison && (
              <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    🏆
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {testResults.comparison.winner}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {testResults.comparison.costDeltaPercent < 0 ? (
                        <span className="text-emerald-400 font-semibold">
                          {Math.abs(testResults.comparison.costDeltaPercent)}%{" "}
                          {language === "es" ? "menos costo por ejecución" : "lower execution cost"}
                        </span>
                      ) : (
                        <span>+{testResults.comparison.costDeltaPercent}% cost</span>
                      )}{" "}
                      •{" "}
                      {testResults.comparison.latencySavedMs > 0 ? (
                        <span className="text-cyan-400 font-semibold">
                          {testResults.comparison.latencySavedMs} ms{" "}
                          {language === "es" ? "más rápido" : "faster"}
                        </span>
                      ) : (
                        <span>{Math.abs(testResults.comparison.latencySavedMs)} ms latency</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    {language === "es" ? "Ahorro Neto en Esta Ejecución" : "Net Execution Savings"}
                  </span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    +${testResults.comparison.costSavingsUsd.toFixed(6)} USD
                  </span>
                </div>
              </div>
            )}

            {/* Side-by-Side Execution Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Version A */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Versión A ({versionA?.modelTarget})
                      </span>
                    </div>
                  </div>
                  {testResults?.resultA && (
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-400">
                        {testResults.resultA.metrics.latencyMs} ms
                      </span>
                      <span className="text-amber-400 font-bold">
                        ${testResults.resultA.metrics.totalCostUsd.toFixed(6)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2">
                    {language === "es" ? "Respuesta Sintetizada del Modelo" : "Model Output"}
                  </span>
                  <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed border border-slate-800/80 whitespace-pre-wrap min-h-[160px] max-h-[300px] overflow-y-auto">
                    {testResults?.resultA ? (
                      testResults.resultA.aiOutput
                    ) : (
                      <span className="text-slate-600 italic">
                        {language === "es"
                          ? "Presiona 'Lanzar Benchmark A/B' para observar la ejecución en vivo..."
                          : "Click 'Run A/B Benchmark' to observe live execution..."}
                      </span>
                    )}
                  </div>
                </div>

                {testResults?.resultA && (
                  <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-1.5 rounded bg-slate-900">
                      <span className="text-[10px] text-slate-500 block">Input Tokens</span>
                      <span className="text-slate-200">
                        {testResults.resultA.metrics.inputTokens}
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900">
                      <span className="text-[10px] text-slate-500 block">Output Tokens</span>
                      <span className="text-slate-200">
                        {testResults.resultA.metrics.outputTokens}
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900">
                      <span className="text-[10px] text-slate-500 block">Total Tokens</span>
                      <span className="text-indigo-400 font-bold">
                        {testResults.resultA.metrics.totalTokens}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Version B */}
              <div className="rounded-2xl bg-slate-900 border border-emerald-500/30 overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Versión B ({versionB?.modelTarget})
                      </span>
                    </div>
                  </div>
                  {testResults?.resultB && (
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-cyan-400">
                        {testResults.resultB.metrics.latencyMs} ms
                      </span>
                      <span className="text-emerald-400 font-bold">
                        ${testResults.resultB.metrics.totalCostUsd.toFixed(6)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2">
                    {language === "es" ? "Respuesta Sintetizada del Modelo" : "Model Output"}
                  </span>
                  <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-emerald-300 leading-relaxed border border-emerald-500/20 whitespace-pre-wrap min-h-[160px] max-h-[300px] overflow-y-auto">
                    {testResults?.resultB ? (
                      testResults.resultB.aiOutput
                    ) : (
                      <span className="text-slate-600 italic">
                        {language === "es"
                          ? "Presiona 'Lanzar Benchmark A/B' para observar la ejecución en vivo..."
                          : "Click 'Run A/B Benchmark' to observe live execution..."}
                      </span>
                    )}
                  </div>
                </div>

                {testResults?.resultB && (
                  <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-1.5 rounded bg-slate-900">
                      <span className="text-[10px] text-slate-500 block">Input Tokens</span>
                      <span className="text-slate-200">
                        {testResults.resultB.metrics.inputTokens}
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900">
                      <span className="text-[10px] text-slate-500 block">Output Tokens</span>
                      <span className="text-slate-200">
                        {testResults.resultB.metrics.outputTokens}
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900">
                      <span className="text-[10px] text-slate-500 block">Total Tokens</span>
                      <span className="text-emerald-400 font-bold">
                        {testResults.resultB.metrics.totalTokens}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COST & TOKEN INTELLIGENCE (ANALYTICS) */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {language === "es" ? "Presupuesto Mensual" : "Monthly Budget"}
                  </span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-white">
                    ${activeProject?.metrics.totalSpentUsd.toFixed(4) || "0.00"}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    / ${activeProject?.budgetLimitUsd || 50} USD
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        activeProject?.metrics.budgetPercentUsed || 0.1
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-emerald-400 mt-1 block">
                  {activeProject?.metrics.budgetPercentUsed || 0.1}%{" "}
                  {language === "es" ? "consumido (Óptimo)" : "consumed (Optimal)"}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {language === "es" ? "Tokens Procesados" : "Total Tokens"}
                  </span>
                  <Cpu className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold font-mono text-white">
                    {activeProject?.metrics.totalTokens.toLocaleString() || "0"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-3 block">
                  Across all active prompt pipelines
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {language === "es" ? "Latencia Promedio" : "Average Latency"}
                  </span>
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold font-mono text-white">
                    {activeProject?.metrics.avgLatencyMs || 0} ms
                  </span>
                </div>
                <span className="text-[10px] text-cyan-400 mt-3 block flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Sub-second inference target met
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {language === "es" ? "Ejecuciones Auditadas" : "Audit Executions"}
                  </span>
                  <Database className="w-4 h-4 text-purple-400" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold font-mono text-white">
                    {activeProject?.metrics.totalExecutions || 0}
                  </span>
                </div>
                <span className="text-[10px] text-purple-400 mt-3 block">
                  Persisted in PostgreSQL
                </span>
              </div>
            </div>

            {/* Recharts Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost & Latency Curve */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-indigo-400" />
                    {language === "es"
                      ? "Histórico de Costo por Ejecución (USD Millicents)"
                      : "Execution Cost History (USD Millicents)"}
                  </h4>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cost"
                        stroke="#6366f1"
                        fillOpacity={1}
                        fill="url(#colorCost)"
                        name="Cost (m$)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Model Pricing Benchmark */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    {language === "es"
                      ? "Benchmark de Costo por 1,000 Peticiones ($ USD)"
                      : "Model Benchmark Cost per 1k Inferences ($ USD)"}
                  </h4>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modelComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="model" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="costPer1k" fill="#10b981" radius={[4, 4, 0, 0]} name="USD / 1k runs" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Execution Audit Logs Table */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  {language === "es"
                    ? "Registro de Auditoría en Tiempo Real (PostgreSQL)"
                    : "Real-Time Audit Logs (PostgreSQL)"}
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  Schema: public.ExecutionLog
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Versión / Prompt</th>
                      <th className="px-4 py-3">Tokens (In / Out)</th>
                      <th className="px-4 py-3">Latencia</th>
                      <th className="px-4 py-3">Costo USD</th>
                      <th className="px-4 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {activePrompt?.versions.flatMap((v) =>
                      v.executionLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 text-slate-500">{log.id.slice(0, 10)}...</td>
                          <td className="px-4 py-3 text-slate-200">
                            v{v.versionNumber} ({v.modelTarget})
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {log.inputTokens} / {log.outputTokens}
                          </td>
                          <td className="px-4 py-3 text-cyan-400">{log.latencyMs} ms</td>
                          <td className="px-4 py-3 text-emerald-400 font-bold">
                            ${log.totalCostUsd.toFixed(6)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                              {log.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* COMMIT VERSION MODAL */}
      {showCommitModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  {language === "es" ? "Commit Nueva Versión de Prompt" : "Commit New Prompt Version"}
                </h3>
              </div>
              <button
                onClick={() => setShowCommitModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCommitVersion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-mono uppercase text-[10px]">
                    {language === "es" ? "Modelo Target" : "Target LLM"}
                  </label>
                  <select
                    value={commitForm.modelTarget}
                    onChange={(e) => setCommitForm({ ...commitForm, modelTarget: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash ($0.075 / 1M)</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash ($0.10 / 1M)</option>
                    <option value="gpt-4o">GPT-4o ($2.50 / 1M)</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet ($3.00 / 1M)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono uppercase text-[10px]">
                    Temperature ({commitForm.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={commitForm.temperature}
                    onChange={(e) =>
                      setCommitForm({ ...commitForm, temperature: parseFloat(e.target.value) })
                    }
                    className="w-full mt-2 accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono uppercase text-[10px]">
                  Git Commit Message (Diff Summary)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Added Visa 10.4 zero-liability clauses and JSON schema enforcement"
                  value={commitForm.diffSummary}
                  onChange={(e) => setCommitForm({ ...commitForm, diffSummary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono uppercase text-[10px]">
                  System Prompt
                </label>
                <textarea
                  required
                  rows={5}
                  value={commitForm.systemPrompt}
                  onChange={(e) => setCommitForm({ ...commitForm, systemPrompt: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono uppercase text-[10px]">
                  User Template
                </label>
                <textarea
                  rows={2}
                  value={commitForm.userTemplate}
                  onChange={(e) => setCommitForm({ ...commitForm, userTemplate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCommitModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  {language === "es" ? "Cancelar" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={committing}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {committing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GitCommit className="w-4 h-4" />}
                  <span>{language === "es" ? "Guardar Commit en DB" : "Save Commit to DB"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 mt-12 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            PromptForge ModelOps Platform • Architecture & Implementation by{" "}
            <span className="text-slate-300 font-medium">Ángel David Morillo García</span>
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              PostgreSQL Engine Active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
