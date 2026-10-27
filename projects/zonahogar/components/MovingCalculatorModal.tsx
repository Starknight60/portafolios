'use client';

import { useState } from 'react';
import { PropertyItem } from '@/lib/properties';
import { 
  X, Calculator, DollarSign, Truck, FileText, ShoppingBag, 
  ShieldCheck, AlertTriangle, Check, Copy, Sparkles, MessageCircle 
} from 'lucide-react';
import { playTacticalClick, playHomeChime } from '@/lib/audio';

interface MovingCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProperty?: PropertyItem | null;
}

export default function MovingCalculatorModal({
  isOpen,
  onClose,
  initialProperty,
}: MovingCalculatorModalProps) {
  const [rentMonthly, setRentMonthly] = useState<number>(
    initialProperty ? initialProperty.priceMonthlyUsd : 120
  );
  const [depositMonths, setDepositMonths] = useState<number>(
    initialProperty ? initialProperty.depositMonths : 1
  );
  const [contractFee, setContractFee] = useState<number>(
    initialProperty ? initialProperty.contractFeeUsd : 30
  );
  const [fleteType, setFleteType] = useState<number>(35); // 0: Maletas, 35: Pick-up, 75: Camión 350
  const [initialSupplies, setInitialSupplies] = useState<number>(50); // Comida/básicos iniciales
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Cálculos ZonaHogar (Trato directo con el propietario)
  const depositTotal = rentMonthly * depositMonths;
  const firstMonth = rentMonthly;
  const totalZonaHogar = firstMonth + depositTotal + contractFee + fleteType + initialSupplies;

  // Cálculos Tradicionales (Inmobiliarias cobran comisión de 1 o 2 meses de canon)
  const realEstateCommission = rentMonthly * 1.5;
  const totalTraditional = totalZonaHogar + realEstateCommission;
  const directSavings = realEstateCommission;

  const handleCopyBudget = () => {
    playTacticalClick();
    const summary = `📊 *PRESUPUESTO DE MUDANZA - ZONAHOGAR*\n` +
      `🏠 Alquiler Mensual: $${rentMonthly} USD\n` +
      `🔒 Depósito (${depositMonths} mes${depositMonths > 1 ? 'es' : ''}): $${depositTotal} USD (reembolsable)\n` +
      `📝 Redacción de Contrato: $${contractFee} USD\n` +
      `🚚 Flete / Transporte: $${fleteType} USD\n` +
      `🛒 Compras básicas primer día: $${initialSupplies} USD\n` +
      `--------------------------------\n` +
      `💰 *TOTAL ENTRADA (Trato Directo): $${totalZonaHogar} USD*\n` +
      `✨ *Ahorro vs Inmobiliaria Tradicional: $${Math.round(directSavings)} USD*\n\n` +
      `Calculado en ZonaHogar • https://portafolios-rho.vercel.app`;

    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      playHomeChime();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Calculadora de Mudanza & Entrada
              </h2>
              <p className="text-xs text-slate-400">
                {initialProperty ? `Calculando para: ${initialProperty.title}` : 'Estima el efectivo exacto que necesitas para mudarte'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTacticalClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-300">
          
          {/* Tarjeta de Ahorro Trato Directo */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Trato 100% Directo
              </span>
              <p className="text-sm font-semibold text-white">
                ¡Ahorras aprox. <span className="text-emerald-400 font-bold">${Math.round(directSavings)} USD</span> en comisiones!
              </p>
              <p className="text-xs text-slate-400">
                En ZonaHogar hablas directo con el dueño. Cero pago de honorarios inmobiliarios abusivos.
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-emerald-400">${Math.round(directSavings)}</div>
              <div className="text-[10px] text-slate-400">Ahorro Neto</div>
            </div>
          </div>

          {/* Formulario de parámetros */}
          <div className="space-y-4">
            {/* Alquiler mensual */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-400" /> Canon de Alquiler Mensual
                </label>
                <span className="text-base font-bold text-amber-400">${rentMonthly} USD</span>
              </div>
              <input
                type="range"
                min="40"
                max="500"
                step="5"
                value={rentMonthly}
                onChange={(e) => setRentMonthly(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$40 (Habitación compartida)</span>
                <span>$200 (Anexo céntrico)</span>
                <span>$500 (Apto grande)</span>
              </div>
            </div>

            {/* Meses de Depósito */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Meses de Depósito en Garantía
                </label>
                <span className="text-xs font-medium text-slate-400">
                  Total: <strong className="text-white">${depositTotal} USD</strong> (100% reembolsable)
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      playTacticalClick();
                      setDepositMonths(m);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      depositMonths === m
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {m === 0 ? 'Sin depósito' : `${m} ${m === 1 ? 'Mes' : 'Meses'}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Flete y Transporte */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-400" /> Logística de Mudanza / Flete
                </label>
                <span className="text-sm font-bold text-indigo-400">${fleteType} USD</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { cost: 0, label: 'Solo Maletas', sub: 'En taxi o metro' },
                  { cost: 35, label: 'Pick-up Pequeña', sub: 'Cama y cajas' },
                  { cost: 75, label: 'Camión 350', sub: 'Nevera y muebles' },
                ].map((item) => (
                  <button
                    key={item.cost}
                    type="button"
                    onClick={() => {
                      playTacticalClick();
                      setFleteType(item.cost);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      fleteType === item.cost
                        ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.sub} (${item.cost})</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Redacción y Compras Iniciales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> Gastos Contrato
                  </span>
                  <span className="text-xs font-bold text-white">${contractFee} USD</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={contractFee}
                  onChange={(e) => setContractFee(Number(e.target.value))}
                  className="w-full accent-slate-400 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500">Gastos legales y redacción privada</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-400" /> Mercado Inicial
                  </span>
                  <span className="text-xs font-bold text-white">${initialSupplies} USD</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="150"
                  step="10"
                  value={initialSupplies}
                  onChange={(e) => setInitialSupplies(Number(e.target.value))}
                  className="w-full accent-slate-400 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500">Artículos de aseo y despensa día 1</div>
              </div>
            </div>
          </div>

          {/* Gran Resumen de Costo Total */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-amber-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Total Requerido en Mano
                </span>
                <div className="text-3xl font-black text-white">
                  ${totalZonaHogar} <span className="text-base font-normal text-slate-400">USD</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-medium text-slate-400">En Inmobiliaria Tradicional</span>
                <div className="text-lg font-bold text-red-400/80 line-through">
                  ${totalTraditional} USD
                </div>
              </div>
            </div>

            {/* Desglose rápido */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-700/60 text-xs">
              <div className="p-2 rounded-xl bg-slate-900/60">
                <div className="text-slate-400 text-[10px]">1er Mes Adelantado</div>
                <div className="font-bold text-white">${firstMonth}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60">
                <div className="text-slate-400 text-[10px]">Depósito ({depositMonths}m)</div>
                <div className="font-bold text-white">${depositTotal}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60">
                <div className="text-slate-400 text-[10px]">Flete / Mudanza</div>
                <div className="font-bold text-white">${fleteType}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60">
                <div className="text-slate-400 text-[10px]">Contrato + Iniciales</div>
                <div className="font-bold text-white">${contractFee + initialSupplies}</div>
              </div>
            </div>
          </div>

          {/* Consejos Clave para Alquilar en Venezuela */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Recomendaciones Clave al Alquilar:
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Verifica el agua personalmente:</strong> Abre las llaves de la ducha y lavamanos durante la visita presencial.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Prueba la velocidad de internet:</strong> Pide al dueño hacer un test de velocidad en Fast.com o Speedtest.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Inventario fotográfico:</strong> Toma fotos al entrar de las paredes, cerraduras y muebles para proteger tu depósito.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pie de modal */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyBudget}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>¡Presupuesto Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copiar Resumen para Guardar</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              playTacticalClick();
              onClose();
            }}
            className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all"
          >
            Listo, Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
