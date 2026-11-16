'use client';

import React, { useState, useEffect } from 'react';
import { Compass, Sparkles } from 'lucide-react';

interface AppSplashScreenProps {
  isReady?: boolean;
  onFinish?: () => void;
  minDuration?: number; // Duración de la animación (por defecto 1500ms como YouTube)
}

export default function AppSplashScreen({
  isReady = true,
  onFinish,
  minDuration = 1500,
}: AppSplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);
  const [minTimerDone, setMinTimerDone] = useState(false);

  useEffect(() => {
    // Si estamos en entorno Capacitor nativo en Android/iOS, ocultar la pantalla estática nativa
    // de inmediato para que nuestra animación fluida estilo YouTube tome el control sin demoras
    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins?.SplashScreen) {
        (window as any).Capacitor.Plugins.SplashScreen.hide();
      }
    } catch {
      // Entorno web normal
    }

    // 1. Temporizador mínimo de la animación estilo YouTube
    const timer = setTimeout(() => {
      setMinTimerDone(true);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  // Cuando se cumplió el tiempo mínimo Y el contenido está listo, iniciar el dissolve de YouTube
  useEffect(() => {
    if (minTimerDone && isReady && !isExiting) {
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        setIsUnmounted(true);
        if (onFinish) onFinish();
      }, 450); // 450ms de transición suave de disolución
      return () => clearTimeout(exitTimer);
    }
  }, [minTimerDone, isReady, isExiting, onFinish]);

  // Si el usuario toca la pantalla, acelerar la transición de inmediato
  const handleQuickSkip = () => {
    if (!isExiting) {
      setIsExiting(true);
      setTimeout(() => {
        setIsUnmounted(true);
        if (onFinish) onFinish();
      }, 250);
    }
  };

  if (isUnmounted) return null;

  return (
    <div
      onClick={handleQuickSkip}
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#070A13] overflow-hidden select-none cursor-pointer transition-all duration-500 ease-out ${
        isExiting
          ? 'opacity-0 pointer-events-none'
          : 'opacity-100'
      }`}
      style={{
        transform: isExiting ? 'scale(1.08)' : 'scale(1)',
        transition: 'opacity 450ms cubic-bezier(0.4, 0, 0.2, 1), transform 450ms cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'opacity, transform',
      }}
      aria-label="Cargando ChambaCerca"
      role="status"
    >
      {/* Resplandor ambiental de fondo (YouTube Dark Mode ambient glow) */}
      <div 
        className={`absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-cyan-500/15 blur-3xl transition-opacity duration-500 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`} 
      />

      {/* Ondas expansivas de Sonar Satelital (Pulsos concéntricos) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="absolute w-28 h-28 rounded-full border border-emerald-500/40 animate-yt-sonar" />
        <span className="absolute w-44 h-44 rounded-full border border-teal-500/25 animate-yt-sonar" style={{ animationDelay: '0.6s' }} />
        <span className="absolute w-64 h-64 rounded-full border border-emerald-500/15 animate-yt-sonar" style={{ animationDelay: '1.2s' }} />
      </div>

      {/* Contenedor Central del Logo y Animación */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        {/* Emblema Principal con Resplandor Táctico */}
        <div className="relative group">
          {/* Anillo de resplandor exterior */}
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-3xl blur-md opacity-70 animate-pulse" />

          {/* Caja del Emblema Principal (Estilo YouTube Premium Splash) */}
          <div className="relative w-22 h-22 sm:w-26 sm:h-26 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-[2.5px] shadow-2xl shadow-emerald-950/90 animate-yt-pop">
            <div className="w-full h-full bg-[#080D15] rounded-[14px] sm:rounded-[22px] flex items-center justify-center relative overflow-hidden">
              {/* Haz de barrido de radar giratorio */}
              <div 
                className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(16,185,129,0)_0deg,rgba(16,185,129,0.25)_300deg,rgba(16,185,129,0.55)_360deg)] animate-yt-radar" 
              />

              {/* Destello de brillo diagonal (YouTube Logo Sheen) */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-yt-streak pointer-events-none" 
              />

              {/* Icono central de Brújula Radar */}
              <div className="relative z-10 flex items-center justify-center">
                <Compass className="w-11 h-11 sm:w-13 sm:h-13 text-emerald-400 drop-shadow-[0_0_14px_rgba(16,185,129,0.85)]" />
                <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
              </div>
            </div>
          </div>
        </div>

        {/* Tipografía de Marca (YouTube Style Brand Lockup) */}
        <div className="flex flex-col items-center gap-1.5 animate-yt-text">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-0.5">
              <span>Chamba</span>
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
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
              width: isExiting ? '100%' : minTimerDone ? '90%' : '65%',
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
