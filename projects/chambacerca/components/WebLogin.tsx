'use client';

import { useState } from 'react';
import {
  Compass,
  Briefcase,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  ArrowRight,
  Sparkles,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Footprints,
  Clock,
  DollarSign,
  GraduationCap,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface WebLoginProps {
  onLoginSuccess: (user: any) => void;
  onContinueAsGuest: () => void;
}

export default function WebLogin({ onLoginSuccess, onContinueAsGuest }: WebLoginProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'SEEKER' | 'EMPLOYER'>('SEEKER');

  // Campos de formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Envío de Formulario
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        tab === 'login'
          ? { email: email.trim(), password }
          : {
              email: email.trim(),
              password,
              name: name.trim(),
              role,
              company: role === 'EMPLOYER' ? company.trim() : null,
              phone: phone.trim() || null,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Ocurrió un error. Verifica tus credenciales.');
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message || '¡Acceso concedido! Entrando al radar...');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 400);
    } catch {
      setErrorMsg('Error de conexión con el servidor. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // Acceso Rápido 1 Clic con Cuentas Demo
  async function handleQuickLogin(demoEmail: string, demoPass: string) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      setSuccessMsg('¡Bienvenido! Entrando al radar...');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#080D15] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Luces Ambientales de Fondo */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 15% 20%, rgba(16, 185, 129, 0.08), transparent 45%), radial-gradient(circle at 85% 60%, rgba(6, 182, 212, 0.06), transparent 45%), radial-gradient(circle at 50% 90%, rgba(59, 130, 246, 0.05), transparent 50%)'
        }}
      />

      {/* Cabecera Superior Web con Adaptabilidad Safe-Area para Móviles y Muescas */}
      <header className="sticky top-0 z-30 w-full bg-[#080D15]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 pt-[max(env(safe-area-inset-top),42px)] sm:pt-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-950/60 flex items-center justify-center">
              <div className="w-full h-full bg-[#080D15] rounded-[9px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-0.5">
                Chamba<span className="text-emerald-400">Cerca</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Radar de Empleo de Proximidad • Venezuela
              </p>
            </div>
          </div>

          {/* Botón para entrar directo como Invitado */}
          <button
            onClick={onContinueAsGuest}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-xs font-bold text-emerald-300 hover:text-white transition shadow-sm cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Explorar como Invitado</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Cuerpo Principal: Split-Screen en Computadora / Card Centrado en Móvil */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12 flex-1 flex items-center">
        
        {/* =========================================================================
            FONDO DE RADAR DINÁMICO TÁCTICO CON HAZ DE SONAR (SOLO EN ESCRITORIO WEB)
            ========================================================================= */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Anillo Exterior Concentrico Giratorio Lento */}
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full border border-emerald-500/10 animate-spin-very-slow flex items-center justify-center">
            <div className="w-[85%] h-[85%] rounded-full border border-dashed border-teal-500/15 flex items-center justify-center">
              <div className="w-[70%] h-[70%] rounded-full border border-cyan-500/10 flex items-center justify-center">
                {/* Haz Láser Giratorio de Radar Táctico */}
                <div className="w-full h-full rounded-full animate-radar-sweep"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(16, 185, 129, 0.12) 360deg)'
                  }}
                />
              </div>
            </div>
            {/* Marcadores Cardinales Tácticos */}
            <span className="absolute top-2 text-[9px] font-mono text-emerald-500/40">N 000°</span>
            <span className="absolute right-2 text-[9px] font-mono text-emerald-500/40">E 090°</span>
            <span className="absolute bottom-2 text-[9px] font-mono text-emerald-500/40">S 180°</span>
            <span className="absolute left-2 text-[9px] font-mono text-emerald-500/40">W 270°</span>
          </div>

          {/* Cruz Cardinal de Coordenadas */}
          <div className="absolute left-[200px] top-1/2 -translate-y-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" />
          <div className="absolute left-[350px] top-1/2 -translate-y-1/2 h-[300px] w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-emerald-500/15 to-transparent" />
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* =========================================================================
              COLUMNA IZQUIERDA: HERO, BADGES FLOTANTES Y PROPUESTA DE VALOR WEB
              ========================================================================= */}
          <div className="lg:col-span-7 space-y-6 text-left relative">
            
            {/* BADGES FLOTANTES DE OPORTUNIDADES EN VIVO (SOLO EN ESCRITORIO WEB) */}
            {/* Flotante 1: Farmatodo */}
            <div className="hidden lg:flex absolute -top-8 right-4 z-20 items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#0B131F]/90 border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.25)] backdrop-blur-md animate-float-slow pointer-events-none">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xs">
                🏥
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <span>Farmatodo Chacao</span>
                  <span className="text-[8px] font-black uppercase tracking-wider px-1 py-0.2 bg-emerald-950 text-emerald-400 rounded border border-emerald-500/40">Activa</span>
                </p>
                <p className="text-[10px] text-emerald-300 font-mono">🚶 450m a pie • $210 USD • Turno Rotativo</p>
              </div>
            </div>

            {/* Flotante 2: Docente / Educación */}
            <div className="hidden lg:flex absolute top-[45%] -left-6 z-20 items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#0B131F]/90 border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.2)] backdrop-blur-md animate-float-delayed pointer-events-none">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-xs">
                🎓
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <span>Colegio San Ignacio</span>
                  <span className="text-[8px] font-black uppercase tracking-wider px-1 py-0.2 bg-cyan-950 text-cyan-400 rounded border border-cyan-500/40">Docente</span>
                </p>
                <p className="text-[10px] text-cyan-300 font-mono">🚶 850m a pie • $280 USD • Lun a Vie</p>
              </div>
            </div>

            {/* Badge de Seguridad y Validación */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Convocatorias 100% Auditadas • Sin Gestores ni Cobros</span>
            </div>

            {/* Gran Título Web con Tipografía Vanguardista */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
              Tu próxima chamba,{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                a pasos de tu casa.
              </span>
            </h2>

            {/* Descripción Web Concisa */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Olvídate de perder 4 horas diarias y hasta $40 al mes en camioneticas. 
              <strong> ChambaCerca</strong> te ubica ofertas reales y verificadas en comercios, 
              supermercados, clínicas y colegios a distancia caminable de donde vives.
            </p>

            {/* Ticker de Métricas en Vivo (Solo en Escritorio Web) */}
            <div className="hidden lg:grid grid-cols-4 gap-2.5 p-2 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-sm shadow-inner">
              <div className="text-center p-2 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <p className="text-base font-black text-emerald-400 tracking-tight font-mono">33</p>
                <p className="text-[10px] text-slate-400 font-medium">Vacantes Hoy</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <p className="text-base font-black text-cyan-400 tracking-tight font-mono">&lt; 15 min</p>
                <p className="text-[10px] text-slate-400 font-medium">A Pie de Casa</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <p className="text-base font-black text-amber-400 tracking-tight font-mono">$0</p>
                <p className="text-[10px] text-slate-400 font-medium">En Camionetica</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <p className="text-base font-black text-teal-400 tracking-tight font-mono">24 Horas</p>
                <p className="text-[10px] text-slate-400 font-medium">Rotación Diaria</p>
              </div>
            </div>

            {/* 3 Pilares Destacados con Micro-Interacciones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all duration-300 text-left space-y-1 group">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                  <Footprints className="w-4 h-4" />
                  <span>A Pie (&lt;1.5 km)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Minutos y pasos calculados para llegar caminando y ahorrar pasajes.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all duration-300 text-left space-y-1 group">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                  <Clock className="w-4 h-4" />
                  <span>Rotación 24 Horas</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Nuevos cupos y vacantes actualizadas todos los días a la medianoche.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/90 transition-all duration-300 text-left space-y-1 group">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                  <DollarSign className="w-4 h-4" />
                  <span>Sueldos Claros</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Salarios en divisas con referencia oficial BCV y beneficios de ley.
                </p>
              </div>
            </div>

            {/* Ticker de Cobertura Activa */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
              <span>Cobertura activa en Caracas, Valencia, Maracaibo, Barquisimeto y Maracay</span>
            </div>
          </div>

          {/* =========================================================================
              COLUMNA DERECHA: TARJETA DE AUTENTICACIÓN WEB ELEGANTE CON BORDE GLOW
              ========================================================================= */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto relative">
            
            {/* Resplandor Luminiscente de Fondo para la Tarjeta (Desktop Web) */}
            <div className="hidden lg:block absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-cyan-500/20 rounded-[32px] blur-xl opacity-70 group-hover:opacity-100 transition duration-1000 -z-10" />

            {/* Contenedor con Borde Gradiente Suave */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-b from-emerald-500/35 via-slate-700/60 to-slate-800/80 shadow-2xl shadow-emerald-950/40">
              <div className="p-6 sm:p-8 rounded-[23px] bg-[#0D1524]/95 backdrop-blur-xl relative">
                
                {/* Selector de Pestaña: Iniciar Sesión / Crear Cuenta con Indicador Dinámico */}
                <div className="flex p-1 bg-slate-950/80 border border-slate-800 rounded-xl mb-5 relative">
                  <button
                    type="button"
                    onClick={() => { setTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                      tab === 'login'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTab('register'); setErrorMsg(null); setSuccessMsg(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                      tab === 'register'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Crear Cuenta
                  </button>
                </div>

                {/* Mensajes de Estado */}
                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
                  {tab === 'register' && (
                    <>
                      {/* Selector de Rol */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          ¿Cómo usarás ChambaCerca?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setRole('SEEKER')}
                            className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                              role === 'SEEKER'
                                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <User className="w-3.5 h-3.5" />
                            <span>Busco Empleo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRole('EMPLOYER')}
                            className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                              role === 'EMPLOYER'
                                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Soy Negocio / RRHH</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Nombre Completo *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            required
                            placeholder="Tu nombre y apellido"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition"
                          />
                        </div>
                      </div>

                      {role === 'EMPLOYER' && (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Empresa o Comercio *
                          </label>
                          <div className="relative">
                            <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              required
                              placeholder="Nombre del comercio"
                              value={company}
                              onChange={(e) => setCompany(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Correo Electrónico *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="usuario@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition"
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Botón Principal con Efecto Shimmer y Hover Elevado */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 shadow-lg shadow-emerald-950/60 hover:shadow-emerald-900/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mt-1 cursor-pointer"
                  >
                    <span>{loading ? 'Verificando...' : tab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                {/* Acceso Rápido con Cuentas Demo de Prueba */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>O entra con credenciales de prueba:</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">1 Clic</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('carlos.perez@ejemplo.com', 'Password123!')}
                      className="group p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/60 text-[11px] font-semibold text-emerald-300 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col gap-0.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">👤</span>
                        <span className="truncate font-bold text-slate-200 group-hover:text-emerald-300">Buscador</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono truncate">Carlos (Postulante)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('rrhh@plazas.com', 'Chamba2026!')}
                      className="group p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/60 text-[11px] font-semibold text-cyan-300 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col gap-0.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🏢</span>
                        <span className="truncate font-bold text-slate-200 group-hover:text-cyan-300">Empleador</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono truncate">Plazas (RRHH)</span>
                    </button>
                  </div>
                </div>

                {/* Botón inferior para continuar como invitado */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
                  <button
                    type="button"
                    onClick={onContinueAsGuest}
                    className="text-xs text-slate-400 hover:text-emerald-400 transition font-semibold flex items-center justify-center gap-1 w-full cursor-pointer group"
                  >
                    <span>¿Prefieres explorar antes? Entrar como Invitado</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Badge de Confianza y Seguridad */}
                <div className="mt-3 pt-2 flex items-center justify-center gap-2 text-[10px] text-slate-500">
                  <ShieldCheck className="w-3 h-3 text-emerald-500/70" />
                  <span>Conexión cifrada SSL • Neon PostgreSQL 2026</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Pie de Página Web */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 text-center text-xs text-slate-400 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p><strong>ChambaCerca</strong> © 2026 • Plataforma de empleo de proximidad para toda Venezuela</p>
        <p className="text-emerald-400 text-[11px]">● Conectado en tiempo real a base de datos Neon PostgreSQL</p>
      </footer>
    </div>
  );
}
