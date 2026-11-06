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

      {/* Cabecera Superior Web */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between border-b border-slate-800/80">
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
      </header>

      {/* Cuerpo Principal: Split-Screen en Computadora / Card Centrado en Móvil */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* =========================================================================
              COLUMNA IZQUIERDA: HERO Y PROPUESTA DE VALOR WEB (DESKTOP / LAPTOP)
              ========================================================================= */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Badge de Seguridad y Validación */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Convocatorias 100% Auditadas • Sin Gestores ni Cobros</span>
            </div>

            {/* Gran Título Web */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
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

            {/* 3 Pilares Destacados */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Footprints className="w-4 h-4" />
                  <span>A Pie (&lt;1.5 km)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Minutos y pasos calculados para llegar caminando y ahorrar pasajes.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Clock className="w-4 h-4" />
                  <span>Rotación 24 Horas</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Nuevos cupos y vacantes actualizadas todos los días a la medianoche.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
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
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cobertura activa en Caracas, Valencia, Maracaibo, Barquisimeto y Maracay</span>
            </div>
          </div>

          {/* =========================================================================
              COLUMNA DERECHA: TARJETA DE AUTENTICACIÓN WEB LIMPIA Y MODERNA
              ========================================================================= */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0D1524]/95 border border-slate-700/80 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl relative">
              
              {/* Selector de Pestaña: Iniciar Sesión / Crear Cuenta */}
              <div className="flex p-1 bg-slate-950/80 border border-slate-800 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    tab === 'login'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    tab === 'register'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>

              {/* Mensajes de Estado */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
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
                          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
                            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
                      className="w-full pl-9 pr-9 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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

                {/* Botón Principal */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-950 disabled:opacity-50 mt-1 cursor-pointer"
                >
                  <span>{loading ? 'Verificando...' : tab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Acceso Rápido con Cuentas Demo de Prueba */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
                <p className="text-[11px] text-slate-400 font-medium text-center">
                  O entra con 1 clic con credenciales de prueba:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('carlos.perez@ejemplo.com', 'Password123!')}
                    className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-[11px] font-semibold text-emerald-300 text-left transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>👤</span>
                    <span className="truncate">Buscador (Carlos)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('rrhh@plazas.com', 'Chamba2026!')}
                    className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-[11px] font-semibold text-cyan-300 text-left transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🏢</span>
                    <span className="truncate">Empleador (Plazas)</span>
                  </button>
                </div>
              </div>

              {/* Botón inferior para continuar como invitado */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition font-semibold flex items-center justify-center gap-1 w-full cursor-pointer"
                >
                  <span>¿Prefieres explorar antes? Entrar como Invitado</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
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
