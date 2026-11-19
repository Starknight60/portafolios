'use client';

import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

interface AppSplashScreenProps {
  isReady?: boolean;
  onFinish?: () => void;
  minDuration?: number; // Duración óptima cinematográfica (2400ms estilo YouTube)
}

export default function AppSplashScreen({
  isReady = true,
  onFinish,
  minDuration = 2400,
}: AppSplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);
  const [minTimerDone, setMinTimerDone] = useState(false);

  useEffect(() => {
    // En entorno Capacitor nativo (Android/iOS), ocultar inmediatamente la pantalla estática
    // para dar paso a la animación fluida acelerada por hardware
    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins?.SplashScreen) {
        (window as any).Capacitor.Plugins.SplashScreen.hide();
      }
    } catch {
      // Entorno web normal
    }

    // Temporizador principal de permanencia de la animación (2.4s)
    const timer = setTimeout(() => {
      setMinTimerDone(true);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  // Al cumplirse el tiempo y estar lista la app, activar el dissolve cinematográfico con zoom frontal
  useEffect(() => {
    if (minTimerDone && isReady && !isExiting) {
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        setIsUnmounted(true);
        if (onFinish) onFinish();
      }, 420); // 420ms de transición fluida
      return () => clearTimeout(exitTimer);
    }
  }, [minTimerDone, isReady, isExiting, onFinish]);

  if (isUnmounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#070A13] overflow-hidden select-none pointer-events-none transition-opacity duration-500 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        transition: 'opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity',
        contain: 'strict',
      }}
      aria-label="Cargando ChambaCerca"
      role="status"
    >
      {/* Resplandor ambiental de fondo optimizado con gradiente nativo (0% costo de GPU) */}
      <div 
        className={`absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full pointer-events-none transition-opacity duration-500 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.1) 45%, transparent 72%)',
          transform: 'translate3d(0,0,0)',
        }}
      />

      {/* Ondas expansivas concéntricas de Sonar Satelital (Pulsos continuos a 60 FPS) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: 'translate3d(0,0,0)' }}>
        <span className="absolute w-28 h-28 rounded-full border border-emerald-500/35 animate-yt-sonar" />
        <span className="absolute w-48 h-48 rounded-full border border-teal-500/20 animate-yt-sonar" style={{ animationDelay: '0.6s' }} />
        <span className="absolute w-68 h-68 rounded-full border border-emerald-500/10 animate-yt-sonar" style={{ animationDelay: '1.2s' }} />
      </div>

      {/* Contenedor Central del Logo y Animación con Apertura Cinema Zoom */}
      <div 
        className="relative z-10 flex flex-col items-center gap-6 px-6"
        style={{ 
          transform: isExiting ? 'translate3d(0,0,0) scale3d(1.10, 1.10, 1)' : 'translate3d(0,0,0) scale3d(1, 1, 1)',
          transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
        }}
      >
        {/* Emblema Principal Radar Táctico */}
        <div className="relative group">
          {/* Halo de resplandor precalculado */}
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 rounded-[26px] sm:rounded-[34px] opacity-75 blur-sm" />

          {/* Caja del Emblema Principal (Estilo YouTube Pro Splash) */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-[2.5px] shadow-[0_0_35px_rgba(16,185,129,0.5)] animate-yt-pop">
            <div className="w-full h-full bg-[#080D15] rounded-[14px] sm:rounded-[22px] flex items-center justify-center relative overflow-hidden">
              
              {/* Anillos concéntricos de rango de Radar HUD */}
              <div className="absolute inset-2 rounded-full border border-emerald-500/15 pointer-events-none" />
              <div className="absolute inset-5 rounded-full border border-teal-500/10 pointer-events-none" />

              {/* Cruces de mira táctica del Radar (+) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                <span className="w-full h-[1px] bg-emerald-400/40" />
                <span className="absolute h-full w-[1px] bg-emerald-400/40" />
              </div>

              {/* Puntos de vacantes detectadas en vivo (Blips del Radar) */}
              <div className="absolute top-[26%] right-[24%] pointer-events-none animate-yt-blip-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_#10B981]" />
                </span>
              </div>
              <div className="absolute bottom-[28%] left-[22%] pointer-events-none animate-yt-blip-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400 shadow-[0_0_6px_#06B6D4]" />
                </span>
              </div>
              <div className="absolute bottom-[36%] right-[20%] pointer-events-none animate-yt-blip-3">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-300 shadow-[0_0_6px_#2DD4BF]" />
                </span>
              </div>

              {/* Haz de barrido giratorio de 360° continuo (Phosphor Radar Sweep) */}
              <div 
                className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(16,185,129,0)_0deg,rgba(16,185,129,0.18)_290deg,rgba(16,185,129,0.65)_360deg)] animate-yt-radar" 
              />

              {/* Destello de brillo diagonal (YouTube Pro Sheen) */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-yt-streak pointer-events-none" 
              />

              {/* Icono central de Brújula Radar con orientación magnética a Norte */}
              <div className="relative z-10 flex items-center justify-center animate-yt-compass">
                <Compass className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                <span className="absolute w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_8px_#34D399]" />
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
            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase font-mono tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              RADAR
            </span>
          </div>

          <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">
            Radar de Empleo por Proximidad
          </p>

          {/* Micro-indicador de señal GPS en vivo con telemetría */}
          <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-slate-900/80 border border-emerald-500/25 text-[10px] text-slate-300 font-mono shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400/90 font-medium">Detectando vacantes cercanas...</span>
          </div>
        </div>
      </div>

      {/* Línea de carga sutil inferior (Acelerada 100% por GPU con CSS scaleX) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 sm:w-64 flex flex-col items-center gap-2 pointer-events-none">
        <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full animate-yt-progress" />
        </div>
        <p className="text-[9px] text-slate-500 tracking-wider font-mono">
          Sincronizando coordenadas
        </p>
      </div>
    </div>
  );
}
