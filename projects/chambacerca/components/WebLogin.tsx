'use client';

import { useState, useEffect } from 'react';
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
  Radio,
  Zap,
  Volume2,
  VolumeX,
  Navigation,
  Shield,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import {
  playTacticalClick,
  playSonarPing,
  playSuccessChime,
  isSoundEnabled,
  setSoundEnabled,
  initSoundState,
} from '@/lib/audio';

interface WebLoginProps {
  onLoginSuccess: (user: any) => void;
  onContinueAsGuest: () => void;
}

// Oportunidades de demostración para el radar interactivo de escritorio
const RADAR_PREVIEW_PINS = [
  {
    id: 'pin-1',
    name: 'Farmatodo Chacao',
    category: 'Farmacia',
    icon: '🏥',
    distanceM: 450,
    walkMin: 6,
    salary: '$210 USD',
    badge: 'Turno Rotativo',
    x: 68, // porcentaje dentro del radar
    y: 32,
    color: '#10B981', // emerald
  },
  {
    id: 'pin-2',
    name: 'Colegio San Ignacio',
    category: 'Educación / Docente',
    icon: '🎓',
    distanceM: 850,
    walkMin: 11,
    salary: '$280 USD',
    badge: 'Lunes a Viernes',
    x: 28,
    y: 26,
    color: '#06B6D4', // cyan
  },
  {
    id: 'pin-3',
    name: 'Automercados Plazas',
    category: 'Supermercado',
    icon: '🛒',
    distanceM: 600,
    walkMin: 8,
    salary: '$190 USD',
    badge: 'Con Almuerzo',
    x: 76,
    y: 68,
    color: '#F59E0B', // amber
  },
  {
    id: 'pin-4',
    name: 'Café & Restaurant El Alazán',
    category: 'Gastronomía',
    icon: '☕',
    distanceM: 350,
    walkMin: 4,
    salary: '$190 + Propinas',
    badge: 'Contratación Hoy',
    x: 36,
    y: 66,
    color: '#EC4899', // rose
  },
];

// Mensajes rotativos del ticker de convocatorias en vivo
const LIVE_TICKER_ITEMS = [
  {
    time: 'Hace 4 min',
    company: 'Farmatodo Chacao',
    role: 'Cajero / Atención al Cliente',
    distance: '450m a pie',
    salary: '$210/mes',
    icon: '🏥',
  },
  {
    time: 'Hace 14 min',
    company: 'Colegio San Ignacio',
    role: 'Docente de Primaria y Tareas Dirigidas',
    distance: '850m a pie',
    salary: '$280/mes',
    icon: '🎓',
  },
  {
    time: 'Hace 28 min',
    company: 'Automercados Plazas',
    role: 'Pasillero y Control de Inventario',
    distance: '600m a pie',
    salary: '$190/mes + Bono',
    icon: '🛒',
  },
  {
    time: 'Hace 42 min',
    company: 'Café El Alazán (Altamira)',
    role: 'Barista y Mesero de Turno Mañana',
    distance: '350m a pie',
    salary: '$190 + Propinas diarias',
    icon: '☕',
  },
  {
    time: 'Hace 1 hora',
    company: 'Ferretería EPA Los Cortijos',
    role: 'Asesor Técnico de Ventas',
    distance: '1.2 km a pie',
    salary: '$220/mes',
    icon: '🔧',
  },
];

