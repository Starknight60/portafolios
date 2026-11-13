'use client';

import React, { useState, useEffect } from 'react';
import { Compass, ShieldCheck, Sparkles } from 'lucide-react';

interface AppSplashScreenProps {
  isReady?: boolean;
  onFinish?: () => void;
  minDuration?: number; // Duración mínima en ms (por defecto 1500ms como YouTube)
}

export default function AppSplashScreen({
  isReady = true,
  onFinish,
  minDuration = 1500,
}: AppSplashScreenProps) {
  // Fases: 'intro' (pop in) -> 'active' (breathing/sheen) -> 'exiting' (dissolve YouTube) -> 'done'
  const [phase, setPhase] = useState<'intro' | 'active' | 'exiting' | 'done'>('intro');
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // 1. Fase intro: 350ms para el pop-in elástico
    const introTimer = setTimeout(() => {
      setPhase((prev) => (prev === 'intro' ? 'active' : prev));
    }, 350);

    // 2. Tiempo mínimo de animación tipo YouTube
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDuration);

    return () => {
      clearTimeout(introTimer);
      clearTimeout(minTimer);
    };
  }, [minDuration]);

  // Cuando se cumplió el tiempo mínimo Y el contenido está listo, iniciar el dissolve de YouTube
  useEffect(() => {
    if (minTimeElapsed && isReady && phase === 'active') {
      setPhase('exiting');
      const exitTimer = setTimeout(() => {
        setPhase('done');
        if (onFinish) onFinish();
      }, 500); // 500ms de transición fluida de salida
      return () => clearTimeout(exitTimer);
    }
  }, [minTimeElapsed, isReady, phase, onFinish]);

  // Si el usuario toca la pantalla, acelerar la transición inmediatamente
  const handleQuickSkip = () => {
    if (phase !== 'exiting' && phase !== 'done') {
      setPhase('exiting');
      setTimeout(() => {
        setPhase('done');
        if (onFinish) onFinish();
      }, 350);
    }
  };

  if (phase === 'done') return null;

  const isExiting = phase === 'exiting';

  return (
    <div
      onClick={handleQuickSkip}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070A13] overflow-hidden select-none cursor-pointer transition-all duration-500 ease-out ${
        isExiting
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      aria-label="Cargando ChambaCerca"
      role="status"
    >
      {/* Resplandor ambiental de fondo (YouTube Dark Mode ambient glow) */}
      <div 
        className={`absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-cyan-500/15 blur-3xl transition-transform duration-1000 ${
          isExiting ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
        }`} 
      />

      {/* Ondas expansivas de Radar tipo Sonar Ping */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="absolute w-28 h-28 rounded-full border border-emerald-500/30 animate-ping duration-1000" />
        <span className="absolute w-44 h-44 rounded-full border border-teal-500/20 animate-pulse duration-1500" />
        <span className="absolute w-64 h-64 rounded-full border border-emerald-500/10" />
      </div>

      {/* Contenedor Central del Logo y Animación */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        {/* Emblema Principal con Resplandor Táctico */}
        <div className="relative group">
          {/* Anillo de resplandor exterior */}
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-3xl blur-md opacity-70 animate-pulse group-hover:opacity-100 transition duration-1000" />

          {/* Caja del Emblema Principal (Estilo YouTube Premium Splash) */}
          <div
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-[2px] shadow-2xl shadow-emerald-950/80 transition-all duration-500 ${
              phase === 'intro'
                ? 'scale-75 opacity-0'
                : isExiting
                ? 'scale-115 opacity-90'
                : 'scale-100 opacity-100'
            }`}
          >
            <div className="w-full h-full bg-[#080D15] rounded-[14px] sm:rounded-[22px] flex items-center justify-center relative overflow-hidden">
              {/* Haz de barrido de radar giratorio */}
              <div 
                className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(16,185,129,0)_0deg,rgba(16,185,129,0.25)_300deg,rgba(16,185,129,0.5)_360deg)] animate-spin" 
                style={{ animationDuration: '3s' }}
              />

              {/* Destello de brillo diagonal (YouTube Logo Sheen) */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" 
              />

              {/* Icono central de Brújula Radar */}
              <div className="relative z-10 flex items-center justify-center">
                <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                <span className="absolute w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              </div>
            </div>
          </div>
        </div>

        {/* Tipografía de Marca (YouTube Style Brand Lockup) */}
        <div 
          className={`flex flex-col items-center gap-1.5 transition-all duration-500 delay-100 ${
            phase === 'intro' 
              ? 'opacity-0 translate-y-3' 
              : isExiting 
              ? 'opacity-0 translate-y-2' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-0.5">
              <span>Chamba</span>
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Cerca
              </span>
            </h1>
            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase font-mono tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md">
              RADAR
            </span>
          </div>

          <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">
            Radar de Empleo por Proximidad
          </p>

          {/* Micro-indicador de señal GPS en vivo */}
          <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] text-slate-300 font-mono shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Conectando Radar en Vivo...</span>
          </div>
        </div>
      </div>

      {/* Línea de carga sutil inferior (YouTube Progress Bar) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 sm:w-64 flex flex-col items-center gap-2 pointer-events-none">
        <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all ease-out"
            style={{ 
              width: isExiting ? '100%' : minTimeElapsed ? '90%' : '65%',
              transitionDuration: isExiting ? '300ms' : `${minDuration}ms`
            }} 
          />
        </div>
        <p className="text-[9px] text-slate-500 tracking-wider">
          Toca la pantalla para entrar
        </p>
      </div>
    </div>
  );
}
