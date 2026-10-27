'use client';

import { useState } from 'react';
import { PropertyItem } from '@/lib/properties';
import { 
  X, MapPin, DollarSign, Droplets, Zap, Wifi, CheckCircle2, 
  MessageCircle, ShieldCheck, Share2, Copy, Check, Navigation,
  Home, Users, Heart, Key, Calendar, Calculator, Sparkles, AlertCircle
} from 'lucide-react';
import { playTacticalClick, playHomeChime } from '@/lib/audio';

interface PropertyDetailModalProps {
  property: PropertyItem | null;
  onClose: () => void;
  onOpenMovingCalculator: (property: PropertyItem) => void;
}

export default function PropertyDetailModal({
  property,
  onClose,
  onOpenMovingCalculator,
}: PropertyDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!property) return null;

  // Cálculo total para entrar a vivir
  const depositTotal = property.priceMonthlyUsd * property.depositMonths;
  const firstMonth = property.priceMonthlyUsd;
  const contractFee = property.contractFeeUsd;
  const totalToMoveIn = depositTotal + firstMonth + contractFee;

  // Ahorro estimado al ser trato directo (las inmobiliarias en Venezuela cobran hasta 3 meses de comisión: ~$300-$600)
  const traditionalRealEstateComission = property.priceMonthlyUsd * 2;

  // Mensaje formal para WhatsApp directo con el dueño
  const whatsappMessage = `Hola, cordial saludo. Vi en ZonaHogar su publicación: "${property.title}" en ${property.zone}, ${property.city} por $${property.priceMonthlyUsd}/mes. Cumplo con los requisitos y quisiera agendar una visita presencial para conocer el inmueble. Muchas gracias.`;
  const whatsappUrl = `https://wa.me/${property.ownerWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleShareToWhatsApp = () => {
    playTacticalClick();
    const shareText = `¡Epa! 👋 En ZonaHogar vi este alquiler en ${property.zone}, ${property.city}:\n\n🏡 *${property.title}*\n💰 *$${property.priceMonthlyUsd} USD / mes*\n🚰 Tanque propio: ${property.waterSystem.tankLitres}L\n⚡ ${property.internet.provider}\n\nÉchale un ojo aquí 👇\nhttps://portafolios-rho.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleCopyLink = () => {
    playTacticalClick();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] bg-[#0A101C] border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-[#0E1626] via-[#0C1422] to-[#0A101C] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <span>{property.typeIcon}</span>
                <span>{property.typeLabel}</span>
              </span>

              {property.verifiedDirectOwner && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-600/60 flex items-center gap-1 animate-liquid-shimmer">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Trato Directo con Propietario</span>
                </span>
              )}

              <span className="text-xs text-slate-400">
                Publicado {property.publishedDate}
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
              {property.title}
            </h2>

            <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{property.address}</span>
              <span className="text-slate-400 text-xs">({property.zone}, {property.city})</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleShareToWhatsApp}
              className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition cursor-pointer"
              title="Compartir a un pana por WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Copiar enlace"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido con Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Galería de Imágenes */}
          <div className="space-y-2">
            <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative">
              <img
                src={property.images[activeImageIndex] || property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-slate-200 border border-slate-800">
                {activeImageIndex + 1} / {property.images.length}
              </div>
            </div>

            {property.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      activeImageIndex === idx ? 'border-amber-400 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tarjetas de Servicios Críticos (Agua, Luz, Internet Fibra) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Agua */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-blue-400">
                <Droplets className="w-4 h-4" />
                <span className="font-extrabold text-xs uppercase tracking-wide">Agua Potable</span>
              </div>
              <p className="text-sm font-bold text-white">
                {property.waterSystem.hasTank ? `Tanque de ${property.waterSystem.tankLitres}L` : 'Suministro por tubería'}
              </p>
              <p className="text-[11px] text-slate-400 leading-tight">
                {property.waterSystem.schedule}
              </p>
            </div>

            {/* 2. Electricidad */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400">
                <Zap className="w-4 h-4" />
                <span className="font-extrabold text-xs uppercase tracking-wide">Electricidad</span>
              </div>
              <p className="text-sm font-bold text-white">
                {property.electricity.hasGenerator ? 'Planta Eléctrica Activa' : 'Servicio de Red Estable'}
              </p>
              <p className="text-[11px] text-slate-400 leading-tight">
                {property.electricity.description}
              </p>
            </div>

            {/* 3. Internet Fibra */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400">
                <Wifi className="w-4 h-4" />
                <span className="font-extrabold text-xs uppercase tracking-wide">Internet Fibra</span>
              </div>
              <p className="text-sm font-bold text-white">
                {property.internet.hasFiber ? `${property.internet.speedMbps} Mbps Simétricos` : 'Conexión Básica'}
              </p>
              <p className="text-[11px] text-slate-400 leading-tight">
                {property.internet.provider}
              </p>
            </div>
          </div>

          {/* Calculadora de Entrada en Vivo ("¿Cuánto dinero necesito en total?") */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 shadow-lg relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span>Costo Total para Mudarte</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Cero Comisión Inmobiliaria
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Desglose exacto y transparente de lo que pide el propietario para entregarte la llave:
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-black text-amber-400 font-mono">
                  ${totalToMoveIn} USD
                </p>
                <p className="text-[10px] text-slate-400">Total para entrar a vivir</p>
              </div>
            </div>

            {/* Desglose de Pagos */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-[10px] text-slate-400">Mes Adelantado</p>
                <p className="font-bold text-white font-mono mt-0.5">${firstMonth}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-[10px] text-slate-400">{property.depositMonths} Mes(es) Depósito</p>
                <p className="font-bold text-amber-400 font-mono mt-0.5">${depositTotal}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-[10px] text-slate-400">Redacción Contrato</p>
                <p className="font-bold text-slate-200 font-mono mt-0.5">${contractFee}</p>
              </div>
            </div>

            <div className="mt-2.5 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Te estás ahorrando aproximadamente <strong>${traditionalRealEstateComission} USD</strong> que te cobraría un gestor o inmobiliaria tradicional.</span>
            </div>
          </div>

          {/* Reglas de Convivencia y Lo que Incluye */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reglas de la Casa */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Reglas de Convivencia</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span>{property.rules.allowsCouples ? '✅' : '❌'}</span>
                  <span>{property.rules.allowsCouples ? 'Acepta parejas' : 'Solo para persona sola'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>{property.rules.allowsStudents ? '✅' : '❌'}</span>
                  <span>{property.rules.allowsStudents ? 'Acepta estudiantes universitarios' : 'Solo profesionales'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>{property.rules.allowsPets ? '✅' : '❌'}</span>
                  <span>{property.rules.allowsPets ? 'Acepta mascotas pequeñas' : 'No se permiten mascotas'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>{property.rules.hasIndependentKeys ? '✅' : '❌'}</span>
                  <span>{property.rules.hasIndependentKeys ? 'Llaves propias sin horario de llegada' : 'Horario de portón acordado'}</span>
                </li>
              </ul>
            </div>

            {/* Lo que Incluye */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mobiliario y Comodidades</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {property.amenities.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700/60"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Descripción Completa */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Descripción del Propietario
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {property.description}
            </p>
          </div>
        </div>

        {/* Pie de Acciones / Contacto WhatsApp */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-[#0E1626] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
              {property.ownerName.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{property.ownerName}</p>
              <p className="text-[10px] text-emerald-400 font-semibold">Propietario Verificado • Trato Directo</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.address} ${property.city}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>Ver en Maps</span>
            </a>

            <button
              onClick={() => onOpenMovingCalculator(property)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span>Simular Mudanza</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-950 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Escribir al Propietario</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
