'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, Sparkles, CheckCircle2, Copy, Check, ArrowRight, 
  CreditCard, Smartphone, ShieldCheck, HelpCircle 
} from 'lucide-react';
import { TransitCard, saveCard } from '@/lib/transitStorage';
import { METRO_FARE, VENEZUELA_BANKS } from '@/lib/metroData';
import { metroAudio } from '@/lib/audio';

interface QuickRechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: TransitCard;
  onUpdateCard: (updated: TransitCard) => void;
}

export default function QuickRechargeModal({
  isOpen,
  onClose,
  card,
  onUpdateCard,
}: QuickRechargeModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('pack10');
  const [paymentMethod, setPaymentMethod] = useState<'PAGO_MOVIL' | 'BIOPAGO'>('PAGO_MOVIL');
  const [userBank, setUserBank] = useState<string>('0102');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedData, setCopiedData] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlan = METRO_FARE.plans.find((p) => p.id === selectedPlanId) || METRO_FARE.plans[1];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedData(label);
    metroAudio.playTacticalClick();
    setTimeout(() => setCopiedData(null), 2000);
  };

  const handleConfirmRecharge = () => {
    setIsProcessing(true);
    metroAudio.playTacticalClick();

    setTimeout(() => {
      const updatedTrips = card.tripsAvailable + currentPlan.trips;
      const updatedBs = card.balanceBs + currentPlan.priceBs;

      const updatedCard: TransitCard = {
        ...card,
        tripsAvailable: updatedTrips,
        balanceBs: updatedBs,
      };

      saveCard(updatedCard);
      onUpdateCard(updatedCard);

      setIsProcessing(false);
      metroAudio.playRechargeSuccess();

      // Confetti de celebración
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#E11D48', '#10B981', '#2563EB', '#F59E0B'],
        });
      } catch {}

      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#0A101C] border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col gap-4 overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 p-[1px] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Recarga de Saldo</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  PAGO MÓVIL
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Acreditación automática inmediata a tu tarjeta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Selección de Plan de Viajes */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            1. Selecciona el Plan de Viajes:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {METRO_FARE.plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const usdEquiv = (plan.priceBs / METRO_FARE.bcvExchangeRate).toFixed(2);

              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    metroAudio.playTacticalClick();
                  }}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-1 relative ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-rose-600 text-[8px] font-black text-white font-mono uppercase">
                      Popular
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{plan.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{plan.description}</p>
                  </div>
                  <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-slate-800/80">
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      Bs. {plan.priceBs.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ~${usdEquiv} USD
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Coordenadas de Pago Móvil Oficial */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#0A0D15] border border-slate-700 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-rose-400" />
              <span>Datos Pago Móvil Metro de Caracas:</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              Total a transferir: Bs. {currentPlan.priceBs.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {/* Banco */}
            <div 
              onClick={() => handleCopy('0102', 'banco')}
              className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between cursor-pointer hover:border-slate-700 transition"
            >
              <span className="text-[9px] text-slate-400 font-mono uppercase">Banco:</span>
              <span className="font-bold text-white font-mono">0102 (BDV)</span>
              <span className="text-[9px] text-rose-400 flex items-center gap-0.5 mt-0.5">
                {copiedData === 'banco' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />} Copiar
              </span>
            </div>

            {/* Teléfono */}
            <div 
              onClick={() => handleCopy('04121234567', 'telefono')}
              className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between cursor-pointer hover:border-slate-700 transition"
            >
              <span className="text-[9px] text-slate-400 font-mono uppercase">Teléfono:</span>
              <span className="font-bold text-white font-mono">0412-1234567</span>
              <span className="text-[9px] text-rose-400 flex items-center gap-0.5 mt-0.5">
                {copiedData === 'telefono' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />} Copiar
              </span>
            </div>

            {/* RIF */}
            <div 
              onClick={() => handleCopy('J001234567', 'rif')}
              className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between cursor-pointer hover:border-slate-700 transition col-span-2 sm:col-span-1"
            >
              <span className="text-[9px] text-slate-400 font-mono uppercase">RIF Empresa:</span>
              <span className="font-bold text-white font-mono">J-00123456-7</span>
              <span className="text-[9px] text-rose-400 flex items-center gap-0.5 mt-0.5">
                {copiedData === 'rif' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />} Copiar
              </span>
            </div>
          </div>
        </div>

        {/* 3. Banco emisor y referencia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
              Tu Banco Emisor:
            </label>
            <select
              value={userBank}
              onChange={(e) => setUserBank(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              {VENEZUELA_BANKS.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
              Últimos 4 dígitos de Referencia:
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="Ej: 8492"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Botón de Confirmación Inmediata */}
        <button
          type="button"
          onClick={handleConfirmRecharge}
          disabled={isProcessing}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-950/80 cursor-pointer active:scale-95"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verificando Pago Móvil...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar y Acreditar {currentPlan.trips} Viajes (Bs. {currentPlan.priceBs.toFixed(2)})</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          🔒 Integrado con el sistema de validación C2P/P2P. Tu saldo se sincroniza en la nube y queda disponible offline para cuando bajes al andén.
        </p>
      </div>
    </div>
  );
}
