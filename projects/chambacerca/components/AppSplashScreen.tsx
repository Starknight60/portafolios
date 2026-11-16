'use client';

import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

interface AppSplashScreenProps {
  isReady?: boolean;
  onFinish?: () => void;
  minDuration?: number; // Duración de la animación (por defecto 1800ms para apreciarla con fluidez)
}

export default function AppSplashScreen({
  isReady = true,
  onFinish,
  minDuration = 1800,
}: AppSplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);
  const [minTimerDone, setMinTimerDone] = useState(false);
  const [progressScale, setProgressScale] = useState(0.15);

  useEffect(() => {
    // Si estamos en entorno Capacitor nativo en Android/iOS, ocultar la pantalla estática nativa
    // de inmediato para que nuestra animación fluida tome el control sin demoras
    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins?.SplashScreen) {
        (window as any).Capacitor.Plugins.SplashScreen.hide();
      }
    } catch {
      // Entorno web normal
    }

    // Progreso fluido de la barra inferior con aceleración por GPU (scaleX en vez de width)
    const animFrame = requestAnimationFrame(() => {
      setProgressScale(0.92);
    });

    // 1. Temporizador de apreciación de la animación (1.8s)
    const timer = setTimeout(() => {
      setMinTimerDone(true);
    }, minDuration);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(timer);
    };
  }, [minDuration]);

  // Cuando se cumplió el tiempo mínimo Y el contenido está listo, iniciar el dissolve cinematográfico
  useEffect(() => {
    if (minTimerDone && isReady && !isExiting) {
      setIsExiting(true);
      setProgressScale(1);
      const exitTimer = setTimeout(() => {
        setIsUnmounted(true);
        if (onFinish) onFinish();
      }, 380); // 380ms de transición suave de disolución
      return () => clearTimeout(exitTimer);
    }
  }, [minTimerDone, isReady, isExiting, onFinish]);

  // Si el usuario toca la pantalla, entrar de inmediato (150ms)
  const handleQuickSkip = () => {
    if (!isExiting) {
      setIsExiting(true);
      setProgressScale(1);
      setTimeout(() => {
        setIsUnmounted(true);
        if (onFinish) onFinish();
      }, 150);
    }
  };

  if (isUnmounted) return null;

  return (
    <div
      onClick={handleQuickSkip}
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#070A13] overflow-hidden select-none cursor-pointer ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        transition: 'opacity 380ms cubic-bezier(0.25, 1, 0.5, 1)',
        willChange: 'opacity',
        contain: 'strict',
      }}
      aria-label="Cargando ChambaCerca"
      role="status"
    >
      {/* Resplandor ambiental de fondo optimizado con gradiente nativo (0% costo de GPU vs blur) */}
      <div 
        className={`absolute w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] rounded-full pointer-events-none transition-opacity duration-500 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(6,182,212,0.08) 45%, transparent 70%)',
          transform: 'translate3d(0,0,0)',
        }}
      />

      {/* Ondas expansivas de Sonar Satelital (Pulsos concéntricos acelerados por hardware a 60 FPS) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: 'translate3d(0,0,0)' }}>
        <span className="absolute w-26 h-26 rounded-full border border-emerald-500/35 animate-yt-sonar" />
        <span className="absolute w-44 h-44 rounded-full border border-teal-500/20 animate-yt-sonar" style={{ animationDelay: '0.6s' }} />
        <span className="absolute w-64 h-64 rounded-full border border-emerald-500/10 animate-yt-sonar" style={{ animationDelay: '1.2s' }} />
      </div>

      {/* Contenedor Central del Logo y Animación */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6" style={{ transform: 'translate3d(0,0,0)' }}>
        {/* Emblema Principal con Resplandor Táctico */}
        <div className="relative group">
          {/* Caja del Emblema Principal con sombra precalculada (Estilo YouTube Premium Splash) */}
          <div className="relative w-22 h-22 sm:w-26 sm:h-26 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-[2.5px] shadow-[0_0_32px_rgba(16,185,129,0.45)] animate-yt-pop">
            <div className="w-full h-full bg-[#080D15] rounded-[14px] sm:rounded-[22px] flex items-center justify-center relative overflow-hidden">
              {/* Haz de barrido de radar giratorio */}
              <div 
                className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(16,185,129,0)_0deg,rgba(16,185,129,0.22)_300deg,rgba(16,185,129,0.55)_360deg)] animate-yt-radar" 
              />

              {/* Destello de brillo diagonal (YouTube Logo Sheen) */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-yt-streak pointer-events-none" 
              />

              {/* Icono central de Brújula Radar */}
              <div className="relative z-10 flex items-center justify-center">
                <Compass className="w-11 h-11 sm:w-13 sm:h-13 text-emerald-400" />
                <span className="absolute w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
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
            <span>Radar Conectado en Vivo</span>
          </div>
        </div>
      </div>

      {/* Línea de carga sutil inferior (Acelerada 100% por GPU con transform: scaleX) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 sm:w-64 flex flex-col items-center gap-2 pointer-events-none">
        <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
          <div 
            className="h-full w-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            style={{ 
              transformOrigin: 'left',
              transform: `scaleX(${progressScale})`,
              transition: isExiting
                ? 'transform 200ms cubic-bezier(0.2, 0, 0, 1)'
                : `transform ${minDuration}ms cubic-bezier(0.12, 0.75, 0.25, 1)`,
              willChange: 'transform',
            }} 
          />
        </div>
        <p className="text-[9px] text-slate-500 tracking-wider font-mono">
          Toca la pantalla para entrar
        </p>
      </div>
    </div>
  );
}
