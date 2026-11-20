'use client';

import React, { useState } from 'react';
import { 
  TrainFront, Clock, Navigation, AlertCircle, CheckCircle2, 
  ArrowRight, MapPin, Sparkles, RefreshCw, Layers 
} from 'lucide-react';
import { METRO_LINES, MetroStation, calculateMetroRoute } from '@/lib/metroData';
import { metroAudio } from '@/lib/audio';

export default function MetroNetworkStatus() {
  const [originId, setOriginId] = useState<string>('l1-altamira');
  const [destId, setDestId] = useState<string>('l1-la-hoyada');
  const [activeTab, setActiveTab] = useState<'ROUTE' | 'LINES'>('ROUTE');

  const routeResult = calculateMetroRoute(originId, destId);

  // Lista plana de estaciones ordenadas
  const allStations: { station: MetroStation; lineName: string; lineId: string; lineColor: string }[] = [];
  METRO_LINES.forEach((line) => {
    line.stations.forEach((st) => {
      allStations.push({ station: st, lineName: line.shortName, lineId: line.id, lineColor: line.color });
    });
  });

  return (
    <div className="w-full max-w-md bg-[#0A101C] border border-slate-800 rounded-3xl p-4 sm:p-5 text-slate-100 flex flex-col gap-4 shadow-xl">
      {/* Selector de pestañas: Planificador de Rutas vs Estado de Líneas */}
      <div className="flex items-center justify-between p-1 rounded-2xl bg-[#0F172A] border border-slate-800">
        <button
          type="button"
          onClick={() => {
            metroAudio.playTacticalClick();
            setActiveTab('ROUTE');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'ROUTE'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Planear Ruta</span>
        </button>

        <button
          type="button"
          onClick={() => {
            metroAudio.playTacticalClick();
            setActiveTab('LINES');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'LINES'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Estado de Red</span>
        </button>
      </div>

      {activeTab === 'ROUTE' ? (
        /* Pestaña 1: Calculadora de Trayecto y Tiempo */
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 gap-2.5">
            {/* Origen */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Estación Origen:</span>
              </label>
              <select
                value={originId}
                onChange={(e) => {
                  setOriginId(e.target.value);
                  metroAudio.playTacticalClick();
                }}
                className="w-full bg-[#0F172A] border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                {METRO_LINES.map((line) => (
                  <optgroup key={line.id} label={line.name}>
                    {line.stations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({line.shortName})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Destino */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Estación Destino:</span>
              </label>
              <select
                value={destId}
                onChange={(e) => {
                  setDestId(e.target.value);
                  metroAudio.playTacticalClick();
                }}
                className="w-full bg-[#0F172A] border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                {METRO_LINES.map((line) => (
                  <optgroup key={line.id} label={line.name}>
                    {line.stations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({line.shortName})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Tarjeta de Resultado de Ruta */}
          {routeResult && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#0A0D15] border border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Tiempo estimado: <strong>~{routeResult.timeMinutes} minutos</strong></span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {routeResult.stationsCount} estaciones
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {routeResult.instructions}
              </p>

              {routeResult.transfers.length > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-xl border border-amber-500/30">
                  <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Transferencia requerida en: <strong>{routeResult.transfers.join(', ')}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Pestaña 2: Estado de las Líneas en Tiempo Real */
        <div className="space-y-2.5">
          {METRO_LINES.map((line) => (
            <div
              key={line.id}
              className="p-3 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div 
                  className="w-3 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: line.color }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white truncate">{line.shortName}</h4>
                    <span className="text-[9px] font-mono text-slate-400">({line.stations.length} est.)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{line.statusMessage}</p>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Normal</span>
                </span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                  Frecuencia: {line.avgFrequencyMinutes} min
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
