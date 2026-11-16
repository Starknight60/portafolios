'use client';

import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

interface AppSplashScreenProps {
  isReady?: boolean;
  onFinish?: () => void;
  minDuration?: number; // Duración optimizada de la animación (850ms tipo YouTube)
}

export default function AppSplashScreen({
  isReady = true,
  onFinish,
  minDuration = 850,
}: AppSplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);
  const [minTimerDone, setMinTimerDone] = useState(false);

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

    // 1. Temporizador mínimo de la animación rápida estilo YouTube (850ms)
    const timer = setTimeout(() => {
      setMinTimerDone(true);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  // Cuando se cumplió el tiempo mínimo Y el contenido está listo, iniciar el dissolve rápido
  useEffect(() => {
    if (minTimerDone && isReady && !isExiting) {
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        setIsUnmounted(true);
        if (onFinish) onFinish();
      }, 240); // 240ms de transición fluida de disolución sin bloqueo de GPU
      return () => clearTimeout(exitTimer);
    }
  }, [minTimerDone, isReady, isExiting, onFinish]);

  // Si el usuario toca la pantalla, entrar de inmediato (100ms)
  const handleQuickSkip = () => {
    if (!isExiting) {
      setIsExiting(true);
      setTimeout(() => {
        setIsUnmounted(true);
        if (onFinish) onFinish();
      }, 100);
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
        transition: 'opacity 240ms cubic-bezier(0.2, 0, 0, 1)',
        willChange: 'opacity',
        contain: 'strict',
      }}
      aria-label="Cargando ChambaCerca"
      role="status"
    >
      {/* Resplandor ambiental de fondo optimizado con gradiente nativo (0% costo de GPU vs blur) */}
      <div 
        className={`absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full pointer-events-none transition-opacity duration-300 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(6,182,212,0.08) 45%, transparent 70%)',
          transform: 'translate3d(0,0,0)',
        }}
      />

      {/* Ondas expansivas de Sonar Satelital (Pulsos concéntricos acelerados por hardware) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: 'translate3d(0,0,0)' }}>
        <span className="absolute w-24 h-24 rounded-full border border-emerald-500/35 animate-yt-sonar" />
        <span className="absolute w-40 h-40 rounded-full border border-teal-500/20 animate-yt-sonar" style={{ animationDelay: '0.45s' }} />
        <span className="absolute w-56 h-56 rounded-full border border-emerald-500/10 animate-yt-sonar" style={{ animationDelay: '0.9s' }} />
      </div>

      {/* Contenedor Central del Logo y Animación */}
      <div className="relative z-10 flex flex-col items-center gap-5 px-6" style={{ transform: 'translate3d(0,0,0)' }}>
        {/* Emblema Principal con Resplandor Táctico */}
        <div className="relative group">
          {/* Caja del Emblema Principal con sombra precalculada (Estilo YouTube Premium Splash) */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-[2px] shadow-[0_0_28px_rgba(16,185,129,0.45)] animate-yt-pop">
            <div className="w-full h-full bg-[#080D15] rounded-[14px] sm:rounded-[22px] flex items-center justify-center relative overflow-hidden">
              {/* Haz de barrido de radar giratorio */}
              <div 
                className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(16,185,129,0)_0deg,rgba(16,185,129,0.2)_300deg,rgba(16,185,129,0.5)_360deg)] animate-yt-radar" 
              />

              {/* Destello de brillo diagonal (YouTube Logo Sheen) */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-yt-streak pointer-events-none" 
              />

              {/* Icono central de Brújula Radar */}
              <div className="relative z-10 flex items-center justify-center">
                <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                <span className="absolute w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              </div>
            </div>
          </div>
        </div>

        {/* Tipografía de Marca (YouTube Style Brand Lockup) */}
        <div className="flex flex-col items-center gap-1 animate-yt-text">
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
          <div className="flex items-center gap-2 mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] text-slate-300 font-mono shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span>Radar Conectado</span>
          </div>
        </div>
      </div>

      {/* Línea de carga sutil inferior (YouTube Progress Bar) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-44 sm:w-56 flex flex-col items-center gap-1.5 pointer-events-none">
        <div className="w-full h-0.5 bg-slate-800/80 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all ease-out"
            style={{ 
              width: isExiting ? '100%' : minTimerDone ? '92%' : '60%',
              transitionDuration: isExiting ? '180ms' : `${minDuration}ms`
            }} 
          />
        </div>
        <p className="text-[8px] text-slate-500 tracking-wider font-mono">
          Toca para entrar
        </p>
      </div>
    </div>
  );
}
