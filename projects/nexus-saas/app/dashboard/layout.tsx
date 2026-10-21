"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Building2,
    ShieldCheck,
    LogOut,
    ChevronRight,
    Sparkles,
    Globe,
} from "lucide-react";
import { useLanguage } from "@/lib/useLanguage";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { lang, setLang, t } = useLanguage();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-300">
            {/* SIDEBAR EMPRESARIAL */}
            <aside className="w-64 border-r border-slate-800/80 bg-slate-900/40 p-5 flex flex-col justify-between hidden md:flex backdrop-blur-md">
                <div className="space-y-6">
                    {/* Logo y Badge */}
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-bold text-base tracking-tight text-white">{t.systemTitle}</span>
                            <span className="text-[10px] text-indigo-400 block font-semibold uppercase tracking-wider">
                                {t.systemBadge}
                            </span>
                        </div>
                    </div>

                    {/* Selector Global de Idioma */}
                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5 pl-1.5">
                            <Globe className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Idioma:</span>
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setLang("es")}
                                className={`px-2 py-0.5 rounded-lg font-medium transition ${lang === "es" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                🇪🇸 ES
                            </button>
                            <button
                                onClick={() => setLang("en")}
                                className={`px-2 py-0.5 rounded-lg font-medium transition ${lang === "en" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                🇺🇸 EN
                            </button>
                        </div>
                    </div>

                    {/* Navegación */}
                    <nav className="space-y-1">
                        <Link
                            href="/dashboard"
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        >
                            <div className="flex items-center gap-2.5">
                                <Building2 className="w-4 h-4" />
                                <span>{t.overviewNav}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </nav>
                </div>

                {/* Footer del Sidebar */}
                <div className="border-t border-slate-800/80 pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-800/40 p-2 rounded-xl">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>{t.postgresActive}</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-2 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 p-2.5 rounded-xl transition font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>{loggingOut ? t.signingOut : t.signOutBtn}</span>
                    </button>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <div className="flex-1 flex flex-col min-h-screen">
                <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
            </div>
        </div>
    );
}