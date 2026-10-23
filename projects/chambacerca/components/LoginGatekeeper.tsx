'use client';

import { useState } from 'react';
import {
  Compass,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
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
  Navigation,
  MapPin,
  AlertCircle,
  ExternalLink,
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
  const [role, setRole] = useState<'SEEKER' | 'EMPLOYER'>('SEEKER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Manejo del envío del formulario (Login o Registro)
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
        setErrorMessage(data.error || 'Ocurrió un error. Por favor intenta de nuevo.');
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message || '¡Acceso concedido!');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 500);
    } catch (err: any) {
      setErrorMessage('Error de conexión con el servidor. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  // Acceso Rápido Demo en 1 Clic
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
        setErrorMessage(data.error || 'No se pudo iniciar sesión con la cuenta demo.');
        setLoading(false);
        return;
      }

      setSuccessMessage(`¡Bienvenido de vuelta, ${data.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 400);
    } catch {
      setErrorMessage('Error al conectar con el servidor para la demo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-12 bg-[#070A13] text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* =========================================================================
          COLUMNA IZQUIERDA: EXPLICACIÓN COMPLETA DE QUÉ HACE LA PÁGINA Y CASOS REALES
          ========================================================================= */}
      <div className="lg:col-span-7 p-6 sm:p-10 md:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-gradient-to-br from-slate-950 via-[#0A101C] to-[#070A13] relative overflow-hidden">
        {/* Efectos de resplandor decorativo */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo Superior */}
        <div className="relative z-10 flex items-center gap-3.5 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-xl shadow-emerald-500/20">
            <div className="w-full h-full bg-[#070A13] rounded-[14px] flex items-center justify-center">
              <Compass className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-white">
                Chamba<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Cerca</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-md tracking-wider">
                RADAR VENEZUELA
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Radar Laboral de Proximidad & Geolocalización de Empleos
            </p>
          </div>
        </div>

        {/* Título & Explicación Formal de la Plataforma */}
        <div className="relative z-10 space-y-6 my-auto py-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Información 100% Verídica y Auditada • Neon PostgreSQL Cloud
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Encuentra empleo real cerca de tu casa usando tu ubicación en tiempo real.
          </h1>

          <div className="space-y-3 text-sm text-slate-300 leading-relaxed font-normal">
            <p>
              <strong>¿Qué es ChambaCerca?</strong> Es una plataforma de impacto social creada para
              ayudar a las personas desempleadas a identificar oportunidades laborales reales,
              verificadas y geolocalizadas sobre el mapa de <strong>Google Maps</strong> en Caracas y las
              principales ciudades de Venezuela.
            </p>
            <p className="text-slate-400 text-xs sm:text-sm">
              En Venezuela, el costo del transporte público y los tiempos de traslado diario
              convierten muchos trabajos en inviables. <strong>ChambaCerca</strong> calcula la distancia
              exacta caminando o en transporte desde tu casa hasta el comercio o empresa, mostrando
              salarios reales en divisas/bolívares, turnos rotativos y canales de contacto directo (WhatsApp de RRHH,
              taquilla presencial o correo) sin intermediarios ni ofertas fantasmas.
            </p>
          </div>

          {/* Tarjetas de Casos de Estudio & Comercios Reales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg hover:border-emerald-500/40 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2.5">
                <Store className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Automercados Plaza's</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Los Palos Grandes / Las Mercedes. Cajeros y pasilleros ($180 - $220/mes + bono). WhatsApp RRHH directo: <strong>0414-3142541</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg hover:border-teal-500/40 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-2.5">
                <Briefcase className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Pastelería Danubio</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Chacao. Ayudantes de panadería y pasteleros ($220 - $280 mensual). Almuerzo diario incluido y propinas de producción.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg hover:border-cyan-500/40 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2.5">
                <Navigation className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Farmatodo, Daka & Traki</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Caracas, Valencia, Maracaibo y Barquisimeto. Asesores de ventas, farmacia y seguridad con transporte nocturno y beneficios.
              </p>
            </div>
          </div>

          {/* Checklist de Capacidades */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Radar GPS con radios de 500m, 1km, 3km y 5km</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Oportunidades reales auditadas de CompuTrabajo y LinkedIn</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Postulación en 1 clic al WhatsApp corporativo de RRHH</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Guardado de vacantes favoritas y portal para nuevos comercios</span>
            </div>
          </div>
        </div>

        {/* Footer Izquierdo */}
        <div className="relative z-10 pt-6 mt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
          <span>© 2026 ChambaCerca Venezuela • Plataforma de Proximidad Laboral</span>
          <span>Desarrollado por Ángel David Morillo</span>
        </div>
      </div>

      {/* =========================================================================
          COLUMNA DERECHA: FORMULARIO FORMAL DE LOGIN, REGISTRO & ACCESO DEMO 1-CLIC
          ========================================================================= */}
      <div className="lg:col-span-5 p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-[#090E1A] relative">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Cabecera del Formulario */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {authMode === 'login' ? 'Acceso al Radar Laboral' : 'Crear Cuenta Gratuita'}
            </h2>
            <p className="text-xs text-slate-400">
              {authMode === 'login'
                ? 'Ingresa tus credenciales o utiliza el acceso de demostración en 1 clic.'
                : 'Regístrate para guardar ofertas de trabajo o publicar vacantes de tu comercio.'}
            </p>
          </div>

          {/* Selector de Pestañas Formal */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
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
              className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Mensajes de Alerta */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Formulario de Login / Registro */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                {/* Selector de Rol */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ¿Qué buscas hacer en ChambaCerca?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('SEEKER')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                        role === 'SEEKER'
                          ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <User className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Busco Chamba</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        Guardar y postularme
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('EMPLOYER')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                        role === 'EMPLOYER'
                          ? 'bg-teal-500/10 border-teal-500 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Store className="w-3.5 h-3.5 text-teal-400" />
                        <span>Soy Comercio</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        Publicar vacantes
                      </span>
                    </button>
                  </div>
                </div>

                {/* Nombre Completo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. José Gregorio Hernández"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Si es empleador: Nombre de la Empresa */}
                {role === 'EMPLOYER' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nombre de la Empresa o Comercio
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Ej. Panadería y Pastelería Los Ruices"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* Teléfono opcional */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Teléfono WhatsApp (Opcional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej. +58 412 123 4567"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Correo Electrónico */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>
                    {authMode === 'login' ? 'Entrar al Radar Laboral' : 'Crear Cuenta y Entrar'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* =========================================================================
              SECCIÓN DE ACCESOS DEMO EN 1 CLIC (COMO EN AD-RADAR & MENUPULSE)
              ========================================================================= */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Acceso Rápido de Demostración:</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                Sin escribir contraseña
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('carlos.perez@ejemplo.com', 'Password123!')}
                disabled={loading}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-white group-hover:text-emerald-400">
                    Carlos Pérez
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Buscador de Chamba (Seeker)</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">carlos.perez@ejemplo.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('rrhh@plazas.com', 'Chamba2026!')}
                disabled={loading}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/80 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-teal-400" />
                  <span className="text-xs font-bold text-white group-hover:text-teal-400">
                    Automercados Plaza's
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Coordinación RRHH (Employer)</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">rrhh@plazas.com</p>
              </button>
            </div>

            {/* BOTÓN PARA CONTINUAR COMO INVITADO / EXPLORAR MAPA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Explorar el Radar y Google Maps en Modo Invitado</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 ml-auto" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
