'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Clock, TrainFront, ShieldCheck, Wifi, 
  Trash2, ArrowUpRight, ArrowDownLeft, MapPin 
} from 'lucide-react';
import { TransitTripLog, getSavedTrips } from '@/lib/transitStorage';
import { METRO_LINES } from '@/lib/metroData';
import { metroAudio } from '@/lib/audio';

interface TripHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TripHistoryModal({
  isOpen,
  onClose,
}: TripHistoryModalProps) {
  const [trips, setTrips] = useState<TransitTripLog[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTrips(getSavedTrips());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('metropay_trips_log_v1');
      setTrips([]);
      metroAudio.playTacticalClick();
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#0A101C] border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col gap-4 overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Historial de Viajes</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {trips.length} ENTRADAS
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Registro de accesos por torniquete y validaciones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Viajes */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[55vh]">
          {trips.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
              <TrainFront className="w-10 h-10 stroke-[1.5] text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">Sin viajes registrados todavía</p>
              <p className="text-[10px] text-slate-600 max-w-xs">
                Usa el botón de simular torniquete para registrar tu primer acceso con tu teléfono.
              </p>
            </div>
          ) : (
            trips.map((t) => {
              const line = METRO_LINES.find((l) => l.id === t.lineId) || METRO_LINES[0];

              return (
                <div
                  key={t.id}
                  className="p-3 rounded-2xl bg-[#0F172A] border border-slate-800/90 flex items-center justify-between gap-3 transition hover:border-slate-700"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                      style={{ backgroundColor: line.color }}
                    >
                      <TrainFront className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white truncate">{t.stationName}</h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {t.turnstileNumber}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{t.timestamp}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">Validado NFC</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-mono font-bold text-rose-400">
                      -Bs. {t.fareChargedBs.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Quedan: {t.remainingTrips} v.
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pie con botón de limpiar historial */}
        {trips.length > 0 && (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-mono">
              Tarifa estándar: 15.00 Bs / viaje
            </span>
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar Historial</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
