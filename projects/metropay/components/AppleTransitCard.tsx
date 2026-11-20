'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Wifi, ShieldCheck, QrCode, RefreshCw, Smartphone, 
  Sparkles, TrainFront, CheckCircle2, AlertCircle, Copy, Check 
} from 'lucide-react';
import { TransitCard, generateTransitToken } from '@/lib/transitStorage';
import { metroAudio } from '@/lib/audio';

interface AppleTransitCardProps {
  card: TransitCard;
  onOpenTurnstile: () => void;
  onOpenRecharge: () => void;
}

export default function AppleTransitCard({ 
  card, 
  onOpenTurnstile, 
  onOpenRecharge 
}: AppleTransitCardProps) {
  const [viewMode, setViewMode] = useState<'NFC' | 'QR'>('NFC');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15);
  const [tokenText, setTokenText] = useState<string>('');
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // 3D Tilt interactivo con ratón / acelerómetro
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);

  // Generación de token rotativo cada 15 segundos
  useEffect(() => {
    const updateToken = async () => {
      const { token, secondsRemaining: sec } = generateTransitToken(card.id);
      setTokenText(token);
      setSecondsRemaining(sec);

      try {
        const url = await QRCode.toDataURL(token, {
          margin: 1,
          width: 220,
          color: {
            dark: '#FFFFFF',
            light: '#00000000', // Fondo transparente
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Error generando QR de tránsito:', err);
      }
    };

    updateToken();
    const interval = setInterval(updateToken, 1000);
    return () => clearInterval(interval);
  }, [card.id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 10;
    const rotY = ((x - centerX) / centerX) * 10;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(card.id);
    setCopiedId(true);
    metroAudio.playTacticalClick();
    setTimeout(() => setCopiedId(false), 2000);
  };

  const isLowBalance = card.tripsAvailable <= 1;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Contenedor con perspectiva 3D para efecto Apple Wallet */}
      <div 
        className="w-full max-w-[390px] aspect-[1.586] perspective-1000 select-none cursor-pointer group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          metroAudio.playNfcTap();
          onOpenTurnstile();
        }}
      >
        <div
          ref={cardRef}
          className="w-full h-full rounded-[24px] apple-card-metal apple-card-border p-5 sm:p-6 flex flex-col justify-between transition-transform duration-200 ease-out relative overflow-hidden"
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Lámina holográfica de seguridad reflectiva diagonal */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-transparent pointer-events-none animate-hologram" />

          {/* Banda superior con los colores emblemáticos de las 4 Líneas del Metro de Caracas */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <span className="flex-1 bg-[#E11D48]" title="Línea 1 (Rojo)" />
            <span className="flex-1 bg-[#10B981]" title="Línea 2 (Verde)" />
            <span className="flex-1 bg-[#2563EB]" title="Línea 3 (Azul)" />
            <span className="flex-1 bg-[#F59E0B]" title="Línea 4 (Amarillo)" />
          </div>

          {/* Cabecera de la Tarjeta */}
          <div className="flex items-center justify-between z-10 relative">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 p-[1.5px] shadow-lg shadow-rose-950/60">
                <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                  <TrainFront className="w-5 h-5 text-rose-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-wider text-white uppercase font-sans">
                    MetroPay
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase font-mono tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    CARACAS
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Boleto Digital Inteligente</p>
              </div>
            </div>

            {/* Símbolo de Pago sin Contacto NFC */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <Wifi className="w-5 h-5 text-slate-300 rotate-90" />
            </div>
          </div>

          {/* Cuerpo Central: Alternancia entre Modo NFC y Modo QR Dinámico */}
          {viewMode === 'NFC' ? (
            <div className="my-auto flex items-center justify-between gap-4 z-10 relative">
              {/* Saldo en Viajes Grandes */}
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Viajes Disponibles
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                    {card.tripsAvailable}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase font-sans">
                    {card.tripsAvailable === 1 ? 'viaje' : 'viajes'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-emerald-400 mt-0.5 font-mono">
                  Bs. {card.balanceBs.toFixed(2)}
                </p>
              </div>

              {/* Ondas NFC con llamada a la acción */}
              <div className="flex flex-col items-center justify-center relative">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full border border-rose-500/30 animate-nfc-wave" />
                  <span className="absolute inset-2 rounded-full border border-amber-500/20 animate-nfc-wave" style={{ animationDelay: '0.6s' }} />
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-950/80">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-1 text-center">
                  Acerca al torniquete
                </span>
              </div>
            </div>
          ) : (
            /* Modo QR Dinámico de Emergencia / Offline */
            <div className="my-auto flex items-center justify-between gap-3 z-10 relative bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10">
              {qrDataUrl && (
                <div className="relative w-24 h-24 bg-white/5 rounded-xl p-1 flex items-center justify-center border border-white/10">
                  <img src={qrDataUrl} alt="QR Dinámico MetroPay" className="w-full h-full object-contain" />
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-600 text-[8px] font-black text-white font-mono shadow">
                    {secondsRemaining}s
                  </div>
                </div>
              )}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-rose-400">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Token Dinámico Anti-captura</span>
                </div>
                <p className="text-[10px] text-slate-300 mt-1 leading-snug">
                  Muestra este código al lector óptico del torniquete si tu dispositivo no usa NFC.
                </p>
                <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-slate-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Válido sin internet en andenes</span>
                </div>
              </div>
            </div>
          )}

          {/* Pie de la Tarjeta */}
          <div className="flex items-end justify-between z-10 relative pt-2 border-t border-white/10">
            <div>
              <p className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">
                Titular
              </p>
              <p className="text-xs font-bold text-slate-200 tracking-wide uppercase truncate max-w-[170px]">
                {card.holderName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyId}
                className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-white transition px-2 py-0.5 rounded-md bg-white/5 border border-white/10 cursor-pointer"
                title="Copiar número de tarjeta"
              >
                <span>{card.virtualPan}</span>
                {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controles y Botones Rápidos debajo de la Tarjeta (Estilo Apple Pay) */}
      <div className="w-full max-w-[390px] mt-4 flex items-center justify-between gap-2.5 px-1">
        {/* Alternar entre NFC y QR */}
        <button
          type="button"
          onClick={() => {
            metroAudio.playTacticalClick();
            setViewMode(viewMode === 'NFC' ? 'QR' : 'NFC');
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-[#0F172A] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition shadow cursor-pointer active:scale-95"
        >
          {viewMode === 'NFC' ? (
            <>
              <QrCode className="w-4 h-4 text-rose-400" />
              <span>Ver QR Dinámico</span>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 text-emerald-400 rotate-90" />
              <span>Volver a Modo NFC</span>
            </>
          )}
        </button>

        {/* Botón de Recarga Inmediata */}
        <button
          type="button"
          onClick={() => {
            metroAudio.playTacticalClick();
            onOpenRecharge();
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black transition shadow-lg shadow-rose-950/60 cursor-pointer active:scale-95"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>Recargar Saldo</span>
        </button>
      </div>

      {/* Alerta de saldo bajo si le queda 1 viaje o menos */}
      {isLowBalance && (
        <div className="w-full max-w-[390px] mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] text-amber-200 leading-tight">
              {card.tripsAvailable === 0 
                ? '¡Sin saldo! Recarga para poder pasar el torniquete.' 
                : 'Último viaje restante. Te sugerimos recargar.'}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenRecharge}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] shrink-0 cursor-pointer"
          >
            Recargar
          </button>
        </div>
      )}
    </div>
  );
}
