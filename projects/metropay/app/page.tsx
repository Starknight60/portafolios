'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrainFront, Wifi, Smartphone, Sparkles, Clock, 
  MapPin, ShieldCheck, CreditCard, ChevronRight, RefreshCw, 
  Volume2, VolumeX, AlertCircle, CheckCircle2, User, HelpCircle, 
  Layers, QrCode, ArrowUpRight, Flame
} from 'lucide-react';
import AppleTransitCard from '@/components/AppleTransitCard';
import TurnstileSimulatorModal from '@/components/TurnstileSimulatorModal';
import QuickRechargeModal from '@/components/QuickRechargeModal';
import TripHistoryModal from '@/components/TripHistoryModal';
import MetroNetworkStatus from '@/components/MetroNetworkStatus';
import { TransitCard, getSavedCard, saveCard } from '@/lib/transitStorage';
import { METRO_FARE, METRO_LINES } from '@/lib/metroData';
import { metroAudio } from '@/lib/audio';

export default function MetroPayHomePage() {
  const [card, setCard] = useState<TransitCard>(getSavedCard());
  const [isTurnstileOpen, setIsTurnstileOpen] = useState<boolean>(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'CARD' | 'ROUTES' | 'HISTORY'>('CARD');

  // Cargar tarjeta al montar en cliente
  useEffect(() => {
    setCard(getSavedCard());
  }, []);

  const handleUpdateCard = (updated: TransitCard) => {
    setCard(updated);
    saveCard(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05070D] text-slate-100 relative overflow-x-hidden pb-28 md:pb-12">
      
      {/* Resplandor ambiental de fondo con los tonos emblemáticos de las Líneas 1 y 2 */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 12%, rgba(225, 29, 72, 0.14) 0%, rgba(16, 185, 129, 0.06) 45%, transparent 75%)',
        }}
      />

      {/* Barra Superior de Estado iOS / Apple Pay */}
      <header className="sticky top-0 z-40 bg-[#070A13]/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-3 safe-area-header">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 p-[1.5px] shadow-lg shadow-rose-950/60">
              <div className="w-full h-full bg-[#0A0E17] rounded-[10px] flex items-center justify-center">
                <TrainFront className="w-4 h-4 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black tracking-tight text-white uppercase font-sans">
                  MetroPay
                </h1>
                <span className="text-[9px] font-black uppercase font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  CARACAS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Boleto Digital Sin Contacto</p>
            </div>
          </div>

          {/* Indicador de Resiliencia Offline en el Andén */}
          <div className="flex items-center gap-1.5 bg-[#0F172A] px-2.5 py-1 rounded-full border border-slate-800 text-[10px] font-mono shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 font-bold">Offline Ready</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-5 space-y-6 z-10 relative">
        
        {/* Banner Informativo de Sistema Exclusivo para Caracas */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#0F172A] to-slate-900 border border-rose-500/30 flex items-center justify-between gap-2.5 shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Tu teléfono es tu tarjeta</p>
              <p className="text-[10px] text-slate-400 truncate">Pasa el torniquete por NFC o QR dinámico sin colas</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black border border-emerald-500/40 shrink-0">
            15 Bs / viaje
          </span>
        </div>

        {/* 1. SECCIÓN PRINCIPAL: Tarjeta Digital Apple Transit */}
        <section className="space-y-2">
          <AppleTransitCard
            card={card}
            onOpenTurnstile={() => setIsTurnstileOpen(true)}
            onOpenRecharge={() => setIsRechargeOpen(true)}
          />
        </section>

        {/* 2. ACCIONES RÁPIDAS EN CUADRÍCULA ERGONÓMICA */}
        <section className="grid grid-cols-2 gap-2.5">
          {/* Botón Acción 1: Simular Entrada al Torniquete */}
          <button
            type="button"
            onClick={() => {
              metroAudio.playNfcTap();
              setIsTurnstileOpen(true);
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#0A0D15] hover:from-slate-800 hover:to-slate-900 border border-slate-800 hover:border-rose-500/40 text-left transition flex flex-col justify-between gap-3 shadow-lg cursor-pointer group active:scale-95"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                <TrainFront className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/60">
                PROBAR
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                Torniquete NFC
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Simula tocar el validador</p>
            </div>
          </button>

          {/* Botón Acción 2: Recarga con Pago Móvil */}
          <button
            type="button"
            onClick={() => {
              metroAudio.playTacticalClick();
              setIsRechargeOpen(true);
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#0A0D15] hover:from-slate-800 hover:to-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left transition flex flex-col justify-between gap-3 shadow-lg cursor-pointer group active:scale-95"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                INMEDIATO
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                Recargar Saldo
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Pago Móvil C2P y P2P</p>
            </div>
          </button>
        </section>

        {/* 3. RUTAS, ESTADO DE LA RED Y PLANIFICADOR DE VIAJE */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Red y Planificador Caracas</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">4 Líneas Activas</span>
          </div>

          <MetroNetworkStatus />
        </section>

        {/* 4. BENEFICIOS CLAVE DE METROPAY CARACAS */}
        <section className="p-4 rounded-3xl bg-[#0A0E17] border border-slate-800/80 space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ventajas del Boleto Digital</span>
          </h4>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <p className="leading-relaxed">
                <strong>Sin colas de taquilla:</strong> Olvídate de hacer 40 minutos de cola en Plaza Venezuela o La Hoyada para comprar plástico.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <p className="leading-relaxed">
                <strong>Funciona sin datos bajo tierra:</strong> Los boletos se validan mediante tokens criptográficos locales almacenados en tu dispositivo.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <p className="leading-relaxed">
                <strong>Recarga en Bolívares al instante:</strong> Conexión directa a Pago Móvil de todos los bancos nacionales de Venezuela.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* BARRA DE NAVEGACIÓN INFERIOR (Estilo Apple Wallet Navigation) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#070A13]/95 backdrop-blur-2xl border-t border-white/5 safe-area-bottom shadow-2xl">
        <div className="max-w-md mx-auto grid grid-cols-4 h-16 items-center px-2">
          {/* Tab 1: Mi Boleto */}
          <button
            type="button"
            onClick={() => {
              metroAudio.playTacticalClick();
              setActiveTab('CARD');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 transition cursor-pointer ${
              activeTab === 'CARD' ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span className="text-[10px] mt-1">Mi Boleto</span>
            {activeTab === 'CARD' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5" />}
          </button>

          {/* Tab 2: Torniquete */}
          <button
            type="button"
            onClick={() => {
              metroAudio.playNfcTap();
              setIsTurnstileOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <TrainFront className="w-5 h-5 text-rose-400" />
            <span className="text-[10px] mt-1 text-rose-400 font-bold">Validar</span>
          </button>

          {/* Tab 3: Recargar */}
          <button
            type="button"
            onClick={() => {
              metroAudio.playTacticalClick();
              setIsRechargeOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] mt-1 text-emerald-400 font-bold">Recargar</span>
          </button>

          {/* Tab 4: Historial */}
          <button
            type="button"
            onClick={() => {
              metroAudio.playTacticalClick();
              setIsHistoryOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] mt-1">Historial</span>
          </button>
        </div>
      </nav>

      {/* MODALES DEL SISTEMA */}
      <TurnstileSimulatorModal
        isOpen={isTurnstileOpen}
        onClose={() => setIsTurnstileOpen(false)}
        card={card}
        onUpdateCard={handleUpdateCard}
        onOpenRecharge={() => {
          setIsTurnstileOpen(false);
          setIsRechargeOpen(true);
        }}
      />

      <QuickRechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
        card={card}
        onUpdateCard={handleUpdateCard}
      />

      <TripHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
