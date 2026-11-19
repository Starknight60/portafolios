'use client';

import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

interface AppSplashScreenProps {
  isReady?: boolean;
  onFinish?: () => void;
  minDuration?: number; // 2000ms óptimo para lucir la animación sin demorar
}

export default function AppSplashScreen({
  isReady = true,
  onFinish,
  minDuration = 2000,
}: AppSplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);
  const [minTimerDone, setMinTimerDone] = useState(false);

  useEffect(() => {
    // En Capacitor nativo, ocultar la pantalla de carga estática para mostrar esta animación interactiva fluida
    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins?.SplashScreen) {
        (window as any).Capacitor.Plugins.SplashScreen.hide();
      }
    } catch {}

    // Temporizador principal de permanencia (2.0 segundos constantes)
    const timer = setTimeout(() => {
      setMinTimerDone(true);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  // Al cumplirse el tiempo y estar lista la app, activar el dissolve cinematográfico
  useEffect(() => {
    if (minTimerDone && isReady && !isExiting) {
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        setIsUnmounted(true);
        if (onFinish) onFinish();
      }, 350);
      return () => clearTimeout(exitTimer);
    }
  }, [minTimerDone, isReady, isExiting, onFinish]);

  if (isUnmounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#070A13] overflow-hidden select-none pointer-events-none transition-opacity ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        transition: 'opacity 350ms cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'opacity',
        contain: 'strict',
      }}
      aria-label="Cargando ChambaCerca"
      role="status"
    >
      {/* Resplandor ambiental de fondo estático nativo (0% coste de GPU) */}
      <div 
        className={`absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full pointer-events-none transition-opacity duration-300 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(6,182,212,0.08) 45%, transparent 70%)',
          transform: 'translate3d(0,0,0)',
        }}
      />

      {/* Pulso sonar concéntrico suave (Acelerado por GPU pura) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: 'translate3d(0,0,0)' }}>
        <span className="absolute w-28 h-28 rounded-full border border-emerald-500/30 animate-yt-pulse-ring" />
        <span className="absolute w-44 h-44 rounded-full border border-teal-500/15 animate-yt-pulse-ring" style={{ animationDelay: '0.6s' }} />
      </div>

      {/* Contenedor central con zoom sutil de salida */}
      <div 
        className="relative z-10 flex flex-col items-center gap-5 px-6"
        style={{ 
          transform: isExiting ? 'translate3d(0,0,0) scale3d(1.08, 1.08, 1)' : 'translate3d(0,0,0) scale3d(1, 1, 1)',
          transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
        }}
      >
        {/* Emblema ChambaCerca estilo YouTube Pro */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-[2px] shadow-[0_0_28px_rgba(16,185,129,0.4)] animate-yt-pop">
          <div className="w-full h-full bg-[#0A101D] rounded-[14px] sm:rounded-[22px] flex items-center justify-center relative overflow-hidden">
            {/* Destello diagonal de brillo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-yt-streak pointer-events-none" />
            {/* Icono central de Brújula */}
            <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
          </div>
        </div>

        {/* Tipografía de Marca */}
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
          <div className="flex items-center gap-2 mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] text-slate-300 font-mono shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-slate-400">Radar Conectado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
