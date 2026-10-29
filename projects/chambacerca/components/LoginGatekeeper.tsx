'use client';

import { useState } from 'react';
import {
  Compass,
  Briefcase,
  ShieldCheck,
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Sparkles,
  LogIn,
  Eye,
  EyeOff,
  Store,
  MapPin,
  AlertCircle,
  DollarSign,
  TrendingDown,
  Radio,
  Zap,
} from 'lucide-react';

interface LoginGatekeeperProps {
  onLoginSuccess: (user: any) => void;
  onContinueAsGuest: () => void;
}

export default function LoginGatekeeper({
  onLoginSuccess,
  onContinueAsGuest,
}: LoginGatekeeperProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [persona, setPersona] = useState<'SEEKER' | 'EMPLOYER'>('SEEKER');
  const [activeTabFeature, setActiveTabFeature] = useState<'radar' | 'real' | 'savings'>('radar');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Manejo de envío
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        authMode === 'login'
          ? { email: email.trim(), password }
          : {
              email: email.trim(),
              password,
              name: name.trim(),
              role: persona,
              company: persona === 'EMPLOYER' ? company.trim() : null,
              phone: phone.trim() || null,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Ocurrió un error. Verifica tus credenciales.');
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message || '¡Acceso concedido!');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 500);
    } catch {
      setErrorMessage('Error de conexión con el servidor. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // Acceso Demo 1 Clic
  async function handleDemoLogin(demoEmail: string, demoPass: string) {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'No se pudo iniciar sesión con la demo.');
        setLoading(false);
        return;
      }

      setSuccessMessage(`¡Bienvenido de vuelta, ${data.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 400);
    } catch {
      setErrorMessage('Error al conectar con la demo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060A12] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans">
      {/* Luces y mallas de fondo dinámicas (Colores originales preservados) */}
      <div className="absolute top-0 left-1/4 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-5 sm:right-10 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-teal-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-5 sm:left-10 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-cyan-500/5 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />

      {/* Grid sutil futurista */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* =========================================================================
          BARRA DE NAVEGACIÓN SUPERIOR FLOTANTE ADAPTABLE
          ========================================================================= */}
      <header className="relative z-20 px-3.5 sm:px-8 py-3 sm:py-5 max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#060A12] rounded-[10px] flex items-center justify-center">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 animate-spin-slow" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-lg sm:text-xl tracking-tight text-white whitespace-nowrap">
                Chamba<span className="text-emerald-400">Cerca</span>
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full shrink-0">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                <span className="hidden xs:inline">RADAR GPS</span> VZLA
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:block truncate">
              Radar de Empleo de Proximidad • Menos transporte, más calidad de vida
            </p>
          </div>
        </div>

        {/* Acceso Directo de Invitado (Compacto y adaptable en móviles) */}
        <button
          onClick={onContinueAsGuest}
          className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/40 text-xs font-semibold text-slate-300 hover:text-white transition shadow-sm cursor-pointer shrink-0"
        >
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="hidden xs:inline">Explorar Mapa como Invitado</span>
          <span className="xs:hidden font-bold text-emerald-400">Explorar Mapa</span>
          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
        </button>
      </header>

      {/* =========================================================================
          CONTENIDO PRINCIPAL: HERO, LOGIN ARRIBA Y RADAR SONAR DEBAJO
          ========================================================================= */}
      <main className="relative z-10 max-w-4xl mx-auto w-full px-3.5 sm:px-8 py-3 sm:py-8 flex-1 flex flex-col gap-6 sm:gap-8 items-center">
        
        {/* =========================================================================
            1. SECCIÓN DE TEXTO SUPERIOR (TITULAR & PROPUESTA DE VALOR)
            ========================================================================= */}
        <div className="w-full space-y-3 sm:space-y-4 text-left">
          {/* Badge de Impacto Social */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 shadow-inner max-w-full">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Plataforma Comunitaria contra el Desempleo en Venezuela</span>
          </div>

          {/* Gran Titular Adaptable */}
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.18]">
            Tu próxima chamba no debería quedarte a{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              dos horas de viaje
            </span>.
          </h1>

          {/* Explicación Concisa y Humana */}
          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-3xl font-normal">
            En Venezuela, gastar hasta $40 al mes en camioneticas y perder 4 horas diarias en cola deprime cualquier salario. 
            <strong> ChambaCerca</strong> usa el GPS de tu teléfono o computadora para mostrarte vacantes reales 
            <strong> a pie o en transporte corto</strong> de tu casa, auditadas directamente de 
            <strong> CompuTrabajo, LinkedIn, Instagram</strong> y canales oficiales de RRHH.
          </p>
        </div>

        {/* =========================================================================
            2. TARJETA DE LOGIN Y REGISTRO (ARRIBA, DIRECTAMENTE DEBAJO DEL TEXTO)
            ========================================================================= */}
        <div id="formulario-acceso" className="w-full max-w-xl scroll-mt-6">
          <div className="p-4 xs:p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-slate-900/95 via-[#0A0F1D]/95 to-[#070B16]/95 border border-emerald-500/30 shadow-2xl shadow-emerald-950/40 backdrop-blur-2xl relative">
            
            {/* Holograma superior */}
            <div className="absolute top-0 right-6 sm:right-8 -translate-y-1/2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center gap-1.5">
              <Zap className="w-3 h-3 fill-current" />
              <span>Acceso Inmediato</span>
            </div>

            {/* Cabecera de la tarjeta */}
            <div className="mb-4 sm:mb-5 space-y-1 text-left">
              <h2 className="text-lg xs:text-xl sm:text-2xl font-black text-white tracking-tight">
                {authMode === 'login' ? 'Bienvenido a ChambaCerca' : 'Crea tu Cuenta Gratuita'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                {authMode === 'login'
                  ? 'Ingresa para ver oportunidades en tu radio y postularte.'
                  : 'Regístrate para guardar vacantes o publicar ofertas de tu negocio.'}
              </p>
            </div>

            {/* Selector de Modo: Login / Registro */}
            <div className="flex p-1 bg-slate-950/80 border border-slate-800/90 rounded-xl sm:rounded-2xl mb-3.5 sm:mb-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-lg sm:rounded-xl transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-lg sm:rounded-xl transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Registrarme
              </button>
            </div>

            {/* Mensajes de Alerta */}
            {errorMessage && (
              <div className="mb-3.5 p-2.5 sm:p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-3.5 p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
              {authMode === 'register' && (
                <>
                  {/* Selector de Persona / Rol */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      ¿Cómo vas a usar ChambaCerca?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPersona('SEEKER')}
                        className={`p-2 sm:p-2.5 rounded-xl border text-left flex flex-col transition cursor-pointer ${
                          persona === 'SEEKER'
                            ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Busco Empleo</span>
                        </div>
                        <span className="text-[9.5px] sm:text-[10px] text-slate-400 mt-0.5">Guardar y postularme</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPersona('EMPLOYER')}
                        className={`p-2 sm:p-2.5 rounded-xl border text-left flex flex-col transition cursor-pointer ${
                          persona === 'EMPLOYER'
                            ? 'bg-teal-500/15 border-teal-500 text-white shadow-sm'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Store className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>Soy Negocio</span>
                        </div>
                        <span className="text-[9.5px] sm:text-[10px] text-slate-400 mt-0.5">Publicar vacantes</span>
                      </button>
                    </div>
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. José Manuel Da Silva"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Nombre de la Empresa si es empleador */}
                  {persona === 'EMPLOYER' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Nombre de tu Comercio o Empresa
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Ej. Frutería La Castellana"
                          className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Teléfono WhatsApp */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Teléfono WhatsApp (Opcional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej. 0414 123 4567"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Correo */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1 active:scale-[0.99]"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>
                      {authMode === 'login' ? 'Encender Radar de Chamba' : 'Registrarme y Acceder'}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* SECCIÓN MODO INVITADO */}
            <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-slate-800/80 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between text-[11px] gap-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5 truncate">
                  <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">¿Prefieres explorar antes de crear cuenta?</span>
                </span>
                <span className="text-[9px] sm:text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold shrink-0">
                  1 Clic
                </span>
              </div>

              {/* Botón Modo Invitado con Borde Láser Giratorio */}
              <div className="border-laser-container shadow-2xl shadow-cyan-950/60 my-1.5 sm:my-2">
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="border-laser-content w-full py-2.5 sm:py-3 px-3 sm:px-4 text-white flex items-center justify-between transition-all group cursor-pointer hover:bg-slate-900"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform shrink-0">
                      <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 animate-pulse" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm font-black text-white group-hover:text-cyan-300 transition-colors truncate">
                          Pruébalo al instante sin registrarte
                        </span>
                        <span className="text-[8px] sm:text-[9px] font-black tracking-wider uppercase px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 rounded-full font-mono shadow-sm shrink-0">
                          INVITADO
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 group-hover:text-slate-300 truncate">
                        Entra directo al radar de Google Maps con tu GPS en tiempo real
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0 ml-1">
                    <span className="text-xs font-bold hidden sm:inline">Explorar</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </button>
              </div>

              {/* Cuentas de Demostración Rápidas */}
              <div className="pt-1">
                <p className="text-[10px] text-slate-500 font-semibold mb-1.5 text-center">
                  O entra con una cuenta demo:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('carlos.perez@ejemplo.com', 'Password123!')}
                    disabled={loading}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-900 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-bold text-white group-hover:text-emerald-400 truncate">Carlos Pérez</span>
                    </div>
                    <p className="text-[8.5px] sm:text-[9px] text-slate-400 truncate">Demo Buscador</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('rrhh@plazas.com', 'Chamba2026!')}
                    disabled={loading}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-teal-500/50 hover:bg-slate-900 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-bold text-white group-hover:text-teal-400 truncate">RRHH Plaza's</span>
                    </div>
                    <p className="text-[8.5px] sm:text-[9px] text-slate-400 truncate">Demo Comercio</p>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
            3. RADAR GPS SONAR Y DEMÁS (DEBAJO DEL LOGIN)
            ========================================================================= */}
        <div className="w-full max-w-3xl space-y-4 sm:space-y-6 pt-4 border-t border-slate-800/80">
          
          {/* Encabezado Táctico de Demostración */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
              </span>
              <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                Simulador del Radar GPS Sonar en Vivo
              </h2>
            </div>
            <span className="text-[9.5px] sm:text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
              MAPA DE PROXIMIDAD
            </span>
          </div>

          {/* SELECTOR INTERACTIVO DE PESTAÑAS DEMOSTRATIVAS */}
          <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTabFeature('radar')}
              className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 text-center ${
                activeTabFeature === 'radar'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Simulador Radar</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabFeature('real')}
              className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 text-center ${
                activeTabFeature === 'real'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-400 shrink-0" />
              <span className="truncate">100% Auditadas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabFeature('savings')}
              className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 text-center ${
                activeTabFeature === 'savings'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Ahorro Pasaje</span>
            </button>
          </div>

          {/* WIDGET INTERACTIVO DE CONVERSIÓN VISUAL SEGÚN PESTAÑA */}
          <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0B1220]/90 via-[#0A101C]/90 to-[#070B14]/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl">
            {activeTabFeature === 'radar' && (
              <div className="space-y-3.5 sm:space-y-4 animate-fade-in">
                {/* HUD Telemetría del Simulador */}
                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
                    </span>
                    <span className="truncate">Radar GPS Sonar en Vivo:</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse shrink-0">
                    GPS LOCK: &lt; 15m
                  </span>
                </div>

                {/* VISOR SONAR RADAR TÁCTICO CIRCULAR */}
                <div className="relative w-full h-44 xs:h-48 sm:h-56 rounded-2xl bg-slate-950/90 border border-emerald-500/30 overflow-hidden flex items-center justify-center shadow-inner">
                  {/* Cuadrícula Táctica de Fondo */}
                  <div 
                    className="absolute inset-0 opacity-[0.05]" 
                    style={{
                      backgroundImage: 'radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)',
                      backgroundSize: '20px 20px'
                    }}
                  />

                  {/* Anillos Concéntricos Militares */}
                  <div className="relative w-36 h-36 xs:w-44 xs:h-44 sm:w-48 sm:h-48 rounded-full border border-emerald-500/30 flex items-center justify-center">
                    {/* Anillo de 1 km */}
                    <div className="w-[70%] h-[70%] rounded-full border border-dashed border-teal-400/35 flex items-center justify-center">
                      {/* Anillo de 500m (a pie) */}
                      <div className="w-[50%] h-[50%] rounded-full border border-emerald-400/40" />
                    </div>

                    {/* Cruz Cardinal */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-full h-[1px] bg-emerald-500/20" />
                      <div className="h-full w-[1px] bg-emerald-500/20" />
                    </div>

                    {/* Marcas de Grados */}
                    <span className="absolute -top-3 text-[8px] font-mono font-bold text-emerald-400/80">000°</span>
                    <span className="absolute -right-3 text-[8px] font-mono font-bold text-emerald-400/80">090°</span>
                    <span className="absolute -bottom-3 text-[8px] font-mono font-bold text-emerald-400/80">180°</span>
                    <span className="absolute -left-3 text-[8px] font-mono font-bold text-emerald-400/80">270°</span>

                    {/* Pin Central: Tu Ubicación GPS */}
                    <div className="absolute z-10 flex flex-col items-center">
                      <div className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_10px_#3B82F6]" />
                      <span className="text-[8px] sm:text-[9px] font-extrabold text-blue-300 mt-0.5 bg-slate-950/80 px-1 rounded shadow">Tú</span>
                    </div>

                    {/* Eco Blip 1: Automercados Plaza's (450m) */}
                    <div className="absolute top-4 sm:top-6 right-5 sm:right-8 z-10 flex flex-col items-center group cursor-pointer">
                      <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-90"></span>
                        <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-400 shadow-[0_0_10px_#10B981]"></span>
                      </span>
                      <span className="text-[7.5px] sm:text-[8px] font-bold text-emerald-300 bg-slate-950/90 px-1 py-0.2 rounded border border-emerald-500/40 mt-0.5 whitespace-nowrap">
                        Plaza's • 450m
                      </span>
                    </div>

                    {/* Eco Blip 2: Pastelería Danubio (820m) */}
                    <div className="absolute bottom-5 sm:bottom-7 right-4 sm:right-6 z-10 flex flex-col items-center group cursor-pointer">
                      <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-90"></span>
                        <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-teal-400 shadow-[0_0_10px_#14B8A6]"></span>
                      </span>
                      <span className="text-[7.5px] sm:text-[8px] font-bold text-teal-300 bg-slate-950/90 px-1 py-0.2 rounded border border-teal-500/40 mt-0.5 whitespace-nowrap">
                        Danubio • 820m
                      </span>
                    </div>

                    {/* Eco Blip 3: Farmatodo Express (1.8km) */}
                    <div className="absolute bottom-6 sm:bottom-9 left-4 sm:left-6 z-10 flex flex-col items-center group cursor-pointer">
                      <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-90"></span>
                        <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-cyan-400 shadow-[0_0_10px_#06B6D4]"></span>
                      </span>
                      <span className="text-[7.5px] sm:text-[8px] font-bold text-cyan-300 bg-slate-950/90 px-1 py-0.2 rounded border border-cyan-500/40 mt-0.5 whitespace-nowrap">
                        Farmatodo • 1.8km
                      </span>
                    </div>
                  </div>

                  {/* Leyenda Telemetría HUD Inferior */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[8.5px] sm:text-[9px] font-mono text-slate-400">
                    <span className="flex items-center gap-1 truncate">
                      <Compass className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                      ESCANEO EN TIEMPO REAL
                    </span>
                    <span className="text-emerald-400 font-bold shrink-0">3 SEÑALES A PIE</span>
                  </div>
                </div>

                {/* Tarjetas de Oportunidades Detectadas Adaptables */}
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-2.5 pt-1">
                  {/* Vacante 1 */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-emerald-500/40 hover:border-emerald-400 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between shadow-lg shadow-emerald-950/20">
                    <div>
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1 gap-1">
                        <span className="font-bold text-emerald-300 truncate">Automercados Plaza's</span>
                        <span className="text-[9px] sm:text-[10px] text-emerald-400 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">450m • 6 min</span>
                      </div>
                      <p className="text-xs font-semibold text-white truncate">Cajero & Pasillero</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">$180 - $220 + Bono</p>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[9.5px] sm:text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <span>🚶‍♂️</span> A pie (Cero pasajes)
                    </div>
                  </div>

                  {/* Vacante 2 */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-teal-500/40 hover:border-teal-400 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between shadow-lg shadow-teal-950/20">
                    <div>
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1 gap-1">
                        <span className="font-bold text-teal-300 truncate">Pastelería Danubio</span>
                        <span className="text-[9px] sm:text-[10px] text-teal-400 font-extrabold bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/30 shrink-0">820m • 10 min</span>
                      </div>
                      <p className="text-xs font-semibold text-white truncate">Ayudante Pastelero</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">$220 - $280 + Almuerzo</p>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[9.5px] sm:text-[10px] text-teal-400 font-medium flex items-center gap-1">
                      <span>💬</span> WhatsApp directo
                    </div>
                  </div>

                  {/* Vacante 3 */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-cyan-500/40 hover:border-cyan-400 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between shadow-lg shadow-cyan-950/20">
                    <div>
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1 gap-1">
                        <span className="font-bold text-cyan-300 truncate">Farmatodo Express</span>
                        <span className="text-[9px] sm:text-[10px] text-cyan-400 font-extrabold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30 shrink-0">1.8 km • 1 ruta</span>
                      </div>
                      <p className="text-xs font-semibold text-white truncate">Auxiliar de Farmacia</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">$210 - $260 + HCM</p>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[9.5px] sm:text-[10px] text-cyan-400 font-medium flex items-center gap-1">
                      <span>🚍</span> Transporte nocturno
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTabFeature === 'real' && (
              <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Protocolo Anti-Estafas en Venezuela:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] sm:text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">1.</span>
                    <span><strong>Sin cobros de inscripción:</strong> Postulación 100% gratis y directa a las taquillas o números corporativos.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">2.</span>
                    <span><strong>Auditoría en Redes:</strong> Verificamos vacantes de Instagram (@plazas, @farmatodovzla) y canales de WhatsApp.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">3.</span>
                    <span><strong>CompuTrabajo & LinkedIn:</strong> Cruzamos ofertas activas con ubicación física en el mapa de Google.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">4.</span>
                    <span><strong>Sueldos Claros:</strong> Rango salarial visible en divisa para evitar pérdidas de tiempo.</span>
                  </div>
                </div>
              </div>
            )}

            {activeTabFeature === 'savings' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <TrendingDown className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-white truncate">Impacto Económico en tu Bolsillo:</span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                    +$35 a $50 / mes libres
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Trabajando cerca de tu residencia caminando o a menos de 10 cuadras, eliminas el gasto diario de 2 a 4 pasajes en transporte público, evitas el estrés del tráfico y ganas hasta 3 horas al día con tu familia.
                </p>
              </div>
            )}
          </div>

          {/* Estadísticas Clave en Mini-Pills Adaptables */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-0.5 text-center">
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <p className="text-sm xs:text-base sm:text-lg font-black text-white">100%</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">Auditada</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <p className="text-sm xs:text-base sm:text-lg font-black text-emerald-400">&lt; 3 km</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">Proximidad</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <p className="text-sm xs:text-base sm:text-lg font-black text-cyan-400">Gratis</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">Comunitario</p>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          FOOTER INFORMATIVO & PROOFS DE AUDITORÍA ADAPTABLE
          ========================================================================= */}
      <footer className="relative z-10 px-3.5 sm:px-8 py-3.5 sm:py-4 border-t border-slate-800/80 bg-[#060A12]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] text-slate-400 gap-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4">
            <span className="flex items-center gap-1 text-slate-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Canales Auditados:
            </span>
            <span className="text-slate-400">CompuTrabajo</span>
            <span>•</span>
            <span className="text-slate-400">LinkedIn Vzla</span>
            <span>•</span>
            <span className="text-slate-400">Instagram & TikTok Oficial</span>
            <span>•</span>
            <span className="text-slate-400">WhatsApp Corporativo</span>
          </div>

          <div className="text-slate-400 flex items-center gap-1 justify-center">
            <span>© 2026 ChambaCerca • Creado por Ángel David Morillo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
