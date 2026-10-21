"use client";

import { useState, useEffect } from "react";
import {
    FolderGit2,
    Users,
    CheckCircle2,
    Plus,
    Activity,
    Layers,
    Loader2,
    X,
} from "lucide-react";
import { useLanguage } from "@/lib/useLanguage";

export default function DashboardHome() {
    const { lang, setLang, t } = useLanguage();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectKey, setProjectKey] = useState("");
    const [projectDesc, setProjectDesc] = useState("");
    const [creating, setCreating] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/dashboard/stats");
            const json = await res.json();
            if (res.ok) setData(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: projectName,
                    key: projectKey,
                    description: projectDesc,
                }),
            });

            if (res.ok) {
                setProjectName("");
                setProjectKey("");
                setProjectDesc("");
                setIsModalOpen(false);
                fetchStats();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center text-xs text-slate-400 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                <span>{t.loadingDb}</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ENCABEZADO */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {t.welcome}, {data?.user?.name} 👋
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        {t.orgLabel}: <span className="font-semibold text-slate-200">{data?.organization?.name}</span> &middot; {t.planLabel}:{" "}
                        <span className="text-indigo-400 font-semibold">{data?.organization?.plan}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs md:hidden">
                        <button
                            onClick={() => setLang("es")}
                            className={`px-2.5 py-1 rounded-lg font-medium transition ${lang === "es" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                                }`}
                        >
                            🇪🇸 ES
                        </button>
                        <button
                            onClick={() => setLang("en")}
                            className={`px-2.5 py-1 rounded-lg font-medium transition ${lang === "en" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                                }`}
                        >
                            🇺🇸 EN
                        </button>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/25 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{t.newProjectBtn}</span>
                    </button>
                </div>
            </div>

            {/* MÉTRICAS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-medium">{t.activeProjects}</span>
                        <FolderGit2 className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-2xl font-black text-white">{data?.organization?.projectCount}</span>
                    <span className="text-[11px] text-slate-500 block mt-1">{t.activeProjectsSub}</span>
                </div>

                <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-medium">{t.teamMembers}</span>
                        <Users className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-2xl font-black text-white">{data?.organization?.memberCount}</span>
                    <span className="text-[11px] text-slate-500 block mt-1">{t.activeRole}: {data?.user?.role}</span>
                </div>

                <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-medium">{t.tasksTickets}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-2xl font-black text-white">{data?.organization?.taskCount}</span>
                    <span className="text-[11px] text-slate-500 block mt-1">{t.tasksSub}</span>
                </div>
            </div>

            {/* PROYECTOS Y AUDITORÍA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-400" />
                            {t.orgProjects}
                        </h2>
                        <span className="text-xs text-slate-500">{data?.projects?.length} {t.registeredCount}</span>
                    </div>

                    <div className="space-y-3">
                        {data?.projects?.length === 0 ? (
                            <div className="p-8 text-center border-2 border-dashed border-slate-800/80 rounded-xl text-slate-500 text-xs">
                                {t.noProjectsYet}
                            </div>
                        ) : (
                            data?.projects?.map((proj: any) => (
                                <div
                                    key={proj.id}
                                    className="p-4 bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center justify-between transition group"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800/50 text-indigo-400 font-mono text-[10px] font-bold">
                                                {proj.key}
                                            </span>
                                            <h3 className="font-semibold text-sm text-white">{proj.name}</h3>
                                        </div>
                                        {proj.description && (
                                            <p className="text-xs text-slate-400 line-clamp-1">{proj.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right text-xs">
                                        <span className="text-slate-400 font-mono">{proj.tasks?.length || 0} {t.tasksSuffix}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* LOGS DE AUDITORÍA */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        {t.auditLogTitle}
                    </h2>
                    <div className="space-y-3">
                        {data?.auditLogs?.map((log: any) => (
                            <div key={log.id} className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-xl text-xs space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-mono font-bold text-indigo-400">{log.action}</span>
                                    <span className="text-slate-500">
                                        {new Date(log.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                                <p className="text-slate-300 text-[11px] leading-snug">{log.details}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL NUEVO PROYECTO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="font-bold text-lg text-white mb-4">{t.modalTitle}</h3>

                        <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">{t.projectNameLabel}</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Core Payment Gateway"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">{t.projectKeyLabel}</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={5}
                                    placeholder="Ej: PAY"
                                    value={projectKey}
                                    onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">{t.projectDescLabel}</label>
                                <textarea
                                    rows={2}
                                    placeholder="Propósito del proyecto..."
                                    value={projectDesc}
                                    onChange={(e) => setProjectDesc(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                                >
                                    {t.cancelBtn}
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition flex items-center gap-1.5"
                                >
                                    {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{t.saveProjectBtn}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}