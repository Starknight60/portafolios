'use client';

import { useState } from 'react';
import { PropertyItem, CITIES_LIST } from '@/lib/properties';
import { 
  X, PlusCircle, Home, DollarSign, Droplets, Zap, Wifi, 
  MapPin, Phone, ShieldCheck, CheckCircle2, Sparkles, AlertCircle 
} from 'lucide-react';
import { playTacticalClick, playHomeChime } from '@/lib/audio';

interface PostPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty: (property: PropertyItem) => void;
}

const SAMPLE_PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
];

export default function PostPropertyModal({
  isOpen,
  onClose,
  onAddProperty,
}: PostPropertyModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'room' | 'annex' | 'studio' | 'apartment'>('room');
  const [city, setCity] = useState('Caracas');
  const [zone, setZone] = useState('');
  const [address, setAddress] = useState('');
  const [priceMonthlyUsd, setPriceMonthlyUsd] = useState(120);
  const [depositMonths, setDepositMonths] = useState(1);
  const [hasTank, setHasTank] = useState(true);
  const [tankLitres, setTankLitres] = useState(2000);
  const [waterSchedule, setWaterSchedule] = useState('Agua constante con tanque y bomba hidroneumática');
  const [hasGenerator, setHasGenerator] = useState(false);
  const [hasFiber, setHasFiber] = useState(true);
  const [fiberProvider, setFiberProvider] = useState('NetUno Fibra');
  const [fiberSpeed, setFiberSpeed] = useState(200);
  const [allowsCouples, setAllowsCouples] = useState(false);
  const [allowsStudents, setAllowsStudents] = useState(true);
  const [allowsPets, setAllowsPets] = useState(false);
  const [hasIndependentKeys, setHasIndependentKeys] = useState(true);
  const [ownerName, setOwnerName] = useState('');
  const [ownerWhatsapp, setOwnerWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !zone || !ownerName || !ownerWhatsapp) {
      alert('Por favor completa el título, zona, tu nombre y WhatsApp de contacto.');
      return;
    }

    // Coordenadas aproximadas según la ciudad seleccionada con leve variación
    const selectedCityData = CITIES_LIST.find((c) => c.name === city) || CITIES_LIST[0];
    const jitterLat = (Math.random() - 0.5) * 0.02;
    const jitterLng = (Math.random() - 0.5) * 0.02;

    const newProperty: PropertyItem = {
      id: `zh-user-${Date.now()}`,
      title,
      type,
      typeLabel: 
        type === 'room' ? 'Habitación Privada' :
        type === 'annex' ? 'Anexo Independiente' :
        type === 'studio' ? 'Monoambiente / Studio' : 'Apartamento Pequeño',
      typeIcon:
        type === 'room' ? '🛏️' :
        type === 'annex' ? '🏡' :
        type === 'studio' ? '🏢' : '🏠',
      priceMonthlyUsd,
      depositMonths,
      contractFeeUsd: 25,
      zone,
      city,
      address: address || `${zone}, ${city}`,
      latitude: selectedCityData.lat + jitterLat,
      longitude: selectedCityData.lng + jitterLng,
      nearestTransport: 'Parada de transporte principal a 3 min a pie',
      walkMinutesToTransport: 3,
      waterSystem: {
        hasTank,
        tankLitres: hasTank ? tankLitres : 0,
        schedule: waterSchedule,
      },
      electricity: {
        hasGenerator,
        description: hasGenerator ? 'Edificio con planta eléctrica para áreas comunes y ascensores' : 'Circuito residencial estándar',
      },
      internet: {
        hasFiber,
        provider: hasFiber ? fiberProvider : 'Conexión estándar',
        speedMbps: hasFiber ? fiberSpeed : 20,
      },
      rules: {
        allowsCouples,
        allowsPets,
        allowsStudents,
        allowsVisitors: true,
        hasIndependentKeys,
      },
      amenities: [
        hasIndependentKeys ? 'Llaves independientes' : 'Entrada compartida',
        hasFiber ? `Internet Fibra ${fiberSpeed}Mbps` : 'Internet',
        hasTank ? `Tanque de agua ${tankLitres}L` : 'Agua de red',
        'Cama y closet',
        'Baño privado'
      ],
      verifiedDirectOwner: true,
      ownerName: `${ownerName} (Dueño Directo)`,
      ownerWhatsapp: ownerWhatsapp.startsWith('+') ? ownerWhatsapp : `+58${ownerWhatsapp.replace(/\D/g, '')}`,
      images: SAMPLE_PHOTO_PRESETS,
      description: description || `Inmueble publicado directamente por su dueño en ${zone}, ${city}. Excelente ubicación con servicios esenciales garantizados.`,
      publishedDate: 'Hoy',
    };

    onAddProperty(newProperty);
    playHomeChime();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Publicar Alquiler Gratis (Trato Directo)
              </h2>
              <p className="text-xs text-slate-400">
                Sin intermediarios ni comisiones • Recibe mensajes directo en tu WhatsApp
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

        {/* Modal de éxito */}
        {submitted ? (
          <div className="p-12 text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-bold text-white">¡Publicación Activa!</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Tu inmueble en <strong>{zone}, {city}</strong> ya está visible en el Radar de ZonaHogar con su pin en Google Maps y botón de contacto a tu WhatsApp.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-300">
            {/* Tipo de Inmueble */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Tipo de Inmueble</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'room', label: 'Habitación', icon: '🛏️' },
                  { id: 'annex', label: 'Anexo', icon: '🏡' },
                  { id: 'studio', label: 'Studio', icon: '🏢' },
                  { id: 'apartment', label: 'Apartamento', icon: '🏠' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      playTacticalClick();
                      setType(t.id as any);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                      type === t.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Título */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Título Atractivo</label>
              <input
                type="text"
                required
                placeholder="Ej. Habitación amplia amoblada con baño privado y tanque propio"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Ciudad y Zona */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Ciudad</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  {CITIES_LIST.map((c) => (
                    <option key={c.id} value={c.name} className="bg-slate-900 text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Zona / Urbanización</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Los Palos Grandes, Naguanagua, etc."
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Precio y Depósito */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Alquiler Mensual ($ USD)
                </label>
                <input
                  type="number"
                  min="20"
                  max="2000"
                  value={priceMonthlyUsd}
                  onChange={(e) => setPriceMonthlyUsd(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Meses de Depósito</label>
                <select
                  value={depositMonths}
                  onChange={(e) => setDepositMonths(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value={0} className="bg-slate-900">0 Meses (Sin depósito)</option>
                  <option value={1} className="bg-slate-900">1 Mes</option>
                  <option value={2} className="bg-slate-900">2 Meses</option>
                  <option value={3} className="bg-slate-900">3 Meses</option>
                </select>
              </div>
            </div>

            {/* Servicios Vitales (Agua, Luz, Internet) */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Servicios Vitales Garantizados
              </div>

              {/* Tanque de Agua */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-medium text-white">¿Tiene tanque de agua propio?</div>
                    <div className="text-[10px] text-slate-400">Vital para los inquilinos</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasTank}
                  onChange={(e) => setHasTank(e.target.checked)}
                  className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {hasTank && (
                <div className="grid grid-cols-2 gap-2 pl-6">
                  <div>
                    <label className="text-[10px] text-slate-400">Capacidad (Litros)</label>
                    <input
                      type="number"
                      step="500"
                      value={tankLitres}
                      onChange={(e) => setTankLitres(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Horario de Agua</label>
                    <input
                      type="text"
                      value={waterSchedule}
                      onChange={(e) => setWaterSchedule(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Internet Fibra */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-700/50">
                <div className="flex items-center gap-2.5">
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-medium text-white">¿Tiene Fibra Óptica?</div>
                    <div className="text-[10px] text-slate-400">NetUno, Fibex, Airtek, etc.</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasFiber}
                  onChange={(e) => setHasFiber(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Planta Eléctrica */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-700/50">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-medium text-white">¿Planta eléctrica o sin cortes?</div>
                    <div className="text-[10px] text-slate-400">Para áreas comunes o ascensor</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasGenerator}
                  onChange={(e) => setHasGenerator(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Reglas de Convivencia */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Reglas & Condiciones</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowsCouples}
                    onChange={(e) => setAllowsCouples(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Acepta parejas</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowsStudents}
                    onChange={(e) => setAllowsStudents(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Acepta estudiantes</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowsPets}
                    onChange={(e) => setAllowsPets(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Acepta mascotas</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasIndependentKeys}
                    onChange={(e) => setHasIndependentKeys(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Llaves independientes</span>
                </label>
              </div>
            </div>

            {/* Datos de Contacto Directo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Tu Nombre (Dueño)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sra. Beatriz Mendoza"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Número de WhatsApp
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. +58 414 1234567"
                  value={ownerWhatsapp}
                  onChange={(e) => setOwnerWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Pie y Botón */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publicar Ahora en el Radar</span>
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Publicación gratuita garantizada. Al publicar confirmas ser propietario o representante directo.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
