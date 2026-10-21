"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al iniciar sesión.");

            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 selection:bg-indigo-500/20 selection:text-indigo-300">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl text-white shadow-xl shadow-indigo-500/20 mb-2">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Acceso a Nexus SaaS</h1>
                    <p className="text-xs text-slate-400">Ingresa tus credenciales para acceder a tu entorno empresarial</p>
                </div>

                {error && (
                    <div className="p-3.5 bg-rose-950/40 border border-rose-800/50 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-4 shadow-xl">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Iniciar Sesión</span><ArrowRight className="w-3.5 h-3.5" /></>}
                    </button>

                    <p className="text-center text-xs text-slate-500 pt-2">
                        ¿No tienes una cuenta aún?{" "}
                        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
                            Crea una organización
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}