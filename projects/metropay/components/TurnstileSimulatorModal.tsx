'use client';

import React, { useState } from 'react';
import { 
  X, CheckCircle2, AlertTriangle, Wifi, Smartphone, 
  MapPin, ShieldCheck, ChevronRight, Volume2, Sparkles, TrainFront 
} from 'lucide-react';
import { TransitCard, TransitTripLog, addTripLog } from '@/lib/transitStorage';
import { METRO_LINES, MetroStation } from '@/lib/metroData';
import { metroAudio } from '@/lib/audio';

interface TurnstileSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: TransitCard;
  onUpdateCard: (updated: TransitCard) => void;
  onOpenRecharge: () => void;
}

export default function TurnstileSimulatorModal({
  isOpen,
  onClose,
  card,
  onUpdateCard,
  onOpenRecharge,
}: TurnstileSimulatorModalProps) {
  const [selectedStation, setSelectedStation] = useState<string>('l1-plaza-venezuela');
  const [turnstileState, setTurnstileState] = useState<'IDLE' | 'READING' | 'APPROVED' | 'REJECTED'>('IDLE');
  const [validatedDetails, setValidatedDetails] = useState<TransitTripLog | null>(null);

  if (!isOpen) return null;

  // Encontrar estación activa
  const allStations: { station: MetroStation; lineName: string; lineColor: string }[] = [];
  METRO_LINES.forEach((line) => {
    line.stations.forEach((st) => {
      allStations.push({ station: st, lineName: line.shortName, lineColor: line.color });
    });
  });

  const activeStData = allStations.find((s) => s.station.id === selectedStation) || allStations[0];

  const handleTapTurnstile = () => {
    if (turnstileState === 'READING' || turnstileState === 'APPROVED') return;

    setTurnstileState('READING');
    metroAudio.playNfcTap();

    setTimeout(() => {
      if (card.tripsAvailable <= 0) {
        // Rechazo: Sin saldo
        setTurnstileState('REJECTED');
        metroAudio.playTurnstileReject();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      } else {
        // Aprobado: 1 viaje descontado
        const remaining = card.tripsAvailable - 1;
        const remainingBs = Math.max(0, card.balanceBs - 15.00);

        const newTrip: TransitTripLog = {
          id: `trip-${Date.now()}`,
          stationName: activeStData.station.name,
          lineId: activeStData.station.lineId,
          timestamp: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
          fareChargedBs: 15.00,
          remainingTrips: remaining,
          method: 'NFC_APPLE_PAY',
          turnstileNumber: `T-0${Math.floor(Math.random() * 6) + 1}`,
        };

        addTripLog(newTrip);
        setValidatedDetails(newTrip);
        setTurnstileState('APPROVED');

        // Actualizar tarjeta local
        onUpdateCard({
          ...card,
          tripsAvailable: remaining,
          balanceBs: remainingBs,
        });

        // Bip de torniquete y vibración
        metroAudio.playTurnstileSuccess();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([40, 50, 40]);
        }
      }
    }, 450);
  };

  const handleReset = () => {
    setTurnstileState('IDLE');
    setValidatedDetails(null);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#0A101C] border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col gap-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Simulador */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <TrainFront className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Torniquete de Acceso</span>
                <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  NFC EN VIVO
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Validador Automático del Metro de Caracas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de Estación de Entrada */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span>Estación del Torniquete:</span>
          </label>
          <select
            value={selectedStation}
            onChange={(e) => {
              setSelectedStation(e.target.value);
              handleReset();
            }}
            disabled={turnstileState === 'APPROVED'}
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

        {/* RECUADRO FÍSICO DEL TORNIQUETE METRO */}
        <div className="relative rounded-2xl bg-gradient-to-b from-[#111827] to-[#0A0D14] border border-slate-700 p-4 sm:p-5 flex flex-col items-center justify-center gap-4 overflow-hidden shadow-inner">
          
          {/* Pantalla LED superior del torniquete */}
          <div className="w-full bg-black/90 rounded-xl border border-slate-800 p-2.5 flex flex-col items-center justify-center text-center shadow-lg">
            {turnstileState === 'IDLE' && (
              <p className="text-xs font-mono font-black tracking-wider text-rose-400 animate-pulse uppercase">
                🔴 ACERQUE SU TELÉFONO O TARJETA
              </p>
            )}
            {turnstileState === 'READING' && (
              <p className="text-xs font-mono font-black tracking-wider text-amber-300 animate-pulse uppercase">
                🟡 LEYENDO TOKEN CRIPTOGRÁFICO...
              </p>
            )}
            {turnstileState === 'APPROVED' && (
              <div className="flex flex-col items-center gap-0.5">
                <p className="text-xs font-mono font-black tracking-wider text-emerald-400 uppercase drop-shadow-[0_0_8px_#10B981]">
                  🟢 PASE ADELANTE • TICKET VÁLIDO
                </p>
                <p className="text-[10px] font-mono text-slate-300">
                  {validatedDetails?.stationName} • {validatedDetails?.turnstileNumber} • {validatedDetails?.remainingTrips} viajes rest.
                </p>
              </div>
            )}
            {turnstileState === 'REJECTED' && (
              <p className="text-xs font-mono font-black tracking-wider text-red-500 uppercase drop-shadow-[0_0_8px_#EF4444]">
                ⛔ SALDO INSUFICIENTE (0 VIAJES)
              </p>
            )}
          </div>

          {/* Gráfico del Sensor NFC & Aspas del Torniquete */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Anillos sensores de campo electromagnético */}
            <div className={`absolute inset-0 rounded-full border transition-all duration-300 ${
              turnstileState === 'APPROVED' 
                ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.3)]' 
                : turnstileState === 'REJECTED'
                ? 'border-red-500/60 bg-red-500/10 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
                : 'border-rose-500/30 bg-rose-500/5'
            }`} />

            {/* Aspas mecánicas del torniquete */}
            <div className={`relative w-24 h-24 flex items-center justify-center ${
              turnstileState === 'APPROVED' ? 'animate-turnstile-arm' : ''
            }`}>
              {/* Centro del trípode */}
              <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-slate-600 shadow-md flex items-center justify-center z-10">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>
              {/* Brazo 1 */}
              <div className="absolute top-0 w-2 h-12 bg-slate-300 border border-slate-500 rounded-full shadow origin-bottom" />
              {/* Brazo 2 (120°) */}
              <div className="absolute bottom-2 left-2 w-2 h-12 bg-slate-300 border border-slate-500 rounded-full shadow origin-top -rotate-[60deg]" />
              {/* Brazo 3 (240°) */}
              <div className="absolute bottom-2 right-2 w-2 h-12 bg-slate-300 border border-slate-500 rounded-full shadow origin-top rotate-[60deg]" />
            </div>
          </div>

          {/* Botón de Acción Principal para Simular el Toque */}
          {turnstileState !== 'APPROVED' ? (
            <button
              type="button"
              onClick={handleTapTurnstile}
              disabled={turnstileState === 'READING'}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs flex items-center justify-center gap-2 transition shadow-xl shadow-rose-950/80 cursor-pointer active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              <span>
                {turnstileState === 'READING' ? 'Validando en torniquete...' : 'Tocar Torniquete con el Teléfono'}
              </span>
            </button>
          ) : (
            <div className="w-full flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Simular Otra Entrada
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Listo, Continuar
              </button>
            </div>
          )}
        </div>

        {/* Acceso directo a recarga si fue rechazado por falta de saldo */}
        {turnstileState === 'REJECTED' && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center justify-between gap-2 animate-in fade-in">
            <span className="text-[11px] text-red-300">
              No tienes viajes. Recarga con Pago Móvil para pasar.
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRecharge();
              }}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shrink-0 cursor-pointer"
            >
              Recargar Ahora
            </button>
          </div>
        )}

        {/* Resumen del Estado de la Cuenta */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
          <span>Saldo disponible: <strong className="text-white">{card.tripsAvailable} viajes</strong> (Bs. {card.balanceBs.toFixed(2)})</span>
          <span>Costo: <strong className="text-rose-400">15.00 Bs / viaje</strong></span>
        </div>
      </div>
    </div>
  );
}
