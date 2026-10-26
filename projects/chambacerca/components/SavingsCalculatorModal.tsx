'use client';

import { useState } from 'react';
import { 
  X, DollarSign, Clock, TrendingUp, Sparkles, HeartHandshake, 
  HelpCircle, CheckCircle2, AlertCircle, Copy, Check, Bus, Navigation
} from 'lucide-react';
import { PlaceResultItem } from '@/app/api/places/route';

interface SavingsCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlace?: PlaceResultItem | null;
}

export default function SavingsCalculatorModal({
  isOpen,
  onClose,
  selectedPlace,
}: SavingsCalculatorModalProps) {
  // Pre-calcular salario inicial si hay una vacante seleccionada
  const initialSalary = selectedPlace?.salaryRange
    ? parseInt(selectedPlace.salaryRange.replace(/\D/g, '').slice(0, 3), 10) || 200
    : 200;

  const [monthlySalaryUSD, setMonthlySalaryUSD] = useState<number>(initialSalary);
  const [ridesPerDay, setRidesPerDay] = useState<number>(4); // 2 de ida + 2 de regreso
  const [rideCostBs, setRideCostBs] = useState<number>(25); // 25 Bs por pasaje en camionetica
  const [bcvRate, setBcvRate] = useState<number>(55); // Tasa de cambio de referencia Bs/USD
  const [workDaysPerMonth, setWorkDaysPerMonth] = useState<number>(24);
  const [trafficHoursPerDay, setTrafficHoursPerDay] = useState<number>(2.5); // 2.5 horas diarias en cola
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen) return null;

  // Cálculos matemáticos de transporte vs salario real
  const rideCostUSD = rideCostBs / (bcvRate || 55);
  const dailyTransitCostUSD = ridesPerDay * rideCostUSD;
  const monthlyTransitCostUSD = dailyTransitCostUSD * workDaysPerMonth;

  // Salario libre
  const salaryFarJobNet = Math.max(0, monthlySalaryUSD - monthlyTransitCostUSD);
  const salaryNearJobNet = monthlySalaryUSD;
  const percentageLostInTransit = Math.round((monthlyTransitCostUSD / monthlySalaryUSD) * 100);

  // Tiempo perdido en colas
  const monthlyHoursInTraffic = Math.round(trafficHoursPerDay * workDaysPerMonth);
  const daysOfLifeLostPerYear = Math.round((monthlyHoursInTraffic * 12) / 24);

  const copySavingsSummary = () => {
    const text = `📊 Balance ChambaCerca en Venezuela:
Salario: $${monthlySalaryUSD} USD/mes
Gasto en camioneticas evitables: -$${monthlyTransitCostUSD.toFixed(1)} USD/mes (${ridesPerDay} pasajes/día)
Salario real trabajando lejos: $${salaryFarJobNet.toFixed(1)} USD/mes
Salario real con ChambaCerca (a pie): $${salaryNearJobNet.toFixed(1)} USD/mes (+${monthlyTransitCostUSD.toFixed(1)} USD libres en tu bolsillo)
Tiempo recuperado con tu familia: ${monthlyHoursInTraffic} horas al mes libres de colas.
Calculado en ChambaCerca (Radar de empleo local por GPS).`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] bg-[#0A101C] border border-emerald-500/40 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.25)] flex flex-col overflow-hidden text-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera de la Calculadora con Aura Esmeralda */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-emerald-950/60 via-[#0B1424] to-[#0A101C] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <DollarSign className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Calculadora de Salario Real de Bolsillo</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-500 text-slate-950 rounded-full font-mono">
                  VZLA REAL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ¿Cuánto dinero y horas de vida te cuesta realmente una chamba lejos de tu casa?
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo Desplazable con Inputs y Métricas */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[calc(92vh-150px)]">
          {/* Vacante Vinculada si existe */}
          {selectedPlace && (
            <div className="p-3 rounded-xl bg-slate-900/70 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-300">
                Calculando para: <strong className="text-white">{selectedPlace.placeName}</strong> ({selectedPlace.title})
              </span>
              <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                🚶‍♂️ {selectedPlace.walkTimeMinutes} min a pie
              </span>
            </div>
          )}

          {/* GRID DE PARÁMETROS INTERACTIVOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Salario Ofrecido en USD */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Salario Mensual Estimado:
                </span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  ${monthlySalaryUSD} USD
                </span>
              </div>
              <input
                type="range"
                min="80"
                max="500"
                step="10"
                value={monthlySalaryUSD}
                onChange={(e) => setMonthlySalaryUSD(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>$80 (Base)</span>
                <span>$200 (Promedio)</span>
                <span>$500+</span>
              </div>
            </div>

            {/* 2. Camioneticas / Pasajes al Día */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Bus className="w-4 h-4 text-cyan-400" />
                  Pasajes Diarios (Ida y Vuelta):
                </span>
                <span className="text-sm font-black text-cyan-400 font-mono">
                  {ridesPerDay} pasajes/día
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={ridesPerDay}
                onChange={(e) => setRidesPerDay(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 (Caminando)</span>
                <span>2 (1 ruta ida/vuelta)</span>
                <span>4 (Transbordo)</span>
              </div>
            </div>

            {/* 3. Costo del Pasaje en Bs. */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <span>💵 Tarifa por Pasaje:</span>
                </span>
                <span className="text-xs font-black text-amber-400 font-mono">
                  {rideCostBs} Bs. (~${rideCostUSD.toFixed(2)})
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                step="5"
                value={rideCostBs}
                onChange={(e) => setRideCostBs(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>15 Bs. (Metro/Corto)</span>
                <span>25 Bs. (Urbano)</span>
                <span>40+ Bs. (Suburbano)</span>
              </div>
            </div>

            {/* 4. Horas Perdidas en Cola al Día */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-400" />
                  Tiempo de Viaje / Colas al Día:
                </span>
                <span className="text-xs font-black text-rose-400 font-mono">
                  {trafficHoursPerDay} hrs/día
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={trafficHoursPerDay}
                onChange={(e) => setTrafficHoursPerDay(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>30 min</span>
                <span>2.5 hrs (Normal Vzla)</span>
                <span>4+ hrs (Guarenas/Valles)</span>
              </div>
            </div>

          </div>

          {/* =========================================================================
              RESULTADO DEL BALANCE FINANCIERO & VITAL
              ========================================================================= */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-[#0C1527] to-[#0A101C] border border-emerald-500/40 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Veredicto Financiero Real:
              </span>
              <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full animate-card-glow">
                +${monthlyTransitCostUSD.toFixed(1)} USD Libres / Mes
              </span>
            </div>

            {/* COMPARATIVA DE BARRAS DE SALARIO */}
            <div className="space-y-3 pt-1">
              
              {/* Opción 1: Chamba Lejos */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    ❌ Trabajando Lejos (Camionetica diaria):
                  </span>
                  <span className="font-black text-rose-400 font-mono">
                    ${salaryFarJobNet.toFixed(1)} USD netos
                    <span className="text-[10px] text-slate-500 font-normal ml-1">
                      (-${monthlyTransitCostUSD.toFixed(1)} en pasajes)
                    </span>
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-rose-500/80 transition-all duration-300"
                    style={{ width: `${Math.max(10, Math.round((salaryFarJobNet / monthlySalaryUSD) * 100))}%` }}
                  />
                  <div 
                    className="h-full bg-red-950 transition-all duration-300"
                    style={{ width: `${percentageLostInTransit}%` }}
                    title={`Se te van $${monthlyTransitCostUSD.toFixed(1)} en camioneticas`}
                  />
                </div>
              </div>

              {/* Opción 2: ChambaCerca */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <span>✓</span> Con ChambaCerca (A pie o transporte corto):
                  </span>
                  <span className="font-black text-emerald-400 font-mono text-sm">
                    ${salaryNearJobNet.toFixed(1)} USD íntegros (100%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300 shadow-[0_0_10px_#10B981]"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

            </div>

            {/* TIEMPO DE VIDA RECUPERADO */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">
                    {monthlyHoursInTraffic} horas al mes ganadas
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Equivalen a <strong>{daysOfLifeLostPerYear} días completos al año</strong> que no pasarás parado en una cola, mojándote con lluvia ni esperando transporte.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">
                    +${monthlyTransitCostUSD.toFixed(1)} para tu casa
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Ese dinero no se evapora en pasajes: sirve para comprar comida, pagar servicios o ayudar a tu familia.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Barra de Acciones Inferior */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0B1220] flex items-center justify-between gap-3">
          <button
            onClick={copySavingsSummary}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              copiedSummary
                ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_#10B981]'
                : 'bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {copiedSummary ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Balance Copiado al Portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Balance para WhatsApp</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-950 cursor-pointer"
          >
            Listo, Seguir Explorando Empleos
          </button>
        </div>
      </div>
    </div>
  );
}