// Cálculo visual de fortaleza de contraseña
function getPasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: '', color: 'bg-slate-800' };
  let s = 0;
  if (pass.length >= 6) s++;
  if (pass.length >= 8) s++;
  if (/[0-9]/.test(pass)) s++;
  if (/[^a-zA-Z0-9]/.test(pass)) s++;

  if (s === 1) return { score: 1, label: 'Básica (agrega números)', color: 'bg-amber-500' };
  if (s === 2) return { score: 2, label: 'Media (agrega símbolos)', color: 'bg-yellow-400' };
  if (s === 3) return { score: 3, label: 'Buena y segura', color: 'bg-teal-400' };
  return { score: 4, label: 'Excelente protección', color: 'bg-emerald-400' };
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

  // Estados visuales e interactivos para escritorio
  const [soundOn, setSoundOn] = useState(false);
  const [activePin, setActivePin] = useState<any>(RADAR_PREVIEW_PINS[0]);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [pinIndex, setPinIndex] = useState(0);
  const [userInteractedWithPin, setUserInteractedWithPin] = useState(false);

  // Inicializar estado de sonido táctico
  useEffect(() => {
    setSoundOn(initSoundState());
  }, []);

  // Rotador automático de convocatorias en vivo en el ticker cada 3.6 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_TICKER_ITEMS.length);
    }, 3600);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotador suave de puntos en el mini-radar cada 4.8s si el usuario no ha interactuado
  useEffect(() => {
    if (userInteractedWithPin) return;
    const interval = setInterval(() => {
      setPinIndex((prev) => {
        const next = (prev + 1) % RADAR_PREVIEW_PINS.length;
        setActivePin(RADAR_PREVIEW_PINS[next]);
        return next;
      });
    }, 4800);
    return () => clearInterval(interval);
  }, [userInteractedWithPin]);

  // Saludo contextual según la hora del día en Venezuela
  function getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '☀️ Buenos días';
    if (hour >= 12 && hour < 19) return '🌤️ Buenas tardes';
    return '🌙 Buenas noches';
  }

  // Alternar sonido con efecto audible de prueba
  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      setTimeout(() => playSonarPing(), 50);
    }
  }

  // Envío de Formulario
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    playTacticalClick();

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

      playSuccessChime();
      setSuccessMsg(data.message || '¡Acceso concedido! Entrando al radar...');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 350);
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
    playTacticalClick();

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

      playSuccessChime();
      setSuccessMsg('¡Bienvenido! Entrando al radar...');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 350);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  const passStrength = getPasswordStrength(password);
  const currentTicker = LIVE_TICKER_ITEMS[tickerIndex];

  return (
    <div className="min-h-screen w-full bg-[#080D15] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none sm:select-auto">
      
      {/* =========================================================================
          ILUMINACIÓN Y PATRÓN TÁCTICO AMBIENTAL DE FONDO
          ========================================================================= */}
      {/* Matriz de micro-puntos tácticos (Dot Matrix) */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-dot-grid opacity-60" />

      {/* Orbes de luz ambiental viva con respiración suave */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full bg-emerald-500/10 blur-[130px] animate-orb-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[140px] animate-orb-drift" />
        <div className="absolute top-[40%] right-[30%] w-[400px] h-[400px] rounded-full bg-teal-500/05 blur-[100px]" />
      </div>

      {/* =========================================================================
          CABECERA SUPERIOR ELEGANTE CON SAFE-AREA Y CONTROLES TÁCTICOS
          ========================================================================= */}
      <header className="sticky top-0 z-30 w-full bg-[#080D15]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 pt-[max(env(safe-area-inset-top),42px)] sm:pt-3 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo y Brújula Táctica Interactiva */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-950/60 flex items-center justify-center group cursor-pointer transition-transform duration-300 hover:scale-105">
              <div className="w-full h-full bg-[#080D15] rounded-[9px] flex items-center justify-center relative overflow-hidden">
                <Compass className="w-5 h-5 text-emerald-400 group-hover:rotate-45 transition-transform duration-500" />
                <span className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-0.5">
                  Chamba<span className="text-emerald-400">Cerca</span>
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Venezuela 2026
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Radar de Empleo de Proximidad a Pie • Cero Camioneticas
              </p>
            </div>
          </div>

          {/* Acciones de Cabecera: Toggle de Sonido y Botón Explorar como Invitado */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Toggle de Efectos de Sonido Tácticos */}
            <button
              type="button"
              onClick={toggleSound}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                soundOn
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={soundOn ? 'Sonido táctico activado' : 'Activar efectos de sonido tácticos'}
            >
              {soundOn ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px]">Audio ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px]">Audio OFF</span>
                </>
              )}
            </button>

            {/* Botón Explorar como Invitado */}
            <button
              onClick={() => {
                playTacticalClick();
                onContinueAsGuest();
              }}
              className="group flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-xs font-bold text-emerald-300 hover:text-white transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:-translate-y-0.5 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>Explorar como Invitado</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          CUERPO PRINCIPAL: SPLIT-SCREEN SAAS EN DESKTOP / CARD CENTRADO EN MÓVIL
          ========================================================================= */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex-1 flex items-center">
        
        {/* Fondo Exclusivo de Radar Concétrico para Escritorio (Desktop Only) */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Anillos de Cobertura Geográfica Militares */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-emerald-500/10 animate-spin-very-slow flex items-center justify-center">
            <div className="w-[82%] h-[82%] rounded-full border border-dashed border-teal-500/15 flex items-center justify-center">
              <div className="w-[68%] h-[68%] rounded-full border border-cyan-500/10 flex items-center justify-center">
                {/* Haz de barrido continuo (Sonar Beam) */}
                <div
                  className="w-full h-full rounded-full animate-radar-sweep"
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgba(16, 185, 129, 0.14) 360deg)',
                  }}
                />
              </div>
            </div>
            {/* Etiquetas Cardinales Militares */}
            <span className="absolute top-2 text-[9px] font-mono font-bold text-emerald-500/40">N 000°</span>
            <span className="absolute right-2 text-[9px] font-mono font-bold text-emerald-500/40">E 090°</span>
            <span className="absolute bottom-2 text-[9px] font-mono font-bold text-emerald-500/40">S 180°</span>
            <span className="absolute left-2 text-[9px] font-mono font-bold text-emerald-500/40">W 270°</span>
          </div>

          {/* Retículas Cardinales Láser */}
          <div className="absolute left-[180px] top-1/2 -translate-y-1/2 w-[340px] h-[1px] bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" />
          <div className="absolute left-[350px] top-1/2 -translate-y-1/2 h-[340px] w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-emerald-500/15 to-transparent" />
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* =========================================================================
              COLUMNA IZQUIERDA: HERO, RADAR INTERACTIVO Y PROPUESTA DE VALOR (WEB)
              ========================================================================= */}
          <div className="lg:col-span-7 space-y-6 text-left relative">
            
            {/* Ticker Dinámico de Vacantes en Tiempo Real */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/90 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-md">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10B981]" />
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-300 truncate">
                EN VIVO: <strong className="text-emerald-400">{currentTicker.company}</strong> ({currentTicker.role} • {currentTicker.distance})
              </span>
            </div>

            {/* Gran Título Web con Tipografía Vanguardista */}
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
                Tu próxima chamba,{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  a pasos de tu casa.
                </span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Olvídate de perder 4 horas diarias y hasta $40 al mes en camioneticas. 
                <strong> ChambaCerca</strong> te ubica vacantes reales y verificadas en comercios, 
                supermercados, clínicas y colegios a distancia caminable de donde vives.
              </p>
            </div>

            {/* =====================================================================
                SIMULADOR INTERACTIVO DE RADAR DE PROXIMIDAD (SOLO EN ESCRITORIO WEB)
                ===================================================================== */}
            <div className="hidden lg:block p-4 rounded-2xl bg-[#0B131F]/90 border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                    Radar GPS en Vivo: Caracas / Chacao
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Haz clic en un punto para inspeccionar
                </span>
              </div>

              {/* Contenedor del Mini-Radar Interactivo */}
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Cuadrante del Radar con Pines */}
                <div className="col-span-6 relative w-full h-[180px] rounded-xl bg-[#070C15] border border-emerald-500/20 overflow-hidden flex items-center justify-center">
                  
                  {/* Haz de barrido rotatorio continuo (Radar Beam) */}
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none animate-radar-sweep opacity-35"
                    style={{
                      background:
                        'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(16, 185, 129, 0.35) 360deg)',
                    }}
                  />

                  {/* Anillos de Distancia */}
                  <div className="absolute w-[150px] h-[150px] rounded-full border border-emerald-500/15" />
                  <div className="absolute w-[100px] h-[100px] rounded-full border border-dashed border-emerald-500/20" />
                  <div className="absolute w-[50px] h-[50px] rounded-full border border-emerald-500/25" />
                  
                  {/* Líneas de Eje */}
                  <div className="absolute w-full h-[1px] bg-emerald-500/15" />
                  <div className="absolute h-full w-[1px] bg-emerald-500/15" />

                  {/* Etiquetas Cardinales Militares y Rango */}
                  <span className="absolute top-1 text-[8px] font-mono text-slate-500 font-bold">N</span>
                  <span className="absolute bottom-1 text-[8px] font-mono text-slate-500 font-bold">S</span>
                  <span className="absolute left-1.5 text-[8px] font-mono text-slate-500 font-bold">W</span>
                  <span className="absolute right-1.5 text-[8px] font-mono text-slate-500 font-bold">E</span>
                  <span className="absolute top-1.5 left-2 text-[7px] font-mono text-emerald-500/50">R: 1.0 km</span>

                  {/* Centro: Tu Ubicación GPS */}
                  <div className="relative z-10 flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-blue-400 opacity-60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white shadow-[0_0_10px_#3B82F6]" />
                  </div>

                  {/* Pines Interactivos de Comercios */}
                  {RADAR_PREVIEW_PINS.map((pin) => {
                    const isSelected = activePin?.id === pin.id;
                    return (
                      <button
                        key={pin.id}
                        type="button"
                        onClick={() => {
                          setUserInteractedWithPin(true);
                          setActivePin(pin);
                          playSonarPing();
                        }}
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/pin cursor-pointer transition-transform duration-200 hover:scale-125"
                        title={`${pin.name} • ${pin.distanceM}m`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg transition-all ${
                            isSelected
                              ? 'scale-125 ring-2 ring-white shadow-[0_0_15px_#10B981]'
                              : 'opacity-90 hover:opacity-100'
                          }`}
                          style={{
                            background: pin.color,
                            color: '#080D15',
                          }}
                        >
                          <span className="text-[10px]">{pin.icon}</span>
                        </div>
                        {isSelected && (
                          <span
                            className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full animate-ping"
                            style={{ background: pin.color }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tarjeta de Detalle del Comercio Seleccionado en el Radar */}
                <div
                  key={activePin.id}
                  className="col-span-6 text-left space-y-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      {activePin.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ~{activePin.walkMin} min a pie
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{activePin.icon}</span>
                      <span className="truncate">{activePin.name}</span>
                    </h4>
                    <p className="text-[11px] text-emerald-300 font-mono font-bold mt-0.5">
                      {activePin.salary} • <span className="text-slate-400 font-normal">{activePin.badge}</span>
                    </p>
                  </div>

                  <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-400 font-mono border-t border-slate-800/80">
                    <Footprints className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">Distancia: <strong>{activePin.distanceM}m</strong> (~{Math.round(activePin.distanceM * 1.3)} pasos)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticker de Métricas en Vivo (Desktop) */}
            <div className="hidden lg:grid grid-cols-4 gap-2.5 p-2 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-sm shadow-inner">
              <div className="text-center p-2 rounded-xl bg-slate-900/50 border border-slate-800/60 hover:border-emerald-500/40 transition">
                <p className="text-base font-black text-emerald-400 tracking-tight font-mono">33</p>
                <p className="text-[10px] text-slate-400 font-medium">Vacantes Hoy</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-slate-900/50 border border-slate-800/60 hover:border-cyan-500/40 transition">
                <p className="text-base font-black text-cyan-400 tracking-tight font-mono">&lt; 15 min</p>
                <p className="text-[10px] text-slate-400 font-medium">A Pie de Casa</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-slate-900/50 border border-slate-800/60 hover:border-amber-500/40 transition">
                <p className="text-base font-black text-amber-400 tracking-tight font-mono">$0</p>
                <p className="text-[10px] text-slate-400 font-medium">En Camionetica</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-slate-900/50 border border-slate-800/60 hover:border-teal-500/40 transition">
                <p className="text-base font-black text-teal-400 tracking-tight font-mono">24 Horas</p>
                <p className="text-[10px] text-slate-400 font-medium">Rotación Diaria</p>
              </div>
            </div>

            {/* 3 Pilares Destacados con Micro-Interacciones (Desktop Only) */}
            <div className="hidden lg:grid grid-cols-3 gap-3 pt-1">
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

            {/* Ticker de Cobertura Activa (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 pt-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
              <span>Cobertura activa en Caracas, Valencia, Maracaibo, Barquisimeto y Maracay</span>
            </div>
          </div>

          {/* =========================================================================
              COLUMNA DERECHA: TARJETA DE AUTENTICACIÓN ELEGANTE GLASSMORPHISM 2.0
              ========================================================================= */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto relative">
            
            {/* Resplandor Luminiscente de Fondo para la Tarjeta (Desktop Web) */}
            <div className="hidden lg:block absolute -inset-1 bg-gradient-to-r from-emerald-500/25 via-teal-500/15 to-cyan-500/25 rounded-[32px] blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />

            {/* Contenedor con Borde Gradiente y Sombra Neón Suave */}
            <div className="p-[1.5px] rounded-3xl bg-gradient-to-b from-emerald-500/45 via-slate-700/60 to-slate-800/90 shadow-2xl shadow-emerald-950/50">
              <div className="p-6 sm:p-8 rounded-[22.5px] bg-[#0D1524]/95 backdrop-blur-xl relative">
                
                {/* Cabecera de la Tarjeta con Saludo Contextual */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 font-mono">
                    <span>{getTimeGreeting()}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300">Radar Activo</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-full border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>33 Vacantes</span>
                  </div>
                </div>
                
                {/* Selector de Pestaña con Indicador Deslizante Suave */}
                <div className="flex p-1 bg-slate-950/90 border border-slate-800/90 rounded-2xl mb-5 relative">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      playTacticalClick();
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                      tab === 'login'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/80 scale-[1.02]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Iniciar Sesión</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('register');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      playTacticalClick();
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                      tab === 'register'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/80 scale-[1.02]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Crear Cuenta</span>
                  </button>
                </div>

                {/* Mensajes de Alerta Animados */}
                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 animate-shake shadow-lg shadow-rose-950/40">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40">
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
                            onClick={() => {
                              setRole('SEEKER');
                              playTacticalClick();
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              role === 'SEEKER'
                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <User className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Busco Empleo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRole('EMPLOYER');
                              playTacticalClick();
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              role === 'EMPLOYER'
                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Soy Negocio / RRHH</span>
                          </button>
                        </div>
                      </div>

                      {/* Nombre Completo */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Nombre Completo *
                        </label>
                        <div className="relative group/input">
                          <User className="w-4 h-4 text-slate-500 group-focus-within/input:text-emerald-400 absolute left-3 top-2.5 transition-colors" />
                          <input
                            type="text"
                            required
                            placeholder="Tu nombre y apellido"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition shadow-inner"
                          />
                        </div>
                      </div>

                      {/* Empresa (si es empleador) */}
                      {role === 'EMPLOYER' && (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Empresa o Comercio *
                          </label>
                          <div className="relative group/input">
                            <Building2 className="w-4 h-4 text-slate-500 group-focus-within/input:text-cyan-400 absolute left-3 top-2.5 transition-colors" />
                            <input
                              type="text"
                              required
                              placeholder="Nombre comercial (ej: Supermercado El Éxito)"
                              value={company}
                              onChange={(e) => setCompany(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition shadow-inner"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Correo Electrónico */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Correo Electrónico *
                    </label>
                    <div className="relative group/input">
                      <Mail className="w-4 h-4 text-slate-500 group-focus-within/input:text-emerald-400 absolute left-3 top-2.5 transition-colors" />
                      <input
                        type="email"
                        required
                        placeholder="usuario@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-slate-300">
                        Contraseña *
                      </label>
                      {tab === 'register' && password && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {passStrength.label}
                        </span>
                      )}
                    </div>
                    <div className="relative group/input">
                      <Lock className="w-4 h-4 text-slate-500 group-focus-within/input:text-emerald-400 absolute left-3 top-2.5 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          playTacticalClick();
                          setShowPassword(!showPassword);
                        }}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Indicador de Fortaleza de Contraseña Interactivo en Registro */}
                    {tab === 'register' && password && (
                      <div className="grid grid-cols-4 gap-1.5 mt-2">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1 rounded-full transition-all duration-300 ${
                              passStrength.score >= step ? passStrength.color : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Botón Principal con Efecto Neón, Shimmer Sweep y Hover Elevado */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 shadow-lg shadow-emerald-950/60 hover:shadow-emerald-900/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mt-2 cursor-pointer overflow-hidden"
                  >
                    {/* Barrido de luz shimmer al pasar el cursor */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform pointer-events-none" />
                    <span>{loading ? 'Verificando credenciales...' : tab === 'login' ? 'Iniciar Sesión en el Radar' : 'Crear Cuenta Gratuita'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                {/* Acceso Rápido con Cuentas Demo y Administrador */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Acceso Rápido de Prueba:</span>
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      3 Cuentas Listas
                    </span>
                  </div>

                  {/* 2 Cuentas de Prueba: Solo para Ver */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Botón Carlos (Solo Ver) */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('carlos.perez@ejemplo.com', 'Password123!')}
                      className="group p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/60 text-[11px] font-semibold text-emerald-300 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-950/50 cursor-pointer flex flex-col gap-0.5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/20 transition" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">👤</span>
                          <span className="font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">Carlos Pérez</span>
                        </div>
                        <span className="text-[8px] uppercase font-mono px-1 py-0.2 bg-amber-950/90 text-amber-300 rounded border border-amber-500/40 font-bold">SOLO VER</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono truncate">Postulante Demo (33 vacantes)</span>
                    </button>

                    {/* Botón Plazas (Solo Ver) */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('rrhh@plazas.com', 'Chamba2026!')}
                      className="group p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/60 text-[11px] font-semibold text-cyan-300 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-cyan-950/50 cursor-pointer flex flex-col gap-0.5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-500/10 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/20 transition" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">🏢</span>
                          <span className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">RRHH Plazas</span>
                        </div>
                        <span className="text-[8px] uppercase font-mono px-1 py-0.2 bg-amber-950/90 text-amber-300 rounded border border-amber-500/40 font-bold">SOLO VER</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono truncate">Empresa Demo (Reclutador)</span>
                    </button>
                  </div>

                  {/* Botón Usuario Administrador (Acceso Total) */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@chambacerca.com', 'AdminChamba2026!')}
                    className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-950/50 via-slate-900/90 to-amber-950/50 hover:from-amber-900/50 hover:to-amber-900/40 border border-amber-500/40 hover:border-amber-400 text-[11px] font-semibold text-amber-300 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-950/60 cursor-pointer flex items-center justify-between relative overflow-hidden group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-900/80 border border-amber-400/50 flex items-center justify-center text-sm shadow">
                        👑
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-100 group-hover:text-amber-300 transition-colors">Usuario Administrador</span>
                          <span className="text-[8px] uppercase font-mono px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded font-black tracking-wider shadow-sm">
                            ACCESO TOTAL
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">admin@chambacerca.com • Moderación y gestión completa</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Botón inferior para continuar como invitado */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      playTacticalClick();
                      onContinueAsGuest();
                    }}
                    className="text-xs text-slate-400 hover:text-emerald-400 transition-colors font-semibold flex items-center justify-center gap-1.5 w-full cursor-pointer group py-1"
                  >
                    <span>¿Prefieres explorar antes? Entrar como Invitado</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>

                {/* Sello de Confianza y Seguridad */}
                <div className="mt-3 pt-2.5 flex items-center justify-center gap-2 text-[10px] text-slate-500 border-t border-slate-800/60 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
                  <span>Cifrado SSL • Neon PostgreSQL Serverless 2026</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* =========================================================================
          PIE DE PÁGINA WEB ELEGANTE
          ========================================================================= */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 text-center text-xs text-slate-400 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          <strong>ChambaCerca</strong> © 2026 • Plataforma de empleo de proximidad para toda Venezuela
        </p>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Base de datos sincronizada
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Caracas, Valencia, Maracaibo, Barquisimeto</span>
        </div>
      </footer>
    </div>
  );
}
